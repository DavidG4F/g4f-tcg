// Sauvegarde du joueur, gardée dans son navigateur : cartes possédées, pièces, boosters gratuits et offerts,
// calendrier de l'Avent, favoris, étiquettes et vitrine.
import { adventDays, adventStatus } from './calendar.js';

export const NAME_LENGTH = 20;
export const TITLE_LENGTH = 40;
export const LABEL_LENGTH = 24;
export const MAX_LABELS = 12;

const isCount = (value) => Number.isInteger(value) && value > 0;

export class Player {
    #owned = new Map(); // carte → nombre d'exemplaires
    #known = new Set(); // cartes possédées un jour : la prime de découverte n'est donnée qu'une fois
    #favorites = new Set();
    #labelled = new Map(); // carte → ensemble d'identifiants d'étiquettes
    #showcase = []; // cartes exposées, même celles qu'on n'a plus
    #advent = new Set(); // numéros des cases du calendrier déjà ouvertes
    #now;

    /** rules : { gameId, economy, trade, showcase, advent }, tirés du thème. now est remplaçable pour les tests. */
    constructor(cards, rules, now = Date.now) {
        this.cards = cards;
        this.rules = rules;
        this.#now = now;
        this.load();
    }

    get #key() {
        return `tcg-${this.rules.gameId}`;
    }

    // --- Lecture et écriture ---

    load() {
        this.#owned.clear();
        this.#known.clear();
        this.#favorites.clear();
        this.#labelled.clear();
        this.#showcase = [];
        this.#advent.clear();
        this.gifts = 0; // boosters offerts (calendrier) : sans plafond, ouverts après les gratuits
        this.showcaseTitle = '';
        this.labels = []; // { id, name, color }
        this.isFirstVisit = true;
        this.coins = this.rules.economy.startCoins;
        this.free = { stock: this.rules.economy.freeBooster.start, at: this.#now() };
        this.id = crypto.randomUUID?.() ?? String(Math.random()); // pour ne pas échanger avec soi-même
        this.name = ''; // pseudo montré pendant un échange

        let saved = null;
        try {
            saved = JSON.parse(localStorage.getItem(this.#key));
        } catch {
            // Stockage bloqué ou illisible : la partie ne dure que le temps de la visite.
        }

        if (saved && typeof saved === 'object') {
            this.isFirstVisit = false;
            for (const card of this.cards) if (isCount(saved.owned?.[card.id])) this.#owned.set(card, saved.owned[card.id]);
            for (const card of this.cards) if (this.has(card) || saved.known?.includes?.(card.id)) this.#known.add(card);
            if (Number.isFinite(saved.coins) && saved.coins >= 0) this.coins = saved.coins;
            if (Number.isInteger(saved.free?.stock) && Number.isFinite(saved.free?.at)) this.free = saved.free;
            if (Number.isInteger(saved.gifts) && saved.gifts >= 0) this.gifts = saved.gifts;
            // Les cases ouvertes ne valent que pour le calendrier en cours : un nouveau calendrier repart de zéro.
            const advent = this.rules.advent;
            if (advent && saved.advent?.start === advent.start && Array.isArray(saved.advent.opened)) {
                for (const day of saved.advent.opened) if (Number.isInteger(day) && day >= 1 && day <= advent.boosters.length) this.#advent.add(day);
            }
            if (typeof saved.id === 'string') this.id = saved.id;
            if (typeof saved.name === 'string') this.name = saved.name;
            this.#loadSorting(saved);
        }
    }

    #loadSorting({ favorites, labels, labelled, showcase }) {
        const find = (ids) => (Array.isArray(ids) ? ids.map((id) => this.find(id)).filter(Boolean) : []);
        this.#favorites = new Set(find(favorites));
        if (Array.isArray(labels)) this.labels = labels.filter((label) => typeof label?.id === 'string' && typeof label.name === 'string' && typeof label.color === 'string');
        const known = new Set(this.labels.map(({ id }) => id));
        for (const card of this.cards) {
            const ids = Array.isArray(labelled?.[card.id]) ? labelled[card.id].filter((id) => known.has(id)) : [];
            if (ids.length) this.#labelled.set(card, new Set(ids));
        }
        this.#showcase = find(showcase?.cards);
        if (typeof showcase?.title === 'string') this.showcaseTitle = showcase.title;
    }

    save() {
        this.isFirstVisit = false;
        try {
            localStorage.setItem(this.#key, JSON.stringify({
                owned: Object.fromEntries([...this.#owned].map(([card, count]) => [card.id, count])),
                known: [...this.#known].map((card) => card.id),
                coins: this.coins,
                free: this.free,
                gifts: this.gifts,
                advent: this.rules.advent ? { start: this.rules.advent.start, opened: [...this.#advent] } : undefined,
                id: this.id,
                name: this.name,
                favorites: [...this.#favorites].map((card) => card.id),
                labels: this.labels,
                labelled: Object.fromEntries([...this.#labelled].map(([card, ids]) => [card.id, [...ids]])),
                showcase: { title: this.showcaseTitle, cards: this.#showcase.map((card) => card.id) },
            }));
        } catch {
            // Même cas que dans load().
        }
    }

    /** Vrai si cette clé de stockage est celle de la sauvegarde (changement fait dans un autre onglet). */
    owns(key) {
        return key === this.#key;
    }

    reset() {
        try {
            localStorage.removeItem(this.#key);
        } catch {
            // Même cas que dans load().
        }
        this.load();
        this.save();
    }

    // --- Cartes ---

    find(id) {
        return this.cards.find((card) => card.id === id);
    }

    count(card) {
        return this.#owned.get(card) ?? 0;
    }

    has(card) {
        return this.count(card) > 0;
    }

    /** Exemplaires en double : on garde toujours le premier. */
    spare(card) {
        return Math.max(this.count(card) - 1, 0);
    }

    get discovered() {
        return this.#owned.size;
    }

    get isComplete() {
        return this.discovered === this.cards.length;
    }

    #give(card) {
        this.#owned.set(card, this.count(card) + 1);
        this.#known.add(card);
    }

    #take(card) {
        if (this.count(card) > 1) this.#owned.set(card, this.count(card) - 1);
        else this.#owned.delete(card);
    }

    /** Ajoute des cartes ; une carte découverte pour la première fois rapporte une prime. Renvoie [{ card, isNew, reward }]. */
    receive(cards) {
        const results = cards.map((card) => {
            const isNew = !this.has(card);
            const reward = this.#known.has(card) ? 0 : card.rarity.reward;
            this.#give(card);
            this.coins += reward;
            return { card, isNew, reward };
        });
        this.save();
        return results;
    }

    revealAll() {
        for (const card of this.cards) if (!this.has(card)) this.#give(card);
        this.save();
    }

    // --- Boosters ---

    /** Recharge les boosters gratuits écoulés depuis la dernière fois. */
    #refill() {
        const { every, max } = this.rules.economy.freeBooster;
        const period = every * 60_000;
        const now = this.#now();
        if (this.free.at > now) this.free.at = now; // horloge de l'ordinateur reculée
        const gained = Math.floor((now - this.free.at) / period);
        if (this.free.stock + gained >= max) this.free = { stock: Math.max(this.free.stock, max), at: now };
        else if (gained > 0) this.free = { stock: this.free.stock + gained, at: this.free.at + gained * period };
    }

    /** Boosters qui s'ouvrent sans payer : gratuits et offerts. */
    get freeBoosters() {
        this.#refill();
        return this.free.stock + this.gifts;
    }

    /** Millisecondes avant le prochain booster gratuit, 0 si la réserve est pleine. */
    get nextFreeIn() {
        this.#refill();
        const { every, max } = this.rules.economy.freeBooster;
        return this.free.stock >= max ? 0 : this.free.at + every * 60_000 - this.#now();
    }

    get canOpenBooster() {
        return this.freeBoosters > 0 || this.coins >= this.rules.economy.boosterPrice;
    }

    /**
     * Paie un booster : gratuit d'abord (sa réserve est plafonnée, l'entamer relance la recharge),
     * puis offert, puis en pièces. Renvoie false si c'est impossible.
     */
    payBooster() {
        if (!this.canOpenBooster) return false;
        if (this.free.stock > 0) this.free = { ...this.free, stock: this.free.stock - 1 };
        else if (this.gifts > 0) this.gifts--;
        else this.coins -= this.rules.economy.boosterPrice;
        this.save();
        return true;
    }

    // --- Calendrier de l'Avent ---

    /** Cases du calendrier, avec leur état : voir calendar.js. Vide si le thème n'a pas de calendrier. */
    get adventDays() {
        return adventDays(this.rules.advent, this.#now(), this.#advent);
    }

    /** 'none', 'soon', 'open' ou 'over' : voir calendar.js. */
    get adventStatus() {
        return adventStatus(this.rules.advent, this.#now());
    }

    /** Ouvre une case, si son jour est venu et qu'elle ne l'a pas déjà été. Renvoie le nombre de boosters reçus, 0 sinon. */
    openAdvent(day) {
        const box = this.adventDays.find((other) => other.day === day);
        if (!box?.canOpen) return 0;
        this.#advent.add(day);
        this.gifts += box.boosters;
        this.save();
        return box.boosters;
    }

    // --- Revente ---

    sellPrice(card) {
        return card.rarity.sell;
    }

    /** Vend jusqu'à amount doubles d'une carte. Renvoie les pièces gagnées. */
    sell(card, amount = 1) {
        const sold = Math.min(amount, this.spare(card));
        for (let i = 0; i < sold; i++) this.#take(card);
        const earned = sold * this.sellPrice(card);
        this.coins += earned;
        this.save();
        return earned;
    }

    /** Valeur de tous les doubles. */
    get spareValue() {
        return this.cards.reduce((sum, card) => sum + this.spare(card) * this.sellPrice(card), 0);
    }

    sellAllSpares() {
        return this.cards.reduce((sum, card) => sum + this.sell(card, this.spare(card)), 0);
    }

    setName(name) {
        this.name = name.trim().slice(0, NAME_LENGTH);
        this.save();
    }

    // --- Favoris et étiquettes ---

    isFavorite(card) {
        return this.#favorites.has(card);
    }

    toggleFavorite(card) {
        if (!this.#favorites.delete(card)) this.#favorites.add(card);
        this.save();
    }

    hasLabel(card, label) {
        return this.#labelled.get(card)?.has(label.id) ?? false;
    }

    toggleLabel(card, label) {
        const ids = this.#labelled.get(card) ?? new Set();
        if (!ids.delete(label.id)) ids.add(label.id);
        if (ids.size) this.#labelled.set(card, ids);
        else this.#labelled.delete(card);
        this.save();
    }

    /** Crée une étiquette, ou renvoie celle qui porte déjà ce nom. Renvoie null si le nom est vide ou s'il y en a trop. */
    addLabel(input, color) {
        const name = input.trim().slice(0, LABEL_LENGTH);
        const existing = this.labels.find((label) => label.name.toLowerCase() === name.toLowerCase());
        if (existing) return existing;
        if (!name || this.labels.length >= MAX_LABELS) return null;
        const label = { id: `${this.#now().toString(36)}${this.labels.length}`, name, color };
        this.labels.push(label);
        this.save();
        return label;
    }

    renameLabel(label, input) {
        const name = input.trim().slice(0, LABEL_LENGTH);
        const isTaken = this.labels.some((other) => other !== label && other.name.toLowerCase() === name.toLowerCase());
        if (!name || isTaken) return;
        label.name = name;
        this.save();
    }

    removeLabel(label) {
        this.labels = this.labels.filter((other) => other !== label);
        for (const [card, ids] of this.#labelled) {
            ids.delete(label.id);
            if (!ids.size) this.#labelled.delete(card);
        }
        this.save();
    }

    // --- Vitrine ---

    /** Une carte échangée quitte la vitrine, et y revient si on la récupère. */
    get showcase() {
        return { title: this.showcaseTitle, cards: this.#showcase.filter((card) => this.has(card)) };
    }

    isInShowcase(card) {
        return this.showcase.cards.includes(card);
    }

    setShowcaseTitle(title) {
        this.showcaseTitle = title.trim().slice(0, TITLE_LENGTH);
        this.save();
    }

    /** Ajoute une carte, s'il reste une place, ou la retire. */
    toggleShowcase(card) {
        const { cards } = this.showcase;
        if (cards.includes(card)) this.#showcase = cards.filter((other) => other !== card);
        else if (this.has(card) && cards.length < this.rules.showcase.size) this.#showcase = [...cards, card];
        this.save();
    }

    moveInShowcase(card, index) {
        const others = this.showcase.cards.filter((other) => other !== card);
        others.splice(Math.min(Math.max(index, 0), others.length), 0, card);
        this.#showcase = others;
        this.save();
    }

    // --- Échanges (voir trade.js) ---

    canTrade(card) {
        return this.rules.trade.allowLastCopy ? this.has(card) : this.spare(card) > 0;
    }

    /** Échange deux offres { card, coins } ; card peut être null. Renvoie { card, isNew, reward } pour la carte reçue, ou null. */
    trade(given, received) {
        if (given.card) this.#take(given.card);
        this.coins = Math.max(this.coins - given.coins, 0) + received.coins;
        const [result = null] = this.receive(received.card ? [received.card] : []);
        return result;
    }
}
