// Point d'entrée : charge le thème, construit la page et relie les cartes, les boosters et les échanges.
import { createAdvent } from './advent.js';
import { createBooster } from './booster.js';
import { isDay, parseDay, startOfDay } from './calendar.js';
import { actionButton, coins, createCard, el, text } from './card.js';
import { createDetail } from './detail.js';
import { drawBooster } from './draw.js';
import { favoriteButton, labelDots } from './labels.js';
import { motif, motifSource, setMotif } from './motif.js';
import { Player } from './player.js';
import { createShowcase, readShowcase } from './showcase.js';
import { setTexts, t } from './strings.js';
import { applyStyle, describe, loadTheme, ThemeError } from './theme.js';
import { createTradeView } from './trade-view.js';

/** Gélule à plusieurs choix. options : [[valeur, contenu du bouton]]. */
function segmented(options, selected, onPick) {
    const buttons = options.map(([value, content]) => {
        const button = el('button', '', { type: 'button' }, content);
        button.addEventListener('click', () => {
            for (const [i, [other]] of options.entries()) buttons[i].setAttribute('aria-pressed', other === value);
            onPick(value);
        });
        button.setAttribute('aria-pressed', value === selected);
        return button;
    });
    const group = el('div', 'segmented', {}, ...buttons);
    group.setAttribute('role', 'group');
    return group;
}

const GIFT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>';

/**
 * Horloge du jeu. Sur un serveur local seulement, ?date=AAAA-MM-JJ simule un autre jour pour essayer le calendrier ;
 * en ligne, ce paramètre est ignoré.
 */
function gameClock() {
    const value = new URLSearchParams(location.search).get('date');
    const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    if (!isLocal || !isDay(value)) return Date.now;
    const offset = parseDay(value).getTime() - startOfDay(Date.now()).getTime();
    return () => Date.now() + offset;
}

function setIcon() {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    const svg = motifSource().replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"').replaceAll('currentColor', color);
    document.head.append(el('link', '', { rel: 'icon', href: `data:image/svg+xml,${encodeURIComponent(svg)}` }));
}

/** Construit la page du thème. */
function buildPage(theme) {
    document.title = theme.name;
    document.documentElement.lang = theme.language;

    const bar = el('section', 'collection');
    const filters = el('div', 'filters');
    const albumBar = el('div', 'albums');
    const empty = text('p', 'page__empty', 'cards_filter_empty');
    const sections = theme.albums.map((album) => {
        const grid = el('div', 'grid');
        const count = el('span', 'page__count');
        return { album, grid, count, node: el('section', 'page__section', { id: `album-${album.id}` }, el('h2', 'page__heading', {}, album.label, count), grid) };
    });
    const page = el('div', 'page', {},
        el('header', 'page__header', {},
            el('div', 'page__brand', {}, theme.logo ? el('img', '', { src: theme.logo, alt: '' }) : motif(), el('span', '', { textContent: theme.name })),
            el('nav', 'page__nav', {}, ...theme.nav.map(({ label, url }) => el('a', '', { href: url, textContent: label })))),
        el('section', 'page__hero', {},
            el('h1', 'page__title', { textContent: theme.title ?? theme.name }),
            ...(theme.tagline ? [el('p', 'page__tagline', { textContent: theme.tagline })] : [])),
        el('main', '', {}, bar, albumBar, filters, empty, ...sections.map(({ node }) => node)),
        ...(theme.footer ? [el('footer', 'page__footer', { textContent: theme.footer })] : []));
    document.body.append(page);
    return { bar, albumBar, filters, empty, sections };
}

