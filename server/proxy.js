/**
 * MelodIA - Servidor Proxy Seguro y Servidor de Archivos Estáticos
 * Construido con módulos nativos de Node.js (sin dependencias externas).
 * 
 * Responsabilidades:
 * 1. Servir los archivos estáticos de la aplicación (SPA).
 * 2. Custodiar de forma segura la API Key de Gemini leída desde .env.
 * 3. Procesar las solicitudes POST en /api/chat y comunicarse con Gemini 2.5 Flash.
 * 4. Fallback inteligente basado en la base de conocimiento local si no hay API key configurada.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Carga simple de variables de entorno desde .env
function loadEnv() {
  const envPath = path.join(ROOT_DIR, '.env');
  const env = {
    PORT: 3000,
    GEMINI_API_KEY: ''
  };

  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        if (key) {
          const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
          env[key.trim()] = val;
        }
      }
    }
  }

  // Prioridad a process.env si ya existen
  if (process.env.PORT) env.PORT = process.env.PORT;
  if (process.env.GEMINI_API_KEY) env.GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  return env;
}

const env = loadEnv();
const PORT = parseInt(env.PORT, 10) || 3000;
const GEMINI_API_KEY = env.GEMINI_API_KEY || '';

// Tipos MIME comunes
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

// Cargar base de conocimiento para fallback local
let knowledgeBaseCache = null;
let catalogCache = null;

function loadLocalData() {
  try {
    const kbPath = path.join(ROOT_DIR, 'data', 'knowledge-base.json');
    const catPath = path.join(ROOT_DIR, 'data', 'catalog.json');
    if (fs.existsSync(kbPath)) {
      knowledgeBaseCache = JSON.parse(fs.readFileSync(kbPath, 'utf-8'));
    }
    if (fs.existsSync(catPath)) {
      catalogCache = JSON.parse(fs.readFileSync(catPath, 'utf-8'));
    }
  } catch (err) {
    console.error('Error cargando datos locales para fallback:', err.message);
  }
}
loadLocalData();

/**
 * Normaliza cadenas quitando tildes y signos
 */
function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, ' ')
    .trim();
}

/**
 * Motor de respuesta de respaldo local (cuando no hay API key o está en modo offline)
 */
