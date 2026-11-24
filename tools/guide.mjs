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
