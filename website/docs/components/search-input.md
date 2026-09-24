---
title: "SearchInput: mini search bar"
sidebar_position: 3
sidebar_label: "SearchInput"
---

A compact bar with the keyboard shortcut displayed (⌘ K on macOS, Ctrl K elsewhere). A click opens the modal; typing directly in the bar opens the modal with what was typed. The index starts loading as soon as the bar is hovered or focused.

To add it to the footer, swizzle the footer and drop the component in:

```jsx
import SearchInput from '@theme/SearchInput';

<SearchInput placeholder="Search the docs" showShortcut={false} />
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` | translated "Search" | Placeholder of the field. |
| `showShortcut` | `boolean` | `true` | Display the keyboard shortcut. |
| `variant` | `'default' \| 'navbar'` | `'default'` | `navbar` collapses to an icon button below 997 px. |
| `context` | `string` | current page | Category listed first in the results, by `id` or label. See [Contextual priority](../contextual-priority.md). |
| `className` | `string` | none | Extra class on the root element. |

Its width, height and radius come from `--lsearch-bar-width`, `--lsearch-bar-height` and `--lsearch-bar-radius`.
