// Favori et étiquettes d'une carte, dans son détail. Les étiquettes sont créées par le joueur.
import { actionButton, el, setText, text } from './card.js';
import { LABEL_LENGTH, MAX_LABELS } from './player.js';
import { t } from './strings.js';

const COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a78bfa', '#f472b6', '#94a3b8'];

/** Cœur à basculer. Renvoie { node, update }. */
export function favoriteButton(player, card, className, onChange) {
    const node = el('button', className, { type: 'button' }, el('span', '', { textContent: '♥' }));
    const update = () => {
        const isFavorite = player.isFavorite(card);
        node.setAttribute('aria-pressed', isFavorite);
        node.title = t(isFavorite ? 'favorite_remove' : 'favorite_add');
        node.setAttribute('aria-label', node.title);
    };
    node.addEventListener('click', (event) => {
        event.stopPropagation(); // la case entière ouvre le détail
        player.toggleFavorite(card);
        update();
        onChange();
    });
    update();
    return { node, update };
}

/** Étiquettes d'une carte : à cocher, à créer, à renommer ou à supprimer. */
export function labelEditor(player, card, onChange) {
    const list = el('div', 'labels__list');
    const node = el('div', 'labels', {}, text('p', 'labels__title', 'label_title'), list);
    let isEditing = false;

    function changed() {
        render();
        onChange();
    }

    function toggle(label) {
        const button = el('button', 'label-chip', { type: 'button', textContent: label.name });
        button.style.setProperty('--label', label.color);
        button.setAttribute('aria-pressed', player.hasLabel(card, label));
        button.addEventListener('click', () => {
            player.toggleLabel(card, label);
            changed();
        });
        return button;
    }

    function editable(label) {
        const input = el('input', 'label-chip__input', { value: label.name, maxLength: LABEL_LENGTH });
        input.setAttribute('aria-label', t('label_rename'));
        input.addEventListener('change', () => {
            player.renameLabel(label, input.value);
            changed();
        });
        const remove = el('button', 'label-chip__remove', { type: 'button', textContent: '×' });
        remove.setAttribute('aria-label', `${t('label_delete')} ${label.name}`);
        remove.addEventListener('click', () => {
            if (!window.confirm(`${t('label_delete_confirm')} « ${label.name} »`)) return;
            player.removeLabel(label);
            changed();
        });
        const chip = el('span', 'label-chip label-chip--edit', {}, input, remove);
        chip.style.setProperty('--label', label.color);
        return chip;
    }

    function creator() {
        const input = el('input', 'label-chip__input', { placeholder: t('label_new'), maxLength: LABEL_LENGTH });
        input.setAttribute('aria-label', t('label_new'));
        const add = el('button', 'label-chip__remove', { type: 'submit', textContent: '+' });
        add.setAttribute('aria-label', t('label_create'));
        const form = el('form', 'label-chip label-chip--new', {}, input, add);
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const label = player.addLabel(input.value, COLORS[player.labels.length % COLORS.length]);
            if (!label) return;
            if (!player.hasLabel(card, label)) player.toggleLabel(card, label);
            changed();
            list.querySelector('.label-chip--new input')?.focus();
        });
        return form;
    }

    function render() {
        const { labels } = player;
        if (!labels.length) isEditing = false;
        list.replaceChildren(...labels.map(isEditing ? editable : toggle));
        if (!isEditing && labels.length < MAX_LABELS) list.append(creator());
        if (!labels.length) return;
        const edit = actionButton('label_edit', 'booster__link', () => {
            isEditing = !isEditing;
            render();
        });
        if (isEditing) setText(edit.firstChild, 'label_done');
        list.append(edit);
    }

    render();
    return node;
}

/** Pastilles de couleur des étiquettes d'une carte, posées sur sa case. */
export function labelDots(player, card) {
    return player.labels.filter((label) => player.hasLabel(card, label)).map((label) => {
        const dot = el('span', 'label-dot', { title: label.name });
        dot.style.setProperty('--label', label.color);
        return dot;
    });
}
