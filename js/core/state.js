/**
 * MelodIA - State Store Centralizado Mínimo
 * Maneja el estado global reactivo sin librerías externas.
 */

import { eventBus } from './eventBus.js';

class StateStore {
  constructor() {
    this._state = {
      theme: 'light', // Modo claro por defecto según especificación
      activeView: 'home',
      activeFilter: 'all',
      searchQuery: '',
      currentSong: null,
      isPlaying: false,
      playbackSeconds: 0,
      volume: 0.8,
      isMuted: false,
      isLyricsModalOpen: false,
      selectedSongForModal: null,
      isChatOpen: false,
      chatMessages: [
        {
          id: 'msg_welcome',
          role: 'bot',
          text: '¡Hola! 🎵 Soy el asistente virtual de **MelodIA**.\nPuedes preguntarme por canciones, álbumes, letras o la biografía de cualquier artista de nuestra plataforma. ¿En qué te puedo ayudar hoy?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ],
      isChatTyping: false
    };
  }

  getState() {
    return { ...this._state };
  }

  get(key) {
    return this._state[key];
  }

  set(key, value) {
    const prevValue = this._state[key];
    if (prevValue !== value) {
      this._state[key] = value;
      eventBus.emit(`state:${key}`, { value, prevValue });
      eventBus.emit('state:change', { key, value, prevValue });
    }
  }

  update(partialState) {
    for (const [key, value] of Object.entries(partialState)) {
      this.set(key, value);
    }
  }

  // Métodos de conveniencia para chat
  addChatMessage(role, text) {
    const newMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const current = [...this._state.chatMessages, newMsg];
    this.set('chatMessages', current);
    return newMsg;
  }

  clearChatHistory() {
    this.set('chatMessages', [
      {
        id: 'msg_reset',
        role: 'bot',
        text: 'He reiniciado nuestra conversación. 🎶 ¿Qué canción o artista te gustaría consultar ahora?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }
}

export const state = new StateStore();
