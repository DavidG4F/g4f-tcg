// Décor de Noël, entre deux dates du thème : neige en arrière-plan et guirlande lumineuse sous la bannière.
// Purement décoratif : rien n'est cliquable, rien n'est lu par les lecteurs d'écran.
import { el, reducedMotion } from './card.js';

const FLAKES = 42;
const BULBS = 80; // assez pour les écrans larges ; le surplus est coupé

/** Ajoute le décor. banner : la bannière du haut, qui porte la guirlande. */
export function addChristmas(banner) {
    document.documentElement.classList.add('is-christmas');

    const lights = el('div', 'lights');
    lights.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < BULBS; i++) {
        const bulb = el('span', 'lights__bulb');
        bulb.style.setProperty('--i', i);
        lights.append(bulb);
    }
    banner.append(lights);

    if (reducedMotion()) return; // pas de neige qui bouge
    const snow = el('div', 'snow');
    snow.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < FLAKES; i++) {
        const flake = el('span', 'snow__flake');
        const size = 2 + Math.random() * 4;
        flake.style.cssText = [
            `left:${Math.random() * 100}%`,
            `width:${size}px`,
            `height:${size}px`,
            `opacity:${0.25 + Math.random() * 0.5}`,
            `--drift:${Math.round(Math.random() * 80 - 40)}px`,
            `animation-duration:${12 + Math.random() * 14}s`,
            `animation-delay:${-Math.random() * 26}s`, // déjà en train de tomber à l'arrivée
        ].join(';');
        snow.append(flake);
    }
    document.body.prepend(snow);
}
