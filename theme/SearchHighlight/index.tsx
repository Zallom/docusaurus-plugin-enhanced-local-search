import React, {type ReactNode} from 'react';
import type {Chunk} from '../types';

/** Rend des morceaux de texte, les correspondances dans des `<mark>`. */
export default function SearchHighlight({chunks}: {chunks: Chunk[]}): ReactNode {
  return (
    <>
      {chunks.map((chunk, i) => (chunk.hl ? <mark key={i}>{chunk.text}</mark> : <span key={i}>{chunk.text}</span>))}
    </>
  );
}
