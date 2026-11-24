// Partage d'un lien : menu du téléphone s'il existe, sinon copie.
import { actionButton, setText } from './card.js';
import { t } from './strings.js';

/** Lien vers cette page, dans le même thème. */
export const pageLink = (hash) => `${location.origin}${location.pathname}${location.search}#${hash}`;

/** getLink est lu au moment du clic. keys : textes des boutons { share, copy } et du message partagé. */
export function shareButton(getLink, keys) {
    if (navigator.share) {
        return actionButton(keys.share, 'booster__btn booster__btn--main', () => {
            navigator.share({ title: document.title, text: t(keys.message), url: getLink() }).catch(() => {}); // partage annulé
        });
    }
    const button = actionButton(keys.copy, 'booster__btn booster__btn--main', async () => {
        try {
            await navigator.clipboard.writeText(getLink());
            setText(button.firstChild, 'share_copied');
        } catch {
            window.prompt(t(keys.copy), getLink()); // copie refusée par le navigateur
        }
    });
    return button;
}
