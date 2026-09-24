---
title: "TypeScript"
sidebar_position: 11
---

The package ships its types, including the `@theme/Search*` modules. Importing the options type in your config makes them available to the rest of your site, and checks your options:

```ts
import type {PluginOptions as SearchOptions} from 'docusaurus-plugin-enhanced-local-search';

plugins: [
  ['docusaurus-plugin-enhanced-local-search', {searchPagePath: 'search'} satisfies Partial<SearchOptions>],
],
```

If your config does not import the plugin, add the types another way, for example with `import type {} from 'docusaurus-plugin-enhanced-local-search';` in any `.d.ts` or `.ts` file of your site. Without them, TypeScript does not know the `@theme/Search*` modules used by swizzled components.
