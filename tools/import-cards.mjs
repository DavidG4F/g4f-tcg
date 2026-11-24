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
