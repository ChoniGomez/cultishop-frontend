import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Heart, XCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useShop, formatPrice, getProductPriceInfo, isProductOutOfStock } from '../context/ShopContext';

export const ProductCard = ({ product }) => {
  const { addToCart, isFavorite, toggleFavorite } = useShop();
  const isFav = isFavorite(product.id);

  const priceInfo = getProductPriceInfo(product);
  const isOutOfStock = isProductOutOfStock(product);

  // Variante seleccionada (vacía si hay múltiples opciones para forzar selección)
  const [selectedOption, setSelectedOption] = useState(
    priceInfo.hasMultipleOptions ? '' : (priceInfo.options[0]?.name || '')
  );

  // Error de validación local si intenta comprar sin elegir opción
  const [validationError, setValidationError] = useState('');

  // Estado efímero de confirmación visual al añadir
  const [isAdded, setIsAdded] = useState(false);

  // Sincronizar selección si cambia el producto
  useEffect(() => {
    setSelectedOption(
      priceInfo.hasMultipleOptions ? '' : (priceInfo.options[0]?.name || '')
    );
    setValidationError('');
  }, [product.id, priceInfo.hasMultipleOptions]);

  // Precio dinámico a mostrar según la variante elegida o rango
  const selectedVariant = selectedOption
    ? priceInfo.options.find((o) => o.name === selectedOption)
    : null;
  const displayPrice = selectedVariant
    ? formatPrice(selectedVariant.price)
    : priceInfo.formattedPrice;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    if (priceInfo.hasMultipleOptions && !selectedOption) {
      setValidationError('Elegí una opción');
      setTimeout(() => setValidationError(''), 2500);
      return;
    }

    setValidationError('');
    const res = addToCart(product, selectedOption, 1);
    if (res && res.success === false) {
      setValidationError(res.message || 'Error al añadir');
      setTimeout(() => setValidationError(''), 2500);
      return;
    }

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  const waText = isOutOfStock
    ? `Hola CultiShop! Consulto por ingreso o disponibilidad de ${product.title}`
    : `Hola CultiShop! Consulto por ${product.title}${selectedOption ? ` (${selectedOption})` : ''}`;

  return (
    <div className={`bg-[#122317] border rounded-2xl p-4 shadow-lg hover:shadow-2xl transition duration-200 flex flex-col justify-between group relative ${
      isOutOfStock ? 'border-[#331c1c] opacity-95' : 'border-[#1f3b25] hover:border-[#38761d]'
    }`}>
      {/* Imagen y Badges con enlace al detalle */}
      <div className="h-52 overflow-hidden rounded-xl mb-4 relative flex items-center justify-center bg-[#0a140d]">
        <Link 
          to={`/producto/${product.id}`}
          className="w-full h-full block cursor-pointer"
          title={`Ver detalle de ${product.title}`}
        >
          <img 
            src={product.image || product.image_url} 
            alt={product.title} 
            className={`object-cover h-full w-full group-hover:scale-105 transition duration-300 ${
              isOutOfStock ? 'opacity-60 grayscale-[30%]' : 'opacity-90 group-hover:opacity-100'
            }`} 
          />
        </Link>
        
        {/* Badge destacado tipo flyer CultiShop */}
        {isOutOfStock ? (
          <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
            <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-md uppercase shadow-md bg-red-600 text-white border border-red-400 shadow-red-950/60">
              SIN STOCK
            </span>
          </div>
        ) : product.badge ? (
          <div className="absolute top-2.5 left-2.5 pointer-events-none z-10">
            <span className={`text-[10px] font-black tracking-wider px-2.5 py-1 rounded-md uppercase shadow-md ${
              product.badgeType === 'red' || product.badge.toUpperCase() === 'SIN STOCK'
                ? 'bg-red-600 text-white border border-red-400'
                : product.badgeType === 'gold' 
                  ? 'bg-[#e0a96d] text-black font-extrabold' 
                  : 'bg-[#2d5a27] text-white border border-[#4aa036]/60'
            }`}>
              {product.badge}
            </span>
          </div>
        ) : null}

        {/* Botón rápido WhatsApp y Favorito flotante */}
        <div className={`absolute right-2 top-2 transition-all duration-200 flex flex-col gap-1.5 bg-[#0d1a11]/90 rounded-lg p-1.5 border border-[#2d5a27] shadow-lg z-10 ${
          isFav ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <a
            href={`https://wa.me/5493764356995?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noreferrer"
            title="Consultar por WhatsApp"
            className="p-1.5 hover:text-[#25d366] text-gray-300 transition hover:scale-110"
            onClick={(e) => e.stopPropagation()}
          >
            <WhatsAppIcon size={17} />
          </a>
          <button 
            type="button"
            title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"} 
            aria-label={isFav ? `Quitar ${product.title} de favoritos` : `Guardar ${product.title} en favoritos`}
            className={`p-1.5 transition-all duration-200 hover:scale-110 active:scale-90 ${
              isFav 
                ? 'text-[#e0a96d]' 
                : 'text-gray-300 hover:text-[#e0a96d]'
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(product);
            }}
          >
            <Heart 
              size={17} 
              className={`transition-all duration-200 ${
                isFav 
                  ? 'fill-[#e0a96d] text-[#e0a96d] drop-shadow-[0_0_6px_rgba(224,169,109,0.5)]' 
                  : 'hover:text-[#e0a96d]'
              }`} 
            />
          </button>
        </div>
      </div>

      {/* Datos del producto */}
      <div className="space-y-2 flex-grow">
        <span className="text-[11px] font-bold text-[#4aa036] uppercase tracking-wider block">
          {product.category}
        </span>
        <Link 
          to={`/producto/${product.id}`}
          className="block group/link"
          title={`Ver detalle de ${product.title}`}
        >
          <h3 className="font-bold text-white text-base leading-snug font-heading group-hover/link:text-[#e0a96d] transition line-clamp-2">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Opciones y Botón interactivo de Compra */}
      <div className="mt-4 pt-3 border-t border-[#1a3320] space-y-3">
        {/* Selector Desplegable para múltiples opciones */}
        {priceInfo.hasMultipleOptions ? (
          <div className="space-y-1">
            <label className="sr-only">Seleccionar medida o presentación</label>
            <div className="relative">
              <select 
                value={selectedOption}
                onChange={(e) => {
                  setSelectedOption(e.target.value);
                  if (validationError) setValidationError('');
                }}
                disabled={isOutOfStock}
                className={`w-full appearance-none text-xs rounded-xl py-2 pl-3 pr-8 transition cursor-pointer font-medium border ${
                  isOutOfStock 
                    ? 'bg-[#0a140d]/60 border-[#1f3b25] text-gray-500 cursor-not-allowed'
                    : validationError
                      ? 'bg-red-950/40 border-red-500 text-white ring-1 ring-red-500 animate-pulse'
                      : selectedOption
                        ? 'bg-[#0e2114] border-[#4aa036] text-[#e0a96d]'
                        : 'bg-[#0b1610] border-[#23422a] text-gray-300 hover:border-[#38761d] focus:outline-none focus:border-[#4aa036]'
                }`}
                style={{
                  backgroundColor: isOutOfStock ? '#0a140d' : selectedOption ? '#0e2114' : '#0b1610',
                  color: isOutOfStock ? '#6b7280' : selectedOption ? '#e0a96d' : '#e5e7eb'
                }}
              >
                <option value="" style={{ backgroundColor: '#0b1610', color: '#9ca3af' }} className="bg-[#0b1610] text-gray-400">
                  Elegí una opción...
                </option>
                {priceInfo.options.map((opt, idx) => (
                  <option
                    key={idx}
                    value={opt.name}
                    style={{ backgroundColor: '#0b1610', color: '#f3f4f6' }}
                    className="bg-[#0b1610] text-white"
                  >
                    {opt.name} — {formatPrice(opt.price)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                <ChevronDown size={14} className={selectedOption ? 'text-[#e0a96d]' : 'text-[#4aa036]'} />
              </div>
            </div>
            {validationError && (
              <div className="flex items-center gap-1 text-[10px] text-red-400 font-bold px-1 animate-fade-in">
                <AlertCircle size={11} className="shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>
        ) : priceInfo.options.length === 1 && priceInfo.options[0].name !== 'Estándar' ? (
          <div className="text-[11px] text-gray-400 font-medium">
            Presentación: <span className="text-gray-200 font-bold">{priceInfo.options[0].name}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              {priceInfo.hasMultipleOptions && !selectedOption ? 'Desde' : 'Precio'}
            </span>
            <span className="text-[#e0a96d] font-black text-lg font-heading leading-tight block">
              {displayPrice}
            </span>
          </div>

          {/* Botón interactivo: Añadir al Carrito o Sin Stock */}
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              aria-label={`${product.title} sin stock disponible`}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md border bg-[#1a0f0f] text-red-400 border-red-900/60 cursor-not-allowed opacity-80"
            >
              <XCircle size={15} className="shrink-0" />
              <span>Sin Stock</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={`Añadir ${product.title} al carrito`}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 shadow-md border active:scale-95 cursor-pointer ${
                isAdded
                  ? 'bg-[#38761d] text-white border-[#4aa036] shadow-[#4aa036]/20'
                  : 'bg-[#2d5a27] hover:bg-[#38761d] text-white border-[#4aa036]/50 hover:border-[#4aa036] shadow-black/40'
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={15} className="text-white animate-bounce" />
                  <span>¡Añadido!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={15} className="shrink-0" />
                  <span>Añadir</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


