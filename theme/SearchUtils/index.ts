import {useCallback, useEffect, useState} from 'react';

export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

/** Plateforme connue seulement après le montage, pour ne pas désynchroniser le rendu serveur. */
export function useIsMac(): boolean | null {
  const [mac, setMac] = useState<boolean | null>(null);
  useEffect(() => setMac(isMacPlatform()), []);
  return mac;
}

export function isEditable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

interface Shortcut {
  key: string;
  mod: boolean;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
}

/** `mod+k` : Cmd sur macOS, Ctrl ailleurs. */
export function parseShortcut(shortcut: string): Shortcut {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts.pop() ?? '';
  return {
    key,
    mod: parts.includes('mod'),
    ctrl: parts.includes('ctrl'),
    meta: parts.includes('meta') || parts.includes('cmd'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
  };
}

export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut, mac: boolean): boolean {
  if (event.key.toLowerCase() !== shortcut.key) return false;
  const wantMeta = shortcut.meta || (shortcut.mod && mac);
  const wantCtrl = shortcut.ctrl || (shortcut.mod && !mac);
  if (event.metaKey !== wantMeta || event.ctrlKey !== wantCtrl) return false;
  if (event.altKey !== shortcut.alt) return false;
  if (shortcut.shift && !event.shiftKey) return false;
  // Un raccourci sans modificateur (« / ») ne doit pas voler une saisie en cours.
  if (!wantMeta && !wantCtrl && isEditable(event.target)) return false;
  return true;
}

/** Libellé affiché d'un raccourci : `⌘ K` sur macOS, `Ctrl K` ailleurs. */
export function shortcutLabel(shortcut: string, mac: boolean): string[] {
  const parsed = parseShortcut(shortcut);
  const keys: string[] = [];
  if (parsed.mod) keys.push(mac ? '⌘' : 'Ctrl');
  if (parsed.meta) keys.push('⌘');
  if (parsed.ctrl) keys.push('Ctrl');
  if (parsed.alt) keys.push(mac ? '⌥' : 'Alt');
  if (parsed.shift) keys.push(mac ? '⇧' : 'Shift');
  keys.push(parsed.key.length === 1 ? parsed.key.toUpperCase() : parsed.key);
  return keys;
}

export interface RecentEntry {
  url: string;
  title: string;
  crumbs: string[];
}

/* Derniers résultats ouverts, gardés dans le navigateur de la personne. Les
 * accès au stockage sont protégés : navigation privée ou stockage bloqué ne
 * doivent pas casser la recherche. */
export function useRecentSearches(storageKey: string, max: number) {
  const key = `${storageKey}:recent`;
  const [items, setItems] = useState<RecentEntry[]>([]);

  useEffect(() => {
    if (!max) return;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setItems((JSON.parse(raw) as RecentEntry[]).slice(0, max));
    } catch {
      // stockage indisponible
    }
  }, [key, max]);

  const persist = useCallback(
    (next: RecentEntry[]) => {
      setItems(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // stockage indisponible
      }
    },
    [key],
  );

  const add = useCallback(
    (entry: RecentEntry) => {
      if (!max) return;
      persist([entry, ...items.filter((item) => item.url !== entry.url)].slice(0, max));
    },
    [items, max, persist],
  );

  const remove = useCallback(
    (url: string) => persist(items.filter((item) => item.url !== url)),
    [items, persist],
  );

  return {items, add, remove};
}
