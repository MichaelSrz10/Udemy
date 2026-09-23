/**
 * MelodIA - Data Service
 * Carga, normaliza y almacena en caché los archivos JSON de datos.
 */

class DataService {
  constructor() {
    this._navigation = null;
    this._catalog = null;
    this._knowledgeBase = null;
  }

  /**
   * Obtiene la estructura de navegación y vistas
   */
  async getNavigation() {
    if (this._navigation) return this._navigation;
    try {
      const res = await fetch('data/site-navigation.json');
      if (!res.ok) throw new Error(`HTTP Error ${res.status} cargando navegación`);
      this._navigation = await res.json();
      return this._navigation;
    } catch (err) {
      console.error('Error en DataService.getNavigation:', err);
      throw err;
    }
  }

  /**
   * Obtiene el catálogo de canciones y artistas
   */
  async getCatalog() {
    if (this._catalog) return this._catalog;
    try {
      const res = await fetch('data/catalog.json');
      if (!res.ok) throw new Error(`HTTP Error ${res.status} cargando catálogo`);
      this._catalog = await res.json();
      return this._catalog;
    } catch (err) {
      console.error('Error en DataService.getCatalog:', err);
      throw err;
    }
  }

  /**
   * Obtiene la base de conocimiento para el asistente conversacional
   */
  async getKnowledgeBase() {
    if (this._knowledgeBase) return this._knowledgeBase;
    try {
      const res = await fetch('data/knowledge-base.json');
      if (!res.ok) throw new Error(`HTTP Error ${res.status} cargando base de conocimiento`);
      this._knowledgeBase = await res.json();
      return this._knowledgeBase;
    } catch (err) {
      console.error('Error en DataService.getKnowledgeBase:', err);
      throw err;
    }
  }

  /**
   * Encuentra una canción por su ID
   */
  async getSongById(songId) {
    const cat = await this.getCatalog();
    return cat.songs?.find(s => s.id === songId) || null;
  }

  /**
   * Encuentra un artista por su ID
   */
  async getArtistById(artistId) {
    const cat = await this.getCatalog();
    return cat.artists?.find(a => a.id === artistId) || null;
  }
}

export const dataService = new DataService();
