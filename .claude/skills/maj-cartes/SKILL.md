---
name: maj-cartes
description: Met à jour les cartes du jeu G4F TCG après un ajout ou une modification dans themes/g4f-tcg/data/cards.csv ou albums.csv. Lance l'import du tableur puis le contrôle du thème, et explique les erreurs. À utiliser quand un dev a ajouté, modifié ou supprimé une carte, un album ou une image.
---

# Mettre à jour les cartes

Les cartes sont saisies dans `themes/g4f-tcg/data/cards.csv` et `albums.csv`. Le jeu lit `cards.js` et `albums.js`, générés à partir de ces fichiers : il faut les régénérer après chaque modification. Ne jamais modifier `cards.js` ni `albums.js` à la main.

## Étapes

1. Depuis la racine du dépôt, lancer l'import :

   ```
   node tools/import-cards.mjs g4f-tcg
   ```

2. S'il réussit, lancer le contrôle :

   ```
   node tools/check-theme.mjs g4f-tcg
   ```

3. Faire un résumé court à l'utilisateur, en français :
   - cartes ajoutées, modifiées ou retirées (d'après la sortie de l'import) ;
   - **erreurs** du contrôle, avec la ligne du CSV à corriger et comment la corriger ;
   - **remarques** utiles (image introuvable, texte trop long…). Les remarques « pas d'image, le motif sera affiché » se résument en une ligne avec leur nombre ;
   - rappeler de recharger la page avec Ctrl+F5.

## En cas d'erreur

- **Colonne `type` ou `rarity` inconnue** (« … n'est pas dans types ») : les valeurs permises sont les `id` de `types` et `rarities` dans `themes/g4f-tcg/theme.js`. Proposer de corriger le CSV, ou d'ajouter le type dans `theme.js` si l'utilisateur veut vraiment un nouveau type.
- **Album inconnu** : l'`id` doit exister dans `albums.csv`.
- **Cartes retirées ou id changés** : l'import refuse, car les joueurs perdraient ces cartes. **Ne pas** relancer avec `--allow-removal` sans l'accord explicite de l'utilisateur. Lui montrer la liste des cartes concernées et lui demander si c'est voulu (par exemple, retrait des cartes d'exemple avant la mise en ligne). Avec son accord seulement :

  ```
  node tools/import-cards.mjs g4f-tcg --allow-removal
  ```

- **Image introuvable** : le chemin de la colonne `image` part du dossier du thème (`art/matos/micro.jpg` → `themes/g4f-tcg/art/matos/micro.jpg`). Vérifier aussi les majuscules : GitHub Pages les distingue, Windows non.
- **Fichier CSV mal enregistré** (accents cassés, une seule colonne) : il doit être enregistré en CSV UTF-8.

Ne rien commiter sans que l'utilisateur le demande.
