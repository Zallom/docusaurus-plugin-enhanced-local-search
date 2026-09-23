/* Découpage en mots. Les écritures sans espaces (chinois, japonais, thaï…)
 * passent par Intl.Segmenter ; sans lui, chaque caractère compte pour un mot.
 * Les signes combinants (\p{M}) font partie du mot : sans eux, le hindi ou le
 * thaï seraient coupés à chaque voyelle. */

// Un mot commence par une lettre ou un chiffre : le sélecteur de variante
// d'un emoji (« ⚙️Configuration ») est aussi un signe combinant.
const TOKEN_RE = /[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:[-'’][\p{L}\p{N}][\p{L}\p{M}\p{N}]*)*/gu;
const UNSPACED =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u;

export interface Word {
  text: string;
  index: number;
}

export type WordSplitter = (text: string) => Word[];

interface Segment {
  segment: string;
  index: number;
  isWordLike?: boolean;
}

type SegmenterLike = {segment(input: string): Iterable<Segment>};

function createSegmenter(locale: string): SegmenterLike | null {
  const Segmenter = (Intl as unknown as {Segmenter?: new (l: string, o: object) => SegmenterLike}).Segmenter;
  if (!Segmenter) return null;
  try {
    return new Segmenter(locale, {granularity: 'word'});
  } catch {
    return null;
  }
}

export function createWordSplitter(locale = 'en'): WordSplitter {
  let segmenter: SegmenterLike | null | undefined;

  const splitUnspaced = (token: string, base: number, out: Word[]) => {
    if (segmenter === undefined) segmenter = createSegmenter(locale);
    if (segmenter) {
      for (const s of segmenter.segment(token)) {
        if (s.isWordLike) out.push({text: s.segment, index: base + s.index});
      }
      return;
    }
    let run = '';
    let runStart = 0;
    let offset = 0;
    for (const char of token) {
      if (UNSPACED.test(char)) {
        if (run) out.push({text: run, index: base + runStart});
        run = '';
        out.push({text: char, index: base + offset});
      } else {
        if (!run) runStart = offset;
        run += char;
      }
      offset += char.length;
    }
    if (run) out.push({text: run, index: base + runStart});
  };

  return (text) => {
    const out: Word[] = [];
    for (const match of text.matchAll(TOKEN_RE)) {
      const index = match.index ?? 0;
      if (UNSPACED.test(match[0])) splitUnspaced(match[0], index, out);
      else out.push({text: match[0], index});
    }
    return out;
  };
}
