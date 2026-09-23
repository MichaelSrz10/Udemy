/**
 * MelodIA - ChatInput Component
 * Campo de entrada de texto para el chat y botón de envío
 */

import { createElement } from '../utils/domHelpers.js';

export class ChatInput {
  constructor(containerElement, onSend) {
    this.container = containerElement;
    this.onSend = onSend;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="chat-input-bar">
        <input 
          type="text" 
          id="chat-input-field" 
          class="chat-text-input" 
          placeholder="Pregunta sobre canciones, artistas o funciones..." 
          autocomplete="off"
          aria-label="Mensaje para el asistente"
        />
        <button id="chat-submit-btn" class="chat-send-btn" title="Enviar mensaje" aria-label="Enviar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    `;
  }

  bindEvents() {
    const input = this.container.querySelector('#chat-input-field');
    const btn = this.container.querySelector('#chat-submit-btn');

    const submit = () => {
      const text = input.value.trim();
      if (text) {
        this.onSend(text);
        input.value = '';
      }
    };

    btn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submit();
      }
    });
  }

  setDisabled(disabled) {
    const input = this.container.querySelector('#chat-input-field');
    const btn = this.container.querySelector('#chat-submit-btn');
    if (input) input.disabled = disabled;
    if (btn) btn.disabled = disabled;
  }

  focus() {
    const input = this.container.querySelector('#chat-input-field');
    if (input) input.focus();
  }

  setValue(val) {
    const input = this.container.querySelector('#chat-input-field');
    if (input) {
      input.value = val;
      input.focus();
    }
  }
}
