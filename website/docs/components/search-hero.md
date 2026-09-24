---
title: "SearchHero: large search bar"
sidebar_position: 2
sidebar_label: "SearchHero"
---

A big, ChatGPT-style search bar to put at the top of a page: a landing page, the documentation home, a help center. It has a title, a subtitle, suggestion chips and a round submit button.

In an MDX page:

```mdx
---
title: Help center
---

import SearchHero from '@theme/SearchHero';

<SearchHero
  title="How can we help?"
  subtitle="Search the guides, features and FAQ."
  suggestions={['Getting started', 'Configuration', 'Troubleshooting']}
/>
```

In a React page:

```jsx
import Layout from '@theme/Layout';
import SearchHero from '@theme/SearchHero';

export default function Help() {
  return (
    <Layout title="Help center">
      <main className="container margin-vert--xl">
        <SearchHero
          title="How can we help?"
          suggestions={['Getting started', 'Configuration']}
        />
      </main>
    </Layout>
  );
}
```

It works in two modes:

- **Modal** (default): typing, pressing Enter or clicking a chip opens the search modal with the text already filled in.
- **Inline** (`inline`): results are listed right below the bar, with the same keyboard navigation. Add `syncUrl` to keep the query in the URL (`?q=`), so the page can be shared and reloaded with its results.

```jsx
<SearchHero inline syncUrl title="Search the docs" />
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | none | Heading above the bar, rendered as an `h1`. |
| `subtitle` | `ReactNode` | none | Text between the heading and the bar. |
| `placeholder` | `string` | translated "Search the documentation…" | Placeholder of the field. |
| `suggestions` | `string[]` | `[]` | Queries shown as clickable chips under the bar. |
| `inline` | `boolean` | `false` | Show results below the bar instead of opening the modal. |
| `syncUrl` | `boolean` | `false` | With `inline`, keep the query in the `?q=` URL parameter. |
| `initialQuery` | `string` | `''` | Query filled in on first render. |
| `showSuggestions` | `boolean` | same as `inline` | With `inline`, list the plugin's `suggestions` option while the field is empty. |
| `context` | `string` | current page | Category listed first in the results, by `id` or label. See [Contextual priority](../contextual-priority.md). |
| `className` | `string` | none | Extra class on the root element. |

Its look is driven by `--lsearch-hero-radius`, `--lsearch-hero-bg`, `--lsearch-hero-shadow` and `--lsearch-accent` (see [Colors and sizes](../customization/colors-and-sizes.md)).
