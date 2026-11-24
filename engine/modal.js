// Comportement commun aux fenêtres plein écran : le reste de la page ne reçoit plus ni clic, ni focus, ni défilement.

function lockScroll(isLocked) {
    const { style } = document.documentElement;
    // Compense la barre de défilement qui disparaît, pour que la page ne saute pas.
    style.paddingRight = isLocked ? `${window.innerWidth - document.documentElement.clientWidth}px` : '';
    style.overflow = isLocked ? 'hidden' : '';
}

export function createModal(overlay, onEscape) {
    let background = [];
    let previousFocus = null;

    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.tabIndex = -1;
    overlay.hidden = true;
    overlay.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') onEscape();
    });
    document.body.append(overlay);

    return {
        open() {
            previousFocus = document.activeElement;
            background = [...document.body.children].filter((node) => node !== overlay && !node.inert && !node.matches('script'));
            for (const node of background) node.inert = true;
            lockScroll(true);
            overlay.hidden = false;
        },
        close() {
            overlay.hidden = true;
            for (const node of background) node.inert = false;
            lockScroll(false);
            previousFocus?.focus?.({ preventScroll: true });
        },
    };
}
