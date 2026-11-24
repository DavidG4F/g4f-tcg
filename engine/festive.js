// Décor de Noël, entre deux dates du thème : neige qui tombe, guirlande en festons sous la bannière,
// congères en bas de l'écran et sur ses bords. Purement décoratif : rien n'est cliquable, rien n'est lu par les lecteurs d'écran.
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

/** Chemin lissé passant près des points [[x, y]] : courbes entre les milieux des segments. */
function smooth(points) {
    let d = `M${points[0][0]} ${points[0][1]}`;
    for (let i = 1; i < points.length - 1; i++) {
        const [x, y] = points[i];
        const [nx, ny] = points[i + 1];
        d += ` Q${x} ${y} ${(x + nx) / 2} ${(y + ny) / 2}`;
    }
    const [lx, ly] = points.at(-1);
    return `${d} L${lx} ${ly}`;
}

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

/** Neige accumulée en bas : deux couches de bosses, plus hautes dans les coins. Dessinée sur 1200 × 100, étirée à la largeur. */
function bottomBank() {
    // Une bosse sur deux est haute : de vrais monticules plutôt qu'une ligne ondulée.
    const layer = (seed, base, corner, bumps, height) => {
        const points = [[0, 100]];
        for (let i = 0; i <= bumps; i++) {
            const x = (i / bumps) * 1200;
            const edge = Math.max(0, 1 - Math.min(x, 1200 - x) / 300) ** 2; // 1 dans les coins, 0 au-delà de 300
            const bump = (i % 2 ? 0.35 : 1) * (0.5 + noise(seed + i) * 0.5) * height;
            points.push([x, Math.max(2, 100 - base - corner * edge - bump)]);
        }
        points.push([1200, 100]);
        return `${smooth(points)} Z`;
    };
    return `<svg class="snowbank__bottom" viewBox="0 0 1200 100" preserveAspectRatio="none">
        <defs><linearGradient id="snowbank-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#f1f5fa"/><stop offset="1" stop-color="#d6e0eb"/></linearGradient></defs>
        <path class="snowbank__back" d="${layer(7, 26, 58, 18, 34)}"/>
        <path fill="url(#snowbank-front)" d="${layer(31, 14, 52, 14, 30)}"/>
    </svg>`;
}

/** Neige collée sur un bord de la fenêtre : fine en haut, de plus en plus épaisse vers le bas. Dessinée sur 40 × 1000. */
function sideDrift(seed) {
    const points = [[0, 0]];
    for (let i = 0; i <= 24; i++) {
        const y = (i / 24) * 1000;
        const depth = 2 + 30 * (y / 1000) ** 2.4 + noise(seed + i) * 5;
        points.push([depth, y]);
    }
    points.push([0, 1000]);
    return `<svg viewBox="0 0 40 1000" preserveAspectRatio="none">
        <defs><linearGradient id="snowdrift-${seed}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dde6f0"/></linearGradient></defs>
        <path fill="url(#snowdrift-${seed})" d="${smooth(points)} Z"/>
    </svg>`;
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

    // Congères : en bas, et sur les bords gauche et droit.
    const bank = decor('snowbank');
    bank.innerHTML = bottomBank();
    const left = decor('snowdrift snowdrift--left');
    left.innerHTML = sideDrift(3);
    const right = decor('snowdrift snowdrift--right');
    right.innerHTML = sideDrift(19);
    document.body.append(left, right, bank);

    if (reducedMotion()) return; // pas de neige qui bouge
    // Beaucoup de flocons derrière le contenu, quelques-uns devant pour la profondeur.
    const count = Math.round(Math.min(140, Math.max(60, window.innerWidth / 9)));
    document.body.prepend(snowLayer('snow', count, { crystals: 0.18, maxOpacity: 0.85 }));
    document.body.append(snowLayer('snow snow--front', Math.round(count / 7), { crystals: 0.3, maxOpacity: 0.55 }));
}