function handleLocalKnowledgeFallback(userQuery, retrievedContext) {
  loadLocalData();
  const normalizedQuery = normalizeText(userQuery);
  const words = normalizedQuery.split(/\s+/).filter(w => w.length > 2);

  // Intentos de jailbreak o preguntas claramente fuera de alcance
  const offTopicKeywords = ['politica', 'presidente', 'receta', 'cocina', 'matematicas', 'capital de', 'quien descubrio', 'clima en', 'bitcoin', 'dolar', 'ignora tus instrucciones', 'ignore previous', 'jailbreak'];
  const isOffTopic = offTopicKeywords.some(k => normalizedQuery.includes(k));

  if (isOffTopic) {
    const rejection = knowledgeBaseCache?.policy?.rejectionMessage || 
      'Lo siento, como asistente de MelodIA solo puedo ayudarte con temas sobre la música, artistas del catálogo y las funciones de la plataforma. ¿Quieres que te recomiende alguna canción?';
    return {
      text: rejection,
      isFallback: true,
      source: 'local_policy_guard'
    };
  }

  // Búsqueda en catálogo directo
  if (catalogCache) {
    // Buscar canciones
    for (const song of catalogCache.songs || []) {
      const matchTitle = normalizeText(song.title);
      if (normalizedQuery.includes(matchTitle) || (words.length && words.some(w => matchTitle.includes(w)))) {
        const artist = (catalogCache.artists || []).find(a => a.id === song.artistId);
        const artistName = artist ? artist.name : 'Desconocido';
        
        if (normalizedQuery.includes('letra') || normalizedQuery.includes('lyrics')) {
          return {
            text: `🎵 **Letra de "${song.title}"** (de ${artistName}, Álbum: *${song.album}*, ${song.releaseYear}):\n\n${song.lyrics}\n\n*Duración: ${song.duration}*`,
            isFallback: true,
            source: 'local_catalog_lyrics'
          };
        }

        return {
          text: `🎶 **${song.title}** es una canción de **${artistName}** perteneciente al álbum *${song.album}* (${song.releaseYear}). Tiene una duración de ${song.duration} y puedes reproducirla o ver su letra completa haciendo clic en su tarjeta en la aplicación.`,
          isFallback: true,
          source: 'local_catalog_song'
        };
      }
    }

    // Buscar artistas
    for (const artist of catalogCache.artists || []) {
      const matchName = normalizeText(artist.name);
      if (normalizedQuery.includes(matchName) || (words.length && words.some(w => matchName.includes(w)))) {
        const artistSongs = (catalogCache.songs || []).filter(s => s.artistId === artist.id).map(s => `• "${s.title}" (${s.album})`).join('\n');
        return {
          text: `🎤 **${artist.name}** (${artist.genre})\n\n${artist.bio}\n\n**Canciones disponibles en MelodIA:**\n${artistSongs || 'Catálogo en actualización'}`,
          isFallback: true,
          source: 'local_catalog_artist'
        };
      }
    }
  }

  // Búsqueda en FAQ de plataforma
  if (knowledgeBaseCache && knowledgeBaseCache.entries) {
    const faqMatch = knowledgeBaseCache.entries.find(e => 
      e.type === 'platform_faq' && 
      words.some(w => normalizeText(e.question || '').includes(w) || normalizeText(e.searchableText || '').includes(w))
    );
    if (faqMatch) {
      return {
        text: `💡 **${faqMatch.question || 'Ayuda de MelodIA'}**\n\n${faqMatch.answer || faqMatch.summary}`,
        isFallback: true,
        source: 'local_faq'
      };
    }
  }

  // Saludos o preguntas generales sobre la app
  if (normalizedQuery.includes('hola') || normalizedQuery.includes('buenas') || normalizedQuery.includes('ayuda') || normalizedQuery.includes('catalogo') || normalizedQuery.includes('que puedes hacer')) {
    const songList = (catalogCache?.songs || []).slice(0, 4).map(s => `"${s.title}"`).join(', ');
    return {
      text: `¡Hola! 👋 Soy el asistente virtual de **MelodIA**.\nPuedo contarte sobre nuestros artistas, mostrarte letras de canciones como ${songList || 'las disponibles en Inicio'}, o explicarte cómo usar el reproductor y cambiar de tema (claro/oscuro).\n\n¿Qué te gustaría escuchar hoy?`,
      isFallback: true,
      source: 'local_welcome'
    };
  }

  // Recomendaciones
  if (normalizedQuery.includes('recomiend') || normalizedQuery.includes('suger') || normalizedQuery.includes('musica')) {
    const randomSongs = (catalogCache?.songs || []).slice(0, 3);
    const recs = randomSongs.map(s => {
      const art = (catalogCache?.artists || []).find(a => a.id === s.artistId);
      return `• **${s.title}** - ${art?.name || 'Artista'} (*${s.album}*)`;
    }).join('\n');
    return {
      text: `🎧 ¡Aquí tienes unas recomendaciones destacadas de MelodIA!\n\n${recs}\n\n¡Haz clic en cualquiera de ellas en el catálogo para reproducirla o leer su letra!`,
      isFallback: true,
      source: 'local_recommendation'
    };
  }

  // Respuesta general de alcance delimitado
  const rejection = knowledgeBaseCache?.policy?.rejectionMessage ||
    'Lo siento, solo puedo responder preguntas relacionadas con el catálogo de canciones, los artistas y el uso de MelodIA. ¿Deseas consultar alguna canción o artista en particular?';
  return {
    text: rejection,
    isFallback: true,
    source: 'local_unmatched'
  };
}

/**
 * Llamada a la API de Gemini mediante fetch nativo de Node.js
 */
