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
 * Resuelve una URL de imagen para que siempre apunte al servidor correcto (Backend / VPS).
 * 
 * Si es una ruta relativa local (como '/uploads/...'):
 * En producción, si el frontend está alojado de forma separada o servido por Nginx como SPA,
 * las peticiones puramente relativas a '/uploads/...' son interceptadas por la regla SPA
 * (try_files $uri $uri/ /index.html), devolviendo 'text/html' y provocando cuadros negros en las imágenes.
 * 
 * Para solucionarlo de raíz:
 * 1. Si la ruta apunta a '/uploads/...', se enruta a través de la URL base del backend
 *    (ej: `${apiBase}/uploads/...` -> 'https://www.cultishop.com.ar/api/uploads/...'),
 *    garantizando que alcance siempre al proceso Express en Node.js mediante el proxy de la API.
 * 2. Si ya es una URL absoluta (http://, https://, data:, blob:), se retorna tal cual.
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

  const apiBase = getApiBaseUrl(); // ej: 'https://www.cultishop.com.ar/api' o 'http://localhost:4000/api'
  const serverOrigin = apiBase.replace(/\/api\/?$/i, ''); // ej: 'https://www.cultishop.com.ar' o 'http://localhost:4000'
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  // 2. Si la ruta ya incluye el prefijo de la API (/api/uploads/...)
  if (cleanPath.startsWith('/api/')) {
    return `${serverOrigin}${cleanPath}`;
  }

  // 3. Si es una ruta de subidas (/uploads/...)
  if (cleanPath.startsWith('/uploads/')) {
    // Si la URL de la API contiene /api, usar /api/uploads/... para aprovechar el proxy de Nginx
    // que ya está configurado y garantizado hacia el backend
    if (apiBase.endsWith('/api')) {
      return `${apiBase}${cleanPath}`;
    }
    return `${serverOrigin}${cleanPath}`;
  }

  // 4. Cualquier otra ruta estática relativa
  return `${serverOrigin}${cleanPath}`;
};
