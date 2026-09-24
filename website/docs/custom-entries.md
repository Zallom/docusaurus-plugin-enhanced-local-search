---
title: "Custom entries"
sidebar_position: 5
---

Some things people search for are not pages of your site: the link to install your product, a pricing page you do not index, your community server. `customEntries` adds them to the index, and can also teach the search new words for an existing page.

```js
customEntries: [
  {
    title: {en: 'Add the bot', fr: 'Ajouter le bot'},
    url: {en: 'https://example.com/en/invite', fr: 'https://example.com/invite'},
    description: {en: 'Invite the bot to your server.', fr: 'Invitez le bot sur votre serveur.'},
    keywords: {en: ['invite', 'install'], fr: ['inviter', 'installer']},
    category: {en: 'Quick links', fr: 'Liens rapides'},
    priority: 2,
  },
  {
    // Points to an indexed page: no new result, the page gets the keywords.
    title: 'Installation',
    url: '/docs/setup',
    keywords: ['getting started', 'onboarding'],
  },
],
```

With this configuration, typing "add" (or "ajouter" on the French site) lists "Add the bot" first.

| Field | Type | Description |
|---|---|---|
| `title` | string or per-locale map | Title of the result. Required. |
| `url` | string or per-locale map | Site path (`/docs/setup`, the locale prefix is added for you) or absolute URL. Absolute URLs open in a new tab. Required. |
| `description` | string or per-locale map | Text shown under the title. |
| `keywords` | `string[]` or `{locale: string[]}` | Extra words that find the entry. A plain list applies to every locale; with a map, a locale without a list gets none. |
| `category` | string or per-locale map | Group of the result. Defaults to the category matching `url`, then `defaultCategory`. |
| `priority` | `0` to `9`, default `1` | Ranks the entry above pages that match the query just as well. It never lifts an entry above a result matching more of the query words. |
| `locales` | `string[]` | Locales where the entry exists. All by default. |
| `standalone` | `boolean` | Keep the entry as a separate result even when `url` is an indexed page. Default `false`: the page gets the keywords instead. |

Only the title and the keywords of an entry are searched: its description is shown under the title but does not match queries, so a description mentioning your product name does not surface the entry on every search.

When `url` is a page that is already indexed, no duplicate is created: the page gets the keywords (and the entry's title, if different) and the priority. Set `standalone: true` to keep the entry as its own result instead, for example a "Pricing" quick link on top of the results while the pricing page itself is indexed in its own category.

Custom entries are added after `ignorePatterns` is applied, so they can point to pages you keep out of the index.
