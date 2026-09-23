/**
 * Utilidades para creación y manipulación del DOM
 */

export function createElement(tag, className = '', attributes = {}, innerHTML = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  for (const [key, value] of Object.entries(attributes)) {
    el.setAttribute(key, value);
  }
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}

export function $(selector, context = document) {
  return context.querySelector(selector);
}

export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
