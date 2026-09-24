---
title: "Getting started"
sidebar_position: 2
---

## Requirements

- Docusaurus 3
- React 18 or 19
- Node.js 18 or later

## Installation

```bash
npm install docusaurus-plugin-enhanced-local-search
```

```js
// docusaurus.config.js
export default {
  plugins: ['docusaurus-plugin-enhanced-local-search'],
  themeConfig: {
    navbar: {
      items: [
        {type: 'search', position: 'right'},
      ],
    },
  },
};
```

That's it. Build the site (`docusaurus build`) and serve it (`docusaurus serve`): the navbar shows a search bar and ⌘K opens the modal.

> The index is generated at build time, from the final HTML. With `docusaurus start`, the modal explains that the index is only available on a built site.
