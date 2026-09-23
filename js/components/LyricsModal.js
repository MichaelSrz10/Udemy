/**
 * MelodIA - LyricsModal Component
 * Modal interactivo con pestañas de "Letra de Canción" y "Biografía y Reseña del Artista"
 */

import { createElement } from '../utils/domHelpers.js';
import { eventBus } from '../core/eventBus.js';
import { state } from '../core/state.js';

export class LyricsModal {
  constructor(containerElement, catalog) {
    this.container = containerElement;
    this.catalog = catalog;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay" id="lyrics-modal-overlay">
        <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-song-title">
          
          <!-- Encabezado del modal -->
          <div class="modal-header">
            <div class="modal-track-summary">
              <div class="modal-cover">
                <img id="modal-cover-img" src="assets/images/covers/song_001.svg" alt="Portada" />
              </div>
              <div>
                <h3 class="modal-title" id="modal-song-title">Título de la Canción</h3>
                <div class="modal-artist" id="modal-artist-name">Artista • Álbum (Año)</div>
              </div>
            </div>
            <button class="modal-close-btn" id="modal-close-btn" title="Cerrar modal (Esc)" aria-label="Cerrar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Pestañas -->
          <div class="modal-tabs">
            <button class="modal-tab-btn active" data-tab="lyrics">Letra de la Canción</button>
            <button class="modal-tab-btn" data-tab="bio">Reseña del Artista</button>
          </div>

          <!-- Cuerpo -->
          <div class="modal-body">
            <!-- Pestaña Letra -->
            <div class="modal-tab-pane active" id="pane-lyrics">
              <div class="lyrics-text" id="modal-lyrics-text">Cargando letra...</div>
            </div>

            <!-- Pestaña Biografía -->
            <div class="modal-tab-pane" id="pane-bio">
              <div class="artist-bio-view">
                <div class="artist-bio-header">
                  <div class="artist-bio-avatar">
                    <img id="modal-artist-img" src="assets/images/artists/art_001.svg" alt="Artista" />
                  </div>
                  <div>
                    <div class="artist-bio-name" id="modal-bio-name">Nombre Artista</div>
                    <div class="artist-bio-genre" id="modal-bio-genre">Género musical</div>
                    <div class="artist-bio-listeners" id="modal-bio-listeners">1.000.000 oyentes</div>
                  </div>
                </div>
                <p class="artist-bio-desc" id="modal-bio-text">Biografía del artista...</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  bindEvents() {
    const overlay = this.container.querySelector('#lyrics-modal-overlay');
    const closeBtn = this.container.querySelector('#modal-close-btn');
    const tabBtns = this.container.querySelectorAll('.modal-tab-btn');

    // Cerrar con botón o clic fuera
    closeBtn.addEventListener('click', () => this.close());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    // Cerrar con tecla Esc
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        this.close();
      }
    });

    // Cambiar pestañas
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetTab = btn.getAttribute('data-tab');
        const panes = this.container.querySelectorAll('.modal-tab-pane');
        panes.forEach(pane => pane.classList.remove('active'));

        const activePane = this.container.querySelector(`#pane-${targetTab}`);
        if (activePane) activePane.classList.add('active');
      });
    });

    // Evento para abrir modal
    eventBus.on('modal:open-lyrics', ({ song, artist }) => {
      this.openWithData(song, artist);
    });
  }

  openWithData(song, artist) {
    if (!song) return;

    const overlay = this.container.querySelector('#lyrics-modal-overlay');
    const coverImg = this.container.querySelector('#modal-cover-img');
    const titleEl = this.container.querySelector('#modal-song-title');
    const artistNameEl = this.container.querySelector('#modal-artist-name');
    const lyricsTextEl = this.container.querySelector('#modal-lyrics-text');

    // Datos del artista
    const art = artist || (this.catalog.artists || []).find(a => a.id === song.artistId) || {};
    const artistImg = this.container.querySelector('#modal-artist-img');
    const bioNameEl = this.container.querySelector('#modal-bio-name');
    const bioGenreEl = this.container.querySelector('#modal-bio-genre');
    const bioListenersEl = this.container.querySelector('#modal-bio-listeners');
    const bioTextEl = this.container.querySelector('#modal-bio-text');

    coverImg.src = song.cover || 'assets/images/covers/song_001.svg';
    titleEl.textContent = song.title;
    artistNameEl.textContent = `${art.name || 'Artista'} • ${song.album || 'Sencillo'} (${song.releaseYear || 2024})`;
    lyricsTextEl.textContent = song.lyrics || 'Letra no disponible para esta pista.';

    artistImg.src = art.image || 'assets/images/artists/art_001.svg';
    bioNameEl.textContent = art.name || 'Artista';
    bioGenreEl.textContent = art.genre || 'Varios géneros';
    bioListenersEl.textContent = art.monthlyListeners || 'Artista de MelodIA';
    bioTextEl.textContent = art.bio || 'Información de biografía en actualización.';

    overlay.classList.add('active');
    state.set('isLyricsModalOpen', true);
  }

  close() {
    const overlay = this.container.querySelector('#lyrics-modal-overlay');
    overlay.classList.remove('active');
    state.set('isLyricsModalOpen', false);
  }
}
