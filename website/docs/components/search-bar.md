---
title: "Navbar bar, search page and ⌘K"
sidebar_position: 4
sidebar_label: "SearchBar, page and ⌘K"
---

## `SearchBar`: navbar bar

Rendered by the navbar item `{type: 'search'}`. It is a `SearchInput` with the `navbar` variant. Swizzle it to change the navbar bar only, without touching the other bars.

## `SearchPage`: search page

Added by the `searchPagePath` option. It renders a `SearchHero` in inline mode with the query kept in the URL, and is excluded from search engines (`noindex`). While the field is empty, it lists the `suggestions` option. The modal links to it with "See all results".

## `SearchModalHost`: ⌘K without any bar

Every bar already includes it. Mount it on its own, for example in a swizzled `Root`, to get ⌘K on a site that shows no search bar.

## Opening the search from code

```js
import {openSearch, closeSearch} from '@theme/SearchStore';

openSearch('installation');
openSearch('ban', {context: 'docs'}); // documentation listed first
```
