/**
 * MelodIA - CatalogGrid Component
 * Renderiza cuadrículas de canciones y artistas agrupadas por secciones
 */

import { createElement } from '../utils/domHelpers.js';
import { createSongCard } from './SongCard.js';
import { createArtistCard } from './ArtistCard.js';

export function renderHomeView(catalog, filter = 'all') {
  const container = createElement('div', 'home-view-container');

  const { songs = [], artists = [] } = catalog;
  const artistMap = new Map(artists.map(a => [a.id, a]));

  // Filtrado rápido
  let filteredSongs = songs;
  if (filter === 'lyrics') {
    filteredSongs = songs.filter(s => s.lyrics && !s.lyrics.includes('Instrumental'));
  }

  // Sección 1: Escuchado recientemente
  const recentSection = createElement('section', 'catalog-section');
  recentSection.innerHTML = `
    <div class="catalog-section-header">
      <h2 class="catalog-section-title">Escuchado recientemente</h2>
    </div>
  `;
  const recentGrid = createElement('div', 'catalog-grid');
  filteredSongs.slice(0, 4).forEach(song => {
    recentGrid.appendChild(createSongCard(song, artistMap.get(song.artistId)));
  });
  recentSection.appendChild(recentGrid);
  container.appendChild(recentSection);

  // Sección 2: Recomendado para ti
  const featuredSection = createElement('section', 'catalog-section');
  featuredSection.innerHTML = `
    <div class="catalog-section-header">
      <h2 class="catalog-section-title">Recomendado para ti</h2>
    </div>
  `;
  const featuredGrid = createElement('div', 'catalog-grid');
  filteredSongs.slice(4, 8).forEach(song => {
    featuredGrid.appendChild(createSongCard(song, artistMap.get(song.artistId)));
  });
  featuredSection.appendChild(featuredGrid);
  container.appendChild(featuredSection);

  // Sección 3: Artistas Destacados
  if (filter !== 'lyrics') {
    const artistsSection = createElement('section', 'catalog-section');
    artistsSection.innerHTML = `
      <div class="catalog-section-header">
        <h2 class="catalog-section-title">Artistas más populares</h2>
      </div>
    `;
    const artistsGrid = createElement('div', 'catalog-grid');
    artists.slice(0, 4).forEach(artist => {
      artistsGrid.appendChild(createArtistCard(artist));
    });
    artistsSection.appendChild(artistsGrid);
    container.appendChild(artistsSection);
  }

  return container;
}

export function renderArtistsView(catalog) {
  const container = createElement('div', 'artists-view-container');
  const section = createElement('section', 'catalog-section');
  section.innerHTML = `
    <div class="catalog-section-header">
      <h2 class="catalog-section-title">Todos los Artistas de MelodIA</h2>
    </div>
  `;
  const grid = createElement('div', 'catalog-grid');
  (catalog.artists || []).forEach(artist => {
    grid.appendChild(createArtistCard(artist));
  });
  section.appendChild(grid);
  container.appendChild(section);
  return container;
}

export function renderSearchResultsView(catalog, query) {
  const container = createElement('div', 'search-view-container');
  const normalizedQuery = (query || '').toLowerCase().trim();

  if (!normalizedQuery) {
    container.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <div class="empty-state-title">Explora todo el catálogo musical</div>
        <div class="empty-state-desc">Busca por nombre de canción, artista, álbum o género en la barra superior.</div>
      </div>
    `;
    return container;
  }

  const artistMap = new Map((catalog.artists || []).map(a => [a.id, a]));

  const matchingSongs = (catalog.songs || []).filter(s => {
    const art = artistMap.get(s.artistId);
    return (
      s.title.toLowerCase().includes(normalizedQuery) ||
      (s.album && s.album.toLowerCase().includes(normalizedQuery)) ||
      (s.genre && s.genre.toLowerCase().includes(normalizedQuery)) ||
      (art && art.name.toLowerCase().includes(normalizedQuery))
    );
  });

  const matchingArtists = (catalog.artists || []).filter(a =>
    a.name.toLowerCase().includes(normalizedQuery) ||
    (a.genre && a.genre.toLowerCase().includes(normalizedQuery))
  );

  if (matchingSongs.length === 0 && matchingArtists.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">No se encontraron resultados para "${query}"</div>
        <div class="empty-state-desc">Intenta buscando con otras palabras clave o pregúntale a nuestro asistente virtual en el chat.</div>
      </div>
    `;
    return container;
  }

  if (matchingSongs.length > 0) {
    const songSection = createElement('section', 'catalog-section');
    songSection.innerHTML = `<h2 class="catalog-section-title">Canciones encontradas</h2>`;
    const songGrid = createElement('div', 'catalog-grid');
    matchingSongs.forEach(s => songGrid.appendChild(createSongCard(s, artistMap.get(s.artistId))));
    songSection.appendChild(songGrid);
    container.appendChild(songSection);
  }

  if (matchingArtists.length > 0) {
    const artSection = createElement('section', 'catalog-section');
    artSection.innerHTML = `<h2 class="catalog-section-title">Artistas encontrados</h2>`;
    const artGrid = createElement('div', 'catalog-grid');
    matchingArtists.forEach(a => artGrid.appendChild(createArtistCard(a)));
    artSection.appendChild(artGrid);
    container.appendChild(artSection);
  }

  return container;
}

export function renderLibraryView(catalog) {
  const container = createElement('div', 'library-view-container');
  const section = createElement('section', 'catalog-section');
  section.innerHTML = `
    <div class="catalog-section-header">
      <h2 class="catalog-section-title">Tu Colección de Favoritos</h2>
    </div>
  `;
  const grid = createElement('div', 'catalog-grid');
  const artistMap = new Map((catalog.artists || []).map(a => [a.id, a]));
  (catalog.songs || []).slice(0, 6).forEach(song => {
    grid.appendChild(createSongCard(song, artistMap.get(song.artistId)));
  });
  section.appendChild(grid);
  container.appendChild(section);
  return container;
}
