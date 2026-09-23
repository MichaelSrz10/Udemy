# 🎵 MelodIA - Plataforma de Streaming Musical & Chatbot IA

**MelodIA** es una aplicación web interactiva de streaming musical inspirada en la estética de Spotify, construida con arquitectura modular en **HTML5, CSS3 (variables y temas claro/oscuro) y JavaScript vanilla**. Integra un asistente conversacional inteligente impulsado por **Google Gemini 2.5 Flash** operando bajo un esquema cerrado de recuperación de contexto (**RAG ligero sobre JSON**) y protegido mediante un servidor proxy en **Node.js nativo**.

---

## 🚀 Características Principales

- 🎨 **Estética Inspirada en Spotify**: Interfaz con acentos verdes neón (`#1DB954`), tarjetas interactivas, sombras elegantes y transiciones fluidas.
- 🌓 **Conmutador de Tema Claro / Oscuro**: Modo claro por defecto al primer inicio (conforme a la especificación) y modo oscuro clásico de Spotify, con cambio instantáneo y persistencia en `localStorage`.
- 📊 **UI 100% Dirigida por Datos (Data-Driven)**: Navegación, vistas, canciones, artistas y base de conocimiento cargados dinámicamente desde `data/site-navigation.json`, `data/catalog.json` y `data/knowledge-base.json`.
- 📑 **Modal de Letras y Reseña de Artista**: Al hacer clic en cualquier canción, se despliega un modal con pestañas para leer la letra completa y la biografía del artista.
- ⏯️ **Reproductor Interactivo (Player Bar)**: Controles de reproducción (Play/Pausa, anterior, siguiente), barra de progreso interactiva y control de volumen con silencio.
- 🤖 **Chatbot Asistente con Gemini 2.5 Flash**:
  - Contexto cerrado: responde exclusivamente sobre el catálogo, canciones, artistas y uso de la plataforma.
  - Rechazo cortés ante preguntas ajenas o intentos de manipulación de prompt.
  - RAG ligero: emparejamiento por palabras clave para inyectar únicamente el contexto necesario.
- 🔒 **Seguridad y Custodia de Credenciales (Opción B)**: Servidor proxy Node.js nativo que lee `.env` sin exponer nunca la API Key en el frontend ni en las herramientas de desarrollo del navegador.
- 💡 **Modo Fallback Inteligente**: Si no se configura `GEMINI_API_KEY`, el servidor cuenta con un motor RAG local que responde con la información del catálogo para pruebas y evaluación inmediata.

---

## 📁 Estructura del Proyecto

```
SpotifyChatBot/
├── index.html                      # Punto de entrada único de la SPA
├── package.json                    # Scripts de ejecución (npm start)
├── .env.example                    # Plantilla de variables de entorno
├── .env                            # Variables de entorno locales (protegido)
├── .gitignore                      # Exclusiones de control de versiones
├── README.md                       # Documentación técnica
│
├── assets/
│   ├── icons/logo.svg              # Logo vectorial de MelodIA
│   └── images/
│       ├── covers/                 # Portadas SVG para cada canción del catálogo
│       └── artists/                # Avatares SVG para cada artista
│
├── css/
│   ├── base/
│   │   ├── _reset.css              # Normalización de estilos
│   │   ├── _variables.css          # Tokens de diseño y temas claro / oscuro
│   │   └── _typography.css         # Jerarquía tipográfica
│   ├── layout/
│   │   ├── _grid.css               # Grid 3 áreas (Sidebar, Contenido, Player)
│   │   └── _header.css             # Barra superior con buscador y filtros
│   ├── components/
│   │   ├── _sidebar.css            # Menú de navegación lateral
│   │   ├── _card.css               # Tarjetas de canciones y artistas
│   │   ├── _player-bar.css         # Barra de reproducción inferior
│   │   ├── _modal.css              # Modal de letra + reseña del artista
│   │   ├── _theme-toggle.css       # Conmutador de tema
│   │   └── _chat-widget.css        # Widget flotante del chatbot
│   ├── utilities/
│   │   └── _helpers.css            # Clases utilitarias
│   └── main.css                    # Hoja de estilos principal con @imports
│
├── js/
│   ├── main.js                     # Bootstrap de la aplicación
│   ├── core/
│   │   ├── state.js                # Almacén de estado reactivo mínimo
│   │   ├── eventBus.js             # Mediador Pub/Sub entre módulos
│   │   └── viewManager.js          # Enrutador dinámico de vistas
│   ├── services/
│   │   ├── dataService.js          # Carga y caché de archivos JSON
│   │   ├── geminiService.js        # Comunicación con /api/chat y RAG
│   │   ├── knowledgeRetriever.js   # Motor RAG sobre knowledge-base.json
│   │   └── themeService.js         # Lógica de cambio y persistencia de tema
│   ├── components/
│   │   ├── Sidebar.js
│   │   ├── Navbar.js
│   │   ├── CatalogGrid.js
│   │   ├── SongCard.js
│   │   ├── ArtistCard.js
│   │   ├── PlayerBar.js
│   │   ├── LyricsModal.js
│   │   ├── ThemeToggle.js
│   │   ├── ChatWidget.js
│   │   ├── ChatMessageList.js
│   │   └── ChatInput.js
│   └── utils/
│       ├── domHelpers.js
│       ├── formatters.js
│       └── sanitize.js
│
├── data/
│   ├── site-navigation.json        # Estructura de menú y configuración de vistas
│   ├── catalog.json                # Catálogo de canciones, letras y artistas
│   └── knowledge-base.json         # Base de conocimiento curada para el chatbot
│
├── server/
│   └── proxy.js                    # Servidor HTTP estático + Proxy seguro a Gemini
│
└── docs/
    └── system-prompt.md            # System prompt documentado y versionado
```

