import React, {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {createPortal} from 'react-dom';
import {useHistory} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate, {translate} from '@docusaurus/Translate';
import useLocalSearch from '@theme/useLocalSearch';
import SearchResults from '@theme/SearchResults';
import SearchResult from '@theme/SearchResult';
import {ArrowDownIcon, ArrowUpIcon, ClockIcon, CloseIcon, EnterIcon, SearchIcon, StarIcon} from '@theme/SearchIcons';
import {isExternalUrl, openExternal, useRecentSearches, type RecentEntry} from '@theme/SearchUtils';
import type {SearchHit} from '../types';
import styles from './styles.module.css';

export interface SearchModalProps {
  initialQuery: string;
  /** Change quand un autre composant envoie du texte : la modale reprend alors `initialQuery`. */
  revision: number;
  onClose: () => void;
}

interface Item {
  url: string;
  recent?: RecentEntry;
}

const isModified = (event: {metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean}) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

function toRecent(hit: SearchHit): RecentEntry {
  return {url: hit.url, title: hit.isPage ? hit.pageTitle : hit.heading ?? hit.pageTitle, crumbs: hit.crumbs};
}

export default function SearchModal({initialQuery, revision, onClose}: SearchModalProps): ReactNode {
  const {status, data, prefetch, search} = useLocalSearch({autoLoad: true});
  const history = useHistory();
  const idPrefix = `lsearch-${useId().replace(/:/g, '')}`;
  const listboxId = `${idPrefix}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const recent = useRecentSearches(data.storageKey, data.recentSearches);
  const searchPageUrl = useBaseUrl(data.searchPagePath ?? '/');

  // Texte envoyé par une barre pendant que la modale est ouverte.
  useEffect(() => {
    setQuery(initialQuery);
    const input = inputRef.current;
    if (input) {
      input.focus();
      // Longueur lue au dernier moment : en frappe rapide, d'autres lettres
      // sont peut-être déjà arrivées, le curseur doit rester à la fin.
      requestAnimationFrame(() => {
        const end = input.value.length;
        input.setSelectionRange(end, end);
      });
    }
  }, [revision]); // eslint-disable-line react-hooks/exhaustive-deps

  // Verrouille le défilement de la page et rend le focus à la fermeture.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const {overflow} = document.body.style;
    document.body.style.overflow = 'hidden';
    prefetch();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const trimmed = query.trim();
  const response = useMemo(() => (trimmed && status === 'ready' ? search(trimmed) : null), [trimmed, status, search]);

  const items: Item[] = useMemo(() => {
    if (trimmed) return (response?.hits ?? []).map((hit) => ({url: hit.url, recent: toRecent(hit)}));
    return [
      ...recent.items.map((entry) => ({url: entry.url, recent: entry})),
      ...data.suggestions.map((s) => ({url: s.href})),
    ];
  }, [trimmed, response, recent.items, data.suggestions]);

  useEffect(() => setActive(0), [trimmed]);
  useEffect(() => {
    document.getElementById(`${idPrefix}-${active}`)?.scrollIntoView({block: 'nearest'});
  }, [active, idPrefix]);

  const go = (item: Item) => {
    if (item.recent) recent.add(item.recent);
    onClose();
    if (isExternalUrl(item.url)) openExternal(item.url);
    else history.push(item.url);
  };

  const onLinkClick = (item: Item, event: MouseEvent<HTMLAnchorElement>) => {
    // Cmd/Ctrl/Shift+clic : on laisse le navigateur ouvrir un nouvel onglet.
    if (isModified(event) || event.button !== 0) {
      if (item.recent) recent.add(item.recent);
      return;
    }
    if (isExternalUrl(item.url)) {
      if (item.recent) recent.add(item.recent);
      onClose();
      return;
    }
    event.preventDefault();
    go(item);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!items.length) return;
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActive((current) => (current + delta + items.length) % items.length);
    } else if (event.key === 'Enter' && event.target === inputRef.current) {
      const item = items[active];
      if (!item) return;
      event.preventDefault();
      if (isModified(event)) {
        if (item.recent) recent.add(item.recent);
        window.open(item.url, '_blank', 'noopener');
      } else {
        go(item);
      }
    } else if (event.key === 'Tab') {
      // Le focus reste dans la boîte de dialogue.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('input, button, a[href]');
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  let body: ReactNode;
  if (!trimmed) {
    body =
      items.length > 0 ? (
        <>
          {recent.items.length > 0 && (
            <section>
              <div className={styles.groupTitle}>
                <Translate id="localSearch.recent.title" description="Title of the recent searches list">
                  Recent
                </Translate>
              </div>
              <ul role="group" className={styles.list}>
                {recent.items.map((entry, i) => (
                  <SearchResult
                    key={entry.url}
                    id={`${idPrefix}-${i}`}
                    url={entry.url}
                    title={entry.title}
                    crumbs={entry.crumbs}
                    icon={<ClockIcon />}
                    active={active === i}
                    onSelect={(event) => onLinkClick({url: entry.url, recent: entry}, event)}
                    onHover={() => setActive(i)}
                    onRemove={() => recent.remove(entry.url)}
                  />
                ))}
              </ul>
            </section>
          )}
          {data.suggestions.length > 0 && (
            <section>
              <div className={styles.groupTitle}>
                <Translate id="localSearch.suggestions.title" description="Title of the suggested pages list">
                  Suggestions
                </Translate>
              </div>
              <ul role="group" className={styles.list}>
                {data.suggestions.map((suggestion, i) => {
                  const position = recent.items.length + i;
                  return (
                    <SearchResult
                      key={suggestion.href}
                      id={`${idPrefix}-${position}`}
                      url={suggestion.href}
                      title={suggestion.label}
                      icon={<StarIcon />}
                      active={active === position}
                      onSelect={(event) => onLinkClick({url: suggestion.href}, event)}
                      onHover={() => setActive(position)}
                    />
                  );
                })}
              </ul>
            </section>
          )}
        </>
      ) : (
        <p className={styles.message}>
          <Translate id="localSearch.modal.startTyping" description="Hint shown in the empty search modal">
            Type to search pages and sections.
          </Translate>
        </p>
      );
  } else if (status === 'unavailable') {
    body = (
      <p className={styles.message}>
        <Translate id="localSearch.modal.unavailable" description="Shown when the index is missing (dev server)">
          The search index is generated at build time. Build and serve the site to try the search.
        </Translate>
      </p>
    );
  } else if (status === 'error') {
    body = (
      <p className={styles.message}>
        <Translate id="localSearch.modal.error" description="Shown when the index fails to load">
          The search index could not be loaded.
        </Translate>
      </p>
    );
  } else if (!response) {
    body = (
      <p className={styles.message}>
        <Translate id="localSearch.modal.loading" description="Shown while the index loads">
          Loading…
        </Translate>
      </p>
    );
  } else if (!response.hits.length) {
    body = (
      <div className={styles.message}>
        <p className={styles.noResults}>
          <Translate
            id="localSearch.modal.noResults"
            description="No results message, {query} is the search"
            values={{query: <strong>{trimmed}</strong>}}>
            {'No results for "{query}"'}
          </Translate>
        </p>
        {response.suggestion && (
          <button type="button" className={styles.didYouMean} onClick={() => setQuery(response.suggestion ?? '')}>
            <Translate
              id="localSearch.modal.didYouMean"
              description="Spelling suggestion, {suggestion} is a clickable word"
              values={{suggestion: <strong>{response.suggestion}</strong>}}>
              {'Did you mean "{suggestion}"?'}
            </Translate>
          </button>
        )}
      </div>
    );
  } else {
    body = (
      <>
        {response.relaxed && (
          <p className={styles.notice}>
            <Translate id="localSearch.modal.relaxed" description="Shown when no result contains every word">
              No page contains all of your words. Here are the closest matches.
            </Translate>
          </p>
        )}
        <SearchResults
          response={response}
          active={active}
          idPrefix={idPrefix}
          onSelect={(hit, event) => onLinkClick({url: hit.url, recent: toRecent(hit)}, event)}
          onHover={setActive}
        />
      </>
    );
  }

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={translate({id: 'localSearch.modal.label', message: 'Search', description: 'Search dialog label'})}
        onKeyDown={onKeyDown}>
        <div className={styles.header}>
          <SearchIcon className={styles.headerIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={items.length > 0}
            aria-controls={listboxId}
            aria-activedescendant={items.length ? `${idPrefix}-${active}` : undefined}
            placeholder={translate({
              id: 'localSearch.modal.placeholder',
              message: 'Search the documentation',
              description: 'Placeholder of the search modal input',
            })}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="search"
          />
          {query && (
            <button
              type="button"
              className={styles.clear}
              aria-label={translate({id: 'localSearch.modal.clear', message: 'Clear', description: 'Clear the search'})}
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}>
              <CloseIcon width={16} height={16} />
            </button>
          )}
          <button type="button" className={styles.close} onClick={onClose}>
            <kbd className={styles.kbd}>Esc</kbd>
            <span className={styles.closeLabel}>
              <Translate id="localSearch.modal.cancel" description="Close button on small screens">
                Cancel
              </Translate>
            </span>
          </button>
        </div>

        <div id={listboxId} role="listbox" className={styles.body}>
          {body}
        </div>

        <div className={styles.footer}>
          <span className={styles.hints}>
            <span className={styles.hint}>
              <kbd className={styles.kbd}>
                <EnterIcon width={12} height={12} />
              </kbd>
              <Translate id="localSearch.footer.select" description="Keyboard hint: Enter">
                to select
              </Translate>
            </span>
            <span className={styles.hint}>
              <kbd className={styles.kbd}>
                <ArrowUpIcon width={12} height={12} />
              </kbd>
              <kbd className={styles.kbd}>
                <ArrowDownIcon width={12} height={12} />
              </kbd>
              <Translate id="localSearch.footer.navigate" description="Keyboard hint: arrows">
                to navigate
              </Translate>
            </span>
            <span className={styles.hint}>
              <kbd className={styles.kbd}>Esc</kbd>
              <Translate id="localSearch.footer.close" description="Keyboard hint: Escape">
                to close
              </Translate>
            </span>
          </span>
          {data.searchPagePath && trimmed && (
            <a
              className={styles.seeAll}
              href={`${searchPageUrl}?q=${encodeURIComponent(trimmed)}`}
              onClick={(event) => {
                if (isModified(event)) return;
                event.preventDefault();
                onClose();
                history.push(`${searchPageUrl}?q=${encodeURIComponent(trimmed)}`);
              }}>
              <Translate id="localSearch.footer.seeAll" description="Link to the full search page">
                See all results
              </Translate>
            </a>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
