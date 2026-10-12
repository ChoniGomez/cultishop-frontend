import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, Check, Heart } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { useShop, formatPrice } from '../context/ShopContext';

export const ProductCard = ({ product }) => {
  const { addToCart, openCart, isFavorite, toggleFavorite } = useShop();
  const isFav = isFavorite(product.id);
  
  // Variante seleccionada (por defecto la primera disponible)
  const [selectedOption, setSelectedOption] = useState(
    product.options && product.options.length > 0 ? product.options[0] : ''
  );

  // Estado efímero de confirmación visual al añadir
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, selectedOption, 1);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  return (
    <div className="bg-[#122317] border border-[#1f3b25] hover:border-[#38761d] rounded-2xl p-4 shadow-lg hover:shadow-2xl transition duration-200 flex flex-col justify-between group relative">
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
            className="object-cover h-full w-full group-hover:scale-105 transition duration-300 opacity-90 group-hover:opacity-100" 
          />
        </Link>
        
        {/* Badge destacado tipo flyer CultiShop */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 pointer-events-none">
            <span className={`text-[10px] font-black tracking-wider px-2.5 py-1 rounded-md uppercase shadow-md ${
              product.badgeType === 'gold' 
                ? 'bg-[#e0a96d] text-black font-extrabold' 
                : 'bg-[#2d5a27] text-white border border-[#4aa036]/60'
            }`}>
              {product.badge}
            </span>
          </div>
        )}

        {/* Botón rápido WhatsApp y Favorito flotante */}
        <div className={`absolute right-2 top-2 transition-all duration-200 flex flex-col gap-1.5 bg-[#0d1a11]/90 rounded-lg p-1.5 border border-[#2d5a27] shadow-lg z-10 ${
          isFav ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <a
            href={`https://wa.me/5493764356995?text=Hola%20CultiShop!%20Consulto%20por%20${encodeURIComponent(product.title)}${selectedOption ? ` (${encodeURIComponent(selectedOption)})` : ''}`}
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
        {product.options && product.options.length > 0 && (
          <div>
            <label className="sr-only">Seleccionar variante</label>
            <select 
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="w-full text-xs bg-[#0a140d] border border-[#23422a] rounded-lg p-2 text-gray-200 focus:outline-none focus:border-[#4aa036] cursor-pointer"
            >
              {product.options.map((opt, idx) => (
                <option key={idx} value={opt} className="bg-[#0e1c12] text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Precio</span>
            <span className="text-[#e0a96d] font-black text-lg font-heading leading-tight">
              {typeof product.price === 'number' ? formatPrice(product.price) : product.price}
            </span>
          </div>

          {/* Botón interactivo: Añadir al Carrito */}
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
        </div>
      </div>
    </div>
  );
};

