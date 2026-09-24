import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Translate, {translate} from '@docusaurus/Translate';
import CodeBlock from '@theme/CodeBlock';
import SearchHero from '@theme/SearchHero';
import styles from './index.module.css';

function getFeatures() {
  return [
  {
    title: translate({id: 'home.feature.modal.title', message: '⌘K modal'}),
    text: translate({
      id: 'home.feature.modal.text',
      message: 'Grouped results, highlighted snippets, keyboard navigation, recent searches and suggestions.',
    }),
  },
  {
    title: translate({id: 'home.feature.typos.title', message: 'Typo tolerant'}),
    text: translate({
      id: 'home.feature.typos.text',
      message: 'Prefix search while typing, typo tolerance, synonyms, light stemming and stop words per language.',
    }),
  },
  {
    title: translate({id: 'home.feature.ranking.title', message: 'Ranked by criteria'}),
    text: translate({
      id: 'home.feature.ranking.text',
      message: 'Words found, typos, title before heading before text: the best page comes first, not the longest.',
    }),
  },
  {
    title: translate({id: 'home.feature.context.title', message: 'Context aware'}),
    text: translate({
      id: 'home.feature.context.text',
      message: 'A search opened from the blog lists blog posts first. Quick links stay on top when you need them.',
    }),
  },
  {
    title: translate({id: 'home.feature.i18n.title', message: '30 UI languages'}),
    text: translate({
      id: 'home.feature.i18n.text',
      message: 'One index per locale, and word segmentation for Chinese, Japanese and Thai.',
    }),
  },
  {
    title: translate({id: 'home.feature.offline.title', message: 'Fully local'}),
    text: translate({
      id: 'home.feature.offline.text',
      message: 'Built from your HTML at build time. No external service, no API key, no crawler.',
    }),
  },
  ];
}

export default function Home(): ReactNode {
  const features = getFeatures();
  return (
    <Layout
      title={translate({id: 'home.title', message: 'Local search for Docusaurus'})}
      description={translate({
        id: 'home.description',
        message: 'Local / Offline, typo-tolerant search for Docusaurus v3: ⌘K modal, hero search bar, synonyms and 30 UI languages.',
      })}>
      <main>
        <section className={styles.hero}>
          <div className="container">
            <SearchHero
              title={<Translate id="home.hero.title">Search your Docusaurus site, instantly</Translate>}
              subtitle={
                <Translate id="home.hero.subtitle">
                  Local / Offline, typo-tolerant search. Try it: this whole site is the demo.
                </Translate>
              }
              placeholder={translate({id: 'home.hero.placeholder', message: 'Try “cmd k”, “swizzle” or “custom entries”…'})}
              suggestions={[
                translate({id: 'home.hero.chip1', message: 'getting started'}),
                translate({id: 'home.hero.chip2', message: 'synonyms'}),
                translate({id: 'home.hero.chip3', message: 'colors'}),
                translate({id: 'home.hero.chip4', message: 'ranking'}),
              ]}
            />
            <div className={styles.install}>
              <CodeBlock language="bash">npm install docusaurus-plugin-enhanced-local-search</CodeBlock>
            </div>
            <div className={styles.buttons}>
              <Link className="button button--primary button--lg" to="/docs/getting-started">
                <Translate id="home.cta.start">Get started</Translate>
              </Link>
              <Link className="button button--secondary button--lg" to="/docs/options">
                <Translate id="home.cta.options">All options</Translate>
              </Link>
            </div>
          </div>
        </section>

        <section className="container margin-vert--xl">
          <div className={styles.grid}>
            {features.map((feature) => (
              <div key={feature.title} className={styles.card}>
                <h2 className={styles.cardTitle}>{feature.title}</h2>
                <p className={styles.cardText}>{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={`container margin-bottom--xl ${styles.production}`}>
          <h2>
            <Translate id="home.production.title">Used in production</Translate>
          </h2>
          <p>
            <Link href="https://raidprotect.bot">RaidProtect</Link>
            {' · '}
            <Link href="https://dfr.gg">Discord FR</Link>
          </p>
        </section>
      </main>
    </Layout>
  );
}
