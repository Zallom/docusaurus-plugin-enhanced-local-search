import {parse, NodeType, type HTMLElement, type Node} from 'node-html-parser';
import type {IndexedSection} from '../types';

export interface ExtractOptions {
  contentSelectors: string[];
  excludeSelectors: string[];
  headingLevels: number[];
  maxSectionLength: number;
  /** Titre du site, retiré du `<title>` quand la page n'a pas de `<h1>`. */
  siteTitle: string;
}

export interface ExtractedPage {
  title: string;
  description: string;
  breadcrumbs: string[];
  sections: IndexedSection[];
  canonical: string | null;
  noindex: boolean;
  htmlClass: string;
}

// Éléments dont le contenu est séparé du voisin : sans espace entre eux, deux
// paragraphes collés formeraient des mots inexistants.
const BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'br', 'dd', 'details', 'div', 'dl', 'dt', 'figcaption',
  'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'ol', 'p', 'pre',
  'section', 'summary', 'table', 'td', 'th', 'tr', 'ul',
]);

const clean = (text: string) => text.replace(/[​-‍﻿]/g, '').replace(/\s+/g, ' ').trim();

export function extractPage(html: string, options: ExtractOptions): ExtractedPage | null {
  const root = parse(html, {
    comment: false,
    // Contenu ignoré pour les scripts et styles ; `pre` est analysé normalement
    // pour que les blocs de code donnent leur texte et non leur balisage.
    blockTextElements: {script: false, noscript: false, style: false},
  });

  const htmlClass = root.querySelector('html')?.getAttribute('class') ?? '';
  const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '';
  const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;
  const description = clean(root.querySelector('meta[name="description"]')?.getAttribute('content') ?? '');

  const scope = root.querySelector('main') ?? root;
  const h1 = scope.querySelector('h1');
  const titleTag = clean(root.querySelector('title')?.text ?? '');
  const suffix = new RegExp(`\\s*[|·–-]\\s*${options.siteTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
  const title = clean(h1?.text ?? '') || titleTag.replace(suffix, '');
  if (!title) return null;

  const breadcrumbs = root
    .querySelectorAll('.theme-doc-breadcrumbs .breadcrumbs__item')
    .map((item) => clean(item.text))
    .filter((text) => text && text !== title);

  const content = options.contentSelectors.map((sel) => root.querySelector(sel)).find(Boolean) as
    | HTMLElement
    | undefined;
  if (!content) return null;

  for (const selector of [...options.excludeSelectors, 'h1']) {
    for (const el of content.querySelectorAll(selector)) el.remove();
  }

  const headingTags = new Set(options.headingLevels.map((level) => `h${level}`));
  const sections: IndexedSection[] = [];
  let current: {a: string | null; h: string | null; parts: string[]} = {a: null, h: null, parts: []};

  const flush = () => {
    const text = clean(current.parts.join(''));
    if (text || current.h) {
      sections.push({a: current.a, h: current.h, x: text.slice(0, options.maxSectionLength)});
    }
  };

  const walk = (node: Node) => {
    if (node.nodeType === NodeType.TEXT_NODE) {
      current.parts.push(node.text);
      return;
    }
    if (node.nodeType !== NodeType.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = (el.rawTagName ?? '').toLowerCase();
    if (headingTags.has(tag)) {
      flush();
      current = {a: el.getAttribute('id') ?? null, h: clean(el.text) || null, parts: []};
      return;
    }
    const block = BLOCK_TAGS.has(tag);
    if (block) current.parts.push(' ');
    for (const child of el.childNodes) walk(child);
    if (block) current.parts.push(' ');
  };

  for (const child of content.childNodes) walk(child);
  flush();

  return {
    title,
    description,
    breadcrumbs,
    sections,
    canonical,
    noindex: /\bnoindex\b/i.test(robots),
    htmlClass,
  };
}
