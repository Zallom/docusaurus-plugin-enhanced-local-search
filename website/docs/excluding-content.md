---
title: "Excluding content"
sidebar_position: 7
---

Add `data-search-ignore` to any element that should not be indexed: decorative mockups, call-to-action boxes, "related articles" lists.

```jsx
<aside data-search-ignore>…</aside>
```

For whole pages, use `ignorePatterns`.
