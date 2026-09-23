import React, {type ComponentType, type ReactNode} from 'react';
import Head from '@docusaurus/Head';
import ThemeLayout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import Translate, {translate} from '@docusaurus/Translate';
import SearchHero from '@theme/SearchHero';
import styles from './styles.module.css';

// Le Layout du thème classique accepte un titre ; son type n'est pas connu ici.
const Layout = ThemeLayout as unknown as ComponentType<{title?: string; children: ReactNode}>;

/* Page de recherche (option `searchPagePath`). La requête vit dans l'URL
 * (`/search?q=…`) : une recherche se partage et se retrouve dans l'historique. */
export default function SearchPage(): ReactNode {
  const {search} = useLocation();
  const initialQuery = new URLSearchParams(search).get('q') ?? '';
  const title = translate({id: 'localSearch.page.title', message: 'Search', description: 'Title of the search page'});

  return (
    <Layout title={title}>
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <main className={styles.page}>
        <SearchHero
          inline
          syncUrl
          initialQuery={initialQuery}
          title={
            <Translate id="localSearch.page.heading" description="Heading of the search page">
              Search the site
            </Translate>
          }
        />
      </main>
    </Layout>
  );
}
