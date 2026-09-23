/**
 * MelodIA - Sidebar Component
 * Renderiza el menú de navegación lateral dinámicamente desde site-navigation.json
 */

import { createElement } from '../utils/domHelpers.js';
import { eventBus } from '../core/eventBus.js';
import { state } from '../core/state.js';

// SVG Iconos de navegación
const ICONS = {
  home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  search: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  mic: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  library: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>`
};

export class Sidebar {
  constructor(containerElement, navigationData) {
    this.container = containerElement;
    this.navigationData = navigationData;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = '';

    // 1. Logo
    const logoDiv = createElement('div', 'sidebar-logo');
    logoDiv.innerHTML = `
      <div class="sidebar-logo-icon">
        <svg viewBox="0 0 40 40" width="32" height="32">
          <circle cx="20" cy="20" r="18" fill="#1DB954" />
          <path d="M12 25 C16 23, 24 23, 28 25.5" stroke="#121212" stroke-width="2.8" stroke-linecap="round" fill="none" />
          <path d="M10.5 20 C16 17.5, 24 17.5, 29.5 20.5" stroke="#121212" stroke-width="3.2" stroke-linecap="round" fill="none" />
          <path d="M9 15 C15.5 12, 25 12, 31 15.5" stroke="#121212" stroke-width="3.6" stroke-linecap="round" fill="none" />
        </svg>
      </div>
      <span>${this.navigationData.app?.name || 'MelodIA'}</span>
    `;
    logoDiv.style.cursor = 'pointer';
    logoDiv.addEventListener('click', () => {
      eventBus.emit('view:navigate', { view: 'home' });
    });
    this.container.appendChild(logoDiv);

    // 2. Elementos de Navegación
    const nav = createElement('nav', 'sidebar-nav');
    const activeView = state.get('activeView') || 'home';

    (this.navigationData.navigation || []).forEach(item => {
      const navItem = createElement('div', `sidebar-nav-item ${item.view === activeView ? 'active' : ''}`, {
        'data-view': item.view,
        'role': 'button',
        'tabindex': '0'
      });

      const iconSVG = ICONS[item.icon] || ICONS.home;
      navItem.innerHTML = `
        <div class="sidebar-nav-icon">${iconSVG}</div>
        <span>${item.label}</span>
      `;

      navItem.addEventListener('click', () => {
        eventBus.emit('view:navigate', { view: item.view });
      });

      nav.appendChild(navItem);
    });

    this.container.appendChild(nav);

    // 3. Divisor y Listas Rápidas
    const divider = createElement('div', 'sidebar-divider');
    this.container.appendChild(divider);

    const sectionTitle = createElement('div', 'sidebar-section-title', {}, 'Playlists sugeridas');
    this.container.appendChild(sectionTitle);

    const playlistContainer = createElement('div', 'sidebar-nav');
    const playlists = [
      { name: 'Lo Mejor de Synthwave', filter: 'recent' },
      { name: 'Acústicos y Raíces', filter: 'featured' },
      { name: 'Favoritos de la Semana', filter: 'all' }
    ];

    playlists.forEach(pl => {
      const plItem = createElement('div', 'sidebar-playlist-item', {}, `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
        </svg>
        <span>${pl.name}</span>
      `);
      plItem.addEventListener('click', () => {
        eventBus.emit('view:navigate', { view: 'home' });
        eventBus.emit('filter:change', { filter: pl.filter });
      });
      playlistContainer.appendChild(plItem);
    });

    this.container.appendChild(playlistContainer);
  }

  bindEvents() {
    eventBus.on('state:activeView', ({ value }) => {
      const items = this.container.querySelectorAll('.sidebar-nav-item');
      items.forEach(item => {
        if (item.getAttribute('data-view') === value) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    });
  }
}
