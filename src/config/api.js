/**
 * Configuración centralizada y segura de la URL de la API de CultiShop.
 * 
 * Sanitiza la variable de entorno VITE_API_URL para prevenir caracteres
 * accidentales (como corchetes [..], comillas o espacios)
 * y garantizar que la conexión apunte siempre a una URL absoluta válida.
 */
export const getApiBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_URL;
  const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (rawUrl && typeof rawUrl === 'string') {
    // 1. Quitar corchetes, comillas y espacios en los extremos
    let cleaned = rawUrl.trim().replace(/^[\["'`]+|[\]"'`]+$/g, '').trim();

    // 2. Extraer la URL absoluta si vino envuelta en corchetes u otros caracteres
    const httpRegex = /https?:\/\/[^\s"'`\]]+/i;
    const match = cleaned.match(httpRegex);
    if (match) {
      cleaned = match[0];
    }

    // 3. Quitar barras finales redundantes
    cleaned = cleaned.replace(/\/+$/, '');

    // 4. Validar que comience estrictamente con http:// o https://
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      return cleaned;
    }
  }

  // Si estamos en entorno local, utilizar backend de desarrollo en localhost:4000
  if (isLocal) {
    return 'http://localhost:4000/api';
  }

  // Fallback seguro y directo de producción hacia el dominio oficial
  return 'https://www.cultishop.com.ar/api';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Construye una URL completa hacia un endpoint garantizando que siempre sea una URL absoluta.
 */
export const buildApiUrl = (endpoint = '') => {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${base}/${cleanEndpoint}`;
};

/**
 * Resuelve la URL base para archivos estáticos y subidas (carpeta /uploads).
 * Prioriza VITE_UPLOADS_URL si está definida, o la deriva del origen del servidor.
 */
export const getUploadsBaseUrl = () => {
  const custom = import.meta.env.VITE_UPLOADS_URL;
  if (custom && typeof custom === 'string' && custom.trim()) {
    let cleaned = custom.trim().replace(/^[\["'`]+|[\]"'`]+$/g, '').trim();
    cleaned = cleaned.replace(/\/+$/, '');
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      return cleaned;
    }
  }

  const isLocal = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocal) {
    return 'http://localhost:4000/uploads';
  }

  const apiBase = getApiBaseUrl();
  const serverOrigin = apiBase.replace(/\/api\/?$/i, '');
  return `${serverOrigin}/uploads`;
};

/**
 * Resuelve una URL de imagen para que siempre apunte al servidor correcto (Backend / VPS).
 * 
 * 1. Si ya es una URL absoluta (http://, https://, data:, blob:), se retorna tal cual.
 * 2. Si es una ruta relativa local (como '/uploads/product-123.webp' o 'product-123.webp'),
 *    la resuelve hacia la URL base donde se sirven las imágenes estáticas del backend.
 */
export const buildImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // 1. Si ya es una URL absoluta o binario en memoria, retornar tal cual
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  const uploadsBase = getUploadsBaseUrl();
  // Limpiar prefijos redundantes para asegurar una ruta limpia
  const cleanPath = trimmed
    .replace(/^\/api\/uploads\//i, '')
    .replace(/^\/uploads\//i, '')
    .replace(/^\/+/, '');

  return `${uploadsBase}/${cleanPath}`;
};
