import {useSyncExternalStore} from 'react';

/* État global de la recherche, partagé par tous les composants sans contexte
 * React : n'importe quelle barre, le raccourci clavier ou le code d'un site
 * peut ouvrir la modale avec `openSearch('requête')`. */

export interface SearchState {
  open: boolean;
  query: string;
  /** Incrémenté à chaque ouverture ou envoi de texte, pour resynchroniser la modale. */
  revision: number;
}

let state: SearchState = {open: false, query: '', revision: 0};
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function openSearch(query = ''): void {
  state = {open: true, query, revision: state.revision + 1};
  emit();
}

export function closeSearch(): void {
  if (!state.open) return;
  state = {...state, open: false};
  emit();
}

export function toggleSearch(): void {
  if (state.open) closeSearch();
  else openSearch('');
}

export function getSearchState(): SearchState {
  return state;
}

export function useSearchState(): SearchState {
  return useSyncExternalStore(subscribe, getSearchState, getSearchState);
}

/* Plusieurs barres peuvent coexister sur une page (navbar, footer, grande
 * barre) : une seule affiche la modale et écoute le clavier, la première
 * montée. Si elle disparaît, la suivante prend le relais. */
const hosts: symbol[] = [];
const hostListeners = new Set<() => void>();

export function registerHost(id: symbol): () => void {
  hosts.push(id);
  hostListeners.forEach((listener) => listener());
  return () => {
    const index = hosts.indexOf(id);
    if (index >= 0) hosts.splice(index, 1);
    hostListeners.forEach((listener) => listener());
  };
}

export function useIsActiveHost(id: symbol): boolean {
  return useSyncExternalStore(
    (listener) => {
      hostListeners.add(listener);
      return () => {
        hostListeners.delete(listener);
      };
    },
    () => hosts[0] === id,
    () => false,
  );
}
