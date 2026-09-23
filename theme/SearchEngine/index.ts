import MiniSearch, {type Query, type SearchResult} from 'minisearch';
import type {Chunk, HitGroup, SearchHit, SearchIndexFile, SearchResponse} from '../types';
import {createStemmer} from './stemmer';
import {createWordSplitter, type WordSplitter} from './words';

export interface EngineConfig {
  stopWords: string[];
  synonyms: string[][];
  fuzzy: number;
  prefix: boolean;
  boost: {title: number; heading: number; content: number};
  categoryBoosts: Record<string, number>;
  /** Priorité par catégorie, premier critère de classement. */
  categoryPriorities?: Record<string, number>;
  maxResults: number;
  maxResultsPerPage: number;
  /** Langue du contenu, pour la racinisation. */
  locale?: string;
  /** Racinisation légère (activer / activé / active). Activée par défaut. */
  stemming?: boolean;
}

export interface SearchEngine {
  search(query: string): SearchResponse;
  /** Nombre de sections indexées. */
  size: number;
}

interface SectionRecord {
  id: number;
  page: number;
  url: string;
  pageUrl: string;
  pageTitle: string;
  heading: string;
  content: string;
  crumbs: string[];
  category: string;
  isPage: boolean;
  /** Champ indexé : titre de la page, uniquement sur l'enregistrement de la page. */
  title: string;
  /** Champ indexé : contexte (titre de page et fil d'Ariane) pour les sections. */
  context: string;
  /** Champ indexé : mots-clés ajoutés à la main, sur l'enregistrement de la page. */
  keywords: string;
  /** Priorité ajoutée à la main (`customEntries`), sur l'enregistrement de la page. */
  pin: number;
}

/** Minuscules sans accents : « Bannissement » et « bannissément » donnent le même terme.
 *  Seuls les accents latins, grecs et cyrilliques sont retirés : les signes du
 *  japonais (dakuten) ou du hindi changent le sens et restent. */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').normalize('NFC').toLowerCase();
}

/* Découpe en mots. Un mot composé est aussi indexé soudé : « anti-spam » donne
 * « anti », « spam » et « antispam », pour que les deux graphies se trouvent. */
