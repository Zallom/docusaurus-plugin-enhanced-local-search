import React, {type MouseEvent, type ReactNode} from 'react';
import SearchResult from '@theme/SearchResult';
import SearchHighlight from '@theme/SearchHighlight';
import {ExternalIcon, HashIcon, PageIcon} from '@theme/SearchIcons';
import {isExternalUrl} from '@theme/SearchUtils';
import type {SearchHit, SearchResponse} from '../types';
import styles from './styles.module.css';

export interface SearchResultsProps {
  response: SearchResponse;
  active: number;
  /** Préfixe des `id` d'option, pour `aria-activedescendant`. */
  idPrefix: string;
  onSelect: (hit: SearchHit, event: MouseEvent<HTMLAnchorElement>) => void;
  onHover: (index: number) => void;
}

/** Liste de résultats groupés par catégorie, partagée par la modale et la grande barre. */
export default function SearchResults({response, active, idPrefix, onSelect, onHover}: SearchResultsProps): ReactNode {
  let index = -1;
  return (
    <>
      {response.groups.map((group, groupIndex) => {
        const titleId = `${idPrefix}-group-${groupIndex}`;
        return (
          <section key={group.category} className={styles.group}>
            <div id={titleId} className={styles.groupTitle}>
              {group.category}
            </div>
            <ul role="group" aria-labelledby={titleId} className={styles.list}>
              {group.hits.map((hit) => {
                index += 1;
                const position = index;
                return (
                  <SearchResult
                    key={hit.id}
                    id={`${idPrefix}-${position}`}
                    url={hit.url}
                    title={<SearchHighlight chunks={hit.titleChunks} />}
                    crumbs={hit.crumbs}
                    snippet={hit.snippet.length ? <SearchHighlight chunks={hit.snippet} /> : undefined}
                    icon={isExternalUrl(hit.url) ? <ExternalIcon /> : hit.isPage ? <PageIcon /> : <HashIcon />}
                    active={position === active}
                    onSelect={(event) => onSelect(hit, event)}
                    onHover={() => onHover(position)}
                  />
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}
