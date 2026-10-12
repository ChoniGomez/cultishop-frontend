import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  ShoppingBag, 
  Heart, 
  Share2, 
  Check, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft, 
  Star, 
  Plus, 
  Minus, 
  CheckCircle2, 
  HelpCircle, 
  Maximize2, 
  X, 
  Copy, 
  Clock, 
  Leaf, 
  Award, 
  Droplets,
  PackageCheck
} from 'lucide-react';
import { useShop, formatPrice } from '../context/ShopContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import { ProductCard } from './ProductCard';
import { getProductDetails } from '../data/productDetailsData';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    products, 
    addToCart, 
    openCart, 
    isFavorite, 
    toggleFavorite 
  } = useShop();

  // Scroll al inicio al cambiar de producto
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Buscar el producto por ID numérico o slug
  const product = products.find(
    (p) => p.id === parseInt(id, 10) || String(p.id) === String(id) || p.slug === id
  );

  // Variante seleccionada
  const [selectedOption, setSelectedOption] = useState('');

  // Cantidad deseada
  const [quantity, setQuantity] = useState(1);

  // Estados visuales efímeros
  const [isAdded, setIsAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  // Pestaña activa ('descripcion' | 'especificaciones' | 'uso' | 'envios')
  const [activeTab, setActiveTab] = useState('descripcion');

  // Inicializar la primera opción cuando el producto esté disponible
  useEffect(() => {
    if (product?.options && product.options.length > 0) {
      setSelectedOption(product.options[0]);
    } else {
      setSelectedOption('Estándar');
    }
    setQuantity(1);
    setIsAdded(false);
  }, [product]);

  // Si el catálogo está cargando o no se encuentra el producto
  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-[#122317] border-2 border-[#2d5a27] flex items-center justify-center text-[#e0a96d] mx-auto mb-6 shadow-xl">
          <Leaf size={36} className="text-[#4aa036] animate-pulse" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-heading mb-3">
          Insumo no encontrado en el invernadero
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
          No pudimos localizar el producto solicitado. Podría haber cambiado de código o haberse agotado temporalmente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold uppercase tracking-wider transition shadow-lg"
          >
            <ArrowLeft size={16} />
            <span>Volver al Catálogo</span>
          </Link>
          <a
            href="https://wa.me/5493764356995?text=Hola%20CultiShop!%20Busco%20un%20producto%20pero%20no%20lo%20encuentro%20en%20la%20tienda"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#122317] hover:bg-[#1a3521] text-[#25d366] text-xs font-bold border border-[#23422a] transition"
          >
            <WhatsAppIcon size={16} />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  // Datos técnicos enriquecidos
  const details = getProductDetails(product);
  const isFav = isFavorite(product.id);
  const stockCount = typeof product.stock === 'number' ? product.stock : 25;
  const imageUrl = product.image || product.image_url;

  // Manejo de cantidades
  const handleIncreaseQty = () => {
    if (quantity < stockCount) setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  // Añadir al carrito
  const handleAddToCart = () => {
    addToCart(product, selectedOption, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  // Comprar ahora (agrega y abre WhatsApp o Drawer de checkout)
  const handleBuyNow = () => {
    addToCart(product, selectedOption, quantity);
    const phoneNumber = '5493764356995';
    const message = [
      '🌿 *¡HOLA CULTISHOP! QUIERO COMPRAR ESTE PRODUCTO AHORA:*',
      '',
      `📦 *Producto:* ${product.title}`,
      `📌 *Variante/Presentación:* ${selectedOption}`,
      `🔢 *Cantidad:* ${quantity} unidad(es)`,
      `💰 *Precio estimado:* ${typeof product.price === 'number' ? formatPrice(product.price * quantity) : product.price}`,
      '',
      '¿Tienen disponibilidad para retiro inmediato en Posadas o envío en el día?',
    ].join('\n');

    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Copiar enlace al portapapeles
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Zoom dinámico sobre la imagen en hover
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  // Productos relacionados (misma categoría o complementarios)
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || Math.abs(p.id - product.id) <= 3))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0a140d] text-gray-100 pb-20">
      {/* Breadcrumb navegable */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
          <Link to="/" className="hover:text-[#4aa036] transition flex items-center gap-1">
            <span>Inicio</span>
          </Link>
          <ChevronRight size={13} className="text-gray-600" />
          <Link 
            to={product.category ? `/categoria/${product.category.toLowerCase().replace(/\s+/g, '-')}` : '/'} 
            className="hover:text-[#e0a96d] transition font-medium"
          >
            {product.category || 'Catálogo'}
          </Link>
          <ChevronRight size={13} className="text-gray-600" />
          <span className="text-[#e0a96d] font-bold line-clamp-1 max-w-xs sm:max-w-md">
            {product.title}
          </span>
        </nav>
      </div>

      {/* CONTENEDOR PRINCIPAL: PRODUCT HERO & DETAILS */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ======================================================== */}
          {/* COLUMNA 1: IMAGEN DEL PRODUCTO CON ZOOM (5 columnas) */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative bg-[#0d1a11] border-2 border-[#1f3b25] rounded-3xl overflow-hidden shadow-2xl group">
              {/* Badge temático CultiShop */}
              {product.badge && (
                <div className="absolute top-4 left-4 z-20">
                  <span className={`text-[11px] font-black tracking-wider px-3 py-1 rounded-lg uppercase shadow-lg ${
                    product.badgeType === 'gold' 
                      ? 'bg-[#e0a96d] text-black font-extrabold shadow-amber-950/40' 
                      : 'bg-[#2d5a27] text-white border border-[#4aa036]/60 shadow-green-950/40'
                  }`}>
                    {product.badge}
                  </span>
                </div>
              )}

              {/* Botón para abrir Lightbox / Zoom completo */}
              <button
                type="button"
                onClick={() => setIsZoomModalOpen(true)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-xl bg-[#09150d]/80 hover:bg-[#1a3521] text-gray-300 hover:text-white border border-[#2d5a27] transition shadow-lg backdrop-blur-sm group/btn"
                title="Ampliar imagen en pantalla completa"
              >
                <Maximize2 size={16} className="group-hover/btn:scale-110 transition-transform" />
              </button>

              {/* Contenedor interactivo de la imagen */}
              <div 
                className="relative h-[380px] sm:h-[460px] w-full flex items-center justify-center overflow-hidden cursor-crosshair bg-gradient-to-b from-[#0a140d] via-[#102216] to-[#0a140d]"
                onMouseEnter={() => setIsHoverZooming(true)}
                onMouseLeave={() => setIsHoverZooming(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setIsZoomModalOpen(true)}
              >
                <img
                  src={imageUrl}
                  alt={product.title}
                  className={`object-cover w-full h-full transition duration-300 ${
                    isHoverZooming ? 'opacity-0' : 'opacity-100'
                  }`}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&q=80&w=600';
                  }}
                />

                {/* Capa de Lupa / Zoom interactivo en hover */}
                {isHoverZooming && (
                  <div
                    className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-75 ease-out"
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundSize: '220%',
                      backgroundRepeat: 'no-repeat'
                    }}
                  />
                )}

                {/* Indicador de ayuda al pie de la foto */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-gray-400 bg-black/70 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm flex items-center gap-1.5 shadow-sm">
                    <Sparkles size={11} className="text-[#e0a96d]" />
                    Pasa el cursor para hacer zoom o haz clic para ampliar
                  </span>
                </div>
              </div>
            </div>

            {/* Garantías y sellos de confianza bajo la foto */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-[#0e1c12] rounded-2xl border border-[#1f3b25] text-center">
              <div className="p-2 rounded-xl bg-[#122317]/60">
                <Leaf size={18} className="text-[#4aa036] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-gray-300 block leading-tight">100% Original</span>
                <span className="text-[9px] text-gray-500">Envase cerrado</span>
              </div>
              <div className="p-2 rounded-xl bg-[#122317]/60">
                <Award size={18} className="text-[#e0a96d] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-gray-300 block leading-tight">Calidad Culti</span>
                <span className="text-[9px] text-gray-500">Testeo cannábico</span>
              </div>
              <div className="p-2 rounded-xl bg-[#122317]/60">
                <ShieldCheck size={18} className="text-[#25d366] mx-auto mb-1" />
                <span className="text-[10px] font-bold text-gray-300 block leading-tight">Compra Segura</span>
                <span className="text-[9px] text-gray-500">Atención directa</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUMNA 2: INFORMACIÓN Y ACCIONES DEL PRODUCTO (4 columnas) */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              {/* Categoría y Fabricante */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#18311d] text-[#4aa036] border border-[#2d5a27] text-[11px] font-bold uppercase tracking-wider">
                  {product.category || 'Grow Shop'}
                </span>
                {details.brand && (
                  <span className="text-xs text-gray-400 font-medium">
                    Por <strong className="text-gray-200">{details.brand}</strong>
                  </span>
                )}
              </div>

              {/* Título Principal */}
              <h1 className="text-2xl sm:text-3xl font-black text-white font-heading leading-tight tracking-tight">
                {product.title}
              </h1>

              {/* Rating / Opiniones */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-current" />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-300">4.9</span>
                <span className="text-xs text-gray-500">• 24 cultivadores lo recomiendan</span>
              </div>
            </div>

            {/* PRECIO DESTACADO */}
            <div className="p-4 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] space-y-1.5 shadow-md">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-[#e0a96d] font-heading text-glow-gold tracking-tight">
                  {typeof product.price === 'number' ? formatPrice(product.price) : product.price}
                </span>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                  Precio Oficial
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Aboná en efectivo o transferencia con <strong className="text-white">10% OFF</strong> en nuestro local de Posadas.
              </p>
            </div>

            {/* INDICADOR DE STOCK */}
            <div className="flex items-center gap-2 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25d366] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25d366]"></span>
              </span>
              <span className="font-bold text-white">Hay stock disponible</span>
              <span className="text-gray-400">({stockCount} unidades listas para entrega)</span>
            </div>

            {/* SELECTOR DE PRESENTACIÓN / VARIANTE */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-[#1a3320]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-300">Seleccionar Presentación:</span>
                  <span className="text-[#e0a96d] font-semibold">{selectedOption}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        selectedOption === opt
                          ? 'bg-[#2d5a27] text-white border-[#4aa036] shadow-md shadow-black/40 scale-102'
                          : 'bg-[#122317] text-gray-300 border-[#1f3b25] hover:text-[#e0a96d] hover:border-[#38761d]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SELECTOR DE CANTIDAD */}
            <div className="space-y-2 pt-1 border-t border-[#1a3320]">
              <span className="block text-xs font-bold text-gray-300">Cantidad:</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#09150d] border border-[#23422a] rounded-xl p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={handleDecreaseQty}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#1a3521] disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-bold text-white text-sm font-heading">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncreaseQty}
                    disabled={quantity >= stockCount}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#1a3521] disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-[11px] text-gray-400">
                  Subtotal: <strong className="text-[#e0a96d]">{typeof product.price === 'number' ? formatPrice(product.price * quantity) : product.price}</strong>
                </span>
              </div>
            </div>

            {/* BOTONES PRINCIPALES DE ACCIÓN */}
            <div className="space-y-2.5 pt-2">
              {/* Botón: Añadir al carrito */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-200 shadow-xl border cursor-pointer ${
                  isAdded
                    ? 'bg-[#38761d] text-white border-[#4aa036] scale-102 shadow-[#4aa036]/20'
                    : 'bg-[#2d5a27] hover:bg-[#38761d] text-white border-[#4aa036]/50 hover:border-[#4aa036] shadow-black/40 hover:scale-[1.02] active:scale-98'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check size={18} className="animate-bounce" />
                    <span>¡Añadido al Carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Añadir al Carrito</span>
                  </>
                )}
              </button>

              {/* Botón: Comprar Ahora */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#d4af37] via-[#e0a96d] to-[#d4af37] hover:brightness-110 text-black shadow-lg shadow-[#e0a96d]/20 transition-all duration-200 hover:scale-[1.02] active:scale-98 cursor-pointer"
              >
                <ShoppingBag size={18} className="fill-current text-black" />
                <span>Comprar Ahora por WhatsApp</span>
              </button>
            </div>

            {/* BOTONES SECUNDARIOS: FAVORITOS Y COMPARTIR */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#1a3320]">
              {/* Favorito */}
              <button
                type="button"
                onClick={() => toggleFavorite(product)}
                className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                  isFav
                    ? 'bg-[#1e170d] border-[#e0a96d]/60 text-[#e0a96d]'
                    : 'bg-[#0e1c12] border-[#23422a] text-gray-300 hover:text-white hover:border-[#38761d]'
                }`}
              >
                <Heart
                  size={16}
                  className={isFav ? 'fill-[#e0a96d] text-[#e0a96d]' : 'text-gray-400'}
                />
                <span>{isFav ? 'En Favoritos' : 'Añadir a Favoritos'}</span>
              </button>

              {/* Compartir WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `¡Mirá este producto en CultiShop Posadas! ${product.title} - ${typeof window !== 'undefined' ? window.location.href : ''}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-[#0e1c12] hover:bg-[#1a3521] text-gray-300 hover:text-[#25d366] border border-[#23422a] transition"
                title="Compartir por WhatsApp"
              >
                <WhatsAppIcon size={16} />
              </a>

              {/* Copiar enlace */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-2.5 rounded-xl bg-[#0e1c12] hover:bg-[#1a3521] text-gray-300 hover:text-white border border-[#23422a] transition relative"
                title="Copiar enlace del producto"
              >
                {copiedLink ? <Check size={16} className="text-[#25d366]" /> : <Copy size={16} />}
                {copiedLink && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold py-1 px-2 rounded-md whitespace-nowrap shadow-lg">
                    ¡Copiado!
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* COLUMNA 3: MÉTODOS DE ENVÍO Y SERVICIO AL CLIENTE (3 cols) */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-5 rounded-3xl bg-[#0e1c12] border border-[#1f3b25] space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-[#1f3b25] text-xs font-bold uppercase tracking-wider text-[#e0a96d]">
                <Truck size={16} className="text-[#4aa036]" />
                <span>Opciones de Entrega</span>
              </div>

              {/* Retiro en Local */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-white flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#4aa036] shrink-0" />
                    Retiro en Local
                  </span>
                  <span className="text-[#25d366] font-black uppercase text-[11px]">¡Gratis!</span>
                </div>
                <p className="text-gray-400 text-[11px] pl-5 leading-relaxed">
                  Av. López y Planes 2919, Posadas. Lunes a Viernes de 09 a 12 hs y 16:30 a 19:30 hs.
                </p>
              </div>

              {/* Envío en el día Posadas */}
              <div className="space-y-1 text-xs pt-2 border-t border-[#18311d]">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-white flex items-center gap-1.5">
                    <Clock size={14} className="text-[#e0a96d] shrink-0" />
                    Envío en el Día
                  </span>
                  <span className="text-gray-300 text-[11px]">Posadas / Garupá</span>
                </div>
                <p className="text-gray-400 text-[11px] pl-5 leading-relaxed">
                  Cadetería exprés directa. Coordinás horario exacto con nosotros por WhatsApp.
                </p>
              </div>

              {/* Envíos Nacionales */}
              <div className="space-y-1 text-xs pt-2 border-t border-[#18311d]">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-white flex items-center gap-1.5">
                    <PackageCheck size={14} className="text-blue-400 shrink-0" />
                    Correo Argentino
                  </span>
                  <span className="text-gray-300 text-[11px]">A todo el país</span>
                </div>
                <p className="text-gray-400 text-[11px] pl-5 leading-relaxed">
                  Despachamos encomiendas con código de seguimiento oficial en 24 a 48 hs.
                </p>
              </div>

              {/* Medios de Pago */}
              <div className="pt-3 border-t border-[#1f3b25] space-y-2">
                <span className="text-[11px] font-bold text-gray-300 block uppercase tracking-wider">
                  Medios de Pago Aceptados
                </span>
                <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-400">
                  <span className="px-2 py-1 bg-[#122317] rounded-md border border-[#23422a] text-gray-200">Efectivo</span>
                  <span className="px-2 py-1 bg-[#122317] rounded-md border border-[#23422a] text-gray-200">Transferencia / Alias</span>
                  <span className="px-2 py-1 bg-[#122317] rounded-md border border-[#23422a] text-gray-200">Mercado Pago</span>
                  <span className="px-2 py-1 bg-[#122317] rounded-md border border-[#23422a] text-gray-200">Tarjetas</span>
                </div>
              </div>
            </div>

            {/* Widget Asesoramiento WhatsApp */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#122317] to-[#0a180e] border border-[#2d5a27] space-y-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#25d366]/20 border border-[#25d366]/40 flex items-center justify-center text-[#25d366]">
                  <WhatsAppIcon size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">¿Dudas con este insumo?</h4>
                  <p className="text-[10px] text-gray-400">Asesoramiento gratuito con cultivadores</p>
                </div>
              </div>

              <a
                href={`https://wa.me/5493764356995?text=${encodeURIComponent(
                  `Hola CultiShop! Tengo dudas sobre cómo usar el producto "${product.title}" (${selectedOption}) en mi cultivo.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-[#25d366] hover:bg-[#20ba5a] text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
              >
                <WhatsAppIcon size={15} />
                <span>Preguntar a CultiShop</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN INFERIOR: PESTAÑAS DE INFORMACIÓN (TABS) */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-[#0e1c12] border border-[#1f3b25] rounded-3xl overflow-hidden shadow-2xl">
          {/* Barra de pestañas */}
          <div className="flex items-center border-b border-[#1f3b25] overflow-x-auto bg-[#0a140d]/60">
            {[
              { id: 'descripcion', label: 'Descripción Completa' },
              { id: 'especificaciones', label: 'Ficha Técnica' },
              { id: 'uso', label: 'Modo de Uso y Aplicación' },
              { id: 'envios', label: 'Envíos y Retiro' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-[#e0a96d] text-[#e0a96d] bg-[#142619]'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-[#102216]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido de la pestaña */}
          <div className="p-6 sm:p-8">
            {/* TAB 1: DESCRIPCIÓN */}
            {activeTab === 'descripcion' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading mb-2">
                    Detalles y Características del Producto
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Viñetas de ventajas */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#4aa036]">
                    Ventajas Destacadas para tu Cultivo:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {details.keyBenefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#122317] border border-[#203c26]">
                        <CheckCircle2 size={16} className="text-[#4aa036] shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-300 leading-snug">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Especificaciones cannábicas especiales si existen */}
                {details.cannabisSpecs && (
                  <div className="pt-4 border-t border-[#1f3b25]">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#e0a96d] mb-3">
                      Compatibilidad & Comportamiento en Cultivo:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {Object.entries(details.cannabisSpecs).map(([key, value], idx) => (
                        <div key={idx} className="p-3 bg-[#0a140d] rounded-xl border border-[#1b3420]">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-xs text-gray-200 font-medium">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ESPECIFICACIONES TÉCNICAS */}
            {activeTab === 'especificaciones' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white font-heading mb-3">
                  Ficha Técnica Oficial
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-[#1f3b25]">
                  <table className="w-full text-left text-xs text-gray-300">
                    <tbody className="divide-y divide-[#1f3b25]">
                      <tr className="bg-[#122317]">
                        <th className="py-3 px-4 font-bold text-white w-1/3">Marca / Fabricante</th>
                        <td className="py-3 px-4 text-gray-200">{details.brand}</td>
                      </tr>
                      <tr className="bg-[#0e1c12]">
                        <th className="py-3 px-4 font-bold text-white">Categoría</th>
                        <td className="py-3 px-4 text-gray-200">{product.category}</td>
                      </tr>
                      <tr className="bg-[#122317]">
                        <th className="py-3 px-4 font-bold text-white">Presentación / Formato</th>
                        <td className="py-3 px-4 text-gray-200">{details.format}</td>
                      </tr>
                      <tr className="bg-[#0e1c12]">
                        <th className="py-3 px-4 font-bold text-white">Etapa Recomendada</th>
                        <td className="py-3 px-4 text-gray-200">{details.cultivationStage}</td>
                      </tr>
                      <tr className="bg-[#122317]">
                        <th className="py-3 px-4 font-bold text-white">Medio de Cultivo Apto</th>
                        <td className="py-3 px-4 text-gray-200">{details.suitableFor}</td>
                      </tr>
                      {details.phRecommended !== 'N/A' && (
                        <tr className="bg-[#0e1c12]">
                          <th className="py-3 px-4 font-bold text-white">Rango de pH Sugerido</th>
                          <td className="py-3 px-4 text-gray-200">{details.phRecommended}</td>
                        </tr>
                      )}
                      <tr className="bg-[#122317]">
                        <th className="py-3 px-4 font-bold text-white">Origen</th>
                        <td className="py-3 px-4 text-gray-200">{details.origin}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: MODO DE USO */}
            {activeTab === 'uso' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading mb-2">
                    Guía de Aplicación y Dosificación Recomendada
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Recomendaciones preparadas por el equipo técnico de CultiShop para asegurar la máxima asimilación:
                  </p>
                </div>

                {details.dosage && (
                  <div className="p-4 rounded-2xl bg-[#122317] border border-[#2d5a27] flex items-center gap-3">
                    <Droplets size={22} className="text-[#4aa036] shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-white block">Dosis Referencial:</span>
                      <span className="text-xs text-[#e0a96d] font-semibold">{details.dosage}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#4aa036]">
                    Paso a Paso de Aplicación:
                  </h4>
                  <div className="space-y-2">
                    {details.applicationGuide.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#0a140d] border border-[#1b3420]">
                        <span className="w-6 h-6 rounded-full bg-[#2d5a27] text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ENVÍOS Y RETIRO */}
            {activeTab === 'envios' && (
              <div className="space-y-5 text-xs text-gray-300">
                <h3 className="text-lg font-bold text-white font-heading">
                  Políticas de Entrega y Retiro
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#122317] border border-[#1f3b25] space-y-2">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <MapPin size={16} className="text-[#4aa036]" />
                      Retiro en Posadas (Misiones)
                    </h4>
                    <p className="text-gray-400 leading-relaxed">
                      Podés retirar tus productos sin costo adicional en nuestro local en Av. López y Planes 2919. Aceptamos efectivo con descuento directo, transferencia y tarjetas.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#122317] border border-[#1f3b25] space-y-2">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <Truck size={16} className="text-[#e0a96d]" />
                      Envíos a Domicilio y Todo el País
                    </h4>
                    <p className="text-gray-400 leading-relaxed">
                      En Posadas y alrededores contamos con cadetería propia en el día. Para envíos al interior de Misiones y otras provincias, despachamos vía Correo Argentino o empresas de encomiendas con embalaje discreto y seguro.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN PRODUCTOS RELACIONADOS */}
      {/* ======================================================== */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-10 border-t border-[#1f3b25]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#e0a96d] block mb-1">
                COMBINA CON TU CULTIVO
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
                PRODUCTOS <span className="text-[#e0a96d] text-glow-gold">RELACIONADOS</span>
              </h2>
            </div>
            <Link
              to="/"
              className="text-xs font-bold text-[#4aa036] hover:text-[#e0a96d] transition flex items-center gap-1"
            >
              <span>Ver todo el catálogo</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL LIGHTBOX DE ZOOM EN PANTALLA COMPLETA */}
      {/* ======================================================== */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-[#0e1c12] border border-[#2d5a27] rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
            {/* Botón Cerrar */}
            <button
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-[#1a3321] text-gray-300 hover:text-white transition cursor-pointer"
            >
              <X size={22} />
            </button>

            <span className="text-xs font-bold text-[#e0a96d] uppercase tracking-wider mb-3">
              {product.title}
            </span>

            <div className="max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-2xl bg-[#09150d]">
              <img
                src={imageUrl}
                alt={product.title}
                className="max-h-[72vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
