const escapeXml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'})[c] ?? c);

export interface OpenSearchInput {
  shortName: string;
  description: string;
  /** Adresse de la page de recherche, avec `{searchTerms}` à la place de la requête. */
  template: string;
  selfUrl: string;
  language: string;
  icon: string | null;
}

/* Description OpenSearch : les navigateurs s'en servent pour proposer de
 * chercher sur le site depuis la barre d'adresse (Tab dans Chrome). */
export function openSearchXml(input: OpenSearchInput): string {
  const icon = input.icon
    ? `\n  <Image width="16" height="16" type="${input.icon.endsWith('.svg') ? 'image/svg+xml' : input.icon.endsWith('.png') ? 'image/png' : 'image/x-icon'}">${escapeXml(input.icon)}</Image>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>${escapeXml(input.shortName.slice(0, 16))}</ShortName>
  <Description>${escapeXml(input.description.slice(0, 1024))}</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Language>${escapeXml(input.language)}</Language>${icon}
  <Url type="text/html" method="get" template="${escapeXml(input.template)}"/>
  <Url type="application/opensearchdescription+xml" rel="self" template="${escapeXml(input.selfUrl)}"/>
  <moz:SearchForm>${escapeXml(input.template.split('?')[0])}</moz:SearchForm>
</OpenSearchDescription>
`;
}

/** Nœud schema.org `WebSite` avec son action de recherche. */
export function searchActionJsonLd(input: {id: string; url: string; template: string}): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': input.id,
    url: input.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {'@type': 'EntryPoint', urlTemplate: input.template.replace('{searchTerms}', '{search_term_string}')},
      'query-input': 'required name=search_term_string',
    },
  });
}
