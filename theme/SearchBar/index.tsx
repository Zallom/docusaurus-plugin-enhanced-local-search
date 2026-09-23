import React, {type ReactNode} from 'react';
import SearchInput from '@theme/SearchInput';

/* Composant attendu par Docusaurus pour l'élément de navbar `type: 'search'`.
 * Swizzler celui-ci pour changer la barre de la navbar sans toucher à celle
 * utilisée ailleurs (footer, pages). */
export default function SearchBar(): ReactNode {
  return <SearchInput variant="navbar" />;
}
