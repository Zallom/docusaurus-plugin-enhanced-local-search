import React, {useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode} from 'react';
import {useHistory, useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Translate, {translate} from '@docusaurus/Translate';
import useLocalSearch from '@theme/useLocalSearch';
import SearchModalHost from '@theme/SearchModalHost';
import SearchResults from '@theme/SearchResults';
import SearchResult from '@theme/SearchResult';
import {ArrowRightIcon, SearchIcon, StarIcon} from '@theme/SearchIcons';
import {openSearch} from '@theme/SearchStore';
import {isExternalUrl, openExternal} from '@theme/SearchUtils';
import styles from './styles.module.css';

export interface SearchHeroProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  placeholder?: string;
  /** Recherches proposées sous la barre, en pastilles cliquables. */
  suggestions?: string[];
  /** Affiche les résultats sous la barre au lieu d'ouvrir la fenêtre de recherche. */
  inline?: boolean;
  /** En mode `inline`, garde la requête dans l'URL (`?q=`) pour pouvoir la partager. */
  syncUrl?: boolean;
  initialQuery?: string;
  /** En mode `inline`, liste les suggestions du plugin tant que rien n'est tapé. Activé par défaut en `inline`. */
  showSuggestions?: boolean;
  className?: string;
}

/* Grande barre de recherche, à placer en tête d'une page. Par défaut, taper
 * ouvre la fenêtre de recherche avec le texte saisi ; en mode `inline`, les
 * résultats s'affichent directement dessous. */
