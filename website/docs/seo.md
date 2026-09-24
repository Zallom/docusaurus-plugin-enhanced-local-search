---
title: "Search engines and browsers"
sidebar_position: 10
---

With `searchPagePath` set, the search page answers to the usual `?q=` parameter (`/search?q=captcha`), so any link, bookmark or tool can open a search.

- **OpenSearch** (on by default): each locale gets an `opensearch.xml` and every page links to it with `<link rel="search">`. Chrome and Firefox then offer to search your site from the address bar (type the domain, then Tab in Chrome).
- **`SearchAction`** (off by default): the schema.org action describing the search URL. Google no longer shows the sitelinks search box it was used for (since November 2024), but the markup stays valid for other consumers. If your site already publishes a `WebSite` node, pass its `@id` so both merge instead of competing.

The search page itself is marked `noindex`: search engines ask sites not to index internal search results. Neither feature changes your ranking; they make the search reachable from outside the page.
