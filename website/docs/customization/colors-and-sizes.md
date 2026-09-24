---
title: "Colors and sizes"
sidebar_position: 1
---

The search uses your Infima variables by default. Override any of these in your CSS:

```css
:root {
  --lsearch-accent: var(--ifm-color-primary);
  --lsearch-text: var(--ifm-font-color-base);
  --lsearch-muted: var(--ifm-color-emphasis-600);
  --lsearch-border: var(--ifm-color-emphasis-200);
  --lsearch-radius: 14px;
  --lsearch-hit-radius: 10px;
  --lsearch-z-index: 1000;

  --lsearch-modal-width: 640px;
  --lsearch-modal-bg: var(--ifm-background-surface-color);
  --lsearch-overlay-bg: rgba(15, 16, 25, 0.45);
  --lsearch-input-height: 58px;

  --lsearch-hit-bg: var(--ifm-color-emphasis-100);
  --lsearch-hit-active-bg: var(--lsearch-accent);
  --lsearch-hit-active-text: #fff;
  --lsearch-mark-bg: color-mix(in srgb, var(--lsearch-accent) 24%, transparent);

  --lsearch-bar-bg: var(--ifm-color-emphasis-100);
  --lsearch-bar-radius: 999px;
  --lsearch-bar-height: 36px;
  --lsearch-bar-width: 12rem;

  /* Moves the text of the fields down, for fonts whose letters sit above
   * the middle of their box (try 1px if the text looks higher than the icon). */
  --lsearch-text-offset: 0px;

  --lsearch-hero-radius: 28px;
  --lsearch-hero-bg: var(--ifm-background-surface-color);
  --lsearch-hero-shadow: 0 12px 48px -16px rgba(0, 0, 0, 0.28), 0 0 0 1px var(--lsearch-border);
}
```
