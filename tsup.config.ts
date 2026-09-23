import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outDir: 'lib',
  // Déclare aussi les modules @theme/Search* pour les sites qui importent le plugin.
  dts: {banner: '/// <reference path="../theme.d.ts" />'},
  clean: true,
  external: [
    '@docusaurus/types',
    '@docusaurus/utils-validation',
    'babel-loader',
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
});
