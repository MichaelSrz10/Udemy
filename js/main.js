/**
 * MelodIA - Bootstrap Principal de la Aplicación
 * Orquesta la carga de datos y el montaje de los componentes UI.
 */

import { dataService } from './services/dataService.js';
import { themeService } from './services/themeService.js';
import { Sidebar } from './components/Sidebar.js';
import { Navbar } from './components/Navbar.js';
import { ViewManager } from './core/viewManager.js';
import { PlayerBar } from './components/PlayerBar.js';
import { LyricsModal } from './components/LyricsModal.js';
import { ChatWidget } from './components/ChatWidget.js';

async function bootstrap() {
  try {
    // 1. Cargar datos JSON en paralelo
    const [navigationData, catalogData] = await Promise.all([
      dataService.getNavigation(),
      dataService.getCatalog()
    ]);

    // 2. Inicializar componentes estructurales
    const sidebarEl = document.querySelector('#sidebar-root');
    const headerEl = document.querySelector('#header-root');
    const mainContentEl = document.querySelector('#main-scroll-content');
    const playerEl = document.querySelector('#player-root');
    const modalEl = document.querySelector('#modal-root');
    const chatEl = document.querySelector('#chat-root');

    if (sidebarEl) new Sidebar(sidebarEl, navigationData);
    if (headerEl) new Navbar(headerEl, navigationData);
    if (mainContentEl) new ViewManager(mainContentEl, catalogData, navigationData);
    if (playerEl) new PlayerBar(playerEl, catalogData);
    if (modalEl) new LyricsModal(modalEl, catalogData);
    if (chatEl) new ChatWidget(chatEl);

    console.log('✅ MelodIA cargada exitosamente.');
  } catch (error) {
    console.error('Error iniciando la plataforma MelodIA:', error);
    const mainContentEl = document.querySelector('#main-scroll-content');
    if (mainContentEl) {
      mainContentEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title">Error al inicializar la plataforma</div>
          <div class="empty-state-desc">No se pudieron cargar los archivos de datos. Asegúrate de ejecutar la app mediante un servidor HTTP local (ej: <code>node server/proxy.js</code>).</div>
        </div>
      `;
    }
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
