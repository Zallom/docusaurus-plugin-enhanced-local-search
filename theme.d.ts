/* Déclarations des modules exposés par le thème, pour les sites en TypeScript
 * qui importent ou swizzlent ces composants. */

declare module '*.module.css' {
  const classes: {readonly [key: string]: string};
  export default classes;
}

declare module '@theme/SearchEngine' {
  import type {SearchIndexFile, SearchResponse, Chunk} from './theme/types';

  export interface EngineConfig {
    stopWords: string[];
    synonyms: string[][];
    fuzzy: number;
    prefix: boolean;
    boost: {title: number; heading: number; content: number};
    categoryBoosts: Record<string, number>;
    categoryPriorities?: Record<string, number>;
    contextPriority?: number;
    maxResults: number;
    maxResultsPerPage: number;
    locale?: string;
    stemming?: boolean;
  }
  export interface SearchEngine {
    search(query: string, options?: {context?: string | null}): SearchResponse;
    size: number;
  }
  export function normalize(text: string): string;
  export function tokenize(text: string): string[];
  export function highlight(text: string, terms: Set<string>): Chunk[];
  export function snippet(text: string, terms: Set<string>, max?: number): Chunk[];
  export function createSearchEngine(index: SearchIndexFile, config: EngineConfig): SearchEngine;
}

declare module '@theme/SearchStore' {
  export interface SearchState {
    open: boolean;
    query: string;
    revision: number;
    context: string | null;
  }
  export function openSearch(query?: string, options?: {context?: string | null}): void;
  export function closeSearch(): void;
  export function toggleSearch(): void;
  export function getSearchState(): SearchState;
  export function useSearchState(): SearchState;
  export function registerHost(id: symbol): () => void;
  export function useIsActiveHost(id: symbol): boolean;
}

declare module '@theme/useLocalSearch' {
  import type {LocalSearchGlobalData, SearchResponse} from './theme/types';

  export type SearchStatus = 'idle' | 'loading' | 'ready' | 'unavailable' | 'error';
  export interface UseLocalSearch {
    status: SearchStatus;
    data: LocalSearchGlobalData;
    prefetch: () => void;
    search: (query: string, options?: {context?: string | null}) => SearchResponse | null;
  }
  export default function useLocalSearch(options?: {autoLoad?: boolean}): UseLocalSearch;
  export function useSearchContext(explicit?: string | null): string | null;
}

declare module '@theme/SearchUtils' {
  export interface RecentEntry {
    url: string;
    title: string;
    crumbs: string[];
  }
  interface Shortcut {
    key: string;
    mod: boolean;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
    alt: boolean;
  }
  export function isMacPlatform(): boolean;
  export function isExternalUrl(url: string): boolean;
  export function openExternal(url: string): void;
  export function useIsMac(): boolean | null;
  export function isEditable(target: EventTarget | null): boolean;
  export function parseShortcut(shortcut: string): Shortcut;
  export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut, mac: boolean): boolean;
  export function shortcutLabel(shortcut: string, mac: boolean): string[];
  export function useRecentSearches(
    storageKey: string,
    max: number,
  ): {items: RecentEntry[]; add: (entry: RecentEntry) => void; remove: (url: string) => void};
}

declare module '@theme/SearchIcons' {
  import type {ReactNode, SVGProps} from 'react';

  type Icon = (props: SVGProps<SVGSVGElement>) => ReactNode;
  export const SearchIcon: Icon;
  export const PageIcon: Icon;
  export const HashIcon: Icon;
  export const ClockIcon: Icon;
  export const StarIcon: Icon;
  export const EnterIcon: Icon;
  export const CloseIcon: Icon;
  export const ArrowUpIcon: Icon;
  export const ArrowDownIcon: Icon;
  export const ArrowRightIcon: Icon;
  export const ExternalIcon: Icon;
}

declare module '@theme/SearchHighlight' {
  import type {ReactNode} from 'react';
  import type {Chunk} from './theme/types';

  export default function SearchHighlight(props: {chunks: Chunk[]}): ReactNode;
}

declare module '@theme/SearchResult' {
  import type {MouseEvent, ReactNode} from 'react';

  export interface SearchResultProps {
    id: string;
    url: string;
    title: ReactNode;
    crumbs?: string[];
    snippet?: ReactNode;
    icon: ReactNode;
    active: boolean;
    onSelect: (event: MouseEvent<HTMLAnchorElement>) => void;
    onHover: () => void;
    onRemove?: () => void;
  }
  export default function SearchResult(props: SearchResultProps): ReactNode;
}

declare module '@theme/SearchResults' {
  import type {MouseEvent, ReactNode} from 'react';
  import type {SearchHit, SearchResponse} from './theme/types';

  export interface SearchResultsProps {
    response: SearchResponse;
    active: number;
    idPrefix: string;
    onSelect: (hit: SearchHit, event: MouseEvent<HTMLAnchorElement>) => void;
    onHover: (index: number) => void;
  }
  export default function SearchResults(props: SearchResultsProps): ReactNode;
}

declare module '@theme/SearchModal' {
  import type {ReactNode} from 'react';

  export interface SearchModalProps {
    initialQuery: string;
    revision: number;
    context?: string | null;
    onClose: () => void;
  }
  export default function SearchModal(props: SearchModalProps): ReactNode;
}

declare module '@theme/SearchModalHost' {
  import type {ReactNode} from 'react';

  export default function SearchModalHost(): ReactNode;
}

declare module '@theme/SearchInput' {
  import type {ReactNode} from 'react';

  export interface SearchInputProps {
    placeholder?: string;
    className?: string;
    showShortcut?: boolean;
    variant?: 'default' | 'navbar';
    context?: string;
  }
  export default function SearchInput(props: SearchInputProps): ReactNode;
}

declare module '@theme/SearchBar' {
  import type {ReactNode} from 'react';

  export default function SearchBar(): ReactNode;
}

declare module '@theme/SearchHero' {
  import type {ReactNode} from 'react';

  export interface SearchHeroProps {
    title?: ReactNode;
    subtitle?: ReactNode;
    placeholder?: string;
    suggestions?: string[];
    inline?: boolean;
    syncUrl?: boolean;
    initialQuery?: string;
    showSuggestions?: boolean;
    context?: string;
    className?: string;
  }
  export default function SearchHero(props: SearchHeroProps): ReactNode;
}

declare module '@theme/SearchPage' {
  import type {ReactNode} from 'react';

  export default function SearchPage(): ReactNode;
}
