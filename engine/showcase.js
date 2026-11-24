// Vitrine : quelques cartes choisies par le joueur, à montrer avec un lien.
// Le lien contient la vitrine entière : rien n'est envoyé à un serveur, et rien ne prouve que les cartes sont possédées.
import { actionButton, createCard, el, setText, text } from './card.js';
import { createModal } from './modal.js';
import { NAME_LENGTH, TITLE_LENGTH } from './player.js';
import { pageLink, shareButton } from './share.js';
import { t } from './strings.js';

function encode(value) {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

const limit = (value, length) => (typeof value === 'string' ? value.slice(0, length) : '');

/** Lit la vitrine d'un lien. Renvoie { name, title, cards }, ou null si elle est illisible ou d'un autre jeu. */
export function readShowcase(player, code) {
    try {
        const bytes = Uint8Array.from(atob(code.replaceAll('-', '+').replaceAll('_', '/')), (letter) => letter.charCodeAt(0));
        const { game, name, title, cards } = JSON.parse(new TextDecoder().decode(bytes));
        if (game !== player.rules.gameId || !Array.isArray(cards)) return null;
        const found = [...new Set(cards)].map((id) => player.find(id)).filter(Boolean).slice(0, player.rules.showcase.size);
        return { name: limit(name, NAME_LENGTH), title: limit(title, TITLE_LENGTH), cards: found };
    } catch {
        return null;
    }
}

export function writeShowcase(player) {
    const { title, cards } = player.showcase;
    return encode({ game: player.rules.gameId, name: player.name, title, cards: cards.map((card) => card.id) });
}

export function createShowcase({ player, describe, onChange, onClose }) {
    const { cards } = player;
    const { size } = player.rules.showcase;
    const closeButton = el('button', 'detail__close', { type: 'button', textContent: '×' });
    const title = el('h2', 'showcase__title');
    title.id = 'showcase-title';
    const author = el('p', 'showcase__author');
    const shelf = el('div', 'showcase__shelf');
    const panel = el('div', 'showcase__panel');
    const overlay = el('div', 'showcase', {}, el('div', 'showcase__layout', {}, title, author, shelf, panel), closeButton);
    overlay.setAttribute('aria-labelledby', 'showcase-title');
    const modal = createModal(overlay, close);

    const face = (card) => {
        const node = createCard('div', card, describe(card), cards.indexOf(card) + 1, cards.length);
        node.classList.add('is-flipped');
        return node;
    };

    function spot(card, i, ...extra) {
        const node = el('div', 'showcase__spot', {}, face(card), ...extra);
        node.style.setProperty('--rarity', card.rarity.color);
        node.style.setProperty('--i', i);
        return node;
    }

    function setTitle(value, name) {
        title.textContent = value || t('showcase_default');
        author.textContent = name ? `${t('showcase_by')} ${name}` : '';
        author.hidden = !name;
    }

    // --- Ma vitrine ---

    function showMine() {
        overlay.dataset.mode = 'edit';
        const { showcase } = player;
        setTitle(showcase.title, player.name);

        const titleInput = el('input', 'trade__input', { value: showcase.title, maxLength: TITLE_LENGTH, placeholder: t('showcase_default') });
        titleInput.addEventListener('input', () => {
            player.setShowcaseTitle(titleInput.value);
            setTitle(player.showcase.title, player.name);
        });
        const nameInput = el('input', 'trade__input', { value: player.name, maxLength: NAME_LENGTH, autocomplete: 'nickname' });
        nameInput.addEventListener('input', () => {
            player.setName(nameInput.value);
            setTitle(player.showcase.title, player.name);
        });
        const share = shareButton(() => pageLink(`vitrine=${writeShowcase(player)}`), { share: 'showcase_share', copy: 'showcase_copy', message: 'showcase_message' });
        const count = el('p', 'showcase__count');
        const grid = el('div', 'picker showcase__picker');
        panel.replaceChildren(
            el('div', 'showcase__fields', {},
                el('label', 'trade__name', {}, text('span', '', 'showcase_name'), titleInput),
                el('label', 'trade__name', {}, text('span', '', 'trade_name'), nameInput),
                share),
            count, grid);

        function change(action) {
            action();
            onChange();
            renderShelf();
            renderPicker();
        }

        let dragged = null; // carte qu'on déplace
        function renderShelf() {
            const shown = player.showcase.cards;
            shelf.replaceChildren(...shown.map((card, i) => {
                const { name } = describe(card);
                const button = (sign, key, action, disabled) => {
                    const node = el('button', 'showcase__tool', { type: 'button', textContent: sign, disabled });
                    node.setAttribute('aria-label', `${t(key)} ${name}`);
                    node.addEventListener('click', () => change(action));
                    return node;
                };
                const node = spot(card, i, el('div', 'showcase__tools', {},
                    button('←', 'showcase_before', () => player.moveInShowcase(card, i - 1), i === 0),
                    button('×', 'showcase_remove', () => player.toggleShowcase(card), false),
                    button('→', 'showcase_after', () => player.moveInShowcase(card, i + 1), i === shown.length - 1)));
                node.draggable = true;
                node.addEventListener('dragstart', () => { dragged = card; });
                node.addEventListener('dragend', () => { dragged = null; });
                node.addEventListener('dragover', (event) => { if (dragged) event.preventDefault(); });
                node.addEventListener('drop', (event) => {
                    event.preventDefault();
                    if (dragged && dragged !== card) change(() => player.moveInShowcase(dragged, i));
                });
                return node;
            }));
            for (let i = shown.length; i < size; i++) shelf.append(el('div', 'showcase__spot showcase__spot--empty', {}, el('span', '', { textContent: '+' })));
            count.textContent = `${t('showcase_pick')} ${shown.length} / ${size}`;
            share.disabled = !shown.length;
            setText(share.firstChild, navigator.share ? 'showcase_share' : 'showcase_copy');
        }

        function renderPicker() {
            if (!grid.children.length) {
                grid.replaceChildren(...cards.filter((card) => player.has(card)).map((card) => {
                    const option = el('button', 'picker__option', { type: 'button' }, face(card));
                    option.dataset.id = card.id;
                    option.setAttribute('aria-label', describe(card).name);
                    option.addEventListener('click', () => change(() => player.toggleShowcase(card)));
                    return option;
                }));
                if (!grid.children.length) grid.append(text('p', 'trade__message', 'showcase_empty'));
            }
            const isFull = player.showcase.cards.length >= size;
            for (const option of grid.querySelectorAll('.picker__option')) {
                const isShown = player.isInShowcase(player.find(option.dataset.id));
                option.setAttribute('aria-pressed', isShown);
                option.disabled = isFull && !isShown;
            }
        }

        renderShelf();
        renderPicker();
    }

    // --- Vitrine reçue ---

    function showTheirs(showcase) {
        overlay.dataset.mode = 'view';
        setTitle(showcase.title, showcase.name);
        shelf.replaceChildren(...showcase.cards.map((card, i) => spot(card, i,
            text('p', `showcase__tag${player.has(card) ? ' is-owned' : ''}`, player.has(card) ? 'showcase_owned' : 'showcase_missing'))));
        panel.replaceChildren(el('div', 'booster__actions', {}, actionButton('showcase_close', 'booster__btn booster__btn--main', close)));
    }

    function show(content) {
        if (!overlay.hidden) return;
        closeButton.setAttribute('aria-label', t('cards_close'));
        modal.open();
        overlay.scrollTop = 0;
        content();
        closeButton.focus({ preventScroll: true });
    }

    function close() {
        if (overlay.hidden) return;
        modal.close();
        shelf.replaceChildren();
        panel.replaceChildren();
        onClose();
    }

    closeButton.addEventListener('click', close);
    return {
        open: () => show(showMine),
        view: (showcase) => show(() => showTheirs(showcase)),
    };
}
