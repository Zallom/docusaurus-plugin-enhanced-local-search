---
slug: how-the-ranking-works
title: How the ranking works
tags: [engine]
---

A search result list is only useful if the page you want comes first. Here is how we decide the order, and why a single relevance score was not enough.

<!-- truncate -->

## The problem with one score

The engine underneath, [MiniSearch](https://github.com/lucaong/minisearch), computes a BM25 score: rare words weigh more than common ones. That is great for long documents, but on a documentation site it produced odd orders. Typing "raid", a page mentioning "raidmode" once (a rare word, matched by prefix) could beat the page titled "Raid mode".

## Criteria, one after the other

So we sort results criterion after criterion, like a tie-breaking ladder. A criterion only matters when all the previous ones are equal:

1. **Category priority**, with the category of the current page first ([contextual priority](/docs/contextual-priority)).
2. **Number of query words found.**
3. **Words found without typos.**
4. **Priority of custom entries**, so a quick link beats a page that matches just as well.
5. **Where the words are**: page title, then section heading, then text.
6. **Exact words** before prefixes and typos. Synonyms count as exact.
7. **Precision**: a short title fully covered by the query beats a longer one.
8. **The BM25 score**, only to break the last ties.

## Forgiving typos without noise

Typo tolerance is a fraction of the word length, so short words stay strict. When nothing matches, a second, wider pass runs, which catches swapped letters like "captcah". And when a query still returns nothing, the modal suggests the closest spelling found in your site.

See [Ranking](/docs/ranking) for the reference.
