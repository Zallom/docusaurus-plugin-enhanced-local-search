/** Texte fixe, ou traduit par locale (`{fr: '…', en: '…'}`). */
export type LocalizedString = string | Record<string, string>;

export interface CategoryOption {
  /** Expression régulière testée sur le chemin de la page, sans préfixe de locale (ex. `^/docs`). */
  match: string;
  label: LocalizedString;
  /** Poids appliqué au score des résultats de cette catégorie (1 par défaut). */
  boost?: number;
}

export interface SuggestionOption {
  label: LocalizedString;
  href: string;
}

export interface BoostOptions {
  title: number;
  heading: number;
  content: number;
}

export interface PluginOptions {
  indexFileName: string;
  ignorePatterns: string[];
  onlyCanonical: boolean;
  respectNoindex: boolean;
  contentSelectors: string[];
  excludeSelectors: string[];
  headingLevels: number[];
  maxSectionLength: number;
  categories: CategoryOption[];
  /** Catégorie des pages qui ne correspondent à aucune entrée de `categories`. */
  defaultCategory: LocalizedString;
  synonyms: string[][];
  stopWords: Record<string, string[]>;
  fuzzy: number;
  prefix: boolean;
  boost: BoostOptions;
  maxResults: number;
  maxResultsPerPage: number;
  shortcuts: string[];
  recentSearches: number;
  suggestions: SuggestionOption[];
  searchPagePath: string | false;
  showBranding: boolean;
  storageKey: string;
}

/* Format de l'index écrit au build et lu par le navigateur. Les clés sont
 * courtes : le fichier est téléchargé tel quel. */
export interface IndexedSection {
  /** Ancre (`id` du titre), absente pour l'introduction de la page. */
  a: string | null;
  /** Titre de la section. */
  h: string | null;
  /** Texte de la section. */
  x: string;
}

export interface IndexedPage {
  /** URL complète, baseUrl de la locale compris. */
  u: string;
  /** Titre de la page. */
  t: string;
  /** Description (meta), utilisée pour l'introduction. */
  d: string;
  /** Catégorie affichée (déjà traduite). */
  c: string;
  /** Fil d'Ariane, sans la page elle-même. */
  b: string[];
  s: IndexedSection[];
}

export interface SearchIndexFile {
  v: 1;
  locale: string;
  pages: IndexedPage[];
}

/** Données exposées au thème via `usePluginData`. */
export interface LocalSearchGlobalData {
  indexUrl: string;
  buildId: string;
  locale: string;
  synonyms: string[][];
  stopWords: string[];
  fuzzy: number;
  prefix: boolean;
  boost: BoostOptions;
  categoryBoosts: Record<string, number>;
  maxResults: number;
  maxResultsPerPage: number;
  shortcuts: string[];
  recentSearches: number;
  suggestions: {label: string; href: string}[];
  searchPagePath: string | null;
  showBranding: boolean;
  storageKey: string;
}
