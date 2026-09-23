import type {IndexedPage} from '../types';

export interface ResolvedEntry {
  title: string;
  url: string;
  description: string;
  keywords: string[];
  category: string;
  priority: number;
}

const stripSlash = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p);

/* Une entrée qui pointe vers une page déjà indexée lui ajoute ses mots-clés
 * (et son titre, s'il diffère) au lieu de créer un doublon. */
export function applyCustomEntries(pages: IndexedPage[], entries: ResolvedEntry[]): number {
  let added = 0;
  for (const entry of entries) {
    const existing = pages.find((page) => stripSlash(page.u) === stripSlash(entry.url));
    if (existing) {
      const words = [...entry.keywords];
      if (entry.title !== existing.t) words.push(entry.title);
      existing.k = [existing.k, ...words].filter(Boolean).join(' ');
      existing.p = Math.max(existing.p ?? 0, entry.priority);
      continue;
    }
    pages.push({
      u: entry.url,
      t: entry.title,
      d: entry.description,
      c: entry.category,
      b: [],
      s: [],
      k: entry.keywords.join(' ') || undefined,
      p: entry.priority,
    });
    added++;
  }
  return added;
}
