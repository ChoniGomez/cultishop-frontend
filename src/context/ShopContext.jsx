import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';
import { buildApiUrl } from '../config/api';

const ShopContext = createContext();

const CART_STORAGE_KEY = 'cultishop_cart_v1';
const FAVORITES_STORAGE_KEY = 'cultishop_favorites_v1';
const PRODUCTS_STORAGE_KEY = 'cultishop_products_v2';

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

  // ============================================================
  // GESTIÓN Y PERSISTENCIA DE PRODUCTOS (CATÁLOGO DINÁMICO)
  // ============================================================
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error al leer productos de LocalStorage:', err);
    }
    return FALLBACK_PRODUCTS.map((p) => ({
      ...p,
      image: p.image || p.image_url,
      image_url: p.image || p.image_url,
      badgeType: p.badgeType || p.badge_type || 'gold',
      stock: p.stock ?? 25,
      numericPrice: typeof p.price === 'number' ? p.price : parsePrice(p.price)
    }));
  });

  const [loadingProducts, setLoadingProducts] = useState(false);

  // Sincronizar con Backend y persistir en LocalStorage
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(buildApiUrl('products'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products) && data.products.length > 0) {
          const apiProducts = data.products.map((p) => ({
            ...p,
            image: p.image_url || p.image,
            image_url: p.image_url || p.image,
            badgeType: p.badge_type || p.badgeType || 'gold',
            numericPrice: typeof p.price === 'number' ? p.price : parsePrice(p.price),
            price: typeof p.price === 'number' ? formatPrice(p.price) : p.price,
            stock: p.stock ?? 20
          }));

          setProducts((prevProducts) => {
            // Combinar inteligentemente respetando ediciones locales recientes
            const merged = apiProducts.map((dbProd) => {
              const localMatch = prevProducts.find(
                (lp) => lp.id === dbProd.id || String(lp.id) === String(dbProd.id)
              );
              if (localMatch && localMatch._localUpdated) {
                const isLocalNewer =
                  !dbProd.updated_at ||
                  new Date(localMatch._localUpdated) > new Date(dbProd.updated_at);
                if (isLocalNewer) {
                  return { ...dbProd, ...localMatch };
                }
              }
              return dbProd;
            });

            const apiIds = new Set(apiProducts.map((p) => String(p.id)));
            const extraLocal = prevProducts.filter((lp) => !apiIds.has(String(lp.id)));
            const finalProducts = [...merged, ...extraLocal];

            try {
              localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(finalProducts));
            } catch (e) {
              console.error('Error guardando productos en LocalStorage:', e);
            }
            return finalProducts;
          });
        }
      }
    } catch (err) {
      console.warn('API /api/products no disponible temporalmente, catálogo local activo:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * Actualiza un producto existente (imagen, precio, stock, etc.).
   * Persiste inmediatamente en LocalStorage y sincroniza con el backend.
   */
  const updateProduct = async (id, updatedFields, authToken) => {
    const finalImage = updatedFields.image_url || updatedFields.image;
    const nowIso = new Date().toISOString();

    // 1. Actualización inmediata en el estado de productos y LocalStorage
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id === id || String(p.id) === String(id)) {
          return {
            ...p,
            ...updatedFields,
            image: finalImage || p.image,
            image_url: finalImage || p.image_url,
            badgeType: updatedFields.badge_type || updatedFields.badgeType || p.badgeType || 'gold',
            price: typeof updatedFields.price === 'number' ? formatPrice(updatedFields.price) : updatedFields.price,
            numericPrice: typeof updatedFields.price === 'number' ? updatedFields.price : parsePrice(updatedFields.price),
            _localUpdated: nowIso
          };
        }
        return p;
      });
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error('Error al guardar productos en LocalStorage:', err);
      }
      return next;
    });

    // 2. Si el producto estaba en favoritos, actualizar su foto e información
    setFavorites((prevFavs) => {
      const nextFavs = prevFavs.map((f) => {
        if (f.id === id || String(f.id) === String(id)) {
          return {
            ...f,
            ...updatedFields,
            image: finalImage || f.image,
            image_url: finalImage || f.image_url
          };
        }
        return f;
      });
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavs));
      } catch (e) {}
      return nextFavs;
    });

    // 3. Si el producto estaba en el carrito, actualizar su foto y título
    setCart((prevCart) => {
      const nextCart = prevCart.map((item) => {
        if (item.productId === id || String(item.productId) === String(id)) {
          return {
            ...item,
            image: finalImage || item.image,
            title: updatedFields.title || item.title
          };
        }
        return item;
      });
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
      } catch (e) {}
      return nextCart;
    });

    // 4. Sincronizar vía PUT con el backend
    try {
      const res = await fetch(buildApiUrl(`products/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(updatedFields)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          const dbProd = {
            ...data.product,
            image: data.product.image_url || data.product.image,
            image_url: data.product.image_url || data.product.image,
            badgeType: data.product.badge_type || data.product.badgeType || 'gold',
            price: typeof data.product.price === 'number' ? formatPrice(data.product.price) : data.product.price,
            numericPrice: typeof data.product.price === 'number' ? data.product.price : parsePrice(data.product.price),
            stock: data.product.stock ?? 20
          };
          setProducts((prev) => {
            const next = prev.map((p) => (p.id === id || String(p.id) === String(id) ? { ...p, ...dbProd } : p));
            try {
              localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(next));
            } catch (e) {}
            return next;
          });
        }
      }
    } catch (apiErr) {
      console.warn('PUT /api/products no sincronizado con backend, guardado en LocalStorage:', apiErr);
    }

    return { success: true };
  };

  /**
   * Da de alta un nuevo producto en el catálogo.
   */
  const addProduct = async (newProductData, authToken) => {
    const tempId = Date.now();
    const finalImage = newProductData.image_url || newProductData.image;
    const optimisticProd = {
      id: tempId,
      ...newProductData,
      image: finalImage,
      image_url: finalImage,
      badgeType: newProductData.badge_type || newProductData.badgeType || 'gold',
      price: typeof newProductData.price === 'number' ? formatPrice(newProductData.price) : newProductData.price,
      numericPrice: typeof newProductData.price === 'number' ? newProductData.price : parsePrice(newProductData.price),
      stock: newProductData.stock ?? 20,
      _localUpdated: new Date().toISOString()
    };

    setProducts((prev) => {
      const next = [optimisticProd, ...prev];
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      const res = await fetch(buildApiUrl('products'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(newProductData)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          const dbProd = {
            ...data.product,
            image: data.product.image_url || data.product.image,
            image_url: data.product.image_url || data.product.image,
            badgeType: data.product.badge_type || data.product.badgeType || 'gold',
            price: typeof data.product.price === 'number' ? formatPrice(data.product.price) : data.product.price,
            numericPrice: typeof data.product.price === 'number' ? data.product.price : parsePrice(data.product.price),
            stock: data.product.stock ?? 20
          };
          setProducts((prev) => {
            const next = prev.map((p) => (p.id === tempId ? dbProd : p));
            try {
              localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(next));
            } catch (e) {}
            return next;
          });
        }
      }
    } catch (err) {
      console.warn('POST /api/products guardado localmente:', err);
    }

    return { success: true };
  };

  /**
   * Da de baja / elimina un producto del catálogo.
   */
  const deleteProduct = async (id, authToken) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id && String(p.id) !== String(id));
      try {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await fetch(buildApiUrl(`products/${id}`), {
        method: 'DELETE',
        headers: {
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        }
      });
    } catch (err) {
      console.warn('DELETE /api/products eliminado localmente:', err);
    }

    return { success: true };
  };

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
        products,
        loadingProducts,
        fetchProducts,
        updateProduct,
        addProduct,
        deleteProduct,
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