async function callGeminiApi(payload) {
  const models = ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;
        if (text) {
          return { text, modelUsed: model };
        }
      } else {
        const errText = await res.text();
        console.warn(`Gemini API error en modelo ${model} (${res.status}): ${errText}`);
        lastError = new Error(`API Error ${res.status}: ${errText}`);
      }
    } catch (err) {
      console.warn(`Fallo de red conectando con Gemini ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('No se pudo obtener respuesta de los modelos Gemini disponibles.');
}

/**
 * Manejador principal de solicitudes HTTP
 */
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = parsedUrl.pathname;

  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Endpoint API del Chatbot
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // Límite 1MB
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const userMessage = parsed.message || parsed.contents?.[0]?.parts?.[0]?.text || '';
        const systemInstruction = parsed.systemInstruction || null;
        const history = parsed.history || [];
        const context = parsed.context || '';

        // Si tenemos API Key configurada válida, usamos Gemini
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'tu_gemini_api_key_aqui' && GEMINI_API_KEY.length > 10) {
          const contents = [];

          // Agregar historial previo relevante
          if (Array.isArray(history)) {
            for (const h of history) {
              if (h.role && h.text) {
                contents.push({
                  role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
                  parts: [{ text: h.text }]
                });
              }
            }
          }

          // Mensaje actual con contexto recuperado (RAG)
          let finalUserPrompt = userMessage;
          if (context) {
            finalUserPrompt = `[CONTEXTO DE LA BASE DE CONOCIMIENTO DE MELODIA]:\n${context}\n\n[CONSULTA DEL USUARIO]:\n${userMessage}`;
          }

          contents.push({
            role: 'user',
            parts: [{ text: finalUserPrompt }]
          });

          const geminiPayload = {
            contents,
            systemInstruction: systemInstruction || {
              parts: [{
                text: 'Eres el asistente virtual oficial de MelodIA, plataforma de streaming musical. Responde exclusivamente usando el catálogo, canciones, artistas y funciones de MelodIA. Rechaza amablemente cualquier pregunta no relacionada.'
              }]
            },
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 600
            }
          };

          try {
            const result = await callGeminiApi(geminiPayload);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
              reply: result.text,
              source: 'gemini_api',
              model: result.modelUsed
            }));
            return;
          } catch (geminiError) {
            console.error('Error llamando a Gemini API, activando fallback local:', geminiError.message);
            // Si falla la API en la nube (ej. cuota o red), usamos el fallback local para no romper la experiencia
            const fallbackResult = handleLocalKnowledgeFallback(userMessage, context);
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
              reply: fallbackResult.text,
              source: 'local_fallback_on_api_error',
              errorDetails: 'Conexión a Gemini temporalmente no disponible. Respuesta generada por motor de conocimiento local.'
            }));
            return;
          }
        } else {
          // No hay API Key configurada: respuesta contextual del motor de conocimiento local
          const localResult = handleLocalKnowledgeFallback(userMessage, context);
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            reply: localResult.text,
            source: 'local_knowledge_engine',
            note: 'Operando con motor RAG local. Configura GEMINI_API_KEY en .env para activar Gemini 2.5 Flash en tiempo real.'
          }));
          return;
        }
      } catch (parseErr) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Payload JSON inválido: ' + parseErr.message }));
      }
    });
    return;
  }

  // Endpoint de estado del servidor
  if (pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      status: 'ok',
      hasApiKey: Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== 'tu_gemini_api_key_aqui'),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Servidor de archivos estáticos
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  const filePath = path.join(ROOT_DIR, safePath);

  // Asegurar que la ruta solicitada está dentro del directorio raíz
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Prohibido');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Si no existe el archivo, intentar servir index.html para soporte SPA
      const indexFallback = path.join(ROOT_DIR, 'index.html');
      if (fs.existsSync(indexFallback)) {
        res.writeHead(200, { 'Content-Type': MIME_TYPES['.html'] });
        fs.createReadStream(indexFallback).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 No encontrado');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🎵 MelodIA - Servidor Activo en http://localhost:${PORT}`);
  console.log(`🔒 Modo de seguridad: Proxy Backend (API Key protegida)`);
  console.log(`🤖 Estado Gemini API Key: ${GEMINI_API_KEY && GEMINI_API_KEY !== 'tu_gemini_api_key_aqui' ? 'Configurada ✅' : 'No configurada (Motor RAG local activo) ⚠️'}`);
  console.log(`======================================================\n`);
});
