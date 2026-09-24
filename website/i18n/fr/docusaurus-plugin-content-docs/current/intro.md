---
title: "Introduction"
sidebar_position: 1
---

Recherche locale et hors ligne, tolérante aux fautes, pour Docusaurus v3. Aucun service externe, aucune clé d'API, aucun robot à lancer : l'index est construit à partir de votre site au moment du build, et la recherche se fait dans le navigateur.

:::tip Essayez sur ce site
Cette documentation est la démo. Appuyez sur <kbd>⌘</kbd> <kbd>K</kbd> (ou <kbd>Ctrl</kbd> <kbd>K</kbd>), utilisez la barre de la navbar ou ouvrez la [page de recherche](/search). Passez en 日本語 pour voir la découpe en mots à l'œuvre.
:::

- **Fenêtre de recherche ⌘K / Ctrl+K** : résultats groupés, titres et extraits surlignés, navigation au clavier, recherches récentes et suggestions.
- **Mini barre de recherche** pour la navbar, le footer ou n'importe quelle page. Taper dedans ouvre la fenêtre avec le texte saisi.
- **Grande barre de recherche**, façon ChatGPT, pour une page d'accueil, avec des suggestions et un mode résultats en ligne.
- **Page `/search` optionnelle**, avec la requête dans l'URL pour partager une recherche.
- **Intelligente sans IA** : tolérance aux fautes, recherche par début de mot pendant la frappe, synonymes, racinisation légère par langue, mots vides, insensibilité aux accents, et classement par critères successifs.
- **Liens profonds** : les résultats mènent à la section exacte (`/docs/page#titre`), pas seulement à la page.
- **Entrées manuelles** : ajoutez vos propres résultats (un lien d'invitation, une page de tarifs, un serveur de support) ou des mots-clés sur des pages existantes, traduits par langue et mis en avant dans le classement.
- **Multilingue** : un index par langue, une interface traduite en 30 langues, et la découpe en mots du chinois, du japonais et du thaï.
- **Moteurs de recherche et navigateurs** : description OpenSearch (chercher sur le site depuis la barre d'adresse) et `SearchAction` schema.org en option, qui pointent vers `/search?q=`.
- **Entièrement personnalisable** : chaque composant peut être swizzlé, et les couleurs viennent de variables CSS qui reprennent votre thème Infima.

## Fonctionnement

Après le build, le plugin lit chaque page HTML générée de chaque langue, garde le contenu principal et le découpe en sections sur les titres `h2` et `h3` (avec leurs ancres). Il écrit un index JSON compact à la racine de la langue (`/search-index.json`, `/fr/search-index.json`…).

Lire le HTML final permet d'indexer de la même façon les pages Markdown, MDX et React, avec leurs titres traduits.

L'index est téléchargé à la demande, la première fois qu'une barre de recherche est survolée, sélectionnée ou ouverte. Pour une documentation de 70 pages, il pèse environ 70 Ko compressé, et une recherche prend de 1 à 5 ms.

Ignorées automatiquement : les pages 404, les pages `noindex`, les pages dont l'URL canonique pointe ailleurs (versions de doc dupliquées) et les pages de listes générées par Docusaurus (listes du blog, tags, archives, auteurs).

## Ils l'utilisent

- [RaidProtect](https://raidprotect.bot) : documentation, glossaire et blog d'un bot Discord de protection, en 5 langues.
- [Discord FR](https://dfr.gg) : la communauté francophone de Discord.
