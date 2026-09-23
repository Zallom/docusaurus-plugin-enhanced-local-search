import MiniSearch, {type Query, type SearchResult} from 'minisearch';
import type {Chunk, HitGroup, SearchHit, SearchIndexFile, SearchResponse} from '../types';

export interface EngineConfig {
  stopWords: string[];
  synonyms: string[][];
  fuzzy: number;
  prefix: boolean;
  boost: {title: number; heading: number; content: number};
  categoryBoosts: Record<string, number>;
  maxResults: number;
  maxResultsPerPage: number;
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
}

/** Minuscules sans accents : « Bannissement » et « bannissément » donnent le même terme. */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

const TOKEN_RE = /[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu;

/* Découpe en mots. Un mot composé est aussi indexé soudé : « anti-spam » donne
 * « anti », « spam » et « antispam », pour que les deux graphies se trouvent. */
export function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const match of text.matchAll(TOKEN_RE)) {
    const parts = match[0].split(/[-'’]/);
    out.push(...parts);
    if (parts.length > 1 && match[0].includes('-')) out.push(parts.join(''));
  }
  return out;
}

/** Surligne dans `text` les mots dont la forme normalisée fait partie de `terms`. */
export function highlight(text: string, terms: Set<string>): Chunk[] {
  const chunks: Chunk[] = [];
  let last = 0;
  const push = (slice: string, hl: boolean) => {
    if (!slice) return;
    const prev = chunks[chunks.length - 1];
    if (prev && prev.hl === hl) prev.text += slice;
    else chunks.push({text: slice, hl});
  };
  for (const match of text.matchAll(TOKEN_RE)) {
    const token = match[0];
    const start = match.index ?? 0;
    const joined = normalize(token.replace(/[-'’]/g, ''));
    if (token.includes('-') && terms.has(joined)) {
      push(text.slice(last, start), false);
      push(token, true);
      last = start + token.length;
      continue;
    }
    // Mot simple, ou parties d'un mot composé surlignées séparément.
    let offset = start;
    for (const part of token.split(/([-'’])/)) {
      if (part && !/^[-'’]$/.test(part) && terms.has(normalize(part))) {
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
export function snippet(text: string, terms: Set<string>, max = 160): Chunk[] {
  if (!text) return [];
  let pos = -1;
  for (const match of text.matchAll(TOKEN_RE)) {
    if (match[0].split(/[-'’]/).some((part) => terms.has(normalize(part)))) {
      pos = match.index ?? 0;
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
  const chunks = highlight(text.slice(start, end).trim(), terms);
  if (start > 0) chunks.unshift({text: '… ', hl: false});
  if (end < text.length) chunks.push({text: ' …', hl: false});
  return chunks;
}

export function createSearchEngine(index: SearchIndexFile, config: EngineConfig): SearchEngine {
  const stopWords = new Set(config.stopWords.map(normalize));

  // Chaque groupe de synonymes : terme normalisé → liste des autres formes, déjà découpées.
  const synonyms = new Map<string, string[][]>();
  for (const group of config.synonyms) {
    const forms = group.map((entry) => tokenize(entry).map(normalize).filter((t) => !stopWords.has(t)));
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
      });
    }
  });

  const mini = new MiniSearch<SectionRecord>({
    fields: ['title', 'heading', 'content', 'context'],
    storeFields: [],
    tokenize,
    processTerm: (term) => {
      const normalized = normalize(term);
      return normalized && !stopWords.has(normalized) ? normalized : null;
    },
  });
  mini.addAll(records);

  const searchOptions = {
    boost: {
      title: config.boost.title,
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
      queries: [term, ...alternatives.map((form) => (form.length === 1 ? form[0] : {combineWith: 'AND', queries: form}))],
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
  const suggest = (terms: string[]): string | null => {
    const words = terms.map((term) => {
      const best = mini.autoSuggest(term, {fuzzy: 0.4, prefix: false})[0];
      return best ? best.suggestion.split(' ')[0] : term;
    });
    const suggestion = words.join(' ');
    return suggestion !== terms.join(' ') ? suggestion : null;
  };

  function search(rawQuery: string): SearchResponse {
    const query = rawQuery.trim();
    const empty: SearchResponse = {query, groups: [], hits: [], suggestion: null, relaxed: false};
    const terms = [...new Set(tokenize(query).map(normalize).filter((t) => t && !stopWords.has(t)))];
    if (!terms.length) return empty;

    let results: SearchResult[] = run(terms, 'AND');
    if (!results.length) results = run(terms, 'AND', true);
    let relaxed = false;
    // Aucun résultat ne contient tous les mots : on relâche, comme Algolia,
    // en gardant ceux qui en contiennent le plus.
    if (results.length < 3 && terms.length > 1) {
      const seen = new Set(results.map((r) => r.id));
      const extra = run(terms, 'OR')
        .filter((r) => !seen.has(r.id))
        .map((r) => ({...r, score: r.score * 0.5}));
      if (extra.length) {
        relaxed = results.length === 0;
        results = [...results, ...extra];
      }
    }

    const normalizedQuery = normalize(query);
    for (const result of results) {
      const record = records[result.id as number];
      const title = normalize(record.isPage ? record.pageTitle : record.heading);
      if (title === normalizedQuery) result.score *= 3;
      else if (title.startsWith(normalizedQuery)) result.score *= 1.5;
    }
    results.sort((a, b) => b.score - a.score);

    if (!results.length) return {...empty, suggestion: suggest(terms)};

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
        titleChunks: highlight(record.isPage ? record.pageTitle : record.heading, matched),
        snippet: snippet(record.content, matched),
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
