import {Joi} from '@docusaurus/utils-validation';
import type {OptionValidationContext} from '@docusaurus/types';
import type {PluginOptions} from './types';

const localized = Joi.alternatives().try(Joi.string(), Joi.object().pattern(Joi.string(), Joi.string()));

export const DEFAULT_OPTIONS: PluginOptions = {
  indexFileName: 'search-index.json',
  ignorePatterns: [],
  onlyCanonical: true,
  respectNoindex: true,
  contentSelectors: ['.theme-doc-markdown', 'article .markdown', 'article', 'main'],
  excludeSelectors: [
    '[data-search-ignore]',
    '.hash-link',
    // Cartes des pages de catégorie (DocCardList) : elles répètent chaque page listée.
    '.theme-doc-card-container',
    'script',
    'style',
    'noscript',
    'svg',
    'button',
    'nav',
    '.theme-doc-toc-mobile',
    '.theme-edit-this-page',
    '.pagination-nav',
    '.theme-doc-footer',
  ],
  headingLevels: [2, 3],
  maxSectionLength: 1500,
  categories: [
    {match: '^/docs(/|$)', label: 'Docs'},
    {match: '^/blog(/|$)', label: 'Blog'},
  ],
  defaultCategory: 'Pages',
  synonyms: [],
  stopWords: {},
  fuzzy: 0.2,
  prefix: true,
  stemming: true,
  boost: {title: 4, heading: 2.5, content: 1},
  maxResults: 20,
  maxResultsPerPage: 3,
  shortcuts: ['mod+k', '/'],
  recentSearches: 5,
  suggestions: [],
  customEntries: [],
  contextualPriority: true,
  openSearch: true,
  searchAction: false,
  searchPagePath: false,
  storageKey: 'local-search',
};

const schema = Joi.object<PluginOptions>({
  indexFileName: Joi.string().default(DEFAULT_OPTIONS.indexFileName),
  ignorePatterns: Joi.array().items(Joi.string()).default(DEFAULT_OPTIONS.ignorePatterns),
  onlyCanonical: Joi.boolean().default(DEFAULT_OPTIONS.onlyCanonical),
  respectNoindex: Joi.boolean().default(DEFAULT_OPTIONS.respectNoindex),
  contentSelectors: Joi.array().items(Joi.string()).min(1).default(DEFAULT_OPTIONS.contentSelectors),
  excludeSelectors: Joi.array().items(Joi.string()).default(DEFAULT_OPTIONS.excludeSelectors),
  headingLevels: Joi.array().items(Joi.number().integer().min(2).max(6)).min(1).default(DEFAULT_OPTIONS.headingLevels),
  maxSectionLength: Joi.number().integer().min(100).default(DEFAULT_OPTIONS.maxSectionLength),
  categories: Joi.array()
    .items(
      Joi.object({
        id: Joi.string(),
        match: Joi.string(),
        label: localized.required(),
        boost: Joi.number().min(0),
        priority: Joi.number(),
      }),
    )
    .default(DEFAULT_OPTIONS.categories),
  defaultCategory: localized.default(DEFAULT_OPTIONS.defaultCategory),
  synonyms: Joi.array().items(Joi.array().items(Joi.string()).min(2)).default(DEFAULT_OPTIONS.synonyms),
  stopWords: Joi.object().pattern(Joi.string(), Joi.array().items(Joi.string())).default(DEFAULT_OPTIONS.stopWords),
  fuzzy: Joi.number().min(0).max(0.5).default(DEFAULT_OPTIONS.fuzzy),
  prefix: Joi.boolean().default(DEFAULT_OPTIONS.prefix),
  stemming: Joi.boolean().default(DEFAULT_OPTIONS.stemming),
  boost: Joi.object({
    title: Joi.number().min(0).default(DEFAULT_OPTIONS.boost.title),
    heading: Joi.number().min(0).default(DEFAULT_OPTIONS.boost.heading),
    content: Joi.number().min(0).default(DEFAULT_OPTIONS.boost.content),
  }).default(DEFAULT_OPTIONS.boost),
  maxResults: Joi.number().integer().min(1).default(DEFAULT_OPTIONS.maxResults),
  maxResultsPerPage: Joi.number().integer().min(1).default(DEFAULT_OPTIONS.maxResultsPerPage),
  shortcuts: Joi.array().items(Joi.string()).default(DEFAULT_OPTIONS.shortcuts),
  recentSearches: Joi.number().integer().min(0).default(DEFAULT_OPTIONS.recentSearches),
  suggestions: Joi.array()
    .items(Joi.object({label: localized.required(), href: localized.required()}))
    .default(DEFAULT_OPTIONS.suggestions),
  customEntries: Joi.array()
    .items(
      Joi.object({
        title: localized.required(),
        url: localized.required(),
        description: localized,
        keywords: Joi.alternatives().try(
          Joi.array().items(Joi.string()),
          Joi.object().pattern(Joi.string(), Joi.array().items(Joi.string())),
        ),
        category: localized,
        priority: Joi.number().min(0).max(9),
        locales: Joi.array().items(Joi.string()),
        standalone: Joi.boolean(),
      }),
    )
    .default(DEFAULT_OPTIONS.customEntries),
  contextualPriority: Joi.boolean().default(DEFAULT_OPTIONS.contextualPriority),
  openSearch: Joi.alternatives()
    .try(Joi.boolean(), Joi.object({shortName: localized, description: localized}))
    .default(DEFAULT_OPTIONS.openSearch),
  searchAction: Joi.alternatives()
    .try(Joi.boolean(), Joi.object({id: Joi.string()}))
    .default(DEFAULT_OPTIONS.searchAction),
  searchPagePath: Joi.alternatives().try(Joi.string(), Joi.boolean().valid(false)).default(DEFAULT_OPTIONS.searchPagePath),
  storageKey: Joi.string().default(DEFAULT_OPTIONS.storageKey),
});

export function validateOptions({
  validate,
  options,
}: OptionValidationContext<Partial<PluginOptions>, PluginOptions>): PluginOptions {
  return validate(schema, options);
}
