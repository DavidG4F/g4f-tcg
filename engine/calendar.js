// Calendrier de l'Avent : quelles cases peuvent s'ouvrir, et quand. Sans affichage : se teste sous Node.
// Les jours suivent l'heure locale du joueur.

/** Vrai pour une date 'AAAA-MM-JJ' qui existe. */
export function isDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = parseDay(value);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/** 'AAAA-MM-JJ' → ce jour à minuit, heure locale. */
export function parseDay(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/** Minuit du jour de time (millisecondes). */
export function startOfDay(time) {
    const date = new Date(time);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Vrai si le jour de now est entre from et to inclus ('AAAA-MM-JJ'). */
export function isBetween(from, to, now) {
    const today = startOfDay(now).getTime();
    return today >= parseDay(from).getTime() && today <= parseDay(to).getTime();
}

/** Avant, pendant ou après le calendrier : 'none' (pas de calendrier), 'soon', 'open' ou 'over'. */
export function adventStatus(advent, now) {
    if (!advent) return 'none';
    const today = startOfDay(now).getTime();
    if (today < parseDay(advent.start).getTime()) return 'soon';
    return today > parseDay(advent.end).getTime() ? 'over' : 'open';
}

/**
 * Cases du calendrier, de la première à la dernière : [{ day, boosters, date, isOpened, isLocked, canOpen }].
 * advent : { start, end, boosters } du thème ; opened : ensemble des numéros de cases déjà ouvertes.
 * Une case s'ouvre à partir de son jour, une seule fois, et jusqu'à la fin du calendrier.
 */
export function adventDays(advent, now, opened) {
    if (!advent) return [];
    const isOver = adventStatus(advent, now) === 'over';
    const today = startOfDay(now).getTime();
    const start = parseDay(advent.start);
    return advent.boosters.map((boosters, i) => {
        const day = i + 1;
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const isOpened = opened.has(day);
        const isLocked = today < date.getTime();
        return { day, boosters, date, isOpened, isLocked, canOpen: !isOpened && !isLocked && !isOver };
    });
}
