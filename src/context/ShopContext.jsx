import React, { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

const CART_STORAGE_KEY = 'cultishop_cart_v1';
const FAVORITES_STORAGE_KEY = 'cultishop_favorites_v1';

/**
 * Parsea un string de precio (ej: "$14.500,00" o "$14500") a número.
 */
export const parsePrice = (priceStr) => {
  if (typeof priceStr === 'number') return priceStr;
  if (!priceStr) return 0;
  // Remover símbolo $, espacios y puntos de miles, convertir coma decimal a punto
  const cleaned = priceStr
    .toString()
    .replace(/[^0-9,-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Formatea un número al estilo de precios de CultiShop (ej: "$14.500,00").
 */
export const formatPrice = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0,00';
  const parts = Math.max(0, amount).toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = parts[1];
  return `$${integerPart},${decimalPart}`;
};

export const ShopProvider = ({ children }) => {
  // Inicialización de carrito desde LocalStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error al cargar carrito de LocalStorage:', err);
      return [];
    }
  });

  // Estado del drawer lateral del carrito
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Notificación breve cuando se añade un producto
  const [lastAddedItem, setLastAddedItem] = useState(null);

  // Sincronizar en LocalStorage cada cambio
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error('Error al guardar carrito en LocalStorage:', err);
    }
  }, [cart]);

  // Inicialización de favoritos desde LocalStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error al cargar favoritos de LocalStorage:', err);
      return [];
    }
  });

  // Sincronizar favoritos en LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.error('Error al guardar favoritos en LocalStorage:', err);
    }
  }, [favorites]);

  // Estado global para la barra de búsqueda (inicializado desde query params si existen)
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        return params.get('search') || params.get('q') || '';
      } catch (err) {
        return '';
      }
    }
    return '';
  });

  const clearSearch = () => {
    setSearchQuery('');
  };

  /**
   * Verifica si un producto está en la lista de favoritos.
   */
  const isFavorite = (productId) => {
    return favorites.some((item) => item.id === productId);
  };

  /**
   * Alterna un producto en la lista de favoritos (agregar o quitar).
   */
  const toggleFavorite = (product) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  /**
   * Elimina un producto de favoritos.
   */
  const removeFromFavorites = (productId) => {
    setFavorites((prev) => prev.filter((item) => item.id !== productId));
  };

  /**
   * Vacía la lista de favoritos.
   */
  const clearFavorites = () => {
    setFavorites([]);
  };

  const favoritesCount = favorites.length;

  /**
   * Añade un producto al carrito con su variante seleccionada y cantidad.
   */
  const addToCart = (product, selectedOption, quantity = 1) => {
    const option = selectedOption || (product.options && product.options[0]) || 'Estándar';
    const unitPrice = parsePrice(product.price);
    const cartId = `${product.id}__${option}`;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.cartId === cartId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        const newItem = {
          cartId,
          productId: product.id,
          title: product.title,
          category: product.category,
          selectedOption: option,
          unitPrice,
          formattedPrice: product.price,
          image: product.image,
          quantity,
        };
        return [...prevCart, newItem];
      }
    });

    // Notificación efímera
    setLastAddedItem({
      title: product.title,
      option,
      time: Date.now(),
    });
  };

  /**
   * Elimina un ítem específico del carrito.
   */
  const removeFromCart = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  /**
   * Actualiza la cantidad de un ítem (+1, -1 o valor absoluto).
   */
  const updateQuantity = (cartId, delta, isAbsolute = false) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.cartId !== cartId) return item;
          const newQty = isAbsolute ? delta : item.quantity + delta;
          return {
            ...item,
            quantity: Math.max(1, newQty),
          };
        })
        .filter((item) => item.quantity > 0);
    });
  };

  /**
   * Vacía todo el carrito.
   */
  const clearCart = () => {
    setCart([]);
  };

  /**
   * Controladores de apertura y cierre del Drawer.
   */
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  // Totales calculados
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const formattedTotalPrice = formatPrice(totalPrice);

  /**
   * Genera el enlace oficial de WhatsApp con el pedido estructurado.
   */
  const getWhatsAppCheckoutUrl = () => {
    const phoneNumber = '5493764356995'; // WhatsApp Oficial de CultiShop

    if (cart.length === 0) {
      return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
        'Hola CultiShop! Quiero consultar disponibilidad de productos en stock.'
      )}`;
    }

    const itemsText = cart
      .map(
        (item) =>
          `• *${item.quantity}x* ${item.title} (${item.selectedOption}) — ${formatPrice(
            item.unitPrice * item.quantity
          )}`
      )
      .join('\n');

    const message = [
      '🌿 *¡HOLA CULTISHOP! QUIERO REALIZAR UN PEDIDO:*',
      '',
      '🛒 *DETALLE DE MI CARRITO:*',
      itemsText,
      '',
      `💰 *TOTAL ESTIMADO:* ${formattedTotalPrice}`,
      `📦 *CANTIDAD DE PRODUCTOS:* ${totalItems} unidad(es)`,
      '',
      '📍 *Entrega:* A coordinar en Posadas, Misiones / Retiro en local oficial.',
      '¿Me confirman disponibilidad de stock y métodos de pago?',
    ].join('\n');

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        formattedTotalPrice,
        getWhatsAppCheckoutUrl,
        lastAddedItem,
        favorites,
        isFavorite,
        toggleFavorite,
        removeFromFavorites,
        clearFavorites,
        favoritesCount,
        searchQuery,
        setSearchQuery,
        clearSearch,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop debe ser utilizado dentro de un ShopProvider');
  }
  return context;
};

// Alias compatible
export const useCart = useShop;

