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
