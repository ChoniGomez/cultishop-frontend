/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        culti: {
          bg: '#0a140d',          // Fondo oscuro follaje
          dark: '#0d1a11',        // Barras y fondos secundarios
          card: '#122317',        // Tarjetas oscuras
          border: '#1f3b25',      // Bordes sutiles
          forest: '#2d5a27',      // Verde forestal corporativo
          forestLight: '#38761d', // Verde hoja intenso
          leaf: '#4aa036',        // Verde brote / acento vivo
          lime: '#78b13d',        // Verde luminoso
          gold: '#e0a96d',        // Dorado mostaza de títulos y flyers
          goldLight: '#f3c98b',   // Dorado claro para textos destacados
          goldBright: '#d4af37',  // Amarillo mostaza cálido
          wood: '#3a2717',        // Tono madera rústica
          woodDark: '#23170e'     // Madera profunda
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
