---
title: "Options"
sidebar_position: 4
---

```js
plugins: [
  [
    'docusaurus-plugin-enhanced-local-search',
    {
      categories: [
        {match: '^/docs(/|$)', label: {en: 'Documentation', fr: 'Documentation'}},
        {match: '^/blog(/|$)', label: 'Blog', boost: 0.8},
      ],
      synonyms: [['dm', 'direct message', 'private message']],
      searchPagePath: 'search',
    },
  ],
],
```

| Option | Default | Description |
|---|---|---|
| `categories` | Docs, Blog | Result groups. `match` is a regex tested on the page path (without locale prefix); a category without `match` only groups [custom entries](./custom-entries.md). `label` is a string or a per-locale map. `id` is a stable name for the `context` prop (defaults to the label). `boost` weighs the category to break ties. `priority` (default `0`) is the first ranking criterion: a category with a lower priority always comes after the others, for example `priority: -1` to always list blog posts last. |
| `contextualPriority` | `true` | Lists first the category of the page where the search is opened. See [Contextual priority](./contextual-priority.md). |
| `defaultCategory` | `'Pages'` | Group of pages matching no category. |
| `synonyms` | `[]` | Groups of equivalent terms. Multi-word entries are supported. |
| `stopWords` | built-in per locale | `{locale: [...]}`. Words ignored in queries and in the index, so natural-language questions work. A list replaces the built-in one for its locale. |
| `stemming` | `true` | Light stemming (en, fr, de, es, pt, it, nl): `activate`, `activated` and `activates` match each other. Other languages rely on prefix search and typo tolerance. |
| `fuzzy` | `0.2` | Typo tolerance, as a fraction of the word length. A wider second pass runs when nothing matches. |
| `prefix` | `true` | Match word beginnings while typing. |
| `boost` | `{title: 4, heading: 2.5, content: 1}` | Field weights, used to break ties. |
| `maxResults` | `20` | Maximum number of results. |
| `maxResultsPerPage` | `3` | Maximum sections shown per page. |
| `shortcuts` | `['mod+k', '/']` | Keyboard shortcuts. `mod` is ⌘ on macOS and Ctrl elsewhere. Shortcuts without modifier are ignored while typing in a field. |
| `recentSearches` | `5` | Number of recent results kept in the browser. `0` disables them. |
| `suggestions` | `[]` | `[{label, href}]` shown when the search field is empty, in the modal and on the search page. `label` and `href` can be per-locale maps; a site path (`/docs/setup`) gets the locale prefix. |
| `customEntries` | `[]` | Results added by hand, or extra keywords on existing pages. See [Custom entries](./custom-entries.md). |
| `searchPagePath` | `false` | Adds a search page at this path (for example `'search'`). |
| `openSearch` | `true` | With `searchPagePath`, publishes `opensearch.xml` and links it from every page. `{shortName, description}` (strings or per-locale maps) override the site title and the default description. |
| `searchAction` | `false` | With `searchPagePath`, adds a schema.org `WebSite` node with a `SearchAction`. `{id}` sets its `@id`, to merge it with a `WebSite` node you already publish. |
| `ignorePatterns` | `[]` | Regexes on page paths to exclude from the index. |
| `contentSelectors` | `['.theme-doc-markdown', 'article .markdown', 'article', 'main']` | Where the page content is read: the first selector matching exactly one element wins (a selector matching several elements, like cards in `<article>` tags, is skipped). |
| `excludeSelectors` | navigation, buttons, doc cards… | Elements removed before indexing. Replaces the default list. |
| `headingLevels` | `[2, 3]` | Headings that start a new section. |
| `maxSectionLength` | `1500` | Characters kept per section. |
| `onlyCanonical` | `true` | Skip pages whose canonical URL points to another page. |
| `respectNoindex` | `true` | Skip pages with `<meta name="robots" content="noindex">`. |
| `indexFileName` | `'search-index.json'` | Name of the generated index file. |
| `storageKey` | `'local-search'` | Prefix of the keys stored in `localStorage`. Recent searches are kept per locale, under `<storageKey>:<locale>:recent`. |
