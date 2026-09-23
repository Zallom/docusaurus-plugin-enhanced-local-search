import React, {useEffect, useMemo, useState, type ReactNode} from 'react';
import {usePluginData} from '@docusaurus/useGlobalData';
import SearchModal from '@theme/SearchModal';
import {closeSearch, openSearch, registerHost, useIsActiveHost, useSearchState, getSearchState} from '@theme/SearchStore';
import {isMacPlatform, matchesShortcut, parseShortcut} from '@theme/SearchUtils';
import type {LocalSearchGlobalData} from '../types';

/* Monte la modale et écoute les raccourcis clavier. Chaque composant de
 * recherche l'inclut : un seul hôte est actif à la fois, les autres ne
 * rendent rien. Un site qui n'affiche aucune barre peut le monter seul, par
 * exemple dans son `Root`, pour garder Cmd+K. */
export default function SearchModalHost(): ReactNode {
  const [id] = useState(() => Symbol('local-search-host'));
  useEffect(() => registerHost(id), [id]);
  const active = useIsActiveHost(id);
  const {open, query, revision, context} = useSearchState();
  const data = usePluginData('docusaurus-plugin-enhanced-local-search') as LocalSearchGlobalData;
  const shortcuts = useMemo(() => data.shortcuts.map(parseShortcut), [data.shortcuts]);

  useEffect(() => {
    if (!active || !shortcuts.length) return undefined;
    const mac = isMacPlatform();
    const onKeyDown = (event: KeyboardEvent) => {
      if (!shortcuts.some((shortcut) => matchesShortcut(event, shortcut, mac))) return;
      event.preventDefault();
      if (getSearchState().open) closeSearch();
      else openSearch('');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, shortcuts]);

  if (!active || !open) return null;
  return <SearchModal initialQuery={query} revision={revision} context={context} onClose={closeSearch} />;
}
