import {useCallback, useEffect, useState} from 'react';
import {usePluginData} from '@docusaurus/useGlobalData';
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
  search: (query: string) => SearchResponse | null;
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
    (query: string) => {
      const engine = ready.get(url);
      return engine ? engine.search(query) : null;
    },
    [url, status],
  );

  return {status, data, prefetch, search};
}
