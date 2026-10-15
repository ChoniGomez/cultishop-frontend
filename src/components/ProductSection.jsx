import React, { useState, useEffect } from 'react';
import { Eye, Heart, ShoppingCart, CheckCircle, ShieldCheck, ChevronRight, ChevronLeft, Leaf, Package, ArrowLeft, Search, X, RefreshCw } from 'lucide-react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { CATEGORIES } from '../data/categories';
import { WhatsAppIcon } from './WhatsAppIcon';
import { ProductCard } from './ProductCard';
import { useShop } from '../context/ShopContext';

const PRODUCTS_PER_PAGE = 9;

export const ProductSection = () => {
  const { slug, category, subcategory } = useParams();
  const [searchParams] = useSearchParams();
  const { products, loadingProducts, searchQuery, setSearchQuery, clearSearch } = useShop();
  const currentCategorySlug = category || slug;
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);

  // Sincronizar si hay query param en la URL
  useEffect(() => {
    const urlQuery = searchParams.get('search') || searchParams.get('q');
    if (urlQuery !== null && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentCategorySlug) {
      setSelectedCategory(currentCategorySlug);
    } else {
      setSelectedCategory('todos');
    }
  }, [currentCategorySlug, subcategory]);

  // Resetear a página 1 cada vez que cambien los filtros o búsquedas
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, currentCategorySlug, subcategory]);

  const matchedCategory = CATEGORIES.find(c => c.slug === currentCategorySlug);
  const matchedSubcategory = matchedCategory?.subcategories?.find(s => s.slug === subcategory);

  const categories = [
    { id: 'todos', label: 'Todos los Productos' },
    { id: 'fertilizantes', label: 'Fertilizantes Namasté' },
    { id: 'control-de-plagas', label: 'Control De Plagas' },
    { id: 'transporte-legal', label: 'Transporte Legal' },
    { id: 'riego', label: 'Riego & Jardinería' },
    { id: 'kits', label: 'Kits' },
  ];

  // Función auxiliar para normalizar texto (sin tildes, minúsculas, espacios recortados)
  const normalizeText = (text) => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  const normalizedQuery = normalizeText(searchQuery);
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const isSearchActive = queryTokens.length > 0;

  const filteredProducts = products.filter(product => {
    // 1. Filtrado por búsqueda de texto
    if (isSearchActive) {
      const titleNorm = normalizeText(product.title);
      const catNorm = normalizeText(product.category);
      const descNorm = normalizeText(product.description);
      const badgeNorm = normalizeText(product.badge);
      const optionsNorm = (product.options || []).map(normalizeText);

      const matches = queryTokens.every(token => 
        titleNorm.includes(token) ||
        catNorm.includes(token) ||
        descNorm.includes(token) ||
        badgeNorm.includes(token) ||
        optionsNorm.some(opt => opt.includes(token))
      );

      if (!matches) return false;
    }

    // 2. Filtrado por categoría
    // Si hay búsqueda activa pero no hay categoría fija en la URL y selectedCategory es 'todos', busca en todo el catálogo
    const active = currentCategorySlug || (isSearchActive ? (selectedCategory !== 'todos' ? selectedCategory : null) : selectedCategory);
    if (!active || active === 'todos') return true;

    if (active === 'fertilizantes') {
      if (subcategory === 'control-de-plagas') return product.category === 'Control de Plagas';
      return product.category === 'Fertilizantes';
    }
    if (active === 'control-de-plagas') return product.category === 'Control de Plagas';
    if (active === 'transporte-legal') return product.category === 'Transporte Legal';
    if (active === 'riego') return product.category === 'Riego';
    if (active === 'kits') return product.category === 'Kits';
    if (active === 'sustratos-macetas') return product.category.toLowerCase().includes('sustrato') || product.category.toLowerCase().includes('maceta');

    return product.category.toLowerCase().includes(active.toLowerCase());
  });

  // Cálculos de Paginación (Exactamente 9 productos por defecto en cada página)
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validCurrentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === validCurrentPage) return;
    setCurrentPage(newPage);
    const catalogElement = document.getElementById('catalogo');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (validCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (validCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages];
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-14">
      {/* Breadcrumb si está navegando por categoría */}
      {matchedCategory && (
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 flex-wrap">
          <Link to="/" className="hover:text-[#4aa036] transition">Inicio</Link>
          <ChevronRight size={12} />
          <Link to={`/categoria/${matchedCategory.slug}`} className="hover:text-[#e0a96d] transition font-medium">
            {matchedCategory.name}
          </Link>
          {matchedSubcategory && (
            <>
              <ChevronRight size={12} />
              <span className="text-[#e0a96d] font-bold">{matchedSubcategory.name}</span>
            </>
          )}
        </div>
      )}

      {/* Encabezado con estética de flyers */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-[#1f3b25] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e0a96d] mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4aa036]"></span>
            {isSearchActive ? (
              <>RESULTADOS DE BÚSQUEDA • {filteredProducts.length} PRODUCTO{filteredProducts.length === 1 ? '' : 'S'}</>
            ) : (
              <>CULTISHOP • {matchedCategory ? matchedCategory.name.toUpperCase() : 'CATÁLOGO EN STOCK'}</>
            )}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white font-heading">
            {isSearchActive ? (
              <>
                RESULTADOS PARA <span className="text-[#e0a96d] text-glow-gold">"{searchQuery}"</span>
              </>
            ) : matchedSubcategory ? (
              <>
                {matchedCategory?.name.toUpperCase()}: <span className="text-[#e0a96d] text-glow-gold">{matchedSubcategory.name.toUpperCase()}</span>
              </>
            ) : matchedCategory ? (
              <>
                PRODUCTOS DE <span className="text-[#e0a96d] text-glow-gold">{matchedCategory.name.toUpperCase()}</span>
              </>
            ) : (
              <>
                CONTAMOS CON <span className="text-[#e0a96d] text-glow-gold">STOCK</span> DE TODOS NUESTROS PRODUCTOS
              </>
            )}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {isSearchActive
              ? `Mostrando los insumos encontrados para tu consulta en el catálogo de CultiShop.`
              : matchedSubcategory 
              ? `Explorá las mejores opciones en ${matchedSubcategory.name} con stock disponible y asesoramiento.`
              : matchedCategory
              ? `Explorá los insumos de ${matchedCategory.name} para tu cultivo en Posadas, Misiones.`
              : 'Encontrá los insumos de primera línea para potenciar y proteger tu cultivo.'}
          </p>
        </div>

        {/* Filtros de Categorías o botón volver al catálogo completo / limpiar búsqueda */}
        <div className="flex flex-wrap items-center gap-2">
          {isSearchActive && (
            <button
              type="button"
              onClick={clearSearch}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#142619] hover:bg-[#1f3b25] text-[#e0a96d] hover:text-white border border-[#2d5a27] transition shadow-sm active:scale-95"
              title="Limpiar filtro de búsqueda"
            >
              <X size={14} />
              <span>Limpiar búsqueda</span>
            </button>
          )}

          {matchedCategory ? (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#2d5a27] transition shadow-sm"
            >
              <ArrowLeft size={14} />
              <span>Ver todo el catálogo</span>
            </Link>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition border ${
                    selectedCategory === cat.id
                      ? 'bg-[#2d5a27] text-white border-[#4aa036] shadow-md shadow-black/40'
                      : 'bg-[#122317] text-gray-300 border-[#1f3b25] hover:text-[#e0a96d] hover:border-[#38761d]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Indicador de sincronización en segundo plano si ya hay productos visibles */}
      {loadingProducts && products.length > 0 && (
        <div className="mb-4 flex items-center justify-end">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-[#102315] border border-[#23422a] px-3.5 py-1 rounded-full shadow-sm">
            <RefreshCw size={11} className="animate-spin text-[#e0a96d]" />
            <span>Sincronizando con el servidor...</span>
          </span>
        </div>
      )}

      {/* Grilla de productos, esqueletos de carga o estados vacíos */}
      {loadingProducts && products.length === 0 ? (
        /* Esqueleto de Carga en Cuadrícula (Skeletons) */
        <div className="space-y-6">
          <div className="p-3 rounded-2xl bg-[#102315]/80 border border-[#23422a] flex items-center justify-center gap-2.5 text-xs text-emerald-300 font-medium shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-[#4aa036] animate-ping" />
            <span>Consultando catálogo de productos en tiempo real...</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#0e1c12] border border-[#1b3422] p-4 flex flex-col space-y-4 animate-pulse shadow-lg"
              >
                <div className="w-full h-56 rounded-xl bg-[#142619] relative overflow-hidden flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#1b3422]/60 flex items-center justify-center text-[#2d5a27]">
                    <Leaf size={20} className="text-[#4aa036]/50 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 bg-[#1b3422] rounded-full" />
                  <div className="h-5 w-4/5 bg-[#1b3422] rounded-lg" />
                  <div className="h-3 w-3/5 bg-[#142619] rounded-full" />
                </div>
                <div className="pt-2 border-t border-[#1a3320] flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-2.5 w-12 bg-[#142619] rounded-full" />
                    <div className="h-6 w-24 bg-[#1b3422] rounded-lg" />
                  </div>
                  <div className="h-9 w-28 bg-[#1b3422] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        isSearchActive ? (
          /* Estado vacío temático cuando la búsqueda no arroja resultados */
          <div className="p-10 sm:p-14 text-center bg-[#0d1a11] border border-[#1f3b25] rounded-3xl space-y-5 max-w-xl mx-auto my-8 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#2d5a27]/30 border border-[#4aa036]/50 flex items-center justify-center text-[#e0a96d] mx-auto shadow-inner">
              <Search size={28} className="text-[#e0a96d]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4aa036]">
                Sin coincidencias en el cultivo
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-heading leading-tight">
                No encontramos ningún cogollo o insumo con ese nombre en el invernadero
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
                No hubo resultados para <span className="text-[#e0a96d] font-semibold">"{searchQuery}"</span>. Probá buscando por marca (ej: <em>Namasté, Mamboretá</em>) o tipo de insumo (<em>fertilizante, plagas, contenedor, riego</em>).
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex items-center justify-center gap-2 bg-[#2d5a27] hover:bg-[#38761d] text-white px-5 py-2.5 rounded-full text-xs font-bold transition border border-[#4aa036]/50 shadow-md hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                <X size={15} />
                <span>Limpiar búsqueda y ver todo</span>
              </button>

              <a
                href={`https://wa.me/5493764356995?text=${encodeURIComponent(
                  `Hola CultiShop! Estuve buscando el insumo "${searchQuery}" en la tienda web y no lo encontré. ¿Tienen stock disponible en el local de Posadas?`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25d366] hover:bg-[#20ba5a] text-black font-bold px-5 py-2.5 rounded-full text-xs transition shadow-md hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                <WhatsAppIcon size={16} />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          /* Estado vacío para categorías sin productos */
          <div className="p-12 text-center bg-[#0d1a11] border border-[#1f3b25] rounded-3xl space-y-4 max-w-xl mx-auto my-8 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-[#2d5a27]/30 border border-[#4aa036]/50 flex items-center justify-center text-[#e0a96d] mx-auto">
              <Package size={24} />
            </div>
            <h3 className="text-xl font-bold text-white font-heading">
              Estamos sumando más stock a esta categoría
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Nuevos ingresos de {matchedSubcategory ? matchedSubcategory.name : matchedCategory?.name || 'esta sección'} están llegando a nuestro local. ¡Consultanos por WhatsApp y te confirmamos disponibilidad al instante!
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/5493764356995?text=Hola%20CultiShop!%20Consulto%20por%20stock%20de%20${encodeURIComponent(matchedSubcategory ? matchedSubcategory.name : matchedCategory?.name || 'productos')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20ba5a] text-black font-bold px-5 py-2.5 rounded-full text-xs transition shadow-md hover:scale-105"
              >
                <WhatsAppIcon size={16} />
                <span>Consultar por WhatsApp</span>
              </a>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white px-5 py-2.5 rounded-full text-xs font-bold border border-[#2d5a27] transition"
              >
                <span>Ver catálogo disponible</span>
              </Link>
            </div>
          </div>
        )
      ) : (
        <>
          {/* Grilla de productos (exactamente 9 por página en cuadrícula balanceada) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Componente de Paginación Inferior Estándar E-Commerce */}
          {totalPages > 1 && (
            <div className="mt-12 pt-6 border-t border-[#1f3b25] flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Información de productos mostrados */}
              <div className="text-xs text-gray-400 font-medium">
                Mostrando <span className="text-[#e0a96d] font-bold">{startIndex + 1}</span>–<span className="text-[#e0a96d] font-bold">{endIndex}</span> de <span className="text-white font-bold">{totalProducts}</span> productos
              </div>

              {/* Botones de navegación y números de página */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {/* Botón Anterior */}
                <button
                  type="button"
                  onClick={() => handlePageChange(validCurrentPage - 1)}
                  disabled={validCurrentPage === 1}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                    validCurrentPage === 1
                      ? 'bg-[#0f1d13] text-gray-600 border-[#1a3321] cursor-not-allowed opacity-50'
                      : 'bg-[#122317] hover:bg-[#1d3824] text-gray-200 hover:text-white border-[#23422a] hover:border-[#4aa036] active:scale-95 shadow-sm'
                  }`}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={15} />
                  <span>Anterior</span>
                </button>

                {/* Números de página */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum, idx) => {
                    if (pageNum === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-500 text-xs font-bold select-none">
                          ...
                        </span>
                      );
                    }

                    const isActive = pageNum === validCurrentPage;
                    return (
                      <button
                        key={`page-${pageNum}`}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`min-w-9 h-9 px-3 rounded-xl text-xs font-bold transition border flex items-center justify-center ${
                          isActive
                            ? 'bg-[#2d5a27] text-white border-[#4aa036] shadow-md shadow-black/40 font-black scale-105'
                            : 'bg-[#122317] hover:bg-[#1a3521] text-gray-300 hover:text-[#e0a96d] border-[#1f3b25] hover:border-[#2d5a27] active:scale-95'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Botón Siguiente */}
                <button
                  type="button"
                  onClick={() => handlePageChange(validCurrentPage + 1)}
                  disabled={validCurrentPage === totalPages}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                    validCurrentPage === totalPages
                      ? 'bg-[#0f1d13] text-gray-600 border-[#1a3321] cursor-not-allowed opacity-50'
                      : 'bg-[#122317] hover:bg-[#1d3824] text-gray-200 hover:text-white border-[#23422a] hover:border-[#4aa036] active:scale-95 shadow-sm'
                  }`}
                  aria-label="Página siguiente"
                >
                  <span>Siguiente</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Banner de confianza al pie de los productos (Directo de los flyers) */}
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
    </section>
  );
};
