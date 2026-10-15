import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  ChevronDown, 
  ChevronRight, 
  ArrowRight,
  Menu,
  X,
  Layers,
  Shield
} from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../assets/logo.png';
import { CATEGORIES } from '../data/categories';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

export const Navbar = () => {
  const { user } = useAuth();
  const { 
    totalItems, 
    formattedTotalPrice, 
    openCart, 
    favoritesCount,
    searchQuery,
    setSearchQuery,
    clearSearch
  } = useShop();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeDropdown, setActiveDropdown] = useState(null); // ID de la categoría abierta por clic
  const [hoveredCategory, setHoveredCategory] = useState(null); // ID de la categoría abierta por hover
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);

  const navRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const location = useLocation();

  // Sincronizar searchQuery si la URL cambia con un query param (ej: navegación externa o retroceso)
  useEffect(() => {
    const urlQuery = searchParams.get('search') || searchParams.get('q');
    if (urlQuery !== null && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  // Manejador de cambio en el input de búsqueda (filtrado en tiempo real)
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    // Si el usuario no está en el catálogo (/ o /productos), redirigir automáticamente
    if (location.pathname !== '/' && location.pathname !== '/productos') {
      navigate(val.trim() ? `/?search=${encodeURIComponent(val)}#catalogo` : '/#catalogo');
    } else {
      // Si ya está en /, actualizar los query params de forma limpia
      if (val.trim()) {
        setSearchParams({ search: val }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    }
  };

  // Manejador de envío de búsqueda (presionar Enter o hacer clic en la lupa)
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();

    if (location.pathname !== '/' && location.pathname !== '/productos') {
      navigate(query ? `/?search=${encodeURIComponent(query)}#catalogo` : '/#catalogo');
    } else {
      if (query) {
        setSearchParams({ search: query }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
      // Desplazamiento suave hacia la sección de productos
      const catalogEl = document.getElementById('catalogo');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    clearSearch();
    if (location.pathname === '/' || location.pathname === '/productos') {
      setSearchParams({}, { replace: true });
    }
  };

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setActiveDropdown(null);
    setHoveredCategory(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Cerrar dropdown al hacer clic fuera del navbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
        setHoveredCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMouseEnter = (catId) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredCategory(catId);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 180);
  };

  const handleCategoryClick = (e, cat) => {
    if (cat.subcategories && cat.subcategories.length > 0) {
      e.preventDefault();
      // Alterna el dropdown al hacer clic
      setActiveDropdown((prev) => (prev === cat.id ? null : cat.id));
    }
  };

  const toggleMobileCategory = (catId) => {
    setExpandedMobileCategory((prev) => (prev === catId ? null : catId));
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
    setHoveredCategory(null);
  };

  // Evitar scroll en el body cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header ref={navRef} className="w-full bg-[#0d1a11] text-gray-200 border-b border-[#1f3b25] sticky top-0 z-50 backdrop-blur-md">
      {/* Barra principal de navegación */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        <div className="w-full md:w-auto flex items-center justify-between">
          {/* Logotipo oficial con imagen y textos */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 hover:opacity-95 transition group">
            <img
              src={logo}
              alt="CultiShop Logo Oficial"
              className="h-10 sm:h-11 md:h-12 w-auto object-contain rounded-xl shadow-md border border-[#2d5a27]/60 group-hover:border-[#4aa036] transition"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white font-heading">
                CULTI<span className="text-[#e0a96d]">SHOP</span>
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest text-gray-300 font-semibold uppercase">
                GROW • CULTIVA • CRECE
              </span>
            </div>
          </Link>

          {/* Acciones móviles compactas (visibles solo en < md) */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
            {/* Botón Favoritos en móvil */}
            <Link 
              to="/favoritos" 
              className="relative p-2 text-gray-300 hover:text-[#e0a96d] rounded-xl bg-[#142619] border border-[#23422a] transition active:scale-95"
              aria-label={`Ver favoritos, ${favoritesCount} guardados`}
            >
              <Heart 
                size={18} 
                className={favoritesCount > 0 ? "fill-[#e0a96d] text-[#e0a96d]" : ""} 
              />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#e0a96d] text-black text-[9px] font-black rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Botón Carrito compacto en móvil */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Mi Carrito, ${totalItems} productos`}
              className="relative p-2 text-gray-300 hover:text-white rounded-xl bg-[#142619] border border-[#23422a] hover:border-[#4aa036] transition active:scale-95 flex items-center justify-center"
            >
              <ShoppingBag size={18} className="text-[#4aa036]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#e0a96d] text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Botón Menú hamburguesa */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-gray-300 hover:text-white rounded-xl bg-[#142619] border border-[#23422a] hover:border-[#4aa036] transition active:scale-95"
              aria-label="Abrir menú de categorías"
            >
              <Menu size={20} className="text-[#e0a96d]" />
            </button>
          </div>
        </div>

        {/* Buscador de productos */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-5/12 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar fertilizantes, kits, Mamboretá..."
            className="w-full py-2 sm:py-2.5 pl-4 pr-16 sm:pr-20 rounded-full bg-[#142619] text-gray-100 placeholder-gray-400 border border-[#23422a] focus:outline-none focus:border-[#4aa036] text-xs sm:text-sm shadow-inner transition"
            aria-label="Buscar insumos o productos"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-9 sm:right-10 top-2 sm:top-2.5 p-1 text-gray-400 hover:text-white transition rounded-full hover:bg-[#1f3b25]"
              title="Borrar búsqueda"
              aria-label="Borrar búsqueda"
            >
              <X size={14} />
            </button>
          )}
          <button 
            type="submit" 
            className="absolute right-3.5 top-2 sm:top-2.5 text-gray-400 hover:text-[#e0a96d] transition"
            title="Buscar en la tienda"
            aria-label="Buscar en la tienda"
          >
            <Search size={18} />
          </button>
        </form>

        {/* Acceso a Carrito en Escritorio (oculto en móvil) */}
        <div className="hidden md:flex items-center gap-4 md:w-auto justify-end">
          <button
            type="button"
            onClick={openCart}
            aria-label={`Mi Carrito, ${totalItems} productos por ${formattedTotalPrice}`}
            className="flex items-center gap-2.5 bg-[#122317] hover:bg-[#18331f] px-4 py-2.5 rounded-xl border border-[#23422a] hover:border-[#4aa036] cursor-pointer transition shadow-sm group active:scale-95 text-left"
          >
            <div className="relative">
              <ShoppingBag className="text-[#4aa036] group-hover:scale-105 transition" size={20} />
              <span className={`absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-[#e0a96d] text-black text-[10px] font-black rounded-full flex items-center justify-center transition-transform ${totalItems > 0 ? 'scale-110 shadow-sm shadow-black/50' : ''}`}>
                {totalItems}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-[10px] text-gray-400 uppercase font-semibold">Mi Carrito</span>
              <span className="text-xs font-bold text-white group-hover:text-[#e0a96d] transition font-heading">
                {formattedTotalPrice}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Menú de categorías corporativo con Dropdowns */}
      <nav className="bg-[#18311d] border-t border-[#234428] text-gray-200 relative">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          
          {/* Tira horizontal deslizable de categorías para móviles y tablets */}
          <div className="flex lg:hidden items-center gap-2 overflow-x-auto py-2 w-full no-scrollbar text-xs scroll-smooth">
            <Link 
              to="/" 
              className="text-white bg-[#2d5a27] hover:bg-[#38761d] px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition shrink-0 uppercase font-heading shadow-sm whitespace-nowrap"
            >
              TODOS
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/categoria/${cat.slug}`}
                className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-[#e0a96d] font-semibold text-xs border border-[#23422a] shrink-0 transition"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Menú horizontal de escritorio (pantallas >= lg) */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 w-full justify-between">
            <div className="flex items-center gap-1 xl:gap-2">
              <Link 
                to="/" 
                className="text-white bg-[#2d5a27] hover:bg-[#38761d] px-3 py-1.5 rounded-md text-xs font-bold tracking-wider transition shrink-0 uppercase font-heading shadow-sm"
              >
                TODOS
              </Link>

              {CATEGORIES.map((cat, index) => {
                const hasSub = cat.subcategories && cat.subcategories.length > 0;
                const isOpen = hasSub && (activeDropdown === cat.id || hoveredCategory === cat.id);

                return (
                  <div
                    key={cat.id}
                    className="relative"
                    onMouseEnter={() => hasSub && handleMouseEnter(cat.id)}
                    onMouseLeave={hasSub ? handleMouseLeave : undefined}
                  >
                    {hasSub ? (
                      <button
                        type="button"
                        onClick={(e) => handleCategoryClick(e, cat)}
                        aria-expanded={isOpen}
                        className={`flex items-center gap-1 py-2.5 px-2 xl:px-2.5 text-xs xl:text-sm font-semibold transition tracking-wide rounded-lg select-none ${
                          isOpen
                            ? 'text-[#e0a96d] bg-[#122416]'
                            : 'hover:text-[#e0a96d] hover:bg-[#152a1a]/60'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <ChevronDown
                          size={13}
                          className={`transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#e0a96d]' : 'text-gray-400'
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        to={`/categoria/${cat.slug}`}
                        className="flex items-center gap-1 py-2.5 px-2 xl:px-2.5 text-xs xl:text-sm font-semibold transition tracking-wide rounded-lg hover:text-[#e0a96d] hover:bg-[#152a1a]/60 select-none"
                      >
                        <span>{cat.name}</span>
                      </Link>
                    )}

                    {/* Menú desplegable con diseño corporativo */}
                    {hasSub && isOpen && (
                      <div
                        className={`absolute top-full mt-1 min-w-[230px] bg-[#0c1a10] border border-[#2d5a27] rounded-xl shadow-2xl z-50 py-2.5 backdrop-blur-md animate-in fade-in duration-150 ${
                          index >= 4 ? 'right-0' : 'left-0'
                        }`}
                      >
                        {/* Acento dorado superior */}
                        <div className="absolute top-0 left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-[#e0a96d] to-transparent rounded-full pointer-events-none" />

                        {/* Encabezado: Ver todo en la categoría */}
                        <Link
                          to={`/categoria/${cat.slug}`}
                          onClick={closeDropdowns}
                          className="flex items-center justify-between px-3.5 py-1.5 text-xs font-bold text-[#e0a96d] hover:text-white hover:bg-[#162d1d] rounded-lg mx-1.5 transition group/header"
                        >
                          <span>Ver todo {cat.name}</span>
                          <ArrowRight size={13} className="group-hover/header:translate-x-1 transition-transform" />
                        </Link>

                        <div className="my-1.5 border-t border-[#1a3320]" />

                        {/* Lista de subcategorías */}
                        <div className="space-y-0.5">
                          {cat.subcategories.map((sub) => (
                            <Link
                              key={sub.slug}
                              to={`/categoria/${cat.slug}/${sub.slug}`}
                              onClick={closeDropdowns}
                              className="flex items-center justify-between px-3.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-[#162d1d] hover:translate-x-1 transition-all rounded-lg mx-1.5 group/item"
                            >
                              <span>{sub.name}</span>
                              <ChevronRight size={12} className="opacity-0 group-hover/item:opacity-100 text-[#4aa036] transition-opacity" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Enlaces de favoritos y cuenta a la derecha */}
            <div className="flex items-center gap-4 pl-3 border-l border-[#24452a] shrink-0 text-xs font-semibold">
              <Link 
                to="/favoritos" 
                className="flex items-center gap-1.5 hover:text-[#e0a96d] transition group"
              >
                <Heart 
                  size={15} 
                  className={`transition-colors ${favoritesCount > 0 ? "fill-[#e0a96d] text-[#e0a96d]" : "group-hover:text-[#e0a96d]"}`} 
                /> 
                <span>Favoritos</span>
                {favoritesCount > 0 && (
                  <span className="min-w-4 h-4 px-1 bg-[#e0a96d] text-black text-[10px] font-black rounded-full flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </Link>
              <Link to="/ingresar" className="flex items-center gap-1.5 hover:text-[#e0a96d] transition">
                <User size={15} className={user ? 'text-[#4aa036]' : ''} />
                <span>{user ? user.name.split(' ')[0] : 'Ingresar'}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Drawer / Menú lateral móvil con acordeones (Renderizado con Portal en document.body para z-index 9999 absoluto) */}
      {isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] lg:hidden" style={{ zIndex: 9999 }}>
          {/* Backdrop con desenfoque de bloqueo total */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm transition-opacity"
            style={{ zIndex: 9998 }}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Panel deslizante en la capa superior absoluta */}
          <div 
            className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-[#09150c] border-r border-[#1f3b25] z-[9999] flex flex-col shadow-2xl overflow-y-auto"
            style={{ zIndex: 9999 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            {/* Header del drawer */}
            <div className="p-4 border-b border-[#1b3420] flex items-center justify-between bg-[#07110a] sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <img src={logo} alt="CultiShop Logo" className="h-8 w-auto rounded-lg" />
                <span className="font-heading font-black text-white text-base tracking-wider">
                  CULTI<span className="text-[#e0a96d]">SHOP</span>
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#162d1d] transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido del drawer */}
            <div className="p-4 space-y-4 flex-grow">
              {/* Buscador en drawer móvil */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Buscar fertilizantes, kits..."
                  className="w-full py-2.5 pl-3.5 pr-16 rounded-xl bg-[#142619] text-gray-100 placeholder-gray-400 border border-[#23422a] focus:outline-none focus:border-[#4aa036] text-xs shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-9 top-2.5 p-0.5 text-gray-400 hover:text-white"
                    title="Borrar"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-[#e0a96d]"
                  title="Buscar"
                >
                  <Search size={16} />
                </button>
              </form>

              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full block text-center py-2.5 px-4 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs uppercase tracking-wider transition shadow-md"
              >
                Ver Todos Los Productos
              </Link>

              {/* Botón Carrito en menú móvil */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openCart();
                }}
                className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-[#142619] border border-[#23422a] hover:border-[#4aa036] text-gray-200 text-xs font-bold transition shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-[#4aa036]" />
                  <span>Mi Carrito</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#e0a96d] font-heading">{formattedTotalPrice}</span>
                  <span className="bg-[#e0a96d] text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                </div>
              </button>

              <div className="pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-2 flex items-center gap-1.5">
                  <Layers size={13} className="text-[#e0a96d]" />
                  <span>Categorías de la Tienda</span>
                </div>

                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => {
                    const hasSub = cat.subcategories && cat.subcategories.length > 0;
                    const isExpanded = expandedMobileCategory === cat.id;

                    return (
                      <div key={cat.id} className="border border-[#18311d] rounded-xl overflow-hidden bg-[#0d1e12]">
                        {hasSub ? (
                          <>
                            <button
                              onClick={() => toggleMobileCategory(cat.id)}
                              className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-gray-200 hover:text-[#e0a96d] transition text-left"
                            >
                              <span>{cat.name}</span>
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 text-gray-400 ${
                                  isExpanded ? 'rotate-180 text-[#e0a96d]' : ''
                                }`}
                              />
                            </button>

                            {isExpanded && (
                              <div className="bg-[#09150d] px-3.5 py-2 space-y-1 border-t border-[#162d1b]">
                                <Link
                                  to={`/categoria/${cat.slug}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center justify-between py-1.5 text-xs font-bold text-[#e0a96d] hover:text-white transition"
                                >
                                  <span>Ver todo {cat.name}</span>
                                  <ArrowRight size={12} />
                                </Link>
                                {cat.subcategories.map((sub) => (
                                  <Link
                                    key={sub.slug}
                                    to={`/categoria/${cat.slug}/${sub.slug}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block py-1.5 text-xs text-gray-300 hover:text-white hover:translate-x-1 transition-all pl-2 border-l border-[#224428]"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <Link
                            to={`/categoria/${cat.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-3.5 py-2.5 text-xs font-semibold text-gray-200 hover:text-[#e0a96d] transition"
                          >
                            {cat.name}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Enlaces de cuenta y ayuda */}
              <div className="pt-4 border-t border-[#18311d] space-y-2">
                <Link
                  to="/favoritos"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white rounded-lg hover:bg-[#122416] transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart size={16} className={favoritesCount > 0 ? "fill-[#e0a96d] text-[#e0a96d]" : "text-[#e0a96d]"} /> 
                    <span>Favoritos</span>
                  </div>
                  {favoritesCount > 0 && (
                    <span className="bg-[#e0a96d] text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-xs font-bold bg-[#2a1e0f] border border-[#e0a96d] text-[#e0a96d] hover:bg-[#e0a96d] hover:text-black rounded-lg transition shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Shield size={15} className="fill-current" />
                      <span>Panel de Administración</span>
                    </div>
                    <ArrowRight size={13} />
                  </Link>
                )}
                <Link
                  to="/ingresar"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white rounded-lg hover:bg-[#122416] transition"
                >
                  <User size={16} className={user ? 'text-[#4aa036]' : 'text-[#e0a96d]'} />
                  <span>{user ? `Hola, ${user.name.split(' ')[0]}` : 'Mi Cuenta / Ingresar'}</span>
                </Link>
              </div>
            </div>

            {/* Footer del drawer con WhatsApp */}
            <div className="p-4 border-t border-[#1b3420] bg-[#07110a]">
              <a
                href="https://wa.me/5493764356995?text=Hola%20CultiShop!%20Quiero%20hacer%20un%20pedido%20o%20consulta"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl bg-[#122517] border border-[#25d366]/50 text-[#25d366] hover:bg-[#25d366] hover:text-black text-xs font-bold transition duration-200 group shadow-md"
              >
                <WhatsAppIcon size={17} className="text-[#25d366] group-hover:text-black transition" />
                <span>Atención por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
