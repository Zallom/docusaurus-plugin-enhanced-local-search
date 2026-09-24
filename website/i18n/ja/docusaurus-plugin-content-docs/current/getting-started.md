---
title: "インストール"
sidebar_position: 2
---

import InstallCommand from '@site/src/components/InstallCommand';

## 動作環境

- Docusaurus 3
- React 18 または 19
- Node.js 18 以降

## インストール

<InstallCommand />

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

これで完了です。サイトをビルド（`docusaurus build`）して配信（`docusaurus serve`）すると、ナビゲーションバーに検索バーが表示され、⌘K でモーダルが開きます。

> インデックスはビルド時に、最終的な HTML から作成されます。`docusaurus start` では、インデックスはビルドしたサイトでのみ利用できるとモーダルに表示されます。
