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
