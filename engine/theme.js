// Charge un thème, vérifie qu'il est complet et complète ce qu'il ne précise pas. Voir themes/cosmos/theme.js pour un exemple.
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
