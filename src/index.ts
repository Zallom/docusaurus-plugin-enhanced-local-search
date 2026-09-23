import fs from 'fs';
import path from 'path';
import type {LoadContext, Plugin, SwizzleConfig} from '@docusaurus/types';
import {buildIndex, joinUrl, type ResolvedCategory} from './indexer/build';
import {applyCustomEntries, type ResolvedEntry} from './indexer/custom';
import {DEFAULT_STOP_WORDS} from './stopwords';
import translations, {DEFAULT_MESSAGES} from './translations';
import {openSearchXml, searchActionJsonLd} from './seo';
import {pickLocale} from './locales';
import type {CustomEntryOption, LocalizedString, LocalSearchGlobalData, PluginOptions, SearchIndexFile} from './types';

export {validateOptions} from './options';
export type {PluginOptions, CustomEntryOption, SearchIndexFile, LocalSearchGlobalData} from './types';

const PLUGIN_NAME = 'docusaurus-plugin-enhanced-local-search';

const safe = {eject: 'safe', wrap: 'safe'} as const;

/** Composants qu'un site peut personnaliser avec `docusaurus swizzle`. */
export function getSwizzleConfig(): SwizzleConfig {
  return {
    components: {
      SearchBar: {actions: safe, description: 'Barre de la navbar (élément de navbar `type: \'search\'`).'},
      SearchInput: {actions: safe, description: 'Mini barre à placer dans la navbar, le footer ou une page.'},
      SearchHero: {actions: safe, description: 'Grande barre de recherche pour une page, façon ChatGPT.'},
      SearchPage: {actions: safe, description: 'Page de recherche (option searchPagePath).'},
      SearchResult: {actions: safe, description: 'Une ligne de résultat (titre, fil d\'Ariane, extrait).'},
      SearchResults: {actions: safe, description: 'Liste des résultats groupés par catégorie.'},
      SearchModal: {actions: {eject: 'unsafe', wrap: 'safe'}, description: 'La fenêtre de recherche (Cmd+K).'},
      SearchModalHost: {actions: {eject: 'unsafe', wrap: 'safe'}, description: 'Monte la fenêtre et écoute les raccourcis.'},
      SearchIcons: {actions: safe, description: 'Icônes utilisées par la recherche.'},
    },
  };
}

function resolveLocalized(value: LocalizedString, locale: string, defaultLocale: string): string {
  if (typeof value === 'string') return value;
  return pickLocale(value, locale) ?? value[defaultLocale] ?? Object.values(value)[0] ?? '';
}

