# Créer un site de cartes à collectionner (TCG)

Ce fichier suffit à recréer le site de zéro, sur n'importe quel thème. Il contient :

| Partie | Contenu |
|---|---|
| [1](#1-mode-demploi) | Comment se servir de ce guide |
| [2](#2-ce-que-lon-construit) | Ce que fait le site |
| [3](#3-questionnaire) | **Les questions à poser avant de commencer** |
| [4](#4-construction-pas-à-pas) | Les étapes, dans l'ordre |
| [5](#5-architecture) | Les fichiers et leur rôle |
| [6](#6-référence-de-themejs) | Tous les réglages possibles |
| [7](#7-couleurs-et-apparence) | De la couleur prédominante à la palette, motif, images |
| [8](#8-base-de-données-des-cartes-et-des-albums) | **Créer, personnaliser et gérer les cartes et les albums** |
| [9](#9-règles-du-jeu) | Le comportement exact : tirage, économie, échanges, sauvegarde |
| [10](#10-interface) | Chaque écran, ses états et ses durées |
| [11](#11-sécurité-vie-privée-et-droits) | Ce que le site garantit, et ce qu'il ne garantit pas |
| [12](#12-mise-en-ligne) | Publier et mettre à jour |
| [13](#13-aller-plus-loin) | Désactiver une fonction, changer de langue, ajouter une mécanique |
| [14](#14-recette) | La liste de contrôle avant livraison |
| [15](#15-pièges-connus) | Les erreurs déjà rencontrées, et leur solution |
| [Annexe](#annexe--code-source) | Le code source complet |

---

## 1. Mode d'emploi

### Si vous êtes un assistant (Claude, etc.)

1. **Posez d'abord les questions de la partie 3.** N'écrivez aucun fichier avant d'avoir les réponses, ou l'accord pour prendre les valeurs par défaut.
   - Posez les blocs dans l'ordre, 3 ou 4 questions à la fois, avec votre recommandation en premier.
   - Ne posez que ce qui n'a pas déjà été dit. Les questions marquées ● sont indispensables ; les autres ont une valeur par défaut raisonnable.
   - Si la personne répond « comme tu veux », prenez la valeur par défaut et dites-le.
2. **Récapitulez** avec la [fiche du projet](#fiche-du-projet) et faites-la valider.
3. **Construisez** en suivant la partie 4. Le moteur se recopie depuis l'annexe, sans le réécrire : il est déjà testé. Le travail porte sur `theme.js`, les cartes et les images.
4. **Ne modifiez le moteur** que si une réponse l'exige (partie 13). Dans ce cas, relisez les parties 9, 10 et 15 avant.
5. **Contrôlez** avec la partie 14, et dites ce que vous n'avez pas pu vérifier.

Ne supposez jamais une réponse qui touche aux droits (images, marques, personnes réelles), à l'argent ou à la mise en ligne : demandez.

### Si vous êtes une personne

Répondez au questionnaire, puis suivez la partie 4. Il faut [Node.js](https://nodejs.org) 20 ou plus pour les outils ; le site, lui, n'a besoin de rien.

---

## 2. Ce que l'on construit

Un site **statique** (HTML, CSS, JavaScript, sans framework, sans compilation, sans serveur ni compte) où le visiteur :

- reçoit un **booster de bienvenue**, le déchire d'un geste, puis retourne ses cartes une à une ;
- voit un **effet d'apparition différent selon la rareté** : simple retournement, éclat, rayons, ou grande mise en scène avec flash ;
- remplit une **collection rangée par albums**, avec une progression par album ; les cartes non trouvées restent cachées ;
- regagne des **boosters gratuits** avec le temps, ou en achète avec des **pièces** ;
- gagne des pièces en découvrant des cartes et en **revendant ses doubles** ;
- ouvre le **détail** d'une carte, qui sort de sa case et se pose en grand ;
- range ses cartes avec des **favoris** et ses propres **étiquettes** ;
- **échange en direct** avec un ami (cartes et pièces), par lien, QR code ou code de 5 lettres ;
- compose une **vitrine** et la partage par un lien.

Tout est enregistré dans le navigateur du joueur. Le moteur ne contient aucun contenu : un jeu est un **thème**, c'est-à-dire un dossier avec un fichier `theme.js` et des images.

**Hors du périmètre**, car il faudrait un serveur et des comptes : marché public, enchères, guildes, messagerie, classement, anti-triche, synchronisation entre appareils.

---

## 3. Questionnaire

● = réponse indispensable. La colonne « Réglage » dit où va la réponse.

### Bloc A — Identité

| N° | Question | Choix proposés | Défaut | Réglage |
|---|---|---|---|---|
| A1 ● | Quel est le **nom du jeu** ? | texte libre | — | `name` |
| A2 ● | Quel est le **sujet de la collection**, en une phrase ? | univers inventé, lieux, animaux, musique, métiers, projets personnels… | — | `tagline`, cartes |
| A3 ● | **À qui** s'adresse-t-il, et dans quel but ? | amis, clients, élèves, communauté, portfolio, vente | — | ton, mentions |
| A4 | Quel **slogan** sous le titre ? | 2 ou 3 propositions à faire | dérivé de A2 | `tagline` |
| A5 | Quel **identifiant** technique ? Il nomme la sauvegarde et ne devra plus changer. | minuscules, chiffres, tirets | dérivé de A1 | `id`, nom du dossier |
| A6 | Dans quelle **langue** ? Une seule par jeu. | français, autre | français | `language`, `texts` |
| A7 | Un **logo** ? | image fournie, motif du jeu | motif | `logo` |
| A8 | Des **liens** en haut de page, une **mention** en bas ? | adresses, crédits | aucun | `nav`, `footer` |
| A9 ● | Avez-vous les **droits** sur les images, les noms et les textes ? | créations, licence, domaine public, à vérifier | — | partie 11 |

### Bloc B — Apparence

| N° | Question | Choix proposés | Défaut | Réglage |
|---|---|---|---|---|
| B1 ● | Quelle est la **couleur prédominante** ? | code `#rrggbb`, nom de couleur, logo dont l'extraire | — | `colors`, par `tools/palette.mjs` |
| B2 | Ambiance **sombre ou claire** ? | sombre, claire | sombre | `colors` |
| B3 | Une **couleur secondaire** pour le booster ? | couleur, dérivée de B1 | dérivée | `colors.pack3` |
| B4 | Quel **motif** sur le booster et le dos des cartes ? | onde, orbite, étoile, bouclier, feuille, flamme, dessin sur mesure | le plus proche du sujet | `motif` |
| B5 | Quels **textes sur le booster** ? | petite ligne (édition, auteur) et grand mot | nom du jeu | `pack.top`, `pack.label` |
| B6 | Quelle **police** ? | police du système, police Google, police fournie | système | `fonts` |
| B7 | Quel **style d'images** ? | photos, illustrations, logos, pixel art, dessins générés, aucune image | illustrations | partie 7 |
| B8 | Les images remplissent-elles le cadre, ou sont-ce des **logos** à laisser entiers ? | remplir, contenir, selon la carte | remplir | `fit` |
| B9 | Un fond particulier dans le **détail** d'une carte ? | image de la carte floutée, autre image, aucun | image floutée | `background` |

### Bloc C — Cartes

| N° | Question | Choix proposés | Défaut | Réglage |
|---|---|---|---|---|
| C1 ● | **Combien de cartes** au lancement ? | 20, 50, 100, 200 et plus | 50 | `cards` |
| C2 ● | **D'où vient la liste** ? | vous la donnez, tableur existant, dossier d'images, site ou API à reprendre, je la propose | je la propose | partie 8 |
| C3 ● | Quels **types** de cartes ? Écrit sur la carte ; un booster en mélange au moins deux. | 2 à 5 (personnage, lieu, objet…) | 2 | `types` |
| C4 ● | Quels **albums** ? Chaque carte en a exactement un. | par série, région, époque, édition, difficulté… | 3 à 6 de 5 à 15 cartes | `albums` |
| C5 | Quels **textes** par carte ? | court sur la carte, long dans le détail | les deux | `text`, `long` |
| C6 | Des **caractéristiques** (Force 9, Année 1846) ? Lesquelles ? | 0 à 3 par carte | aucune | `stats` |
| C7 | Un **sous-titre** (rôle, année, série) ? | oui, non | non | `subtitle` |
| C8 | Un **média** dans le détail ? | vidéo, lecteur audio, aucun | aucun | `embed` |
| C9 | Des **liens** dans le détail ? | source, boutique, fiche | aucun | `links` |
| C10 | Des **filtres** en plus des albums ? | étiquettes du jeu, aucune | aucune | `tags` |
| C11 | Dans quel **ordre** numéroter (3/50) ? | celui de la liste, par album, par rareté | par album | ordre de `cards` |

### Bloc D — Gestion de la base

| N° | Question | Choix proposés | Défaut | Réglage |
|---|---|---|---|---|
| D1 ● | **Qui** modifiera les cartes ensuite ? | moi, un assistant, plusieurs personnes non techniques | un assistant | méthode, partie 8.2 |
| D2 ● | Sous quelle **forme** ? | directement dans `theme.js`, fichier `cards.js`, tableur CSV | `theme.js` jusqu'à 40 cartes, CSV au-delà | partie 8.2 |
| D3 | À quelle **fréquence** ajouter des cartes ? | jamais, par éditions, au fil de l'eau | par éditions | partie 8.6 |
| D4 | Une nouvelle édition : nouvel **album**, ou cartes dans les albums existants ? | nouvel album, albums existants | nouvel album | `albums` |
| D5 | Les cartes d'anciennes éditions restent-elles **tirables** ? | oui, non (demande de modifier le moteur) | oui | partie 13 |
| D6 | Faut-il une **relecture** avant publication ? | oui : qui, non | oui, par la personne | partie 8.4 |

### Bloc E — Raretés

| N° | Question | Choix proposés | Défaut | Réglage |
|---|---|---|---|---|
| E1 | **Combien** de raretés, et quels noms ? | 3 à 6 | Commune, Rare, Ultra rare, Légendaire | `rarities` |
| E2 ● | **Comment** attribuer la rareté ? | vous décidez, selon une mesure (popularité, prix, date…), par quotas, je propose | je propose, par quotas 50/30/15/5 % | partie 8.5 |
| E3 | Quelles **couleurs** ? | accordées à la palette | gris, bleu, violet, or | `color` |
| E4 | Quelles **chances** ? | très généreux, équilibré, difficile | 60 / 27 / 10 / 3 | `weight` |
| E5 | Quelle **mise en scène** par rareté ? | aucune, éclat, rayons, légende | dans cet ordre | `effect`, `charge`, `particles` |

### Bloc F — Boosters

| N° | Question | Choix proposés | Défaut | Réglage |
|---|---|---|---|---|
| F1 | Combien de **cartes par booster** ? | 3, 5, 7, 10 | 5 | `booster.size` |
| F2 | Une **garantie** sur la dernière carte ? | aucune, à partir d'une rareté | deuxième rareté | `booster.guaranteed` |
| F3 | Mélanger les **types** ? | oui, non | oui | `booster.mixTypes` |
| F4 | Proposer un booster **dès l'arrivée** ? | oui, non | oui | `booster.openOnFirstVisit` |
| F5 | Boosters gratuits : **combien au départ**, un toutes les **combien de minutes**, **réserve** maximale ? | 2 / 10 / 3 · 10 / 10 / 10 · 1 / 1440 / 1 (un par jour) | 2 / 10 / 3 | `economy.freeBooster` |
| F6 | Un lien pour **tout révéler** (visiteur pressé) ? Il donne toutes les cartes. | oui, non | non | `booster.allowRevealAll` |

### Bloc G — Économie

| N° | Question | Choix proposés | Défaut | Réglage |
|---|---|---|---|---|
| G1 | Comment s'appelle la **monnaie** ? | pièces, autre nom | pièces | `texts` (partie 13.2) |
| G2 ● | En **combien de temps** un joueur assidu complète-t-il tout, sans échange ? | une heure, une soirée, une semaine, un mois | une soirée | `check-theme`, puis prix et délais |
| G3 | **Prix** d'un booster ? | 100 | 100 | `economy.boosterPrice` |
| G4 | Pièces **au départ** ? | 0, de quoi acheter un booster | 0 | `economy.startCoins` |
| G5 | Prix de **revente** d'un double, par rareté ? | voir règle ci-dessous | 5 / 12 / 30 / 75 | `sell` |
| G6 | **Prime** de première découverte, par rareté ? | 0 ou plus | 5 / 10 / 25 / 60 | `reward` |

> **Règle d'équilibre.** Un booster fait seulement de doubles doit se revendre entre 40 et 70 % de son prix. À 100 % ou plus, les boosters sont illimités. `tools/check-theme.mjs` calcule cette valeur et signale l'erreur.

### Bloc H — Échanges et partage

| N° | Question | Choix proposés | Défaut | Réglage |
|---|---|---|---|---|
| H1 | Activer les **échanges** en direct ? | oui, non | oui | partie 13.1 pour les retirer |
| H2 | Peut-on échanger son **unique exemplaire** ? La carte redevient alors cachée. | oui, non (doubles seulement) | oui | `trade.allowLastCopy` |
| H3 ● | La **mise en relation** passe par un service gratuit extérieur, PeerJS. Est-ce accepté ? | oui, serveur à soi, pas d'échanges | oui | `trade.server` |
| H4 | Activer la **vitrine** ? Combien de places ? | non, 3, 6, 9 | 6 | `showcase.size` |

### Bloc I — Publication

| N° | Question | Choix proposés | Défaut | Réglage |
|---|---|---|---|---|
| I1 ● | **Où** publier ? | GitHub Pages, autre hébergeur statique, pas tout de suite | pas tout de suite | partie 12 |
| I2 | Un **nom de domaine** ? | oui, non | non | hébergeur |
| I3 | Le jeu est-il **toute la page**, ou une section d'un site existant ? | toute la page, sous-dossier | sous-dossier `tcg/` | emplacement |
| I4 | Y aura-t-il des **mineurs** parmi les joueurs, ou de l'**argent réel** ? | — | non | partie 11 |

### Fiche du projet

À remplir avec les réponses, à faire valider, puis à garder avec le projet (`themes/<id>/PROJET.md`).

~~~~markdown
# <Nom du jeu>
- Sujet, public, but :
- Identifiant (définitif) :            Langue :
- Couleur prédominante :               Ambiance :           Motif :
- Booster : « petite ligne » / « GRAND MOT »
- Police :                             Style d'images :
- Cartes : <nombre>, source :          Droits :
- Types :
- Albums (nombre de cartes) :
- Raretés (nom, couleur, poids, nombre de cartes) :
- Attribution des raretés :
- Booster : taille, garantie, gratuits (départ / minutes / réserve), prix :
- Monnaie, prix de revente, primes :
- Durée visée pour tout compléter :
- Échanges, exemplaire unique, serveur :
- Vitrine (places) :
- Base de données : forme, qui la modifie, relecture :
- Publication :
- Ce qui reste à décider :
~~~~

---

## 4. Construction pas à pas

### Étape 1 — Recréer le moteur

Placez ce guide dans le dossier du projet (`tcg/` par exemple), sous le nom `CREER-UN-TCG.md`. Créez `extraire.mjs` à côté, avec ce contenu :

~~~~js
import fs from 'node:fs';
import path from 'node:path';

const text = fs.readFileSync('CREER-UN-TCG.md', 'utf8').replace(/\r\n/g, '\n');
const annex = text.slice(text.lastIndexOf('\n<!-- ANNEXE'));
for (const [, name, code] of annex.matchAll(/^### `([^`]+)`\n\n~~~~\w*\n([\s\S]*?)\n~~~~$/gm)) {
    fs.mkdirSync(path.dirname(name), { recursive: true });
    fs.writeFileSync(name, `${code}\n`);
    console.log(name);
}
~~~~

Puis lancez `node extraire.mjs` depuis ce dossier, et supprimez `extraire.mjs`. Vous obtenez `index.html`, `engine/`, `tools/` et `themes/starter/`.

### Étape 2 — Vérifier que le moteur tourne

Le site doit être **servi par HTTP** : ouvert en `file://`, le navigateur refuse les modules. Depuis le dossier :

~~~~powershell
npx serve .
~~~~

Ouvrez l'adresse affichée avec `?theme=starter`. Vous devez voir le booster de bienvenue et 8 cartes sans image.

### Étape 3 — Créer le thème

1. Copiez `themes/starter/` en `themes/<id>/`.
2. Remplissez identité et apparence (parties 6 et 7), avec la palette :

~~~~powershell
node tools/palette.mjs "#6d5cff"
~~~~

3. Dans `index.html`, mettez `data-theme="<id>"` et la langue dans `lang`.

### Étape 4 — Raretés, types, albums

Écrivez-les dans `theme.js` **avant** les cartes : chaque carte les cite par leur `id`.

### Étape 5 — Cartes

Suivez la partie 8. Commencez par **5 cartes de natures différentes**, montrez-les en vrai, faites valider le ton et le style, puis produisez le reste.

### Étape 6 — Équilibrer

~~~~powershell
node tools/check-theme.mjs <id>
~~~~

Corrigez toutes les erreurs, puis réglez dans cet ordre jusqu'à la durée visée en G2 :

| Pour que ce soit… | Agissez sur |
|---|---|
| plus long | `freeBooster.every` plus grand, `sell` plus petit, poids des raretés hautes plus petit |
| plus court | l'inverse, ou `booster.size` plus grand |
| moins frustrant à la fin | poids des raretés hautes plus grand, `guaranteed` plus haut |

La simulation suppose un joueur qui ouvre dès que possible, revend tous ses doubles et n'échange pas. Les échanges raccourcissent la durée réelle.

### Étape 7 — Contrôler et livrer

Partie 14, puis partie 12.

---

## 5. Architecture

~~~~text
tcg/
├── index.html               page unique : choisit le thème (data-theme)
├── CREER-UN-TCG.md          ce guide
├── engine/                  le moteur, sans contenu
│   ├── main.js              démarrage, page, grilles, albums, filtres, barre, liens #room et #vitrine
│   ├── theme.js             charge, vérifie et complète theme.js ; couleurs et polices
│   ├── strings.js           tous les textes de l'interface, et t(clé)
│   ├── card.js              el(), text(), coins(), actionButton(), createCard(), burst()
│   ├── motif.js             motifs fournis et motif du thème
│   ├── player.js            sauvegarde et règles : cartes, pièces, boosters, revente, tri, vitrine
│   ├── draw.js              tirage d'un booster
│   ├── booster.js           fenêtre d'ouverture : paquet, cartes, résultat
│   ├── calendar.js          calendrier de l'Avent : dates et cases, sans affichage
│   ├── advent.js            fenêtre du calendrier de l'Avent
│   ├── festive.js           décor de Noël : neige et guirlande
│   ├── detail.js            détail d'une carte
│   ├── labels.js            cœur favori et étiquettes
│   ├── showcase.js          vitrine : composition, lien, lecture
│   ├── share.js             partage d'un lien
│   ├── trade.js             déroulement d'un échange, sans affichage
│   ├── trade-view.js        fenêtre d'échange
│   ├── room.js              liaison entre deux joueurs (PeerJS) et QR code
│   ├── modal.js             fenêtres plein écran
│   └── style.css            toutes les apparences, en variables CSS
├── themes/<id>/
│   ├── theme.js             réglages et cartes du jeu
│   ├── cards.js, albums.js  facultatifs : produits depuis data/
│   ├── data/*.csv           facultatif : tableurs
│   └── art/                 images
└── tools/                   Node.js, jamais chargés par le site
    ├── palette.mjs          couleur → palette
    ├── import-cards.mjs     CSV → cards.js et albums.js
    ├── check-theme.mjs      contrôle et simulation
    └── guide.mjs            met à jour l'annexe de ce guide
~~~~

**Principes à respecter dans toute modification**

- Aucune dépendance à installer, aucune compilation. Deux bibliothèques seulement, chargées au premier échange, en version exacte avec empreinte `integrity` : `peerjs@1.5.4` et `qrcode-generator@1.4.4`.
- `player.js`, `draw.js`, `trade.js`, `theme.js` ne touchent pas à la page : ils se testent sous Node.
- Rien de propre à un jeu dans `engine/`. Un réglage va dans `theme.js`, un texte dans `strings.js`.
- Textes du thème et des joueurs affichés avec `textContent`, jamais en HTML.
- Tous les chemins sont relatifs : le dossier fonctionne à n'importe quelle adresse.
- Chaque accès à `localStorage` est protégé : sans stockage, la partie dure le temps de la visite.

**Choix du thème** : `?theme=<id>` dans l'adresse, sinon `data-theme` de `index.html`. Le nom doit correspondre à `[a-z0-9-]+`.

---

## 6. Référence de `theme.js`

Le fichier exporte un objet par défaut. `engine/theme.js` le vérifie : en cas de problème, la page affiche la liste des erreurs au lieu du jeu.

### Identité et apparence

| Propriété | Type | Défaut | Effet |
|---|---|---|---|
| `id` ● | `[a-z0-9-]+` | — | Sauvegarde `tcg-<id>`, salons d'échange. **Ne plus changer après la mise en ligne.** |
| `name` ● | texte | — | Onglet, haut de page |
| `title` | texte | `name` | Grand titre |
| `tagline` | texte | aucun | Sous le titre |
| `footer` | texte | aucun | Bas de page |
| `language` | code | `'fr'` | Attribut `lang` de la page |
| `logo` | chemin | motif | Image de 36 px en haut |
| `nav` | `[{ label, url }]` | `[]` | Liens en haut |
| `motif` | nom ou `<svg …>` | `'star'` | `wave`, `orbit`, `star`, `shield`, `leaf`, `flame`, ou dessin |
| `pack` | `{ top, label }` | `name` | Textes du booster |
| `colors` | objet | voir partie 7 | Variables CSS |
| `fonts` | `{ url, body, heading }` | système | `url` : feuille de style de polices |

Les chemins (`logo`, `image`, `background`) sont relatifs au dossier du thème.

### Contenu

| Propriété | Forme |
|---|---|
| `rarities` ● | `[{ id, label, weight, color, effect, sell, reward, charge = 0, particles = 0 }]`, **de la plus courante à la plus rare** |
| `types` ● | `[{ id, label }]` |
| `albums` ● | `[{ id, label }]`, dans l'ordre d'affichage |
| `tags` | `[{ id, label }]`, vide par défaut : filtres supplémentaires |
| `cards` ● | voir ci-dessous, **dans l'ordre de numérotation** |

Dans chaque liste, les `id` sont uniques.

**Rareté**

| Champ | Contrainte | Effet |
|---|---|---|
| `weight` | > 0 | Chance relative de la rareté à chaque carte tirée |
| `color` | couleur CSS | Cadre, halo, particules, étiquette |
| `effect` | `none`, `glow`, `burst`, `legend` | Mise en scène (partie 10.2) |
| `charge` | ms | Suspense avant le retournement |
| `particles` | nombre | Particules à l'apparition |
| `sell` | entier ≥ 0 | Prix de revente d'un double |
| `reward` | entier ≥ 0 | Prime à la première découverte |

**Carte**

| Champ | Obligatoire | Conseil |
|---|---|---|
| `id` | oui | Minuscules, chiffres, tirets. **Définitif** : c'est lui que les joueurs possèdent. |
| `name` | oui | 28 caractères au plus |
| `type`, `album`, `rarity` | oui | `id` existants |
| `subtitle` | non | Suit le type sur la carte : « Type · sous-titre » |
| `text` | non | Sur la carte, 5 lignes au plus : environ 130 caractères |
| `long` | non | Dans le détail, retours à la ligne `\n` gardés ; `text` par défaut |
| `image` | non | Sans image, le motif est affiché |
| `fit` | non | `'contain'` pour un logo |
| `background` | non | Fond du détail ; l'image par défaut, sauf pour un logo |
| `stats` | non | `[{ label, value }]`, 3 au plus, valeurs courtes |
| `tags` | non | `id` de `tags` |
| `links` | non | `[{ label, url }]`, ouverts dans un nouvel onglet |
| `embed` | non | `{ src, height }` : adresse d'**intégration** (iframe). Sans `height`, format 16/9. |

### Règles

| Propriété | Défaut |
|---|---|
| `booster.size` | `5` |
| `booster.guaranteed` | `null` (aucune garantie), sinon `id` de rareté |
| `booster.mixTypes` | `true` |
| `booster.openOnFirstVisit` | `true` |
| `booster.allowRevealAll` | `false` |
| `economy.startCoins` | `0` |
| `economy.boosterPrice` | `100` |
| `economy.freeBooster` | `{ start: 2, every: 10, max: 3 }` (`every` en minutes) |
| `trade.allowLastCopy` | `true` |
| `trade.server` | `null` (service public), sinon `{ host, port, path, secure }` |
| `showcase.size` | `6` |
| `advent` | `null` (pas de calendrier), sinon `{ start: 'AAAA-MM-JJ', end: 'AAAA-MM-JJ', boosters: [nombre par case] }` : une case par jour à partir de `start`, ouvrable une fois, jusqu'à `end` inclus (voir 9.8) |
| `christmas` | `null`, sinon `{ from: 'AAAA-MM-JJ', to: 'AAAA-MM-JJ' }` : décor de Noël entre ces dates incluses : neige et cristaux qui tombent (surtout derrière le contenu), guirlande en festons sous la bannière, petits tas de neige espacés en bas de l'écran, flocons autour du slogan. Sans neige ni scintillement avec `prefers-reduced-motion`. |
| `texts` | `{}` : n'importe quelle clé de `strings.js` |

---

## 7. Couleurs et apparence

### 7.1 De la couleur prédominante à la palette

`tools/palette.mjs "#rrggbb" [dark|light]` écrit le bloc `colors` complet et contrôle les contrastes (4,5 au minimum). Son principe, à partir de la teinte et de la saturation données :

| Variable | Ambiance sombre | Rôle |
|---|---|---|
| `background` | teinte, saturation ≤ 50 %, clarté 6 % | Fond de page |
| `backgroundGlow` | clarté 22 % | Halo des fenêtres |
| `surface` | clarté 11,5 % | Cartes, panneaux |
| `surfaceRaised` | clarté 18 % | Filtres, étiquettes |
| `border` | clarté 30 % | Bordures |
| `text`, `textSoft`, `muted` | blanc, 84 %, 60 % ajusté | Trois niveaux de texte |
| `accent` | clarté 72 % ajustée | Liens, sélection, progression, motif |
| `accentStrong` | clarté 50 % ajustée | Bouton principal, avec texte blanc |
| `onAccent` | presque noir | Texte sur `accent`, sur les raretés et sur les étiquettes |
| `onAccentStrong` | blanc | Texte du bouton principal |
| `coin`, `warning`, `success`, `danger` | or, jaune, vert, rose | Pièces, alertes, réussite, erreurs |
| `pack1`, `pack2`, `pack3` | teinte 24 %, 11 %, puis teinte + 55° à 29 % | Dégradé du booster |
| `packMotif`, `onPack` | clarté 78 %, presque blanc | Motif et texte du booster |

Dans `theme.js`, `backgroundGlow` devient la variable CSS `--background-glow`, `pack1` devient `--pack-1`. Toute variable absente garde sa valeur de `engine/style.css`.

**En ambiance claire**, `onAccent` est blanc : choisissez des couleurs de rareté assez foncées pour porter du texte blanc (pas de jaune vif).

### 7.2 Couleurs de rareté

Elles doivent se distinguer entre elles sans se confondre avec `accent`. Progression habituelle : neutre, froide, vive, chaude. Par défaut `#94a3b8`, `#38bdf8`, `#c084fc`, `#fbbf24`.

### 7.3 Motif sur mesure

Un `<svg viewBox="0 0 100 100">` de 1 à 5 formes, en `currentColor` uniquement, lisible à 22 px comme à 200 px. Il sert au booster, au dos des cartes, aux cartes cachées, à l'icône de l'onglet, aux attentes et aux cartes sans image.

### 7.4 Images

| | Recommandation |
|---|---|
| Format | WebP ou JPEG pour les photos, SVG pour les dessins simples |
| Proportions | 4:3 en paysage, sujet **centré** : le cadre recadre les bords |
| Taille | 1000 px de large au plus |
| Poids | 150 Ko visés, 400 Ko au plus |
| Logos (`fit: 'contain'`) | fond transparent, couleur claire en ambiance sombre |
| Noms de fichiers | identiques à l'`id` de la carte : `art/<id>.webp` |
| Cohérence | même cadrage, même lumière, même palette pour toutes |

Une image n'est chargée que lorsque sa carte est affichée : le poids total compte moins que le poids de chacune.

---

## 8. Base de données des cartes et des albums

### 8.1 Le modèle

~~~~text
rareté  1 ── n  carte  n ── 1  album
type    1 ── n  carte  n ── n  tag (facultatif)
~~~~

Une carte a **exactement** un album, un type et une rareté. L'`id` d'une carte est sa clé définitive : il est enregistré chez chaque joueur, dans les vitrines partagées et dans les échanges. Tout le reste peut changer.

### 8.2 Trois formes possibles

| Forme | Pour qui | Pour combien de cartes | Où |
|---|---|---|---|
| **A. Dans `theme.js`** | une personne à l'aise avec le code, ou un assistant | jusqu'à 40 | `cards: [ … ]` |
| **B. Fichiers séparés** | un assistant | 40 à 150 | `cards.js` et `albums.js`, importés |
| **C. Tableur CSV** | plusieurs personnes, sans code | dès que le tableur est plus commode | `data/*.csv` + `import-cards` |

Pour B et C, `theme.js` commence par :

~~~~js
import albums from './albums.js';
import cards from './cards.js';

export default {
    // …
    albums,
    cards,
};
~~~~

### 8.3 Forme C : le tableur

1. Créez `themes/<id>/data/cards.csv` et `albums.csv` depuis Excel, LibreOffice ou Google Sheets (enregistrer en **CSV UTF-8**). Séparateur `,` ou `;`, cellules sur plusieurs lignes acceptées.
2. Lancez l'import :

~~~~powershell
node tools/import-cards.mjs <id>
~~~~

3. Ne modifiez jamais `cards.js` à la main : il est réécrit à chaque import.

| Colonne de `cards.csv` | Exemple |
|---|---|
| `id` ● `name` ● `album` ● `type` ● `rarity` ● | `mars`, `Mars`, `planets`, `world`, `rare` |
| `subtitle`, `text`, `long` | texte libre |
| `image`, `background` | `art/mars.webp` |
| `fit` | vide ou `contain` |
| `tags` | `rouge\|rocheuse` |
| `stats` | `Diamètre=6 779 km\|Révolution=687 jours` |
| `links` | `Source=https://exemple.org` |
| `embed`, `embed_height` | adresse d'intégration, hauteur en pixels |

`albums.csv` : `id`, `label`. L'import refuse les colonnes inconnues, les doublons, les champs obligatoires vides, et **la disparition d'un `id` déjà publié** (sauf `--allow-removal`).

### 8.4 Créer les cartes selon la source (question C2)

**La liste est fournie.** Reprendre les données telles quelles. Signaler les manques (rareté, album, texte) et proposer de quoi les remplir, sans rien inventer sur des faits.

**Un tableur existe.** Faire correspondre ses colonnes à celles de 8.3, montrer la correspondance et 3 lignes converties, puis importer.

**Un dossier d'images.**
1. Lister les fichiers ; `id` = nom du fichier en minuscules, sans accents, espaces remplacés par des tirets.
2. Produire un `cards.csv` avec `id`, `name` et `image` remplis, le reste vide.
3. Faire remplir ou proposer album, type, rareté et textes.

**Un site ou une API.** Vérifier d'abord la licence et les conditions d'utilisation. Garder la source dans `links`. Enregistrer les images dans `art/`, sans les charger depuis le site d'origine.

**L'assistant propose la liste.**
1. Proposer les albums, avec le nombre de cartes de chacun.
2. Proposer la liste des noms, album par album ; faire valider.
3. Rédiger **5 cartes** complètes ; faire valider le ton.
4. Rédiger le reste par lots de 20.
5. **Vérifier chaque fait** (dates, chiffres, noms) ; signaler ceux qui n'ont pas pu l'être.
6. Images : fournies, dessinées en SVG, générées si la personne l'accepte, ou aucune.

**Relecture (D6).** Donner une table `id`, nom, album, rareté, texte à relire avant l'import. Contrôler : orthographe, longueurs, faits, répétitions, équilibre des albums.

### 8.5 Attribuer les raretés (question E2)

| Méthode | Comment |
|---|---|
| Choix de l'auteur | La personne désigne les plus rares ; le reste par quotas |
| **Quotas** (défaut) | 50 % / 30 % / 15 % / 5 %, arrondis, au moins 2 cartes dans la plus rare |
| Selon une mesure | Trier sur la mesure, puis couper par quotas. Écrire la règle dans la fiche du projet. |
| Par album | Au moins une carte de chaque rareté dans chaque album de 8 cartes ou plus |

La **chance d'une rareté** ne dépend que de son `weight`, pas de son nombre de cartes. La chance d'une carte précise est donc divisée par le nombre de cartes de sa rareté : 2 légendaires sortent chacune deux fois plus souvent que 4.

### 8.6 Gérer la base après le lancement

| Action | Comment | Effet chez les joueurs |
|---|---|---|
| Ajouter une carte | Nouvelle ligne avec un **nouvel** `id`, de préférence à la fin | Elle devient tirable ; la collection n'est plus complète |
| Corriger texte, image, stats | Modifier la ligne | Immédiat |
| Changer d'album ou de type | Modifier `album` ou `type` | Immédiat ; la progression suit |
| Changer de rareté | Modifier `rarity` | Immédiat, y compris le prix de revente |
| Changer l'ordre | Déplacer la ligne | Le numéro (3/50) change |
| Renommer une carte | Modifier `name`, **garder l'`id`** | Immédiat |
| **Changer un `id`** | À ne pas faire | Équivaut à supprimer la carte et à en créer une autre |
| **Supprimer une carte** | Retirer la ligne, `--allow-removal` | Les exemplaires possédés sont **perdus définitivement** à la prochaine sauvegarde |
| Ajouter un album | Nouvelle entrée dans `albums` | Nouveau tableau |
| Renommer un album | Modifier `label`, garder l'`id` | Immédiat |
| Supprimer un album | Déplacer d'abord ses cartes | Sinon le thème est refusé |
| Nouvelle édition | Nouvel album, nouvelles cartes à la fin, nouveau `pack.top` | Tout reste compatible |
| Changer prix, délais, chances | Modifier `theme.js` | Immédiat |
| **Changer l'`id` du thème** | À ne pas faire | Tout le monde repart de zéro |

**À chaque modification** : import (forme C), `check-theme`, essai local, relecture du différentiel git, publication. Le dépôt git sert d'historique et de sauvegarde.

### 8.7 Personnaliser l'aspect d'une carte

Sans toucher au moteur : image, `fit`, couleur et effet de la rareté, `subtitle`, `stats`, fond du détail. Pour une disposition différente, modifier `front()` dans `engine/card.js` et les règles `.tcard__*` de `style.css`, en gardant le format 5:7 et les tailles en `cqw` (elles suivent la largeur de la carte).

---

## 9. Règles du jeu

Ces règles sont celles du code de l'annexe. En cas de doute, le code fait foi.

### 9.1 Tirage d'un booster (`draw.js`)

1. Répéter `size` fois, sans deux fois la même carte dans un booster :
   - si c'est la dernière carte et qu'aucune carte tirée n'atteint `guaranteed`, ne garder que les cartes de cette rareté ou plus, s'il y en a ;
   - choisir une **rareté** au hasard selon les `weight` des raretés encore présentes ;
   - choisir une carte de cette rareté, à chances égales.
2. Si `mixTypes` et que toutes les cartes ont le même type alors qu'il en existe d'autres : retirer la moins rare et tirer une carte d'un autre type.
3. Trier de la moins rare à la plus rare.

Le tirage se fait dans **toutes** les cartes : les doubles sont possibles d'un booster à l'autre.

### 9.2 Boosters gratuits (`player.js`)

État : `{ stock, at }`, où `at` est le moment de la dernière recharge.

- Gain = `floor((maintenant − at) / (every × 60 000))`. Si `stock + gain ≥ max` : réserve pleine et `at` = maintenant. Sinon `at` avance de `gain` périodes, pour ne pas perdre le temps écoulé.
- Réserve pleine : le compte à rebours ne démarre qu'au prochain booster ouvert.
- Horloge reculée (`at` dans le futur) : `at` = maintenant.
- Un booster se paie gratuitement si possible, sinon avec des pièces. Le paiement a lieu **au moment où le paquet s'ouvre**, pas à son affichage.

### 9.3 Cartes, pièces, revente

- `count` exemplaires ; `spare` = `count − 1` : on garde toujours le premier.
- **Nouvelle** = non possédée à cet instant. **Prime** = seulement si la carte n'a *jamais* été possédée (`known`) : sans cela, deux joueurs se feraient des pièces en s'échangeant la même carte.
- Revente : les doubles seulement, au prix `sell`.
- « Tout révéler » donne un exemplaire de chaque carte, sans prime.

### 9.4 Favoris, étiquettes, vitrine

- Étiquettes : 12 au plus, 24 caractères, noms uniques sans tenir compte des majuscules. Créer un nom existant réutilise l'étiquette. Supprimer une étiquette la retire de toutes les cartes.
- Favoris et étiquettes d'une carte échangée sont gardés, et réapparaissent si on la récupère.
- Vitrine : titre de 40 caractères, pseudo de 20, `showcase.size` places. Une carte qu'on n'a plus en sort, et y revient si on la récupère.
- Lien : `#vitrine=<base64url>` du JSON `{ game, name, title, cards: [id] }`. À la lecture : autre `game` refusé, `id` inconnus et doublons retirés, longueurs limitées.

### 9.5 Échange en direct (`room.js`, `trade.js`)

**Liaison.** L'hôte crée un salon : identifiant PeerJS `tcg-<empreinte FNV-1a de l'id du jeu en base 36>-<code>`, où le code fait 5 caractères parmi `23456789ABCDEFGHJKMNPQRSTUVWXYZ`. L'invité s'y connecte (délai de 15 s). Un troisième joueur reçoit `full`. Le lien est `#room=<code>`.

**Messages** (JSON, version 2) :

| Message | Contenu | Effet |
|---|---|---|
| `hello` | `version, game, player, name, cards` | Présentation. Refus si la version ou le jeu diffère, ou si c'est le même joueur. |
| `cards` | `cards` | Liste à jour de ce que l'autre peut échanger |
| `offer` | `card` (ou `null`), `coins` | Son offre ; annule les deux accords |
| `request` | `card` | Demande une de vos cartes |
| `ready` | `ready, give, get` | Accord, **valable seulement si les deux offres rappelées sont celles affichées** |
| `commit` | `id, give, get` | L'hôte lance l'échange (délai de 8 s) |
| `done` | `id` | L'invité l'a appliqué ; l'hôte l'applique |
| `abort` | — | L'invité refuse : les accords sont annulés |

**Conditions** : chacun donne quelque chose, et il y a au moins une carte sur la table. Les pièces sont un entier de 0 au solde. Chaque joueur revérifie ce qu'il possède juste avant. Changer les messages oblige à augmenter `VERSION`.

### 9.6 Sauvegarde

Clé `localStorage` : `tcg-<id du thème>`.

~~~~json
{
    "owned": { "mars": 2 },
    "known": ["mars"],
    "coins": 140,
    "free": { "stock": 1, "at": 1795480080918 },
    "gifts": 3,
    "advent": { "start": "2026-12-01", "opened": [1, 2, 7] },
    "id": "identifiant aléatoire du joueur",
    "name": "pseudo",
    "favorites": ["mars"],
    "labels": [{ "id": "x1", "name": "À échanger", "color": "#f87171" }],
    "labelled": { "mars": ["x1"] },
    "showcase": { "title": "Mes préférées", "cards": ["mars"] }
}
~~~~

Toute valeur absente ou invalide reprend son défaut. Les `id` inconnus du thème sont ignorés. Un changement fait dans un autre onglet est repris (événement `storage`). Première visite = pas de sauvegarde.

### 9.7 Ordre au démarrage

1. Lien de vitrine : affichée tout de suite, puis booster de bienvenue si c'est la première visite.
2. Première visite : booster de bienvenue, puis salon éventuel.
3. Sinon : salon éventuel.

Le `#…` est retiré de l'adresse une fois lu. Une seule fenêtre à la fois.

### 9.8 Calendrier de l'Avent (`calendar.js`, `advent.js`)

- La case *n* s'ouvre le jour `start + n − 1`, à minuit, **heure locale du joueur**. Une case manquée reste ouvrable jusqu'à `end` inclus ; après, plus aucune.
- Chaque case s'ouvre une seule fois et donne ses boosters dans une réserve `gifts`, sans plafond et sans expiration. Le nombre est le même pour tout le monde (`advent.boosters`).
- Un booster se paie dans cet ordre : réserve gratuite, puis `gifts`, puis pièces. « Gratuit ×n » compte les deux réserves.
- Les cases ouvertes sont enregistrées avec la date `start` : changer `start` remet le calendrier à zéro pour tout le monde.
- Le bouton apparaît avant `start` (tout fermé) et disparaît après `end`. Une pastille compte les cases à ouvrir, aussi en bas de l'écran.
- Pour essayer : `?date=AAAA-MM-JJ` dans l'adresse simule un autre jour, **seulement sur `localhost` ou `127.0.0.1`**.
- Comme le reste de la sauvegarde, rien n'empêche un joueur d'avancer l'horloge de son ordinateur.

---

## 10. Interface

### 10.1 Page

De haut en bas : **bannière**, grand titre et slogan, **barre de collection**, **albums**, **filtres**, un tableau par album, pied de page. En bas à gauche, toujours visibles : solde, bouton de booster et, quand une case attend, rappel du calendrier.

- **Bannière** : collée en haut de l'écran. Logo ou motif, nom, liens du thème, puis Calendrier de l'Avent (avec le nombre de cases à ouvrir, caché hors calendrier), Échanger, Ma vitrine. Sous 768 px, les boutons passent sur leur propre ligne, avec le libellé court « Calendrier ».
- **Barre de collection** : « Collection n / total », progression, nombre par rareté ; boutons Ouvrir un booster, Vendre mes doubles (avec le montant, caché à zéro), Révéler (si permis), Recommencer (avec confirmation, caché si vide).
- **Albums** : « Tous les albums » puis un bouton par album, avec n / total et progression. Complet : vert, avec ✓. Un clic filtre.
- **Filtres** : Toutes, ♥ Favoris, étiquettes du thème, étiquettes du joueur (pastille de couleur). Se combinent avec l'album. Sans résultat : message.
- **Tableaux** : cases 5:7, de 232 px au moins (deux par ligne sur mobile) ; cartes découvertes d'abord.
- **Carte cachée** : motif pâle, « ? », « Carte non découverte » ; ni lien ni contenu.
- **Carte découverte** : recto ; « Nouveau » (découverte pendant la visite), « ×2 », pastilles d'étiquettes, cœur au survol (toujours visible sur écran tactile). Toutes ces marques sont dans l'élément incliné, donc solidaires de la carte.
- **Bouton de booster** : « Gratuit ×n », ou le prix, ou « Gratuit dans m:ss » et désactivé.

### 10.2 Ouverture d'un booster

| Phase | Comportement |
|---|---|
| Paquet | Flotte doucement. Glisser en travers le déchire (ouvert à 70 % de sa largeur) ; clic ou Entrée l'ouvre. Prix affiché. « Plus tard ». |
| Déchirure | La bande du haut (16 %) s'envole, le reste tombe ; 750 ms |
| Cartes | Une à la fois, de dos, sur la pile restante. « Tout retourner » mène au résultat. |
| Résultat | Toutes les cartes, « Nouveau +10 » ou « Double », revente des doubles du booster, autre booster |

**Clics sur une carte** (à respecter exactement) :

1. de dos → elle se retourne ;
2. **pendant** le suspense ou le retournement → l'animation est coupée et la carte s'affiche aussitôt ;
3. une fois retournée → elle part vers la droite en 180 ms, et la suivante est **déjà en place, de dos** ;
4. la dernière → résultat.

| Durée | Valeur |
|---|---|
| Retournement (affichage) | 400 ms |
| Délai avant qu'un clic passe à la suivante | 220 ms |
| Sortie de la carte | 180 ms, `translateX(120%) rotate(16deg)` |
| Entrée de la carte | 150 ms |

| Effet | Retournement | Anneau | Rayons | Reflet | Particules, suspense | Autre |
|---|---|---|---|---|---|---|
| `none` | oui | — | — | — | selon la rareté | — |
| `glow` | oui | 1 | — | blanc, suit le pointeur | selon la rareté | halo |
| `burst` | oui | 2 | 55 %, tournent | irisé | selon la rareté | halo |
| `legend` | oui | 3 | 95 %, plus grands | irisé | selon la rareté | flash blanc, sursaut, fond doré |

Pendant le suspense (`charge`), le dos tremble de plus en plus et s'entoure de la couleur de la rareté. Conseils : 0, 250, 700, 1300 ms et 0, 12, 28, 60 particules.

### 10.3 Carte

Format 5:7, perspective de 60 rem, inclinaison de ±9° vers le pointeur (pas au doigt). Recto de haut en bas : nom, illustration (50 %), « Type · sous-titre », texte, caractéristiques, rareté et numéro. Sous 12 rem de large : texte masqué, le reste grossi.

### 10.4 Détail

La carte quitte sa case (qui devient un contour pointillé) et vole en 650 ms jusqu'à gauche de l'écran ; retour en 450 ms. À droite : rareté, type, album, nom et cœur, sous-titre, texte, caractéristiques, liens, exemplaires et boutons (vendre, vitrine, échanger), étiquettes, média. Le média n'est chargé qu'une fois la carte posée, et retiré à la fermeture. Fermeture : croix, Échap, clic à côté. Sur mobile, la carte est au-dessus.

### 10.5 Échange

Salon : pseudo, « Créer un salon » (lien, QR code, code) ou « Rejoindre » (code). Table : deux emplacements face à face, pièces sous le sien (− / montant / +, par 10), bouton de validation, phrase d'état, mes cartes et les siennes (les inconnues restent face cachée, mais on peut les demander). Accord : contour vert et ✓. Exemplaire unique : avertissement. Échange : les cartes se croisent en 700 ms, puis résultat avec l'effet de la rareté. Départ de l'autre : message, retour au salon.

### 10.6 Vitrine

Composition : titre et pseudo modifiables, emplacements éclairés, flèches, retrait, glisser-déposer, choix dans ses cartes, partage. Vitrine reçue : lecture seule, « Vous l'avez » ou « Il vous manque ».

### 10.7 Accessibilité et confort

- Tout est utilisable au clavier ; contours de focus visibles ; fenêtres `role="dialog"`, le reste de la page en `inert`, focus rendu à la fermeture.
- Carte révélée, état de l'échange : annoncés (`aria-live`).
- `prefers-reduced-motion` : aucune animation, aucune attente, aucune particule.
- Aucune barre de défilement horizontale à 375 px.

---

## 11. Sécurité, vie privée et droits

**Ce que le site ne garantit pas.** Il n'a pas de serveur : un joueur peut modifier sa sauvegarde, donc ses cartes, ses pièces et sa vitrine. Entre amis, cela suffit. **Ne jamais** attacher d'argent réel ni de lot à une collection avec cette version.

**Données.** Tout reste dans le navigateur du joueur. Exceptions à annoncer :

- un **échange** passe par le service PeerJS (salon anonyme, adresse IP), puis les deux navigateurs se parlent directement ou par un relais ;
- un **lien de vitrine** contient le pseudo, le titre et les cartes ; la partie après `#` n'est pas envoyée à l'hébergeur ;
- une **police** Google, une **vidéo** ou un lecteur intégré contactent leur fournisseur.

Effacer les données du navigateur efface la partie. Il n'y a ni export ni synchronisation.

**Droits.** Ne publier que des images et des textes dont on a les droits. Pas de reprise d'un jeu, d'une marque ou d'un personnage existants sans autorisation. Pas de personne réelle sans son accord. Citer les sources et les licences (`footer`, `links`).

**Public.** Avec des mineurs : pas de publicité, pas d'achat, pseudos libres à surveiller, attention aux règles locales sur les tirages au sort.

---

## 12. Mise en ligne

Le dossier se publie tel quel sur n'importe quel hébergeur statique en **HTTPS** (requis pour les échanges et le partage).

**GitHub Pages** : pousser le dossier sur la branche publiée. Adresse : `https://<compte>.github.io/<dépôt>/tcg/`.

**Avant** : `check-theme` sans erreur, recette de la partie 14, accord explicite de la personne pour publier.

**Après** : ouvrir l'adresse, ouvrir un booster, créer un salon et le rejoindre depuis un téléphone en 4G.

**Mise à jour** : les navigateurs gardent les fichiers quelques minutes. Deux joueurs sur des versions d'échange différentes voient un message leur demandant de recharger.

**Retour arrière** : publier dans un seul commit, pour pouvoir l'annuler d'un `git revert`.

---

## 13. Aller plus loin

### 13.1 Retirer une fonction

| Fonction | Modifications |
|---|---|
| Échanges | `main.js` : retirer `tradeButton` de `menu.append(…)`, et la branche `room` de `openLink` ; `detail.js` : retirer le bloc `if (player.canTrade(card))` |
| Vitrine | `main.js` : retirer `showcaseButton` de `menu.append(…)` et la branche `vitrine` ; `detail.js` : retirer le bouton `showcase` |
| Calendrier de l'Avent | `theme.js` du thème : `advent: null` ; rien à changer dans le moteur |
| Étiquettes | `detail.js` : retirer `labelEditor(…)` ; `main.js` : retirer `player.labels` de `views()` |
| Favoris | `detail.js` et `main.js` : retirer `favoriteButton(…)` et `card.favorite` ; `main.js` : retirer la vue `favorites` |
| Revente | `main.js` : retirer `sellButton` ; `booster.js` : retirer `sell_booster` ; `detail.js` : retirer `sell(…)`. Prévoir une autre source de pièces, ou des boosters gratuits seulement. |
| Achat de boosters | Mettre un `boosterPrice` très élevé, et masquer le prix |

### 13.2 Changer un texte, la monnaie ou la langue

`texts` remplace n'importe quelle clé de `strings.js`. Pour la monnaie, remplacer au moins `coins_name` (avec une espace au début), `cards_reset_confirm`, `trade_intro`, `trade_slot_mine`, `trade_status_pick`, `trade_coins`, `trade_coins_got`. Pour une autre langue, traduire toutes les clés et régler `language`.

### 13.3 Son propre serveur de mise en relation

Héberger [PeerServer](https://github.com/peers/peerjs-server), puis `trade.server: { host: 'exemple.org', port: 443, path: '/peer', secure: true }`.

### 13.4 Idées non incluses

| Idée | Sans serveur ? | Où intervenir |
|---|---|---|
| Variantes brillantes | oui | `player.js` (compter par variante), `draw.js`, `card.js`, échanges (version 3) |
| Plusieurs boosters, booster quotidien | oui | `theme.js` (liste de boosters), `player.js`, `booster.js` |
| Cartes non tirables | oui | `main.js` : filtrer `cards` avant `drawBooster` |
| Récompense d'album | oui | `theme.js`, `player.js` (une seule fois par album, à mémoriser) |
| Duels, attaque et défense | oui, dans le salon d'échange | nouveau module sur `room.js` |
| Sons | oui | `booster.js`, après chaque action du joueur |
| Export et import de la sauvegarde | oui | `player.js` |
| Marché, enchères, guildes, classement, anti-triche | non | serveur et comptes |

---

## 14. Recette

Cocher, ou dire ce qui n'a pas été vérifié.

**Contenu**
- [ ] `check-theme` : 0 erreur, remarques lues
- [ ] Textes relus, faits vérifiés, droits confirmés
- [ ] Toutes les images s'affichent, sujet visible dans le cadre
- [ ] Durée pour tout compléter proche de G2

**Première visite** (navigation privée)
- [ ] Booster de bienvenue ; déchirure à la souris, au doigt, au clavier
- [ ] Les quatre comportements de clic de 10.2
- [ ] Résultat : « Nouveau », primes, solde exact
- [ ] Recharger : la collection est gardée, le booster de bienvenue ne revient pas

**Collection**
- [ ] Cartes cachées sans contenu, ni cliquables
- [ ] Albums : progression, filtre, album complet
- [ ] Doubles : « ×2 » solidaire de la carte inclinée, revente, jamais le dernier
- [ ] Booster gratuit : compte à rebours, réserve, achat, bouton désactivé
- [ ] Favoris, étiquettes (créer, renommer, supprimer), filtres combinés
- [ ] Détail : vol de la carte, média, fermeture des trois façons
- [ ] Recommencer, après confirmation

**À deux** (deux navigateurs ou deux adresses : `localhost` et `127.0.0.1` ont des sauvegardes séparées)
- [ ] Salon par lien, par code, par QR code ; code faux ; troisième joueur
- [ ] Carte contre carte, carte contre pièces, pièces des deux côtés ; soldes exacts
- [ ] Changer d'offre annule les accords ; départ en cours d'échange
- [ ] Exemplaire unique : la carte redevient cachée
- [ ] Deux réseaux différents, dont un téléphone en 4G

**Vitrine**
- [ ] Composer, réordonner, partager ; lien ouvert ailleurs, lien abîmé

**Technique**
- [ ] 375 px sans défilement horizontal ; tactile réel
- [ ] Chrome, Firefox, Safari
- [ ] Clavier seul ; `prefers-reduced-motion`
- [ ] Console sans erreur ; stockage bloqué : le jeu tourne quand même

---

## 15. Pièges connus

| Piège | Solution retenue |
|---|---|
| Ouvert en `file://`, rien ne s'affiche | Servir par HTTP |
| Un id de carte renommé fait perdre la carte aux joueurs | `id` définitifs ; l'import refuse leur disparition |
| La revente rembourse le booster : boosters illimités | Règle de G5, contrôlée par `check-theme` |
| Prime de découverte versée plusieurs fois par échange | `known` : une seule fois par carte |
| Marques (« ×2 », cœur) qui ne suivent pas l'inclinaison | Les mettre dans `.tcard__inner`, avec `translateZ(-1px) rotateY(180deg)` et côtés inversés |
| Contenu HTML imbriqué : bouton dans un bouton | Case cliquable à la souris, bouton invisible `.tile__open` pour le clavier |
| Retournement sans animation sur une carte tout juste ajoutée | Lire `getBoundingClientRect()` avant d'ajouter `is-flipped` |
| Clic ignoré juste après le retournement | Passer à l'état « retournée » dès 220 ms, sans attendre la fin de la transition |
| Animation en retard qui modifie un écran déjà quitté | Numéro de session (`session`, `visit`) vérifié après chaque attente |
| Animations gelées dans un onglet caché | Ne jamais attendre seulement `animation.finished` : y ajouter un délai |
| Rayons qui créent une barre de défilement | `overflow: clip` sur la scène |
| Résultat coupé en haut sur mobile | Fenêtre en bloc, scène en `min-height: 100%` |
| Cases mélangées un instant au filtrage | Pas de `transition: all` sur les cases : `order` s'anime |
| Classe CSS déjà prise par un framework (`.table` de Tailwind) | Noms propres au moteur ; aucun framework dans la page |
| Carte retirée du filtre pendant que son détail est ouvert | Sa case reste en place (`is-out`) jusqu'à la fermeture |
| Deux onglets ouverts | Événement `storage`, et paiement revérifié à l'ouverture |
| Lien d'invitation qui perd le thème | Garder `location.search` dans les liens |
| Échange avec soi-même dans deux onglets | Identifiant de joueur dans `hello` |
| Accord donné pour une offre changée au même instant | `ready` et `commit` rappellent les deux offres |
| Nom du jeu visible par le service de mise en relation | Empreinte du nom dans l'identifiant du salon |
| `crypto.randomUUID` absent hors HTTPS | Valeur de repli pour l'identifiant |
| CSV d'Excel : `;`, BOM, guillemets | Gérés par `import-cards` |

---

## Annexe — code source

Code complet et testé du moteur, du thème de départ et des outils. Un assistant n'a pas besoin de le lire en entier : l'étape 1 de la partie 4 l'extrait automatiquement. Après une modification du moteur, `node tools/guide.mjs update` remet cette annexe à jour.

<!-- ANNEXE : produite par tools/guide.mjs, ne pas modifier à la main -->

### `index.html`

~~~~html
<!DOCTYPE html>
<!-- data-theme : dossier du thème à afficher, dans themes/ -->
<html lang="fr" data-theme="g4f-tcg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>G4F TCG</title>
    <link rel="stylesheet" href="engine/style.css">
    <script type="module" src="engine/main.js"></script>
</head>
<body>
    <noscript>Ce jeu a besoin de JavaScript. This game requires JavaScript.</noscript>
</body>
</html>
~~~~

### `engine/advent.js`

~~~~js
// Fenêtre du calendrier de l'Avent : une porte par jour, qui s'ouvre sur des boosters offerts.
import { burst, el, setText, text } from './card.js';
import { parseDay } from './calendar.js';
import { createModal } from './modal.js';
import { motif } from './motif.js';
import { t } from './strings.js';

// Les portes sont dispersées comme sur un vrai calendrier ; la même disposition pour tout le monde.
const ORDER_24 = [13, 4, 20, 9, 1, 17, 22, 6, 11, 15, 2, 19, 24, 8, 14, 3, 21, 10, 5, 18, 12, 23, 7, 16];

/** onPlay : ouvrir les boosters reçus ; onChange : après l'ouverture d'une case. */
export function createAdvent({ player, language, onPlay, onChange }) {
    const closeButton = el('button', 'detail__close', { type: 'button', textContent: '×' });
    const title = text('h2', 'advent__title', 'advent_title');
    title.id = 'advent-title';
    const intro = el('p', 'advent__intro');
    const grid = el('div', 'advent__grid');
    const message = el('p', 'advent__message');
    message.setAttribute('aria-live', 'polite');
    const actions = el('div', 'booster__actions');
    const overlay = el('div', 'advent', {},
        el('div', 'advent__layout', {}, title, intro, grid, el('div', 'advent__footer', {}, message, actions)),
        closeButton);
    overlay.setAttribute('aria-labelledby', 'advent-title');
    const modal = createModal(overlay, close);

    const formatDate = (date) => {
        const value = new Intl.DateTimeFormat(language, { day: 'numeric', month: 'long' }).format(date);
        return language.startsWith('fr') && date.getDate() === 1 ? value.replace(/^1(?=\s)/, '1er') : value; // « 1er décembre »
    };
    const unit = (count) => t(count > 1 ? 'advent_boosters' : 'advent_booster');

    /** Contenu d'une case ouverte : le paquet et le nombre de boosters. */
    const inside = (boosters) => [motif(), el('strong', 'advent__amount', { textContent: `×${boosters}` }), el('span', 'advent__unit', { textContent: unit(boosters) })];

    function door(box, isLast) {
        const node = el('button', `advent__door${isLast ? ' advent__door--last' : ''}`, { type: 'button' },
            el('span', 'advent__inside', {}, ...(box.isOpened ? inside(box.boosters) : [])),
            el('span', 'advent__leaf', {}, el('span', 'advent__number', { textContent: box.day })));
        node.dataset.state = box.isOpened ? 'opened' : box.canOpen ? 'ready' : 'locked';
        const label = `${t('advent_day')} ${box.day}`;
        node.setAttribute('aria-label', box.isOpened ? `${label}, ${box.boosters} ${unit(box.boosters)}`
            : box.isLocked ? `${label}, ${t('advent_locked')} ${formatDate(box.date)}` : label);
        node.addEventListener('click', () => {
            if (node.dataset.state === 'ready') openDoor(node, box);
            else if (node.dataset.state === 'opened') message.textContent = `${t('advent_day')} ${box.day} : ${t('advent_opened').toLowerCase()}.`;
            else if (box.isLocked) message.textContent = `${t('advent_locked')} ${formatDate(box.date)}.`;
        });
        return node;
    }

    function openDoor(node, box) {
        const boosters = player.openAdvent(box.day);
        if (!boosters) { // déjà ouverte dans un autre onglet, ou jour passé entre-temps
            render();
            return;
        }
        node.querySelector('.advent__inside').replaceChildren(...inside(boosters));
        node.dataset.state = 'opened';
        node.classList.add('is-opening');
        node.setAttribute('aria-label', `${t('advent_day')} ${box.day}, ${boosters} ${unit(boosters)}`);
        burst(node, { color: getComputedStyle(document.documentElement).getPropertyValue('--coin'), particles: 10 + boosters * 6 });
        message.textContent = `${t('advent_got')} ${boosters} ${unit(boosters)} !`;
        onChange();
        showActions();
    }

    function showActions() {
        const ready = player.freeBoosters;
        actions.replaceChildren();
        if (!ready) return;
        const play = el('button', 'booster__btn booster__btn--main', { type: 'button' }, text('span', '', 'advent_play'), ` ×${ready}`);
        play.addEventListener('click', () => {
            close();
            onPlay();
        });
        actions.append(play);
    }

    function render() {
        const { advent } = player.rules;
        const days = player.adventDays;
        const byDay = new Map(days.map((box) => [box.day, box]));
        const order = days.length === ORDER_24.length ? ORDER_24 : days.map(({ day }) => day);
        grid.replaceChildren(...order.map((day) => door(byDay.get(day), day === days.length)));

        const status = player.adventStatus;
        if (status === 'soon') intro.textContent = `${t('advent_soon')} ${formatDate(parseDay(advent.start))}.`;
        else if (status === 'over') setText(intro, 'advent_over');
        else intro.textContent = `${t('advent_intro')} ${t('advent_until')} ${formatDate(parseDay(advent.end))}.`;
        showActions();
    }

    function open() {
        if (!overlay.hidden) return;
        closeButton.setAttribute('aria-label', t('cards_close'));
        message.textContent = '';
        modal.open();
        overlay.scrollTop = 0;
        render();
        (grid.querySelector('[data-state="ready"]') ?? closeButton).focus({ preventScroll: true });
    }

    function close() {
        if (overlay.hidden) return;
        modal.close();
        grid.replaceChildren();
    }

    closeButton.addEventListener('click', close);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    return { open };
}
~~~~

### `engine/booster.js`

~~~~js
// Ouverture d'un booster : on déchire le paquet, on retourne les cartes une à une, puis on voit le résultat.
import { actionButton as button, burst, coins, createCard, el, reducedMotion, setText, text } from './card.js';
import { createModal } from './modal.js';
import { motif } from './motif.js';
import { t } from './strings.js';

const FLIP = 220; // en millisecondes : passé ce temps, la carte est lisible et un clic passe à la suivante
const LEAVE = 180; // sortie de la carte vue
const CLICK_THRESHOLD = 6; // en pixels : en dessous, c'est un clic et non un geste de déchirure
const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/**
 * draw() paie et renvoie les cartes du booster, déjà ajoutées à la collection : [{ card, isNew, reward }], ou null si on ne peut pas payer.
 * onChange est appelé après une vente, onClose à la fermeture avec le nombre de cartes ouvertes.
 */
export function createBooster({ player, pack: packTexts, size, draw, describe, onRevealAll, onChange, onClose }) {
    const { cards } = player;
    const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent');
    const title = text('h2', 'booster__title', 'cards_welcome_title');
    title.id = 'booster-title';
    const intro = text('p', 'booster__intro', 'cards_welcome_text');
    const stage = el('div', 'booster__stage');
    const hint = text('p', 'booster__hint', 'cards_open_hint');
    const live = el('p', 'booster__live');
    live.setAttribute('aria-live', 'polite');
    const actions = el('div', 'booster__actions');
    const overlay = el('div', 'booster', {}, el('div', 'booster__scene', {}, title, intro, stage, hint, actions), live);
    overlay.setAttribute('aria-labelledby', 'booster-title');
    const modal = createModal(overlay, close);

    let session = 0; // change à chaque ouverture ou fermeture : une animation en retard ne touche plus la scène
    let opened = 0;

    function setPhase(phase) {
        overlay.dataset.phase = phase;
        overlay.classList.remove('is-flashing');
        overlay.scrollTop = 0;
    }

    // --- 1. Le paquet ---

    function showPack(isWelcome) {
        session++;
        setPhase('pack');
        setText(title, isWelcome ? 'cards_welcome_title' : 'cards_pack_title');
        setText(intro, isWelcome ? 'cards_welcome_text' : 'cards_pack_text');
        setText(hint, 'cards_open_hint');

        const half = (part) => el('span', `pack__half pack__half--${part}`, {},
            el('span', 'pack__art', {},
                el('span', 'pack__brand', { textContent: packTexts.top }),
                motif(),
                el('span', 'pack__label', { textContent: packTexts.label }),
                el('span', 'pack__count', { textContent: `× ${size}` })));
        const pack = el('button', 'pack', { type: 'button' }, half('bottom'), half('top'), el('span', 'pack__cut'));
        pack.setAttribute('aria-label', t('cards_open_booster'));
        bindTear(pack, () => openPack(pack));
        stage.replaceChildren(pack);

        actions.replaceChildren(priceLabel(), button('cards_later', 'booster__link', close));
        if (onRevealAll) actions.append(button('cards_reveal_all', 'booster__link', () => { onRevealAll(); close(); }));
        pack.focus({ preventScroll: true });
    }

    /** Prix du prochain booster. */
    function priceLabel() {
        const free = player.freeBoosters;
        return el('p', 'booster__price', {}, ...(free > 0
            ? [text('span', '', 'booster_free'), ` × ${free}`]
            : [text('span', '', 'booster_cost'), ' ', coins(player.rules.economy.boosterPrice)]));
    }

    /** Glisser en travers du paquet le déchire ; un clic, ou Entrée au clavier, l'ouvre directement. */
    function bindTear(pack, onOpen) {
        let startX = null;
        let dragged = false;
        let done = false;
        const setTear = (value) => pack.style.setProperty('--tear', value);
        const open = () => {
            if (done) return;
            done = true;
            startX = null;
            setTear(1);
            onOpen();
        };

        pack.addEventListener('pointerdown', (event) => {
            if (event.button !== 0 || done) return;
            startX = event.clientX;
            dragged = false;
            pack.setPointerCapture(event.pointerId);
        });
        pack.addEventListener('pointermove', (event) => {
            if (startX === null) return;
            const distance = Math.abs(event.clientX - startX);
            dragged ||= distance >= CLICK_THRESHOLD;
            if (!dragged) return;
            const tear = Math.min(distance / (pack.offsetWidth * 0.7), 1);
            pack.classList.add('is-tearing');
            setTear(tear);
            if (tear === 1) open();
        });
        for (const type of ['pointerup', 'pointercancel']) {
            pack.addEventListener(type, () => {
                startX = null;
                pack.classList.remove('is-tearing');
                if (!done) setTear(0);
            });
        }
        pack.addEventListener('click', (event) => {
            if (event.detail === 0 || !dragged) open(); // detail vaut 0 au clavier
        });
    }

    async function openPack(pack) {
        const current = session;
        const drawn = draw();
        if (!drawn) { // payé entre-temps dans un autre onglet
            close();
            return;
        }
        opened += drawn.length;
        for (const { card } of drawn) if (card.image) new Image().src = card.image;
        actions.replaceChildren();
        pack.classList.add('is-open');
        burst(stage, { color: accent(), particles: 24 });
        await wait(reducedMotion() ? 0 : 750);
        if (current === session) showDeck(drawn);
    }

    // --- 2. Les cartes, une à une ---

    function showDeck(drawn) {
        setPhase('deck');
        actions.replaceChildren(button('cards_skip', 'booster__link', () => showSummary(drawn)));
        showDeckCard(drawn, 0);
    }

    function showDeckCard(drawn, index) {
        const current = ++session;
        const { card, isNew, reward } = drawn[index];
        const { rarity } = card;
        overlay.classList.remove('is-flashing');
        setText(hint, 'cards_flip_hint');

        const node = createCard('button', card, describe(card), cards.indexOf(card) + 1, cards.length);
        node.classList.add('tcard--deck');
        node.setAttribute('aria-label', `${t('cards_face_down')} ${index + 1}/${drawn.length}`);

        const fx = el('div', 'fx', {}, el('span', 'fx__rays'), el('span', 'fx__ring'));
        fx.dataset.effect = rarity.effect;
        fx.style.setProperty('--rarity', rarity.color);
        // Cartes restantes, visibles en dessous.
        const pile = el('div', 'pile');
        for (let i = 1; i < drawn.length - index; i++) {
            const under = el('span', 'pile__card');
            under.style.setProperty('--depth', i);
            pile.append(under);
        }
        stage.replaceChildren(fx, pile, node, el('p', 'booster__counter', { textContent: `${index + 1} / ${drawn.length}` }));

        let state = 'down';
        let skip = () => {}; // abrège l'attente en cours
        const skippable = (ms) => Promise.race([wait(ms), new Promise((resolve) => { skip = resolve; })]);

        async function flip() {
            state = 'revealing';
            if (!reducedMotion() && rarity.charge) {
                node.classList.add('is-charging');
                node.style.setProperty('--charge', `${rarity.charge}ms`);
                await skippable(rarity.charge);
                if (current !== session) return;
                node.classList.remove('is-charging');
            }
            node.getBoundingClientRect(); // une carte tout juste posée doit être dessinée de dos pour que le retournement s'anime
            node.classList.add('is-flipped');
            fx.classList.add('is-active');
            if (rarity.effect === 'legend' && !node.classList.contains('is-instant')) overlay.classList.add('is-flashing');
            burst(stage, rarity);
            const status = t(isNew ? 'cards_new' : 'cards_double');
            const announced = `${describe(card).name}, ${t(`rarity_${rarity.id}`)}, ${status}`;
            stage.append(statusTag(isNew, reward));
            live.textContent = announced;
            node.setAttribute('aria-label', announced);
            setText(hint, index + 1 < drawn.length ? 'cards_next_hint' : 'cards_end_hint');
            if (!reducedMotion() && !node.classList.contains('is-instant')) await skippable(FLIP);
            if (current === session) state = 'up';
        }

        node.addEventListener('click', () => {
            if (state === 'down') {
                flip();
            } else if (state === 'revealing') {
                // Clic pendant l'animation : la carte s'affiche aussitôt.
                node.classList.add('is-instant');
                overlay.classList.remove('is-flashing');
                skip();
            } else if (state === 'up') {
                state = 'left';
                if (index + 1 < drawn.length) {
                    showDeckCard(drawn, index + 1);
                    flyOut(node);
                } else showSummary(drawn);
            }
        });
        node.focus({ preventScroll: true });
    }

    /** La carte vue s'envole par-dessus la suivante, déjà en place : rien n'attend la fin de ce mouvement. */
    function flyOut(node) {
        if (reducedMotion()) return;
        node.classList.replace('tcard--deck', 'tcard--leaving');
        node.inert = true;
        stage.append(node);
        node.animate(
            [
                { transform: 'none', opacity: 1 },
                { opacity: 1, offset: 0.5 },
                { transform: 'translateX(120%) rotate(16deg)', opacity: 0 },
            ],
            { duration: LEAVE, easing: 'ease-in', fill: 'forwards' },
        );
        setTimeout(() => node.remove(), LEAVE);
    }

    /** « Nouveau +10 » ou « Double ». */
    function statusTag(isNew, reward) {
        const tag = el('p', `status-tag${isNew ? ' is-new' : ''}`, {}, text('span', '', isNew ? 'cards_new' : 'cards_double'));
        if (reward) tag.append(' ', coins(reward, '+'));
        return tag;
    }

    // --- 3. Le résultat ---

    function showSummary(drawn) {
        session++;
        setPhase('summary');
        setText(title, player.isComplete ? 'cards_complete' : 'cards_summary_title');
        setText(hint, 'cards_summary_hint');
        stage.replaceChildren(...drawn.map(({ card, isNew, reward }, i) => {
            const node = createCard('div', card, describe(card), cards.indexOf(card) + 1, cards.length);
            node.classList.add('is-flipped');
            const item = el('div', 'booster__item', {}, node, statusTag(isNew, reward));
            item.style.setProperty('--i', i);
            return item;
        }));
        showSummaryActions(drawn);
        actions.querySelector('.booster__btn--main').focus({ preventScroll: true });
    }

    function showSummaryActions(drawn) {
        actions.replaceChildren(button('cards_see_collection', 'booster__btn booster__btn--main', close));
        if (player.canOpenBooster) actions.append(button('cards_again', 'booster__btn', () => showPack(false)), priceLabel());

        const doubles = drawn.filter(({ card, isNew }) => !isNew && player.spare(card) > 0).map(({ card }) => card);
        if (!doubles.length) return;
        const value = doubles.reduce((sum, card) => sum + player.sellPrice(card), 0);
        actions.prepend(button('sell_booster', 'booster__btn booster__btn--coins', () => {
            for (const card of doubles) player.sell(card);
            onChange();
            stage.querySelectorAll('.status-tag:not(.is-new)').forEach((tag) => tag.replaceChildren(text('span', '', 'sell_done')));
            for (const result of drawn) if (doubles.includes(result.card)) result.isNew = true; // vendu : plus rien à vendre ici
            showSummaryActions(drawn);
            actions.querySelector('.booster__btn--main').focus({ preventScroll: true });
        }, ' ', coins(value, '+')));
    }

    // --- Ouverture et fermeture ---

    function open({ isWelcome = false } = {}) {
        if (!overlay.hidden || !player.canOpenBooster) return;
        opened = 0;
        modal.open();
        showPack(isWelcome);
    }

    function close() {
        session++;
        modal.close();
        stage.replaceChildren();
        onClose(opened);
    }

    return { open };
}
~~~~

### `engine/calendar.js`

~~~~js
// Calendrier de l'Avent : quelles cases peuvent s'ouvrir, et quand. Sans affichage : se teste sous Node.
// Les jours suivent l'heure locale du joueur.

/** Vrai pour une date 'AAAA-MM-JJ' qui existe. */
export function isDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = parseDay(value);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/** 'AAAA-MM-JJ' → ce jour à minuit, heure locale. */
export function parseDay(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/** Minuit du jour de time (millisecondes). */
export function startOfDay(time) {
    const date = new Date(time);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Vrai si le jour de now est entre from et to inclus ('AAAA-MM-JJ'). */
export function isBetween(from, to, now) {
    const today = startOfDay(now).getTime();
    return today >= parseDay(from).getTime() && today <= parseDay(to).getTime();
}

/** Avant, pendant ou après le calendrier : 'none' (pas de calendrier), 'soon', 'open' ou 'over'. */
export function adventStatus(advent, now) {
    if (!advent) return 'none';
    const today = startOfDay(now).getTime();
    if (today < parseDay(advent.start).getTime()) return 'soon';
    return today > parseDay(advent.end).getTime() ? 'over' : 'open';
}

/**
 * Cases du calendrier, de la première à la dernière : [{ day, boosters, date, isOpened, isLocked, canOpen }].
 * advent : { start, end, boosters } du thème ; opened : ensemble des numéros de cases déjà ouvertes.
 * Une case s'ouvre à partir de son jour, une seule fois, et jusqu'à la fin du calendrier.
 */
export function adventDays(advent, now, opened) {
    if (!advent) return [];
    const isOver = adventStatus(advent, now) === 'over';
    const today = startOfDay(now).getTime();
    const start = parseDay(advent.start);
    return advent.boosters.map((boosters, i) => {
        const day = i + 1;
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const isOpened = opened.has(day);
        const isLocked = today < date.getTime();
        return { day, boosters, date, isOpened, isLocked, canOpen: !isOpened && !isLocked && !isOver };
    });
}
~~~~

### `engine/card.js`

~~~~js
// Aspect d'une carte à collectionner, et effets d'apparition selon sa rareté.
import { motif } from './motif.js';
import { t } from './strings.js';

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function el(tag, className = '', props = {}, ...children) {
    const node = Object.assign(document.createElement(tag), { className }, props);
    node.append(...children);
    return node;
}

/** Élément qui affiche un texte de strings.js ou du thème. */
export function text(tag, className, key) {
    const node = el(tag, className);
    setText(node, key);
    return node;
}

export function setText(node, key) {
    node.textContent = t(key);
}

/** Montant en pièces. */
export function coins(amount, prefix = '') {
    return el('span', 'coins', {}, `${prefix}${amount}`, text('span', 'sr-only', 'coins_name'));
}

/** Bouton, avec un montant optionnel après son texte. */
export function actionButton(key, className, onClick, ...extra) {
    const node = el('button', className, { type: 'button' }, text('span', '', key), ...extra);
    node.addEventListener('click', onClick);
    return node;
}

/** Illustration : l'image de la carte, ou le motif du thème si elle n'en a pas. */
function art({ image, fit }) {
    if (!image) return el('span', 'tcard__art tcard__art--motif', {}, motif());
    return el('span', `tcard__art${fit === 'contain' ? ' tcard__art--contain' : ''}`, {}, el('img', '', { src: image, alt: '' }));
}

/** Caractéristiques : [{ label, value }]. */
export function statList(stats, className) {
    return el('span', className, {}, ...stats.map(({ label, value }) => el('span', '', {}, `${label} `, el('b', '', { textContent: value }))));
}

/** Recto d'une carte. info : voir describe() dans theme.js. */
function front(card, info, number, total) {
    const type = el('span', 'tcard__type', {}, text('span', '', `type_${card.type}`));
    if (info.subtitle) type.append(` · ${info.subtitle}`);

    return el('span', 'tcard__face tcard__front', {},
        el('span', 'tcard__name', { textContent: info.name }),
        art(info),
        type,
        el('span', 'tcard__text', { textContent: info.text }),
        ...(info.stats.length ? [statList(info.stats, 'tcard__stats')] : []),
        el('span', 'tcard__footer', {},
            text('span', 'tcard__rarity', `rarity_${card.rarity.id}`),
            el('span', '', { textContent: `${number}/${total}` })),
        el('span', 'tcard__holo'));
}

/** tag vaut 'button' pour une carte à retourner, 'div' pour une carte déjà visible. */
export function createCard(tag, card, info, number, total) {
    const inner = el('span', 'tcard__inner', {},
        el('span', 'tcard__face tcard__back', {}, motif()),
        front(card, info, number, total));
    const node = el(tag, 'tcard', {}, inner);
    if (tag === 'button') node.type = 'button';
    node.dataset.effect = card.rarity.effect;
    node.style.setProperty('--rarity', card.rarity.color);
    followPointer(node);
    return node;
}

/** La carte s'incline vers le pointeur et son reflet le suit. */
function followPointer(node) {
    node.addEventListener('pointermove', (event) => {
        if (event.pointerType === 'touch' || reducedMotion()) return;
        const box = node.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width;
        const y = (event.clientY - box.top) / box.height;
        node.style.setProperty('--mx', `${x * 100}%`);
        node.style.setProperty('--my', `${y * 100}%`);
        node.style.setProperty('--tilt-x', `${(0.5 - y) * 18}deg`);
        node.style.setProperty('--tilt-y', `${(x - 0.5) * 18}deg`);
    });
    node.addEventListener('pointerleave', () => {
        for (const name of ['--mx', '--my', '--tilt-x', '--tilt-y']) node.style.removeProperty(name);
    });
}

/** Particules qui partent du centre de la scène. */
export function burst(stage, { color, particles }) {
    if (reducedMotion()) return;
    for (let i = 0; i < particles; i++) {
        const particle = el('span', 'particle');
        const angle = Math.random() * Math.PI * 2;
        const distance = 140 + Math.random() * 260;
        const size = 3 + Math.random() * 6;
        particle.style.cssText = `width:${size}px;height:${size}px;background:${Math.random() < 0.25 ? '#ffffff' : color}`;
        stage.append(particle);
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        particle.animate(
            [
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y + 60}px)) scale(0)`, opacity: 0 },
            ],
            { duration: 900 + Math.random() * 900, easing: 'cubic-bezier(0.1, 0.7, 0.3, 1)', fill: 'forwards' },
        ).finished.finally(() => particle.remove());
    }
}
~~~~

### `engine/detail.js`

~~~~js
// Détail d'une carte de la collection : elle sort de sa case et se pose à gauche, ses informations s'affichent à droite.
import { actionButton, coins, createCard, el, reducedMotion, setText, statList, text } from './card.js';
import { favoriteButton, labelEditor } from './labels.js';
import { createModal } from './modal.js';
import { t } from './strings.js';

const FLIGHT = 650; // durée du trajet, en millisecondes
const RETURN = 450;

/** Fin d'un trajet. Une animation est gelée dans un onglet caché : on n'attend jamais beaucoup plus que sa durée. */
const landed = (flight, duration) => Promise.race([
    flight.finished.catch(() => {}), // annulée si on ferme en cours de route
    new Promise((resolve) => { setTimeout(resolve, duration + 150); }),
]);

export function createDetail({ player, describe, onChange, onTrade, onClose }) {
    const { cards } = player;
    const owned = el('div', 'detail__owned');
    const background = el('div', 'detail__bg');
    const closeButton = el('button', 'detail__close', { type: 'button', textContent: '×' });
    const slot = el('div', 'detail__card');
    const info = el('div', 'detail__info');
    const layout = el('div', 'detail__layout', {}, slot, info);
    const overlay = el('div', 'detail', {}, background, layout, closeButton);
    overlay.setAttribute('aria-labelledby', 'detail-title');
    const modal = createModal(overlay, close);

    let current = null; // carte affichée
    let node = null; // sa version agrandie
    let isClosing = false;

    /** Transformation qui ramène la grande carte sur la case de la collection. */
    function toTile() {
        const tile = current.node.getBoundingClientRect();
        const big = slot.getBoundingClientRect(); // la case de gauche a la taille de la carte et n'est jamais transformée
        const x = tile.left + tile.width / 2 - (big.left + big.width / 2);
        const y = tile.top + tile.height / 2 - (big.top + big.height / 2);
        return `translate(${x}px, ${y}px) scale(${tile.width / big.width})`;
    }

    function fill(card) {
        const content = describe(card);
        const title = el('h2', 'detail__title', { textContent: content.name });
        title.id = 'detail-title';
        const description = el('div', 'detail__text', { textContent: content.long });

        info.replaceChildren(
            el('p', 'detail__meta', {}, text('span', 'detail__rarity', `rarity_${card.rarity.id}`), text('span', '', `type_${card.type}`), text('span', 'detail__album', `album_${card.album}`)),
            el('div', 'detail__heading', {}, title, favoriteButton(player, card, 'favorite', onChange).node));
        if (content.subtitle) info.append(el('p', 'detail__subtitle', { textContent: content.subtitle }));
        info.append(description);
        if (content.stats.length) info.append(statList(content.stats, 'detail__stats'));
        if (content.links.length) info.append(el('p', 'detail__links', {}, ...content.links.map(({ label, url }) => el('a', '', { href: url, target: '_blank', rel: 'noopener', textContent: label }))));
        info.append(owned, labelEditor(player, card, onChange));
        showOwned(card);
        info.scrollTop = 0;

        overlay.scrollTop = 0;
        overlay.style.setProperty('--rarity', card.rarity.color);
        background.style.backgroundImage = content.background ? `url("${content.background}")` : '';
        closeButton.setAttribute('aria-label', t('cards_close'));
        return content;
    }

    /** Exemplaires possédés, et ce qu'on peut en faire. */
    function showOwned(card) {
        const spare = player.spare(card);
        owned.replaceChildren(el('p', 'detail__count', {}, text('span', '', 'detail_copies'), ` ${player.count(card)}`));
        const sell = (key, amount) => actionButton(key, 'booster__btn booster__btn--coins', () => {
            player.sell(card, amount);
            onChange();
            showOwned(card);
            (owned.querySelector('button') ?? closeButton).focus({ preventScroll: true });
        }, ' ', coins(amount * player.sellPrice(card), '+'));
        if (spare > 0) owned.append(sell('sell_one', 1));
        if (spare > 1) owned.append(sell('sell_all', spare));
        const showcase = actionButton('showcase_add', 'booster__btn', () => {
            player.toggleShowcase(card);
            onChange();
            showShowcase();
        });
        const showShowcase = () => {
            const isShown = player.isInShowcase(card);
            const isFull = !isShown && player.showcase.cards.length >= player.rules.showcase.size;
            showcase.setAttribute('aria-pressed', isShown);
            showcase.disabled = isFull;
            setText(showcase.firstChild, isFull ? 'showcase_full' : isShown ? 'showcase_take' : 'showcase_add');
        };
        showShowcase();
        owned.append(showcase);
        if (player.canTrade(card)) {
            owned.append(actionButton('trade_open', 'booster__btn', async () => {
                await close();
                onTrade(card);
            }));
        }
    }

    /** Le lecteur n'est chargé qu'une fois la carte posée, pour ne pas saccader le trajet. */
    function addEmbed({ name, embed }) {
        if (!embed) return;
        const frame = el('iframe', 'detail__embed', { src: embed.src, title: name });
        if (embed.height) {
            frame.style.height = `${embed.height}px`;
            frame.style.aspectRatio = 'auto';
        }
        frame.allow = 'autoplay; encrypted-media; fullscreen';
        info.append(frame);
    }

    async function open(card) {
        if (current) return;
        current = card;
        const content = fill(card);
        node = createCard('div', card, content, cards.indexOf(card) + 1, cards.length);
        node.classList.add('is-flipped', 'tcard--detail');
        slot.replaceChildren(node);
        modal.open();
        closeButton.focus({ preventScroll: true });
        card.node.classList.add('is-out'); // sa case reste vide
        overlay.classList.remove('is-closing');

        if (!reducedMotion()) {
            overlay.classList.add('is-moving');
            const start = toTile();
            const flight = node.animate(
                [
                    { transform: start },
                    { transform: `${start} translateY(-6%) scale(1.06)`, offset: 0.2 }, // elle se soulève de sa case
                    { transform: 'none' },
                ],
                { duration: FLIGHT, easing: 'cubic-bezier(0.3, 0.7, 0.2, 1)' },
            );
            await landed(flight, FLIGHT);
            if (current !== card || isClosing) return;
            overlay.classList.remove('is-moving');
        }
        addEmbed(content);
    }

    async function close() {
        if (!current || isClosing) return;
        isClosing = true;
        info.querySelector('iframe')?.remove(); // coupe le son
        overlay.classList.add('is-closing', 'is-moving');
        if (!reducedMotion()) {
            const from = getComputedStyle(node).transform;
            for (const animation of node.getAnimations()) animation.cancel();
            const flight = node.animate(
                [{ transform: from }, { transform: toTile() }],
                { duration: RETURN, easing: 'cubic-bezier(0.4, 0, 0.3, 1)', fill: 'forwards' },
            );
            await landed(flight, RETURN);
        }
        current.node.classList.remove('is-out');
        overlay.classList.remove('is-moving');
        modal.close();
        slot.replaceChildren();
        info.replaceChildren();
        current = node = null;
        isClosing = false;
        onClose();
    }

    closeButton.addEventListener('click', close);
    // Un clic à côté de la carte et du texte ferme aussi.
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay || event.target === layout || event.target === background) close();
    });

    return { open };
}
~~~~

### `engine/draw.js`

~~~~js
// Tirage des boosters.

function pickOne(list, random) {
    return list[Math.floor(random() * list.length)];
}

/** Choisit d'abord une rareté selon son poids, parmi celles encore présentes, puis une carte de cette rareté. */
function pickWeighted(cards, random) {
    const rarities = [...new Set(cards.map((card) => card.rarity))];
    let roll = random() * rarities.reduce((sum, rarity) => sum + rarity.weight, 0);
    const rarity = rarities.find((candidate) => (roll -= candidate.weight) < 0) ?? rarities[rarities.length - 1];
    return pickOne(cards.filter((card) => card.rarity === rarity), random);
}

/**
 * Tire un booster parmi pool, sans deux fois la même carte dans un booster. Une carte : { id, type, rarity } ;
 * rarity.level augmente avec la rareté. Les plus rares sont à la fin, pour garder le suspense.
 */
export function drawBooster(pool, { size, guaranteed, mixTypes }, random = Math.random) {
    const left = [...pool];
    const picks = [];
    const take = (candidates) => {
        const card = pickWeighted(candidates, random);
        left.splice(left.indexOf(card), 1);
        picks.push(card);
    };

    while (picks.length < size && left.length) {
        const isLast = picks.length === size - 1;
        const best = isLast && guaranteed && !picks.some((card) => card.rarity.level >= guaranteed.level)
            ? left.filter((card) => card.rarity.level >= guaranteed.level)
            : [];
        take(best.length ? best : left);
    }

    // Un booster mélange au moins deux types de cartes quand c'est possible : la carte la moins rare cède sa place.
    const others = mixTypes ? left.filter((card) => card.type !== picks[0]?.type) : [];
    if (picks.length > 1 && others.length && picks.every((card) => card.type === picks[0].type)) {
        picks.sort((a, b) => a.rarity.level - b.rarity.level);
        picks.shift();
        take(others);
    }
    return picks.sort((a, b) => a.rarity.level - b.rarity.level);
}
~~~~

### `engine/festive.js`

~~~~js
// Décor de Noël, entre deux dates du thème : neige qui tombe, guirlande en festons sous la bannière,
// petits tas de neige en bas de l'écran. Purement décoratif : rien n'est cliquable, rien n'est lu par les lecteurs d'écran.
import { el, reducedMotion } from './card.js';

const BULB_COLORS = ['var(--accent-strong)', 'var(--coin)', 'var(--success)', '#f8fafc'];
const CRYSTALS = ['❄', '❅', '❆'];

const decor = (className) => {
    const node = el('div', className);
    node.setAttribute('aria-hidden', 'true');
    return node;
};

/** Valeur pseudo-aléatoire stable entre 0 et 1 : les congères ont la même forme à chaque visite. */
const noise = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
};

// --- Guirlande ---

/** Festons : le fil pend entre des nœuds, les ampoules suivent la courbe. Redessinée à chaque changement de largeur. */
function drawGarland(lights) {
    const width = lights.clientWidth;
    const span = width / Math.max(2, Math.round(width / (width < 600 ? 120 : 180)));
    const sag = Math.min(28, span * 0.17); // profondeur d'un feston
    const perSwag = span < 140 ? 3 : 4;
    const top = 3;

    let wire = `M0 ${top}`;
    const bulbs = [];
    const knots = [];
    for (let x0 = 0, i = 0; x0 < width - 1; x0 += span, i++) {
        // Courbe quadratique : y = top + 4·sag·t·(1 − t) entre deux nœuds
        wire += ` Q${x0 + span / 2} ${top + 2 * sag} ${x0 + span} ${top}`;
        knots.push(x0);
        for (let k = 1; k <= perSwag; k++) {
            const t = k / (perSwag + 1);
            const angle = Math.atan((4 * sag * (1 - 2 * t)) / span) * (180 / Math.PI);
            bulbs.push({ x: x0 + t * span, y: top + 4 * sag * t * (1 - t), angle: angle * 0.6 });
        }
    }
    knots.push(width);

    const svg = `<svg class="lights__wire" width="${width}" height="${top + sag + 4}" viewBox="0 0 ${width} ${top + sag + 4}"><path d="${wire}"/></svg>`;
    lights.innerHTML = svg;
    for (const x of knots) {
        const knot = el('span', 'lights__knot');
        knot.style.left = `${x}px`;
        lights.append(knot);
    }
    bulbs.forEach(({ x, y, angle }, i) => {
        const bulb = el('span', 'lights__bulb');
        bulb.style.cssText = `left:${x}px;top:${y}px;rotate:${angle.toFixed(1)}deg;--i:${i};--bulb:${BULB_COLORS[i % BULB_COLORS.length]}`;
        lights.append(bulb);
    });
}

// --- Neige qui tombe ---

function snowLayer(className, count, { crystals, maxOpacity }) {
    const layer = decor(className);
    for (let i = 0; i < count; i++) {
        const isCrystal = Math.random() < crystals;
        const flake = el('span', `snow__flake${isCrystal ? ' snow__flake--crystal' : ''}`);
        const size = isCrystal ? 9 + Math.random() * 11 : 2 + Math.random() * 4;
        if (isCrystal) flake.textContent = CRYSTALS[i % CRYSTALS.length];
        flake.style.cssText = [
            `left:${Math.random() * 100}%`,
            isCrystal ? `font-size:${size}px` : `width:${size}px;height:${size}px`,
            `opacity:${0.25 + Math.random() * (maxOpacity - 0.25)}`,
            `--drift:${Math.round(Math.random() * 90 - 45)}px`,
            `animation-duration:${(isCrystal ? 16 : 11) + Math.random() * 14}s`,
            `animation-delay:${-Math.random() * 30}s`, // déjà en train de tomber à l'arrivée
        ].join(';');
        layer.append(flake);
    }
    return layer;
}

// --- Congères ---

/** Un petit tas de neige : un dôme arrondi et une épaule plus basse, dessiné sur 100 × 40 puis mis à sa taille. */
function snowPile(seed) {
    const shoulder = 16 + noise(seed + 1) * 10; // hauteur de l'épaule gauche (y : 0 en haut, 40 au sol)
    const top = 2 + noise(seed + 2) * 7; // sommet du dôme
    const right = 14 + noise(seed + 3) * 12; // petite bosse à droite
    const d = `M0 40 C3 40 5 ${shoulder + 9} 15 ${shoulder}`
        + ` C22 ${top + 8} 38 ${top} 52 ${top + 1}`
        + ` C64 ${top + 2} 70 ${right - 5} 80 ${right}`
        + ` C90 ${right + 4} 96 39 100 40 Z`;
    const flip = noise(seed + 4) < 0.5 ? ' transform="translate(100 0) scale(-1 1)"' : ''; // l'épaule à gauche ou à droite
    return `<svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <defs><linearGradient id="snowpile-${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#eef3f8"/><stop offset="1" stop-color="#cfd9e5"/></linearGradient></defs>
        <path fill="url(#snowpile-${seed})" d="${d}"${flip}/>
    </svg>`;
}

/** Petits tas de neige espacés le long du bas de l'écran, de tailles variées. Leur position est en % : ils suivent la largeur. */
function snowPiles() {
    const isSmall = window.innerWidth < 600;
    const count = isSmall ? 4 : Math.round(Math.min(9, window.innerWidth / 190));
    const piles = [];
    for (let i = 0; i < count; i++) {
        const width = (isSmall ? 40 : 50) + noise(i * 3 + 1) * (isSmall ? 36 : 85);
        const pile = el('span', 'snowpile', { innerHTML: snowPile(i * 7 + 2) });
        // Réparti sur la largeur, un peu décalé au hasard pour ne pas faire une rangée régulière, sans se toucher
        const left = ((i + 0.5) / count) * 100 + (noise(i * 5 + 3) - 0.5) * (25 / count);
        const half = Math.round(width / 2); // le tas reste entier dans l'écran
        pile.style.cssText = `left:clamp(${half}px, ${left.toFixed(1)}%, calc(100% - ${half}px));width:${Math.round(width)}px;height:${Math.round(width * (0.26 + noise(i * 11) * 0.14))}px`;
        piles.push(pile);
    }
    return piles;
}

/** Ajoute le décor. banner : la bannière du haut, qui porte la guirlande. */
export function addChristmas(banner) {
    document.documentElement.classList.add('is-christmas');

    const lights = decor('lights');
    banner.append(lights);
    drawGarland(lights);
    let lastWidth = lights.clientWidth;
    new ResizeObserver(() => {
        if (lights.clientWidth === lastWidth) return;
        lastWidth = lights.clientWidth;
        drawGarland(lights);
    }).observe(lights);

    // Petits tas de neige posés en bas de l'écran.
    const bank = decor('snowbank');
    bank.append(...snowPiles());
    document.body.append(bank);

    if (reducedMotion()) return; // pas de neige qui bouge
    // Beaucoup de flocons derrière le contenu, quelques-uns devant pour la profondeur.
    const count = Math.round(Math.min(140, Math.max(60, window.innerWidth / 9)));
    document.body.prepend(snowLayer('snow', count, { crystals: 0.18, maxOpacity: 0.85 }));
    document.body.append(snowLayer('snow snow--front', Math.round(count / 7), { crystals: 0.3, maxOpacity: 0.55 }));
}
~~~~

### `engine/labels.js`

~~~~js
// Favori et étiquettes d'une carte, dans son détail. Les étiquettes sont créées par le joueur.
import { actionButton, el, setText, text } from './card.js';
import { LABEL_LENGTH, MAX_LABELS } from './player.js';
import { t } from './strings.js';

const COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa', '#f472b6', '#94a3b8'];

/** Cœur à basculer. Renvoie { node, update }. */
export function favoriteButton(player, card, className, onChange) {
    const node = el('button', className, { type: 'button' }, el('span', '', { textContent: '♥' }));
    const update = () => {
        const isFavorite = player.isFavorite(card);
        node.setAttribute('aria-pressed', isFavorite);
        node.title = t(isFavorite ? 'favorite_remove' : 'favorite_add');
        node.setAttribute('aria-label', node.title);
    };
    node.addEventListener('click', (event) => {
        event.stopPropagation(); // la case entière ouvre le détail
        player.toggleFavorite(card);
        update();
        onChange();
    });
    update();
    return { node, update };
}

/** Étiquettes d'une carte : à cocher, à créer, à renommer ou à supprimer. */
export function labelEditor(player, card, onChange) {
    const list = el('div', 'labels__list');
    const node = el('div', 'labels', {}, text('p', 'labels__title', 'label_title'), list);
    let isEditing = false;

    function changed() {
        render();
        onChange();
    }

    function toggle(label) {
        const button = el('button', 'label-chip', { type: 'button', textContent: label.name });
        button.style.setProperty('--label', label.color);
        button.setAttribute('aria-pressed', player.hasLabel(card, label));
        button.addEventListener('click', () => {
            player.toggleLabel(card, label);
            changed();
        });
        return button;
    }

    function editable(label) {
        const input = el('input', 'label-chip__input', { value: label.name, maxLength: LABEL_LENGTH });
        input.setAttribute('aria-label', t('label_rename'));
        input.addEventListener('change', () => {
            player.renameLabel(label, input.value);
            changed();
        });
        const remove = el('button', 'label-chip__remove', { type: 'button', textContent: '×' });
        remove.setAttribute('aria-label', `${t('label_delete')} ${label.name}`);
        remove.addEventListener('click', () => {
            if (!window.confirm(`${t('label_delete_confirm')} « ${label.name} »`)) return;
            player.removeLabel(label);
            changed();
        });
        const chip = el('span', 'label-chip label-chip--edit', {}, input, remove);
        chip.style.setProperty('--label', label.color);
        return chip;
    }

    function creator() {
        const input = el('input', 'label-chip__input', { placeholder: t('label_new'), maxLength: LABEL_LENGTH });
        input.setAttribute('aria-label', t('label_new'));
        const add = el('button', 'label-chip__remove', { type: 'submit', textContent: '+' });
        add.setAttribute('aria-label', t('label_create'));
        const form = el('form', 'label-chip label-chip--new', {}, input, add);
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const label = player.addLabel(input.value, COLORS[player.labels.length % COLORS.length]);
            if (!label) return;
            if (!player.hasLabel(card, label)) player.toggleLabel(card, label);
            changed();
            list.querySelector('.label-chip--new input')?.focus();
        });
        return form;
    }

    function render() {
        const { labels } = player;
        if (!labels.length) isEditing = false;
        list.replaceChildren(...labels.map(isEditing ? editable : toggle));
        if (!isEditing && labels.length < MAX_LABELS) list.append(creator());
        if (!labels.length) return;
        const edit = actionButton('label_edit', 'booster__link', () => {
            isEditing = !isEditing;
            render();
        });
        if (isEditing) setText(edit.firstChild, 'label_done');
        list.append(edit);
    }

    render();
    return node;
}

/** Pastilles de couleur des étiquettes d'une carte, posées sur sa case. */
export function labelDots(player, card) {
    return player.labels.filter((label) => player.hasLabel(card, label)).map((label) => {
        const dot = el('span', 'label-dot', { title: label.name });
        dot.style.setProperty('--label', label.color);
        return dot;
    });
}
~~~~

### `engine/main.js`

~~~~js
// Point d'entrée : charge le thème, construit la page et relie les cartes, les boosters et les échanges.
import { createAdvent } from './advent.js';
import { createBooster } from './booster.js';
import { isBetween, isDay, parseDay, startOfDay } from './calendar.js';
import { addChristmas } from './festive.js';
import { actionButton, coins, createCard, el, text } from './card.js';
import { createDetail } from './detail.js';
import { drawBooster } from './draw.js';
import { favoriteButton, labelDots } from './labels.js';
import { motif, motifSource, setMotif } from './motif.js';
import { Player } from './player.js';
import { createShowcase, readShowcase } from './showcase.js';
import { setTexts, t } from './strings.js';
import { applyStyle, describe, loadTheme, ThemeError } from './theme.js';
import { createTradeView } from './trade-view.js';

/** Gélule à plusieurs choix. options : [[valeur, contenu du bouton]]. */
function segmented(options, selected, onPick) {
    const buttons = options.map(([value, content]) => {
        const button = el('button', '', { type: 'button' }, content);
        button.addEventListener('click', () => {
            for (const [i, [other]] of options.entries()) buttons[i].setAttribute('aria-pressed', other === value);
            onPick(value);
        });
        button.setAttribute('aria-pressed', value === selected);
        return button;
    });
    const group = el('div', 'segmented', {}, ...buttons);
    group.setAttribute('role', 'group');
    return group;
}

const GIFT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>';

/**
 * Horloge du jeu. Sur un serveur local seulement, ?date=AAAA-MM-JJ simule un autre jour pour essayer le calendrier ;
 * en ligne, ce paramètre est ignoré.
 */
function gameClock() {
    const value = new URLSearchParams(location.search).get('date');
    const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    if (!isLocal || !isDay(value)) return Date.now;
    const offset = parseDay(value).getTime() - startOfDay(Date.now()).getTime();
    return () => Date.now() + offset;
}

function setIcon() {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const svg = motifSource().replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"').replaceAll('currentColor', color);
    document.head.append(el('link', '', { rel: 'icon', href: `data:image/svg+xml,${encodeURIComponent(svg)}` }));
}

/** Construit la page du thème. */
function buildPage(theme) {
    document.title = theme.name;
    document.documentElement.lang = theme.language;

    const bar = el('section', 'collection');
    const filters = el('div', 'filters');
    const albumBar = el('div', 'albums');
    const empty = text('p', 'page__empty', 'cards_filter_empty');
    const sections = theme.albums.map((album) => {
        const grid = el('div', 'grid');
        const count = el('span', 'page__count');
        return { album, grid, count, node: el('section', 'page__section', { id: `album-${album.id}` }, el('h2', 'page__heading', {}, album.label, count), grid) };
    });
    // Bannière du haut, toujours visible : nom du jeu, liens du thème, puis calendrier, échanges et vitrine.
    const menu = el('div', 'banner__actions');
    const banner = el('header', 'banner', {},
        el('div', 'banner__inner', {},
            el('div', 'page__brand', {}, theme.logo ? el('img', '', { src: theme.logo, alt: '' }) : motif(), el('span', '', { textContent: theme.name })),
            el('nav', 'page__nav', {}, ...theme.nav.map(({ label, url }) => el('a', '', { href: url, textContent: label }))),
            menu));
    const page = el('div', 'page', {},
        el('section', 'page__hero', {},
            el('h1', 'page__title', { textContent: theme.title ?? theme.name }),
            ...(theme.tagline ? [el('p', 'page__tagline', { textContent: theme.tagline })] : [])),
        el('main', '', {}, bar, albumBar, filters, empty, ...sections.map(({ node }) => node)),
        ...(theme.footer ? [el('footer', 'page__footer', { textContent: theme.footer })] : []));
    document.body.append(banner, page);
    return { banner, menu, bar, albumBar, filters, empty, sections };
}

function start(theme) {
    applyStyle(theme);
    setMotif(theme.motif);
    // Libellés du thème, utilisables comme les textes du moteur.
    const labels = (prefix, list) => list.map(({ id, label }) => [`${prefix}_${id}`, label]);
    setTexts({
        ...theme.texts,
        ...Object.fromEntries([...labels('rarity', theme.rarities), ...labels('type', theme.types), ...labels('tag', theme.tags), ...labels('album', theme.albums)]),
    });
    setIcon();

    const { rarities } = theme;
    const { banner, menu, bar, albumBar, filters, empty, sections } = buildPage(theme);
    const now = gameClock();
    if (theme.christmas && isBetween(theme.christmas.from, theme.christmas.to, now())) addChristmas(banner);
    const cards = theme.cards.map((card) => ({ ...card, node: el('div', 'tile'), isShown: null }));
    const player = new Player(cards, { gameId: theme.id, economy: theme.economy, trade: theme.trade, showcase: theme.showcase, advent: theme.advent }, now);
    const newCards = new Set(); // découvertes pendant cette visite

    // --- Grilles : seules les cartes possédées sont visibles ---

    for (const { album, grid } of sections) grid.append(...cards.filter((card) => card.album === album.id).map((card) => card.node));

    // --- Albums : un bouton par album, avec sa progression ---

    const inAlbum = (album) => cards.filter((card) => card.album === album.id);
    const albumButtons = [null, ...theme.albums].map((album) => {
        const count = el('span', 'album__count');
        const progress = el('progress', 'collection__progress', { max: (album ? inAlbum(album) : cards).length });
        const button = el('button', 'album', { type: 'button' },
            el('span', 'album__name', { textContent: album ? album.label : t('album_all') }), count, progress);
        button.addEventListener('click', () => {
            filter.album = album;
            applyFilter();
        });
        return { album, button, count, progress };
    });
    albumBar.append(...albumButtons.map(({ button }) => button));

    function showAlbums() {
        for (const { album, button, count, progress } of albumButtons) {
            const list = album ? inAlbum(album) : cards;
            const found = list.filter((card) => player.has(card)).length;
            count.textContent = `${found} / ${list.length}`;
            progress.value = found;
            progress.setAttribute('aria-label', `${found} / ${list.length}`);
            button.classList.toggle('is-complete', found === list.length);
        }
        for (const { album, count } of sections) {
            const list = inAlbum(album);
            count.textContent = `${list.filter((card) => player.has(card)).length} / ${list.length}`;
        }
    }

    // --- Filtres : album, puis favoris, étiquettes du thème ou du joueur ---

    const filter = { album: null, view: 'all' };
    const views = () => [
        { id: 'all', label: t('cards_filter_all'), keep: () => true },
        { id: 'favorites', label: `♥ ${t('favorite_title')}`, keep: (card) => player.has(card) && player.isFavorite(card) },
        ...theme.tags.map(({ id }) => ({ id: `tag-${id}`, label: t(`tag_${id}`), keep: (card) => card.tags.includes(id) })),
        ...player.labels.map((label) => ({ id: `label-${label.id}`, label: label.name, color: label.color, keep: (card) => player.has(card) && player.hasLabel(card, label) })),
    ];

    function applyFilter() {
        const list = views();
        const view = list.find(({ id }) => id === filter.view) ?? list[0]; // étiquette supprimée
        filter.view = view.id;
        for (const { album, button } of albumButtons) button.setAttribute('aria-pressed', album === filter.album);
        for (const card of cards) {
            const isKept = (!filter.album || card.album === filter.album.id) && view.keep(card);
            card.node.hidden = !isKept && !card.node.classList.contains('is-out'); // la case d'une carte sortie doit rester en place
        }
        for (const { grid, node } of sections) node.hidden = ![...grid.children].some((tile) => !tile.hidden);
        empty.hidden = sections.some(({ node }) => !node.hidden);

        const bar = segmented(list.map(({ id, label, color }) => {
            const content = el('span', color ? 'segmented__label' : '', { textContent: label });
            if (color) content.style.setProperty('--label', color);
            return [id, content];
        }), filter.view, (id) => {
            filter.view = id;
            applyFilter();
            filters.querySelector('[aria-pressed="true"]').focus();
        });
        filters.replaceChildren(bar);
    }

    const placeholder = () => el('div', 'hidden-card', {}, motif(),
        el('span', 'hidden-card__mark', { textContent: '?' }),
        text('p', 'hidden-card__text', 'cards_hidden'));

    function showCard(card) {
        const isShown = player.has(card);
        const { node, rarity } = card;
        node.classList.toggle('is-new', isShown && newCards.has(card));
        if (card.isShown === isShown) {
            showMarks(card);
            return;
        }

        card.isShown = isShown;
        node.classList.toggle('is-undiscovered', !isShown);
        node.style.order = isShown ? 0 : 1; // les cartes découvertes d'abord
        node.style.setProperty('--rarity', rarity.color);
        if (!isShown) {
            node.replaceChildren(placeholder());
            return;
        }
        const face = createCard('div', card, describe(card), cards.indexOf(card) + 1, cards.length);
        face.classList.add('is-flipped');
        // Les marques sont fixées à la carte, pour s'incliner avec elle.
        card.favorite = favoriteButton(player, card, 'favorite favorite--tile', update);
        face.firstChild.append(text('span', 'new-tag', 'cards_new'), el('span', 'count-tag'), el('span', 'label-dots'), card.favorite.node);
        // Toute la case s'ouvre au clic ; ce bouton invisible sert au clavier.
        const opener = el('button', 'tile__open', { type: 'button' });
        opener.setAttribute('aria-label', card.name);
        opener.addEventListener('click', (event) => {
            event.stopPropagation();
            detail.open(card);
        });
        node.replaceChildren(opener, face);
        showMarks(card);
    }

    /** Nombre d'exemplaires (à partir de deux), favori et étiquettes. */
    function showMarks(card) {
        if (!card.isShown) return;
        const count = card.node.querySelector('.count-tag');
        count.hidden = player.spare(card) === 0;
        count.textContent = `×${player.count(card)}`;
        card.favorite.update();
        card.node.querySelector('.label-dots').replaceChildren(...labelDots(player, card));
    }

    const detail = createDetail({ player, describe, onChange: update, onTrade: (give) => trade.open({ give }), onClose: applyFilter });
    for (const card of cards) {
        card.node.addEventListener('click', () => { if (player.has(card)) detail.open(card); });
    }

    // --- Barre de collection ---

    const count = el('strong', 'collection__count');
    const progress = el('progress', 'collection__progress', { max: cards.length });
    const chips = el('div', 'collection__chips');
    const openButton = actionButton('cards_open_booster', 'booster__btn booster__btn--main', () => booster.open());
    const sellButton = actionButton('sell_spares', 'booster__btn booster__btn--coins', () => {
        player.sellAllSpares();
        update();
    });
    const sellValue = el('span');
    sellButton.append(' ', sellValue);
    const showcaseButton = actionButton('showcase_mine', 'banner__btn', () => showcase.open());
    const tradeButton = actionButton('trade_open', 'banner__btn', () => trade.open());
    const adventBadge = el('span', 'advent-btn__badge');
    // Libellé court sur petit écran.
    const adventButton = actionButton('advent_open', 'banner__btn banner__btn--advent', () => advent.open(), text('span', 'banner__short', 'advent_short'), adventBadge);
    adventButton.firstChild.classList.add('banner__long');
    menu.append(adventButton, tradeButton, showcaseButton);
    const revealLink = actionButton('cards_reveal_all', 'booster__link', revealAll);
    const resetLink = actionButton('cards_reset', 'booster__link', () => {
        if (!window.confirm(t('cards_reset_confirm'))) return;
        newCards.clear();
        player.reset();
        update();
        booster.open();
    });

    // Solde et booster, toujours visibles en bas de l'écran.
    const balance = el('span', 'hud__coins');
    const hudPrice = el('span', 'hud__price');
    const hudButton = el('button', 'floating-booster', { type: 'button' }, motif(), text('span', '', 'cards_open_booster'), hudPrice);
    hudButton.addEventListener('click', () => booster.open());
    // Rappel du calendrier, visible seulement quand une case attend d'être ouverte.
    const hudAdventBadge = el('span', 'advent-btn__badge');
    const hudAdvent = el('button', 'hud__advent', { type: 'button', innerHTML: GIFT_ICON }, hudAdventBadge);
    hudAdvent.addEventListener('click', () => advent.open());
    document.body.append(el('div', 'hud', {}, balance, hudButton, hudAdvent));

    const label = el('p', 'collection__label', {}, text('span', '', 'cards_collection'), ' ', count);
    bar.append(el('div', 'collection__main', {}, label, progress, chips), el('div', 'collection__actions', {}, openButton, sellButton, revealLink, resetLink));

    function update() {
        cards.forEach(showCard);
        showAlbums();
        applyFilter();
        count.textContent = `${player.discovered} / ${cards.length}`;
        progress.value = player.discovered;
        progress.setAttribute('aria-label', label.textContent);
        chips.replaceChildren(...rarities.map((rarity) => {
            const all = cards.filter((card) => card.rarity === rarity);
            const found = all.filter((card) => player.has(card)).length;
            const chip = el('span', 'collection__chip', {}, text('span', '', `rarity_${rarity.id}`), ` ${found}/${all.length}`);
            chip.style.setProperty('--rarity', rarity.color);
            return chip;
        }));
        sellButton.hidden = player.spareValue === 0;
        sellValue.replaceChildren(coins(player.spareValue, '+'));
        revealLink.hidden = player.isComplete || !theme.booster.allowRevealAll;
        resetLink.hidden = player.discovered === 0;
        showBalance();
        showAdvent();
    }

    let shownAdvent = '';
    /** Bouton du calendrier, pendant le calendrier et juste avant, avec le nombre de cases à ouvrir ; rappelé chaque seconde. */
    function showAdvent() {
        const status = player.adventStatus;
        const ready = status === 'open' ? player.adventDays.filter((box) => box.canOpen).length : 0;
        const state = `${status}|${ready}`;
        if (state === shownAdvent) return;
        shownAdvent = state;
        adventButton.hidden = status === 'none' || status === 'over';
        adventBadge.hidden = hudAdventBadge.hidden = !ready;
        adventBadge.textContent = hudAdventBadge.textContent = ready;
        hudAdvent.hidden = !ready;
        hudAdvent.setAttribute('aria-label', `${t('advent_open')} : ${ready} ${t('advent_ready')}`);
    }

    let shownBalance = '';
    /** Solde et prix du prochain booster ; rappelé chaque seconde pour le compte à rebours. */
    function showBalance() {
        const free = player.freeBoosters;
        const canOpen = player.canOpenBooster;
        const seconds = Math.ceil(player.nextFreeIn / 1000);
        const countdown = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
        const state = `${player.coins}|${free}|${free ? '' : countdown}`;
        if (state === shownBalance) return;
        shownBalance = state;

        balance.replaceChildren(coins(player.coins));
        hudButton.disabled = openButton.disabled = !canOpen;
        if (free > 0) hudPrice.replaceChildren(text('span', '', 'booster_free'), ` ×${free}`);
        else if (canOpen) hudPrice.replaceChildren(coins(theme.economy.boosterPrice));
        else hudPrice.replaceChildren(text('span', '', 'booster_next'), ` ${countdown}`);
    }
    setInterval(() => {
        showBalance();
        showAdvent(); // une nouvelle case à minuit
    }, 1000);

    function revealAll() {
        player.revealAll();
        update();
    }

    /** Retient les cartes découvertes pendant cette visite. */
    function received(results) {
        for (const { card, isNew } of results) if (isNew) newCards.add(card);
        return results;
    }

    // --- Boosters ---

    const { size, guaranteed, mixTypes, openOnFirstVisit, allowRevealAll } = theme.booster;
    const booster = createBooster({
        player,
        size,
        describe,
        pack: { top: theme.pack.top ?? theme.name, label: theme.pack.label ?? theme.name },
        onChange: update,
        draw() {
            if (!player.payBooster()) return null;
            const drawn = drawBooster(cards, { size, mixTypes, guaranteed: rarities.find((rarity) => rarity.id === guaranteed) });
            return received(player.receive(drawn));
        },
        onRevealAll: allowRevealAll ? revealAll : null,
        onClose(opened) {
            player.save(); // le booster de bienvenue n'est proposé qu'une fois
            update();
            if (openLink()) return;
            if (opened) bar.scrollIntoView({ behavior: 'smooth' });
        },
    });

    // --- Échanges ---

    const trade = createTradeView({
        player,
        describe,
        onChange(results) {
            received(results);
            update();
        },
    });

    // --- Calendrier de l'Avent ---

    const advent = createAdvent({
        player,
        language: theme.language,
        onChange: update,
        onPlay: () => booster.open(),
    });

    // --- Vitrine ---

    const showcase = createShowcase({
        player,
        describe,
        onChange: update,
        onClose() {
            if (player.isFirstVisit) welcome(); // venu par le lien d'une vitrine
        },
    });

    function welcome() {
        if (player.isFirstVisit && openOnFirstVisit) booster.open({ isWelcome: true });
        else openLink();
    }

    /** Ouvre ce que contient l'adresse : un salon d'échange (#room=…) ou une vitrine (#vitrine=…). */
    function openLink() {
        const [, kind, code] = location.hash.match(/^#(room|vitrine)=([\w-]+)$/) ?? [];
        const isBusy = document.querySelector('[role="dialog"]:not([hidden])'); // une seule fenêtre à la fois
        if (!kind || isBusy) return false;
        history.replaceState(null, '', location.pathname + location.search); // un rechargement ne l'ouvre pas à nouveau
        if (kind === 'room') {
            trade.open({ code });
            return true;
        }
        const theirs = readShowcase(player, code);
        if (theirs) showcase.view(theirs);
        return theirs !== null;
    }
    window.addEventListener('hashchange', openLink);

    // La partie a continué dans un autre onglet.
    window.addEventListener('storage', (event) => {
        if (!player.owns(event.key)) return;
        player.load();
        update();
        trade.refresh();
    });

    update();
    // Une vitrine se regarde sans attendre ; un salon passe après le booster de bienvenue.
    if (!location.hash.startsWith('#vitrine=') || !openLink()) welcome();
}

// Le thème vient de index.html (data-theme), ou de l'adresse (?theme=nom) pour en essayer un autre.
const name = new URLSearchParams(location.search).get('theme') ?? document.documentElement.dataset.theme;
loadTheme(name).then(start).catch((error) => {
    console.error(error);
    const message = error instanceof ThemeError ? error.message : `Erreur inattendue : ${error.message}`;
    document.body.prepend(el('p', 'page__error', { textContent: message }));
});
~~~~

### `engine/modal.js`

~~~~js
// Comportement commun aux fenêtres plein écran : le reste de la page ne reçoit plus ni clic, ni focus, ni défilement.

function lockScroll(isLocked) {
    const { style } = document.documentElement;
    // Compense la barre de défilement qui disparaît, pour que la page ne saute pas.
    style.paddingRight = isLocked ? `${window.innerWidth - document.documentElement.clientWidth}px` : '';
    style.overflow = isLocked ? 'hidden' : '';
}

export function createModal(overlay, onEscape) {
    let background = [];
    let previousFocus = null;

    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.tabIndex = -1;
    overlay.hidden = true;
    overlay.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') onEscape();
    });
    document.body.append(overlay);

    return {
        open() {
            previousFocus = document.activeElement;
            background = [...document.body.children].filter((node) => node !== overlay && !node.inert && !node.matches('script'));
            for (const node of background) node.inert = true;
            lockScroll(true);
            overlay.hidden = false;
        },
        close() {
            overlay.hidden = true;
            for (const node of background) node.inert = false;
            lockScroll(false);
            previousFocus?.focus?.({ preventScroll: true });
        },
    };
}
~~~~

### `engine/motif.js`

~~~~js
// Motif du thème : le dessin du booster, du dos des cartes et des cartes cachées.

const bars = [30, 55, 80, 45, 100, 65, 90, 40, 70, 50, 25]
    .map((height, i) => `<rect x="${i * 9}" y="${50 - height / 2}" width="6" height="${height}" rx="3"/>`).join('');

/** Motifs fournis. La couleur est currentColor. */
export const MOTIFS = {
    wave: `<svg viewBox="0 0 96 100" fill="currentColor">${bars}</svg>`,
    orbit: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4"><circle cx="50" cy="50" r="18" fill="currentColor" stroke="none"/><ellipse cx="50" cy="50" rx="46" ry="16" transform="rotate(-24 50 50)"/><circle cx="90" cy="31" r="5" fill="currentColor" stroke="none"/></svg>',
    star: '<svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 4c4 28 18 42 46 46-28 4-42 18-46 46-4-28-18-42-46-46 28-4 42-18 46-46z"/></svg>',
    shield: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"><path d="M50 6l38 13v27c0 24-16 40-38 48C28 86 12 70 12 46V19z"/><path d="M50 26v48M30 44h40"/></svg>',
    leaf: '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"><path d="M14 86C8 40 36 12 88 12c2 52-26 80-74 74z" fill="currentColor" fill-opacity=".25"/><path d="M14 86L62 38"/></svg>',
    flame: '<svg viewBox="0 0 100 100" fill="currentColor"><path d="M52 4c6 22 30 30 30 58a32 32 0 0 1-64 0c0-16 8-24 14-34 2 10 6 14 10 16 2-16 2-26 10-40z"/></svg>',
};

let current = MOTIFS.star;

/** source : le nom d'un motif fourni, ou un dessin <svg>. */
export function setMotif(source) {
    current = MOTIFS[source] ?? source;
}

/** Dessin du motif, pour l'icône de l'onglet. */
export const motifSource = () => current;

export function motif() {
    const node = document.createElement('span');
    node.className = 'motif';
    node.setAttribute('aria-hidden', 'true');
    node.innerHTML = current;
    return node;
}
~~~~

### `engine/player.js`

~~~~js
// Sauvegarde du joueur, gardée dans son navigateur : cartes possédées, pièces, boosters gratuits et offerts,
// calendrier de l'Avent, favoris, étiquettes et vitrine.
import { adventDays, adventStatus } from './calendar.js';

export const NAME_LENGTH = 20;
export const TITLE_LENGTH = 40;
export const LABEL_LENGTH = 24;
export const MAX_LABELS = 12;

const isCount = (value) => Number.isInteger(value) && value > 0;

export class Player {
    #owned = new Map(); // carte → nombre d'exemplaires
    #known = new Set(); // cartes possédées un jour : la prime de découverte n'est donnée qu'une fois
    #favorites = new Set();
    #labelled = new Map(); // carte → ensemble d'identifiants d'étiquettes
    #showcase = []; // cartes exposées, même celles qu'on n'a plus
    #advent = new Set(); // numéros des cases du calendrier déjà ouvertes
    #now;

    /** rules : { gameId, economy, trade, showcase, advent }, tirés du thème. now est remplaçable pour les tests. */
    constructor(cards, rules, now = Date.now) {
        this.cards = cards;
        this.rules = rules;
        this.#now = now;
        this.load();
    }

    get #key() {
        return `tcg-${this.rules.gameId}`;
    }

    // --- Lecture et écriture ---

    load() {
        this.#owned.clear();
        this.#known.clear();
        this.#favorites.clear();
        this.#labelled.clear();
        this.#showcase = [];
        this.#advent.clear();
        this.gifts = 0; // boosters offerts (calendrier) : sans plafond, ouverts après les gratuits
        this.showcaseTitle = '';
        this.labels = []; // { id, name, color }
        this.isFirstVisit = true;
        this.coins = this.rules.economy.startCoins;
        this.free = { stock: this.rules.economy.freeBooster.start, at: this.#now() };
        this.id = crypto.randomUUID?.() ?? String(Math.random()); // pour ne pas échanger avec soi-même
        this.name = ''; // pseudo montré pendant un échange

        let saved = null;
        try {
            saved = JSON.parse(localStorage.getItem(this.#key));
        } catch {
            // Stockage bloqué ou illisible : la partie ne dure que le temps de la visite.
        }

        if (saved && typeof saved === 'object') {
            this.isFirstVisit = false;
            for (const card of this.cards) if (isCount(saved.owned?.[card.id])) this.#owned.set(card, saved.owned[card.id]);
            for (const card of this.cards) if (this.has(card) || saved.known?.includes?.(card.id)) this.#known.add(card);
            if (Number.isFinite(saved.coins) && saved.coins >= 0) this.coins = saved.coins;
            if (Number.isInteger(saved.free?.stock) && Number.isFinite(saved.free?.at)) this.free = saved.free;
            if (Number.isInteger(saved.gifts) && saved.gifts >= 0) this.gifts = saved.gifts;
            // Les cases ouvertes ne valent que pour le calendrier en cours : un nouveau calendrier repart de zéro.
            const advent = this.rules.advent;
            if (advent && saved.advent?.start === advent.start && Array.isArray(saved.advent.opened)) {
                for (const day of saved.advent.opened) if (Number.isInteger(day) && day >= 1 && day <= advent.boosters.length) this.#advent.add(day);
            }
            if (typeof saved.id === 'string') this.id = saved.id;
            if (typeof saved.name === 'string') this.name = saved.name;
            this.#loadSorting(saved);
        }
    }

    #loadSorting({ favorites, labels, labelled, showcase }) {
        const find = (ids) => (Array.isArray(ids) ? ids.map((id) => this.find(id)).filter(Boolean) : []);
        this.#favorites = new Set(find(favorites));
        if (Array.isArray(labels)) this.labels = labels.filter((label) => typeof label?.id === 'string' && typeof label.name === 'string' && typeof label.color === 'string');
        const known = new Set(this.labels.map(({ id }) => id));
        for (const card of this.cards) {
            const ids = Array.isArray(labelled?.[card.id]) ? labelled[card.id].filter((id) => known.has(id)) : [];
            if (ids.length) this.#labelled.set(card, new Set(ids));
        }
        this.#showcase = find(showcase?.cards);
        if (typeof showcase?.title === 'string') this.showcaseTitle = showcase.title;
    }

    save() {
        this.isFirstVisit = false;
        try {
            localStorage.setItem(this.#key, JSON.stringify({
                owned: Object.fromEntries([...this.#owned].map(([card, count]) => [card.id, count])),
                known: [...this.#known].map((card) => card.id),
                coins: this.coins,
                free: this.free,
                gifts: this.gifts,
                advent: this.rules.advent ? { start: this.rules.advent.start, opened: [...this.#advent] } : undefined,
                id: this.id,
                name: this.name,
                favorites: [...this.#favorites].map((card) => card.id),
                labels: this.labels,
                labelled: Object.fromEntries([...this.#labelled].map(([card, ids]) => [card.id, [...ids]])),
                showcase: { title: this.showcaseTitle, cards: this.#showcase.map((card) => card.id) },
            }));
        } catch {
            // Même cas que dans load().
        }
    }

    /** Vrai si cette clé de stockage est celle de la sauvegarde (changement fait dans un autre onglet). */
    owns(key) {
        return key === this.#key;
    }

    reset() {
        try {
            localStorage.removeItem(this.#key);
        } catch {
            // Même cas que dans load().
        }
        this.load();
        this.save();
    }

    // --- Cartes ---

    find(id) {
        return this.cards.find((card) => card.id === id);
    }

    count(card) {
        return this.#owned.get(card) ?? 0;
    }

    has(card) {
        return this.count(card) > 0;
    }

    /** Exemplaires en double : on garde toujours le premier. */
    spare(card) {
        return Math.max(this.count(card) - 1, 0);
    }

    get discovered() {
        return this.#owned.size;
    }

    get isComplete() {
        return this.discovered === this.cards.length;
    }

    #give(card) {
        this.#owned.set(card, this.count(card) + 1);
        this.#known.add(card);
    }

    #take(card) {
        if (this.count(card) > 1) this.#owned.set(card, this.count(card) - 1);
        else this.#owned.delete(card);
    }

    /** Ajoute des cartes ; une carte découverte pour la première fois rapporte une prime. Renvoie [{ card, isNew, reward }]. */
    receive(cards) {
        const results = cards.map((card) => {
            const isNew = !this.has(card);
            const reward = this.#known.has(card) ? 0 : card.rarity.reward;
            this.#give(card);
            this.coins += reward;
            return { card, isNew, reward };
        });
        this.save();
        return results;
    }

    revealAll() {
        for (const card of this.cards) if (!this.has(card)) this.#give(card);
        this.save();
    }

    // --- Boosters ---

    /** Recharge les boosters gratuits écoulés depuis la dernière fois. */
    #refill() {
        const { every, max } = this.rules.economy.freeBooster;
        const period = every * 60_000;
        const now = this.#now();
        if (this.free.at > now) this.free.at = now; // horloge de l'ordinateur reculée
        const gained = Math.floor((now - this.free.at) / period);
        if (this.free.stock + gained >= max) this.free = { stock: Math.max(this.free.stock, max), at: now };
        else if (gained > 0) this.free = { stock: this.free.stock + gained, at: this.free.at + gained * period };
    }

    /** Boosters qui s'ouvrent sans payer : gratuits et offerts. */
    get freeBoosters() {
        this.#refill();
        return this.free.stock + this.gifts;
    }

    /** Millisecondes avant le prochain booster gratuit, 0 si la réserve est pleine. */
    get nextFreeIn() {
        this.#refill();
        const { every, max } = this.rules.economy.freeBooster;
        return this.free.stock >= max ? 0 : this.free.at + every * 60_000 - this.#now();
    }

    get canOpenBooster() {
        return this.freeBoosters > 0 || this.coins >= this.rules.economy.boosterPrice;
    }

    /**
     * Paie un booster : gratuit d'abord (sa réserve est plafonnée, l'entamer relance la recharge),
     * puis offert, puis en pièces. Renvoie false si c'est impossible.
     */
    payBooster() {
        if (!this.canOpenBooster) return false;
        if (this.free.stock > 0) this.free = { ...this.free, stock: this.free.stock - 1 };
        else if (this.gifts > 0) this.gifts--;
        else this.coins -= this.rules.economy.boosterPrice;
        this.save();
        return true;
    }

    // --- Calendrier de l'Avent ---

    /** Cases du calendrier, avec leur état : voir calendar.js. Vide si le thème n'a pas de calendrier. */
    get adventDays() {
        return adventDays(this.rules.advent, this.#now(), this.#advent);
    }

    /** 'none', 'soon', 'open' ou 'over' : voir calendar.js. */
    get adventStatus() {
        return adventStatus(this.rules.advent, this.#now());
    }

    /** Ouvre une case, si son jour est venu et qu'elle ne l'a pas déjà été. Renvoie le nombre de boosters reçus, 0 sinon. */
    openAdvent(day) {
        const box = this.adventDays.find((other) => other.day === day);
        if (!box?.canOpen) return 0;
        this.#advent.add(day);
        this.gifts += box.boosters;
        this.save();
        return box.boosters;
    }

    // --- Revente ---

    sellPrice(card) {
        return card.rarity.sell;
    }

    /** Vend jusqu'à amount doubles d'une carte. Renvoie les pièces gagnées. */
    sell(card, amount = 1) {
        const sold = Math.min(amount, this.spare(card));
        for (let i = 0; i < sold; i++) this.#take(card);
        const earned = sold * this.sellPrice(card);
        this.coins += earned;
        this.save();
        return earned;
    }

    /** Valeur de tous les doubles. */
    get spareValue() {
        return this.cards.reduce((sum, card) => sum + this.spare(card) * this.sellPrice(card), 0);
    }

    sellAllSpares() {
        return this.cards.reduce((sum, card) => sum + this.sell(card, this.spare(card)), 0);
    }

    setName(name) {
        this.name = name.trim().slice(0, NAME_LENGTH);
        this.save();
    }

    // --- Favoris et étiquettes ---

    isFavorite(card) {
        return this.#favorites.has(card);
    }

    toggleFavorite(card) {
        if (!this.#favorites.delete(card)) this.#favorites.add(card);
        this.save();
    }

    hasLabel(card, label) {
        return this.#labelled.get(card)?.has(label.id) ?? false;
    }

    toggleLabel(card, label) {
        const ids = this.#labelled.get(card) ?? new Set();
        if (!ids.delete(label.id)) ids.add(label.id);
        if (ids.size) this.#labelled.set(card, ids);
        else this.#labelled.delete(card);
        this.save();
    }

    /** Crée une étiquette, ou renvoie celle qui porte déjà ce nom. Renvoie null si le nom est vide ou s'il y en a trop. */
    addLabel(input, color) {
        const name = input.trim().slice(0, LABEL_LENGTH);
        const existing = this.labels.find((label) => label.name.toLowerCase() === name.toLowerCase());
        if (existing) return existing;
        if (!name || this.labels.length >= MAX_LABELS) return null;
        const label = { id: `${this.#now().toString(36)}${this.labels.length}`, name, color };
        this.labels.push(label);
        this.save();
        return label;
    }

    renameLabel(label, input) {
        const name = input.trim().slice(0, LABEL_LENGTH);
        const isTaken = this.labels.some((other) => other !== label && other.name.toLowerCase() === name.toLowerCase());
        if (!name || isTaken) return;
        label.name = name;
        this.save();
    }

    removeLabel(label) {
        this.labels = this.labels.filter((other) => other !== label);
        for (const [card, ids] of this.#labelled) {
            ids.delete(label.id);
            if (!ids.size) this.#labelled.delete(card);
        }
        this.save();
    }

    // --- Vitrine ---

    /** Une carte échangée quitte la vitrine, et y revient si on la récupère. */
    get showcase() {
        return { title: this.showcaseTitle, cards: this.#showcase.filter((card) => this.has(card)) };
    }

    isInShowcase(card) {
        return this.showcase.cards.includes(card);
    }

    setShowcaseTitle(title) {
        this.showcaseTitle = title.trim().slice(0, TITLE_LENGTH);
        this.save();
    }

    /** Ajoute une carte, s'il reste une place, ou la retire. */
    toggleShowcase(card) {
        const { cards } = this.showcase;
        if (cards.includes(card)) this.#showcase = cards.filter((other) => other !== card);
        else if (this.has(card) && cards.length < this.rules.showcase.size) this.#showcase = [...cards, card];
        this.save();
    }

    moveInShowcase(card, index) {
        const others = this.showcase.cards.filter((other) => other !== card);
        others.splice(Math.min(Math.max(index, 0), others.length), 0, card);
        this.#showcase = others;
        this.save();
    }

    // --- Échanges (voir trade.js) ---

    canTrade(card) {
        return this.rules.trade.allowLastCopy ? this.has(card) : this.spare(card) > 0;
    }

    /** Échange deux offres { card, coins } ; card peut être null. Renvoie { card, isNew, reward } pour la carte reçue, ou null. */
    trade(given, received) {
        if (given.card) this.#take(given.card);
        this.coins = Math.max(this.coins - given.coins, 0) + received.coins;
        const [result = null] = this.receive(received.card ? [received.card] : []);
        return result;
    }
}
~~~~

### `engine/room.js`

~~~~js
// Liaison directe entre deux joueurs. Un service de mise en relation (PeerJS) les présente l'un à l'autre
// à partir du code du salon ; ensuite, leurs navigateurs se parlent directement.

const LIBRARIES = {
    Peer: {
        src: 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js',
        integrity: 'sha384-nlUQ8ZqCbvStErob+biJNzSgltf6urV3VGqhfIfzhmg9RXmpeRm76ELw0pYnKlTR',
    },
    qrcode: {
        src: 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js',
        integrity: 'sha384-lQXOAyZwHXE55JFyrOMB7nY2Wv+m5ZWNtJcHrd1rceRQXAYNLak8ukN5TjBTcIwz',
    },
};
const JOIN_TIMEOUT = 15_000;
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // sans 0/O ni 1/I/L, faciles à confondre
export const CODE_LENGTH = 5;

/** Erreur à montrer au joueur ; key est une clé de strings.js. */
export class RoomError extends Error {
    constructor(key) {
        super(key);
        this.key = key;
    }
}

/** Charge une bibliothèque au premier besoin seulement. */
const loading = {};
function load(name) {
    loading[name] ??= new Promise((resolve, reject) => {
        const script = Object.assign(document.createElement('script'), { ...LIBRARIES[name], crossOrigin: 'anonymous' });
        script.onload = () => resolve(window[name]);
        script.onerror = () => {
            delete loading[name]; // un nouvel essai reste possible
            script.remove();
            reject(new RoomError('room_error_network'));
        };
        document.head.append(script);
    });
    return loading[name];
}

/** QR code d'un lien, en SVG, ou null s'il ne peut pas être chargé. */
export async function qrCode(link) {
    try {
        const qrcode = await load('qrcode');
        const qr = qrcode(0, 'M');
        qr.addData(link);
        qr.make();
        return qr.createSvgTag({ scalable: true, margin: 2 });
    } catch {
        return null;
    }
}

/** Met en forme un code saisi à la main. */
export function cleanCode(input) {
    return [...String(input).toUpperCase()].filter((letter) => ALPHABET.includes(letter)).join('').slice(0, CODE_LENGTH);
}

function randomCode() {
    return [...crypto.getRandomValues(new Uint8Array(CODE_LENGTH))].map((byte) => ALPHABET[byte % ALPHABET.length]).join('');
}

/** Adresse d'un salon ; le nom du jeu est brouillé, le service n'a pas à le connaître. */
function peerId(gameId, code) {
    let hash = 0x811c9dc5; // FNV-1a
    for (const letter of gameId) hash = Math.imul(hash ^ letter.codePointAt(0), 0x01000193);
    return `tcg-${(hash >>> 0).toString(36)}-${code}`;
}

function errorKey(type) {
    if (type === 'peer-unavailable') return 'room_error_missing';
    if (type === 'browser-incompatible') return 'room_error_browser';
    return 'room_error_network';
}

/** Canal entre les deux joueurs : send(message), close(), et onMessage / onClose à brancher. */
function createChannel(peer, connection) {
    const end = () => {
        window.removeEventListener('pagehide', end);
        if (!peer.destroyed) peer.destroy();
    };
    const channel = {
        onMessage: () => {},
        onClose: () => {},
        send(message) {
            if (connection.open) connection.send(message);
        },
        close() {
            channel.onClose = () => {};
            setTimeout(end, 100); // laisse partir le dernier message
        },
    };
    const lost = () => {
        const notify = channel.onClose;
        channel.onClose = () => {};
        end();
        notify();
    };
    connection.on('data', (message) => {
        if (message && typeof message === 'object') channel.onMessage(message);
    });
    connection.on('close', lost);
    connection.on('error', lost);
    window.addEventListener('pagehide', end); // prévient l'autre joueur tout de suite
    return channel;
}

/**
 * Crée un salon. onGuest(channel) est appelé quand un joueur arrive, onError(key) si la liaison casse avant.
 * Renvoie { code, close }.
 */
export async function createRoom({ gameId, server, onGuest, onError }) {
    const Peer = await load('Peer');
    for (let attempt = 0; attempt < 3; attempt++) {
        const code = randomCode();
        const peer = new Peer(peerId(gameId, code), server ?? {});
        try {
            await new Promise((resolve, reject) => {
                peer.once('open', resolve);
                peer.once('error', reject);
            });
        } catch (error) {
            peer.destroy();
            if (error.type === 'unavailable-id') continue; // code déjà pris
            throw new RoomError(errorKey(error.type));
        }

        let guest = null;
        peer.on('connection', (connection) => {
            connection.on('open', () => {
                if (guest) { // salon complet
                    connection.send({ type: 'full' });
                    setTimeout(() => connection.close(), 500);
                    return;
                }
                guest = connection;
                onGuest(createChannel(peer, connection));
            });
        });
        // Le service coupe parfois la ligne pendant l'attente : on se représente avec le même code.
        peer.on('disconnected', () => { if (!peer.destroyed && !guest) peer.reconnect(); });
        peer.on('error', (error) => { if (!guest) onError(errorKey(error.type)); });
        return { code, close: () => peer.destroy() };
    }
    throw new RoomError('room_error_network');
}

/** Rejoint un salon. Renvoie { ready, cancel } : ready donne le canal, ou null si on a annulé. */
export function joinRoom({ gameId, server, code }) {
    let peer = null;
    let cancelled = false;

    async function connect() {
        const Peer = await load('Peer');
        if (cancelled) return null;
        peer = new Peer(server ?? {});
        try {
            return await new Promise((resolve, reject) => {
                const timer = setTimeout(() => reject(new RoomError('room_error_timeout')), JOIN_TIMEOUT);
                peer.on('error', (error) => {
                    clearTimeout(timer);
                    reject(new RoomError(errorKey(error.type)));
                });
                peer.once('open', () => {
                    const connection = peer.connect(peerId(gameId, code), { reliable: true, serialization: 'json' });
                    connection.once('open', () => {
                        clearTimeout(timer);
                        resolve(createChannel(peer, connection));
                    });
                });
            });
        } catch (error) {
            peer.destroy();
            if (cancelled) return null;
            throw error;
        }
    }

    return {
        ready: connect(),
        cancel() {
            cancelled = true;
            peer?.destroy();
        },
    };
}
~~~~

### `engine/share.js`

~~~~js
// Partage d'un lien : menu du téléphone s'il existe, sinon copie.
import { actionButton, setText } from './card.js';
import { t } from './strings.js';

/** Lien vers cette page, dans le même thème. */
export const pageLink = (hash) => `${location.origin}${location.pathname}${location.search}#${hash}`;

/** getLink est lu au moment du clic. keys : textes des boutons { share, copy } et du message partagé. */
export function shareButton(getLink, keys) {
    if (navigator.share) {
        return actionButton(keys.share, 'booster__btn booster__btn--main', () => {
            navigator.share({ title: document.title, text: t(keys.message), url: getLink() }).catch(() => {}); // partage annulé
        });
    }
    const button = actionButton(keys.copy, 'booster__btn booster__btn--main', async () => {
        try {
            await navigator.clipboard.writeText(getLink());
            setText(button.firstChild, 'share_copied');
        } catch {
            window.prompt(t(keys.copy), getLink()); // copie refusée par le navigateur
        }
    });
    return button;
}
~~~~

### `engine/showcase.js`

~~~~js
// Vitrine : quelques cartes choisies par le joueur, à montrer avec un lien.
// Le lien contient la vitrine entière : rien n'est envoyé à un serveur, et rien ne prouve que les cartes sont possédées.
import { actionButton, createCard, el, setText, text } from './card.js';
import { createModal } from './modal.js';
import { NAME_LENGTH, TITLE_LENGTH } from './player.js';
import { pageLink, shareButton } from './share.js';
import { t } from './strings.js';

function encode(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

const limit = (value, length) => (typeof value === 'string' ? value.slice(0, length) : '');

/** Lit la vitrine d'un lien. Renvoie { name, title, cards }, ou null si elle est illisible ou d'un autre jeu. */
export function readShowcase(player, code) {
    try {
        const bytes = Uint8Array.from(atob(code.replaceAll('-', '+').replaceAll('_', '/')), (letter) => letter.charCodeAt(0));
        const { game, name, title, cards } = JSON.parse(new TextDecoder().decode(bytes));
        if (game !== player.rules.gameId || !Array.isArray(cards)) return null;
        const found = [...new Set(cards)].map((id) => player.find(id)).filter(Boolean).slice(0, player.rules.showcase.size);
        return { name: limit(name, NAME_LENGTH), title: limit(title, TITLE_LENGTH), cards: found };
    } catch {
        return null;
    }
}

export function writeShowcase(player) {
    const { title, cards } = player.showcase;
    return encode({ game: player.rules.gameId, name: player.name, title, cards: cards.map((card) => card.id) });
}

export function createShowcase({ player, describe, onChange, onClose }) {
    const { cards } = player;
    const { size } = player.rules.showcase;
    const closeButton = el('button', 'detail__close', { type: 'button', textContent: '×' });
    const title = el('h2', 'showcase__title');
    title.id = 'showcase-title';
    const author = el('p', 'showcase__author');
    const shelf = el('div', 'showcase__shelf');
    const panel = el('div', 'showcase__panel');
    const overlay = el('div', 'showcase', {}, el('div', 'showcase__layout', {}, title, author, shelf, panel), closeButton);
    overlay.setAttribute('aria-labelledby', 'showcase-title');
    const modal = createModal(overlay, close);

    const face = (card) => {
        const node = createCard('div', card, describe(card), cards.indexOf(card) + 1, cards.length);
        node.classList.add('is-flipped');
        return node;
    };

    function spot(card, i, ...extra) {
        const node = el('div', 'showcase__spot', {}, face(card), ...extra);
        node.style.setProperty('--rarity', card.rarity.color);
        node.style.setProperty('--i', i);
        return node;
    }

    function setTitle(value, name) {
        title.textContent = value || t('showcase_default');
        author.textContent = name ? `${t('showcase_by')} ${name}` : '';
        author.hidden = !name;
    }

    // --- Ma vitrine ---

    function showMine() {
        overlay.dataset.mode = 'edit';
        const { showcase } = player;
        setTitle(showcase.title, player.name);

        const titleInput = el('input', 'trade__input', { value: showcase.title, maxLength: TITLE_LENGTH, placeholder: t('showcase_default') });
        titleInput.addEventListener('input', () => {
            player.setShowcaseTitle(titleInput.value);
            setTitle(player.showcase.title, player.name);
        });
        const nameInput = el('input', 'trade__input', { value: player.name, maxLength: NAME_LENGTH, autocomplete: 'nickname' });
        nameInput.addEventListener('input', () => {
            player.setName(nameInput.value);
            setTitle(player.showcase.title, player.name);
        });
        const share = shareButton(() => pageLink(`vitrine=${writeShowcase(player)}`), { share: 'showcase_share', copy: 'showcase_copy', message: 'showcase_message' });
        const count = el('p', 'showcase__count');
        const grid = el('div', 'picker showcase__picker');
        panel.replaceChildren(
            el('div', 'showcase__fields', {},
                el('label', 'trade__name', {}, text('span', '', 'showcase_name'), titleInput),
                el('label', 'trade__name', {}, text('span', '', 'trade_name'), nameInput),
                share),
            count, grid);

        function change(action) {
            action();
            onChange();
            renderShelf();
            renderPicker();
        }

        let dragged = null; // carte qu'on déplace
        function renderShelf() {
            const shown = player.showcase.cards;
            shelf.replaceChildren(...shown.map((card, i) => {
                const { name } = describe(card);
                const button = (sign, key, action, disabled) => {
                    const node = el('button', 'showcase__tool', { type: 'button', textContent: sign, disabled });
                    node.setAttribute('aria-label', `${t(key)} ${name}`);
                    node.addEventListener('click', () => change(action));
                    return node;
                };
                const node = spot(card, i, el('div', 'showcase__tools', {},
                    button('←', 'showcase_before', () => player.moveInShowcase(card, i - 1), i === 0),
                    button('×', 'showcase_remove', () => player.toggleShowcase(card), false),
                    button('→', 'showcase_after', () => player.moveInShowcase(card, i + 1), i === shown.length - 1)));
                node.draggable = true;
                node.addEventListener('dragstart', () => { dragged = card; });
                node.addEventListener('dragend', () => { dragged = null; });
                node.addEventListener('dragover', (event) => { if (dragged) event.preventDefault(); });
                node.addEventListener('drop', (event) => {
                    event.preventDefault();
                    if (dragged && dragged !== card) change(() => player.moveInShowcase(dragged, i));
                });
                return node;
            }));
            for (let i = shown.length; i < size; i++) shelf.append(el('div', 'showcase__spot showcase__spot--empty', {}, el('span', '', { textContent: '+' })));
            count.textContent = `${t('showcase_pick')} ${shown.length} / ${size}`;
            share.disabled = !shown.length;
            setText(share.firstChild, navigator.share ? 'showcase_share' : 'showcase_copy');
        }

        function renderPicker() {
            if (!grid.children.length) {
                grid.replaceChildren(...cards.filter((card) => player.has(card)).map((card) => {
                    const option = el('button', 'picker__option', { type: 'button' }, face(card));
                    option.dataset.id = card.id;
                    option.setAttribute('aria-label', describe(card).name);
                    option.addEventListener('click', () => change(() => player.toggleShowcase(card)));
                    return option;
                }));
                if (!grid.children.length) grid.append(text('p', 'trade__message', 'showcase_empty'));
            }
            const isFull = player.showcase.cards.length >= size;
            for (const option of grid.querySelectorAll('.picker__option')) {
                const isShown = player.isInShowcase(player.find(option.dataset.id));
                option.setAttribute('aria-pressed', isShown);
                option.disabled = isFull && !isShown;
            }
        }

        renderShelf();
        renderPicker();
    }

    // --- Vitrine reçue ---

    function showTheirs(showcase) {
        overlay.dataset.mode = 'view';
        setTitle(showcase.title, showcase.name);
        shelf.replaceChildren(...showcase.cards.map((card, i) => spot(card, i,
            text('p', `showcase__tag${player.has(card) ? ' is-owned' : ''}`, player.has(card) ? 'showcase_owned' : 'showcase_missing'))));
        panel.replaceChildren(el('div', 'booster__actions', {}, actionButton('showcase_close', 'booster__btn booster__btn--main', close)));
    }

    function show(content) {
        if (!overlay.hidden) return;
        closeButton.setAttribute('aria-label', t('cards_close'));
        modal.open();
        overlay.scrollTop = 0;
        content();
        closeButton.focus({ preventScroll: true });
    }

    function close() {
        if (overlay.hidden) return;
        modal.close();
        shelf.replaceChildren();
        panel.replaceChildren();
        onClose();
    }

    closeButton.addEventListener('click', close);
    return {
        open: () => show(showMine),
        view: (showcase) => show(() => showTheirs(showcase)),
    };
}
~~~~

### `engine/strings.js`

~~~~js
// Textes du moteur. Un thème peut les remplacer, un par un ou tous pour changer de langue, avec sa propriété texts.

export const STRINGS = {
    cards_welcome_title: 'Bienvenue ! Voici votre premier booster',
    cards_welcome_text: 'Ouvrez des boosters pour découvrir les cartes et compléter votre collection.',
    cards_pack_title: 'Nouveau booster',
    cards_pack_text: 'Les doubles se revendent ou s\'échangent.',
    cards_open_hint: 'Glissez sur le paquet pour le déchirer, ou cliquez dessus',
    cards_flip_hint: 'Cliquez sur la carte pour la retourner',
    cards_next_hint: 'Cliquez encore pour la carte suivante',
    cards_end_hint: 'Cliquez encore pour voir votre booster',
    cards_summary_title: 'Votre booster',
    cards_summary_hint: 'Ces cartes ont rejoint votre collection',
    cards_face_down: 'Carte face cachée',
    cards_skip: 'Tout retourner',
    cards_later: 'Plus tard',
    cards_open_booster: 'Ouvrir un booster',
    cards_again: 'Ouvrir un autre booster',
    cards_see_collection: 'Voir ma collection',
    cards_reveal_all: 'Révéler toutes les cartes',
    cards_reset: 'Recommencer',
    cards_reset_confirm: 'Effacer toutes vos cartes et vos pièces, et recommencer ?',
    cards_collection: 'Collection',
    cards_complete: 'Collection complète !',
    cards_hidden: 'Carte non découverte',
    cards_new: 'Nouveau',
    cards_close: 'Fermer',
    cards_double: 'Double',
    coins_name: ' pièces',
    booster_free: 'Gratuit',
    booster_cost: 'Prix :',
    booster_next: 'Gratuit dans',
    detail_copies: 'Exemplaires :',
    sell_one: 'Vendre un double',
    sell_all: 'Vendre tous les doubles',
    sell_spares: 'Vendre mes doubles',
    sell_booster: 'Vendre les doubles',
    sell_done: 'Vendu',
    trade_open: 'Échanger',
    trade_title: 'Échanger avec un ami',
    trade_intro: 'Échangez en direct : chacun pose une carte, des pièces ou les deux, puis vous validez tous les deux.',
    trade_name: 'Votre pseudo',
    trade_invite: 'Inviter un ami',
    trade_invite_text: 'Partagez un lien, ou faites scanner un QR code.',
    trade_invite_button: 'Créer un salon',
    trade_join_title: 'Rejoindre un ami',
    trade_join_text: 'Ouvrez le lien reçu, ou tapez le code affiché sur son écran.',
    trade_join: 'Rejoindre',
    trade_code: 'Code du salon',
    trade_preparing: 'Préparation du salon…',
    trade_joining: 'Connexion à votre ami…',
    trade_waiting: 'En attente de votre ami…',
    trade_share_text: 'Envoyez l\'invitation et gardez cette fenêtre ouverte.',
    trade_share: 'Partager l\'invitation',
    trade_share_message: 'On échange des cartes ?',
    trade_copy: 'Copier le lien d\'invitation',
    share_copied: 'Lien copié',
    trade_cancel: 'Annuler',
    trade_you: 'Vous',
    trade_partner: 'Votre ami',
    trade_slot_mine: 'Votre carte ou vos pièces',
    trade_slot_theirs: 'Son offre',
    trade_my_cards: 'Mes cartes',
    trade_their_cards: 'Cartes de',
    trade_requested: 'Demandée',
    trade_no_card: 'Vous n\'avez aucune carte à échanger.',
    trade_their_empty: 'Aucune carte à échanger.',
    trade_ready: 'Valider l\'échange',
    trade_unready: 'Annuler ma validation',
    trade_leave: 'Quitter le salon',
    trade_status_pick: 'Choisissez une carte ou des pièces à donner. Cliquez sur une de ses cartes pour la demander.',
    trade_status_wait_card: 'Votre ami prépare son offre…',
    trade_status_confirm: 'Cela vous convient ? Validez l\'échange.',
    trade_status_their_ready: 'Votre ami a validé, à vous !',
    trade_status_wait_ready: 'En attente de la validation de votre ami…',
    trade_status_going: 'Échange en cours…',
    trade_last_copy: 'C\'est votre seul exemplaire : la carte redeviendra non découverte.',
    trade_aborted: 'L\'échange a changé au dernier moment, validez à nouveau.',
    trade_success: 'Échange réussi !',
    trade_again: 'Échanger encore',
    room_error_network: 'La connexion a échoué. Vérifiez votre réseau et réessayez.',
    room_error_missing: 'Ce salon n\'existe pas ou est fermé.',
    room_error_timeout: 'Impossible de joindre votre ami. Réessayez, ou changez de réseau.',
    room_error_browser: 'Ce navigateur ne permet pas les échanges en direct.',
    room_error_full: 'Quelqu\'un a déjà rejoint ce salon.',
    room_error_left: 'Votre ami est parti.',
    room_error_game: 'Votre ami joue à un autre jeu.',
    room_error_self: 'Vous ne pouvez pas échanger avec vous-même.',
    trade_coins: 'Pièces à donner',
    trade_coins_got: 'Pièces reçues',
    trade_status_need_card: 'Il faut au moins une carte pour échanger.',
    room_error_version: 'Votre ami et vous n\'avez pas la même version du jeu. Rechargez la page des deux côtés.',
    cards_filter_all: 'Toutes',
    cards_filter_empty: 'Aucune carte ici pour le moment.',
    album_all: 'Tous les albums',
    favorite_title: 'Favoris',
    favorite_add: 'Ajouter aux favoris',
    favorite_remove: 'Retirer des favoris',
    label_title: 'Mes étiquettes',
    label_new: 'Nouvelle étiquette',
    label_create: 'Créer l\'étiquette',
    label_edit: 'Modifier',
    label_done: 'Terminé',
    label_rename: 'Renommer l\'étiquette',
    label_delete: 'Supprimer l\'étiquette',
    label_delete_confirm: 'Supprimer cette étiquette de toutes les cartes ?',
    showcase_mine: 'Ma vitrine',
    showcase_default: 'Ma vitrine',
    showcase_by: 'par',
    showcase_name: 'Titre',
    showcase_pick: 'Choisissez les cartes à exposer :',
    showcase_empty: 'Ouvrez un booster pour avoir des cartes à exposer.',
    showcase_share: 'Partager ma vitrine',
    showcase_copy: 'Copier le lien de ma vitrine',
    showcase_message: 'Regarde ma vitrine !',
    showcase_add: 'Ajouter à ma vitrine',
    showcase_take: 'Retirer de ma vitrine',
    showcase_full: 'Vitrine complète',
    showcase_before: 'Avancer',
    showcase_after: 'Reculer',
    showcase_remove: 'Retirer',
    showcase_owned: 'Vous l\'avez',
    showcase_missing: 'Il vous manque',
    showcase_close: 'Voir ma collection',
    advent_open: 'Calendrier de l\'Avent',
    advent_short: 'Calendrier',
    advent_title: 'Calendrier de l\'Avent',
    advent_intro: 'Chaque jour, une nouvelle case s\'ouvre, avec des boosters à l\'intérieur.',
    advent_until: 'Une case oubliée ? Elle vous attend jusqu\'au',
    advent_soon: 'Le calendrier ouvre le',
    advent_over: 'Le calendrier est terminé. Rendez-vous l\'année prochaine !',
    advent_day: 'Case',
    advent_locked: 'Patience : cette case s\'ouvre le',
    advent_opened: 'Déjà ouverte',
    advent_booster: 'booster',
    advent_boosters: 'boosters',
    advent_got: 'Vous recevez',
    advent_ready: 'case(s) à ouvrir',
    advent_play: 'Ouvrir mes boosters',
};

let themeTexts = {};

/** Textes que le thème ajoute ou remplace. */
export function setTexts(texts) {
    themeTexts = texts;
}

/** Texte du thème ou, à défaut, du moteur. */
export function t(key) {
    return (Object.hasOwn(themeTexts, key) ? themeTexts[key] : STRINGS[key]) ?? key;
}
~~~~

### `engine/style.css`

~~~~css
/* Valeurs par défaut : un thème remplace celles qu'il veut avec sa propriété colors. */
:root {
    --background: #0a131c;
    --background-glow: #15314a;
    --surface: #111d2b;
    --surface-raised: #1e293b;
    --border: #334155;
    --text: #f8fafc;
    --text-soft: #cbd5e1;
    --muted: #94a3b8;
    --accent: #7dd3fc;
    --accent-strong: #0284c7;
    --on-accent: #0c1721; /* texte sur une couleur vive (rareté, étiquette) */
    --on-accent-strong: #ffffff; /* texte sur le bouton principal */
    --coin: #fbbf24;
    --warning: #fde68a;
    --success: #4ade80;
    --danger: #fda4af;
    --pack-1: #0b3a5c; /* dégradé du booster */
    --pack-2: #0c1b2c;
    --pack-3: #3b1d66;
    --pack-motif: #7dd3fc;
    --on-pack: #f8fafc;
    --font-body: system-ui, sans-serif;
    --font-heading: var(--font-body);
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body { margin: 0; min-height: 100vh; background: var(--background); color: var(--text); font: 1rem/1.5 var(--font-body); overflow-x: hidden; }
h1, h2, h3, h4, p, figure { margin: 0; font-size: inherit; font-weight: inherit; }
h1, h2, h3, .tcard__name, .pack__label { font-family: var(--font-heading); }
button, input { font: inherit; color: inherit; }
button { padding: 0; border: 0; background: none; cursor: pointer; }
img, svg, iframe { display: block; max-width: 100%; }
a { color: inherit; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* ---------- Page ---------- */

.page { max-width: 76rem; margin: 0 auto; padding: 0 1.5rem 7rem; }
/* Bannière du haut : reste visible au défilement */
.banner { position: sticky; top: 0; z-index: 50; border-bottom: 1px solid var(--border); background: color-mix(in srgb, var(--background) 82%, transparent); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.banner__inner { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1.5rem; max-width: 76rem; margin: 0 auto; padding: 0.875rem 1.5rem; }
.banner__inner .page__nav { margin-right: auto; }
.banner__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.banner__btn { display: inline-flex; align-items: center; padding: 0.5rem 1rem; border: 1px solid var(--border); border-radius: 999px; background: color-mix(in srgb, var(--surface) 70%, transparent); color: var(--text-soft); font-size: 0.9375rem; font-weight: 500; white-space: nowrap; transition: color 0.2s, border-color 0.2s, background-color 0.2s; }
.banner__btn:hover { border-color: var(--accent); color: var(--text); background: color-mix(in srgb, var(--accent) 14%, var(--surface)); }
.banner__btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.banner__btn--advent { border-color: color-mix(in srgb, var(--coin) 55%, transparent); color: var(--coin); }
.banner__btn--advent:hover { border-color: var(--coin); color: var(--coin); background: color-mix(in srgb, var(--coin) 12%, var(--surface)); }
.banner__short { display: none; }
.page__brand { display: flex; align-items: center; gap: 0.75rem; font: 700 1.25rem var(--font-heading); }
.page__brand .motif { width: 2.25rem; height: 2.25rem; }
.page__brand img { width: 2.25rem; height: 2.25rem; object-fit: contain; }
.page__nav { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 1.5rem; }
.page__nav > a { color: var(--text-soft); text-decoration: none; }
.page__nav > a:hover { color: var(--accent); }
.page__hero { padding: clamp(2rem, 7vw, 5rem) 0 clamp(2rem, 5vw, 3.5rem); text-align: center; }
.page__title { font-size: clamp(2.25rem, 7vw, 4rem); font-weight: 700; line-height: 1.1; text-wrap: balance; }
.page__tagline { max-width: 40rem; margin: 1rem auto 0; color: var(--text-soft); font-size: 1.125rem; text-wrap: balance; }
.page__section { margin-top: 3rem; scroll-margin-top: 6rem; } /* sous la bannière */
.page__heading { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1.5rem; font-size: 1.75rem; font-weight: 700; }
.page__count { color: var(--muted); font: 500 1rem var(--font-body); font-variant-numeric: tabular-nums; }
.page__empty { margin-top: 3rem; color: var(--muted); text-align: center; }
.page__footer { margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid var(--border); color: var(--muted); font-size: 0.875rem; text-align: center; }
.page__error { max-width: 44rem; margin: 4rem auto; padding: 1.5rem; border: 1px solid var(--danger); border-radius: 0.75rem; white-space: pre-wrap; }

/* Sélecteur segmenté : filtres */
.segmented { display: inline-flex; overflow: hidden; border: 1px solid var(--border); border-radius: 999px; background: var(--surface-raised); }
.segmented button { padding: 0.5rem 1.125rem; color: var(--text-soft); transition: color 0.2s, background-color 0.2s; }
.segmented button + button { border-left: 1px solid var(--border); }
.segmented button:not([aria-pressed="true"]):hover { color: var(--text); background: color-mix(in srgb, var(--accent) 15%, transparent); }
.segmented button[aria-pressed="true"] { background: var(--accent); color: var(--on-accent); }
.segmented button:focus-visible { outline: 2px solid var(--accent); outline-offset: -3px; }
.filters { display: flex; justify-content: center; margin-top: 1.5rem; }
.filters .segmented { flex-wrap: wrap; justify-content: center; border-radius: 1.25rem; }
.segmented__label::before { content: ""; display: inline-block; width: 0.625rem; height: 0.625rem; margin-right: 0.5rem; border-radius: 50%; background: var(--label); }

/* Albums */
.albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr)); gap: 0.75rem; }
.album { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 0.5rem 0.75rem; padding: 0.875rem 1rem; border: 1px solid var(--border); border-radius: 0.75rem; background: color-mix(in srgb, var(--surface) 60%, transparent); text-align: left; transition: border-color 0.2s, background-color 0.2s; }
.album:hover { border-color: var(--accent); }
.album[aria-pressed="true"] { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 14%, var(--surface)); }
.album:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.album__name { font-weight: 600; line-height: 1.25; }
.album__count { color: var(--muted); font-size: 0.875rem; font-variant-numeric: tabular-nums; }
.album .collection__progress { grid-column: 1 / -1; height: 0.375rem; }
.album.is-complete .album__count { color: var(--success); font-weight: 600; }
.album.is-complete .album__count::after { content: " ✓"; }
.album.is-complete .collection__progress::-webkit-progress-value { background: var(--success); }
.album.is-complete .collection__progress::-moz-progress-bar { background: var(--success); }
@media (max-width: 768px) {
    .page { padding-inline: 1rem; }
    .banner__inner { padding: 0.625rem 1rem; }
    /* Les boutons passent sur leur propre ligne, à parts égales */
    .banner__actions { width: 100%; flex-wrap: nowrap; }
    .banner__btn { flex: 1 1 0; justify-content: center; min-width: 0; padding: 0.4375rem 0.5rem; font-size: 0.8125rem; }
    .banner__btn--advent { flex-grow: 1.35; }
    .banner__btn > span:first-child, .banner__short { overflow: hidden; text-overflow: ellipsis; }
    .banner__long { display: none; }
    .banner__short { display: inline; }
    .albums { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .album:first-child { grid-column: 1 / -1; }
    .filters .segmented button { flex: 1 1 auto; }
}

/* --rarity : couleur de la rareté, posée par le script sur chaque carte. */

[hidden] { display: none !important; }

/* Motif du thème : sur le booster, au dos des cartes et sur les cartes cachées */
.motif { display: grid; place-items: center; width: 55%; height: 34%; color: var(--accent); }
.motif svg { width: 100%; height: 100%; overflow: visible; }

/* Pièce */
.coins { white-space: nowrap; font-variant-numeric: tabular-nums; }
.coins::before { content: ""; display: inline-block; width: 0.95em; height: 0.95em; margin-right: 0.3em; vertical-align: -0.12em; border-radius: 50%; background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--coin) 25%, #ffffff) 0 12%, transparent 30%), radial-gradient(circle, var(--coin) 0 52%, color-mix(in srgb, var(--coin) 55%, #7c2d12) 56% 64%, var(--coin) 68%); }

.coins--icon::before { margin-right: 0; }

/* ---------- Fenêtre d'ouverture ---------- */

.booster {
    position: fixed;
    inset: 0;
    z-index: 1000;
    overflow-x: hidden;
    overflow-y: auto;
    background: radial-gradient(circle at 50% 45%, var(--background-glow) 0%, var(--background) 65%);
    outline: none;
    animation: booster-in 0.35s ease-out;
}
.booster__scene {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    min-height: 100%;
    overflow: clip; /* les rayons débordent de l'écran */
    padding: 1.5rem 1rem;
    text-align: center;
}
.booster__title { font-size: clamp(1.375rem, 4vw, 2rem); font-weight: 700; line-height: 1.2; text-wrap: balance; }
.booster__intro { max-width: 34rem; color: var(--text-soft); text-wrap: balance; }
.booster__hint { min-height: 1.5em; color: var(--muted); font-size: 0.9375rem; }
.booster__live { position: absolute; top: 0; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.booster__counter { position: absolute; top: 100%; margin-top: 0.75rem; color: var(--muted); font-size: 0.875rem; font-variant-numeric: tabular-nums; }
.booster__stage { --card: min(19rem, 74vw, 42vh); position: relative; display: grid; place-items: center; margin: 1rem 0; }
.booster[data-phase="deck"] .booster__stage { margin-bottom: 3rem; }
.booster[data-phase="deck"] :is(.booster__title, .booster__intro) { display: none; }
.booster[data-phase="summary"] .booster__intro { display: none; }
.booster[data-phase="summary"] .booster__stage { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; max-width: 72rem; }

.booster__actions, .collection__actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0.5rem 1rem; }
.booster__btn { padding: 0.75rem 1.5rem; border: 1px solid var(--accent-strong); border-radius: 0.5rem; color: var(--accent); font-weight: 500; transition: background-color 0.2s; }
.booster__btn:hover { background: color-mix(in srgb, var(--accent) 40%, transparent); }
.booster__btn--main { background: var(--accent-strong); color: var(--on-accent-strong); }
.booster__btn--main:hover { background: color-mix(in srgb, var(--accent-strong) 82%, #000000); }
.booster__btn--coins { border-color: color-mix(in srgb, var(--coin) 60%, transparent); color: var(--coin); }
.booster__btn--coins:hover { background: color-mix(in srgb, var(--coin) 14%, transparent); }
.booster__btn:disabled { opacity: 0.45; cursor: not-allowed; }
.booster__link { padding: 0.5rem; color: var(--muted); font-size: 0.875rem; text-decoration: underline; text-underline-offset: 3px; }
.booster__link:hover { color: var(--text); }
:is(.booster__btn, .booster__link, .floating-booster, .pack, .tcard):focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }

.booster::after { content: ""; position: fixed; inset: 0; background: #ffffff; opacity: 0; pointer-events: none; }
.booster.is-flashing::after { animation: flash 0.9s ease-out; }

/* ---------- Paquet ---------- */

.pack {
    --tear: 0;
    --cut: 16%; /* hauteur de la bande à déchirer */
    position: relative;
    width: calc(var(--card) * 0.9);
    aspect-ratio: 5 / 7.6;
    container-type: inline-size;
    touch-action: pan-y;
    user-select: none;
    filter: drop-shadow(0 1.25rem 2rem rgba(0, 0, 0, 0.5));
    animation: pack-float 3.5s ease-in-out infinite;
}
.pack:hover:not(.is-open) { filter: drop-shadow(0 0 1.75rem color-mix(in srgb, var(--accent) 55%, transparent)); }
.pack.is-tearing { animation: pack-shake 0.15s linear infinite; }
.pack__half { position: absolute; inset: 0; pointer-events: none; }
.pack__half--top { clip-path: inset(0 0 calc(100% - var(--cut)) 0); transform-origin: 100% 10%; transform: rotate(calc(var(--tear) * 5deg)) translateY(calc(var(--tear) * -0.5rem)); }
.pack__half--bottom { clip-path: inset(var(--cut) 0 0 0); }
.pack:not(.is-tearing) .pack__half--top { transition: transform 0.2s; }
.pack__art {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5%;
    border-radius: 0.375rem;
    background:
        repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.22) 0 2px, transparent 2px 6px) top / 100% 5% no-repeat,
        repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.22) 0 2px, transparent 2px 6px) bottom / 100% 5% no-repeat,
        linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.28) 45%, transparent 58%),
        radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%),
        linear-gradient(160deg, var(--pack-1), var(--pack-2) 45%, var(--pack-3));
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);
    color: var(--on-pack);
}
.pack__art .motif { height: 30%; width: 66%; color: var(--pack-motif); }
.pack__brand { white-space: nowrap; font-size: 5.6cqw; letter-spacing: 0.02em; color: color-mix(in srgb, var(--pack-motif) 55%, var(--on-pack)); }
.pack__label { white-space: nowrap; font-size: 9.2cqw; font-weight: 700; letter-spacing: 0.12em; }
.pack__count { padding: 0.125rem 0.75rem; border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 999px; font-size: 5.4cqw; }
.pack__cut { position: absolute; top: var(--cut); left: 0; width: calc(var(--tear) * 100%); height: 3px; background: #ffffff; box-shadow: 0 0 14px 4px var(--accent); opacity: var(--tear); pointer-events: none; }
.pack.is-open { animation: none; pointer-events: none; }
.pack.is-open .pack__half--top { animation: pack-top 0.6s ease-in forwards; }
.pack.is-open .pack__half--bottom { animation: pack-bottom 0.55s 0.25s ease-in forwards; }
.pack.is-open .pack__cut { transition: opacity 0.3s; opacity: 0; }

/* ---------- Carte ---------- */

.tcard { position: relative; display: block; border-radius: 1rem; width: var(--card); aspect-ratio: 5 / 7; container-type: inline-size; perspective: 60rem; text-align: left; color: var(--text); }
.tcard__inner { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.3, 1.1); transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)); font-size: 5.4cqw; line-height: 1.35; }
.tcard:hover .tcard__inner { transition-duration: 0.15s; }
.tcard.is-flipped .tcard__inner { transform: rotateX(var(--tilt-x, 0deg)) rotateY(calc(180deg + var(--tilt-y, 0deg))); }
.tcard--deck.is-flipped .tcard__inner { transition-duration: 0.4s; }
.tcard--deck.is-flipped:hover .tcard__inner { transition-duration: 0.4s; }

.tcard__face { position: absolute; inset: 0; overflow: hidden; border-radius: 5cqw; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.tcard__back, .pile__card {
    display: grid;
    place-items: center;
    border: 2px solid var(--border);
    background:
        radial-gradient(circle, color-mix(in srgb, var(--accent) 22%, transparent), transparent 62%),
        repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.035) 0 8px, transparent 8px 16px),
        var(--surface);
}
.tcard__front {
    display: flex;
    flex-direction: column;
    gap: 2.2cqw;
    padding: 4.5cqw;
    transform: rotateY(180deg);
    border: 1.6cqw solid var(--rarity);
    background: linear-gradient(165deg, color-mix(in srgb, var(--rarity) 32%, var(--surface)), var(--surface) 55%);
}
.tcard__name { font-size: 1.15em; font-weight: 700; line-height: 1.15; text-wrap: balance; }
.tcard__art { position: relative; flex: none; height: 50%; overflow: hidden; border-radius: 2.5cqw; background: var(--background); }
.tcard__art img { width: 100%; height: 100%; object-fit: cover; }
.tcard__art--contain { display: grid; place-items: center; background: radial-gradient(circle, color-mix(in srgb, var(--rarity) 45%, transparent), transparent 70%), var(--background); }
.tcard__art--contain img { width: 42%; height: 62%; object-fit: contain; }
.tcard__art--motif { display: grid; place-items: center; background: radial-gradient(circle, color-mix(in srgb, var(--rarity) 45%, transparent), transparent 70%), var(--background); }
.tcard__art--motif .motif { width: 60%; height: 60%; color: var(--rarity); }
.tcard__type { color: color-mix(in srgb, var(--rarity) 70%, var(--text)); font-size: 0.72em; font-weight: 600; }
.tcard__text { flex: 1; min-height: 0; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 5; color: var(--text-soft); font-size: 0.76em; }
.tcard__stats { display: flex; flex-wrap: wrap; gap: 0.2em 1em; color: var(--muted); font-size: 0.72em; }
.tcard__stats b { color: var(--text); }
.tcard__footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; color: var(--muted); font-size: 0.72em; font-variant-numeric: tabular-nums; }
.tcard__rarity { padding: 0 0.7em; border-radius: 999px; background: var(--rarity); color: var(--on-accent); font-weight: 700; }

/* Reflet : discret pour une carte rare, irisé au-delà */
.tcard__holo { position: absolute; inset: 0; pointer-events: none; opacity: 0; }
.tcard[data-effect="glow"] .tcard__holo { opacity: 1; background: radial-gradient(circle at var(--mx, 30%) var(--my, 15%), rgba(255, 255, 255, 0.22), transparent 45%); }
.tcard:is([data-effect="burst"], [data-effect="legend"]) .tcard__holo {
    opacity: 0.42;
    mix-blend-mode: color-dodge;
    background:
        radial-gradient(circle at var(--mx, 30%) var(--my, 15%), rgba(255, 255, 255, 0.45), transparent 50%),
        repeating-linear-gradient(115deg, rgba(255, 90, 160, 0.28) 0 6%, rgba(255, 220, 90, 0.28) 10%, rgba(90, 255, 200, 0.28) 16%, rgba(100, 140, 255, 0.28) 22%, rgba(255, 90, 160, 0.28) 28%);
    background-position: 0 0, var(--mx, 0%) var(--my, 0%);
    background-size: 100% 100%, 250% 250%;
}
.tcard[data-effect="legend"] .tcard__front { background: linear-gradient(165deg, color-mix(in srgb, var(--rarity) 42%, var(--surface)), color-mix(in srgb, var(--rarity) 9%, var(--surface)) 55%, color-mix(in srgb, var(--rarity) 30%, var(--surface))); box-shadow: inset 0 0 8cqw color-mix(in srgb, var(--rarity) 35%, transparent); }

/* Petite carte : on garde l'essentiel, en plus gros */
@container (max-width: 12rem) {
    .tcard__inner { font-size: 7.6cqw; }
    .tcard__art { height: 56%; }
    .tcard__text { display: none; }
}

/* Carte à retourner */
.tcard--deck { animation: card-in 0.15s ease-out; }
.tcard--deck.is-charging { animation: card-shake var(--charge) ease-in; }
.tcard--deck.is-charging .tcard__back { border-color: var(--rarity); animation: charge-glow var(--charge) ease-in forwards; }
.tcard--deck.is-flipped:not([data-effect="none"]) .tcard__front { box-shadow: 0 0 2.5rem color-mix(in srgb, var(--rarity) 60%, transparent); }
.tcard--deck[data-effect="legend"].is-flipped { animation: legend-pop 0.8s cubic-bezier(0.2, 0.9, 0.3, 1.2); }
.tcard--leaving { position: absolute; inset: 0; z-index: 4; pointer-events: none; }
.pile { position: absolute; inset: 0; pointer-events: none; }
.pile__card { position: absolute; inset: 0; border-radius: 1rem; transform: translateY(calc(var(--depth) * 0.45rem)) scale(calc(1 - var(--depth) * 0.02)); z-index: calc(var(--depth) * -1); }

/* Animation passée d'un clic */
.tcard.tcard--deck.is-instant.is-instant, .tcard.tcard--deck.is-instant.is-instant .tcard__inner { animation: none; transition: none; }
.tcard--deck.is-instant ~ .status-tag { animation: none; }

/* Résultat */
.booster__item { --card: min(13rem, 42vw); display: grid; justify-items: center; gap: 0.5rem; animation: card-in 0.4s ease-out both; animation-delay: calc(var(--i) * 80ms); }
.booster__item .tcard:not([data-effect="none"]) .tcard__front { box-shadow: 0 0 1.25rem color-mix(in srgb, var(--rarity) 45%, transparent); }
.booster__price { color: var(--text-soft); font-size: 0.9375rem; }
.status-tag { padding: 0.0625rem 0.75rem; border-radius: 999px; background: var(--surface-raised); color: var(--text-soft); font-size: 0.8125rem; font-weight: 600; white-space: nowrap; }
.status-tag.is-new { background: var(--text); color: var(--background); }
.booster__stage > .status-tag { position: absolute; bottom: calc(100% + 0.5rem); animation: card-in 0.3s 0.35s ease-out both; }

/* ---------- Effets d'apparition ---------- */

.fx { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none; }
.fx > * { position: absolute; border-radius: 50%; opacity: 0; }
.fx__rays { width: 220%; aspect-ratio: 1; background: repeating-conic-gradient(color-mix(in srgb, var(--rarity) 55%, transparent) 0deg 7deg, transparent 7deg 20deg); -webkit-mask-image: radial-gradient(circle, #000 20%, transparent 66%); mask-image: radial-gradient(circle, #000 20%, transparent 66%); }
.fx__ring { width: 120%; aspect-ratio: 1; border: 4px solid var(--rarity); box-shadow: 0 0 2rem var(--rarity); }
.fx[data-effect="glow"].is-active .fx__ring { animation: ring 0.7s ease-out; }
.fx[data-effect="burst"].is-active .fx__ring { animation: ring 0.8s ease-out 2; }
.fx[data-effect="burst"].is-active .fx__rays { animation: rays-in 0.5s ease-out forwards, spin 24s linear infinite; --rays: 0.55; }
.fx[data-effect="legend"].is-active .fx__ring { animation: ring 0.9s ease-out 3; }
.fx[data-effect="legend"].is-active .fx__rays { width: 300%; animation: rays-in 0.6s ease-out forwards, spin 16s linear infinite; --rays: 0.95; }
.particle { position: absolute; top: 50%; left: 50%; border-radius: 50%; pointer-events: none; z-index: 5; }

/* ---------- Grilles de la collection ---------- */

/* Une case a les proportions d'une carte ; la carte elle-même remplace l'habillage d'origine. */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(14.5rem, 42%), 1fr)); gap: 1.5rem; }
.tile { --card: 100%; position: relative; overflow: visible; aspect-ratio: 5 / 7; padding: 0; border: 0; border-radius: 1rem; background: none; box-shadow: none; transform: none; transition: none; cursor: pointer; }
.tile.is-undiscovered { cursor: inherit; }
.tile:not(.is-undiscovered):hover { z-index: 2; }
.tile:not(.is-undiscovered) .tcard { transition: transform 0.25s; }
.tile:not(.is-undiscovered):hover .tcard { transform: translateY(-0.375rem); }
.tile .tcard:not([data-effect="none"]) .tcard__front { box-shadow: 0 0 1rem color-mix(in srgb, var(--rarity) 35%, transparent); }
.hidden-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    height: 100%;
    border: 2px solid var(--border);
    border-radius: inherit;
    background: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0 8px, transparent 8px 16px), var(--surface);
    color: var(--muted);
}
.hidden-card .motif { position: absolute; width: 45%; height: 35%; opacity: 0.16; }
.hidden-card__mark { font-size: 2.5rem; font-weight: 700; line-height: 1; color: var(--muted); }
.hidden-card__text { position: relative; font-size: 0.875rem; }

.count-tag { position: absolute; top: -0.5rem; right: 0.75rem; z-index: 3; padding: 0.0625rem 0.625rem; border-radius: 999px; background: var(--coin); color: var(--on-accent); font-size: 0.8125rem; font-weight: 700; pointer-events: none; }
.new-tag { position: absolute; top: -0.5rem; left: 0.75rem; z-index: 3; display: none; padding: 0.0625rem 0.625rem; border-radius: 999px; background: var(--text); color: var(--background); font-size: 0.75rem; font-weight: 600; pointer-events: none; }
.is-new .new-tag { display: block; }
/* Sur une carte retournée : côtés inversés, et juste devant le recto */
.tcard__inner > :is(.count-tag, .new-tag, .label-dots, .favorite--tile) { line-height: 1.5; transform: translateZ(-1px) rotateY(180deg); backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.tcard__inner > .count-tag { right: auto; left: 0.75rem; }
.tcard__inner > .new-tag { left: auto; right: 0.75rem; }

/* Favori et étiquettes */
.favorite { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 50%; color: var(--muted); font-size: 1.375rem; line-height: 1; transition: color 0.2s, opacity 0.2s; }
.favorite:hover { color: var(--danger); }
.favorite[aria-pressed="true"] { color: #fb7185; }
.favorite:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.favorite--tile { position: absolute; left: calc(50% - 1.25rem); bottom: 0.375rem; z-index: 3; opacity: 0; }
.tile:hover .favorite--tile, .favorite--tile:focus-visible, .favorite--tile[aria-pressed="true"] { opacity: 1; }
@media (hover: none) { .favorite--tile { opacity: 0.55; } }
.label-dots { position: absolute; left: 0; right: 0; bottom: -0.3125rem; z-index: 3; display: flex; justify-content: center; gap: 0.25rem; pointer-events: none; }
.label-dot { width: 0.75rem; height: 0.75rem; border: 2px solid var(--background); border-radius: 50%; background: var(--label); }
.tile__open { position: absolute; inset: 0; border-radius: 1rem; pointer-events: none; }
.tile__open:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
.detail__heading { display: flex; align-items: center; gap: 0.75rem; }
.detail__heading .favorite { flex: none; font-size: 2rem; }
.detail__album::before { content: "·"; margin-right: 0.75rem; }
.labels__title { margin-bottom: 0.5rem; color: var(--text-soft); font-size: 0.875rem; font-weight: 600; }
.labels__list { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.label-chip { display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border: 1px solid color-mix(in srgb, var(--label, var(--border)) 70%, transparent); border-radius: 999px; color: var(--text-soft); font-size: 0.875rem; }
.label-chip::before { content: ""; width: 0.625rem; height: 0.625rem; margin-right: 0.5rem; border-radius: 50%; background: var(--label); }
.label-chip[aria-pressed="true"] { background: color-mix(in srgb, var(--label) 30%, transparent); color: var(--text); }
button.label-chip:hover { border-color: var(--label); }
button.label-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.label-chip--new { border-style: dashed; }
.label-chip--new::before { content: none; }
.label-chip__input { width: 9rem; padding: 0.125rem 0; border: 0; background: none; color: var(--text); outline: none; }
.label-chip:focus-within:not(button) { border-color: var(--accent); }
.label-chip__remove { width: 1.5rem; height: 1.5rem; margin-right: -0.375rem; border-radius: 50%; font-size: 1.125rem; line-height: 1; }
.label-chip__remove:hover { background: color-mix(in srgb, var(--text) 15%, transparent); }

/* Case vide pendant que sa carte est sortie */
.tile.is-out { outline: 2px dashed color-mix(in srgb, var(--rarity) 60%, transparent); outline-offset: -2px; }
.is-out > * { visibility: hidden; }
.tile:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }

/* ---------- Détail d'une carte ---------- */

.detail {
    --card: min(27rem, 36vw, calc((100vh - 5rem) * 5 / 7));
    position: fixed;
    inset: 0;
    z-index: 900;
    overflow-x: hidden;
    overflow-y: auto;
    outline: none;
}
.detail.is-moving { overflow: hidden; }
.detail__bg { position: fixed; inset: 0; background: var(--background) center / cover no-repeat; animation: booster-in 0.4s ease-out; transition: opacity 0.4s; }
/* Voile : l'image de la carte reste une ambiance, le texte garde son contraste */
.detail__bg::after { content: ""; position: absolute; inset: 0; background: radial-gradient(circle at 25% 50%, color-mix(in srgb, var(--rarity) 22%, transparent), transparent 45%), color-mix(in srgb, var(--background) 88%, transparent); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }
.detail__layout { position: relative; display: grid; grid-template-columns: var(--card) minmax(0, 46rem); align-items: center; justify-content: center; gap: clamp(1.5rem, 4vw, 4rem); min-height: 100%; padding: 2.5rem clamp(1rem, 4vw, 4rem); }
.detail__card { width: var(--card); aspect-ratio: 5 / 7; }
.tcard--detail { z-index: 1; filter: drop-shadow(0 1.5rem 2.5rem rgba(0, 0, 0, 0.5)); }
.tcard--detail:not([data-effect="none"]) .tcard__front { box-shadow: 0 0 2.5rem color-mix(in srgb, var(--rarity) 50%, transparent); }
.detail__info { display: flex; flex-direction: column; gap: 1rem; max-height: calc(100vh - 5rem); padding-right: 0.5rem; overflow-y: auto; scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--accent) 50%, transparent) transparent; animation: info-in 0.5s 0.2s ease-out both; transition: opacity 0.2s; }
.detail__info > * { flex: none; }
.detail__meta { display: flex; align-items: center; gap: 0.75rem; padding-right: 3rem; color: var(--muted); font-size: 0.875rem; }
.detail__rarity { padding: 0.0625rem 0.75rem; border-radius: 999px; background: var(--rarity); color: var(--on-accent); font-weight: 600; }
.detail__title { font-size: clamp(1.75rem, 3.5vw, 2.75rem); font-weight: 700; line-height: 1.1; text-wrap: balance; }
.detail__subtitle { margin-top: -0.5rem; color: color-mix(in srgb, var(--rarity) 60%, var(--text)); font-weight: 500; }
.detail__text { color: var(--text-soft); line-height: 1.65; white-space: pre-wrap; }
.detail__stats { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.detail__stats > span { padding: 0.375rem 0.875rem; border: 1px solid var(--border); border-radius: 0.5rem; color: var(--muted); font-size: 0.9375rem; }
.detail__stats b { color: var(--text); font-weight: 600; }
.detail__links { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; }
.detail__links a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
.detail__owned { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }
.detail__owned .booster__btn { padding: 0.5rem 1rem; font-size: 0.875rem; }
.detail__count { margin-right: 0.5rem; color: var(--text-soft); }
.detail__embed { width: 100%; border: 0; border-radius: 0.75rem; aspect-ratio: 16 / 9; background: rgba(0, 0, 0, 0.35); }
.detail__close { position: fixed; top: 1rem; right: 1.25rem; z-index: 2; width: 2.75rem; height: 2.75rem; border-radius: 50%; background: color-mix(in srgb, var(--background) 70%, transparent); color: var(--text); font-size: 1.75rem; line-height: 1; }
.detail__close:hover { background: color-mix(in srgb, var(--accent) 35%, transparent); }
.detail__close:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.detail.is-closing :is(.detail__bg, .detail__info, .detail__close) { opacity: 0; animation: none; }

@media (max-width: 768px) {
    /* Pas la place côte à côte : la carte au-dessus, les informations en dessous */
    .detail { --card: min(17rem, 70vw); }
    .detail__layout { grid-template-columns: minmax(0, 1fr); justify-items: center; align-content: start; padding-top: 4rem; }
    .detail__info { width: 100%; max-height: none; padding-right: 0; overflow: visible; }
    .detail__meta { padding-right: 0; }
}

/* ---------- Échanges ---------- */

.trade { position: fixed; inset: 0; z-index: 900; overflow-x: hidden; overflow-y: auto; background: radial-gradient(circle at 50% 0%, var(--background-glow) 0%, var(--background) 60%); outline: none; animation: booster-in 0.3s ease-out; }
.trade__layout { max-width: 68rem; min-height: 100%; margin: 0 auto; padding: 1.75rem 1.5rem 2.5rem; }
.trade__title { padding: 0 3rem 1rem 0; font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 700; line-height: 1.2; }
.trade__body { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
.trade[data-screen="lobby"] .trade__body { align-items: stretch; }
.trade__columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; width: 100%; align-items: start; }
.trade__panel { display: flex; flex-direction: column; align-items: flex-start; gap: 0.75rem; padding: 1.25rem; border: 1px solid var(--border); border-radius: 0.75rem; background: color-mix(in srgb, var(--surface) 80%, transparent); }
.trade[data-screen="lobby"] .trade__columns { align-items: stretch; }
.trade[data-screen="lobby"] .trade__panel { padding: 1.75rem; }
.trade__heading { font-size: 1.375rem; font-weight: 600; }
.trade__label { color: var(--text-soft); font-size: 0.875rem; font-weight: 600; }
.trade__message { color: var(--text-soft); }
.trade__message.is-error { color: var(--danger); }
.trade__name { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; color: var(--text-soft); }
.trade__input { padding: 0.5rem 0.875rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--background); color: var(--text); }
.trade__input:focus { outline: 2px solid var(--accent); }
.trade__input--code { width: 10.5rem; padding-block: 0.375rem; font-size: 1.5rem; font-weight: 700; letter-spacing: 0.2em; text-align: center; text-transform: uppercase; }
.trade__form { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: auto; }
.trade[data-screen="lobby"] .trade__panel > .booster__btn { margin-top: auto; }

.trade__host { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; margin-top: 1.5rem; text-align: center; }
.trade__invite { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 2rem; padding: 1.75rem; border: 1px solid var(--border); border-radius: 1rem; background: color-mix(in srgb, var(--surface) 80%, transparent); }
.trade__qr { width: 11rem; padding: 0.25rem; border-radius: 0.75rem; background: #ffffff; overflow: hidden; }
.trade__qr svg { display: block; width: 100%; height: auto; }
.trade__roomcode { margin-bottom: 1rem; font-size: 3rem; font-weight: 700; line-height: 1.2; letter-spacing: 0.14em; color: var(--accent); }
.trade__waiting { display: flex; align-items: center; gap: 0.875rem; color: var(--text-soft); }
.trade__waiting .motif { width: 3rem; height: 2rem; animation: motif-pulse 0.9s ease-in-out infinite alternate; }

/* Table : une carte de chaque côté */
.swap { display: flex; align-items: center; justify-content: center; gap: clamp(0.75rem, 3vw, 2.5rem); width: 100%; }
.swap__slot { --card: clamp(7.5rem, 20vw, 11.5rem); display: grid; justify-items: center; gap: 0.5rem; }
.swap__name { max-width: var(--card); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
.swap__place { position: relative; width: var(--card); aspect-ratio: 5 / 7; border-radius: 1rem; transition: box-shadow 0.25s; }
.swap__slot.is-ready .swap__place { box-shadow: 0 0 0 4px var(--success), 0 0 2rem color-mix(in srgb, var(--success) 45%, transparent); }
.swap__slot.is-ready .swap__name::after { content: " ✓"; color: var(--success); }
.swap__place > .tcard { animation: card-in 0.3s ease-out; }
.swap__empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; height: 100%; padding: 0.5rem; border: 2px dashed var(--border); border-radius: inherit; color: var(--muted); font-size: 0.8125rem; text-align: center; }
.swap__empty .motif { opacity: 0.35; }
.swap__coins { display: flex; align-items: center; justify-content: center; gap: 0.375rem; min-height: 2.5rem; font-weight: 600; }
.swap__slot { justify-self: center; }
.swap__amount { width: 4.25rem; padding: 0.25rem 0.375rem; border: 1px solid var(--border); border-radius: 0.5rem; background: var(--background); color: var(--coin); text-align: center; font-weight: 600; appearance: textfield; -moz-appearance: textfield; }
.swap__amount::-webkit-inner-spin-button, .swap__amount::-webkit-outer-spin-button { margin: 0; appearance: none; -webkit-appearance: none; }
.swap__amount:focus { outline: 2px solid var(--coin); }
.swap__step { width: 2.25rem; height: 2.25rem; border: 1px solid color-mix(in srgb, var(--coin) 50%, transparent); border-radius: 50%; color: var(--coin); font-size: 1.25rem; line-height: 1; }
.swap__step:hover { background: color-mix(in srgb, var(--coin) 14%, transparent); }
.swap__step:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
:is(.swap__step, .swap__amount):disabled { opacity: 0.35; cursor: not-allowed; }
.coin-pile { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; width: var(--card); aspect-ratio: 5 / 7; border: 2px solid color-mix(in srgb, var(--coin) 60%, transparent); border-radius: 1rem; background: radial-gradient(circle, color-mix(in srgb, var(--coin) 25%, transparent), transparent 65%), var(--surface); animation: card-in 0.3s ease-out; }
.coin-pile .coins--icon { font-size: 4rem; line-height: 1; }
.coin-pile__amount { font-size: 1.75rem; font-weight: 700; color: var(--coin); font-variant-numeric: tabular-nums; }
.swap__middle { display: grid; justify-items: center; gap: 0.75rem; }
.swap__arrows { font-size: 2rem; line-height: 1; color: var(--accent); }
.swap__middle .booster__btn { padding: 0.625rem 1rem; }
.swap__middle .booster__btn.is-on { border-color: var(--success); background: transparent; color: var(--success); }
.swap__status { display: grid; gap: 0.25rem; min-height: 3rem; color: var(--text-soft); text-align: center; }
.swap__warning { color: var(--warning); font-size: 0.9375rem; }

.picker { position: relative; display: grid; grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr)); gap: 0.75rem; width: 100%; max-height: 19rem; padding: 0.625rem; overflow-y: auto; scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--accent) 50%, transparent) transparent; border-radius: 0.5rem; background: color-mix(in srgb, var(--background) 60%, transparent); }
.picker > .trade__message { grid-column: 1 / -1; }
.picker__option { --card: 100%; position: relative; aspect-ratio: 5 / 7; border-radius: 0.5rem; outline-offset: 2px; text-align: left; }
.picker__option .tcard { pointer-events: none; }
.picker__option[aria-pressed="true"] { outline: 3px solid var(--accent); }
.picker__option:focus-visible { outline: 2px dashed var(--accent); }
.picker__flag { position: absolute; inset: auto 0 0; display: none; padding: 0.125rem; border-radius: 0 0 0.5rem 0.5rem; background: var(--warning); color: var(--on-accent); font-size: 0.75rem; font-weight: 700; text-align: center; }
.picker__option.is-requested { box-shadow: 0 0 0 3px var(--warning); }
.picker__option.is-requested .picker__flag { display: block; }
.picker__hidden { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; border: 2px solid color-mix(in srgb, var(--rarity) 45%, var(--border)); border-radius: inherit; background: var(--surface); color: var(--muted); font-size: 1.5rem; font-weight: 700; }
.picker__hidden small { font-size: 0.75rem; font-weight: 400; }
.picker .count-tag { top: -0.25rem; right: -0.25rem; padding: 0 0.4375rem; font-size: 0.75rem; }

.trade__result { --card: min(16rem, 62vw); position: relative; display: grid; place-items: center; margin: 1.5rem 0; animation: legend-pop 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.2); }
.trade[data-screen="result"] { overflow-x: clip; }
.trade[data-screen="result"] .trade__body { min-height: 70vh; justify-content: center; overflow: clip; }

@media (max-width: 768px) {
    .trade__layout { padding: 1.25rem 1rem 2.5rem; }
    .trade__columns { grid-template-columns: minmax(0, 1fr); }
    /* Le bouton passe sous les deux cartes */
    .swap { flex-wrap: wrap; }
    .swap__slot { --card: min(9.5rem, 40vw); }
    .swap__middle { order: 1; width: 100%; }
    .swap__arrows { display: none; }
    .picker { max-height: 15rem; }
}

/* ---------- Vitrine ---------- */

.showcase { position: fixed; inset: 0; z-index: 900; overflow-x: hidden; overflow-y: auto; background: radial-gradient(ellipse at 50% 12%, var(--background-glow), var(--background) 65%); outline: none; animation: booster-in 0.3s ease-out; }
.showcase__layout { max-width: 72rem; min-height: 100%; margin: 0 auto; padding: 2.25rem 1.5rem 3rem; text-align: center; }
.showcase__title { padding: 0 3rem; font-size: clamp(1.75rem, 5vw, 2.75rem); font-weight: 700; line-height: 1.15; text-wrap: balance; overflow-wrap: anywhere; }
.showcase__author { margin-top: 0.375rem; color: var(--text-soft); }
.showcase__shelf { --card: clamp(8.5rem, 19vw, 13rem); display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem clamp(1rem, 3vw, 2.5rem); max-width: 52rem; margin: 2rem auto 2.5rem; }
/* Chaque carte est éclairée par le dessus et posée sur un socle lumineux. */
.showcase__spot { position: relative; display: grid; justify-items: center; gap: 0.75rem; animation: card-in 0.5s ease-out both; animation-delay: calc(var(--i, 0) * 90ms); }
.showcase__spot::before { content: ""; position: absolute; inset: -1.5rem -12% 20%; background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--rarity) 30%, transparent), transparent 70%); pointer-events: none; }
.showcase__spot::after { content: ""; width: 92%; height: 0.625rem; border-radius: 50%; background: radial-gradient(ellipse, color-mix(in srgb, var(--rarity) 75%, transparent), transparent 70%); }
.showcase__spot .tcard { box-shadow: 0 0 1.5rem color-mix(in srgb, var(--rarity) 30%, transparent); }
.showcase__spot--empty { width: var(--card); aspect-ratio: 5 / 7; place-items: center; border: 2px dashed var(--border); border-radius: 1rem; color: var(--muted); font-size: 2rem; }
.showcase__spot--empty::before, .showcase__spot--empty::after { content: none; }
.showcase__spot[draggable="true"] { cursor: grab; }
.showcase__tools { display: flex; gap: 0.375rem; order: 1; }
.showcase__tool { width: 2.25rem; height: 2.25rem; border: 1px solid var(--border); border-radius: 50%; color: var(--text-soft); }
.showcase__tool:not(:disabled):hover { border-color: var(--accent); color: var(--text); }
.showcase__tool:disabled { opacity: 0.3; cursor: default; }
.showcase__tool:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.showcase__tag { order: 1; color: var(--warning); font-size: 0.875rem; }
.showcase__tag.is-owned { color: var(--success); }
.showcase__panel { display: grid; gap: 1rem; justify-items: center; }
.showcase__fields { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 0.75rem 1.5rem; }
.showcase__fields .booster__btn { padding: 0.5rem 1rem; }
.showcase__count { color: var(--text-soft); }
.showcase__picker { max-height: none; }
.picker__option:disabled { opacity: 0.35; cursor: default; }

@media (max-width: 768px) {
    .showcase__layout { padding: 1.5rem 1rem 3rem; }
    .showcase__shelf { --card: min(9.5rem, 41vw); gap: 1.5rem 1rem; }
}

/* ---------- Calendrier de l'Avent ---------- */

.advent { position: fixed; inset: 0; z-index: 900; overflow-x: hidden; overflow-y: auto; background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--coin) 14%, var(--background-glow)), var(--background) 62%); outline: none; animation: booster-in 0.3s ease-out; }
.advent__layout { display: flex; flex-direction: column; align-items: center; max-width: 46rem; min-height: 100%; margin: 0 auto; padding: 2.25rem 1.5rem 0; text-align: center; }
.advent__title { padding: 0 3rem; font-size: clamp(1.75rem, 5vw, 2.75rem); font-weight: 700; line-height: 1.15; text-wrap: balance; }
.advent__intro { max-width: 34rem; margin: 0.75rem auto 0; color: var(--text-soft); text-wrap: balance; }
/* 5 colonnes : 23 portes et la dernière, en double largeur */
/* Assez petite pour tenir dans la hauteur de l'écran avec le titre et le bouton, sans descendre sous 18rem */
.advent__grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); grid-auto-flow: dense; gap: clamp(0.5rem, 2vw, 1rem); width: min(100%, max(18rem, min(36rem, 100vh - 19rem))); margin: 1.75rem 0 1rem; }
.advent__door { position: relative; aspect-ratio: 1; border-radius: 0.75rem; perspective: 40rem; container-type: inline-size; }
.advent__door--last { grid-column: span 2; aspect-ratio: auto; }
.advent__door:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.advent__inside { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem; border-radius: inherit; background: radial-gradient(circle, color-mix(in srgb, var(--coin) 28%, transparent), transparent 70%), var(--background); box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--coin) 40%, transparent); }
.advent__inside .motif { width: 36%; height: 26%; color: var(--pack-motif); }
.advent__door--last .advent__inside .motif { width: 18%; }
.advent__amount { color: var(--coin); font-size: max(0.9375rem, 20cqw); line-height: 1; }
.advent__door--last .advent__amount { font-size: max(1.25rem, 12cqw); }
.advent__unit { color: var(--text-soft); font-size: max(0.625rem, 10cqw); line-height: 1; }
.advent__door--last .advent__unit { font-size: max(0.75rem, 6cqw); }
.advent__leaf {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: grid;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
    border-radius: inherit;
    background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.14), transparent 55%), linear-gradient(160deg, var(--pack-1), var(--pack-2) 60%, var(--pack-3));
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.35);
    transform-origin: left center;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transition: transform 0.8s cubic-bezier(0.3, 0.7, 0.3, 1), opacity 0.8s;
}
.advent__leaf::before { content: ""; position: absolute; inset: 7%; border: 1px dashed rgba(255, 255, 255, 0.28); border-radius: 0.5rem; }
.advent__door--last .advent__leaf { border-color: color-mix(in srgb, var(--coin) 60%, transparent); background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.2), transparent 55%), linear-gradient(160deg, color-mix(in srgb, var(--coin) 45%, var(--pack-1)), var(--pack-2) 65%, var(--pack-3)); }
.advent__number { color: var(--on-pack); font: 700 max(1.125rem, 34cqw) / 1 var(--font-heading); text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45); }
.advent__door--last .advent__number { font-size: max(1.5rem, 22cqw); }
.advent__door[data-state="locked"] { cursor: default; }
.advent__door[data-state="locked"] .advent__leaf { filter: saturate(0.35) brightness(0.65); }
.advent__door[data-state="ready"] .advent__leaf { box-shadow: 0 0 0 2px var(--coin), 0 0 1.25rem color-mix(in srgb, var(--coin) 55%, transparent); animation: advent-glow 1.6s ease-in-out infinite alternate; }
.advent__door[data-state="ready"]:hover .advent__leaf { transform: rotateY(-16deg); }
.advent__door[data-state="opened"] .advent__leaf { transform: rotateY(-104deg); opacity: 0.55; pointer-events: none; animation: none; }
.advent__door.is-opening { z-index: 2; animation: advent-pop 0.6s 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.2) both; }
/* Message et bouton restent visibles en bas, même quand la grille dépasse */
.advent__footer { position: sticky; bottom: 0; z-index: 3; display: grid; gap: 0.75rem; width: 100%; margin-top: auto; padding: 1rem 0 1.5rem; background: linear-gradient(transparent, var(--background) 35%); }
.advent__message { min-height: 1.5em; color: var(--text-soft); }

