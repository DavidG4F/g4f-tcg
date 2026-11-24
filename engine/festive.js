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

/** Courbe lisse passant par tous les points [[x, y]] (Catmull-Rom convertie en courbes de Bézier). */
function curveThrough(points) {
    let d = `M${points[0][0]} ${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
        const [p0, p1, p2, p3] = [points[i - 1] ?? points[i], points[i], points[i + 1], points[i + 2] ?? points[i + 1]];
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, Math.min(40, p1[1] + (p2[1] - p0[1]) / 6)];
        const c2 = [p2[0] - (p3[0] - p1[0]) / 6, Math.min(40, p2[1] - (p3[1] - p1[1]) / 6)];
        d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
}

/**
 * Un tas de neige à plusieurs bosses, dessiné sur 100 × 40 (y : 0 en haut, 40 au sol) puis mis à sa taille.
 * Une bosse principale, les autres plus basses ; les creux entre elles ne descendent pas jusqu'au sol.
 */
function snowPile(seed, bumps) {
    const main = Math.floor(noise(seed) * bumps); // la plus haute
    const peaks = [];
    for (let i = 0; i < bumps; i++) {
        const x = 16 + ((i + 0.5) / bumps) * 68 + (noise(seed + i * 3 + 1) - 0.5) * (18 / bumps);
        const y = i === main ? 4 + noise(seed + i + 7) * 5 : 11 + noise(seed + i + 9) * 9;
        peaks.push([x, y]);
    }
    const points = [[0, 40], [5, 33]];
    peaks.forEach((peak, i) => {
        points.push(peak);
        const next = peaks[i + 1];
        if (next) points.push([(peak[0] + next[0]) / 2, Math.max(peak[1], next[1]) + 3 + noise(seed + i + 13) * 5]); // creux doux
    });
    points.push([95, 33], [100, 40]);
    return `<svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <defs><linearGradient id="snowpile-${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#eef3f8"/><stop offset="1" stop-color="#cfd9e5"/></linearGradient></defs>
        <path fill="url(#snowpile-${seed})" d="${curveThrough(points)} Z"/>
    </svg>`;
}

/**
 * Quelques tas de neige le long du bas de l'écran, posés de gauche à droite : largeurs, hauteurs, nombre de bosses
 * et écarts tirés au hasard (toujours les mêmes d'une visite à l'autre), avec de grands vides entre eux.
 * Leur position est gardée en % : ils suivent la largeur si la fenêtre change.
 */
function snowPiles() {
    const screen = window.innerWidth;
    const isSmall = screen < 600;
    const [minWidth, maxWidth, maxHeight, minGap, maxGap] = isSmall ? [90, 155, 34, 45, 150] : [160, 340, 62, 90, 360];
    const piles = [];
    let x = noise(97) * (isSmall ? 40 : 120); // bord gauche du prochain tas
    for (let i = 0; x < screen - minWidth / 2; i++) {
        const width = minWidth + noise(i * 3 + 1) * (maxWidth - minWidth);
        const bumps = 2 + Math.floor(noise(i * 23 + 8) * (width > (isSmall ? 130 : 250) ? 3 : 2)); // 2 à 4 bosses
        const height = Math.min(maxHeight, width * (0.11 + noise(i * 11 + 4) * 0.08));
        const center = x + width / 2;
        const half = Math.round(width / 2); // le tas reste entier dans l'écran
        const pile = el('span', 'snowpile', { innerHTML: snowPile(i * 7 + 2, bumps) });
        pile.style.cssText = `left:clamp(${half}px, ${((center / screen) * 100).toFixed(2)}%, calc(100% - ${half}px));width:${Math.round(width)}px;height:${Math.round(height)}px`;
        piles.push(pile);
        x += width + minGap + noise(i * 19 + 2) ** 1.2 * (maxGap - minGap); // écarts inégaux, parfois très grands
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
