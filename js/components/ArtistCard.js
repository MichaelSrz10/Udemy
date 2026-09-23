/**
 * MelodIA - ArtistCard Component
 * Renderiza la tarjeta interactiva de un artista con avatar circular
 */

import { createElement } from '../utils/domHelpers.js';
import { eventBus } from '../core/eventBus.js';

export function createArtistCard(artist) {
  const card = createElement('div', 'card artist-card', { 'data-artist-id': artist.id });
  const imgSrc = artist.image || 'assets/images/artists/art_001.svg';

  card.innerHTML = `
    <div class="card-image-wrapper">
      <img src="${imgSrc}" alt="${artist.name}" loading="lazy" />
      <button class="card-play-btn" title="Explorar ${artist.name}" aria-label="Explorar ${artist.name}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </button>
    </div>
    <div class="card-title" title="${artist.name}">${artist.name}</div>
    <div class="card-subtitle">${artist.genre || 'Artista'}</div>
    <div class="card-meta">
      <span>${artist.monthlyListeners || 'Artista destacado'}</span>
    </div>
    <span class="card-badge">Artista</span>
  `;

  card.addEventListener('click', () => {
    eventBus.emit('catalog:filter-by-artist', { artist });
  });

  return card;
}
