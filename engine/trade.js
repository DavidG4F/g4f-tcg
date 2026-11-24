// Déroulement d'un échange entre deux joueurs reliés par un canal (voir room.js). Aucun affichage ici.
//
// Chacun pose une offre (une carte, des pièces ou les deux), puis se déclare prêt. Quand les deux le sont, l'hôte lance
// l'échange (commit), l'invité l'applique et le confirme (done), puis l'hôte l'applique à son tour. Changer son offre
// annule les deux « prêt ».
//
// Les joueurs ne passent par aucun serveur : rien n'empêche l'un d'eux de tricher sur ce qu'il possède.
import { NAME_LENGTH } from './player.js';

const VERSION = 2; // à augmenter quand les messages changent : deux versions différentes ne peuvent pas échanger
const COMMIT_TIMEOUT = 8000;
const MAX_COINS = 1_000_000;

function newId() {
    return [...crypto.getRandomValues(new Uint8Array(9))].map((byte) => byte.toString(36).padStart(2, '0')).join('');
}

const isCoins = (value) => Number.isInteger(value) && value >= 0 && value <= MAX_COINS;

/** Offre telle qu'elle est envoyée : { card: id ou null, coins }. */
const pack = ({ card, coins }) => ({ card: card?.id ?? null, coins });

const isSame = (message, offer) => message?.card === (offer.card?.id ?? null) && message?.coins === offer.coins;

export class TradeSession {
    #channel;
    #player;
    #isHost;
    #events;
    #pending = null; // échange lancé par l'hôte : { id, mine, theirs, timer }, où mine et theirs sont des offres
    #isOver = false;

    /**
     * events : onUpdate() à chaque changement, onRequest(card) quand l'autre demande une carte,
     * onDone({ given, received, result }) après un échange (deux offres, et le résultat de player.trade), onNotice(key) pour un incident sans gravité, onEnd(key) quand tout s'arrête.
     */
    constructor({ player, channel, isHost, events }) {
        this.#player = player;
        this.#channel = channel;
        this.#isHost = isHost;
        this.#events = events;
        this.mine = { card: null, coins: 0, ready: false };
        this.theirs = { card: null, coins: 0, ready: false, name: '', cards: null }; // cards : ce que l'autre peut échanger
        channel.onMessage = (message) => this.#receive(message);
        channel.onClose = () => this.#end('room_error_left');
        channel.send({
            type: 'hello',
            version: VERSION,
            game: player.rules.gameId,
            player: player.id,
            name: player.name,
            cards: this.#tradable,
        });
    }

    /** Vrai quand l'autre joueur s'est présenté. */
    get isOpen() {
        return this.theirs.cards !== null;
    }

    get isCommitting() {
        return this.#pending !== null;
    }

    /** Chacun doit donner quelque chose, et il faut au moins une carte sur la table. */
    get canAgree() {
        const gives = ({ card, coins }) => card !== null || coins > 0;
        return gives(this.mine) && gives(this.theirs) && (this.mine.card !== null || this.theirs.card !== null);
    }

    get #canGive() {
        const { card, coins } = this.mine;
        return (card === null || this.#player.canTrade(card)) && coins <= this.#player.coins;
    }

