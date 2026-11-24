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
