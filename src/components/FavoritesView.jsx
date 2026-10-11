import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Sparkles, 
  ArrowRight, 
  Trash2, 
  ShoppingBag, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { WhatsAppIcon } from './WhatsAppIcon';

export const FavoritesView = () => {
  const { favorites, clearFavorites, favoritesCount } = useShop();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14 min-h-[75vh]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 flex-wrap">
        <Link to="/" className="hover:text-[#4aa036] transition">Inicio</Link>
        <ChevronRight size={12} />
        <span className="text-[#e0a96d] font-bold">Tus Favoritos</span>
      </div>

      {/* Encabezado con identidad de marca */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-[#1f3b25] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e0a96d] mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4aa036]"></span>
            CULTISHOP • TU INVERNADERO PERSONAL
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white font-heading">
            TUS PRODUCTOS <span className="text-[#e0a96d] text-glow-gold">FAVORITOS</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-xl">
            Insumos que guardaste para tu cultivo. Podés seleccionar la presentación que necesitás y agregarlos a tu carrito cuando quieras.
          </p>
        </div>

        {/* Acciones del encabezado */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#2d5a27] transition shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Ver todo el catálogo</span>
          </Link>

          {favorites.length > 0 && (
            <button
              type="button"
              onClick={clearFavorites}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-[#1a1515] hover:bg-[#291717] text-gray-400 hover:text-red-400 border border-[#3b1f1f] transition"
              title="Vaciar lista de favoritos"
            >
              <Trash2 size={13} />
              <span>Vaciar lista</span>
            </button>
          )}
        </div>
      </div>

      {/* Estado Vacío */}
      {favorites.length === 0 ? (
        <div className="p-10 sm:p-14 text-center bg-[#0d1a11] border border-[#1f3b25] rounded-3xl space-y-5 max-w-xl mx-auto my-12 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-[#162d1c] border-2 border-[#4aa036]/50 flex items-center justify-center text-[#e0a96d] mx-auto shadow-lg shadow-[#4aa036]/10">
            <Heart size={36} className="text-[#e0a96d] fill-[#e0a96d]/20 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
              Aún no guardaste ningún favorito en tu invernadero
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
              Explorá nuestro catálogo de fertilizantes, carpas indoor, control de plagas y parafernalia. Hacé clic en el corazón de cualquier producto para guardarlo acá.
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition shadow-lg border border-[#4aa036]/50 hover:scale-105"
            >
              <span>Explorar Catálogo en Stock</span>
              <ArrowRight size={14} />
            </Link>

            <a
              href="https://wa.me/5493764356995?text=Hola%20CultiShop!%20Quiero%20asesoramiento%20sobre%20productos%20para%20mi%20cultivo"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#122317] hover:bg-[#1a3521] text-[#25d366] hover:text-white text-xs font-bold border border-[#23422a] hover:border-[#25d366]/50 transition"
            >
              <WhatsAppIcon size={16} />
              <span>Pedir Asesoramiento</span>
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Contador de elementos */}
          <div className="mb-6 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#e0a96d]" />
              <span>Guardados: <strong className="text-white font-bold">{favoritesCount}</strong> {favoritesCount === 1 ? 'producto' : 'productos'}</span>
            </div>
            <span className="text-gray-500 hidden sm:inline">Hacé clic en el corazón para quitarlo o en Añadir para sumar al carrito</span>
          </div>

          {/* Grilla de productos favoritos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}

      {/* Banner de confianza al pie */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#0e1c12] rounded-2xl border border-[#1f3b25]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2d5a27]/30 border border-[#4aa036]/40 flex items-center justify-center text-[#4aa036] shrink-0">
            <CheckCircle size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase text-white font-heading">Productos de Calidad</h4>
            <p className="text-[11px] text-gray-400">Marcas líderes del mercado</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2d5a27]/30 border border-[#4aa036]/40 flex items-center justify-center text-[#4aa036] shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase text-white font-heading">Resultados Comprobados</h4>
            <p className="text-[11px] text-gray-400">Máximo rendimiento</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e0a96d]/20 border border-[#e0a96d]/40 flex items-center justify-center text-[#e0a96d] shrink-0">
            <span className="text-base font-black">🌱</span>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase text-white font-heading">Para Todo Tu Cultivo</h4>
            <p className="text-[11px] text-gray-400">Indoor, exterior y huerta</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#25d366]/20 border border-[#25d366]/40 flex items-center justify-center text-[#25d366] shrink-0">
            <WhatsAppIcon size={20} />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase text-white font-heading">Stock Disponible</h4>
            <p className="text-[11px] text-gray-400">Entrega rápida en Posadas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

