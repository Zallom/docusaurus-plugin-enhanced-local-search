import React, {useState, type ReactNode} from 'react';
import {translate} from '@docusaurus/Translate';
import useLocalSearch from '@theme/useLocalSearch';
import SearchModalHost from '@theme/SearchModalHost';
import {SearchIcon} from '@theme/SearchIcons';
import {openSearch} from '@theme/SearchStore';
import {shortcutLabel, useIsMac} from '@theme/SearchUtils';
import styles from './styles.module.css';

export interface SearchInputProps {
  placeholder?: string;
  className?: string;
  /** Affiche le raccourci clavier (⌘ K / Ctrl K). */
  showShortcut?: boolean;
  /** `navbar` se replie en bouton-icône sur petit écran. */
  variant?: 'default' | 'navbar';
}

/* Mini barre de recherche, pour la navbar, le footer ou n'importe quelle
 * page. Un clic ouvre la fenêtre de recherche ; si on tape directement dans
 * la barre, la fenêtre s'ouvre avec ce qui a été tapé. */
export default function SearchInput({
  placeholder,
  className,
  showShortcut = true,
  variant = 'default',
}: SearchInputProps): ReactNode {
  const {data, prefetch} = useLocalSearch();
  const mac = useIsMac();
  const [value, setValue] = useState('');
  const label =
    placeholder ??
    translate({id: 'localSearch.input.placeholder', message: 'Search', description: 'Placeholder of the mini search bar'});
  const shortcut = data.shortcuts.find((s) => s.includes('+')) ?? data.shortcuts[0];

  const open = (text: string) => {
    openSearch(text);
    setValue('');
  };

  const classes = [styles.bar, variant === 'navbar' ? styles.navbar : '', className ?? ''].filter(Boolean).join(' ');

  return (
    <>
      <div className={classes} onMouseEnter={prefetch}>
        <button type="button" className={styles.iconButton} aria-label={label} onClick={() => open('')}>
          <SearchIcon width={18} height={18} />
        </button>
        <label className={styles.field}>
          <SearchIcon className={styles.icon} width={16} height={16} />
          <input
            className={styles.input}
            type="search"
            value={value}
            placeholder={label}
            aria-label={label}
            aria-haspopup="dialog"
            autoComplete="off"
            spellCheck={false}
            onFocus={prefetch}
            onClick={() => open(value)}
            onChange={(event) => open(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === 'ArrowDown') {
                event.preventDefault();
                open(value);
              }
            }}
          />
          {showShortcut && mac !== null && shortcut && (
            <span className={styles.kbds} aria-hidden="true">
              {shortcutLabel(shortcut, mac).map((key) => (
                <kbd key={key} className={styles.kbd}>
                  {key}
                </kbd>
              ))}
            </span>
          )}
        </label>
      </div>
      <SearchModalHost />
    </>
  );
}
