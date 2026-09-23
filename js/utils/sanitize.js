/**
 * Sanitización básica de cadenas para evitar inyecciones XSS en el chat
 */

export function sanitizeHTML(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Convierte markdown básico (*cursiva*, **negrita**, enlaces o listas) a HTML seguro
 */
export function formatMarkdownToSafeHTML(text) {
  if (!text) return '';
  let safe = sanitizeHTML(text);

  // Negrita **texto**
  safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Cursiva *texto*
  safe = safe.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Código `codigo`
  safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');

  return safe;
}
