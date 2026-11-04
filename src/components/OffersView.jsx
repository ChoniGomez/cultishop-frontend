import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Flame, 
  Tag, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  ChevronRight, 
  Filter, 
  Search, 
  X, 
  RefreshCw,
  Percent,
  Instagram,
  ShoppingBag,
  Bell,
  Sparkles
} from 'lucide-react';
import { useShop, getProductPriceInfo, formatPrice, isProductOutOfStock, parsePrice, getProductOptions } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { WhatsAppIcon } from './WhatsAppIcon';

export const OffersView = () => {
  const { 
    products, 
    offersProducts, 
    loadingOffers, 
    fetchOffersProducts, 
    categories: shopCategories,
    loadingProducts,
    fetchProducts 
  } = useShop();

  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortOption, setSortOption] = useState('discount'); // 'discount', 'price_asc', 'price_desc', 'newest'
  const [filterSearch, setFilterSearch] = useState('');

  // Cargar ofertas al montar el componente (ejecución única para evitar bloqueos y tirones de scroll)
  useEffect(() => {
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.height = '';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    if (fetchOffersProducts) {
      fetchOffersProducts();
    }
    if (products.length === 0 && fetchProducts) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Consolidar fuente de ofertas (del endpoint dedicado o derivado del catálogo completo)
  const baseOffersList = useMemo(() => {
    return Array.isArray(offersProducts) ? offersProducts : [];
  }, [offersProducts]);

  const maxOfferDiscount = useMemo(
    () => Math.max(0, ...baseOffersList.map((product) => getProductPriceInfo(product).discountPercentage || 0)),
    [baseOffersList]
  );

  // Lista de categorías que tienen productos en oferta para generar las pastillas dinámicas
  const availableCategories = useMemo(() => {
    const catsMap = new Map();
    baseOffersList.forEach((prod) => {
      const catName = prod.category || 'Otros';
      const catSlug = prod.category_slug || catName.toLowerCase().trim().replace(/\s+/g, '-');
      catsMap.set(catSlug, (catsMap.get(catSlug) || 0) + 1);
    });

    const pills = [{ slug: 'todos', name: 'Todas las Ofertas', count: baseOffersList.length }];
    catsMap.forEach((count, slug) => {
      // Buscar nombre legible
      const found = shopCategories.find((c) => c.slug === slug || String(c.id) === slug);
      const name = found ? found.name : slug.charAt(0).toUpperCase() + slug.slice(1);
      pills.push({ slug, name, count });
    });
    return pills;
  }, [baseOffersList, shopCategories]);

  // Filtrado y ordenamiento de las ofertas
  const filteredOffers = useMemo(() => {
    let list = [...baseOffersList];

    // 1. Filtro por categoría
    if (selectedCategory !== 'todos') {
      list = list.filter((p) => {
        const catSlug = p.category_slug || (p.category ? p.category.toLowerCase().trim().replace(/\s+/g, '-') : '');
        return catSlug === selectedCategory || (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));
      });
    }

    // 2. Filtro por buscador interno
    if (filterSearch.trim() !== '') {
      const q = filterSearch.toLowerCase().trim();
      list = list.filter((p) => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 3. Ordenamiento
    if (sortOption === 'discount') {
      list.sort((a, b) => {
        const pInfoA = getProductPriceInfo(a);
        const pInfoB = getProductPriceInfo(b);
        return (pInfoB.discountPercentage || 0) - (pInfoA.discountPercentage || 0);
      });
    } else if (sortOption === 'price_asc') {
      list.sort((a, b) => {
        const pInfoA = getProductPriceInfo(a);
        const pInfoB = getProductPriceInfo(b);
        return pInfoA.finalPrice - pInfoB.finalPrice;
      });
    } else if (sortOption === 'price_desc') {
      list.sort((a, b) => {
        const pInfoA = getProductPriceInfo(a);
        const pInfoB = getProductPriceInfo(b);
        return pInfoB.finalPrice - pInfoA.finalPrice;
      });
    } else if (sortOption === 'newest') {
      list.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    }

    return list;
  }, [baseOffersList, selectedCategory, filterSearch, sortOption]);

  const isLoading = loadingOffers && baseOffersList.length === 0;

  return (
    <div className="w-full min-h-screen bg-[#0a140d] text-gray-100 pb-24 relative overflow-y-visible">
      {/* Breadcrumb navegable */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-[#4aa036] transition flex items-center gap-1">
            <span>Inicio</span>
          </Link>
          <ChevronRight size={13} className="text-gray-600" />
          <span className="text-[#e0a96d] font-bold">Zona de Ofertas</span>
        </nav>
      </div>

      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="h-64 rounded-3xl bg-[#122317] border border-[#1f3b25] animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#122317] border border-[#1f3b25] rounded-2xl p-4 h-96 space-y-4">
                <div className="h-52 bg-[#0b1610] rounded-xl" />
                <div className="h-4 bg-[#1f3b25] rounded w-3/4" />
                <div className="h-3 bg-[#1f3b25] rounded w-1/2" />
                <div className="h-8 bg-[#1f3b25] rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : baseOffersList.length === 0 ? (
        /* ESTADO VACÍO CUANDO NO HAY OFERTAS ACTIVAS EN LA TIENDA */
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#122417] via-[#0e1d13] to-[#0a150e] border border-[#23422a] p-8 sm:p-14 text-center shadow-2xl space-y-7">
            {/* Luces de fondo decorativas */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Icono animado */}
            <div className="relative z-10 inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#1b3522] to-[#102315] border border-[#38761d] flex items-center justify-center text-[#e0a96d] shadow-xl shadow-black/40">
                <Flame size={38} className="text-[#e0a96d] animate-pulse" />
              </div>
            </div>

            {/* Textos y Badge */}
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18311d] border border-[#2d5a27] text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Bell size={13} className="text-[#e0a96d]" />
                <span>Próximamente nuevos descuentos</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-heading tracking-tight leading-tight">
                Sección de Ofertas
              </h2>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Por el momento no contamos con ofertas activas. ¡Mantente atento a nuestras redes sociales para enterarte antes que nadie de los próximos descuentos y sorpresas!
              </p>
            </div>

            {/* Botones de Acción */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/culti.shop/"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white font-bold text-xs sm:text-sm transition-all shadow-lg hover:scale-105"
              >
                <Instagram size={17} />
                <span>Seguir en Instagram (@culti.shop)</span>
              </a>

              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs sm:text-sm border border-[#4aa036]/40 transition-all shadow-md hover:scale-105"
              >
                <ShoppingBag size={17} />
                <span>Ver Catálogo Completo</span>
              </Link>

              <a
                href="https://wa.me/5493764356995?text=Hola%20CultiShop!%20Quería%20consultar%20por%20promociones%20y%20combos%20especiales"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#142619] hover:bg-[#1f3b25] text-gray-200 border border-[#23422a] font-bold text-xs sm:text-sm transition"
              >
                <WhatsAppIcon size={17} />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>

            {/* Pastillas informativas */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#1f3b25]/80 text-left">
              <div className="p-4 rounded-2xl bg-[#0b1610]/70 border border-[#1f3b25]">
                <div className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                  <Truck size={14} className="text-[#4aa036]" />
                  <span>Envíos a todo el país</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Entrega express en Posadas y despachos protegidos por Correo a toda Argentina.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b1610]/70 border border-[#1f3b25]">
                <div className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#e0a96d]" />
                  <span>Asesoramiento experto</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Te orientamos en tablas de nutrición, plagas y optimización de tu cultivo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0b1610]/70 border border-[#1f3b25]">
                <div className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                  <Percent size={14} className="text-emerald-400" />
                  <span>Combos a medida</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Precios especiales en compras por mayor y bultos cerrados para proyectos y clubes.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VISTA COMPLETA CUANDO HAY OFERTAS ACTIVAS */
        <>
          {/* HERO BANNER OFERTAS BOTÁNICAS */}
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#122417] via-[#18311d] to-[#0a150e] border border-[#23422a] p-6 sm:p-10 shadow-2xl">
              {/* Luces de fondo decorativas */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#e0a96d]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#38761d]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600/30 to-amber-500/20 border border-red-500/40 text-red-300 text-xs font-black tracking-wider uppercase shadow-sm">
                  <Flame size={14} className="text-[#e0a96d] animate-pulse" />
                  <span>Promociones Botánicas Exclusivas</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading leading-tight tracking-tight">
                  Ahorrá en grande con las <br className="hidden sm:block" />
                  <span className="text-[#e0a96d] text-glow-gold">Ofertas CultiShop</span>
                </h1>

                <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Aprovechá descuentos directos en fertilizantes importados y nacionales, sustratos premium,
                  iluminación y accesorios de cultivo con entrega rápida en Posadas y envíos garantizados.
                </p>

                {/* Pastillas de Beneficios */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-1.5 bg-[#0e1d12]/90 border border-[#2d5a27] px-3 py-1.5 rounded-xl text-xs text-gray-200">
                    <Percent size={13} className="text-[#e0a96d]" />
                    <span className="font-semibold">
                      {maxOfferDiscount > 0
                        ? `Hasta ${maxOfferDiscount}% OFF en productos seleccionados`
                        : 'Productos seleccionados en oferta'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#0e1d12]/90 border border-[#2d5a27] px-3 py-1.5 rounded-xl text-xs text-gray-200">
                    <Truck size={13} className="text-[#4aa036]" />
                    <span className="font-semibold">Retiro en local o envío inmediato</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#0e1d12]/90 border border-[#2d5a27] px-3 py-1.5 rounded-xl text-xs text-gray-200">
                    <ShieldCheck size={13} className="text-[#e0a96d]" />
                    <span className="font-semibold">Stock 100% fresco y testeado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONTROLES DE FILTRADO, BÚSQUEDA Y ORDENAMIENTO */}
          <div className="max-w-7xl mx-auto px-4 pt-6 pb-4 space-y-4">
            {/* Barra superior: Buscador interno y Ordenamiento */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#122317] p-3 rounded-2xl border border-[#1f3b25] shadow-md">
              {/* Buscador interno de ofertas */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Filtrar ofertas por nombre, marca o tipo..."
                  className="w-full py-2 pl-9 pr-8 rounded-xl bg-[#0b1610] text-gray-100 placeholder-gray-400 border border-[#23422a] focus:outline-none focus:border-[#4aa036] text-xs transition"
                />
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                {filterSearch && (
                  <button
                    type="button"
                    onClick={() => setFilterSearch('')}
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                    title="Limpiar filtro"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Selector de ordenamiento */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400 font-semibold hidden sm:inline">Ordenar:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-[#0b1610] text-gray-200 border border-[#23422a] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#4aa036] cursor-pointer"
                >
                  <option value="discount">Mayor Descuento (%)</option>
                  <option value="price_asc">Menor Precio</option>
                  <option value="price_desc">Mayor Precio</option>
                  <option value="newest">Nuevas Ofertas</option>
                </select>
              </div>
            </div>

            {/* Tira deslizable de categorías para ofertas */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {availableCategories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`whitespace-nowrap px-3.5 py-2 rounded-xl font-bold text-xs transition-all duration-200 flex items-center gap-2 shrink-0 border ${
                      isSelected
                        ? 'bg-[#2d5a27] text-white border-[#4aa036] shadow-md shadow-[#4aa036]/20'
                        : 'bg-[#122317] text-gray-300 hover:text-[#e0a96d] border-[#1f3b25] hover:border-[#38761d]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#0a140d] text-gray-400'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CONTADOR DE RESULTADOS */}
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-[#e0a96d]" />
              <span>
                Mostrando <strong className="text-white">{filteredOffers.length}</strong> {filteredOffers.length === 1 ? 'insumo en oferta' : 'insumos en oferta'}
              </span>
            </div>
            {selectedCategory !== 'todos' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('todos')}
                className="text-[#e0a96d] hover:underline font-bold text-xs"
              >
                Quitar filtro de categoría
              </button>
            )}
          </div>

          {/* GRILLA DE PRODUCTOS EN OFERTA */}
          <div className="max-w-7xl mx-auto px-4 py-4">
            {filteredOffers.length === 0 ? (
              <div className="text-center py-20 px-4 bg-[#122317] rounded-3xl border border-[#1f3b25] max-w-2xl mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#18311d] border border-[#2d5a27] flex items-center justify-center text-[#e0a96d] mx-auto shadow-lg">
                  <Flame size={28} className="text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white font-heading">
                  No se encontraron ofertas con estos filtros
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  No hay productos con descuento que coincidan con la búsqueda o categoría elegida. Podés ver todas las ofertas disponibles o consultar por promociones en WhatsApp.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('todos');
                      setFilterSearch('');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs transition shadow-md"
                  >
                    Ver todas las ofertas
                  </button>
                  <a
                    href="https://wa.me/5493764356995?text=Hola%20CultiShop!%20Quería%20consultar%20por%20ofertas%20y%20combos%20especiales"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-200 border border-[#23422a] font-bold text-xs transition"
                  >
                    <WhatsAppIcon size={15} />
                    <span>Consultar por WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredOffers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* CALL TO ACTION FLOTANTE DE COMBOS Y WHATSAPP */}
          <div className="max-w-7xl mx-auto px-4 pt-10">
            <div className="rounded-3xl bg-gradient-to-r from-[#0d1c12] via-[#142c1b] to-[#0d1c12] border border-[#234428] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs font-bold text-[#e0a96d] uppercase tracking-wider block">
                  ¿Buscás descuentos por bulto cerrado o combos armados?
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                  Asesorate con el equipo CultiShop en Posadas
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm max-w-xl">
                  Coordinamos presupuestos a medida para cultivadores, clubes y proyectos botánicos con precios mayoristas y formas de pago flexibles.
                </p>
              </div>
              <a
                href="https://wa.me/5493764356995?text=Hola%20CultiShop!%20Quiero%20consultar%20por%20combos%20y%20descuentos%20especiales"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20ba5a] text-black font-extrabold px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-[#25d366]/20 hover:scale-105 shrink-0"
              >
                <WhatsAppIcon size={18} />
                <span>Consultar por Combos Especiales</span>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OffersView;

