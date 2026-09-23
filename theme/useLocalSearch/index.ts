import {useCallback, useEffect, useState} from 'react';
import {usePluginData} from '@docusaurus/useGlobalData';
import {useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {createSearchEngine, type SearchEngine} from '@theme/SearchEngine';
import type {LocalSearchGlobalData, SearchIndexFile, SearchResponse} from '../types';

export type SearchStatus = 'idle' | 'loading' | 'ready' | 'unavailable' | 'error';

const PLUGIN_NAME = 'docusaurus-plugin-enhanced-local-search';

// Un seul téléchargement de l'index par URL et par session de navigation.
const engines = new Map<string, Promise<SearchEngine>>();
const ready = new Map<string, SearchEngine>();

class IndexUnavailableError extends Error {}

function loadEngine(url: string, data: LocalSearchGlobalData): Promise<SearchEngine> {
  let promise = engines.get(url);
  if (!promise) {
    promise = fetch(url)
      .then((res) => {
        // En `docusaurus start`, l'index n'existe pas : il est produit au build.
        if (res.status === 404) throw new IndexUnavailableError();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<SearchIndexFile>;
      })
      .then((index) => {
        const engine = createSearchEngine(index, data);
        ready.set(url, engine);
        return engine;
      });
    promise.catch(() => engines.delete(url));
    engines.set(url, promise);
  }
  return promise;
}

export interface UseLocalSearch {
  status: SearchStatus;
  data: LocalSearchGlobalData;
  /** Lance le téléchargement de l'index sans attendre l'ouverture (survol, focus). */
  prefetch: () => void;
  search: (query: string, options?: {context?: string | null}) => SearchResponse | null;
}

/* Catégorie à mettre en tête : celle imposée par la barre (id ou libellé), sinon
 * celle de la page courante si `contextualPriority` est actif. Renvoie le libellé. */
export function useSearchContext(explicit?: string | null): string | null {
  const data = usePluginData(PLUGIN_NAME) as LocalSearchGlobalData;
  const {pathname} = useLocation();
  const baseUrl = useBaseUrl('/');
  if (explicit) {
    return data.categoryContexts.find((c) => c.id === explicit || c.label === explicit)?.label ?? explicit;
  }
  if (!data.contextualPriority) return null;
  const path = pathname.startsWith(baseUrl) ? `/${pathname.slice(baseUrl.length)}` : pathname;
  return data.categoryContexts.find((c) => new RegExp(c.match).test(path))?.label ?? null;
}

export default function useLocalSearch({autoLoad = false}: {autoLoad?: boolean} = {}): UseLocalSearch {
  const data = usePluginData(PLUGIN_NAME) as LocalSearchGlobalData;
  const url = `${useBaseUrl(data.indexUrl)}?v=${data.buildId}`;
  const [status, setStatus] = useState<SearchStatus>(() => (ready.has(url) ? 'ready' : 'idle'));

  const prefetch = useCallback(() => {
    if (ready.has(url)) {
      setStatus('ready');
      return;
    }
    setStatus((current) => (current === 'idle' ? 'loading' : current));
    loadEngine(url, data).then(
      () => setStatus('ready'),
      (error) => setStatus(error instanceof IndexUnavailableError ? 'unavailable' : 'error'),
    );
  }, [url, data]);

  useEffect(() => {
    if (autoLoad) prefetch();
  }, [autoLoad, prefetch]);

  const search = useCallback(
    (query: string, options?: {context?: string | null}) => {
      const engine = ready.get(url);
      return engine ? engine.search(query, options) : null;
    },
    [url, status],
  );

  return {status, data, prefetch, search};
}
