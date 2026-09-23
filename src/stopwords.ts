/* Mots vides retirés de l'index comme des requêtes. Sans eux, une question
 * tapée en langage naturel (« comment bannir un membre ») exigerait que
 * « comment » figure dans la page. Listes volontairement courtes : un mot
 * porteur de sens ne doit jamais s'y trouver. */
export const DEFAULT_STOP_WORDS: Record<string, string[]> = {
  fr: [
    'a', 'ai', 'as', 'au', 'aux', 'avec', 'c', 'ce', 'ces', 'cet', 'cette', 'comment', 'd', 'dans', 'de',
    'des', 'du', 'elle', 'elles', 'en', 'est', 'et', 'faire', 'faut', 'il', 'ils', 'j', 'je', 'l', 'la',
    'le', 'les', 'leur', 'leurs', 'm', 'ma', 'mes', 'mon', 'n', 'ne', 'nous', 'on', 'ont', 'ou', 'par',
    'pas', 'peut', 'peux', 'pour', 'pourquoi', 'qu', 'que', 'quel', 'quelle', 'quelles', 'quels', 'qui',
    'quoi', 's', 'sa', 'se', 'ses', 'son', 'sont', 'sur', 't', 'ta', 'tes', 'ton', 'tu', 'un', 'une',
    'vous', 'y',
  ],
  en: [
    'a', 'an', 'and', 'are', 'be', 'by', 'can', 'do', 'does', 'for', 'how', 'i', 'in', 'is', 'it', 'its',
    'my', 'of', 'on', 'or', 'our', 'that', 'the', 'these', 'this', 'those', 'to', 'was', 'we', 'were',
    'what', 'which', 'who', 'why', 'with', 'you', 'your',
  ],
  de: [
    'das', 'dem', 'den', 'der', 'des', 'die', 'du', 'ein', 'eine', 'einem', 'einen', 'es', 'für', 'ich',
    'im', 'in', 'ist', 'kann', 'mit', 'oder', 'sie', 'sind', 'und', 'von', 'warum', 'was', 'welche',
    'wie', 'wir', 'zu',
  ],
  es: [
    'a', 'al', 'como', 'con', 'cual', 'de', 'del', 'el', 'en', 'es', 'la', 'las', 'le', 'lo', 'los', 'mi',
    'o', 'para', 'por', 'que', 'se', 'sin', 'son', 'su', 'tu', 'un', 'una', 'unas', 'unos', 'y',
  ],
  pt: [
    'a', 'as', 'com', 'como', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'meu', 'minha', 'na', 'nas',
    'no', 'nos', 'o', 'os', 'ou', 'para', 'por', 'qual', 'que', 'se', 'sem', 'seu', 'sua', 'são', 'um',
    'uma', 'umas', 'uns',
  ],
};
