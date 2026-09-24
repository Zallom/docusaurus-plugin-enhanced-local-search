import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type {PluginOptions as SearchOptions} from 'docusaurus-plugin-enhanced-local-search';

const repo = 'https://github.com/Zallom/docusaurus-plugin-enhanced-local-search';
const npm = 'https://www.npmjs.com/package/docusaurus-plugin-enhanced-local-search';
const links = {en: 'Links', fr: 'Liens', ja: 'リンク'};

const config: Config = {
  title: 'Enhanced Local Search',
  tagline: 'Local / Offline, typo-tolerant search for Docusaurus v3',
  favicon: 'img/favicon.svg',
  url: 'https://zallom.github.io',
  baseUrl: '/docusaurus-plugin-enhanced-local-search/',
  organizationName: 'Zallom',
  projectName: 'docusaurus-plugin-enhanced-local-search',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw'}},

  // Japanese shows the word segmentation of languages written without spaces.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'ja'],
    localeConfigs: {
      en: {label: 'English'},
      fr: {label: 'Français'},
      ja: {label: '日本語'},
    },
  },

  plugins: [
    [
      'docusaurus-plugin-enhanced-local-search',
      {
        categories: [
          {id: 'docs', match: '^/docs(/|$)', label: {en: 'Documentation', fr: 'Documentation', ja: 'ドキュメント'}, priority: 2},
          {id: 'blog', match: '^/blog(/|$)', label: {en: 'Blog', fr: 'Blog', ja: 'ブログ'}, priority: 1},
          {id: 'links', label: links, priority: 10},
        ],
        defaultCategory: {en: 'Pages', fr: 'Pages', ja: 'ページ'},
        synonyms: [
          ['cmd k', 'ctrl k', 'shortcut', 'keyboard shortcut'],
          ['hero', 'large search bar', 'big search bar'],
          ['swizzle', 'override', 'eject'],
          ['color', 'colour', 'theme'],
        ],
        customEntries: [
          {
            title: {en: 'GitHub repository', fr: 'Dépôt GitHub', ja: 'GitHub リポジトリ'},
            url: repo,
            description: {en: 'Source code, issues and releases.', fr: 'Code source, tickets et versions.', ja: 'ソースコード、Issue、リリース。'},
            keywords: {en: ['source', 'code', 'issue', 'bug', 'contribute'], fr: ['source', 'code', 'ticket', 'bug', 'contribuer'], ja: ['ソース', 'コード', 'バグ']},
            category: links,
            priority: 2,
          },
          {
            title: {en: 'npm package', fr: 'Paquet npm', ja: 'npm パッケージ'},
            url: npm,
            description: {en: 'Install the plugin from npm.', fr: 'Installer le plugin depuis npm.', ja: 'npm からプラグインをインストール。'},
            keywords: {en: ['install', 'download', 'npm'], fr: ['installer', 'télécharger', 'npm'], ja: ['インストール', 'npm']},
            category: links,
          },
          {
            title: {en: 'Changelog', fr: 'Journal des modifications', ja: '変更履歴'},
            url: `${repo}/blob/main/CHANGELOG.md`,
            keywords: {en: ['release', 'version', 'what is new'], fr: ['version', 'nouveautés'], ja: ['リリース', 'バージョン']},
            category: links,
          },
        ],
        suggestions: [
          {label: {en: 'Getting started', fr: 'Premiers pas', ja: 'はじめに'}, href: '/docs/getting-started'},
          {label: {en: 'Options', fr: 'Options', ja: 'オプション'}, href: '/docs/options'},
          {label: {en: 'Custom entries', fr: 'Entrées manuelles', ja: 'カスタムエントリ'}, href: '/docs/custom-entries'},
          {label: {en: 'Contextual priority', fr: 'Priorité contextuelle', ja: 'コンテキスト優先度'}, href: '/docs/contextual-priority'},
        ],
        searchPagePath: 'search',
        searchAction: true,
      } satisfies Partial<SearchOptions>,
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: `${repo}/edit/main/website/`,
        },
        blog: {
          showReadingTime: true,
          editUrl: `${repo}/edit/main/website/`,
          onInlineAuthors: 'ignore',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {customCss: './src/css/custom.css'},
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {respectPrefersColorScheme: true},
    navbar: {
      title: 'Enhanced Local Search',
      logo: {alt: 'Enhanced Local Search', src: 'img/logo.svg'},
      items: [
        {type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs'},
        {to: '/blog', label: 'Blog', position: 'left'},
        {type: 'search', position: 'right'},
        {type: 'localeDropdown', position: 'right'},
        {href: repo, label: 'GitHub', position: 'right'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Getting started', to: '/docs/getting-started'},
            {label: 'Options', to: '/docs/options'},
            {label: 'Components', to: '/docs/components/search-hero'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'GitHub', href: repo},
            {label: 'npm', href: npm},
            {label: 'Changelog', href: `${repo}/blob/main/CHANGELOG.md`},
          ],
        },
        {
          title: 'Showcase',
          items: [
            {label: 'RaidProtect', href: 'https://raidprotect.bot'},
            {label: 'Discord FR', href: 'https://dfr.gg'},
          ],
        },
      ],
      copyright: `MIT licensed. Built with Docusaurus and this plugin.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
