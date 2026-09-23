/**
 * MelodIA - ChatWidget Component
 * Contenedor del widget flotante del chatbot con asistente Gemini 2.5 Flash y RAG sobre JSON.
 */

import { createElement } from '../utils/domHelpers.js';
import { eventBus } from '../core/eventBus.js';
import { state } from '../core/state.js';
import { geminiService } from '../services/geminiService.js';
import { ChatMessageList } from './ChatMessageList.js';
import { ChatInput } from './ChatInput.js';

export class ChatWidget {
  constructor(containerElement) {
    this.container = containerElement;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <!-- Botón Flotante (FAB) -->
      <button class="chat-fab-btn" id="chat-fab-btn" title="Abrir Asistente IA MelodIA" aria-label="Abrir chat">
        <svg id="fab-chat-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      <!-- Panel Dock del Chat -->
      <div class="chat-dock-panel" id="chat-dock-panel" role="region" aria-label="Chatbot MelodIA">
        
        <!-- Header -->
        <div class="chat-dock-header">
          <div class="chat-header-info">
            <div class="chat-avatar">M</div>
            <div class="chat-title-wrap">
              <h4>MelodIA Assistant</h4>
              <div class="chat-status-indicator">
                <span class="chat-status-dot"></span>
                <span id="chat-model-label">Gemini 2.5 Flash • Catálogo activo</span>
              </div>
            </div>
          </div>
          <div class="chat-header-actions">
            <button class="chat-action-icon-btn" id="chat-reset-btn" title="Reiniciar conversación" aria-label="Reiniciar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M8 16H3v5"></path>
              </svg>
            </button>
            <button class="chat-action-icon-btn" id="chat-close-btn" title="Cerrar chat" aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Área de mensajes -->
        <div id="chat-messages-slot" style="flex:1; display:flex; flex-direction:column; overflow:hidden;"></div>

        <!-- Sugerencias rápidas -->
        <div class="chat-quick-suggestions" id="chat-suggestions-bar">
          <button class="suggestion-chip" data-query="Recomiéndame una canción del catálogo">✨ Recomendación</button>
          <button class="suggestion-chip" data-query="¿Quién es Luna Valiente y qué canciones tiene?">🎤 Luna Valiente</button>
          <button class="suggestion-chip" data-query="Muéstrame la letra de Luces de Medianoche">📝 Letra de Luces</button>
          <button class="suggestion-chip" data-query="¿Cómo cambio entre tema claro y oscuro?">💡 Cambiar tema</button>
        </div>

        <!-- Input Bar -->
        <div id="chat-input-slot"></div>

      </div>
    `;

    // Inicializar subcomponentes
    const messagesSlot = this.container.querySelector('#chat-messages-slot');
    this.messageList = new ChatMessageList(messagesSlot);

    const inputSlot = this.container.querySelector('#chat-input-slot');
    this.chatInput = new ChatInput(inputSlot, (text) => this.handleSendMessage(text));

    // Renderizar mensajes iniciales
    this.messageList.updateMessages(state.get('chatMessages'));
  }

  bindEvents() {
    const fabBtn = this.container.querySelector('#chat-fab-btn');
    const closeBtn = this.container.querySelector('#chat-close-btn');
    const resetBtn = this.container.querySelector('#chat-reset-btn');
    const suggestions = this.container.querySelectorAll('.suggestion-chip');

    fabBtn.addEventListener('click', () => this.toggleChat());
    closeBtn.addEventListener('click', () => this.toggleChat(false));
    resetBtn.addEventListener('click', () => {
      state.clearChatHistory();
      this.messageList.updateMessages(state.get('chatMessages'));
    });

    suggestions.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        if (query) {
          this.handleSendMessage(query);
        }
      });
    });

    // Eventos globales
    eventBus.on('chat:toggle', () => this.toggleChat());
    eventBus.on('chat:open-with-query', ({ query }) => {
      this.toggleChat(true);
      if (query) this.handleSendMessage(query);
    });

    eventBus.on('state:chatMessages', ({ value }) => {
      this.messageList.updateMessages(value, state.get('isChatTyping'));
    });
  }

  toggleChat(forceState) {
    const dock = this.container.querySelector('#chat-dock-panel');
    const fab = this.container.querySelector('#chat-fab-btn');
    const currentState = state.get('isChatOpen');
    const nextState = typeof forceState === 'boolean' ? forceState : !currentState;

    state.set('isChatOpen', nextState);

    if (nextState) {
      dock.classList.add('active');
      fab.classList.add('open');
      this.chatInput.focus();
    } else {
      dock.classList.remove('active');
      fab.classList.remove('open');
    }
  }

  async handleSendMessage(text) {
    if (!text || !text.trim()) return;

    // 1. Agregar mensaje del usuario al estado
    state.addChatMessage('user', text);
    state.set('isChatTyping', true);
    this.chatInput.setDisabled(true);
    this.messageList.updateMessages(state.get('chatMessages'), true);

    try {
      // 2. Consultar al servicio de Gemini
      const reply = await geminiService.sendMessage(text);
      state.set('isChatTyping', false);
      state.addChatMessage('bot', reply);
    } catch (err) {
      state.set('isChatTyping', false);
      state.addChatMessage('bot', '⚠️ Hubo un inconveniente al conectar con el asistente. Intenta de nuevo en unos momentos.');
    } finally {
      this.chatInput.setDisabled(false);
      this.messageList.updateMessages(state.get('chatMessages'), false);
      this.chatInput.focus();
    }
  }
}
