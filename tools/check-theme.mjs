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