.advent-btn__badge { margin-left: 0.5rem; padding: 0 0.5rem; border-radius: 999px; background: var(--coin); color: var(--on-accent); font-size: 0.8125rem; font-weight: 700; }
.hud__advent { position: relative; display: grid; place-items: center; width: 3rem; height: 3rem; border: 1px solid color-mix(in srgb, var(--coin) 60%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--background) 92%, transparent); color: var(--coin); box-shadow: 0 0 1rem color-mix(in srgb, var(--coin) 35%, transparent); transition: transform 0.2s; }
.hud__advent:hover { transform: translateY(-2px); }
.hud__advent:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.hud__advent svg { width: 1.375rem; height: 1.375rem; }
.hud__advent .advent-btn__badge { position: absolute; top: -0.375rem; right: -0.375rem; margin: 0; }

@media (max-width: 768px) {
    .advent__layout { padding: 1.5rem 1rem 0; }
    .hud__advent { width: 2.625rem; height: 2.625rem; }
}

/* ---------- Décor de Noël (festive.js), entre les dates christmas du thème ---------- */

/* Neige derrière tout le contenu : elle ne passe que dans les espaces vides */
.snow { position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; }
.snow__flake { position: absolute; top: -1.5rem; border-radius: 50%; background: #ffffff; box-shadow: 0 0 4px rgba(255, 255, 255, 0.6); animation: snowfall linear infinite; }
.snow__flake--crystal { border-radius: 0; background: none; box-shadow: none; color: #ffffff; line-height: 1; text-shadow: 0 0 6px rgba(255, 255, 255, 0.5); animation-name: snowfall-spin; }
/* Quelques flocons devant le contenu, sous la bannière et le solde */
.snow--front { z-index: 35; }

/* Guirlande en festons, accrochée sous la bannière (positions calculées par festive.js) */
.lights { position: absolute; top: 100%; left: 0; right: 0; height: 3.25rem; overflow: clip; pointer-events: none; } /* les nœuds des bords ne débordent pas de l'écran */
.lights__wire { position: absolute; top: 0; left: 0; overflow: visible; }
.lights__wire path { fill: none; stroke: color-mix(in srgb, var(--success) 35%, #0b1a10); stroke-width: 2; stroke-linecap: round; }
.lights__knot { position: absolute; top: 0; width: 0.5rem; height: 0.5rem; border-radius: 50%; background: var(--accent-strong); box-shadow: 0 0 0 2px color-mix(in srgb, var(--success) 35%, #0b1a10); translate: -50% 0; }
.lights__bulb { position: absolute; width: 0.4375rem; height: 0.6875rem; margin-top: 0.1875rem; border-radius: 50% 50% 45% 45% / 40% 40% 60% 60%; background: var(--bulb); box-shadow: 0 0 0.625rem var(--bulb); transform-origin: 50% -0.1875rem; translate: -50% 0; animation: lights-twinkle 2.2s ease-in-out infinite alternate; animation-delay: calc(var(--i) * -0.37s); }
.lights__bulb::before { content: ""; position: absolute; top: -0.1875rem; left: 50%; width: 0.25rem; height: 0.1875rem; border-radius: 1px; background: #4b5563; translate: -50% 0; }

/* Petits tas de neige posés en bas de l'écran, sous le solde et la bannière (positions et tailles : festive.js) */
.snowbank { position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; height: 0; overflow: visible; pointer-events: none; }
.snowpile { position: absolute; bottom: 0; translate: -50% 0; filter: drop-shadow(0 -0.125rem 0.5rem rgba(255, 255, 255, 0.2)); }
.snowpile svg { display: block; width: 100%; height: 100%; }

/* Une lueur froide derrière le titre, deux flocons autour du slogan */
.is-christmas .page__hero { background: radial-gradient(ellipse 60% 70% at 50% 40%, rgba(255, 255, 255, 0.06), transparent 70%); }
.is-christmas .page__tagline::before, .is-christmas .page__tagline::after { content: "❄"; margin: 0 0.625rem; color: var(--accent); }

/* ---------- Barre de collection ---------- */

.collection { scroll-margin-top: 6rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem 2rem; margin-bottom: 2rem; padding: 1.25rem 1.5rem; border: 1px solid var(--border); border-radius: 0.75rem; background: color-mix(in srgb, var(--surface) 60%, transparent); }
.collection__main { flex: 1 1 20rem; }
.collection__label { margin-bottom: 0.5rem; font-size: 1.125rem; }
.collection__count { font-variant-numeric: tabular-nums; }
.collection__progress { appearance: none; -webkit-appearance: none; display: block; width: 100%; height: 0.5rem; border: 0; border-radius: 999px; overflow: hidden; background: var(--background); }
.collection__progress::-webkit-progress-bar { background: var(--background); }
.collection__progress::-webkit-progress-value { background: var(--accent); transition: width 0.4s; }
.collection__progress::-moz-progress-bar { background: var(--accent); }
.collection__chips { display: flex; flex-wrap: wrap; gap: 0.25rem 1rem; margin-top: 0.625rem; color: var(--text-soft); font-size: 0.875rem; font-variant-numeric: tabular-nums; }
.collection__chip::before { content: ""; display: inline-block; width: 0.625rem; height: 0.625rem; margin-right: 0.375rem; border-radius: 50%; background: var(--rarity); }

.hud { position: fixed; left: 1.5rem; bottom: 2rem; z-index: 40; display: flex; align-items: center; gap: 0.75rem; }
.hud__coins { padding: 0.75rem 1rem; border: 1px solid color-mix(in srgb, var(--coin) 45%, transparent); border-radius: 999px; background: color-mix(in srgb, var(--background) 92%, transparent); font-weight: 600; }
.hud__price { padding-left: 0.625rem; border-left: 1px solid rgba(255, 255, 255, 0.25); color: var(--pack-motif); font-variant-numeric: tabular-nums; }
.floating-booster { display: flex; align-items: center; gap: 0.625rem; padding: 0.75rem 1.25rem; border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent); border-radius: 999px; background: linear-gradient(120deg, var(--pack-1), var(--pack-3)); box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.4); color: var(--on-pack); font-weight: 500; transition: transform 0.2s; }
.floating-booster:disabled { background: var(--surface); border-color: var(--border); color: var(--muted); }
.floating-booster:disabled .hud__price { color: var(--accent); }
.floating-booster:not(:disabled):hover { transform: translateY(-2px); }
.floating-booster .motif { width: 1.75rem; height: 1.375rem; color: var(--pack-motif); }

@media (max-width: 768px) {
    .hud { left: 1rem; bottom: 1.25rem; gap: 0.5rem; font-size: 0.8125rem; }
    .hud__coins { padding: 0.625rem 0.75rem; }
    .floating-booster { gap: 0.5rem; padding: 0.625rem 0.875rem; }
    .floating-booster .motif, .floating-booster:disabled > span:nth-child(2) { display: none; } /* le compte à rebours suffit */
}

/* ---------- Animations ---------- */

@keyframes info-in { from { transform: translateX(2rem); opacity: 0; } }
@keyframes booster-in { from { opacity: 0; } }
@keyframes pack-float { 50% { transform: translateY(-0.625rem) rotate(0.6deg); } }
@keyframes pack-shake { 25% { transform: rotate(-0.8deg); } 75% { transform: rotate(0.8deg); } }
@keyframes pack-top { to { transform: translate(60%, -130%) rotate(38deg); opacity: 0; } }
@keyframes pack-bottom { 35% { transform: translateY(-3%) scale(1.03); } to { transform: translateY(55%) scale(0.92); opacity: 0; } }
@keyframes card-in { from { transform: translateY(1.5rem) scale(0.92); opacity: 0; } }
@keyframes card-shake {
    0%, 100% { transform: none; }
    20% { transform: rotate(-0.6deg); }
    35% { transform: rotate(0.9deg); }
    50% { transform: rotate(-1.4deg) scale(1.02); }
    65% { transform: rotate(1.9deg) scale(1.03); }
    80% { transform: rotate(-2.4deg) scale(1.05); }
    92% { transform: rotate(2.6deg) scale(1.06); }
}
@keyframes charge-glow { from { box-shadow: 0 0 0 transparent; } to { box-shadow: 0 0 4rem 0.5rem var(--rarity); } }
@keyframes legend-pop { 0% { transform: scale(1.06); } 35% { transform: scale(1.16); } 100% { transform: none; } }
@keyframes ring { 0% { transform: scale(0.4); opacity: 1; } 100% { transform: scale(2.2); opacity: 0; } }
@keyframes rays-in { from { opacity: 0; } to { opacity: var(--rays); } }
@keyframes motif-pulse { from { transform: scale(0.75); opacity: 0.5; } to { transform: scale(1.05); } }
@keyframes spin { to { rotate: 360deg; } }
@keyframes flash { 0% { opacity: 0.85; } 100% { opacity: 0; } }
@keyframes advent-glow { to { box-shadow: 0 0 0 2px var(--coin), 0 0 2.25rem color-mix(in srgb, var(--coin) 75%, transparent); } }
@keyframes advent-pop { 40% { transform: scale(1.12); } }
@keyframes snowfall { to { transform: translate(var(--drift), calc(100vh + 2rem)); } }
@keyframes snowfall-spin { to { transform: translate(var(--drift), calc(100vh + 2rem)) rotate(360deg); } }
@keyframes lights-twinkle { from { opacity: 0.45; box-shadow: 0 0 0.125rem var(--bulb); } to { opacity: 1; box-shadow: 0 0 0.75rem 0.125rem var(--bulb); } }

@media (prefers-reduced-motion: reduce) {
    .booster, .booster *, .booster::after, .floating-booster, .detail, .detail *, .trade, .trade *, .showcase, .showcase *, .advent, .advent *, .hud__advent, .lights__bulb { animation: none !important; transition: none !important; }
    .snow { display: none; }
    .fx { display: none; }
}
~~~~

### `engine/theme.js`

~~~~js
// Charge un thème, vérifie qu'il est complet et complète ce qu'il ne précise pas. Voir themes/cosmos/theme.js pour un exemple.
import { isDay, parseDay } from './calendar.js';
import { MOTIFS } from './motif.js';

const EFFECTS = ['none', 'glow', 'burst', 'legend'];
const DEFAULT_BOOSTER = { size: 5, guaranteed: null, mixTypes: true, openOnFirstVisit: true, allowRevealAll: false };
const DEFAULT_ECONOMY = { startCoins: 0, boosterPrice: 100, freeBooster: { start: 2, every: 10, max: 3 } };
const DEFAULT_SHOWCASE = { size: 6 };
const DEFAULT_TRADE = { allowLastCopy: true, server: null };

/** Erreur à montrer à l'auteur du thème. */
export class ThemeError extends Error {}

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isLabel = (value) => typeof value === 'string' && value.trim() !== '';
const isAmount = (value) => Number.isInteger(value) && value >= 0;
const isPositive = (value) => Number.isFinite(value) && value > 0;

/** Renvoie la liste des problèmes d'un thème (vide s'il est bon). */
export function checkTheme(theme) {
    const errors = [];
    const need = (ok, message) => { if (!ok) errors.push(message); };
    if (!isObject(theme)) return ['theme.js doit exporter un objet par défaut'];

    need(/^[a-z0-9-]+$/.test(theme.id ?? ''), 'id : lettres minuscules, chiffres et tirets attendus');
    need(isLabel(theme.name), 'name : nom du jeu attendu');
    need(theme.motif === undefined || Object.hasOwn(MOTIFS, theme.motif) || String(theme.motif).trim().startsWith('<svg'), `motif : ${Object.keys(MOTIFS).join(', ')} ou un dessin <svg> attendu`);

    const checkList = (name, list, check) => {
        if (!Array.isArray(list) || !list.length) {
            errors.push(`${name} : liste non vide attendue`);
            return new Set();
        }
        const ids = new Set();
        list.forEach((item, i) => {
            const at = `${name}[${i}]${item?.id ? ` (${item.id})` : ''}`;
            if (typeof item?.id !== 'string' || item.id === '') errors.push(`${at}.id : texte attendu`);
            else if (ids.has(item.id)) errors.push(`${at}.id : déjà utilisé`);
            else ids.add(item.id);
            check(item ?? {}, at);
        });
        return ids;
    };

    const rarityIds = checkList('rarities', theme.rarities, (rarity, at) => {
        need(isLabel(rarity.label), `${at}.label : texte attendu`);
        need(isPositive(rarity.weight), `${at}.weight : nombre positif attendu`);
        need(typeof rarity.color === 'string', `${at}.color : couleur attendue`);
        need(EFFECTS.includes(rarity.effect), `${at}.effect : ${EFFECTS.join(', ')} attendu`);
        need(isAmount(rarity.sell), `${at}.sell : prix de revente attendu`);
        need(isAmount(rarity.reward), `${at}.reward : prime de découverte attendue`);
    });
    const typeIds = checkList('types', theme.types, (type, at) => need(isLabel(type.label), `${at}.label : texte attendu`));
    const albumIds = checkList('albums', theme.albums, (album, at) => need(isLabel(album.label), `${at}.label : texte attendu`));
    const tagIds = !theme.tags?.length ? new Set() : checkList('tags', theme.tags, (tag, at) => need(isLabel(tag.label), `${at}.label : texte attendu`));

    checkList('cards', theme.cards, (card, at) => {
        need(isLabel(card.name), `${at}.name : texte attendu`);
        need(rarityIds.has(card.rarity), `${at}.rarity : « ${card.rarity} » n'est pas dans rarities`);
        need(typeIds.has(card.type), `${at}.type : « ${card.type} » n'est pas dans types`);
        need(albumIds.has(card.album), `${at}.album : « ${card.album} » n'est pas dans albums`);
        for (const tag of card.tags ?? []) need(tagIds.has(tag), `${at}.tags : « ${tag} » n'est pas dans tags`);
        need(card.embed === undefined || typeof card.embed?.src === 'string', `${at}.embed.src : adresse attendue`);
    });

    const booster = { ...DEFAULT_BOOSTER, ...theme.booster };
    need(Number.isInteger(booster.size) && booster.size > 0, 'booster.size : nombre de cartes attendu');
    need(booster.guaranteed === null || rarityIds.has(booster.guaranteed), `booster.guaranteed : « ${booster.guaranteed} » n'est pas dans rarities`);
    const economy = { ...DEFAULT_ECONOMY, ...theme.economy };
    need(isAmount(economy.startCoins), 'economy.startCoins : nombre attendu');
    need(isAmount(economy.boosterPrice), 'economy.boosterPrice : nombre attendu');
    const showcase = { ...DEFAULT_SHOWCASE, ...theme.showcase };
    need(Number.isInteger(showcase.size) && showcase.size > 0, 'showcase.size : nombre de cartes attendu');
    const free = { ...DEFAULT_ECONOMY.freeBooster, ...economy.freeBooster };
    need(isAmount(free.start) && isPositive(free.every) && isAmount(free.max), 'economy.freeBooster : start, every et max attendus');

    // Calendrier de l'Avent, facultatif : { start: 'AAAA-MM-JJ', end: 'AAAA-MM-JJ', boosters: [boosters de chaque case] }
    const { advent } = theme;
    if (advent !== undefined && advent !== null) {
        const isList = Array.isArray(advent.boosters) && advent.boosters.length > 0;
        need(isList && advent.boosters.every((count) => Number.isInteger(count) && count > 0), 'advent.boosters : un nombre entier positif par case attendu');
        need(isDay(advent.start), 'advent.start : date AAAA-MM-JJ attendue');
        need(isDay(advent.end), 'advent.end : date AAAA-MM-JJ attendue');
        if (isList && isDay(advent.start) && isDay(advent.end)) {
            const start = parseDay(advent.start);
            const last = new Date(start.getFullYear(), start.getMonth(), start.getDate() + advent.boosters.length - 1);
            need(parseDay(advent.end) >= last, 'advent.end : doit être le jour de la dernière case ou après');
        }
    }

    // Décor de Noël, facultatif : { from: 'AAAA-MM-JJ', to: 'AAAA-MM-JJ' }
    const { christmas } = theme;
    if (christmas !== undefined && christmas !== null) {
        need(isDay(christmas.from) && isDay(christmas.to) && parseDay(christmas.from) <= parseDay(christmas.to), 'christmas : { from, to } en dates AAAA-MM-JJ attendu, from avant to');
    }
    return errors;
}

/** Charge themes/<name>/theme.js. Les images y sont données par rapport à ce dossier. */
export async function loadTheme(name) {
    if (!/^[a-z0-9-]+$/.test(name)) throw new ThemeError(`Nom de thème invalide : ${name}`);
    const url = new URL(`../themes/${name}/theme.js`, import.meta.url);
    let theme;
    try {
        ({ default: theme } = await import(url.href));
    } catch (cause) {
        throw new ThemeError(`themes/${name}/theme.js ne peut pas être lu : ${cause.message}`, { cause });
    }
    const errors = checkTheme(theme);
    if (errors.length) throw new ThemeError(`themes/${name}/theme.js est incomplet :\n${errors.map((error) => `• ${error}`).join('\n')}`);

    const asset = (path) => (path ? new URL(path, url).href : null);
    const rarities = theme.rarities.map((rarity, level) => ({ charge: 0, particles: 0, ...rarity, level }));
    const economy = { ...DEFAULT_ECONOMY, ...theme.economy };
    return {
        language: 'fr',
        tags: [],
        nav: [],
        texts: {},
        colors: {},
        fonts: {},
        pack: {},
        motif: 'star',
        advent: null,
        christmas: null,
        ...theme,
        logo: asset(theme.logo),
        rarities,
        booster: { ...DEFAULT_BOOSTER, ...theme.booster },
        economy: { ...economy, freeBooster: { ...DEFAULT_ECONOMY.freeBooster, ...economy.freeBooster } },
        trade: { ...DEFAULT_TRADE, ...theme.trade },
        showcase: { ...DEFAULT_SHOWCASE, ...theme.showcase },
        cards: theme.cards.map((card) => ({
            tags: [],
            ...card,
            image: asset(card.image),
            background: asset(card.background),
            rarity: rarities.find((rarity) => rarity.id === card.rarity),
        })),
    };
}

/** Contenu d'une carte, avec une valeur pour tout ce qu'elle ne précise pas. */
export function describe(card) {
    const { name, subtitle = '', text = '', long = text, image, fit, background, embed = null, links = [], stats = [] } = card;
    return { name, subtitle, text, long, image, fit, background: background ?? (fit === 'contain' ? null : image), embed, links, stats };
}

const toVariable = (name) => `--${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/(\D)(\d)/, '$1-$2')}`;

/** Couleurs et polices du thème : colors.backgroundGlow devient la variable CSS --background-glow. */
export function applyStyle({ colors, fonts }) {
    const { style } = document.documentElement;
    for (const [name, value] of Object.entries(colors)) style.setProperty(toVariable(name), value);
    if (fonts.body) style.setProperty('--font-body', fonts.body);
    if (fonts.heading) style.setProperty('--font-heading', fonts.heading);
    if (fonts.url) document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href: fonts.url }));
}
~~~~

### `engine/trade-view.js`

~~~~js
// Fenêtre d'échange en direct : le salon où l'on invite ou rejoint un ami, puis la table où chacun pose une carte.
import { actionButton, burst, coins, createCard, el, reducedMotion, setText, text } from './card.js';
import { createModal } from './modal.js';
import { motif } from './motif.js';
import { NAME_LENGTH } from './player.js';
import { cleanCode, CODE_LENGTH, createRoom, joinRoom, qrCode, RoomError } from './room.js';
import { pageLink, shareButton } from './share.js';
import { t } from './strings.js';
import { TradeSession } from './trade.js';

const COIN_STEP = 10; // pièces ajoutées ou retirées par les boutons − et +
const SWAP = 700; // durée du croisement des deux cartes, en millisecondes
const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

export function createTradeView({ player, describe, onChange }) {
    const { cards } = player;
    const { gameId, trade: { server } } = player.rules;
    const closeButton = el('button', 'detail__close', { type: 'button', textContent: '×' });
    const title = text('h2', 'trade__title', 'trade_title');
    title.id = 'trade-title';
    const body = el('div', 'trade__body');
    const overlay = el('div', 'trade', {}, el('div', 'trade__layout', {}, title, body), closeButton);
    overlay.setAttribute('aria-labelledby', 'trade-title');
    const modal = createModal(overlay, close);

    let visit = 0; // change à chaque écran : une réponse réseau en retard ne touche plus l'affichage
    let hangUp = () => {}; // coupe la liaison en cours
    let session = null;
    let table = null; // table affichée
    let firstCard = null; // carte à poser dès l'arrivée à la table

    const face = (card) => {
        const node = createCard('div', card, describe(card), cards.indexOf(card) + 1, cards.length);
        node.classList.add('is-flipped');
        return node;
    };
    /** Tas de pièces, à la place d'une carte. */
    function coinPile(total) {
        return el('div', 'coin-pile', {}, el('span', 'coins coins--icon'), el('span', 'coin-pile__amount', { textContent: total }), text('span', 'sr-only', 'coins_name'));
    }

    const message = (key, className = '') => text('p', `trade__message ${className}`, key);

    function setScreen(name, ...content) {
        visit++;
        overlay.dataset.screen = name;
        overlay.scrollTop = 0;
        body.replaceChildren(...content);
        return visit;
    }

    function leave() {
        session?.leave();
        session = table = null;
        hangUp();
        hangUp = () => {};
    }

    // --- 1. Le salon ---

    function showLobby(errorKey = '') {
        leave();
        const name = el('input', 'trade__input', { type: 'text', value: player.name, maxLength: NAME_LENGTH, autocomplete: 'nickname' });
        name.addEventListener('change', () => player.setName(name.value));
        const label = el('label', 'trade__name', {}, text('span', '', 'trade_name'), name);

        const code = el('input', 'trade__input trade__input--code', {
            type: 'text', maxLength: CODE_LENGTH, autocomplete: 'off', spellcheck: false, placeholder: '•'.repeat(CODE_LENGTH),
        });
        code.setAttribute('aria-label', t('trade_code'));
        const join = actionButton('trade_join', 'booster__btn', () => showJoining(code.value));
        join.type = 'submit';
        join.disabled = true;
        code.addEventListener('input', () => {
            code.value = cleanCode(code.value);
            join.disabled = code.value.length < CODE_LENGTH;
        });
        const form = el('form', 'trade__form', {}, code, join);
        form.addEventListener('submit', (event) => event.preventDefault()); // Entrée déclenche le bouton

        setScreen('lobby',
            message('trade_intro'),
            ...(errorKey ? [message(errorKey, 'is-error')] : []),
            label,
            el('div', 'trade__columns', {},
                el('section', 'trade__panel', {},
                    text('h3', 'trade__heading', 'trade_invite'),
                    message('trade_invite_text'),
                    actionButton('trade_invite_button', 'booster__btn booster__btn--main', showHosting)),
                el('section', 'trade__panel', {},
                    text('h3', 'trade__heading', 'trade_join_title'),
                    message('trade_join_text'),
                    form)));
    }

    const waiting = (key) => el('p', 'trade__waiting', {}, motif(), text('span', '', key));

    async function showHosting() {
        leave();
        const content = el('div', 'trade__host', {}, waiting('trade_preparing'));
        const current = setScreen('wait', content, actionButton('trade_cancel', 'booster__link', () => showLobby()));
        let room;
        try {
            room = await createRoom({
                gameId,
                server,
                onGuest: (channel) => startSession(channel, true),
                onError: (key) => { if (current === visit) showLobby(key); },
            });
        } catch (error) {
            if (current === visit) showLobby(roomError(error));
            return;
        }
        if (current !== visit) { // annulé pendant la préparation
            room.close();
            return;
        }
        hangUp = room.close;

        const link = pageLink(`room=${room.code}`);
        const qr = el('div', 'trade__qr');
        content.replaceChildren(
            message('trade_share_text'),
            el('div', 'trade__invite', {}, qr, el('div', '', {},
                text('p', 'trade__label', 'trade_code'),
                el('p', 'trade__roomcode', { textContent: room.code }),
                shareButton(() => link, { share: 'trade_share', copy: 'trade_copy', message: 'trade_share_message' }))),
            waiting('trade_waiting'));
        qr.innerHTML = await qrCode(link) ?? '';
        qr.hidden = !qr.innerHTML;
    }

    async function showJoining(input) {
        leave();
        const code = cleanCode(input);
        if (code.length < CODE_LENGTH) {
            showLobby('room_error_missing');
            return;
        }
        const current = setScreen('wait', el('div', 'trade__host', {}, waiting('trade_joining')), actionButton('trade_cancel', 'booster__link', () => showLobby()));
        const joining = joinRoom({ gameId, server, code });
        hangUp = joining.cancel;
        try {
            const channel = await joining.ready;
            if (current === visit && channel) startSession(channel, false);
            else channel?.close();
        } catch (error) {
            if (current === visit) showLobby(roomError(error));
        }
    }

    function roomError(error) {
        if (!(error instanceof RoomError)) console.error(error);
        return error instanceof RoomError ? error.key : 'room_error_network';
    }

    // --- 2. La table ---

    function startSession(channel, isHost) {
        hangUp = () => channel.close();
        const created = new TradeSession({
            player,
            channel,
            isHost,
            events: {
                onUpdate() {
                    if (session !== created || !created.isOpen) return;
                    if (!table) {
                        table = createTable(created);
                        if (firstCard) created.select(firstCard);
                        firstCard = null;
                    }
                    table.render();
                },
                onRequest: (card) => table?.request(card),
                onNotice: (key) => table?.notice(key),
                onDone: (result) => table?.finish(result),
                onEnd(key) {
                    if (session !== created) return;
                    session = null;
                    if (table?.isShowingResult) table.lost(); // on laisse voir la carte reçue
                    else showLobby(key);
                },
            },
        });
        session = created;
    }

    function createTable(trade) {
        const partner = () => trade.theirs.name || t('trade_partner');
        const requested = new Set(); // cartes que l'autre demande
        const asked = new Set(); // cartes qu'on lui demande
        let isBusy = false; // croisement des cartes ou résultat à l'écran

        const slots = { mine: slot('trade_you'), theirs: slot('') };

        // Pièces : un montant à régler de mon côté, un simple affichage de l'autre.
        const amount = el('input', 'swap__amount', { type: 'number', min: 0, step: 1, inputMode: 'numeric' });
        amount.setAttribute('aria-label', t('trade_coins'));
        const setCoins = (value) => trade.setCoins(value);
        amount.addEventListener('input', () => setCoins(amount.valueAsNumber));
        amount.addEventListener('blur', () => { amount.value = trade.mine.coins; });
        const step = (delta, sign) => {
            const button = el('button', 'swap__step', { type: 'button', textContent: sign });
            button.setAttribute('aria-label', `${sign}${COIN_STEP} ${t('coins_name').trim()}`);
            button.addEventListener('click', () => {
                setCoins(trade.mine.coins + delta);
                amount.value = trade.mine.coins;
            });
            return button;
        };
        const less = step(-COIN_STEP, '−');
        const more = step(COIN_STEP, '+');
        slots.mine.node.append(el('div', 'swap__coins', {}, less, el('span', 'coins coins--icon'), amount, more));
        const theirCoins = el('div', 'swap__coins');
        slots.theirs.node.append(theirCoins);

        slots.theirs.label.textContent = partner();
        const status = el('p', 'swap__status');
        status.setAttribute('aria-live', 'polite');
        const ready = actionButton('trade_ready', 'booster__btn booster__btn--main', () => trade.setReady(!trade.mine.ready));
        const myCards = el('div', 'picker');
        const theirCards = el('div', 'picker');
        const theirTitle = el('h3', 'trade__label');
        const screen = setScreen('table',
            el('div', 'swap', {}, slots.mine.node, el('div', 'swap__middle', {}, el('span', 'swap__arrows', { textContent: '⇄' }), ready), slots.theirs.node),
            status,
            el('div', 'trade__columns', {},
                el('section', 'trade__panel', {}, text('h3', 'trade__label', 'trade_my_cards'), myCards),
                el('section', 'trade__panel', {}, theirTitle, theirCards)),
            actionButton('trade_leave', 'booster__link', () => showLobby()));

        function slot(labelKey) {
            const label = labelKey ? text('p', 'swap__name', labelKey) : el('p', 'swap__name');
            const place = el('div', 'swap__place');
            const node = el('div', 'swap__slot', {}, label, place);
            return { node, label, place, shown: '' };
        }

        function fillSlot(target, { card, coins: amountGiven, ready: isReady }, emptyKey) {
            target.node.classList.toggle('is-ready', isReady);
            const shown = card?.id ?? (amountGiven > 0 ? 'coins' : 'empty');
            if (target.shown !== shown) {
                target.shown = shown;
                if (card) target.place.replaceChildren(face(card));
                else if (amountGiven > 0) target.place.replaceChildren(coinPile(amountGiven));
                else target.place.replaceChildren(el('div', 'swap__empty', {}, motif(), text('span', '', emptyKey)));
            } else if (shown === 'coins') target.place.querySelector('.coin-pile__amount').textContent = amountGiven;
        }

        /** Grille de cartes ; n'est refaite que si la liste change, pour ne pas perdre le défilement ni le focus. */
        function fillPicker(grid, list, { state, onPick, badge, emptyKey }) {
            const key = list.map((card) => `${card.id}${badge(card)}${player.has(card)}`).join();
            if (grid.dataset.key !== key) {
                grid.dataset.key = key;
                grid.replaceChildren(...list.map((card) => {
                    const isHidden = !player.has(card); // jamais découverte : elle reste face cachée
                    const number = `${cards.indexOf(card) + 1}/${cards.length}`;
                    const content = isHidden ? el('span', 'picker__hidden', {}, '?', el('small', '', { textContent: number })) : face(card);
                    const option = el('button', 'picker__option', { type: 'button' }, content, text('span', 'picker__flag', 'trade_requested'));
                    option.style.setProperty('--rarity', card.rarity.color);
                    option.setAttribute('aria-label', isHidden ? `${t('cards_hidden')} ${number}` : describe(card).name);
                    option.dataset.id = card.id;
                    if (badge(card)) option.append(el('span', 'count-tag', { textContent: badge(card) }));
                    option.addEventListener('click', () => onPick(card));
                    return option;
                }));
                if (!list.length) grid.append(message(emptyKey));
            }
            for (const option of grid.querySelectorAll('.picker__option')) {
                const { pressed, flagged } = state(player.find(option.dataset.id));
                option.setAttribute('aria-pressed', pressed);
                option.classList.toggle('is-requested', flagged);
            }
        }

        function statusKey() {
            if (trade.isCommitting) return 'trade_status_going';
            const { mine, theirs } = trade;
            if (!mine.card && !mine.coins) return 'trade_status_pick';
            if (!theirs.card && !theirs.coins) return 'trade_status_wait_card';
            if (!trade.canAgree) return 'trade_status_need_card';
            if (trade.mine.ready) return 'trade_status_wait_ready';
            return trade.theirs.ready ? 'trade_status_their_ready' : 'trade_status_confirm';
        }

        function render() {
            if (isBusy || screen !== visit) return;
            const { mine, theirs } = trade;
            slots.theirs.label.textContent = partner();
            theirTitle.textContent = `${t('trade_their_cards')} ${partner()}`;
            fillSlot(slots.mine, mine, 'trade_slot_mine');
            fillSlot(slots.theirs, theirs, 'trade_slot_theirs');
            if (document.activeElement !== amount) amount.value = mine.coins;
            amount.max = player.coins;
            less.disabled = trade.isCommitting || mine.coins === 0;
            more.disabled = trade.isCommitting || mine.coins >= player.coins;
            amount.disabled = trade.isCommitting || player.coins === 0;
            theirCoins.replaceChildren(...(theirs.coins > 0 ? [coins(theirs.coins, '+')] : []));
            fillPicker(myCards, cards.filter((card) => player.canTrade(card)), {
                emptyKey: 'trade_no_card',
                badge: (card) => (player.count(card) > 1 ? `×${player.count(card)}` : ''),
                state: (card) => ({ pressed: card === mine.card, flagged: requested.has(card) }),
                onPick: (card) => trade.select(card === trade.mine.card ? null : card),
            });
            fillPicker(theirCards, theirs.cards, {
                emptyKey: 'trade_their_empty',
                badge: () => '',
                state: (card) => ({ pressed: card === theirs.card, flagged: asked.has(card) }),
                onPick(card) {
                    asked.add(card);
                    trade.request(card);
                    render();
                },
            });

            ready.disabled = trade.isCommitting || !trade.canAgree;
            setText(ready.firstChild, mine.ready ? 'trade_unready' : 'trade_ready');
            ready.classList.toggle('is-on', mine.ready);
            const isLastCopy = mine.card && player.count(mine.card) === 1 && !mine.ready;
            status.replaceChildren(text('span', '', statusKey()), ...(isLastCopy ? [text('span', 'swap__warning', 'trade_last_copy')] : []));
        }

        const self = {
            render,
            isShowingResult: false,
            request(card) {
                requested.add(card);
                render();
                const option = myCards.querySelector(`[data-id="${CSS.escape(card.id)}"]`);
                if (option) myCards.scrollTop = option.offsetTop - 10; // montre la carte demandée
            },
            notice(key) {
                if (!isBusy) status.replaceChildren(text('span', 'swap__warning', key));
            },
            async finish({ given, received, result }) {
                isBusy = true;
                self.isShowingResult = true;
                requested.delete(given.card);
                asked.delete(received.card);
                onChange(result ? [result] : []);
                // L'invité conclut parfois avant que son dernier clic soit affiché.
                fillSlot(slots.mine, { ...given, ready: true }, '');
                fillSlot(slots.theirs, { ...received, ready: true }, '');
                await swapCards();
                if (screen === visit) showResult(received, result);
            },
            lost() {
                const again = body.querySelector('[data-again]');
                if (again) again.replaceWith(message('room_error_left'));
                self.isLost = true;
            },
        };

        async function swapCards() {
            if (reducedMotion()) return;
            const from = slots.mine.place.getBoundingClientRect();
            const to = slots.theirs.place.getBoundingClientRect();
            const x = to.left - from.left;
            const y = to.top - from.top;
            const fly = (node, dx, dy, lift) => node.animate(
                [{ transform: 'none' }, { transform: `translate(${dx / 2}px, ${dy / 2 + lift}px) scale(1.08)` }, { transform: `translate(${dx}px, ${dy}px)` }],
                { duration: SWAP, easing: 'cubic-bezier(0.5, 0, 0.2, 1)', fill: 'forwards' },
            );
            fly(slots.mine.place.firstChild, x, y, -40);
            fly(slots.theirs.place.firstChild, -x, -y, 40);
            await wait(SWAP + 100);
        }

        /** received : l'offre reçue ; result : { isNew, reward } si elle contient une carte. */
        function showResult({ card, coins: earned }, result) {
            const effect = card?.rarity ?? { color: getComputedStyle(overlay).getPropertyValue('--coin'), effect: 'glow', particles: 0 };
            const fx = el('div', 'fx', {}, el('span', 'fx__rays'), el('span', 'fx__ring'));
            fx.dataset.effect = effect.effect;
            fx.style.setProperty('--rarity', effect.color);
            const stage = el('div', 'trade__result', {}, fx, card ? face(card) : coinPile(earned));
            const tags = el('div', 'booster__actions');
            if (result) {
                const tag = el('p', `status-tag${result.isNew ? ' is-new' : ''}`, {}, text('span', '', result.isNew ? 'cards_new' : 'cards_double'));
                if (result.reward) tag.append(' ', coins(result.reward, '+'));
                tags.append(tag);
            }
            if (card && earned) tags.append(el('p', 'status-tag', {}, text('span', '', 'trade_coins_got'), ' ', coins(earned, '+')));
            const again = actionButton('trade_again', 'booster__btn booster__btn--main', () => {
                // Retour à la table avec le même joueur.
                table = createTable(trade);
                table.render();
            });
            again.dataset.again = '';
            setScreen('result',
                text('p', 'trade__heading', 'trade_success'),
                stage,
                tags,
                el('div', 'booster__actions', {}, again, actionButton('cards_see_collection', 'booster__btn', close)));
            fx.classList.add('is-active');
            burst(stage, { ...effect, particles: Math.max(effect.particles, 16) });
            if (self.isLost) self.lost();
            overlay.focus({ preventScroll: true });
        }

        return self;
    }

    // --- Ouverture et fermeture ---

    function open({ give = null, code = '' } = {}) {
        if (!overlay.hidden) return;
        firstCard = give;
        closeButton.setAttribute('aria-label', t('cards_close'));
        player.save(); // garde l'identifiant du joueur
        modal.open();
        if (code) showJoining(code);
        else showLobby();
        closeButton.focus({ preventScroll: true });
    }

    function close() {
        if (overlay.hidden) return;
        leave();
        setScreen('closed');
        modal.close();
    }

    closeButton.addEventListener('click', close);
    return { open, refresh: () => session?.refresh() };
}
~~~~

### `engine/trade.js`

~~~~js
// Déroulement d'un échange entre deux joueurs reliés par un canal (voir room.js). Aucun affichage ici.
//
// Chacun pose une offre (une carte, des pièces ou les deux), puis se déclare prêt. Quand les deux le sont, l'hôte lance
// l'échange (commit), l'invité l'applique et le confirme (done), puis l'hôte l'applique à son tour. Changer son offre
// annule les deux « prêt ».
//
// Les joueurs ne passent par aucun serveur : rien n'empêche l'un d'eux de tricher sur ce qu'il possède.
import { NAME_LENGTH } from './player.js';

const VERSION = 2; // à augmenter quand les messages changent : deux versions différentes ne peuvent pas échanger
const COMMIT_TIMEOUT = 8000;
const MAX_COINS = 1_000_000;

function newId() {
    return [...crypto.getRandomValues(new Uint8Array(9))].map((byte) => byte.toString(36).padStart(2, '0')).join('');
}

const isCoins = (value) => Number.isInteger(value) && value >= 0 && value <= MAX_COINS;

/** Offre telle qu'elle est envoyée : { card: id ou null, coins }. */
const pack = ({ card, coins }) => ({ card: card?.id ?? null, coins });

const isSame = (message, offer) => message?.card === (offer.card?.id ?? null) && message?.coins === offer.coins;

export class TradeSession {
    #channel;
    #player;
    #isHost;
    #events;
    #pending = null; // échange lancé par l'hôte : { id, mine, theirs, timer }, où mine et theirs sont des offres
    #isOver = false;

    /**
     * events : onUpdate() à chaque changement, onRequest(card) quand l'autre demande une carte,
     * onDone({ given, received, result }) après un échange (deux offres, et le résultat de player.trade), onNotice(key) pour un incident sans gravité, onEnd(key) quand tout s'arrête.
     */
    constructor({ player, channel, isHost, events }) {
        this.#player = player;
        this.#channel = channel;
        this.#isHost = isHost;
        this.#events = events;
        this.mine = { card: null, coins: 0, ready: false };
        this.theirs = { card: null, coins: 0, ready: false, name: '', cards: null }; // cards : ce que l'autre peut échanger
        channel.onMessage = (message) => this.#receive(message);
        channel.onClose = () => this.#end('room_error_left');
        channel.send({
            type: 'hello',
            version: VERSION,
            game: player.rules.gameId,
            player: player.id,
            name: player.name,
            cards: this.#tradable,
        });
    }

    /** Vrai quand l'autre joueur s'est présenté. */
    get isOpen() {
        return this.theirs.cards !== null;
    }

    get isCommitting() {
        return this.#pending !== null;
    }

    /** Chacun doit donner quelque chose, et il faut au moins une carte sur la table. */
    get canAgree() {
        const gives = ({ card, coins }) => card !== null || coins > 0;
        return gives(this.mine) && gives(this.theirs) && (this.mine.card !== null || this.theirs.card !== null);
    }

    get #canGive() {
        const { card, coins } = this.mine;
        return (card === null || this.#player.canTrade(card)) && coins <= this.#player.coins;
    }

    get #tradable() {
        return this.#player.cards.filter((card) => this.#player.canTrade(card)).map((card) => card.id);
    }

    // --- Actions du joueur ---

    select(card) {
        if (card && !this.#player.canTrade(card)) return;
        this.#offer({ card, coins: this.mine.coins });
    }

    setCoins(amount) {
        const coins = Math.min(Math.max(Math.trunc(amount) || 0, 0), this.#player.coins, MAX_COINS);
        if (coins !== this.mine.coins) this.#offer({ card: this.mine.card, coins });
    }

    #offer({ card, coins }) {
        if (this.isCommitting) return;
        this.mine = { card, coins, ready: false };
        this.theirs.ready = false;
        this.#channel.send({ type: 'offer', ...pack(this.mine) });
        this.#events.onUpdate();
    }

    /** Demande à l'autre joueur de poser une de ses cartes. */
    request(card) {
        this.#channel.send({ type: 'request', card: card.id });
    }

    setReady(ready) {
        if (this.isCommitting || (ready && !this.canAgree)) return;
        this.mine.ready = ready;
        // Les deux offres sont rappelées : l'accord ne vaut que pour cet échange précis.
        this.#channel.send({ type: 'ready', ready, give: pack(this.mine), get: pack(this.theirs) });
        this.#tryCommit();
        this.#events.onUpdate();
    }

    /** La collection a changé (vente dans un autre onglet…). */
    refresh() {
        if (!this.#canGive) this.#offer({ card: null, coins: 0 });
        this.#channel.send({ type: 'cards', cards: this.#tradable });
    }

    leave() {
        this.#isOver = true;
        clearTimeout(this.#pending?.timer);
        this.#channel.close();
    }

    // --- Messages de l'autre joueur ---

    #receive(message) {
        if (this.#isOver) return;
        const { type } = message;
        if (type === 'full') this.#end('room_error_full');
        else if (type === 'hello') this.#welcome(message);
        else if (!this.isOpen) return; // pas encore présenté
        else if (type === 'cards') this.#setCards(message.cards);
        else if (type === 'offer') this.#theirOffer(message);
        else if (type === 'request') this.#theirRequest(message.card);
        else if (type === 'ready') this.#theirReady(message);
        else if (type === 'commit') this.#applyCommit(message);
        else if (type === 'done') this.#finish(message.id);
        else if (type === 'abort') this.#abort();
        else return;
        if (!this.#isOver) this.#events.onUpdate();
    }

    #welcome({ version, game, player, name, cards }) {
        if (version !== VERSION) this.#end('room_error_version');
        else if (game !== this.#player.rules.gameId) this.#end('room_error_game');
        else if (player === this.#player.id) this.#end('room_error_self');
        else {
            this.theirs.name = String(name ?? '').slice(0, NAME_LENGTH);
            this.#setCards(cards);
        }
    }

    #setCards(ids) {
        this.theirs.cards = Array.isArray(ids) ? this.#player.cards.filter((card) => ids.includes(card.id)) : [];
    }

    #theirOffer({ card, coins }) {
        if (this.isCommitting) return;
        this.theirs.card = this.#player.find(card) ?? null;
        this.theirs.coins = isCoins(coins) ? coins : 0;
        this.theirs.ready = false;
        this.mine.ready = false;
    }

    #theirRequest(id) {
        const card = this.#player.find(id);
        if (card && this.#player.canTrade(card)) this.#events.onRequest(card);
    }

    #theirReady({ ready, give, get }) {
        if (this.isCommitting) return;
        this.theirs.ready = ready === true && this.canAgree && isSame(give, this.theirs) && isSame(get, this.mine);
        this.#tryCommit();
    }

    // --- Échange ---

    #tryCommit() {
        if (!this.#isHost || this.isCommitting || !this.mine.ready || !this.theirs.ready) return;
        if (!this.#canGive) {
            this.#offer({ card: null, coins: 0 });
            return;
        }
        const mine = { card: this.mine.card, coins: this.mine.coins };
        const theirs = { card: this.theirs.card, coins: this.theirs.coins };
        const id = newId();
        const timer = setTimeout(() => this.#end('room_error_left'), COMMIT_TIMEOUT);
        this.#pending = { id, mine, theirs, timer };
        this.#channel.send({ type: 'commit', id, give: pack(mine), get: pack(theirs) });
    }

    /** Côté invité. */
    #applyCommit({ id, give, get }) {
        const { mine, theirs } = this;
        const isAgreed = !this.#isHost && mine.ready && this.canAgree && isSame(give, theirs) && isSame(get, mine) && this.#canGive;
        if (!isAgreed) {
            this.#channel.send({ type: 'abort' });
            this.#abort();
            return;
        }
        this.#channel.send({ type: 'done', id });
        this.#swap({ card: mine.card, coins: mine.coins }, { card: theirs.card, coins: theirs.coins });
    }

    /** Côté hôte. */
    #finish(id) {
        if (!this.#pending || this.#pending.id !== id) return;
        const { mine, theirs, timer } = this.#pending;
        clearTimeout(timer);
        this.#pending = null;
        this.#swap(mine, theirs);
    }

    #swap(given, received) {
        const result = this.#player.trade(given, received);
        this.mine = { card: null, coins: 0, ready: false };
        Object.assign(this.theirs, { card: null, coins: 0, ready: false });
        this.#events.onDone({ given, received, result });
        this.refresh();
    }

    #abort() {
        clearTimeout(this.#pending?.timer);
        this.#pending = null;
        this.mine.ready = false;
        this.theirs.ready = false;
        this.#events.onNotice('trade_aborted');
    }

    #end(key) {
        if (this.#isOver) return;
        this.leave();
        this.#events.onEnd(key);
    }
}
~~~~

### `themes/starter/theme.js`

~~~~js
// Thème de départ, sans image : à copier pour créer un jeu. themes/cosmos/theme.js est un exemple complet.

export default {
    // Identité
    id: 'starter', // nom de la sauvegarde : ne plus le changer une fois le jeu en ligne
    name: 'Mon TCG',
    title: 'Mon TCG', // grand titre ; name par défaut
    tagline: 'Une phrase qui donne envie de collectionner.',
    footer: 'Mentions et crédits',
    language: 'fr',
    logo: null, // image du haut de page ; le motif par défaut
    nav: [], // liens du haut de page : { label, url }

    // Apparence
    motif: 'star', // wave, orbit, star, shield, leaf, flame, ou un dessin '<svg …>' en currentColor
    pack: { top: 'Édition 1', label: 'MON TCG' }, // petit et grand texte du booster
    colors: {}, // voir tools/palette.mjs ; les couleurs absentes gardent leur valeur de engine/style.css
    fonts: {}, // url (feuille de style de polices), body, heading

    // Raretés, de la plus courante à la plus rare
    rarities: [
        { id: 'common', label: 'Commune', weight: 60, color: '#94a3b8', effect: 'none', charge: 0, particles: 0, sell: 5, reward: 5 },
        { id: 'rare', label: 'Rare', weight: 27, color: '#38bdf8', effect: 'glow', charge: 250, particles: 12, sell: 12, reward: 10 },
        { id: 'ultra', label: 'Ultra rare', weight: 10, color: '#c084fc', effect: 'burst', charge: 700, particles: 28, sell: 30, reward: 25 },
        { id: 'legendary', label: 'Légendaire', weight: 3, color: '#fbbf24', effect: 'legend', charge: 1300, particles: 60, sell: 75, reward: 60 },
    ],
    types: [
        { id: 'character', label: 'Personnage' },
        { id: 'place', label: 'Lieu' },
    ],
    albums: [
        { id: 'one', label: 'Premier album' },
        { id: 'two', label: 'Deuxième album' },
    ],
    tags: [], // filtres facultatifs : { id, label }

    // Règles
    booster: { size: 5, guaranteed: 'rare', mixTypes: true, openOnFirstVisit: true, allowRevealAll: false },
    economy: { startCoins: 0, boosterPrice: 100, freeBooster: { start: 2, every: 10, max: 3 } },
    trade: { allowLastCopy: true, server: null },
    showcase: { size: 6 },
    texts: {}, // textes de engine/strings.js à remplacer

    // Cartes
    cards: [
        { id: 'hero', type: 'character', album: 'one', rarity: 'legendary', name: 'Héroïne', text: 'Elle ouvre la voie.', stats: [{ label: 'Force', value: '9' }] },
        { id: 'guide', type: 'character', album: 'one', rarity: 'rare', name: 'Guide', text: 'Connaît tous les chemins.' },
        { id: 'scout', type: 'character', album: 'one', rarity: 'common', name: 'Éclaireur', text: 'Toujours devant.' },
        { id: 'smith', type: 'character', album: 'two', rarity: 'common', name: 'Forgeron', text: 'Le métal lui obéit.' },
        { id: 'tower', type: 'place', album: 'two', rarity: 'ultra', name: 'Tour', text: 'On y voit loin.' },
        { id: 'forest', type: 'place', album: 'two', rarity: 'common', name: 'Forêt', text: 'On s\'y perd volontiers.' },
        { id: 'harbour', type: 'place', album: 'one', rarity: 'rare', name: 'Port', text: 'Tout commence ici.' },
        { id: 'bridge', type: 'place', album: 'two', rarity: 'common', name: 'Pont', text: 'Relie les deux rives.' },
    ],
};
~~~~

### `tools/check-theme.mjs`

~~~~js
// Vérifie un thème avant de le mettre en ligne, et estime son rythme de jeu.
//   node tools/check-theme.mjs <thème>
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { drawBooster } from '../engine/draw.js';
import { Player } from '../engine/player.js';
import { loadTheme } from '../engine/theme.js';

const HEAVY_IMAGE = 400_000; // octets
const GAMES = 400;
const MAX_BOOSTERS = 20_000;

let theme;
try {
    theme = await loadTheme(process.argv[2] ?? '');
} catch (error) {
    console.error(error.message);
    process.exit(1);
}

// --- Images et textes ---

const errors = [];
const warnings = [];
for (const card of theme.cards) {
    for (const key of ['image', 'background']) {
        if (!card[key]?.startsWith('file:')) continue;
        const file = fileURLToPath(card[key]);
        if (!fs.existsSync(file)) errors.push(`${card.id} : ${key} introuvable (${file})`);
        else if (fs.statSync(file).size > HEAVY_IMAGE) warnings.push(`${card.id} : ${key} pèse ${Math.round(fs.statSync(file).size / 1000)} Ko`);
    }
    if (!card.image) warnings.push(`${card.id} : pas d'image, le motif sera affiché`);
    if (!card.text) warnings.push(`${card.id} : pas de texte`);
    if (card.name.length > 28) warnings.push(`${card.id} : nom long (${card.name.length} caractères)`);
}

// --- Répartition ---

const table = (title, list, key) => {
    console.log(`\n${title}`);
    for (const item of list) {
        const cards = theme.cards.filter((card) => (card[key]?.id ?? card[key]) === item.id);
        console.log(`  ${String(cards.length).padStart(4)}  ${item.label}`);
        if (!cards.length) warnings.push(`${title.toLowerCase()} : « ${item.label} » n'a aucune carte`);
    }
};
console.log(`${theme.name} : ${theme.cards.length} cartes`);
table('Albums', theme.albums, 'album');
table('Raretés', theme.rarities, 'rarity');
table('Types', theme.types, 'type');
if (theme.cards.length < theme.booster.size) errors.push('il y a moins de cartes que dans un booster');

// --- Rythme : un joueur qui ouvre tout ce qu'il peut et vend ses doubles ---

globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const guaranteed = theme.rarities.find(({ id }) => id === theme.booster.guaranteed);
const draw = () => drawBooster(theme.cards, { ...theme.booster, guaranteed });

const DRAWS = 5000;
const withRarity = new Map(theme.rarities.map((rarity) => [rarity, 0]));
for (let i = 0; i < DRAWS; i++) for (const rarity of new Set(draw().map((card) => card.rarity))) withRarity.set(rarity, withRarity.get(rarity) + 1);
console.log('\nBoosters contenant au moins une carte');
for (const [rarity, count] of withRarity) console.log(`  ${(count / DRAWS * 100).toFixed(1).padStart(5)} %  ${rarity.label}`);

let resale = 0;
for (let i = 0; i < DRAWS; i++) resale += draw().reduce((sum, card) => sum + card.rarity.sell, 0);
resale /= DRAWS;
const { boosterPrice } = theme.economy;
console.log(`
Un booster fait seulement de doubles se revend ${Math.round(resale)} pièces en moyenne, pour un prix de ${boosterPrice}`);
if (resale >= boosterPrice) errors.push("un booster de doubles se revend au moins son prix : les boosters sont illimités");
else if (resale > boosterPrice * 0.8) warnings.push("la revente rembourse presque un booster : le jeu se termine très vite");

const boosters = [];
const minutes = [];
for (let i = 0; i < GAMES; i++) {
    let now = 1e12;
    const player = new Player(theme.cards, { gameId: 'simulation', economy: theme.economy, trade: theme.trade, showcase: theme.showcase }, () => now);
    let opened = 0;
    while (!player.isComplete && opened < MAX_BOOSTERS) {
        if (!player.canOpenBooster) player.sellAllSpares();
        if (!player.canOpenBooster) {
            now += Math.max(player.nextFreeIn, 1000);
            continue;
        }
        player.payBooster();
        player.receive(draw());
        opened++;
    }
    boosters.push(opened);
    minutes.push((now - 1e12) / 60_000);
}
const at = (list, part) => list.sort((a, b) => a - b)[Math.min(Math.floor(list.length * part), list.length - 1)];
const duration = (value) => (value < 120 ? `${Math.round(value)} min` : value < 2880 ? `${(value / 60).toFixed(1)} h` : `${(value / 1440).toFixed(1)} jours`);
console.log('\nPour tout compléter sans échange, en revendant ses doubles');
console.log(`  moitié des joueurs : ${at(boosters, 0.5)} boosters, ${duration(at(minutes, 0.5))}`);
console.log(`  9 joueurs sur 10   : ${at(boosters, 0.9)} boosters, ${duration(at(minutes, 0.9))}`);

for (const warning of warnings) console.log(`\nà voir : ${warning}`.trimEnd());
for (const error of errors) console.error(`\nERREUR : ${error}`);
console.log(`\n${errors.length} erreur(s), ${warnings.length} remarque(s)`);
process.exit(errors.length ? 1 : 0);
~~~~

### `tools/guide.mjs`

~~~~js
// Annexe de CREER-UN-TCG.md : le code source complet du template.
//   node tools/guide.mjs update             remet l'annexe à jour à partir des fichiers
//   node tools/guide.mjs extract <dossier>  recrée les fichiers à partir de l'annexe
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const guide = path.join(root, 'CREER-UN-TCG.md');
const MARKER = '<!-- ANNEXE : produite par tools/guide.mjs, ne pas modifier à la main -->';
const LANGUAGES = { '.js': 'js', '.mjs': 'js', '.css': 'css', '.html': 'html' };
const read = (file) => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const list = (folder) => fs.readdirSync(path.join(root, folder)).sort().map((name) => `${folder}/${name}`);

const [command, target] = process.argv.slice(2);
if (command === 'update') {
    const files = ['index.html', ...list('engine'), 'themes/starter/theme.js', ...list('tools')];
    const annex = files.map((file) => `### \`${file}\`\n\n~~~~${LANGUAGES[path.extname(file)]}\n${read(path.join(root, file)).trimEnd()}\n~~~~`);
    const text = read(guide);
    if (!text.includes(MARKER)) throw new Error(`${guide} : repère de l'annexe introuvable`);
    fs.writeFileSync(guide, `${text.slice(0, text.indexOf(MARKER))}${MARKER}\n\n${annex.join('\n\n')}\n`);
    console.log(`${files.length} fichiers dans l'annexe`);
} else if (command === 'extract' && target) {
    const annex = read(guide).split(`\n${MARKER}\n`)[1];
    for (const [, name, code] of annex.matchAll(/^### `([^`]+)`\n\n~~~~\w*\n([\s\S]*?)\n~~~~$/gm)) {
        const file = path.join(target, name);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, `${code}\n`);
        console.log(file);
    }
} else {
    console.error('Usage : node tools/guide.mjs update | extract <dossier>');
    process.exit(1);
}
~~~~

### `tools/import-cards.mjs`

~~~~js
// Produit les cartes et les albums d'un thème à partir de tableurs enregistrés en CSV (UTF-8).
//   node tools/import-cards.mjs <thème> [--allow-removal]
// Lit   themes/<thème>/data/cards.csv et albums.csv
// Écrit themes/<thème>/cards.js et albums.js, à importer dans theme.js
//
// cards.csv  : id, name, album, type, rarity (obligatoires), puis au choix subtitle, text, long, image, fit, background,
//              tags (a|b), stats (Force=12|Coût=3), links (Site=https://…), embed, embed_height
// albums.csv : id, label
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REQUIRED = ['id', 'name', 'album', 'type', 'rarity'];
const TEXTS = [...REQUIRED, 'subtitle', 'text', 'long', 'image', 'fit', 'background'];
const COLUMNS = [...TEXTS, 'tags', 'stats', 'links', 'embed', 'embed_height'];

const args = process.argv.slice(2);
const theme = args.find((arg) => !arg.startsWith('--'));
const folder = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'themes', theme ?? '');
const fail = (errors) => {
    console.error([errors].flat().map((error) => `• ${error}`).join('\n'));
    process.exit(1);
};
if (!/^[a-z0-9-]+$/.test(theme ?? '')) fail('Usage : node tools/import-cards.mjs <thème> [--allow-removal]');

/** Lit un CSV : séparateur « , » ou « ; », guillemets, retours à la ligne dans une cellule. Renvoie des objets. */
function readCsv(name) {
    const file = path.join(folder, 'data', name);
    if (!fs.existsSync(file)) fail(`${file} n'existe pas`);
    const text = `${fs.readFileSync(file, 'utf8').replace(/^﻿/, '').replace(/\r\n?/g, '\n').trimEnd()}\n`;
    const header = text.slice(0, text.indexOf('\n'));
    const separator = header.split(';').length > header.split(',').length ? ';' : ',';
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
        const letter = text[i];
        if (quoted) {
            if (letter === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (letter === '"') quoted = false;
            else cell += letter;
        } else if (letter === '"' && cell === '') quoted = true;
        else if (letter === separator || letter === '\n') {
            row.push(cell.trim());
            cell = '';
            if (letter === '\n') {
                if (row.some(Boolean)) rows.push(row);
                row = [];
            }
        } else cell += letter;
    }
    if (quoted) fail(`${name} : un guillemet n'est pas refermé`);
    const [columns, ...lines] = rows;
    return lines.map((line) => Object.fromEntries(columns.map((column, i) => [column.toLowerCase(), line[i] ?? ''])));
}

const errors = [];

/** « Force=12|Coût=3 » → [{ label: 'Force', <key>: '12' }, …] */
function pairs(value, key, at) {
    return value.split('|').map((part) => part.trim()).filter(Boolean).map((part) => {
        const i = part.indexOf('=');
        if (i < 1) errors.push(`${at} : « ${part} » n'est pas de la forme Nom=valeur`);
        return { label: part.slice(0, i).trim(), [key]: part.slice(i + 1).trim() };
    });
}

const rows = readCsv('cards.csv');
const unknown = Object.keys(rows[0] ?? {}).filter((column) => column && !COLUMNS.includes(column));
if (unknown.length) errors.push(`cards.csv : colonnes inconnues : ${unknown.join(', ')}`);
const seen = new Set();
const cards = rows.map((row, i) => {
    const at = `cards.csv ligne ${i + 2}${row.id ? ` (${row.id})` : ''}`;
    for (const column of REQUIRED) if (!row[column]) errors.push(`${at} : ${column} est vide`);
    if (row.id && !/^[a-z0-9-]+$/.test(row.id)) errors.push(`${at} : id en minuscules, chiffres et tirets seulement`);
    if (row.id && seen.has(row.id)) errors.push(`${at} : id déjà utilisé`);
    seen.add(row.id);
    const card = Object.fromEntries(TEXTS.filter((column) => row[column]).map((column) => [column, row[column]]));
    if (row.tags) card.tags = row.tags.split('|').map((tag) => tag.trim()).filter(Boolean);
    if (row.stats) card.stats = pairs(row.stats, 'value', `${at} stats`);
    if (row.links) card.links = pairs(row.links, 'url', `${at} links`);
    if (row.embed) card.embed = { src: row.embed, ...(Number(row.embed_height) > 0 ? { height: Number(row.embed_height) } : {}) };
    return card;
});
const albums = readCsv('albums.csv').map(({ id, label }, i) => {
    if (!id || !label) errors.push(`albums.csv ligne ${i + 2} : id et label attendus`);
    return { id, label };
});
if (errors.length) fail(errors);

// Un id retiré fait perdre la carte aux joueurs qui la possèdent.
const output = path.join(folder, 'cards.js');
if (fs.existsSync(output)) {
    const { default: before } = await import(pathToFileURL(output).href);
    const removed = before.map(({ id }) => id).filter((id) => !seen.has(id));
    const added = cards.filter(({ id }) => !before.some((card) => card.id === id));
    console.log(`${added.length} carte(s) ajoutée(s), ${removed.length} retirée(s)`);
    if (removed.length && !args.includes('--allow-removal')) {
        fail(`Cartes retirées ou id changés : ${removed.join(', ')}. Les joueurs les perdraient. Pour le faire quand même : --allow-removal`);
    }
}

const source = (list) => `// Produit par tools/import-cards.mjs : modifier les CSV de data/, pas ce fichier.\nexport default ${JSON.stringify(list, null, 4)};\n`;
fs.writeFileSync(output, source(cards));
fs.writeFileSync(path.join(folder, 'albums.js'), source(albums));
console.log(`${cards.length} cartes, ${albums.length} albums`);
~~~~

### `tools/palette.mjs`

~~~~js
// Palette d'un thème à partir de sa couleur prédominante.
//   node tools/palette.mjs "#6d5cff"          palette sombre
//   node tools/palette.mjs "#6d5cff" light    palette claire
// Affiche le bloc colors à coller dans theme.js, puis les contrastes (4.5 au minimum pour du texte).

const [input = '', mode = 'dark'] = process.argv.slice(2);
if (!/^#[0-9a-f]{6}$/i.test(input) || !['dark', 'light'].includes(mode)) {
    console.error('Usage : node tools/palette.mjs "#rrggbb" [dark|light]');
    process.exit(1);
}

const clamp = (value) => Math.min(Math.max(value, 0), 1);
const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const toHex = (rgb) => `#${rgb.map((value) => Math.round(clamp(value) * 255).toString(16).padStart(2, '0')).join('')}`;

function toHsl(hex) {
    const [r, g, b] = toRgb(hex);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    if (!d) return [0, 0, l];
    const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, d / (1 - Math.abs(2 * l - 1)), l];
}

