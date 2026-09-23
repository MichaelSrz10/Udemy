/**
 * MelodIA - Theme Service
 * Gestiona el conmutador de tema claro/oscuro y su persistencia en localStorage.
 * Por especificación, el modo claro es el estado inicial por defecto.
 */

import { state } from '../core/state.js';

const THEME_STORAGE_KEY = 'melodia_theme_preference';

class ThemeService {
  constructor() {
    this.init();
  }

  init() {
    // Modo claro por defecto a menos que el usuario lo haya cambiado previamente
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';
    this.setTheme(initialTheme);
  }

  getTheme() {
    return state.get('theme') || 'light';
  }

  setTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    state.set('theme', theme);
  }

  toggleTheme() {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }
}

export const themeService = new ThemeService();