---

## 🛠️ Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js** v18 o superior instalado.

### 1. Clonar o acceder al proyecto
```bash
cd "/Users/michael/Library/CloudStorage/OneDrive-UNIVERSIDADDECUNDINAMARCA/Documents/UdeC/VII SEMESTRE/MACHINE LEARNING/SpotifyChatBot"
```

### 2. Configurar la clave de API de Gemini (Opcional para modo nube)
Copia la plantilla `.env.example` a `.env` (ya viene preconfigurado un archivo `.env` en la raíz):
```bash
cp .env.example .env
```
Edita `.env` y coloca tu API Key obtenida en [Google AI Studio](https://aistudio.google.com/):
```env
PORT=3000
GEMINI_API_KEY=AIzaSy...
```
*(Si no tienes una API key a mano, la aplicación funciona de forma inmediata utilizando el motor de conocimiento local integrado).*

### 3. Iniciar el servidor
```bash
npm start
# O directamente: node server/proxy.js
```

### 4. Abrir en el navegador
Visita en tu navegador:
```
http://localhost:3000
```

---

## 🧪 Validación y Casos de Prueba

1. **Modo Claro por Defecto & Conmutador de Tema**:
   - Al cargar la página por primera vez, se visualiza en modo claro con alta legibilidad.
   - Al presionar el botón de Sol/Luna en la esquina superior derecha, se conmuta al instante al modo oscuro de Spotify. Al recargar la página, la preferencia se mantiene.
2. **Navegación e Interacción del Catálogo**:
   - Clic en los ítems de la barra lateral (Inicio, Artistas, Buscar, Tu Biblioteca).
   - Búsqueda en tiempo real desde la barra superior.
   - Clic en cualquier tarjeta de canción para abrir el modal con su **Letra** y la **Biografía del Artista**.
   - Clic en el botón Play de una tarjeta para iniciar la simulación en la barra de reproducción inferior.
3. **Pruebas del Asistente IA (Chatbot)**:
   - **Dentro de alcance**: Pregunta *"¿Quién es Luna Valiente?"*, *"Muéstrame la letra de Luces de Medianoche"*, *"Recomiéndame algo de música electrónica"*. El bot responderá con precisión basándose en los datos.
   - **Fuera de alcance**: Pregunta *"¿Cuál es la capital de Francia?"* o *"Dame una receta de pizza"*. El bot rechazará cortésmente la consulta y recordará su propósito musical.
   - **Seguridad**: Inspecciona la pestaña *Network* de las herramientas de desarrollador; la API Key de Gemini nunca es enviada al navegador.
