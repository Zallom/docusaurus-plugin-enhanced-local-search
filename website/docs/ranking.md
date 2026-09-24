---
title: "Ranking"
sidebar_position: 9
---

Results are ranked criterion after criterion, like Algolia, rather than by a single additive score:

1. category priority, when set (the [current category](./contextual-priority.md) first);
2. number of query words found;
3. words found without typos;
4. `priority` of [custom entries](./custom-entries.md);
5. where they are found: page title, then section heading, then text;
6. exact words before prefixes and typos (synonyms count as exact);
7. precision: a title fully covered by the query ranks above a longer one;
8. a BM25 relevance score, only to break ties.

When no page contains every word, the search falls back to pages containing most of them and says so. When nothing matches, it suggests the closest spelling found in your site.
