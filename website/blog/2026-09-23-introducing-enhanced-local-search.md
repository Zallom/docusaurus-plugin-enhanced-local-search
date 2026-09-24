---
slug: introducing-enhanced-local-search
title: Introducing Enhanced Local Search
tags: [release]
---

We built this plugin for the documentation of [RaidProtect](https://raidprotect.bot/en), a Discord protection bot translated into five languages. We wanted the feel of a hosted search (a ⌘K modal, forgiving typos, the right page first) without sending our content to a third-party service.

<!-- truncate -->

## Why another local search

Local search plugins for Docusaurus already exist, and they work. What we missed was mostly about relevance and polish:

- **Ranking by successive criteria.** A plain relevance score lets a rare word found by prefix beat a common word typed exactly. We rank by words found, then typos, then where the words are (title, heading, text), and only use the score to break ties.
- **Synonyms and custom entries.** "DM" should find "direct message", and "add" should find the invite link, even though no page is titled that way.
- **Context.** A search opened from a blog post should list blog posts first.
- **Every language.** The interface ships in 30 languages, and Chinese, Japanese and Thai are split into words with `Intl.Segmenter`, without native dependencies.

## What you get

A ⌘K modal, a mini bar for the navbar or the footer, a large hero bar for a landing page, and a `/search` page that answers to `?q=`. Everything is swizzlable and themed with CSS variables that default to your Infima colors.

Head to [Getting started](/docs/getting-started) to install it.
