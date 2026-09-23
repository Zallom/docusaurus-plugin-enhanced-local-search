/* Types partagés par les composants du thème. Ils reprennent le format écrit
 * par l'indexeur (src/types.ts) : garder les deux fichiers synchronisés. */

export interface IndexedSection {
  a: string | null;
  h: string | null;
  x: string;
}

export interface IndexedPage {
  u: string;
  t: string;
  d: string;
  c: string;
  b: string[];
  s: IndexedSection[];
  k?: string;
  p?: number;
}

export interface SearchIndexFile {
  v: 1;
  locale: string;
  pages: IndexedPage[];
}

export interface LocalSearchGlobalData {
  indexUrl: string;
  buildId: string;
  locale: string;
  synonyms: string[][];
  stopWords: string[];
  fuzzy: number;
  prefix: boolean;
  stemming: boolean;
  boost: {title: number; heading: number; content: number};
  categoryBoosts: Record<string, number>;
  categoryPriorities: Record<string, number>;
  categoryContexts: {id: string; label: string; match: string}[];
  contextPriority: number;
  contextualPriority: boolean;
  maxResults: number;
  maxResultsPerPage: number;
  shortcuts: string[];
  recentSearches: number;
  suggestions: {label: string; href: string}[];
  searchPagePath: string | null;
  storageKey: string;
}

/** Morceau de texte, surligné ou non. */
export interface Chunk {
  text: string;
  hl: boolean;
}

export interface SearchHit {
  id: number;
  /** URL de destination, ancre comprise. */
  url: string;
  pageUrl: string;
  pageTitle: string;
  heading: string | null;
  /** Fil d'Ariane affiché sous le titre du résultat. */
  crumbs: string[];
  category: string;
  /** Résultat qui représente la page entière plutôt qu'une section. */
  isPage: boolean;
  titleChunks: Chunk[];
  snippet: Chunk[];
  score: number;
}

export interface HitGroup {
  category: string;
  hits: SearchHit[];
}

export interface SearchResponse {
  query: string;
  groups: HitGroup[];
  /** Tous les résultats, dans l'ordre d'affichage (pour la navigation clavier). */
  hits: SearchHit[];
  /** Orthographe proposée quand la requête ne donne rien. */
  suggestion: string | null;
  /** Vrai si les résultats ne contiennent pas tous les mots de la requête. */
  relaxed: boolean;
}