function start(theme) {
    applyStyle(theme);
    setMotif(theme.motif);
    // Libellés du thème, utilisables comme les textes du moteur.
    const labels = (prefix, list) => list.map(({ id, label }) => [`${prefix}_${id}`, label]);
    setTexts({
        ...theme.texts,
        ...Object.fromEntries([...labels('rarity', theme.rarities), ...labels('type', theme.types), ...labels('tag', theme.tags), ...labels('album', theme.albums)]),
    });
    setIcon();

    const { rarities } = theme;
    const { bar, albumBar, filters, empty, sections } = buildPage(theme);
    const cards = theme.cards.map((card) => ({ ...card, node: el('div', 'tile'), isShown: null }));
    const player = new Player(cards, { gameId: theme.id, economy: theme.economy, trade: theme.trade, showcase: theme.showcase, advent: theme.advent }, gameClock());
    const newCards = new Set(); // découvertes pendant cette visite

    // --- Grilles : seules les cartes possédées sont visibles ---

    for (const { album, grid } of sections) grid.append(...cards.filter((card) => card.album === album.id).map((card) => card.node));

    // --- Albums : un bouton par album, avec sa progression ---

    const inAlbum = (album) => cards.filter((card) => card.album === album.id);
    const albumButtons = [null, ...theme.albums].map((album) => {
        const count = el('span', 'album__count');
        const progress = el('progress', 'collection__progress', { max: (album ? inAlbum(album) : cards).length });
        const button = el('button', 'album', { type: 'button' },
            el('span', 'album__name', { textContent: album ? album.label : t('album_all') }), count, progress);
        button.addEventListener('click', () => {
            filter.album = album;
            applyFilter();
        });
        return { album, button, count, progress };
    });
    albumBar.append(...albumButtons.map(({ button }) => button));

    function showAlbums() {
        for (const { album, button, count, progress } of albumButtons) {
            const list = album ? inAlbum(album) : cards;
            const found = list.filter((card) => player.has(card)).length;
            count.textContent = `${found} / ${list.length}`;
            progress.value = found;
            progress.setAttribute('aria-label', `${found} / ${list.length}`);
            button.classList.toggle('is-complete', found === list.length);
        }
        for (const { album, count } of sections) {
            const list = inAlbum(album);
            count.textContent = `${list.filter((card) => player.has(card)).length} / ${list.length}`;
        }
    }

    // --- Filtres : album, puis favoris, étiquettes du thème ou du joueur ---

    const filter = { album: null, view: 'all' };
    const views = () => [
        { id: 'all', label: t('cards_filter_all'), keep: () => true },
        { id: 'favorites', label: `♥ ${t('favorite_title')}`, keep: (card) => player.has(card) && player.isFavorite(card) },
        ...theme.tags.map(({ id }) => ({ id: `tag-${id}`, label: t(`tag_${id}`), keep: (card) => card.tags.includes(id) })),
        ...player.labels.map((label) => ({ id: `label-${label.id}`, label: label.name, color: label.color, keep: (card) => player.has(card) && player.hasLabel(card, label) })),
    ];

    function applyFilter() {
        const list = views();
        const view = list.find(({ id }) => id === filter.view) ?? list[0]; // étiquette supprimée
        filter.view = view.id;
        for (const { album, button } of albumButtons) button.setAttribute('aria-pressed', album === filter.album);
        for (const card of cards) {
            const isKept = (!filter.album || card.album === filter.album.id) && view.keep(card);
            card.node.hidden = !isKept && !card.node.classList.contains('is-out'); // la case d'une carte sortie doit rester en place
        }
        for (const { grid, node } of sections) node.hidden = ![...grid.children].some((tile) => !tile.hidden);
        empty.hidden = sections.some(({ node }) => !node.hidden);

        const bar = segmented(list.map(({ id, label, color }) => {
            const content = el('span', color ? 'segmented__label' : '', { textContent: label });
            if (color) content.style.setProperty('--label', color);
            return [id, content];
        }), filter.view, (id) => {
            filter.view = id;
            applyFilter();
            filters.querySelector('[aria-pressed="true"]').focus();
        });
        filters.replaceChildren(bar);
    }

    const placeholder = () => el('div', 'hidden-card', {}, motif(),
        el('span', 'hidden-card__mark', { textContent: '?' }),
        text('p', 'hidden-card__text', 'cards_hidden'));

    function showCard(card) {
        const isShown = player.has(card);
        const { node, rarity } = card;
        node.classList.toggle('is-new', isShown && newCards.has(card));
        if (card.isShown === isShown) {
            showMarks(card);
            return;
        }

        card.isShown = isShown;
        node.classList.toggle('is-undiscovered', !isShown);
        node.style.order = isShown ? 0 : 1; // les cartes découvertes d'abord
        node.style.setProperty('--rarity', rarity.color);
        if (!isShown) {
            node.replaceChildren(placeholder());
            return;
        }
        const face = createCard('div', card, describe(card), cards.indexOf(card) + 1, cards.length);
        face.classList.add('is-flipped');
        // Les marques sont fixées à la carte, pour s'incliner avec elle.
        card.favorite = favoriteButton(player, card, 'favorite favorite--tile', update);
        face.firstChild.append(text('span', 'new-tag', 'cards_new'), el('span', 'count-tag'), el('span', 'label-dots'), card.favorite.node);
        // Toute la case s'ouvre au clic ; ce bouton invisible sert au clavier.
        const opener = el('button', 'tile__open', { type: 'button' });
        opener.setAttribute('aria-label', card.name);
        opener.addEventListener('click', (event) => {
            event.stopPropagation();
            detail.open(card);
        });
        node.replaceChildren(opener, face);
        showMarks(card);
    }

    /** Nombre d'exemplaires (à partir de deux), favori et étiquettes. */
    function showMarks(card) {
        if (!card.isShown) return;
        const count = card.node.querySelector('.count-tag');
        count.hidden = player.spare(card) === 0;
        count.textContent = `×${player.count(card)}`;
        card.favorite.update();
        card.node.querySelector('.label-dots').replaceChildren(...labelDots(player, card));
    }

    const detail = createDetail({ player, describe, onChange: update, onTrade: (give) => trade.open({ give }), onClose: applyFilter });
    for (const card of cards) {
        card.node.addEventListener('click', () => { if (player.has(card)) detail.open(card); });
    }

    // --- Barre de collection ---

    const count = el('strong', 'collection__count');
    const progress = el('progress', 'collection__progress', { max: cards.length });
    const chips = el('div', 'collection__chips');
    const openButton = actionButton('cards_open_booster', 'booster__btn booster__btn--main', () => booster.open());
    const sellButton = actionButton('sell_spares', 'booster__btn booster__btn--coins', () => {
        player.sellAllSpares();
        update();
    });
    const sellValue = el('span');
    sellButton.append(' ', sellValue);
    const showcaseButton = actionButton('showcase_mine', 'booster__btn', () => showcase.open());
    const tradeButton = actionButton('trade_open', 'booster__btn', () => trade.open());
    const adventBadge = el('span', 'advent-btn__badge');
    const adventButton = actionButton('advent_open', 'booster__btn', () => advent.open(), adventBadge);
    const revealLink = actionButton('cards_reveal_all', 'booster__link', revealAll);
    const resetLink = actionButton('cards_reset', 'booster__link', () => {
        if (!window.confirm(t('cards_reset_confirm'))) return;
        newCards.clear();
        player.reset();
        update();
        booster.open();
    });

    // Solde et booster, toujours visibles en bas de l'écran.
    const balance = el('span', 'hud__coins');
    const hudPrice = el('span', 'hud__price');
    const hudButton = el('button', 'floating-booster', { type: 'button' }, motif(), text('span', '', 'cards_open_booster'), hudPrice);
    hudButton.addEventListener('click', () => booster.open());
    // Rappel du calendrier, visible seulement quand une case attend d'être ouverte.
    const hudAdventBadge = el('span', 'advent-btn__badge');
    const hudAdvent = el('button', 'hud__advent', { type: 'button', innerHTML: GIFT_ICON }, hudAdventBadge);
    hudAdvent.addEventListener('click', () => advent.open());
    document.body.append(el('div', 'hud', {}, balance, hudButton, hudAdvent));

    const label = el('p', 'collection__label', {}, text('span', '', 'cards_collection'), ' ', count);
    bar.append(el('div', 'collection__main', {}, label, progress, chips), el('div', 'collection__actions', {}, openButton, adventButton, tradeButton, showcaseButton, sellButton, revealLink, resetLink));

    function update() {
        cards.forEach(showCard);
        showAlbums();
        applyFilter();
        count.textContent = `${player.discovered} / ${cards.length}`;
        progress.value = player.discovered;
        progress.setAttribute('aria-label', label.textContent);
        chips.replaceChildren(...rarities.map((rarity) => {
            const all = cards.filter((card) => card.rarity === rarity);
            const found = all.filter((card) => player.has(card)).length;
            const chip = el('span', 'collection__chip', {}, text('span', '', `rarity_${rarity.id}`), ` ${found}/${all.length}`);
            chip.style.setProperty('--rarity', rarity.color);
            return chip;
        }));
        sellButton.hidden = player.spareValue === 0;
        sellValue.replaceChildren(coins(player.spareValue, '+'));
        revealLink.hidden = player.isComplete || !theme.booster.allowRevealAll;
        resetLink.hidden = player.discovered === 0;
        showBalance();
        showAdvent();
    }

    let shownAdvent = '';
    /** Bouton du calendrier, pendant le calendrier et juste avant, avec le nombre de cases à ouvrir ; rappelé chaque seconde. */
    function showAdvent() {
        const status = player.adventStatus;
        const ready = status === 'open' ? player.adventDays.filter((box) => box.canOpen).length : 0;
        const state = `${status}|${ready}`;
        if (state === shownAdvent) return;
        shownAdvent = state;
        adventButton.hidden = status === 'none' || status === 'over';
        adventBadge.hidden = hudAdventBadge.hidden = !ready;
        adventBadge.textContent = hudAdventBadge.textContent = ready;
        hudAdvent.hidden = !ready;
        hudAdvent.setAttribute('aria-label', `${t('advent_open')} : ${ready} ${t('advent_ready')}`);
    }

    let shownBalance = '';
    /** Solde et prix du prochain booster ; rappelé chaque seconde pour le compte à rebours. */
    function showBalance() {
        const free = player.freeBoosters;
        const canOpen = player.canOpenBooster;
        const seconds = Math.ceil(player.nextFreeIn / 1000);
        const countdown = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
        const state = `${player.coins}|${free}|${free ? '' : countdown}`;
        if (state === shownBalance) return;
        shownBalance = state;

        balance.replaceChildren(coins(player.coins));
        hudButton.disabled = openButton.disabled = !canOpen;
        if (free > 0) hudPrice.replaceChildren(text('span', '', 'booster_free'), ` ×${free}`);
        else if (canOpen) hudPrice.replaceChildren(coins(theme.economy.boosterPrice));
        else hudPrice.replaceChildren(text('span', '', 'booster_next'), ` ${countdown}`);
    }
    setInterval(() => {
        showBalance();
        showAdvent(); // une nouvelle case à minuit
    }, 1000);

    function revealAll() {
        player.revealAll();
        update();
    }

    /** Retient les cartes découvertes pendant cette visite. */
    function received(results) {
        for (const { card, isNew } of results) if (isNew) newCards.add(card);
        return results;
    }

    // --- Boosters ---

    const { size, guaranteed, mixTypes, openOnFirstVisit, allowRevealAll } = theme.booster;
    const booster = createBooster({
        player,
        size,
        describe,
        pack: { top: theme.pack.top ?? theme.name, label: theme.pack.label ?? theme.name },
        onChange: update,
        draw() {
            if (!player.payBooster()) return null;
            const drawn = drawBooster(cards, { size, mixTypes, guaranteed: rarities.find((rarity) => rarity.id === guaranteed) });
            return received(player.receive(drawn));
        },
        onRevealAll: allowRevealAll ? revealAll : null,
        onClose(opened) {
            player.save(); // le booster de bienvenue n'est proposé qu'une fois
            update();
            if (openLink()) return;
            if (opened) bar.scrollIntoView({ behavior: 'smooth' });
        },
    });

    // --- Échanges ---

    const trade = createTradeView({
        player,
        describe,
        onChange(results) {
            received(results);
            update();
        },
    });

    // --- Calendrier de l'Avent ---

    const advent = createAdvent({
        player,
        language: theme.language,
        onChange: update,
        onPlay: () => booster.open(),
    });

    // --- Vitrine ---

    const showcase = createShowcase({
        player,
        describe,
        onChange: update,
        onClose() {
            if (player.isFirstVisit) welcome(); // venu par le lien d'une vitrine
        },
    });

    function welcome() {
        if (player.isFirstVisit && openOnFirstVisit) booster.open({ isWelcome: true });
        else openLink();
    }

    /** Ouvre ce que contient l'adresse : un salon d'échange (#room=…) ou une vitrine (#vitrine=…). */
    function openLink() {
        const [, kind, code] = location.hash.match(/^#(room|vitrine)=([\w-]+)$/) ?? [];
        const isBusy = document.querySelector('[role="dialog"]:not([hidden])'); // une seule fenêtre à la fois
        if (!kind || isBusy) return false;
        history.replaceState(null, '', location.pathname + location.search); // un rechargement ne l'ouvre pas à nouveau
        if (kind === 'room') {
            trade.open({ code });
            return true;
        }
        const theirs = readShowcase(player, code);
        if (theirs) showcase.view(theirs);
        return theirs !== null;
    }
    window.addEventListener('hashchange', openLink);

    // La partie a continué dans un autre onglet.
    window.addEventListener('storage', (event) => {
        if (!player.owns(event.key)) return;
        player.load();
        update();
        trade.refresh();
    });

    update();
    // Une vitrine se regarde sans attendre ; un salon passe après le booster de bienvenue.
    if (!location.hash.startsWith('#vitrine=') || !openLink()) welcome();
}

// Le thème vient de index.html (data-theme), ou de l'adresse (?theme=nom) pour en essayer un autre.
const name = new URLSearchParams(location.search).get('theme') ?? document.documentElement.dataset.theme;
loadTheme(name).then(start).catch((error) => {
    console.error(error);
    const message = error instanceof ThemeError ? error.message : `Erreur inattendue : ${error.message}`;
    document.body.prepend(el('p', 'page__error', { textContent: message }));
});
