import React, { useEffect } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useShop, formatPrice } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { buildImageUrl } from '../config/api';

export const CartDrawer = () => {
  const { isAdmin } = useAuth();
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    formattedTotalPrice,
  } = useShop();

  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Evitar scroll en el body cuando el drawer está abierto
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (isAdmin || !isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end" style={{ zIndex: 9999 }}>
      {/* Overlay oscuro de fondo */}
      <div
        className="fixed inset-0 z-[9998] bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        style={{ zIndex: 9998 }}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Panel lateral deslizante */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className="relative w-full max-w-md bg-[#0a150e] border-l border-[#1f3b25] shadow-2xl flex flex-col h-full z-[9999] text-gray-200 animate-in slide-in-from-right duration-300"
        style={{ zIndex: 9999 }}
      >
        {/* Cabecera del Carrito */}
        <div className="p-4 sm:p-5 border-b border-[#1b3420] bg-[#0d1c12] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1b3420] text-[#4aa036] flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg text-white">Mi Carrito</h3>
                <span className="bg-[#e0a96d] text-black text-[11px] font-black px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">CultiShop Posadas</p>
            </div>
          </div>

          <button
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#162e1c] rounded-xl transition"
            aria-label="Cerrar carrito"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido / Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-[#162e1c]/60">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#122317] border border-[#23442a] flex items-center justify-center text-gray-500">
                <ShoppingBag size={36} className="text-gray-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-heading">
                  Tu carrito está vacío
                </h4>
                <p className="text-xs text-gray-400 max-w-xs mt-1.5 leading-relaxed">
                  Explorá nuestro catálogo de fertilizantes, carpas indoor, sustratos y parafernalia en stock.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition shadow-md border border-[#4aa036]/50"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div 
                  key={item.cartId}
                  className="pt-3.5 first:pt-0 flex gap-3.5 items-center group"
                >
                  {/* Imagen en miniatura */}
                  <Link
                    to={`/producto/${item.productId}`}
                    onClick={closeCart}
                    className="w-16 h-16 rounded-xl overflow-hidden bg-[#0b1610] p-1 border border-[#23442a] hover:border-[#4aa036] shrink-0 flex items-center justify-center transition cursor-pointer"
                    title={`Ver detalle de ${item.title}`}
                  >
                    <img
                      src={buildImageUrl(item.image || item.image_url)}
                      alt={item.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const fallback = 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&q=80&w=200';
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                    />
                  </Link>

                  {/* Información del ítem */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/producto/${item.productId}`}
                      onClick={closeCart}
                      className="block group-hover:text-[#e0a96d] transition"
                      title={`Ver detalle de ${item.title}`}
                    >
                      <h5 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#e0a96d] transition font-heading">
                        {item.title}
                      </h5>
                    </Link>
                    
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold text-[#4aa036] bg-[#122317] px-2 py-0.5 rounded border border-[#23442a]">
                        {item.selectedOption}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {item.formattedPrice} c/u
                      </span>
                    </div>

                    {/* Controles de cantidad y precio total del ítem */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-[#102014] border border-[#23442a] rounded-lg">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartId, -1)}
                          className="p-1 hover:text-[#e0a96d] text-gray-400 transition"
                          title="Restar cantidad"
                          aria-label="Restar una unidad"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-white select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartId, 1)}
                          className="p-1 hover:text-[#4aa036] text-gray-400 transition"
                          title="Aumentar cantidad"
                          aria-label="Añadir una unidad"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-[#e0a96d] font-heading">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.cartId)}
                          className="text-gray-500 hover:text-red-400 p-1 rounded transition"
                          title="Eliminar del carrito"
                          aria-label={`Eliminar ${item.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón para vaciar todo el carrito */}
              <div className="pt-3 text-right">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] text-gray-500 hover:text-red-400 transition underline underline-offset-2"
                >
                  Vaciar carrito
                </button>
              </div>
            </>
          )}
        </div>

        {/* Pie de Carrito con Totales y Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#0d1c12] border-t border-[#1b3420] space-y-3.5 shadow-2xl">
            {/* Resumen de totales */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Productos acumulados:</span>
                <span className="text-gray-200 font-semibold">{totalItems} unidad(es)</span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-[#1a3321]">
                <span className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                  Subtotal:
                </span>
                <span className="text-2xl font-black text-[#e0a96d] font-heading">
                  {formattedTotalPrice}
                </span>
              </div>
            </div>

            {/* Aviso de entrega */}
            <div className="p-2.5 rounded-xl bg-[#102315] border border-[#23442a] flex items-center gap-2.5 text-[11px] text-gray-300">
              <ShieldCheck size={16} className="text-[#4aa036] shrink-0" />
              <span>Retiro por local sin costo • Envíos por Moto, Uber, Líder Mandados, Correo Argentino o Vía Cargo.</span>
            </div>

            {/* Botón Principal: Finalizar la Compra */}
            <Link
              to="/finalizar-compra"
              onClick={closeCart}
              className="w-full py-3.5 px-4 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-[#4aa036]/20 hover:scale-[1.01] active:scale-95 group font-heading border border-[#4aa036]/50"
            >
              <span>Finalizar la Compra</span>
              <ArrowRight size={17} className="text-[#e0a96d] group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              type="button"
              onClick={closeCart}
              className="w-full py-2 text-center text-xs text-gray-400 hover:text-white transition"
            >
              ← Continuar mirando productos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