    get #tradable() {
        return this.#player.cards.filter((card) => this.#player.canTrade(card)).map((card) => card.id);
    }

    // --- Actions du joueur ---

    select(card) {
        if (card && !this.#player.canTrade(card)) return;
        this.#offer({ card, coins: this.mine.coins });
    }

    setCoins(amount) {
        const coins = Math.min(Math.max(Math.trunc(amount) || 0, 0), this.#player.coins, MAX_COINS);
        if (coins !== this.mine.coins) this.#offer({ card: this.mine.card, coins });
    }

    #offer({ card, coins }) {
        if (this.isCommitting) return;
        this.mine = { card, coins, ready: false };
        this.theirs.ready = false;
        this.#channel.send({ type: 'offer', ...pack(this.mine) });
        this.#events.onUpdate();
    }

    /** Demande à l'autre joueur de poser une de ses cartes. */
    request(card) {
        this.#channel.send({ type: 'request', card: card.id });
    }

    setReady(ready) {
        if (this.isCommitting || (ready && !this.canAgree)) return;
        this.mine.ready = ready;
        // Les deux offres sont rappelées : l'accord ne vaut que pour cet échange précis.
        this.#channel.send({ type: 'ready', ready, give: pack(this.mine), get: pack(this.theirs) });
        this.#tryCommit();
        this.#events.onUpdate();
    }

    /** La collection a changé (vente dans un autre onglet…). */
    refresh() {
        if (!this.#canGive) this.#offer({ card: null, coins: 0 });
        this.#channel.send({ type: 'cards', cards: this.#tradable });
    }

    leave() {
        this.#isOver = true;
        clearTimeout(this.#pending?.timer);
        this.#channel.close();
    }

    // --- Messages de l'autre joueur ---

    #receive(message) {
        if (this.#isOver) return;
        const { type } = message;
        if (type === 'full') this.#end('room_error_full');
        else if (type === 'hello') this.#welcome(message);
        else if (!this.isOpen) return; // pas encore présenté
        else if (type === 'cards') this.#setCards(message.cards);
        else if (type === 'offer') this.#theirOffer(message);
        else if (type === 'request') this.#theirRequest(message.card);
        else if (type === 'ready') this.#theirReady(message);
        else if (type === 'commit') this.#applyCommit(message);
        else if (type === 'done') this.#finish(message.id);
        else if (type === 'abort') this.#abort();
        else return;
        if (!this.#isOver) this.#events.onUpdate();
    }

    #welcome({ version, game, player, name, cards }) {
        if (version !== VERSION) this.#end('room_error_version');
        else if (game !== this.#player.rules.gameId) this.#end('room_error_game');
        else if (player === this.#player.id) this.#end('room_error_self');
        else {
            this.theirs.name = String(name ?? '').slice(0, NAME_LENGTH);
            this.#setCards(cards);
        }
    }

    #setCards(ids) {
        this.theirs.cards = Array.isArray(ids) ? this.#player.cards.filter((card) => ids.includes(card.id)) : [];
    }

    #theirOffer({ card, coins }) {
        if (this.isCommitting) return;
        this.theirs.card = this.#player.find(card) ?? null;
        this.theirs.coins = isCoins(coins) ? coins : 0;
        this.theirs.ready = false;
        this.mine.ready = false;
    }

    #theirRequest(id) {
        const card = this.#player.find(id);
        if (card && this.#player.canTrade(card)) this.#events.onRequest(card);
    }

    #theirReady({ ready, give, get }) {
        if (this.isCommitting) return;
        this.theirs.ready = ready === true && this.canAgree && isSame(give, this.theirs) && isSame(get, this.mine);
        this.#tryCommit();
    }

    // --- Échange ---

    #tryCommit() {
        if (!this.#isHost || this.isCommitting || !this.mine.ready || !this.theirs.ready) return;
        if (!this.#canGive) {
            this.#offer({ card: null, coins: 0 });
            return;
        }
        const mine = { card: this.mine.card, coins: this.mine.coins };
        const theirs = { card: this.theirs.card, coins: this.theirs.coins };
        const id = newId();
        const timer = setTimeout(() => this.#end('room_error_left'), COMMIT_TIMEOUT);
        this.#pending = { id, mine, theirs, timer };
        this.#channel.send({ type: 'commit', id, give: pack(mine), get: pack(theirs) });
    }

    /** Côté invité. */
    #applyCommit({ id, give, get }) {
        const { mine, theirs } = this;
        const isAgreed = !this.#isHost && mine.ready && this.canAgree && isSame(give, theirs) && isSame(get, mine) && this.#canGive;
        if (!isAgreed) {
            this.#channel.send({ type: 'abort' });
            this.#abort();
            return;
        }
        this.#channel.send({ type: 'done', id });
        this.#swap({ card: mine.card, coins: mine.coins }, { card: theirs.card, coins: theirs.coins });
    }

    /** Côté hôte. */
    #finish(id) {
        if (!this.#pending || this.#pending.id !== id) return;
        const { mine, theirs, timer } = this.#pending;
        clearTimeout(timer);
        this.#pending = null;
        this.#swap(mine, theirs);
    }

    #swap(given, received) {
        const result = this.#player.trade(given, received);
        this.mine = { card: null, coins: 0, ready: false };
        Object.assign(this.theirs, { card: null, coins: 0, ready: false });
        this.#events.onDone({ given, received, result });
        this.refresh();
    }

    #abort() {
        clearTimeout(this.#pending?.timer);
        this.#pending = null;
        this.mine.ready = false;
        this.theirs.ready = false;
        this.#events.onNotice('trade_aborted');
    }

    #end(key) {
        if (this.#isOver) return;
        this.leave();
        this.#events.onEnd(key);
    }
}
