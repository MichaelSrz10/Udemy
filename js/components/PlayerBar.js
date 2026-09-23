/**
 * MelodIA - PlayerBar Component
 * Barra de reproducción interactiva estilo Spotify con barra de progreso, control de volumen y sincronización de estado.
 */

import { createElement } from '../utils/domHelpers.js';
import { eventBus } from '../core/eventBus.js';
import { state } from '../core/state.js';
import { formatSecondsToTime, parseTimeToSeconds } from '../utils/formatters.js';

export class PlayerBar {
  constructor(containerElement, catalog) {
    this.container = containerElement;
    this.catalog = catalog;
    this.timer = null;
    this.render();
    this.bindEvents();
    this.initDefaultTrack();
  }

  initDefaultTrack() {
    if (!state.get('currentSong') && this.catalog.songs?.length) {
      const firstSong = this.catalog.songs[0];
      const artist = (this.catalog.artists || []).find(a => a.id === firstSong.artistId);
      this.updateTrackInfo(firstSong, artist);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="player-bar-container">
        <!-- Pista actual -->
        <div class="player-track-info">
          <div class="player-cover" id="player-cover-wrap">
            <img src="assets/images/covers/song_001.svg" alt="Portada" id="player-cover-img" />
          </div>
          <div class="player-details">
            <div class="player-title" id="player-track-title">Selecciona una canción</div>
            <div class="player-artist" id="player-track-artist">MelodIA</div>
          </div>
        </div>

        <!-- Centro: Controles de reproducción -->
        <div class="player-center">
          <div class="player-controls">
            <button class="control-btn" id="btn-shuffle" title="Aleatorio">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
            </button>
            <button class="control-btn" id="btn-prev" title="Anterior">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="19,20 9,12 19,4"/><line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" stroke-width="2"/></svg>
            </button>
            <button class="control-btn play-main" id="btn-play-pause" title="Reproducir">
              <svg id="icon-play" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>
              <svg id="icon-pause" class="d-none" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
            <button class="control-btn" id="btn-next" title="Siguiente">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,4 15,12 5,20"/><line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" stroke-width="2"/></svg>
            </button>
            <button class="control-btn" id="btn-repeat" title="Repetir">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            </button>
          </div>

          <!-- Barra de Progreso -->
          <div class="player-progress-bar-wrap">
            <span class="player-time" id="player-current-time">0:00</span>
            <div class="progress-slider-container" id="player-progress-track">
              <div class="progress-slider-fill" id="player-progress-fill">
                <div class="progress-slider-handle"></div>
              </div>
            </div>
            <span class="player-time" id="player-total-time">3:42</span>
          </div>
        </div>

        <!-- Derecha: Letra y Control de Volumen -->
        <div class="player-right">
          <button class="player-extra-btn" id="btn-lyrics-modal" title="Ver Letra y Biografía">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
          </button>
          <div class="volume-container">
            <button class="control-btn" id="btn-volume-mute" title="Silenciar">
              <svg id="icon-vol-high" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <svg id="icon-vol-mute" class="d-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
            </button>
            <input type="range" class="volume-slider" id="player-volume-slider" min="0" max="100" value="80" aria-label="Control de volumen" />
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const playPauseBtn = this.container.querySelector('#btn-play-pause');
    const prevBtn = this.container.querySelector('#btn-prev');
    const nextBtn = this.container.querySelector('#btn-next');
    const lyricsBtn = this.container.querySelector('#btn-lyrics-modal');
    const trackTitle = this.container.querySelector('#player-track-title');
    const trackArtist = this.container.querySelector('#player-track-artist');
    const progressTrack = this.container.querySelector('#player-progress-track');
    const volSlider = this.container.querySelector('#player-volume-slider');
    const volMuteBtn = this.container.querySelector('#btn-volume-mute');

    playPauseBtn.addEventListener('click', () => {
      this.togglePlayPause();
    });

    prevBtn.addEventListener('click', () => {
      this.playAdjacentSong(-1);
    });

    nextBtn.addEventListener('click', () => {
      this.playAdjacentSong(1);
    });

    lyricsBtn.addEventListener('click', () => {
      const current = state.get('currentSong');
      if (current) {
        const artist = (this.catalog.artists || []).find(a => a.id === current.artistId);
        eventBus.emit('modal:open-lyrics', { song: current, artist });
      }
    });

    trackTitle.addEventListener('click', () => lyricsBtn.click());
    trackArtist.addEventListener('click', () => lyricsBtn.click());

    // Clic en la barra de progreso para saltar
    progressTrack.addEventListener('click', (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      const currentSong = state.get('currentSong');
      const totalSecs = currentSong ? parseTimeToSeconds(currentSong.duration) : 220;
      const newSecs = Math.floor(ratio * totalSecs);

      state.set('playbackSeconds', newSecs);
      this.updateProgressUI(newSecs, totalSecs);
    });

    // Control de volumen
    volSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10) / 100;
      state.set('volume', val);
      state.set('isMuted', val === 0);
      this.updateVolumeIcons(val === 0);
    });

    volMuteBtn.addEventListener('click', () => {
      const isMuted = !state.get('isMuted');
      state.set('isMuted', isMuted);
      volSlider.value = isMuted ? 0 : 80;
      this.updateVolumeIcons(isMuted);
    });

    // Eventos globales desde EventBus
    eventBus.on('player:play-song', ({ song, artist }) => {
      this.updateTrackInfo(song, artist);
      this.startPlayback();
    });
  }

  updateTrackInfo(song, artist) {
    state.set('currentSong', song);
    state.set('playbackSeconds', 0);

    const coverImg = this.container.querySelector('#player-cover-img');
    const titleEl = this.container.querySelector('#player-track-title');
    const artistEl = this.container.querySelector('#player-track-artist');
    const totalTimeEl = this.container.querySelector('#player-total-time');

    coverImg.src = song.cover || 'assets/images/covers/song_001.svg';
    coverImg.alt = song.title;
    titleEl.textContent = song.title;
    artistEl.textContent = artist ? artist.name : 'Artista';
    totalTimeEl.textContent = song.duration || '3:30';

    this.updateProgressUI(0, parseTimeToSeconds(song.duration));
  }

  togglePlayPause() {
    const isPlaying = state.get('isPlaying');
    if (isPlaying) {
      this.pausePlayback();
    } else {
      this.startPlayback();
    }
  }

  startPlayback() {
    state.set('isPlaying', true);
    this.container.querySelector('#icon-play').classList.add('d-none');
    this.container.querySelector('#icon-pause').classList.remove('d-none');

    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      const currentSong = state.get('currentSong');
      const totalSecs = currentSong ? parseTimeToSeconds(currentSong.duration) : 220;
      let secs = state.get('playbackSeconds') + 1;

      if (secs > totalSecs) {
        secs = 0;
        this.playAdjacentSong(1);
      }

      state.set('playbackSeconds', secs);
      this.updateProgressUI(secs, totalSecs);
    }, 1000);
  }

  pausePlayback() {
    state.set('isPlaying', false);
    this.container.querySelector('#icon-play').classList.remove('d-none');
    this.container.querySelector('#icon-pause').classList.add('d-none');

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateProgressUI(currentSecs, totalSecs) {
    const timeEl = this.container.querySelector('#player-current-time');
    const fillEl = this.container.querySelector('#player-progress-fill');

    timeEl.textContent = formatSecondsToTime(currentSecs);
    const pct = totalSecs > 0 ? (currentSecs / totalSecs) * 100 : 0;
    fillEl.style.width = `${Math.min(100, pct)}%`;
  }

  updateVolumeIcons(isMuted) {
    const iconHigh = this.container.querySelector('#icon-vol-high');
    const iconMute = this.container.querySelector('#icon-vol-mute');
    if (isMuted) {
      iconHigh.classList.add('d-none');
      iconMute.classList.remove('d-none');
    } else {
      iconHigh.classList.remove('d-none');
      iconMute.classList.add('d-none');
    }
  }

  playAdjacentSong(delta) {
    const songs = this.catalog.songs || [];
    if (!songs.length) return;

    const current = state.get('currentSong');
    let currentIndex = current ? songs.findIndex(s => s.id === current.id) : 0;
    let nextIndex = (currentIndex + delta + songs.length) % songs.length;

    const nextSong = songs[nextIndex];
    const artist = (this.catalog.artists || []).find(a => a.id === nextSong.artistId);
    this.updateTrackInfo(nextSong, artist);
    this.startPlayback();
  }
}