function hsl(h, s, l) {
    const f = (n) => {
        const k = (n + (((h % 360) + 360) % 360) / 30) % 12;
        return l - clamp(s) * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return toHex([f(0), f(8), f(4)]);
}

const luminance = (hex) => toRgb(hex)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
    .reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => {
    const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
};

/** Change la clarté jusqu'au contraste voulu avec un fond. */
function readable(h, s, l, background, ratio) {
    const step = luminance(background) < 0.4 ? 0.02 : -0.02;
    while (contrast(hsl(h, s, l), background) < ratio && l > 0 && l < 1) l += step;
    return hsl(h, s, l);
}

const [hue, saturation] = toHsl(input);
const soft = Math.min(saturation, 0.5); // teinte des fonds
const isDark = mode === 'dark';
const background = isDark ? hsl(hue, soft, 0.06) : hsl(hue, soft, 0.97);
const surface = isDark ? hsl(hue, soft * 0.8, 0.115) : hsl(hue, soft * 0.6, 0.995);
const accentStrong = readable(hue, saturation, isDark ? 0.5 : 0.45, '#ffffff', 4.5); // porte du texte blanc

const colors = {
    background,
    backgroundGlow: isDark ? hsl(hue, soft, 0.22) : hsl(hue, soft, 0.87),
    surface,
    surfaceRaised: isDark ? hsl(hue, soft * 0.8, 0.18) : hsl(hue, soft * 0.6, 0.92),
    border: isDark ? hsl(hue, soft * 0.6, 0.3) : hsl(hue, soft * 0.4, 0.78),
    text: isDark ? '#f8fafc' : hsl(hue, soft * 0.6, 0.1),
    textSoft: isDark ? hsl(hue, soft * 0.4, 0.84) : hsl(hue, soft * 0.4, 0.28),
    muted: readable(hue, soft * 0.4, isDark ? 0.6 : 0.5, isDark ? surface : background, 4.6),
    accent: readable(hue, saturation, isDark ? 0.72 : 0.42, isDark ? surface : background, 4.6),
    accentStrong,
    onAccent: isDark ? hsl(hue, soft, 0.08) : '#ffffff',
    onAccentStrong: '#ffffff',
    coin: isDark ? '#fbbf24' : '#92560a',
    warning: isDark ? '#fde68a' : '#854d0e',
    success: isDark ? '#4ade80' : '#15803d',
    danger: isDark ? '#fda4af' : '#be123c',
    pack1: hsl(hue, Math.min(saturation, 0.75), 0.24),
    pack2: hsl(hue, Math.min(saturation, 0.6), 0.11),
    pack3: hsl(hue + 55, Math.min(saturation, 0.65), 0.29),
    packMotif: hsl(hue, Math.min(saturation, 0.9), 0.78),
    onPack: '#f8fafc',
};

console.log(`    colors: {\n${Object.entries(colors).map(([name, value]) => `        ${name}: '${value}',`).join('\n')}\n    },\n`);

const pairs = [
    ['text', 'background'], ['textSoft', 'surface'], ['muted', 'surface'], ['accent', 'background'],
    ['onAccentStrong', 'accentStrong'], ['onAccent', 'accent'], ['coin', 'background'], ['danger', 'background'], ['onPack', 'pack1'],
];
for (const [front, back] of pairs) {
    const ratio = contrast(colors[front], colors[back]);
    console.log(`${ratio >= 4.5 ? 'ok     ' : 'FAIBLE '}${ratio.toFixed(1).padStart(5)}  ${front} sur ${back}`);
}
~~~~
