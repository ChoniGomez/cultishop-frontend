import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { buildApiUrl } from '../config/api';

const ShopContext = createContext();

const CART_STORAGE_KEY = 'cultishop_cart_v1';
const FAVORITES_STORAGE_KEY = 'cultishop_favorites_v1';
const PRODUCTS_STORAGE_KEY = 'cultishop_products_v3';
const PRODUCTS_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutos de validez máxima para caché local

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

/**
 * Normaliza las opciones / medidas de un producto al formato estándar:
 * [{ name: string, price: number, stock: number }]
 * Soporta retrocompatibilidad con arrays de strings (ej: ["100 cc", "250 cc"]).
 */
export const getProductOptions = (product) => {
  if (!product) return [];
  const raw = product.options;
  if (!raw) return [];

  let list = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
      else list = raw.split(',').map((s) => s.trim()).filter(Boolean);
    } catch {
      list = raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  const basePrice = typeof product.numericPrice === 'number'
    ? product.numericPrice
    : (typeof product.price === 'number' ? product.price : parsePrice(product.price));

  const baseStock = product.stock !== undefined && product.stock !== null && !isNaN(Number(product.stock))
    ? Number(product.stock)
    : 10;

  return list.map((item, idx) => {
    if (typeof item === 'object' && item !== null) {
      const name = String(item.name || item.title || item.option || `Opción ${idx + 1}`).trim();
      const price = typeof item.price === 'number'
        ? item.price
        : (item.price ? parsePrice(item.price) : basePrice);
      const stock = item.stock !== undefined && item.stock !== null && item.stock !== ''
        ? parseInt(String(item.stock), 10)
        : baseStock;
      return {
        name,
        price: isNaN(price) ? basePrice : price,
        stock: isNaN(stock) ? baseStock : stock
      };
    }
    const name = String(item).trim();
    return { name, price: basePrice, stock: baseStock };
  }).filter((opt) => opt.name.length > 0);
};

/**
 * Determina si un producto está agotado / sin stock.
 * Se considera sin stock si su stock es 0 (o menor), si todas sus variantes tienen 0 stock, o su badge es 'SIN STOCK'.
 */
export const isProductOutOfStock = (product) => {
  if (!product) return false;

  const badgeStr = (product.badge || '').trim().toUpperCase();
  if (badgeStr === 'SIN STOCK' || badgeStr === 'SIN-STOCK' || badgeStr === 'AGOTADO') {
    return true;
  }

  const options = getProductOptions(product);
  if (options.length > 0) {
    const hasAnyStock = options.some((opt) => (Number(opt.stock) || 0) > 0);
    if (!hasAnyStock) return true;
  } else if (product.stock !== undefined && product.stock !== null) {
    const num = Number(product.stock);
    if (!isNaN(num) && num <= 0) return true;
  }

  return false;
};

/**
 * Obtiene la información calculada de precios para un producto:
 * - hasMultipleOptions: si tiene más de 1 medida/presentación
 * - isRange: si los precios varían entre las opciones
 * - minPrice / maxPrice: valores numéricos
 * - formattedPrice: ej "$6.000,00 – $46.200,00" o "$14.500,00"
 * - options: lista normalizada de [{ name, price }]
 */
