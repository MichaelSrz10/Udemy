/**
 * MelodIA - ChatMessageList Component
 * Renderiza la lista de burbujas de conversación y el indicador de escritura
 */

import { createElement } from '../utils/domHelpers.js';
import { formatMarkdownToSafeHTML } from '../utils/sanitize.js';

export class ChatMessageList {
  constructor(containerElement) {
    this.container = containerElement;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="chat-messages-container" id="chat-messages-scroll"></div>
    `;
    this.scrollElement = this.container.querySelector('#chat-messages-scroll');
  }

  updateMessages(messages, isTyping = false) {
    this.scrollElement.innerHTML = '';

    messages.forEach(msg => {
      const row = createElement('div', `chat-message-row ${msg.role === 'user' ? 'user' : 'bot'}`);
      const formattedHTML = formatMarkdownToSafeHTML(msg.text);

      row.innerHTML = `
        <div class="chat-bubble">${formattedHTML}</div>
        <div class="chat-msg-time">${msg.timestamp || ''}</div>
      `;
      this.scrollElement.appendChild(row);
    });

    if (isTyping) {
      const typingRow = createElement('div', 'chat-message-row bot');
      typingRow.innerHTML = `
        <div class="chat-typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      `;
      this.scrollElement.appendChild(typingRow);
    }

    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      this.scrollElement.scrollTop = this.scrollElement.scrollHeight;
    }, 50);
  }
}
