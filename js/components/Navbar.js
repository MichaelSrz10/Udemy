/**
 * MelodIA - Navbar Component
 * Barra superior con buscador en tiempo real, filtros de categoría y controles de acción
 */

import { createElement } from '../utils/domHelpers.js';
import { eventBus } from '../core/eventBus.js';
import { state } from '../core/state.js';
import { ThemeToggle } from './ThemeToggle.js';

export class Navbar {
  constructor(containerElement, navigationData) {
    this.container = containerElement;
    this.navigationData = navigationData;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="header-search">
        <div class="header-search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <input 
          type="text" 
          id="header-search-input" 
          class="header-search-input" 
          placeholder="¿Qué quieres escuchar hoy? (canción, artista, género...)" 
          aria-label="Buscar música"
        />
      </div>

      <div class="header-actions">
        <button id="nav-chat-shortcut" class="filter-chip" title="Abrir Asistente IA">
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="color:var(--color-primary)">✦</span> Chatbot MelodIA
          </span>
        </button>
        <div id="theme-toggle-slot"></div>
      </div>
    `;

    // Inicializar conmutador de tema
    const themeSlot = this.container.querySelector('#theme-toggle-slot');
    new ThemeToggle(themeSlot);

    // Eventos de búsqueda en tiempo real
    const searchInput = this.container.querySelector('#header-search-input');
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      state.set('searchQuery', query);
      if (query.trim().length > 0 && state.get('activeView') !== 'search') {
        eventBus.emit('view:navigate', { view: 'search' });
      }
      eventBus.emit('search:query', { query });
    });

    // Abrir chat
    const chatBtn = this.container.querySelector('#nav-chat-shortcut');
    chatBtn.addEventListener('click', () => {
      eventBus.emit('chat:toggle');
    });
  }
}
