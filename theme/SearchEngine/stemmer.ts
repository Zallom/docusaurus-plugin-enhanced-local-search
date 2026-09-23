/* Racinisation légère : ramène les variantes d'un mot à une même racine pour
 * que « activer », « activé » et « active », ou un singulier et son pluriel,
 * se retrouvent. Volontairement prudente (seules les terminaisons les plus
 * sûres sont retirées) : elle s'applique au texte déjà normalisé, sans
 * accents, et identiquement à l'index et aux requêtes. */

type Stemmer = (word: string) => string;

const identity: Stemmer = (word) => word;

// Français : pluriels, puis infinitif en -r et e final (activer → active → activ).
const french: Stemmer = (word) => {
  let w = word;
  if (w.length > 5 && w.endsWith('x')) w = w.slice(0, -1);
  if (w.length > 3 && w.endsWith('s')) w = w.slice(0, -1);
  if (w.length > 4 && w.endsWith('r')) w = w.slice(0, -1);
  if (w.length > 4 && w.endsWith('e')) w = w.slice(0, -1);
  return w;
};

// Anglais : pluriels (S-stemmer de Harman), puis -ing / -ed sur les mots longs.
const english: Stemmer = (word) => {
  let w = word;
  if (w.length > 4 && w.endsWith('ies') && !/[ae]ies$/.test(w)) w = `${w.slice(0, -3)}y`;
  else if (w.length > 3 && w.endsWith('es') && !/[aeo]es$/.test(w)) w = w.slice(0, -1);
  else if (w.length > 3 && w.endsWith('s') && !/[us]s$/.test(w)) w = w.slice(0, -1);
  const before = w;
  if (w.length > 5 && w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith('ed')) w = w.slice(0, -2);
  // Consonne doublée par la terminaison (Porter) : banning → bann → ban.
  if (w !== before && /([^aeiouylsz])\1$/.test(w)) w = w.slice(0, -1);
  if (w.length > 4 && w.endsWith('e')) w = w.slice(0, -1);
  return w;
};

// Espagnol et portugais : pluriels (-es après consonne, -s après voyelle), voyelle finale.
const iberian: Stemmer = (word) => {
  let w = word;
  if (w.length > 4 && /[^aeiou]es$/.test(w)) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith('s')) w = w.slice(0, -1);
  if (w.length > 4 && w.endsWith('r')) w = w.slice(0, -1);
  if (w.length > 4 && /[aeo]$/.test(w)) w = w.slice(0, -1);
  return w;
};

// Allemand : terminaisons flexionnelles courantes.
const german: Stemmer = (word) => {
  let w = word;
  if (w.length > 5 && /(en|er|es|em)$/.test(w)) w = w.slice(0, -2);
  else if (w.length > 4 && /[ens]$/.test(w)) w = w.slice(0, -1);
  return w;
};

// Italien : voyelle finale (pluriels et genre : attivo, attiva, attivi).
const italian: Stemmer = (word) => (word.length > 4 && /[aeio]$/.test(word) ? word.slice(0, -1) : word);

// Néerlandais : pluriels en -en et -s.
const dutch: Stemmer = (word) => {
  if (word.length > 5 && word.endsWith('en')) return word.slice(0, -2);
  if (word.length > 4 && /[^s]s$/.test(word)) return word.slice(0, -1);
  return word;
};

// Les autres langues sont cherchées sans racinisation : préfixes et fautes de
// frappe tolérées couvrent déjà une bonne partie des variantes.
const STEMMERS: Record<string, Stemmer> = {
  fr: french,
  en: english,
  es: iberian,
  pt: iberian,
  de: german,
  it: italian,
  nl: dutch,
};

export function createStemmer(locale: string, enabled = true): Stemmer {
  if (!enabled) return identity;
  return STEMMERS[locale] ?? STEMMERS[locale.split('-')[0]] ?? identity;
}
