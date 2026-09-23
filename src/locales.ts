/* Codes de locale que Docusaurus peut recevoir pour une même langue
 * (`nb`, `zh-Hans`, `pt-BR`…) ramenés aux clés des tables du plugin. */
const ALIASES: Record<string, string> = {
  nb: 'no',
  nn: 'no',
  zh: 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-sg': 'zh-CN',
  'zh-hant': 'zh-TW',
  'zh-hk': 'zh-TW',
  'zh-mo': 'zh-TW',
};

export function pickLocale<T>(table: Record<string, T>, locale: string): T | undefined {
  const lower = locale.toLowerCase();
  const parts = lower.split('-');
  const candidates = [
    locale,
    ALIASES[lower],
    parts.length > 2 ? ALIASES[parts.slice(0, 2).join('-')] : undefined,
    parts[0],
    ALIASES[parts[0]],
  ];
  for (const candidate of candidates) {
    if (candidate && table[candidate] !== undefined) return table[candidate];
  }
  return undefined;
}
