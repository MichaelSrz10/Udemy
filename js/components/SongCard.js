/**
 * MelodIA - SongCard Component
 * Renderiza la tarjeta interactiva de una canción
 */

import { createElement } from '../utils/domHelpers.js';
import { eventBus } from '../core/eventBus.js';

export function createSongCard(song, artist) {
  const card = createElement('div', 'card song-card', { 'data-song-id': song.id });

  const artistName = artist ? artist.name : 'Artista';
  const coverSrc = song.cover || 'assets/images/covers/song_001.svg';

  card.innerHTML = `
    <div class="card-image-wrapper">
      <img src="${coverSrc}" alt="${song.title}" loading="lazy" />
      <button class="card-play-btn" title="Reproducir ${song.title}" aria-label="Reproducir ${song.title}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </button>
    </div>
    <div class="card-title" title="${song.title}">${song.title}</div>
    <div class="card-subtitle" title="${artistName}">${artistName}</div>
    <div class="card-meta">
      <span>${song.album || 'Sencillo'}</span>
      <span>${song.duration}</span>
    </div>
    <span class="card-badge">${song.genre || 'Música'}</span>
  `;

  // Clic en el botón Play dentro de la tarjeta
  const playBtn = card.querySelector('.card-play-btn');
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    eventBus.emit('player:play-song', { song, artist });
  });

  // Clic general en la tarjeta abre el modal de letras y reseña
  card.addEventListener('click', () => {
    eventBus.emit('modal:open-lyrics', { song, artist });
  });

  return card;
}
