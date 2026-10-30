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
 * Resuelve una URL de imagen para que siempre apunte al servidor correcto.
 * Si es una ruta relativa local (como '/uploads/...'), antepone el origen de la API
 * (ej: http://localhost:4000 o https://www.cultishop.com.ar).
 * Si ya es una URL absoluta (http://, https://, data:, blob:), la retorna tal cual.
 */
export const buildImageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }
  const apiBase = getApiBaseUrl();
  // Quitar el sufijo '/api' para obtener el origen del backend
  const serverOrigin = apiBase.replace(/\/api\/?$/i, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${serverOrigin}${cleanPath}`;
};
