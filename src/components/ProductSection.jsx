import React, { useState, useEffect } from 'react';
import { Eye, Heart, ShoppingCart, CheckCircle, ShieldCheck, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { WhatsAppIcon } from './WhatsAppIcon';
import { ProductCard } from './ProductCard';

export const ProductSection = () => {
  const { slug, category, subcategory } = useParams();
  const currentCategorySlug = category || slug;
  const [selectedCategory, setSelectedCategory] = useState('todos');

  useEffect(() => {
    if (currentCategorySlug) {
      setSelectedCategory(currentCategorySlug);
    } else {
      setSelectedCategory('todos');
    }
  }, [currentCategorySlug, subcategory]);

  const products = PRODUCTS;

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

  const filteredProducts = products.filter(product => {
    const active = currentCategorySlug || selectedCategory;
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
            CULTISHOP • {matchedCategory ? matchedCategory.name.toUpperCase() : 'CATÁLOGO EN STOCK'}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white font-heading">
            {matchedSubcategory ? (
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
            {matchedSubcategory 
              ? `Explorá las mejores opciones en ${matchedSubcategory.name} con stock disponible y asesoramiento.`
              : matchedCategory
              ? `Explorá los insumos de ${matchedCategory.name} para tu cultivo en Posadas, Misiones.`
              : 'Encontrá los insumos de primera línea para potenciar y proteger tu cultivo.'}
          </p>
        </div>

        {/* Filtros de Categorías o botón volver al catálogo completo */}
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

      {/* Grilla de productos o mensaje de categoría sin productos cargados */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-[#0d1a11] border border-[#1f3b25] rounded-3xl space-y-4 max-w-xl mx-auto my-8 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-[#2d5a27]/30 border border-[#4aa036]/50 flex items-center justify-center text-[#e0a96d] mx-auto">
            <Sparkles size={24} />
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
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
