import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { buildApiUrl, buildImageUrl } from '../config/api';
import { useAuth } from './AuthContext';

const ShopContext = createContext();

const CART_STORAGE_KEY = 'cultishop_cart_v1';
const FAVORITES_STORAGE_KEY = 'cultishop_favorites_v1';
const PRODUCTS_STORAGE_KEY = 'cultishop_products_v3';
const PRODUCTS_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutos de validez máxima para caché en memoria
const FEATURED_STORAGE_KEY = 'cultishop_featured_v2';
const FEATURED_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos para productos destacados
const CATEGORIES_STORAGE_KEY = 'cultishop_categories_v2';
const CATEGORIES_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de validez para categorías
const SETTINGS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos de validez para configuración
const PAYMENT_SETTINGS_KEY = 'cultishop_payment_settings_v1';
const LOCATION_SETTINGS_KEY = 'cultishop_location_settings_v2';

/**
 * Capa de almacenamiento seguro y tolerante a fallos (QuotaExceededError).
 * Evita bloqueos en modo incógnito, localStorage desactivado o navegadores con cuota llena.
 */
export const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch (err) {
      console.warn(`[safeStorage] Error al leer "${key}":`, err?.message || err);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch (err) {
      // Manejo específico de cuota excedida (QuotaExceededError)
      const isQuotaError =
        err?.name === 'QuotaExceededError' ||
        err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err?.code === 22 ||
        err?.code === 1014 ||
        err?.number === -2147024882;

      if (isQuotaError) {
        console.warn(`[safeStorage] Cuota de LocalStorage excedida al guardar "${key}". Purgando claves pesadas...`);
        try {
          // Limpiar inmediatamente versiones de catálogo que sobrecargan los 5MB del navegador
          window.localStorage.removeItem('cultishop_products_v3');
          window.localStorage.removeItem('cultishop_products_v2');
          window.localStorage.removeItem('cultishop_products_v1');
          window.localStorage.removeItem('cultishop_products');
          window.localStorage.setItem(key, value);
          return true;
        } catch {
          console.warn(`[safeStorage] Imposible almacenar "${key}" tras purga.`);
          return false;
        }
      }
      console.warn(`[safeStorage] Error al persistir "${key}":`, err?.message || err);
      return false;
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {}
  }
};

// ============================================================
// CACHÉ DE PRODUCTOS EN MEMORIA (ESTADO GLOBAL LIVIANO)
// ============================================================
// Mantiene los 630+ productos en RAM para navegación instantánea sin saturar LocalStorage
let inMemoryProductsCache = null;
let inMemoryProductsTimestamp = 0;
let inFlightProductsPromise = null;

export const DEFAULT_PAYMENT_SETTINGS = {
  bank_alias: 'CULTISHOP.POSADAS',
  bank_cbu: '',
  bank_name: 'Mercado Pago / Billeteras Virtuales',
  account_holder: 'CultiShop Posadas',
  payment_notes: 'Al confirmar el pedido podrás enviar el comprobante de transferencia directamente por WhatsApp.'
};

