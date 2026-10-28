import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ArrowRight, 
  Sparkles, 
  Leaf, 
  Truck, 
  Store, 
  ShieldCheck, 
  ChevronRight,
  Flame,
  Zap,
  Layers
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useShop } from '../context/ShopContext';
import { CATEGORIES } from '../data/categories';

export const HomeFeaturedProducts = () => {
  const { 
    featuredProducts, 
    loadingFeatured, 
    fetchFeaturedProducts,
    categories: shopCategories 
  } = useShop();

  const activeCategoriesList = (Array.isArray(shopCategories) && shopCategories.length > 0) 
    ? shopCategories 
    : CATEGORIES;

  // Cargar productos destacados si aún no existen
  useEffect(() => {
    if ((!featuredProducts || featuredProducts.length === 0) && fetchFeaturedProducts) {
      fetchFeaturedProducts();
    }
  }, [featuredProducts, fetchFeaturedProducts]);

  const displayProducts = Array.isArray(featuredProducts) ? featuredProducts.slice(0, 8) : [];

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      {/* 1. ACCESOS RÁPIDOS POR CATEGORÍA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1f3b25] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e0a96d]">
            <Layers size={14} className="text-[#4aa036]" />
            <span>CATEGORÍAS POPULARES • ACCESO RÁPIDO</span>
          </div>
          <Link 
            to="/catalogo" 
            className="text-xs font-bold text-gray-400 hover:text-[#e0a96d] flex items-center gap-1 transition group"
          >
            <span>Ver todas las categorías</span>
            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {activeCategoriesList.slice(0, 8).map((cat) => (
            <Link
              key={cat.slug || cat.id}
              to={`/categoria/${cat.slug}`}
              className="p-3 rounded-2xl bg-[#0c1a10] hover:bg-[#152e1c] border border-[#1f3b25] hover:border-[#4aa036] transition-all text-center flex flex-col items-center justify-center gap-1.5 shadow-sm group hover:-translate-y-0.5"
            >
              <div className="w-8 h-8 rounded-full bg-[#142918] group-hover:bg-[#204226] border border-[#23452b] flex items-center justify-center text-[#4aa036] group-hover:text-[#e0a96d] transition-colors">
                <Leaf size={15} />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-gray-200 group-hover:text-white line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. ENCABEZADO DE PRODUCTOS DESTACADOS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#1f3b25] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e0a96d] mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4aa036] animate-pulse"></span>
            <span>CULTISHOP POSADAS • NOVEDADES & DESTACADOS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight">
            ÚLTIMOS INGRESOS Y <span className="text-[#e0a96d] text-glow-gold">DESTACADOS</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Una selección especial de los insumos más elegidos y recién ingresados para potenciar cada etapa de tu cultivo.
          </p>
        </div>

        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#e0a96d] hover:text-white bg-[#142619] hover:bg-[#1f3b25] px-4 py-2.5 rounded-full border border-[#2d5a27] transition shadow-sm group shrink-0"
        >
          <span>Ir al Catálogo Completo</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 3. GRILLA DE PRODUCTOS (8 PRODUCTOS O ESQUELETOS) */}
      {loadingFeatured && displayProducts.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#0e1c12] border border-[#1b3422] p-4 flex flex-col space-y-4 animate-pulse shadow-lg"
            >
              <div className="w-full h-52 rounded-xl bg-[#142619] relative overflow-hidden flex items-center justify-center">
                <Leaf size={24} className="text-[#4aa036]/40 animate-pulse" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 bg-[#1b3422] rounded-full" />
                <div className="h-5 w-4/5 bg-[#1b3422] rounded-lg" />
                <div className="h-3 w-3/5 bg-[#142619] rounded-full" />
              </div>
              <div className="pt-2 border-t border-[#1a3320] flex items-center justify-between">
                <div className="h-6 w-20 bg-[#1b3422] rounded-lg" />
                <div className="h-8 w-24 bg-[#1b3422] rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : displayProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="p-10 text-center bg-[#0d1a11] border border-[#1f3b25] rounded-3xl space-y-3">
          <p className="text-gray-300 text-sm">Explorá todo nuestro catálogo con stock completo disponible.</p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2d5a27] text-white text-xs font-bold"
          >
            <span>Ver Catálogo</span>
          </Link>
        </div>
      )}

      {/* 4. BANNER ESTÉTICO Y BOTÓN GRANDE "EXPLORAR TIENDA / CATÁLOGO COMPLETO" */}
      <div className="relative rounded-3xl p-8 sm:p-12 border border-[#2d5a27] bg-gradient-to-br from-[#0c1b11] via-[#102416] to-[#08120b] shadow-2xl overflow-hidden text-center space-y-6">
        {/* Luces de fondo y detalles visuales */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#4aa036]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#e0a96d]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1b3620] border border-[#2f5e38] text-[11px] font-black uppercase tracking-wider text-[#e0a96d]">
            <Sparkles size={13} className="text-[#e0a96d]" />
            <span>MÁS DE 630 PRODUCTOS EN STOCK PERMANENTE</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight leading-tight">
            ¿Buscás más opciones para tu cultivo?
          </h3>

          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            Contamos con fertilizantes de todas las marcas, iluminación LED y halógena, carpas indoor, sustratos premium, sistemas de riego y parafernalia completa con asesoramiento profesional en Posadas, Misiones.
          </p>
        </div>

        {/* BOTÓN PRINCIPAL PROMINENTE */}
        <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/catalogo"
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#2d5a27] via-[#38761d] to-[#4aa036] hover:from-[#38761d] hover:to-[#52b339] text-white font-black text-sm sm:text-base px-8 sm:px-10 py-4 sm:py-4.5 rounded-2xl shadow-xl shadow-[#2d5a27]/50 hover:shadow-[#4aa036]/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-[#4aa036]/60 uppercase tracking-wider font-heading group w-full sm:w-auto"
          >
            <Package size={22} className="text-[#e0a96d] group-hover:rotate-12 transition-transform duration-300" />
            <span>Explorar tienda y catálogo completo</span>
            <ArrowRight size={20} className="text-white group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </div>

        {/* Insignias de confianza rápidas debajo del botón */}
        <div className="relative z-10 pt-4 border-t border-[#1a3320]/80 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] font-semibold text-gray-400">
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-[#e0a96d]" />
            <span>Filtros interactivos por categoría</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame size={13} className="text-[#4aa036]" />
            <span>Buscador en tiempo real</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Package size={13} className="text-[#e0a96d]" />
            <span>Paginación fluida y stock sincronizado</span>
          </div>
        </div>
      </div>

      {/* 5. TARJETAS DE BENEFICIOS Y CONFIANZA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-4">
        {/* Beneficio 1: Retiro Local */}
        <div className="p-6 rounded-2xl bg-[#0c1a10] border border-[#1f3b25] flex items-start gap-4 shadow-sm hover:border-[#2d5a27] transition">
          <div className="p-3 rounded-xl bg-[#142619] border border-[#23422a] text-[#4aa036] shrink-0">
            <Store size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white font-heading uppercase tracking-wide">
              Retiro por Local Sin Costo
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Av. López y Planes casi Lavalle ("adentro del ACUARIUM"), Posadas, Misiones.
            </p>
          </div>
        </div>

        {/* Beneficio 2: Envíos Locales y Nacionales */}
        <div className="p-6 rounded-2xl bg-[#0c1a10] border border-[#1f3b25] flex items-start gap-4 shadow-sm hover:border-[#2d5a27] transition">
          <div className="p-3 rounded-xl bg-[#142619] border border-[#23422a] text-[#e0a96d] shrink-0">
            <Truck size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white font-heading uppercase tracking-wide">
              Envíos Locales y a Todo el País
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Envíos por moto, Uber o Lider Mandados en Posadas. A todo el país por Correo Argentino o Vía Cargo.
            </p>
          </div>
        </div>

        {/* Beneficio 3: Asesoramiento */}
        <div className="p-6 rounded-2xl bg-[#0c1a10] border border-[#1f3b25] flex items-start gap-4 shadow-sm hover:border-[#2d5a27] transition">
          <div className="p-3 rounded-xl bg-[#142619] border border-[#23422a] text-[#4aa036] shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white font-heading uppercase tracking-wide">
              Asesoramiento Cannábico Experto
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Te orientamos en dosificación, prevención de plagas y armado de salas para optimizar tu rendimiento.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

