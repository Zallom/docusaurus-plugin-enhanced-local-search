# Changelog

## 1.1.2

- Fixed: `--lsearch-*` variables redefined on `:root` in a site's CSS were ignored, because the plugin's defaults were loaded after it with the same specificity. The defaults now use `:where(:root)`, so the site always wins.

## 1.1.1

- New `--lsearch-text-offset` CSS variable: moves the text of the search fields down, for fonts whose letters sit above the middle of their box (the text then looks higher than the magnifier icon).

## 1.1.0

- **Contextual priority**: the category of the page where the search is opened is listed first (`contextualPriority`, on by default). `SearchHero`, `SearchInput` and `openSearch()` accept a `context` to choose it.
- Categories accept an `id`, and `match` is now optional: a category without `match` groups custom entries and can keep them on top.
- Custom entries are found by their title and keywords only; their description is displayed but no longer matches queries.
- Fixed the published types of `tokenize`, `highlight` and `snippet` in `@theme/SearchEngine`.

## 1.0.0

First release: ⌘K modal, navbar and footer bar, hero search bar, search page, typo-tolerant ranking, custom entries, OpenSearch and `SearchAction`, UI in the 30 languages supported by Discord.
