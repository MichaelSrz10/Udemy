/**
 * MelodIA - ViewManager (Enrutador de SPA)
 * Controla qué vista se visualiza en el área principal según site-navigation.json
 */

import { eventBus } from './eventBus.js';
import { state } from './state.js';
import { 
  renderHomeView, 
  renderArtistsView, 
  renderSearchResultsView, 
  renderLibraryView 
} from '../components/CatalogGrid.js';

export class ViewManager {
  constructor(mainContainerElement, catalogData, navigationData) {
    this.container = mainContainerElement;
    this.catalog = catalogData;
    this.navigation = navigationData;
    this.currentView = 'home';

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    eventBus.on('view:navigate', ({ view }) => {
      this.currentView = view;
      state.set('activeView', view);
      this.render();
    });

    eventBus.on('filter:change', ({ filter }) => {
      state.set('activeFilter', filter);
      this.render();
    });

    eventBus.on('search:query', ({ query }) => {
      if (this.currentView !== 'search') {
        this.currentView = 'search';
        state.set('activeView', 'search');
      }
      this.render();
    });

    eventBus.on('catalog:filter-by-artist', ({ artist }) => {
      this.currentView = 'search';
      state.set('activeView', 'search');
      state.set('searchQuery', artist.name);
      
      const searchInput = document.querySelector('#header-search-input');
      if (searchInput) searchInput.value = artist.name;

      this.render();
    });
  }

  render() {
    this.container.innerHTML = '';
    const activeFilter = state.get('activeFilter') || 'all';
    const searchQuery = state.get('searchQuery') || '';

    // Renderizar chips de filtro rápido solo en Home
    if (this.currentView === 'home' && this.navigation.quickFilters) {
      const filtersWrap = document.createElement('div');
      filtersWrap.className = 'header-quick-filters';

      this.navigation.quickFilters.forEach(f => {
        const chip = document.createElement('button');
        chip.className = `filter-chip ${f.id === activeFilter ? 'active' : ''}`;
        chip.textContent = f.label;
        chip.addEventListener('click', () => {
          eventBus.emit('filter:change', { filter: f.id });
        });
        filtersWrap.appendChild(chip);
      });

      this.container.appendChild(filtersWrap);
    }

    // Renderizar vista correspondiente
    switch (this.currentView) {
      case 'home':
        this.container.appendChild(renderHomeView(this.catalog, activeFilter));
        break;
      case 'artists':
        this.container.appendChild(renderArtistsView(this.catalog));
        break;
      case 'search':
        this.container.appendChild(renderSearchResultsView(this.catalog, searchQuery));
        break;
      case 'library':
        this.container.appendChild(renderLibraryView(this.catalog));
        break;
      default:
        this.container.appendChild(renderHomeView(this.catalog, activeFilter));
    }
  }
}
