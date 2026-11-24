# G4F TCG

## Fiche du projet

- **Sujet, public, but :** l'équipe et les projets G4F ; jeu interne pour les collègues.
- **Identifiant (définitif) :** `g4f-tcg`. **Langue :** français.
- **Couleur prédominante :** `#E4042A`. **Ambiance :** sombre. **Motif :** logo G4F redessiné en SVG.
- **Booster :** « Édition 1 » / « G4F ».
- **Police :** système. **Images :** photos ou images fournies par carte (matériel, références à l'équipe).
- **Cartes :** 100 et plus, depuis le tableur `data/cards.csv`. **Droits :** images libres de droits ; accord de chaque personne représentée ou nommée.
- **Types :** Membre (`membre`), Matériel (`materiel`), Moment (`moment`).
- **Albums :** définis dans `data/albums.csv`.
- **Raretés (id, poids, couleur) :** Commune (`commune`, 60, gris) · Rare (`rare`, 27, bleu) · Ultra rare (`ultra`, 10, violet) · Légendaire (`legendaire`, 3, or).
- **Attribution des raretés :** colonne `rarity` du tableur. Répartition conseillée : 50 % / 30 % / 15 % / 5 %, au moins 2 légendaires.
- **Booster :** 5 cartes, la dernière au moins Rare ; 2 gratuits au départ, puis 1 toutes les 12 h, réserve de 3 ; 100 pièces à l'achat.
- **Monnaie :** pièces ; revente des doubles 5 / 12 / 30 / 75 ; prime de découverte 5 / 10 / 25 / 60.
- **Calendrier de l'Avent :** du 1er au 24 décembre 2026, une case par jour, ouvrable une fois ; les cases oubliées restent ouvrables jusqu'au 31 janvier 2027. 58 boosters offerts en tout, de 1 à 5 par case (5 le 24), mêmes nombres pour tous. Réglage : `advent` dans `theme.js`.
- **Durée visée pour tout compléter :** un mois sans échange. Simulation à 110 cartes, pour la moitié des joueurs : 26 jours sans le calendrier, environ 13 jours en démarrant le 1er décembre avec le calendrier.
- **Échanges :** oui, via PeerJS (service public) ; on peut échanger son exemplaire unique.
- **Vitrine :** 6 places.
- **Base de données :** tableur CSV, modifié par toute personne ayant accès au dépôt.
- **Publication :** GitHub Pages, site à la racine du dépôt.
- **Ce qui reste à décider :** liste définitive des albums et des cartes ; images ; dépôt GitHub public ou privé.

## Calendrier de l'Avent

- Boosters par case : la liste `advent.boosters` de `theme.js`, dans l'ordre des jours (première valeur = 1er décembre).
- Ne pas changer `advent.start` une fois le calendrier commencé : les cases déjà ouvertes seraient oubliées et pourraient être rouvertes.
- Pour l'essayer à une autre date, en local seulement : `http://localhost:3000/?date=2026-12-10`.
- Décor de Noël (neige, guirlande lumineuse) du 24 novembre 2026 au 6 janvier 2027 : `christmas` dans `theme.js`.

## Ajouter ou modifier des cartes

1. Ouvrir `data/cards.csv` (et `data/albums.csv` pour les albums) dans Excel, LibreOffice ou Google Sheets.
2. Modifier, puis enregistrer en **CSV UTF-8**, séparateur `;`.
3. Déposer les images dans `art/`, nommées comme l'`id` de la carte : `art/machine-cafe.jpg`. Dans la colonne `image`, écrire `art/machine-cafe.jpg`.
4. Depuis la racine du dépôt :

   ```powershell
   node tools/import-cards.mjs g4f-tcg
   node tools/check-theme.mjs g4f-tcg
   ```

5. Essayer en local (`npx serve .`), puis publier.

Ne jamais modifier `cards.js` ni `albums.js` à la main : ils sont réécrits à chaque import.

### Colonnes de `cards.csv`

| Colonne | Obligatoire | Contenu |
|---|---|---|
| `id` | oui | minuscules, chiffres, tirets. **Définitif une fois le jeu en ligne** : le changer fait perdre la carte aux joueurs |
| `name` | oui | 28 caractères au plus |
| `album` | oui | un `id` de `albums.csv` |
| `type` | oui | `membre`, `materiel` ou `moment` |
| `rarity` | oui | `commune`, `rare`, `ultra` ou `legendaire` |
| `subtitle` | non | affiché après le type : « Membre · Pôle technique » |
| `text` | non | texte de la carte, environ 130 caractères |
| `long` | non | texte du détail (retours à la ligne gardés) ; `text` par défaut |
| `image` | non | `art/<id>.jpg` ; 4:3 paysage, sujet centré, 1000 px de large, 400 Ko au plus |
| `fit` | non | `contain` pour un logo à afficher entier |
| `stats` | non | jusqu'à 3 : `Café=4 par jour\|Ancienneté=6 ans` |
| `links` | non | `Fiche=https://…` |

### Règles

- **Ajouter** une carte : nouvelle ligne, nouvel `id`, de préférence à la fin.
- **Renommer** : changer `name`, garder l'`id`.
- **Supprimer** une carte publiée : les joueurs la perdent. L'import refuse, sauf avec `--allow-removal`.
- **Personnes réelles** : obtenir l'accord de chaque collègue avant d'utiliser sa photo ou son nom.

## Cartes d'exemple

Les 12 cartes livrées (`nouvelle-recrue`, `machine-cafe`, `premier-client`…) et les 3 albums servent seulement à essayer le jeu. Remplacez-les **avant la première mise en ligne**, avec `node tools/import-cards.mjs g4f-tcg --allow-removal` : une fois le jeu en ligne, retirer une carte la fait perdre aux joueurs.
