# Changelog

## 1.1.0

- **Contextual priority**: the category of the page where the search is opened is listed first (`contextualPriority`, on by default). `SearchHero`, `SearchInput` and `openSearch()` accept a `context` to choose it.
- Categories accept an `id`, and `match` is now optional: a category without `match` groups custom entries and can keep them on top.
- Custom entries are found by their title and keywords only; their description is displayed but no longer matches queries.
- Fixed the published types of `tokenize`, `highlight` and `snippet` in `@theme/SearchEngine`.

## 1.0.0

First release: ⌘K modal, navbar and footer bar, hero search bar, search page, typo-tolerant ranking, custom entries, OpenSearch and `SearchAction`, UI in the 30 languages supported by Discord.
