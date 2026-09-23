/**
 * MelodIA - Knowledge Retriever (RAG Ligero sobre JSON)
 * Extrae y sintetiza el contexto relevante desde knowledge-base.json y catalog.json
 */

import { dataService } from './dataService.js';

class KnowledgeRetriever {
  /**
   * Normaliza texto eliminando acentos, puntuación y caracteres especiales
   */
  normalize(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/gi, ' ')
      .trim();
  }

  /**
   * Recupera las entradas más relevantes para la consulta del usuario
   * @param {string} query - Consulta del usuario
   * @param {number} topK - Número de entradas a retornar (por defecto 4)
   */
  async retrieveContext(query, topK = 4) {
    try {
      const kb = await dataService.getKnowledgeBase();
      const catalog = await dataService.getCatalog();

      if (!kb || !kb.entries) {
        return { contextString: '', matches: [], hasMatches: false };
      }

      const normalizedQuery = this.normalize(query);
      const queryTokens = normalizedQuery.split(/\s+/).filter(t => t.length > 2);

      // Evaluar y puntuar cada entrada
      const scoredEntries = kb.entries.map(entry => {
        let score = 0;
        const normalizedSearchText = this.normalize(entry.searchableText || '');
        const normalizedSummary = this.normalize(entry.summary || '');
        const normalizedQuestion = this.normalize(entry.question || '');
        const normalizedAnswer = this.normalize(entry.answer || '');

        const fullTarget = `${normalizedSearchText} ${normalizedSummary} ${normalizedQuestion} ${normalizedAnswer}`;

        // 1. Coincidencia de frase exacta
        if (fullTarget.includes(normalizedQuery)) {
          score += 15;
        }

        // 2. Coincidencia por tokens
        queryTokens.forEach(token => {
          if (normalizedSearchText.includes(token)) score += 4;
          if (normalizedSummary.includes(token)) score += 3;
          if (normalizedQuestion.includes(token)) score += 5;
          if (normalizedAnswer.includes(token)) score += 2;
        });

        return { entry, score };
      });

      // Filtrar y ordenar por puntuación descendente
      const topMatches = scoredEntries
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(item => item.entry);

      if (topMatches.length === 0) {
        return {
          contextString: 'No se encontró información relevante en el catálogo para esta consulta.',
          matches: [],
          hasMatches: false
        };
      }

      // Construir bloque de contexto serializado
      let contextLines = [];
      for (const entry of topMatches) {
        if (entry.type === 'song') {
          contextLines.push(`[Canción en Catálogo]: ${entry.summary}`);
          // Si el usuario pregunta por letra y hay refId, agregar letra completa
          if (entry.refId && (normalizedQuery.includes('letra') || normalizedQuery.includes('lyrics'))) {
            const fullSong = catalog.songs?.find(s => s.id === entry.refId);
            if (fullSong && fullSong.lyrics) {
              contextLines.push(`[Letra de "${fullSong.title}"]: ${fullSong.lyrics}`);
            }
          }
        } else if (entry.type === 'artist') {
          contextLines.push(`[Artista en Catálogo]: ${entry.summary}`);
        } else if (entry.type === 'platform_faq') {
          contextLines.push(`[Ayuda de la Plataforma]: Pregunta: "${entry.question}" -> Respuesta: "${entry.answer}"`);
        }
      }

      return {
        contextString: contextLines.join('\n\n'),
        matches: topMatches,
        hasMatches: true
      };
    } catch (err) {
      console.error('Error en KnowledgeRetriever.retrieveContext:', err);
      return { contextString: '', matches: [], hasMatches: false };
    }
  }
}

export const knowledgeRetriever = new KnowledgeRetriever();