export const getProductPriceInfo = (product) => {
  if (!product) {
    return {
      hasMultipleOptions: false,
      isRange: false,
      minPrice: 0,
      maxPrice: 0,
      formattedPrice: '$0,00',
      options: []
    };
  }

  const options = getProductOptions(product);
  const basePrice = typeof product.numericPrice === 'number'
    ? product.numericPrice
    : (typeof product.price === 'number' ? product.price : parsePrice(product.price));

  if (options.length === 0) {
    return {
      hasMultipleOptions: false,
      isRange: false,
      minPrice: basePrice,
      maxPrice: basePrice,
      formattedPrice: formatPrice(basePrice),
      options: []
    };
  }

  if (options.length === 1) {
    const singlePrice = options[0].price || basePrice;
    return {
      hasMultipleOptions: false,
      isRange: false,
      minPrice: singlePrice,
      maxPrice: singlePrice,
      formattedPrice: formatPrice(singlePrice),
      options
    };
  }

  const prices = options.map((o) => o.price).filter((p) => !isNaN(p) && p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : basePrice;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : basePrice;
  const isRange = minPrice !== maxPrice;

  return {
    hasMultipleOptions: true,
    isRange,
    minPrice,
    maxPrice,
    formattedPrice: isRange ? `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}` : formatPrice(minPrice),
    options
  };
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
  // Helper para persistir productos en LocalStorage con timestamp de control de expiración
  const saveProductsCache = (productsList) => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify({
        timestamp: Date.now(),
        products: productsList
      }));
    } catch (e) {
      console.warn('Error guardando productos en LocalStorage:', e);
    }
  };

  const [products, setProducts] = useState(() => {
    try {
      // Limpiar versiones obsoletas sin expiración
      localStorage.removeItem('cultishop_products_v2');
      localStorage.removeItem('cultishop_products_v1');

      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.timestamp && Array.isArray(parsed.products)) {
          const isFresh = Date.now() - parsed.timestamp < PRODUCTS_CACHE_TTL_MS;
          if (isFresh && parsed.products.length > 0) {
            return parsed.products;
          }
        }
      }
    } catch (err) {
      console.error('Error al leer productos de LocalStorage:', err);
    }
    return [];
  });

  const [loadingProducts, setLoadingProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.timestamp && Date.now() - parsed.timestamp < PRODUCTS_CACHE_TTL_MS && parsed.products?.length > 0) {
          return false;
        }
      }
    } catch (e) {}
    return true;
  });

  const [categories, setCategories] = useState(CATEGORIES);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Cargar categorías y subcategorías desde la base de datos
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch(buildApiUrl('categories'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      }
    } catch (err) {
      console.warn('API /api/categories no disponible temporalmente, catálogo local activo:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Sincronizar con Backend y persistir en LocalStorage con control de versión
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(buildApiUrl('products'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products)) {
          const apiProducts = data.products.map((p) => ({
            ...p,
            image: p.image_url || p.image,
            image_url: p.image_url || p.image,
            badgeType: p.badge_type || p.badgeType || (p.badge === 'SIN STOCK' || Number(p.stock) <= 0 ? 'red' : 'gold'),
            numericPrice: typeof p.price === 'number' ? p.price : parsePrice(p.price),
            price: typeof p.price === 'number' ? formatPrice(p.price) : p.price,
            stock: p.stock ?? 20,
            brand: p.brand || '',
            origin: p.origin || '',
            format: p.format || '',
            cultivationStage: p.cultivation_stage || p.cultivationStage || '',
            dosage: p.dosage || '',
            phRecommended: p.ph_recommended || p.phRecommended || '',
            ecRecommended: p.ec_recommended || p.ecRecommended || '',
            suitableFor: p.suitable_for || p.suitableFor || '',
            keyBenefits: p.key_benefits || p.keyBenefits || [],
            applicationGuide: p.application_guide || p.applicationGuide || [],
            cannabisSpecs: p.cannabis_specs || p.cannabisSpecs || null,
            shippingInfo: p.shipping_info || p.shippingInfo || '',
            details: p.details || null,
            subcategory: p.subcategory || null,
            subcategory_id: p.subcategory_id || null,
            subcategory_slug: p.subcategory_slug || null
          }));

          setProducts(apiProducts);
          saveProductsCache(apiProducts);
        }
      }
    } catch (err) {
      console.warn('API /api/products no disponible temporalmente, catálogo local activo:', err);
      // Solo en caso de error y si no hay productos cargados en memoria, usar el fallback
      setProducts((current) => {
        if (current.length === 0) {
          return FALLBACK_PRODUCTS.map((p) => ({
            ...p,
            image: p.image || p.image_url,
            image_url: p.image || p.image_url,
            badgeType: p.badgeType || p.badge_type || (p.badge === 'SIN STOCK' || Number(p.stock) <= 0 ? 'red' : 'gold'),
            stock: p.stock ?? 25,
            numericPrice: typeof p.price === 'number' ? p.price : parsePrice(p.price)
          }));
        }
        return current;
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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
        saveProductsCache(next);
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
            stock: data.product.stock ?? 20,
            brand: data.product.brand || '',
            origin: data.product.origin || '',
            format: data.product.format || '',
            cultivationStage: data.product.cultivation_stage || data.product.cultivationStage || '',
            dosage: data.product.dosage || '',
            phRecommended: data.product.ph_recommended || data.product.phRecommended || '',
            ecRecommended: data.product.ec_recommended || data.product.ecRecommended || '',
            suitableFor: data.product.suitable_for || data.product.suitableFor || '',
            keyBenefits: data.product.key_benefits || data.product.keyBenefits || [],
            applicationGuide: data.product.application_guide || data.product.applicationGuide || [],
            cannabisSpecs: data.product.cannabis_specs || data.product.cannabisSpecs || null,
            shippingInfo: data.product.shipping_info || data.product.shippingInfo || '',
            details: data.product.details || null,
            subcategory: data.product.subcategory || null,
            subcategory_id: data.product.subcategory_id || null
          };
          setProducts((prev) => {
            const next = prev.map((p) => (p.id === id || String(p.id) === String(id) ? { ...p, ...dbProd } : p));
            try {
              saveProductsCache(next);
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
        saveProductsCache(next);
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
            stock: data.product.stock ?? 20,
            brand: data.product.brand || '',
            origin: data.product.origin || '',
            format: data.product.format || '',
            cultivationStage: data.product.cultivation_stage || data.product.cultivationStage || '',
            dosage: data.product.dosage || '',
            phRecommended: data.product.ph_recommended || data.product.phRecommended || '',
            ecRecommended: data.product.ec_recommended || data.product.ecRecommended || '',
            suitableFor: data.product.suitable_for || data.product.suitableFor || '',
            keyBenefits: data.product.key_benefits || data.product.keyBenefits || [],
            applicationGuide: data.product.application_guide || data.product.applicationGuide || [],
            cannabisSpecs: data.product.cannabis_specs || data.product.cannabisSpecs || null,
            shippingInfo: data.product.shipping_info || data.product.shippingInfo || '',
            details: data.product.details || null,
            subcategory: data.product.subcategory || null,
            subcategory_id: data.product.subcategory_id || null
          };
          setProducts((prev) => {
            const next = prev.map((p) => (p.id === tempId ? dbProd : p));
            try {
              saveProductsCache(next);
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
        saveProductsCache(next);
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
   * Valida stock > 0 y selección obligatoria si tiene múltiples medidas.
   */
  const addToCart = (product, selectedOption, quantity = 1) => {
    // 1. Validación de Stock
    if (isProductOutOfStock(product)) {
      return {
        success: false,
        reason: 'out_of_stock',
        message: 'Este producto se encuentra actualmente sin stock.'
      };
    }

    const priceInfo = getProductPriceInfo(product);

    // 2. Validación de selección obligatoria si hay múltiples opciones
    if (priceInfo.hasMultipleOptions && (!selectedOption || String(selectedOption).trim() === '')) {
      return {
        success: false,
        reason: 'option_required',
        message: 'Por favor, seleccioná una opción o medida antes de agregar al carrito.'
      };
    }

    // 3. Resolución de nombre de opción, precio unitario y stock específico
    let finalOptionName = 'Estándar';
    let unitPrice = priceInfo.minPrice;
    let optionStock = product.stock !== undefined && !isNaN(Number(product.stock)) ? Number(product.stock) : 10;

    if (priceInfo.hasMultipleOptions) {
      finalOptionName = selectedOption;
      const matched = priceInfo.options.find((o) => o.name === selectedOption);
      if (matched) {
        unitPrice = matched.price;
        if (matched.stock !== undefined && matched.stock !== null && !isNaN(Number(matched.stock))) {
          optionStock = Number(matched.stock);
        }
      }
    } else if (priceInfo.options.length === 1) {
      finalOptionName = priceInfo.options[0].name;
      unitPrice = priceInfo.options[0].price;
      if (priceInfo.options[0].stock !== undefined && priceInfo.options[0].stock !== null && !isNaN(Number(priceInfo.options[0].stock))) {
        optionStock = Number(priceInfo.options[0].stock);
      }
    } else if (selectedOption) {
      finalOptionName = selectedOption;
    }

    if (optionStock <= 0) {
      return {
        success: false,
        reason: 'out_of_stock',
        message: `La presentación "${finalOptionName}" se encuentra actualmente sin stock disponible.`
      };
    }

    const cartId = `${product.id}__${finalOptionName}`;
    const formattedItemPrice = formatPrice(unitPrice);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.cartId === cartId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          unitPrice,
          formattedPrice: formattedItemPrice
        };
        return updated;
      } else {
        const newItem = {
          cartId,
          productId: product.id,
          title: product.title,
          category: product.category,
          selectedOption: finalOptionName,
          unitPrice,
          formattedPrice: formattedItemPrice,
          image: product.image || product.image_url,
          quantity,
        };
        return [...prevCart, newItem];
      }
    });

    // Notificación efímera
    setLastAddedItem({
      title: product.title,
      option: finalOptionName,
      price: formattedItemPrice,
      time: Date.now(),
    });

    return { success: true };
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
        getProductOptions,
        isProductOutOfStock,
        getProductPriceInfo,
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
        categories,
        loadingCategories,
        fetchCategories,
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

