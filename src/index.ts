import fs from 'fs';
import path from 'path';
import type {LoadContext, Plugin} from '@docusaurus/types';
import {buildIndex, type ResolvedCategory} from './indexer/build';
import {DEFAULT_STOP_WORDS} from './stopwords';
import type {LocalizedString, LocalSearchGlobalData, PluginOptions, SearchIndexFile} from './types';

export {validateOptions} from './options';
export type {PluginOptions, SearchIndexFile, LocalSearchGlobalData} from './types';

const PLUGIN_NAME = 'docusaurus-plugin-local-search';

function resolveLocalized(value: LocalizedString, locale: string, defaultLocale: string): string {
  if (typeof value === 'string') return value;
  return value[locale] ?? value[locale.split('-')[0]] ?? value[defaultLocale] ?? Object.values(value)[0] ?? '';
}

export default function pluginLocalSearch(
  context: LoadContext,
  options: PluginOptions,
): Plugin<void> {
  const {i18n, siteConfig, baseUrl} = context;
  const locale = i18n.currentLocale;
  const localize = (value: LocalizedString) => resolveLocalized(value, locale, i18n.defaultLocale);

  const categories: (ResolvedCategory & {boost: number})[] = options.categories.map((cat) => ({
    re: new RegExp(cat.match),
    label: localize(cat.label),
    boost: cat.boost ?? 1,
  }));
  const searchPagePath =
    options.searchPagePath === false ? null : `/${options.searchPagePath.replace(/^\/+|\/+$/g, '')}`;

  return {
    name: PLUGIN_NAME,

    async contentLoaded({actions}) {
      const globalData: LocalSearchGlobalData = {
        indexUrl: options.indexFileName,
        // Change à chaque build : sert à invalider le cache HTTP de l'index.
        buildId: Date.now().toString(36),
        locale,
        synonyms: options.synonyms,
        stopWords:
          options.stopWords[locale] ?? DEFAULT_STOP_WORDS[locale] ?? DEFAULT_STOP_WORDS[locale.split('-')[0]] ?? [],
        fuzzy: options.fuzzy,
        prefix: options.prefix,
        boost: options.boost,
        categoryBoosts: Object.fromEntries(categories.map((cat) => [cat.label, cat.boost])),
        maxResults: options.maxResults,
        maxResultsPerPage: options.maxResultsPerPage,
        shortcuts: options.shortcuts,
        recentSearches: options.recentSearches,
        suggestions: options.suggestions.map((s) => ({label: localize(s.label), href: s.href})),
        searchPagePath,
        showBranding: options.showBranding,
        storageKey: options.storageKey,
      };
      actions.setGlobalData(globalData);
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
        defaultCategory: localize(options.defaultCategory),
        options,
      });

      const index: SearchIndexFile = {v: 1, locale, pages};
      const target = path.join(outDir, options.indexFileName);
      fs.writeFileSync(target, JSON.stringify(index));
      const sections = pages.reduce((n, p) => n + p.s.length, 0);
      const kb = Math.round(fs.statSync(target).size / 1024);
      console.log(
        `[local-search] (${locale}) ${pages.length} pages, ${sections} sections indexées (${kb} Ko), ${skipped} ignorées.`,
      );
    },
  };
}
