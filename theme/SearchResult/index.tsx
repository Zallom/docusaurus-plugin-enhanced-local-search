import React, {type MouseEvent, type ReactNode} from 'react';
import {translate} from '@docusaurus/Translate';
import {CloseIcon, EnterIcon} from '@theme/SearchIcons';
import {isExternalUrl} from '@theme/SearchUtils';
import styles from './styles.module.css';

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
  /** Affiche un bouton pour retirer l'entrée (recherches récentes). */
  onRemove?: () => void;
}

/* Une ligne de résultat. C'est un vrai lien : clic molette, Cmd+clic et
 * « ouvrir dans un nouvel onglet » fonctionnent comme partout ailleurs. */
export default function SearchResult({
  id,
  url,
  title,
  crumbs,
  snippet,
  icon,
  active,
  onSelect,
  onHover,
  onRemove,
}: SearchResultProps): ReactNode {
  return (
    <li role="presentation" className={styles.item}>
      <a
        id={id}
        href={url}
        {...(isExternalUrl(url) ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
        role="option"
        aria-selected={active}
        className={active ? `${styles.hit} ${styles.hitActive}` : styles.hit}
        onClick={onSelect}
        onMouseMove={onHover}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          {crumbs && crumbs.length > 0 && <span className={styles.crumbs}>{crumbs.join(' › ')}</span>}
          {snippet && <span className={styles.snippet}>{snippet}</span>}
        </span>
        {onRemove ? (
          <button
            type="button"
            className={styles.remove}
            aria-label={translate({
              id: 'localSearch.recent.remove',
              message: 'Remove from recent searches',
              description: 'Button that removes an entry from the recent searches list',
            })}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onRemove();
            }}>
            <CloseIcon width={16} height={16} />
          </button>
        ) : (
          <span className={styles.enter}>
            <EnterIcon width={16} height={16} />
          </span>
        )}
      </a>
    </li>
  );
}
