// Finalise le thème compilé : tsc garde le JSX dans des .jsx (que Docusaurus
// transpile, comme ses propres thèmes), on les renomme en .js et on copie les
// feuilles de style, que tsc ignore.
import {cpSync, readdirSync, renameSync, statSync} from 'node:fs';
import {join} from 'node:path';

function walk(from, to) {
  for (const name of readdirSync(from)) {
    const src = join(from, name);
    if (statSync(src).isDirectory()) walk(src, join(to, name));
    else if (name.endsWith('.css')) cpSync(src, join(to, name));
  }
  for (const name of readdirSync(to)) {
    if (name.endsWith('.jsx')) renameSync(join(to, name), join(to, name.replace(/\.jsx$/, '.js')));
  }
}

walk('theme', 'lib/theme');
