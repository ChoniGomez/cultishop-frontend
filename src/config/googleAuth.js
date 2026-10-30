/**
 * Configuración centralizada y resiliente de Google OAuth para CultiShop.
 * 
 * Obtiene la variable de entorno VITE_GOOGLE_CLIENT_ID de Vite,
 * elimina comillas, espacios o corchetes accidentales, valida que sea un ID real
 * y provee una advertencia por consola con fallback oficial en caso de que la
 * variable no esté definida o llegue como undefined durante el build en producción.
 */

// Client ID oficial de producción de CultiShop registrado en Google Cloud Console
export const OFFICIAL_GOOGLE_CLIENT_ID = '163160853962-l05qnhbr5cfqek40vq5tavh9gkasnu6h.apps.googleusercontent.com';

export const getGoogleClientId = () => {
  const rawId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (rawId && typeof rawId === 'string') {
    // 1. Quitar comillas, espacios, corchetes o caracteres espurios
    const cleaned = rawId.trim().replace(/^["'`\[]+|["'`\]]+$/g, '').trim();

    // 2. Si es un Client ID válido y no contiene la palabra "demo"
    if (cleaned.length > 20 && !cleaned.toLowerCase().includes('demo')) {
      return cleaned;
    }
  }

  // 3. Validación y advertencia en consola si la variable no vino definida en el entorno
  if (typeof window !== 'undefined') {
    console.warn(
      '⚠️ [Google Auth] VITE_GOOGLE_CLIENT_ID no se encontró definida en import.meta.env al compilar en producción. Utilizando el Client ID oficial de CultiShop como fallback:',
      OFFICIAL_GOOGLE_CLIENT_ID
    );
  }

  return OFFICIAL_GOOGLE_CLIENT_ID;
};

export const GOOGLE_CLIENT_ID = getGoogleClientId();

