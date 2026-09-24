---
title: "Contextual priority"
sidebar_position: 6
---

A search opened from a blog post usually looks for blog posts; from the documentation, for documentation. With `contextualPriority` (on by default), the category of the current page goes first, and the others follow in their usual order.

```js
categories: [
  {id: 'docs', match: '^/docs(/|$)', label: 'Documentation', priority: 2},
  {id: 'glossary', match: '^/learn(/|$)', label: 'Glossary', priority: 1},
  {id: 'blog', match: '^/blog(/|$)', label: 'Blog', priority: 0},
  // No `match`: groups custom entries, and stays on top everywhere.
  {id: 'quick', label: 'Quick links', priority: 10},
],
```

| Search opened from | Order |
|---|---|
| a documentation page | Documentation, Glossary, Blog |
| a glossary page | Glossary, Documentation, Blog |
| a blog post | Blog, Documentation, Glossary |
| any other page | Documentation, Glossary, Blog |

The current category is placed just above the categories that have a `match`. A category without `match` and with a higher priority, like the quick links above, keeps its place.

To choose the category yourself, pass `context` (an `id` or a label) to `SearchHero`, `SearchInput` or `openSearch()`:

```jsx
<SearchHero context="glossary" />
```

Since priority is the first ranking criterion, a category listed first can fill the whole result list for common words. Raise `maxResults` if you want the other categories to show up more often.
