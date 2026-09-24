---
title: "Limitations"
sidebar_position: 12
---

- The index only exists on a built site, not with `docusaurus start`.
- Chinese, Japanese and Thai are split into words with `Intl.Segmenter` (all current browsers). Older browsers fall back to one character per word, which still finds results but ranks them less finely.
- The search is lexical: it matches words, their variants and your synonyms, not meaning.
- Pages rendered only on the client (content fetched after load) are not indexed.
