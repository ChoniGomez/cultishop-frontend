/**
 * Configuración centralizada y segura de la URL de la API de CultiShop.
 * 
 * Sanitiza la variable de entorno VITE_API_URL para prevenir que caracteres
 * accidentales (como corchetes [..], comillas o espacios colocados en el panel de Vercel)
 * provoquen que el navegador interprete la dirección como una ruta relativa y la concatene
 * con el dominio actual (ej: https://cultishop.vercel.app/[https://cultishop-backend.onrender.com/api]).
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

  // Fallback seguro y directo de producción hacia el backend desplegado en Render
  return 'https://cultishop-backend.onrender.com/api';
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
