import fs from 'fs';
import path from 'path';
import {extractPage} from './extract';
import type {IndexedPage, PluginOptions} from '../types';

export interface ResolvedCategory {
  re: RegExp | null;
  label: string;
}

export interface BuildIndexInput {
  outDir: string;
  /** Dossiers des autres locales à ignorer (présents dans l'outDir de la locale par défaut). */
  otherLocalePaths: string[];
  baseUrl: string;
  siteTitle: string;
  searchPagePath: string | null;
  categories: ResolvedCategory[];
  defaultCategory: string;
  options: PluginOptions;
}

export interface BuildIndexResult {
  pages: IndexedPage[];
  skipped: number;
}

// Pages de listing générées par Docusaurus : elles répètent le contenu des
// pages qu'elles listent et pollueraient les résultats.
const LISTING_CLASS = /(^|\s)(blog-list-page|blog-tags-list-page|blog-tags-post-list-page|blog-archive-page|blog-authors-list-page|blog-authors-posts-page|docs-tags-list-page|docs-tags-doc-list-page)(\s|$)/;

/* Une page du blog qui n'est pas un article est une liste : la page d'archives
 * n'a aucune classe à elle (Docusaurus 3.10). */
function isListingPage(htmlClass: string): boolean {
  if (LISTING_CLASS.test(htmlClass)) return true;
  const classes = htmlClass.split(/\s+/);
  return classes.includes('plugin-blog') && !classes.includes('blog-post-page');
}

function walkHtml(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/** `docs/setup.html` → `/docs/setup`, `docs/index.html` → `/docs/`, `index.html` → `/`. */
export function routeFromFile(rel: string): string {
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel.replace(/\.html$/, '')}`;
}

export function joinUrl(baseUrl: string, route: string): string {
  return `${baseUrl.replace(/\/$/, '')}${route}`;
}

const stripSlash = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p);

function isCanonical(canonical: string, url: string): boolean {
  try {
    return stripSlash(new URL(canonical, 'https://placeholder.invalid').pathname) === stripSlash(url);
  } catch {
    return true;
  }
}

export function buildIndex(input: BuildIndexInput): BuildIndexResult {
  const {outDir, options} = input;
  const ignore = options.ignorePatterns.map((pattern) => new RegExp(pattern));
  const otherLocales = new Set(input.otherLocalePaths);
  const pages: IndexedPage[] = [];
  let skipped = 0;

  for (const file of walkHtml(outDir)) {
    const rel = path.relative(outDir, file).split(path.sep).join('/');
    if (otherLocales.has(rel.split('/')[0])) continue;

    const route = routeFromFile(rel);
    if (/(^|\/)404(\/|$)/.test(route) || route === input.searchPagePath) continue;
    if (ignore.some((re) => re.test(route))) {
      skipped++;
      continue;
    }

    const page = extractPage(fs.readFileSync(file, 'utf8'), {
      contentSelectors: options.contentSelectors,
      excludeSelectors: options.excludeSelectors,
      headingLevels: options.headingLevels,
      maxSectionLength: options.maxSectionLength,
      siteTitle: input.siteTitle,
    });
    const url = joinUrl(input.baseUrl, route);
    if (
      !page ||
      isListingPage(page.htmlClass) ||
      (options.respectNoindex && page.noindex) ||
      (options.onlyCanonical && page.canonical && !isCanonical(page.canonical, url))
    ) {
      skipped++;
      continue;
    }

    pages.push({
      u: url,
      t: page.title,
      d: page.description,
      c: input.categories.find((cat) => cat.re?.test(route))?.label ?? input.defaultCategory,
      b: page.breadcrumbs,
      s: page.sections,
    });
  }

  pages.sort((a, b) => a.u.localeCompare(b.u));
  return {pages, skipped};
}
