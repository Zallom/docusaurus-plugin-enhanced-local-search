/** Texte fixe, ou traduit par locale (`{fr: '…', en: '…'}`). */
export type LocalizedString = string | Record<string, string>;

export interface CategoryOption {
  /** Identifiant stable, pour la prop `context` des barres. Par défaut, le libellé. */
  id?: string;
  /** Expression régulière testée sur le chemin de la page, sans préfixe de locale (ex. `^/docs`).
   *  Sans `match`, la catégorie ne sert qu'aux entrées manuelles (`customEntries`). */
  match?: string;
  label: LocalizedString;
  /** Poids appliqué au score des résultats de cette catégorie (1 par défaut). */
  boost?: number;
  /** Priorité, premier critère de classement (0 par défaut) : une catégorie de
   *  priorité plus basse passe toujours après les autres. */
  priority?: number;
}

export interface SuggestionOption {
  label: LocalizedString;
  /** Chemin du site (la locale est ajoutée) ou URL absolue. */
  href: LocalizedString;
}

/** Entrée ajoutée à la main dans l'index : un lien externe, une action, ou des
 *  mots-clés en plus sur une page existante. */
export interface CustomEntryOption {
  title: LocalizedString;
  /** Chemin du site (`/docs/setup`, la locale est ajoutée) ou URL absolue. */
  url: LocalizedString;
  description?: LocalizedString;
  /** Mots qui font remonter l'entrée : une liste commune, ou une liste par locale. */
  keywords?: string[] | Record<string, string[]>;
  /** Catégorie affichée. Par défaut, celle qui correspond à `url`. */
  category?: LocalizedString;
  /** Passe devant les pages aussi pertinentes (1 par défaut, de 0 à 9). */
  priority?: number;
  /** Locales où l'entrée existe (toutes par défaut). */
  locales?: string[];
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
  stemming: boolean;
  boost: BoostOptions;
  maxResults: number;
  maxResultsPerPage: number;
  shortcuts: string[];
  recentSearches: number;
  suggestions: SuggestionOption[];
  customEntries: CustomEntryOption[];
  /** Met en tête la catégorie de la page où la recherche est ouverte. */
  contextualPriority: boolean;
  /** Publie une description OpenSearch (`opensearch.xml`) pour la page de recherche. */
  openSearch: boolean | {shortName?: LocalizedString; description?: LocalizedString};
  /** Ajoute un nœud schema.org `WebSite` avec une `SearchAction` vers la page de recherche. */
  searchAction: boolean | {id?: string};
  searchPagePath: string | false;
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
  /** Mots-clés ajoutés par `customEntries`. */
  k?: string;
  /** Priorité ajoutée par `customEntries`. */
  p?: number;
  /** Entrée manuelle : seuls le titre et les mots-clés sont cherchés. */
  m?: 1;
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
  stemming: boolean;
  boost: BoostOptions;
  categoryBoosts: Record<string, number>;
  categoryPriorities: Record<string, number>;
  /** Catégories liées à des chemins, pour reconnaître celle de la page courante. */
  categoryContexts: {id: string; label: string; match: string}[];
  /** Priorité donnée à la catégorie de contexte. */
  contextPriority: number;
  /** Déduit le contexte de la page courante quand la barre n'en impose pas. */
  contextualPriority: boolean;
  maxResults: number;
  maxResultsPerPage: number;
  shortcuts: string[];
  recentSearches: number;
  suggestions: {label: string; href: string}[];
  searchPagePath: string | null;
  storageKey: string;
}
