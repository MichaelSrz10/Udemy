/**
 * MelodIA - EventBus (Patrón Mediador / Pub-Sub)
 * Desacopla la comunicación entre componentes UI y servicios.
 */

class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * Suscribe un callback a un evento
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    return () => this.off(event, callback);
  }

  /**
   * Remueve una suscripción
   */
  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
    }
  }

  /**
   * Emite un evento con datos asociados
   */
  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error procesando evento '${event}':`, err);
        }
      });
    }
  }
}

export const eventBus = new EventBus();
