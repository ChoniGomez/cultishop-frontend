import { buildImageUrl } from '../config/api';
import { PRODUCTS } from '../data/products';

/**
 * Mapeo de imágenes temáticas por categoría para cuando un insumo no tiene foto física
 * o la URL falla, asegurando que fertilizantes, macetas, iluminación, etc., muestren
 * una imagen adecuada a su rubro y NUNCA un comodín genérico idéntico para todos.
 */
export const CATEGORY_FALLBACK_IMAGES = {
  'fertilizantes': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600',
  'control-de-plagas': 'https://images.unsplash.com/photo-1536257104079-aa99c6460a5a?auto=format&fit=crop&q=80&w=600',
  'indoor': 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=600',
  'iluminacion': 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=600',
  'medicion': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
  'kits': 'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&q=80&w=600',
  'parafernalia': 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=600',
  'sustratos-macetas': 'https://images.unsplash.com/photo-1592417817098-8f3d691a4bf5?auto=format&fit=crop&q=80&w=600',
  'semillas': 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=600',
  'riego': 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&q=80&w=600',
  'default': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600'
};

/**
 * Extrae la cadena de imagen cruda de cualquier objeto producto,
 * inspeccionando todas las posibles propiedades provenientes de la API o base de datos.
 */
export const getProductRawImage = (product) => {
  if (!product || typeof product !== 'object') return '';

  // 1. Propiedades individuales directas
  const candidates = [
    product.image_url,
    product.imageUrl,
    product.imagen,
    product.image,
    product.img,
    product.photo,
    product.thumbnail
  ];

  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim()) {
      return c.trim();
    }
  }

  // 2. Arrays de imágenes (images o imagenes)
  const arrayCandidates = [product.images, product.imagenes];
  for (const arr of arrayCandidates) {
    if (Array.isArray(arr) && arr.length > 0) {
      for (const item of arr) {
        if (typeof item === 'string' && item.trim()) {
          return item.trim();
        }
        if (item && typeof item === 'object') {
          const inner = item.url || item.image_url || item.imageUrl || item.imagen;
          if (inner && typeof inner === 'string' && inner.trim()) {
            return inner.trim();
          }
        }
      }
    }
  }

  return '';
};

/**
 * Obtiene la imagen de respaldo específica para un producto cuando su foto original no está disponible
 */
export const getProductFallbackImage = (product) => {
  if (!product) return CATEGORY_FALLBACK_IMAGES.default;

  // 1. Intentar hacer match por id o slug en el catálogo oficial estático
  const known = PRODUCTS.find((p) => {
    if (product.id && p.id === product.id) return true;
    if (product.slug && p.slug === product.slug) return true;
    if (product.title && p.title && p.title.toLowerCase().trim() === product.title.toLowerCase().trim()) return true;
    return false;
  });

  if (known && known.image) {
    return known.image;
  }

  // 2. Mapear por categoría del producto
  const rawCategory = (
    product.category_slug || 
    product.categorySlug || 
    product.category || 
    product.subcategory_slug || 
    product.subcategory || 
    ''
  ).toLowerCase().trim();

  for (const [key, fallbackUrl] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (key !== 'default' && rawCategory.includes(key)) {
      return fallbackUrl;
    }
  }

  return CATEGORY_FALLBACK_IMAGES.default;
};

/**
 * Resuelve la URL final de la imagen del producto lista para usar en <img src="..." />
 */
export const resolveProductImage = (product) => {
  const raw = getProductRawImage(product);
  if (raw) {
    return buildImageUrl(raw);
  }
  return getProductFallbackImage(product);
};

/**
 * Extrae y resuelve todas las fotos de la galería del producto para vistas de detalle
 */
export const getAllProductImages = (product) => {
  if (!product || typeof product !== 'object') {
    return [CATEGORY_FALLBACK_IMAGES.default];
  }

  let list = [];

  const rawArrays = [product.images, product.imagenes];
  for (const arr of rawArrays) {
    if (Array.isArray(arr) && arr.length > 0) {
      list = [...list, ...arr];
    }
  }

  const singleCandidates = [
    product.image_url,
    product.imageUrl,
    product.imagen,
    product.image,
    product.photo
  ];

  for (const c of singleCandidates) {
    if (c && typeof c === 'string' && c.trim() && !list.includes(c.trim())) {
      list.push(c.trim());
    }
  }

  const resolved = list
    .map((img) => {
      const str = typeof img === 'string' ? img.trim() : (img?.url ? String(img.url).trim() : '');
      return str ? buildImageUrl(str) : '';
    })
    .filter(Boolean);

  const unique = Array.from(new Set(resolved));
  if (unique.length > 0) {
    return unique;
  }

  return [getProductFallbackImage(product)];
};