export function tokenize(words: WordSplitter, text: string): string[] {
  const out: string[] = [];
  for (const {text: word} of words(text)) {
    const parts = word.split(/[-'’]/);
    out.push(...parts);
    if (parts.length > 1 && word.includes('-')) out.push(parts.join(''));
  }
  return out;
}

type TermKey = (word: string) => string;

/** Surligne dans `text` les mots dont la clé (forme normalisée, racine) fait partie de `terms`. */
export function highlight(words: WordSplitter, text: string, terms: Set<string>, key: TermKey = normalize): Chunk[] {
  const chunks: Chunk[] = [];
  let last = 0;
  const push = (slice: string, hl: boolean) => {
    if (!slice) return;
    const prev = chunks[chunks.length - 1];
    if (prev && prev.hl === hl) prev.text += slice;
    else chunks.push({text: slice, hl});
  };
  for (const {text: token, index: start} of words(text)) {
    const joined = key(token.replace(/[-'’]/g, ''));
    if (token.includes('-') && terms.has(joined)) {
      push(text.slice(last, start), false);
      push(token, true);
      last = start + token.length;
      continue;
    }
    // Mot simple, ou parties d'un mot composé surlignées séparément.
    let offset = start;
    for (const part of token.split(/([-'’])/)) {
      if (part && !/^[-'’]$/.test(part) && terms.has(key(part))) {
        push(text.slice(last, offset), false);
        push(part, true);
        last = offset + part.length;
      }
      offset += part.length;
    }
  }
  push(text.slice(last), false);
  return chunks;
}

/** Extrait d'environ `max` caractères autour de la première correspondance. */
export function snippet(
  words: WordSplitter,
  text: string,
  terms: Set<string>,
  max = 160,
  key: TermKey = normalize,
): Chunk[] {
  if (!text) return [];
  let pos = -1;
  for (const word of words(text)) {
    if (word.text.split(/[-'’]/).some((part) => terms.has(key(part)))) {
      pos = word.index;
      break;
    }
  }
  let start = 0;
  if (pos > max * 0.35) {
    start = Math.max(0, text.lastIndexOf(' ', pos - Math.floor(max * 0.3)));
  }
  let end = Math.min(text.length, start + max);
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end);
    if (space > start + max * 0.6) end = space;
  }
  const chunks = highlight(words, text.slice(start, end).trim(), terms, key);
  if (start > 0) chunks.unshift({text: '… ', hl: false});
  if (end < text.length) chunks.push({text: ' …', hl: false});
  return chunks;
}

/** Distance d'édition bornée (Levenshtein), pour rattacher un terme trouvé par faute à sa requête. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, row[j]);
    }
    if (rowMin > max) return max + 1;
    prev = row;
  }
  return prev[b.length];
}

/** 3 : mot exact (ou synonyme), 2 : préfixe, 1 : trouvé par faute, 0 : sans rapport. */
function matchLevel(indexTerm: string, group: string[]): number {
  if (group.includes(indexTerm)) return 3;
  if (group.some((form) => indexTerm.startsWith(form))) return 2;
  if (group.some((form) => form.length >= 4 && editDistance(indexTerm, form, form.length >= 6 ? 2 : 1) <= (form.length >= 6 ? 2 : 1))) return 1;
  return 0;
}

export function createSearchEngine(index: SearchIndexFile, config: EngineConfig): SearchEngine {
  const stopWords = new Set(config.stopWords.map(normalize));
  const stem = createStemmer(config.locale ?? 'en', config.stemming !== false);
  const segmentWords = createWordSplitter(config.locale ?? 'en');
  const split = (text: string) => tokenize(segmentWords, text);
  /** Clé d'un mot : sans accents, en minuscules, ramené à sa racine. */
  const key = (word: string) => stem(normalize(word));
  const processTerm = (term: string): string | null => {
    const normalized = normalize(term);
    return normalized && !stopWords.has(normalized) ? stem(normalized) : null;
  };
  // Racine → mot tel qu'il apparaît, pour afficher une suggestion lisible.
  const surface = new Map<string, string>();

  // Chaque groupe de synonymes : racine → liste des autres formes, déjà découpées.
  const synonyms = new Map<string, string[][]>();
  for (const group of config.synonyms) {
    const forms = group.map((entry) => split(entry).map(processTerm).filter((t): t is string => Boolean(t)));
    forms.forEach((form, i) => {
      if (form.length !== 1) return;
      const others = forms.filter((_, j) => j !== i && forms[j].length > 0);
      synonyms.set(form[0], [...(synonyms.get(form[0]) ?? []), ...others]);
    });
  }

  const records: SectionRecord[] = [];
  index.pages.forEach((page, pageIndex) => {
    const sections = page.s.length ? page.s : [{a: null, h: null, x: ''}];
    sections.forEach((section, sectionIndex) => {
      const isPage = sectionIndex === 0 && !section.h;
      const content =
        isPage && page.d && !section.x.includes(page.d.slice(0, 40)) ? `${page.d} ${section.x}` : section.x;
      records.push({
        id: records.length,
        page: pageIndex,
        url: section.a ? `${page.u}#${section.a}` : page.u,
        pageUrl: page.u,
        pageTitle: page.t,
        heading: section.h ?? '',
        content,
        crumbs: page.b,
        category: page.c,
        isPage,
        title: isPage ? page.t : '',
        context: isPage ? page.b.join(' ') : `${page.t} ${page.b.join(' ')}`,
        keywords: isPage ? page.k ?? '' : '',
        pin: isPage ? page.p ?? 0 : 0,
      });
    });
    // Une page sans introduction reste trouvable par son titre.
    if (page.s.length && page.s[0].h) {
      records.push({
        id: records.length,
        page: pageIndex,
        url: page.u,
        pageUrl: page.u,
        pageTitle: page.t,
        heading: '',
        content: page.d,
        crumbs: page.b,
        category: page.c,
        isPage: true,
        title: page.t,
        context: page.b.join(' '),
        keywords: page.k ?? '',
        pin: page.p ?? 0,
      });
    }
  });

  const mini = new MiniSearch<SectionRecord>({
    fields: ['title', 'keywords', 'heading', 'content', 'context'],
    storeFields: [],
    tokenize: split,
    processTerm: (term) => {
      const processed = processTerm(term);
      if (processed && !surface.has(processed)) surface.set(processed, term.toLowerCase());
      return processed;
    },
    searchOptions: {processTerm},
  });
  mini.addAll(records);

  const searchOptions = {
    boost: {
      title: config.boost.title,
      keywords: config.boost.title,
      heading: config.boost.heading,
      content: config.boost.content,
      context: config.boost.content * 0.6,
    },
    prefix: (term: string) => config.prefix && term.length >= 2,
    fuzzy: (term: string) => (term.length >= 4 ? config.fuzzy : false),
    boostDocument: (id: unknown) => {
      const record = records[id as number];
      return (record.isPage ? 1.2 : 1) * (config.categoryBoosts[record.category] ?? 1);
    },
  };

  const termQuery = (term: string): Query => {
    const alternatives = synonyms.get(term);
    if (!alternatives) return term;
    return {
      combineWith: 'OR',
      queries: [
        term,
        ...alternatives.map((form): Query => (form.length === 1 ? form[0] : {combineWith: 'AND', queries: form})),
      ],
    };
  };

  const run = (terms: string[], combineWith: 'AND' | 'OR', tolerant = false) =>
    mini.search(
      {combineWith, queries: terms.map(termQuery)},
      // Palier tolérant : deux fautes dès 6 lettres. Une inversion de lettres
      // (« captcah ») compte pour deux fautes dans la distance de Levenshtein.
      tolerant ? {...searchOptions, fuzzy: (term: string) => (term.length >= 6 ? 0.34 : term.length >= 4 ? 0.25 : false)} : searchOptions,
    );

  /** Orthographe la plus proche, mot par mot. */
  const suggest = (terms: string[], rawTerms: string[]): string | null => {
    const words = terms.map((term) => {
      const best = mini.autoSuggest(term, {fuzzy: 0.4, prefix: false})[0];
      const found = best?.suggestion.split(' ')[0];
      return found ? surface.get(found) ?? found : null;
    });
    if (words.some((word) => !word)) return null;
    const suggestion = words.join(' ');
    return normalize(suggestion) !== normalize(rawTerms.join(' ')) ? suggestion : null;
  };

  function search(rawQuery: string): SearchResponse {
    const query = rawQuery.trim();
    const empty: SearchResponse = {query, groups: [], hits: [], suggestion: null, relaxed: false};
    const rawTerms = split(query).filter((t) => processTerm(t));
    const terms = [...new Set(rawTerms.map(processTerm).filter((t): t is string => Boolean(t)))];
    if (!terms.length) return empty;

    let results: SearchResult[] = run(terms, 'AND');
    if (!results.length) results = run(terms, 'AND', true);
    let relaxed = false;
    // Aucun résultat ne contient tous les mots : on relâche, comme Algolia,
    // en gardant ceux qui en contiennent le plus.
    if (results.length < 3 && terms.length > 1) {
      const seen = new Set(results.map((r) => r.id));
      const extra = run(terms, 'OR').filter((r) => !seen.has(r.id));
      if (extra.length) {
        relaxed = results.length === 0;
        results = [...results, ...extra];
      }
    }

    /* Classement par critères successifs, comme Algolia, plutôt que par
     * somme de scores : avec BM25 seul, un mot rare trouvé par préfixe
     * (« raidmode ») écrase un mot courant trouvé tel quel (« raid »).
     * Ordre : mots trouvés, puis sans faute, puis priorité manuelle, puis emplacement (titre avant
     * intertitre avant texte), puis exactitude ; BM25 ne sert qu'à départager. */
    const normalizedQuery = normalize(query);
    const termGroups = terms.map((term) => [
      term,
      ...(synonyms.get(term) ?? []).flat(),
    ]);
    for (const result of results) {
      const record = records[result.id as number];
      const matched = Object.entries(result.match);
      const levels = termGroups.map((group) => {
        let best = 0;
        for (const [term] of matched) best = Math.max(best, matchLevel(term, group));
        return best;
      });
      const words = levels.filter((level) => level > 0).length;
      const typoFree = levels.filter((level) => level >= 2).length;
      const exact = levels.filter((level) => level === 3).length;
      const covers = (...wanted: string[]) =>
        termGroups.every(
          (group, i) =>
            levels[i] === 0 ||
            matched.some(([term, fields]) => fields.some((f) => wanted.includes(f)) && matchLevel(term, group) > 0),
        );
      const title = normalize(record.isPage ? record.pageTitle : record.heading);
      let place = 0;
      if (title === normalizedQuery) place = 4;
      else if (record.isPage ? covers('title', 'keywords') : covers('heading')) place = record.isPage ? 3 : 2;
      else if (covers('title', 'keywords', 'heading')) place = 1;

      // Précision : « Bannir un utilisateur » est un meilleur titre pour
      // « bannir membre » que « Bannir temporairement un utilisateur ».
      // Compté en mots tels qu'on les lit : « Anti-raid » est un seul mot,
      // couvert si la requête touche une de ses parties ou sa forme soudée.
      const matchedSet = new Set(matched.map(([term]) => term));
      let titleWords = 0;
      let covered = 0;
      for (const {text: word} of segmentWords(record.isPage ? record.pageTitle : record.heading)) {
        const parts = word.split(/[-'’]/).map(processTerm).filter((part): part is string => Boolean(part));
        if (!parts.length) continue;
        titleWords += 1;
        const joined = word.includes('-') ? processTerm(word.replace(/[-'’]/g, '')) : null;
        if (parts.some((part) => matchedSet.has(part)) || (joined && matchedSet.has(joined))) covered += 1;
      }
      const precision = titleWords ? covered / titleWords : 0;

      const weight = (record.isPage ? 1.2 : 1) * (config.categoryBoosts[record.category] ?? 1);
      const tieBreak = Math.min(0.99, Math.log1p(result.score * weight) / 10);
      const priority = config.categoryPriorities?.[record.category] ?? 0;
      const pin = Math.min(9, Math.max(0, record.pin));
      result.score =
        priority * 1e8 + words * 1e6 + typoFree * 1e5 + pin * 1e4 + place * 1e2 + exact * 10 + precision * 9 + tieBreak;
    }
    results.sort((a, b) => b.score - a.score);

    if (!results.length) return {...empty, suggestion: suggest(terms, rawTerms)};

    // Regroupement par page (sections les mieux classées), puis par catégorie
    // dans l'ordre de pertinence de leur meilleure page.
    const pages = new Map<number, {score: number; hits: SearchHit[]}>();
    for (const result of results) {
      const record = records[result.id as number];
      let entry = pages.get(record.page);
      if (!entry) {
        entry = {score: result.score, hits: []};
        pages.set(record.page, entry);
      }
      if (entry.hits.length >= config.maxResultsPerPage) continue;
      if (entry.hits.some((hit) => hit.url === record.url)) continue;
      const matched = new Set(result.terms);
      entry.hits.push({
        id: record.id,
        url: record.url,
        pageUrl: record.pageUrl,
        pageTitle: record.pageTitle,
        heading: record.heading || null,
        crumbs: record.isPage ? record.crumbs : [...record.crumbs, record.pageTitle],
        category: record.category,
        isPage: record.isPage,
        titleChunks: highlight(segmentWords, record.isPage ? record.pageTitle : record.heading, matched, key),
        snippet: snippet(segmentWords, record.content, matched, 160, key),
        score: result.score,
      });
    }

    const groups: HitGroup[] = [];
    const hits: SearchHit[] = [];
    let total = 0;
    for (const {hits: pageHits} of [...pages.values()].sort((a, b) => b.score - a.score)) {
      if (total >= config.maxResults) break;
      total += pageHits.length;
      pageHits.sort((a, b) => Number(b.isPage) - Number(a.isPage) || b.score - a.score);
      const category = pageHits[0].category;
      let group = groups.find((g) => g.category === category);
      if (!group) {
        group = {category, hits: []};
        groups.push(group);
      }
      group.hits.push(...pageHits);
    }
    for (const group of groups) hits.push(...group.hits);

    return {query, groups, hits, suggestion: null, relaxed};
  }

  return {search, size: records.length};
}
