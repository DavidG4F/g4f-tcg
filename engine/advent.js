// Fenêtre du calendrier de l'Avent : une porte par jour, qui s'ouvre sur des boosters offerts.
import { burst, el, setText, text } from './card.js';
import { parseDay } from './calendar.js';
import { createModal } from './modal.js';
import { motif } from './motif.js';
import { t } from './strings.js';

// Les portes sont dispersées comme sur un vrai calendrier ; la même disposition pour tout le monde.
const ORDER_24 = [13, 4, 20, 9, 1, 17, 22, 6, 11, 15, 2, 19, 24, 8, 14, 3, 21, 10, 5, 18, 12, 23, 7, 16];

/** onPlay : ouvrir les boosters reçus ; onChange : après l'ouverture d'une case. */
export function createAdvent({ player, language, onPlay, onChange }) {
    const closeButton = el('button', 'detail__close', { type: 'button', textContent: '×' });
    const title = text('h2', 'advent__title', 'advent_title');
    title.id = 'advent-title';
    const intro = el('p', 'advent__intro');
    const grid = el('div', 'advent__grid');
    const message = el('p', 'advent__message');
    message.setAttribute('aria-live', 'polite');
    const actions = el('div', 'booster__actions');
    const overlay = el('div', 'advent', {},
        el('div', 'advent__layout', {}, title, intro, grid, el('div', 'advent__footer', {}, message, actions)),
        closeButton);
    overlay.setAttribute('aria-labelledby', 'advent-title');
    const modal = createModal(overlay, close);

    const formatDate = (date) => {
        const value = new Intl.DateTimeFormat(language, { day: 'numeric', month: 'long' }).format(date);
        return language.startsWith('fr') && date.getDate() === 1 ? value.replace(/^1(?=\s)/, '1er') : value; // « 1er décembre »
    };
    const unit = (count) => t(count > 1 ? 'advent_boosters' : 'advent_booster');

    /** Contenu d'une case ouverte : le paquet et le nombre de boosters. */
    const inside = (boosters) => [motif(), el('strong', 'advent__amount', { textContent: `×${boosters}` }), el('span', 'advent__unit', { textContent: unit(boosters) })];

    function door(box, isLast) {
        const node = el('button', `advent__door${isLast ? ' advent__door--last' : ''}`, { type: 'button' },
            el('span', 'advent__inside', {}, ...(box.isOpened ? inside(box.boosters) : [])),
            el('span', 'advent__leaf', {}, el('span', 'advent__number', { textContent: box.day })));
        node.dataset.state = box.isOpened ? 'opened' : box.canOpen ? 'ready' : 'locked';
        const label = `${t('advent_day')} ${box.day}`;
        node.setAttribute('aria-label', box.isOpened ? `${label}, ${box.boosters} ${unit(box.boosters)}`
            : box.isLocked ? `${label}, ${t('advent_locked')} ${formatDate(box.date)}` : label);
        node.addEventListener('click', () => {
            if (node.dataset.state === 'ready') openDoor(node, box);
            else if (node.dataset.state === 'opened') message.textContent = `${t('advent_day')} ${box.day} : ${t('advent_opened').toLowerCase()}.`;
            else if (box.isLocked) message.textContent = `${t('advent_locked')} ${formatDate(box.date)}.`;
        });
        return node;
    }

    function openDoor(node, box) {
        const boosters = player.openAdvent(box.day);
        if (!boosters) { // déjà ouverte dans un autre onglet, ou jour passé entre-temps
            render();
            return;
        }
        node.querySelector('.advent__inside').replaceChildren(...inside(boosters));
        node.dataset.state = 'opened';
        node.classList.add('is-opening');
        node.setAttribute('aria-label', `${t('advent_day')} ${box.day}, ${boosters} ${unit(boosters)}`);
        burst(node, { color: getComputedStyle(document.documentElement).getPropertyValue('--coin'), particles: 10 + boosters * 6 });
        message.textContent = `${t('advent_got')} ${boosters} ${unit(boosters)} !`;
        onChange();
        showActions();
    }

    function showActions() {
        const ready = player.freeBoosters;
        actions.replaceChildren();
        if (!ready) return;
        const play = el('button', 'booster__btn booster__btn--main', { type: 'button' }, text('span', '', 'advent_play'), ` ×${ready}`);
        play.addEventListener('click', () => {
            close();
            onPlay();
        });
        actions.append(play);
    }

    function render() {
        const { advent } = player.rules;
        const days = player.adventDays;
        const byDay = new Map(days.map((box) => [box.day, box]));
        const order = days.length === ORDER_24.length ? ORDER_24 : days.map(({ day }) => day);
        grid.replaceChildren(...order.map((day) => door(byDay.get(day), day === days.length)));

        const status = player.adventStatus;
        if (status === 'soon') intro.textContent = `${t('advent_soon')} ${formatDate(parseDay(advent.start))}.`;
        else if (status === 'over') setText(intro, 'advent_over');
        else intro.textContent = `${t('advent_intro')} ${t('advent_until')} ${formatDate(parseDay(advent.end))}.`;
        showActions();
    }

    function open() {
        if (!overlay.hidden) return;
        closeButton.setAttribute('aria-label', t('cards_close'));
        message.textContent = '';
        modal.open();
        overlay.scrollTop = 0;
        render();
        (grid.querySelector('[data-state="ready"]') ?? closeButton).focus({ preventScroll: true });
    }

    function close() {
        if (overlay.hidden) return;
        modal.close();
        grid.replaceChildren();
    }

    closeButton.addEventListener('click', close);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    return { open };
}
