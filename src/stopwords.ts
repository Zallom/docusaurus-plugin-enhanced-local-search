/* Mots vides retirés de l'index comme des requêtes. Sans eux, une question
 * tapée en langage naturel (« comment bannir un membre ») exigerait que
 * « comment » figure dans la page. Listes volontairement courtes : un mot
 * porteur de sens ne doit jamais s'y trouver. */
export const DEFAULT_STOP_WORDS: Record<string, string[]> = {
  fr: [
    'a', 'ai', 'as', 'au', 'aux', 'avec', 'c', 'ce', 'ces', 'cet', 'cette', 'comment', 'd', 'dans', 'de',
    'des', 'du', 'elle', 'elles', 'en', 'est', 'et', 'faire', 'faut', 'il', 'ils', 'j', 'je', 'l', 'la',
    'le', 'les', 'leur', 'leurs', 'm', 'ma', 'mes', 'mon', 'n', 'ne', 'nous', 'on', 'ont', 'ou', 'par',
    'pas', 'peut', 'peux', 'pour', 'pourquoi', 'qu', 'que', 'quel', 'quelle', 'quelles', 'quels', 'qui',
    'quoi', 's', 'sa', 'se', 'ses', 'son', 'sont', 'sur', 't', 'ta', 'tes', 'ton', 'tu', 'un', 'une',
    'vous', 'y',
  ],
  en: [
    'a', 'an', 'and', 'are', 'be', 'by', 'can', 'do', 'does', 'for', 'how', 'i', 'in', 'is', 'it', 'its',
    'my', 'of', 'on', 'or', 'our', 'that', 'the', 'these', 'this', 'those', 'to', 'was', 'we', 'were',
    'what', 'which', 'who', 'why', 'with', 'you', 'your',
  ],
  de: [
    'das', 'dem', 'den', 'der', 'des', 'die', 'du', 'ein', 'eine', 'einem', 'einen', 'es', 'für', 'ich',
    'im', 'in', 'ist', 'kann', 'mit', 'oder', 'sie', 'sind', 'und', 'von', 'warum', 'was', 'welche',
    'wie', 'wir', 'zu',
  ],
  es: [
    'a', 'al', 'como', 'con', 'cual', 'de', 'del', 'el', 'en', 'es', 'la', 'las', 'le', 'lo', 'los', 'mi',
    'o', 'para', 'por', 'que', 'se', 'sin', 'son', 'su', 'tu', 'un', 'una', 'unas', 'unos', 'y',
  ],
  pt: [
    'a', 'as', 'com', 'como', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'meu', 'minha', 'na', 'nas',
    'no', 'nos', 'o', 'os', 'ou', 'para', 'por', 'qual', 'que', 'se', 'sem', 'seu', 'sua', 'são', 'um',
    'uma', 'umas', 'uns',
  ],
  it: [
    'a', 'che', 'ci', 'come', 'con', 'cosa', 'da', 'dei', 'del', 'della', 'delle', 'di', 'e', 'è', 'gli',
    'i', 'il', 'in', 'la', 'le', 'lo', 'mi', 'o', 'per', 'perché', 'quale', 'si', 'sono', 'su', 'ti', 'tra',
    'un', 'una', 'uno',
  ],
  nl: [
    'de', 'dat', 'die', 'dit', 'een', 'en', 'er', 'het', 'hoe', 'ik', 'in', 'is', 'je', 'met', 'of', 'op',
    'te', 'u', 'van', 'voor', 'waarom', 'wat', 'we', 'welke', 'zijn',
  ],
  pl: ['co', 'czy', 'dla', 'do', 'i', 'jak', 'jest', 'na', 'nie', 'o', 'od', 'po', 'się', 'ta', 'ten', 'to', 'w', 'z', 'że'],
  ru: [
    'а', 'в', 'во', 'вы', 'для', 'же', 'за', 'и', 'из', 'или', 'как', 'к', 'ко', 'ли', 'мы', 'на', 'не',
    'но', 'о', 'об', 'от', 'по', 'с', 'со', 'у', 'что', 'это', 'я',
  ],
  uk: [
    'а', 'або', 'але', 'в', 'ви', 'для', 'до', 'з', 'й', 'із', 'і', 'чи', 'як', 'ми', 'на', 'не',
    'по', 'про', 'від', 'у', 'що', 'це', 'я',
  ],
  bg: ['в', 'да', 'до', 'е', 'за', 'и', 'или', 'как', 'какво', 'ли', 'на', 'не', 'от', 'по', 'са', 'се', 'с', 'това'],
  cs: ['a', 'co', 'do', 'i', 'jak', 'je', 'jsou', 'k', 'na', 'nebo', 'o', 'od', 'po', 'pro', 's', 'se', 'to', 'v', 've', 'z', 'že'],
  hr: ['da', 'do', 'i', 'ili', 'je', 'kako', 'li', 'na', 'ne', 'od', 'po', 's', 'sa', 'se', 'su', 'u', 'za', 'što'],
  lt: ['apie', 'ar', 'bet', 'iš', 'ir', 'į', 'kaip', 'kas', 'ne', 'nuo', 'o', 'per', 'su', 'tai', 'yra'],
  da: ['af', 'at', 'de', 'den', 'det', 'du', 'eller', 'en', 'er', 'et', 'for', 'hvad', 'hvordan', 'hvorfor', 'i', 'jeg', 'med', 'og', 'på', 'til', 'vi'],
  no: ['av', 'de', 'den', 'det', 'du', 'ei', 'eller', 'en', 'er', 'et', 'for', 'hva', 'hvordan', 'hvorfor', 'i', 'jeg', 'med', 'og', 'på', 'til', 'vi', 'å'],
  sv: ['av', 'de', 'den', 'det', 'du', 'eller', 'en', 'ett', 'för', 'hur', 'i', 'jag', 'med', 'och', 'på', 'till', 'vad', 'varför', 'vi', 'att', 'är'],
  fi: ['ei', 'ja', 'kuinka', 'miksi', 'mikä', 'miten', 'mitä', 'ne', 'on', 'se', 'tai', 'että'],
  hu: ['a', 'az', 'egy', 'és', 'hogy', 'hogyan', 'is', 'mi', 'miért', 'mit', 'nem', 'van', 'vagy'],
  ro: ['care', 'ce', 'cu', 'cum', 'de', 'din', 'este', 'în', 'la', 'nu', 'o', 'pe', 'pentru', 'sau', 'se', 'sunt', 'un', 'și'],
  el: [
    'από', 'για', 'γιατί', 'δεν', 'είναι', 'ένα', 'ή', 'η', 'και', 'με', 'μια', 'να', 'ο', 'οι', 'πώς',
    'σε', 'τα', 'της', 'τι', 'το', 'του', 'των',
  ],
  tr: ['bir', 'bu', 'da', 'de', 'için', 'ile', 'mi', 'mı', 'mu', 'mü', 'nasıl', 'ne', 'neden', 've', 'veya', 'şu'],
  id: ['adalah', 'apa', 'atau', 'bagaimana', 'dan', 'dari', 'dengan', 'di', 'ini', 'itu', 'ke', 'mengapa', 'untuk', 'yang'],
  hi: ['और', 'एक', 'का', 'की', 'के', 'कैसे', 'को', 'क्या', 'क्यों', 'पर', 'में', 'या', 'यह', 'से', 'है'],
  ja: ['か', 'が', 'で', 'と', 'に', 'の', 'は', 'へ', 'も', 'や', 'を'],
  'zh-CN': ['了', '什么', '和', '在', '如何', '怎么', '是', '的', '吗'],
  'zh-TW': ['了', '什麼', '和', '在', '如何', '怎麼', '是', '的', '嗎'],
};