export const DEFAULT_LOCATION_SETTINGS = {
  address: 'Av. López y Planes casi Lavalle ("adentro del ACUARIUM"), Posadas, Misiones, Argentina',
  hours: 'Lunes a Sábados de 9:00 a 13:00 y de 16:30 a 20:30 hs',
  phone: '+54 9 376 435-6995',
  google_maps_url: 'https://maps.google.com/?q=Av.+L%C3%B3pez+y+Planes+y+Lavalle,+Posadas,+Misiones,+Argentina',
  google_maps_embed_url: 'https://maps.google.com/maps?q=Av.+L%C3%B3pez+y+Planes+y+Lavalle,+Posadas,+Misiones,+Argentina&t=&z=16&ie=UTF8&iwloc=&output=embed',
  latitude: -27.3719,
  longitude: -55.9084
};

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
  const { user, isAdmin } = useAuth();

  // Limpieza proactiva de claves pesadas de catálogo que bloqueaban LocalStorage
  useEffect(() => {
    safeStorage.removeItem(PRODUCTS_STORAGE_KEY);
    safeStorage.removeItem('cultishop_products_v3');
    safeStorage.removeItem('cultishop_products_v2');
    safeStorage.removeItem('cultishop_products_v1');
    safeStorage.removeItem('cultishop_products');
  }, []);

  // Inicialización de carrito desde LocalStorage seguro
  const [cart, setCart] = useState(() => {
    try {
      const saved = safeStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.warn('Aviso al cargar carrito:', err);
      return [];
    }
  });

  // Estado del drawer lateral del carrito
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Notificación breve cuando se añade un producto
  const [lastAddedItem, setLastAddedItem] = useState(null);

  // Sincronizar en LocalStorage seguro cada cambio
  useEffect(() => {
    safeStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Inicialización de favoritos desde LocalStorage seguro
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = safeStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.warn('Aviso al cargar favoritos:', err);
      return [];
    }
  });

  // Sincronizar favoritos en LocalStorage seguro
  useEffect(() => {
    safeStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // ============================================================
  // GESTIÓN Y PERSISTENCIA DE PRODUCTOS (CATÁLOGO EN MEMORIA)
  // ============================================================
  // Helper para mantener la caché en memoria sincronizada sin tocar ni desbordar LocalStorage
  const saveProductsCache = (productsList) => {
    if (Array.isArray(productsList)) {
      inMemoryProductsCache = productsList;
      inMemoryProductsTimestamp = Date.now();
    }
  };

  const [products, setProducts] = useState(() => {
    // Si ya existe en la caché en memoria del módulo, reusarlo inmediatamente
    if (inMemoryProductsCache && Array.isArray(inMemoryProductsCache) && inMemoryProductsCache.length > 0) {
      return inMemoryProductsCache;
    }
    return [];
  });

  const [loadingProducts, setLoadingProducts] = useState(false);

  // Productos destacados / nuevos para la página de inicio (carga ultra liviana)
  const [featuredProducts, setFeaturedProducts] = useState(() => {
    try {
      const saved = safeStorage.getItem(FEATURED_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.timestamp && (Date.now() - parsed.timestamp < FEATURED_CACHE_TTL_MS) && Array.isArray(parsed.products) && parsed.products.length > 0) {
          return parsed.products;
        }
      }
    } catch (e) {}
    return [];
  });
  const [loadingFeatured, setLoadingFeatured] = useState(() => featuredProducts.length === 0);

  const [categories, setCategories] = useState(() => {
    try {
      const saved = safeStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.timestamp && (Date.now() - parsed.timestamp < CATEGORIES_CACHE_TTL_MS) && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          return parsed.categories;
        }
      }
    } catch {}
    return CATEGORIES;
  });
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Cargar categorías y subcategorías desde la base de datos con caché local inteligente
  const fetchCategories = async (force = false) => {
    if (!force) {
      try {
        const saved = safeStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.timestamp && (Date.now() - parsed.timestamp < CATEGORIES_CACHE_TTL_MS) && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
            return;
          }
        }
      } catch {}
    }

    setLoadingCategories(true);
    try {
      const res = await fetch(buildApiUrl('categories'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
          safeStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify({
            timestamp: Date.now(),
            categories: data.categories
          }));
        }
      }
    } catch (err) {
      console.warn('API /api/categories no disponible temporalmente, catálogo local activo:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // ============================================================
  // CONFIGURACIÓN DE DATOS DE PAGO Y ALIAS BANCARIO
  // ============================================================
  const [paymentSettings, setPaymentSettings] = useState(() => {
    try {
      const saved = safeStorage.getItem(PAYMENT_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const data = parsed?.data || parsed;
        return { ...DEFAULT_PAYMENT_SETTINGS, ...data };
      }
    } catch {
      return DEFAULT_PAYMENT_SETTINGS;
    }
    return DEFAULT_PAYMENT_SETTINGS;
  });
  const [loadingPaymentSettings, setLoadingPaymentSettings] = useState(false);

  const fetchPaymentSettings = async (force = false) => {
    if (!force) {
      try {
        const saved = safeStorage.getItem(PAYMENT_SETTINGS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.timestamp && (Date.now() - parsed.timestamp < SETTINGS_CACHE_TTL_MS) && parsed.data) {
            return parsed.data;
          }
        }
      } catch {}
    }

    setLoadingPaymentSettings(true);
    try {
      const res = await fetch(buildApiUrl('settings/payment'));
      if (res.ok) {
        const data = await res.json();
        if (data && data.payment) {
          const merged = { ...DEFAULT_PAYMENT_SETTINGS, ...data.payment };
          setPaymentSettings(merged);
          safeStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: merged
          }));
          return merged;
        }
      }
    } catch (err) {
      console.warn('API /api/settings/payment no disponible temporalmente:', err);
    } finally {
      setLoadingPaymentSettings(false);
    }
    return paymentSettings;
  };

  const updatePaymentSettings = async (newSettings, token) => {
    try {
      const res = await fetch(buildApiUrl('settings/payment'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar los datos de pago.');
      }

      const updated = { ...DEFAULT_PAYMENT_SETTINGS, ...(data.payment || newSettings) };
      setPaymentSettings(updated);
      safeStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: updated
      }));

      return { success: true, payment: updated, message: data.message };
    } catch (err) {
      return { success: false, error: err.message || 'Error al conectar con el servidor.' };
    }
  };

  // ============================================================
  // CONFIGURACIÓN DE UBICACIÓN Y MAPA DE GOOGLE MAPS
  // ============================================================
  const [locationSettings, setLocationSettings] = useState(() => {
    try {
      const saved = safeStorage.getItem(LOCATION_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const data = parsed?.data || parsed;
        return { ...DEFAULT_LOCATION_SETTINGS, ...data };
      }
    } catch {
      return DEFAULT_LOCATION_SETTINGS;
    }
    return DEFAULT_LOCATION_SETTINGS;
  });
  const [loadingLocationSettings, setLoadingLocationSettings] = useState(false);

  const fetchLocationSettings = async (force = false) => {
    if (!force) {
      try {
        const saved = safeStorage.getItem(LOCATION_SETTINGS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.timestamp && (Date.now() - parsed.timestamp < SETTINGS_CACHE_TTL_MS) && parsed.data) {
            return parsed.data;
          }
        }
      } catch {}
    }

    setLoadingLocationSettings(true);
    try {
      const res = await fetch(buildApiUrl('settings/location'));
      if (res.ok) {
        const data = await res.json();
        if (data && data.location) {
          const merged = { ...DEFAULT_LOCATION_SETTINGS, ...data.location };
          setLocationSettings(merged);
          safeStorage.setItem(LOCATION_SETTINGS_KEY, JSON.stringify({
            timestamp: Date.now(),
            data: merged
          }));
          return merged;
        }
      }
    } catch (err) {
      console.warn('API /api/settings/location no disponible temporalmente:', err);
    } finally {
      setLoadingLocationSettings(false);
    }
    return locationSettings;
  };

  const updateLocationSettings = async (newSettings, token) => {
    try {
      const res = await fetch(buildApiUrl('settings/location'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar los datos de ubicación.');
      }

      const updated = { ...DEFAULT_LOCATION_SETTINGS, ...(data.location || newSettings) };
      setLocationSettings(updated);
      safeStorage.setItem(LOCATION_SETTINGS_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: updated
      }));

      return { success: true, location: updated, message: data.message };
    } catch (err) {
      return { success: false, error: err.message || 'Error al conectar con el servidor.' };
    }
  };

  const formatApiProduct = (p) => {
    const rawImage = p.image_url || p.image;
    const resolvedImage = buildImageUrl(rawImage);
    return {
      ...p,
      image: resolvedImage,
      image_url: resolvedImage,
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
    };
  };

  // Carga ligera de productos destacados / recientes para la Home (ultra rápida)
  const fetchFeaturedProducts = async (force = false) => {
    if (!force) {
      try {
        const saved = safeStorage.getItem(FEATURED_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.timestamp && (Date.now() - parsed.timestamp < FEATURED_CACHE_TTL_MS) && Array.isArray(parsed.products) && parsed.products.length > 0) {
            setFeaturedProducts(parsed.products);
            setLoadingFeatured(false);
            return parsed.products;
          }
        }
      } catch {}
    }

    setLoadingFeatured(true);
    try {
      const res = await fetch(buildApiUrl('products?featured=true&limit=8'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products) && data.products.length > 0) {
          const apiFeatured = data.products.map(formatApiProduct);
          setFeaturedProducts(apiFeatured);
          safeStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify({
            timestamp: Date.now(),
            products: apiFeatured
          }));
          return apiFeatured;
        }
      }
    } catch (err) {
      console.warn('API /api/products?featured=true no disponible, usando fallback:', err);
    } finally {
      setLoadingFeatured(false);
    }

    if (products.length > 0) {
      const fallbackList = products.slice(0, 8);
      setFeaturedProducts(fallbackList);
      return fallbackList;
    }
    return featuredProducts;
  };

  // Sincronizar con Backend el catálogo completo (bajo demanda con deduplicación y caché en memoria)
  const fetchProducts = async (force = false) => {
    // 1. Si no es forzado y tenemos caché fresca en memoria, retornar sin peticiones innecesarias
    if (!force && inMemoryProductsCache && Array.isArray(inMemoryProductsCache) && inMemoryProductsCache.length > 0) {
      const isFresh = Date.now() - inMemoryProductsTimestamp < PRODUCTS_CACHE_TTL_MS;
      if (isFresh) {
        if (products.length === 0) {
          setProducts(inMemoryProductsCache);
        }
        setLoadingProducts(false);
        return inMemoryProductsCache;
      }
    }

    // 2. Si ya hay una consulta idéntica en vuelo, reutilizar la misma promesa (deduplicación)
    if (inFlightProductsPromise && !force) {
      return inFlightProductsPromise;
    }

    setLoadingProducts(true);
    inFlightProductsPromise = (async () => {
      try {
        const res = await fetch(buildApiUrl('products'));
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products)) {
            const apiProducts = data.products.map(formatApiProduct);
            inMemoryProductsCache = apiProducts;
            inMemoryProductsTimestamp = Date.now();
            setProducts(apiProducts);
            return apiProducts;
          }
        }
      } catch (err) {
        console.warn('API /api/products no disponible temporalmente, catálogo local en memoria activo:', err);
        // Solo en caso de error y si no hay productos cargados en memoria, usar el fallback
        setProducts((current) => {
          if (current.length === 0) {
            const fallbackFormatted = FALLBACK_PRODUCTS.map((p) => ({
              ...p,
              image: p.image || p.image_url,
              image_url: p.image_url || p.image,
              badgeType: p.badgeType || p.badge_type || (p.badge === 'SIN STOCK' || Number(p.stock) <= 0 ? 'red' : 'gold'),
              stock: p.stock ?? 25,
              numericPrice: typeof p.price === 'number' ? p.price : parsePrice(p.price)
            }));
            inMemoryProductsCache = fallbackFormatted;
            inMemoryProductsTimestamp = Date.now();
            return fallbackFormatted;
          }
          return current;
        });
      } finally {
        setLoadingProducts(false);
        inFlightProductsPromise = null;
      }
      return products;
    })();

    return inFlightProductsPromise;
  };

  // Caché en memoria por categoría con TTL de 5 minutos para navegación móvil ultra-rápida
  const categoryCacheRef = useRef(new Map());

  /**
   * Consulta optimizada y ligera de productos filtrados directamente en el Backend por categoría/subcategoría.
   * Evita transferir el catálogo completo de 600+ productos al teléfono móvil.
   */
  const fetchCategoryProducts = async (categorySlug, subcategorySlug = null, force = false) => {
    if (!categorySlug || categorySlug === 'todos') {
      return fetchProducts(force);
    }

    const cleanCat = String(categorySlug).trim().toLowerCase();
    const cleanSub = subcategorySlug ? String(subcategorySlug).trim().toLowerCase() : 'all';
    const cacheKey = `${cleanCat}:${cleanSub}`;

    // 1. Si está en caché de memoria reciente, devolver inmediatamente (0 ms)
    if (!force && categoryCacheRef.current.has(cacheKey)) {
      const entry = categoryCacheRef.current.get(cacheKey);
      if (Date.now() - entry.timestamp < PRODUCTS_CACHE_TTL_MS) {
        return entry.data;
      }
    }

    setLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      params.set('category', cleanCat);
      if (subcategorySlug && cleanSub !== 'all') {
        params.set('subcategory', cleanSub);
      }

      const res = await fetch(buildApiUrl(`products?${params.toString()}`));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products)) {
          const apiProducts = data.products.map(formatApiProduct);
          categoryCacheRef.current.set(cacheKey, {
            timestamp: Date.now(),
            data: apiProducts
          });

          // Mezclar en el estado general de productos
          setProducts((prev) => {
            const map = new Map(prev.map(p => [String(p.id), p]));
            apiProducts.forEach(p => map.set(String(p.id), p));
            return Array.from(map.values());
          });

          return apiProducts;
        }
      }
    } catch (err) {
      console.warn(`Error al obtener productos de categoría "${cleanCat}":`, err);
    } finally {
      setLoadingProducts(false);
    }
    return [];
  };

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
    fetchPaymentSettings();
    fetchLocationSettings();
  }, []);

  /**
   * Actualiza un producto existente (imagen, precio, stock, etc.).
   * Actualiza inmediatamente el estado en memoria y sincroniza con el backend.
   */
  const updateProduct = async (id, updatedFields, authToken) => {
    const finalImage = updatedFields.image_url || updatedFields.image;
    const nowIso = new Date().toISOString();

    // 1. Actualización inmediata en el estado de productos y memoria
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
      saveProductsCache(next);
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
      safeStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavs));
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
      safeStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
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
      console.warn('PUT /api/products no sincronizado con backend, guardado en memoria:', apiErr);
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
    // 0. Restricción para cuentas de Administrador
    if (isAdmin) {
      return {
        success: false,
        reason: 'admin_restricted',
        message: 'Las cuentas con rol de administrador no pueden realizar compras. Usa el Panel de Control.'
      };
    }

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
          image: buildImageUrl(product.image || product.image_url),
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
  const openCart = () => {
    if (isAdmin) return;
    setIsCartOpen(true);
  };
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => {
    if (isAdmin) return;
    setIsCartOpen((prev) => !prev);
  };

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
        fetchCategoryProducts,
        featuredProducts: (featuredProducts && featuredProducts.length > 0) ? featuredProducts : (products.slice(0, 8)),
        loadingFeatured,
        fetchFeaturedProducts,
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
        paymentSettings,
        loadingPaymentSettings,
        fetchPaymentSettings,
        updatePaymentSettings,
        locationSettings,
        loadingLocationSettings,
        fetchLocationSettings,
        updateLocationSettings,
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