export default function SearchHero({
  title,
  subtitle,
  placeholder,
  suggestions = [],
  inline = false,
  syncUrl = false,
  initialQuery = '',
  showSuggestions = inline,
  className,
}: SearchHeroProps): ReactNode {
  const {status, data, prefetch, search} = useLocalSearch({autoLoad: inline});
  const history = useHistory();
  const location = useLocation();
  const idPrefix = `lsearch-hero-${useId().replace(/:/g, '')}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const label =
    placeholder ??
    translate({
      id: 'localSearch.hero.placeholder',
      message: 'Search the documentation…',
      description: 'Placeholder of the large search bar',
    });

  const trimmed = query.trim();
  const response = useMemo(
    () => (inline && trimmed && status === 'ready' ? search(trimmed) : null),
    [inline, trimmed, status, search],
  );
  const hits = response?.hits ?? [];
  // Formulaire GET classique (`/search?q=`) : il marche sans JavaScript et les
  // navigateurs le reconnaissent comme une recherche.
  const searchPageUrl = useBaseUrl(data.searchPagePath ?? '/');
  const idle = inline && showSuggestions && !trimmed ? data.suggestions : [];
  const targets = hits.length ? hits.map((hit) => hit.url) : idle.map((s) => s.href);

  useEffect(() => setActive(0), [trimmed]);

  useEffect(() => {
    if (!inline || !syncUrl) return;
    const params = new URLSearchParams(location.search);
    if ((params.get('q') ?? '') === trimmed) return;
    if (trimmed) params.set('q', trimmed);
    else params.delete('q');
    const qs = params.toString();
    history.replace({...location, search: qs ? `?${qs}` : ''});
  }, [inline, syncUrl, trimmed]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (text: string) => {
    if (inline) {
      setQuery(text);
      inputRef.current?.focus();
    } else {
      openSearch(text);
      setQuery('');
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!inline) {
      if (event.key === 'Enter') {
        event.preventDefault();
        submit(query);
      }
      return;
    }
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && targets.length) {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActive((current) => (current + delta + targets.length) % targets.length);
    } else if (event.key === 'Enter' && targets[active]) {
      event.preventDefault();
      const url = targets[active];
      if (event.metaKey || event.ctrlKey || isExternalUrl(url)) openExternal(url);
      else history.push(url);
    }
  };

  const follow = (url: string, event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0 || isExternalUrl(url)) return;
    event.preventDefault();
    history.push(url);
  };

  let results: ReactNode = null;
  if (idle.length) {
    results = (
      <section>
        <div className={styles.groupTitle}>
          <Translate id="localSearch.suggestions.title" description="Title of the suggested pages list">
            Suggestions
          </Translate>
        </div>
        <ul id={`${idPrefix}-listbox`} role="listbox" className={styles.list}>
          {idle.map((suggestion, i) => (
            <SearchResult
              key={suggestion.href}
              id={`${idPrefix}-${i}`}
              url={suggestion.href}
              title={suggestion.label}
              icon={<StarIcon />}
              active={active === i}
              onSelect={(event) => follow(suggestion.href, event)}
              onHover={() => setActive(i)}
            />
          ))}
        </ul>
      </section>
    );
  } else if (inline && trimmed) {
    if (status === 'unavailable') {
      results = (
        <p className={styles.message}>
          <Translate id="localSearch.modal.unavailable" description="Shown when the index is missing (dev server)">
            The search index is generated at build time. Build and serve the site to try the search.
          </Translate>
        </p>
      );
    } else if (status === 'error') {
      results = (
        <p className={styles.message}>
          <Translate id="localSearch.modal.error" description="Shown when the index fails to load">
            The search index could not be loaded.
          </Translate>
        </p>
      );
    } else if (!response) {
      results = (
        <p className={styles.message}>
          <Translate id="localSearch.modal.loading" description="Shown while the index loads">
            Loading…
          </Translate>
        </p>
      );
    } else if (!hits.length) {
      results = (
        <div className={styles.message}>
          <p>
            <Translate
              id="localSearch.modal.noResults"
              description="No results message, {query} is the search"
              values={{query: <strong>{trimmed}</strong>}}>
              {'No results for "{query}"'}
            </Translate>
          </p>
          {response.suggestion && (
            <button type="button" className={styles.chip} onClick={() => submit(response.suggestion ?? '')}>
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
      results = (
        <>
          <p className={styles.count}>
            {hits.length === 1 ? (
              <Translate id="localSearch.page.countOne" description="Exactly one result">
                1 result
              </Translate>
            ) : (
              <Translate
                id="localSearch.page.count"
                description="Number of results, {count} is a number greater than one"
                values={{count: hits.length}}>
                {'{count} results'}
              </Translate>
            )}
          </p>
          {response.relaxed && (
            <p className={styles.notice}>
              <Translate id="localSearch.modal.relaxed" description="Shown when no result contains every word">
                No page contains all of your words. Here are the closest matches.
              </Translate>
            </p>
          )}
          <div id={`${idPrefix}-listbox`} role="listbox">
            <SearchResults
              response={response}
              active={active}
              idPrefix={idPrefix}
              onSelect={(hit, event) => follow(hit.url, event)}
              onHover={setActive}
            />
          </div>
        </>
      );
    }
  }

  return (
    <div className={[styles.hero, className ?? ''].filter(Boolean).join(' ')} data-search-ignore>
      {title && <h1 className={styles.title}>{title}</h1>}
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <form
        className={styles.box}
        role="search"
        method="get"
        action={data.searchPagePath ? searchPageUrl : undefined}
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}>
        <SearchIcon className={styles.icon} width={22} height={22} />
        <input
          ref={inputRef}
          className={styles.input}
          type="search"
          name="q"
          value={query}
          placeholder={label}
          aria-label={label}
          role={inline ? 'combobox' : undefined}
          aria-expanded={inline ? targets.length > 0 : undefined}
          aria-controls={inline ? `${idPrefix}-listbox` : undefined}
          aria-activedescendant={inline && targets.length ? `${idPrefix}-${active}` : undefined}
          aria-haspopup={inline ? undefined : 'dialog'}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          onFocus={prefetch}
          onChange={(event) => {
            if (inline) setQuery(event.target.value);
            else submit(event.target.value);
          }}
          onKeyDown={onKeyDown}
        />
        <button
          type="submit"
          className={styles.submit}
          disabled={inline && !trimmed}
          aria-label={translate({id: 'localSearch.hero.submit', message: 'Search', description: 'Submit button of the large search bar'})}>
          <ArrowRightIcon width={20} height={20} />
        </button>
      </form>
      {suggestions.length > 0 && (
        <div className={styles.chips}>
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" className={styles.chip} onClick={() => submit(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      )}
      {results && <div className={styles.results}>{results}</div>}
      {!inline && <SearchModalHost />}
    </div>
  );
}
