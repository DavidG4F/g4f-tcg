// Thème de départ, sans image : à copier pour créer un jeu. themes/cosmos/theme.js est un exemple complet.

export default {
    // Identité
    id: 'starter', // nom de la sauvegarde : ne plus le changer une fois le jeu en ligne
    name: 'Mon TCG',
    title: 'Mon TCG', // grand titre ; name par défaut
    tagline: 'Une phrase qui donne envie de collectionner.',
    footer: 'Mentions et crédits',
    language: 'fr',
    logo: null, // image du haut de page ; le motif par défaut
    nav: [], // liens du haut de page : { label, url }

    // Apparence
    motif: 'star', // wave, orbit, star, shield, leaf, flame, ou un dessin '<svg …>' en currentColor
    pack: { top: 'Édition 1', label: 'MON TCG' }, // petit et grand texte du booster
    colors: {}, // voir tools/palette.mjs ; les couleurs absentes gardent leur valeur de engine/style.css
    fonts: {}, // url (feuille de style de polices), body, heading

    // Raretés, de la plus courante à la plus rare
    rarities: [
        { id: 'common', label: 'Commune', weight: 60, color: '#94a3b8', effect: 'none', charge: 0, particles: 0, sell: 5, reward: 5 },
        { id: 'rare', label: 'Rare', weight: 27, color: '#38bdf8', effect: 'glow', charge: 250, particles: 12, sell: 12, reward: 10 },
        { id: 'ultra', label: 'Ultra rare', weight: 10, color: '#c084fc', effect: 'burst', charge: 700, particles: 28, sell: 30, reward: 25 },
        { id: 'legendary', label: 'Légendaire', weight: 3, color: '#fbbf24', effect: 'legend', charge: 1300, particles: 60, sell: 75, reward: 60 },
    ],
    types: [
        { id: 'character', label: 'Personnage' },
        { id: 'place', label: 'Lieu' },
    ],
    albums: [
        { id: 'one', label: 'Premier album' },
        { id: 'two', label: 'Deuxième album' },
    ],
    tags: [], // filtres facultatifs : { id, label }

    // Règles
    booster: { size: 5, guaranteed: 'rare', mixTypes: true, openOnFirstVisit: true, allowRevealAll: false },
    economy: { startCoins: 0, boosterPrice: 100, freeBooster: { start: 2, every: 10, max: 3 } },
    trade: { allowLastCopy: true, server: null },
    showcase: { size: 6 },
    texts: {}, // textes de engine/strings.js à remplacer

    // Cartes
    cards: [
        { id: 'hero', type: 'character', album: 'one', rarity: 'legendary', name: 'Héroïne', text: 'Elle ouvre la voie.', stats: [{ label: 'Force', value: '9' }] },
        { id: 'guide', type: 'character', album: 'one', rarity: 'rare', name: 'Guide', text: 'Connaît tous les chemins.' },
        { id: 'scout', type: 'character', album: 'one', rarity: 'common', name: 'Éclaireur', text: 'Toujours devant.' },
        { id: 'smith', type: 'character', album: 'two', rarity: 'common', name: 'Forgeron', text: 'Le métal lui obéit.' },
        { id: 'tower', type: 'place', album: 'two', rarity: 'ultra', name: 'Tour', text: 'On y voit loin.' },
        { id: 'forest', type: 'place', album: 'two', rarity: 'common', name: 'Forêt', text: 'On s\'y perd volontiers.' },
        { id: 'harbour', type: 'place', album: 'one', rarity: 'rare', name: 'Port', text: 'Tout commence ici.' },
        { id: 'bridge', type: 'place', album: 'two', rarity: 'common', name: 'Pont', text: 'Relie les deux rives.' },
    ],
};
