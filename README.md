# DSE Demandes V4 — démo Accueil

Petite vitrine **statique** du geste Accueil (trois portes + bande live + diagnostic navigateur).

Ce n’est **pas** l’application de production. Elle ne parle ni à Charlemagne, ni à Acrobat, ni à Excel, ni à une API. Aucune donnée élève, aucun secret.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre `http://127.0.0.1:45221`.

## Quoi cliquer

- **Traiter** — feedback immédiat, bande live, étape Identité fictive (3 noms, ★ sur le meilleur).
- **Vérifier** / **Contrôler** — états vides, pas des culs-de-sac.
- **Paramètres** — 4 options, `Enregistrer` dans `localStorage`.
- **Diagnostiquer** — batterie navigateur, rapport copiable. Les tests PC-only restent **N/A** ou **FAIL** (jamais PASS).

## Hébergement

Site statique, pas d’auth, pas de backend. `npm run build` produit `dist/`.

Public HTTPS (no backend):
https://raw.githack.com/xSa-m/dse-demandes-v4-accueil-demo/main/index.html

Source: https://github.com/xSa-m/dse-demandes-v4-accueil-demo
