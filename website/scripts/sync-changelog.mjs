// Copies the repository CHANGELOG.md into the /changelog page before each start or build.
import {readFileSync, writeFileSync} from 'node:fs';

const source = readFileSync(new URL('../../CHANGELOG.md', import.meta.url), 'utf8');

// Docusaurus reads .md files as MDX: outside code, "<" and "{" would start JSX.
function escapeMdx(markdown) {
  return markdown
    .split(/(```[\s\S]*?```)/)
    .map((block, i) =>
      i % 2
        ? block
        : block
            .split(/(`[^`\n]*`)/)
            .map((part, j) => (j % 2 ? part : part.replace(/</g, '&lt;').replace(/{/g, '\\{')))
            .join(''),
    )
    .join('');
}

const body = escapeMdx(source.replace(/^# Changelog\s*\n/, ''));

writeFileSync(
  new URL('../src/pages/changelog.md', import.meta.url),
  `---
title: Changelog
description: Every release of docusaurus-plugin-enhanced-local-search.
---

# Changelog

${body}`,
);
