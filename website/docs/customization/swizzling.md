---
title: "Swizzling"
sidebar_position: 2
---

```bash
npm run swizzle docusaurus-plugin-enhanced-local-search SearchResult -- --wrap
```

Add `--typescript` to get the TypeScript source, `--javascript` for plain JSX.

Safe to eject or wrap: `SearchBar`, `SearchInput`, `SearchHero`, `SearchPage`, `SearchResult`, `SearchResults`, `SearchIcons`. `SearchModal` and `SearchModalHost` are safe to wrap.

Components import each other through `@theme/`, so a swizzled component is picked up everywhere: a custom `SearchResult` is used by the modal, the hero and the search page.
