// Thème G4F TCG. Les cartes et les albums viennent des tableurs de data/ :
//   modifier data/cards.csv et data/albums.csv, puis lancer : node tools/import-cards.mjs g4f-tcg
// Voir PROJET.md pour la procédure complète.
import albums from './albums.js';
import cards from './cards.js';

export default {
    // Identité
    id: 'g4f-tcg', // nom de la sauvegarde : ne plus le changer une fois le jeu en ligne
    name: 'G4F TCG',
    title: 'G4F TCG',
    tagline: 'Collectionnez toute l\'équipe G4F.',
    footer: 'G4F TCG · jeu interne, pour l\'équipe G4F',
    language: 'fr',
    logo: 'art/logo.png',
    nav: [],

    // Apparence : palette produite par node tools/palette.mjs "#E4042A"
    // Motif : le logo G4F redessiné en une seule forme
    motif: '<svg viewBox="0 0 100 100" fill="currentColor"><path d="M3.8 50L29 43 43.3 4.9 58.1 72.4 67.6 49.4 96.2 49.7 71 56.4 56.4 95.1 41.6 26.5 32.1 50.3z"/></svg>',
    pack: { top: 'Édition 1', label: 'G4F' },
    colors: {
        background: '#17080a',
        backgroundGlow: '#541c26',
        surface: '#291216',
        surfaceRaised: '#401c22',
        border: '#63363d',
        text: '#f8fafc',
        textSoft: '#deced1',
        muted: '#ad858c',
        accent: '#fd738a',
        accentStrong: '#e7042a',
        onAccent: '#1f0a0e',
        onAccentStrong: '#ffffff',
        coin: '#fbbf24',
        warning: '#fde68a',
        success: '#4ade80',
        danger: '#fda4af',
        pack1: '#6b0f1f',
        pack2: '#2d0b11',
        pack3: '#7a621a',
        packMotif: '#f994a6',
        onPack: '#f8fafc',
    },
    fonts: {},

    // Raretés, de la plus courante à la plus rare. Leur id est celui de la colonne rarity de data/cards.csv.
    rarities: [
        { id: 'commune', label: 'Commune', weight: 60, color: '#94a3b8', effect: 'none', charge: 0, particles: 0, sell: 5, reward: 5 },
        { id: 'rare', label: 'Rare', weight: 27, color: '#38bdf8', effect: 'glow', charge: 250, particles: 12, sell: 12, reward: 10 },
        { id: 'ultra', label: 'Ultra rare', weight: 10, color: '#c084fc', effect: 'burst', charge: 700, particles: 28, sell: 30, reward: 25 },
        { id: 'legendaire', label: 'Légendaire', weight: 3, color: '#fbbf24', effect: 'legend', charge: 1300, particles: 60, sell: 75, reward: 60 },
    ],
    // Types : leur id est celui de la colonne type de data/cards.csv.
    types: [
        { id: 'membre', label: 'Membre' },
        { id: 'materiel', label: 'Matériel' },
        { id: 'moment', label: 'Moment' },
    ],
    albums,
    tags: [],

    // Règles
    booster: { size: 5, guaranteed: 'rare', mixTypes: true, openOnFirstVisit: true, allowRevealAll: false },
    // Un booster gratuit toutes les 12 h : pour 110 cartes, la moitié des joueurs complètent en ~26 jours sans échange.
    economy: { startCoins: 0, boosterPrice: 100, freeBooster: { start: 2, every: 720, max: 3 } },
    trade: { allowLastCopy: true, server: null },
    showcase: { size: 6 },
    // Calendrier de l'Avent : une case par jour à partir de start, une valeur par case = boosters offerts.
    // Les cases oubliées restent ouvrables jusqu'à end inclus. Ne pas changer start pendant le calendrier :
    // les cases déjà ouvertes sont enregistrées pour cette date de départ.
    advent: {
        start: '2026-12-01',
        end: '2027-01-31',
        //        1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24
        boosters: [1, 1, 1, 2, 1, 2, 3, 1, 2, 2, 3, 1, 4, 2, 3, 2, 4, 3, 2, 4, 3, 4, 2, 5],
    },
    texts: {},

    cards,
};