export default function pluginLocalSearch(
  context: LoadContext,
  options: PluginOptions,
): Plugin<void> {
  const {i18n, siteConfig, baseUrl} = context;
  const locale = i18n.currentLocale;
  const localize = (value: LocalizedString) => resolveLocalized(value, locale, i18n.defaultLocale);

  const categories: (ResolvedCategory & {boost: number; priority: number})[] = options.categories.map((cat) => ({
    re: new RegExp(cat.match),
    label: localize(cat.label),
    boost: cat.boost ?? 1,
    priority: cat.priority ?? 0,
  }));
  const searchPagePath =
    options.searchPagePath === false ? null : `/${options.searchPagePath.replace(/^\/+|\/+$/g, '')}`;

  const defaultCategory = localize(options.defaultCategory);
  const isInternal = (url: string) => url.startsWith('/') && !url.startsWith('//');
  /** Chemin du site → URL de la locale courante ; une URL absolue est gardée telle quelle. */
  const localizeUrl = (url: string) => (isInternal(url) ? joinUrl(baseUrl, url) : url);
  const resolveEntry = (entry: CustomEntryOption): ResolvedEntry => {
    const target = localize(entry.url);
    const internal = isInternal(target);
    const keywords = Array.isArray(entry.keywords)
      ? entry.keywords
      : (entry.keywords && pickLocale(entry.keywords, locale)) ?? [];
    return {
      title: localize(entry.title),
      url: localizeUrl(target),
      description: entry.description ? localize(entry.description) : '',
      keywords,
      category: entry.category
        ? localize(entry.category)
        : (internal && categories.find((cat) => cat.re.test(target.split('#')[0]))?.label) || defaultCategory,
      priority: entry.priority ?? 1,
    };
  };

  const siteUrl = siteConfig.url.replace(/\/$/, '');
  const searchUrl = searchPagePath ? `${siteUrl}${joinUrl(baseUrl, searchPagePath)}?q={searchTerms}` : null;
  const openSearchPath = joinUrl(baseUrl, '/opensearch.xml');
  const openSearch = searchUrl && options.openSearch ? (options.openSearch === true ? {} : options.openSearch) : null;
  const searchAction = searchUrl && options.searchAction ? (options.searchAction === true ? {} : options.searchAction) : null;
  const uiMessage = (id: string) =>
    pickLocale(translations, locale)?.[id] ?? DEFAULT_MESSAGES[id];

  // Thème compilé en JavaScript pour le build ; sources TypeScript pour `swizzle --typescript`.
  const themePath = path.resolve(__dirname, 'theme');
  const typeScriptThemePath = path.resolve(__dirname, '..', 'theme');

  return {
    name: PLUGIN_NAME,

    getThemePath() {
      return themePath;
    },

    getTypeScriptThemePath() {
      return typeScriptThemePath;
    },

    getDefaultCodeTranslationMessages() {
      return pickLocale(translations, locale) ?? {};
    },

    getClientModules() {
      return [path.join(themePath, 'localSearch.css')];
    },

    injectHtmlTags() {
      const headTags = [];
      if (openSearch) {
        headTags.push({
          tagName: 'link',
          attributes: {
            rel: 'search',
            type: 'application/opensearchdescription+xml',
            title: openSearch.shortName ? localize(openSearch.shortName) : siteConfig.title,
            href: openSearchPath,
          },
        });
      }
      if (searchAction && searchUrl) {
        headTags.push({
          tagName: 'script',
          attributes: {type: 'application/ld+json'},
          innerHTML: searchActionJsonLd({
            id: searchAction.id ?? `${siteUrl}${baseUrl}#website`,
            url: `${siteUrl}${baseUrl}`,
            template: searchUrl,
          }),
        });
      }
      return {headTags};
    },

    async contentLoaded({actions}) {
      const globalData: LocalSearchGlobalData = {
        indexUrl: options.indexFileName,
        // Change à chaque build : sert à invalider le cache HTTP de l'index.
        buildId: Date.now().toString(36),
        locale,
        synonyms: options.synonyms,
        stopWords:
          pickLocale(options.stopWords, locale) ?? pickLocale(DEFAULT_STOP_WORDS, locale) ?? [],
        fuzzy: options.fuzzy,
        prefix: options.prefix,
        stemming: options.stemming,
        boost: options.boost,
        categoryBoosts: Object.fromEntries(categories.map((cat) => [cat.label, cat.boost])),
        categoryPriorities: Object.fromEntries(categories.map((cat) => [cat.label, cat.priority])),
        maxResults: options.maxResults,
        maxResultsPerPage: options.maxResultsPerPage,
        shortcuts: options.shortcuts,
        recentSearches: options.recentSearches,
        suggestions: options.suggestions.map((s) => ({label: localize(s.label), href: localizeUrl(localize(s.href))})),
        searchPagePath,
        storageKey: options.storageKey,
      };
      actions.setGlobalData(globalData);

      if (searchPagePath) {
        actions.addRoute({path: joinUrl(baseUrl, searchPagePath), component: '@theme/SearchPage', exact: true});
      }
    },

    async postBuild({outDir}) {
      const otherLocalePaths = i18n.locales
        .filter((l) => l !== locale)
        .map((l) => i18n.localeConfigs[l]?.path ?? l);

      const {pages, skipped} = buildIndex({
        outDir,
        otherLocalePaths,
        baseUrl,
        siteTitle: siteConfig.title,
        searchPagePath,
        categories,
        defaultCategory,
        options,
      });
      const custom = applyCustomEntries(
        pages,
        options.customEntries.filter((entry) => !entry.locales || entry.locales.includes(locale)).map(resolveEntry),
      );

      if (openSearch && searchUrl) {
        const favicon = siteConfig.favicon;
        fs.writeFileSync(
          path.join(outDir, 'opensearch.xml'),
          openSearchXml({
            shortName: openSearch.shortName ? localize(openSearch.shortName) : siteConfig.title,
            description: openSearch.description
              ? localize(openSearch.description)
              : uiMessage('localSearch.openSearch.description').replace('{siteName}', siteConfig.title),
            template: searchUrl,
            selfUrl: `${siteUrl}${openSearchPath}`,
            language: i18n.localeConfigs[locale]?.htmlLang ?? locale,
            icon: favicon ? (/^https?:/.test(favicon) ? favicon : `${siteUrl}${joinUrl(siteConfig.baseUrl, `/${favicon.replace(/^\//, '')}`)}`) : null,
          }),
        );
      }

      const index: SearchIndexFile = {v: 1, locale, pages};
      const target = path.join(outDir, options.indexFileName);
      fs.writeFileSync(target, JSON.stringify(index));
      const sections = pages.reduce((n, p) => n + p.s.length, 0);
      const kb = Math.round(fs.statSync(target).size / 1024);
      console.log(
        `[enhanced-local-search] (${locale}) indexed ${pages.length - custom} pages, ${sections} sections, ${custom} custom entries (${kb} KB), skipped ${skipped}.`,
      );
    },
  };
}
