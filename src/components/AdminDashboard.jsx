import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle, 
  RefreshCw, 
  Eye, 
  ArrowLeft, 
  Shield, 
  KeyRound, 
  AlertTriangle,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  FileText,
  CheckCircle2,
  Sliders,
  Image as ImageIcon,
  EyeOff,
  Link as LinkIcon,
  Droplets,
  Upload
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api';
import { formatPrice, parsePrice, useShop, getProductOptions } from '../context/ShopContext';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';
import { getProductDetails } from '../data/productDetailsData';
import { WhatsAppIcon } from './WhatsAppIcon';
import { CultiShopLogo } from './CultiShopLogo';

export const AdminDashboard = () => {
  const { user, token, isAdmin, loading: authLoading } = useAuth();
  const { 
    products, 
    loadingProducts, 
    fetchProducts, 
    updateProduct, 
    addProduct, 
    deleteProduct,
    categories,
    loadingCategories,
    fetchCategories
  } = useShop();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('productos'); // 'productos' | 'pedidos' | 'perfil'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Filtros de búsqueda en productos
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState('todas');

  // Filtro de pedidos
  const [orderStatusFilter, setOrderStatusFilter] = useState('todos');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Estados de Modales de Producto (Alta / Edición / Baja)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentProduct, setCurrentProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Formulario de Producto (Campos Básicos)
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('20');
  const [formCategory, setFormCategory] = useState('Fertilizantes');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formBadge, setFormBadge] = useState('STOCK DISPONIBLE');
  const [formBadgeType, setFormBadgeType] = useState('gold');
  const [formVariants, setFormVariants] = useState([
    { name: '100 cc', price: '6000' },
    { name: '250 cc', price: '14500' },
    { name: '500 cc', price: '28000' }
  ]);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Estados para Banners Publicitarios (Hero Carousel)
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerModalMode, setBannerModalMode] = useState('create'); // 'create' | 'edit'
  const [currentBanner, setCurrentBanner] = useState(null);
  const [deleteBannerConfirmId, setDeleteBannerConfirmId] = useState(null);
  const [isSavingBanner, setIsSavingBanner] = useState(false);

  // Formulario de Banners
  const [bannerFormTitle, setBannerFormTitle] = useState('');
  const [bannerFormSubtitle, setBannerFormSubtitle] = useState('');
  const [bannerFormImageUrl, setBannerFormImageUrl] = useState('');
  const [bannerFormLinkUrl, setBannerFormLinkUrl] = useState('');
  const [bannerFormButtonText, setBannerFormButtonText] = useState('Ver Más');
  const [bannerFormOrder, setBannerFormOrder] = useState('1');
  const [bannerFormIsActive, setBannerFormIsActive] = useState(true);
  const [bannerFormShowText, setBannerFormShowText] = useState(true);

  // Referencias a inputs de archivos locales e información de archivo
  const productFileInputRef = useRef(null);
  const bannerFileInputRef = useRef(null);
  const [productImageFileName, setProductImageFileName] = useState('');
  const [bannerImageFileName, setBannerImageFileName] = useState('');

  // Colecciones seguras para evitar errores de renderizado si están cargando o vacías
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeBanners = Array.isArray(banners) ? banners : [];

  // Helper para procesar archivos de imagen local, optimizarlos y generar Data URL
  const handleImageFileChange = (file, setUrlState, setFileNameState) => {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      showNotification('error', 'Por favor, selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    if (setFileNameState) {
      setFileNameState(file.name);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimized = canvas.toDataURL('image/jpeg', 0.80);
          setUrlState(optimized);
        } else {
          setUrlState(dataUrl);
        }
      };
      img.onerror = () => {
        setUrlState(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Manejo de cambio de stock con asignación automática de "SIN STOCK"
  const handleStockChange = (val) => {
    setFormStock(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num <= 0) {
      setFormBadge('SIN STOCK');
      setFormBadgeType('red');
    } else if (!isNaN(num) && num > 0 && formBadge === 'SIN STOCK') {
      setFormBadge('STOCK DISPONIBLE');
      setFormBadgeType('gold');
    }
  };

  // Manejo de filas de variantes con precio independiente
  const handleAddVariant = () => {
    setFormVariants((prev) => [
      ...prev,
      { name: '', price: formPrice || '0' }
    ]);
  };

  const handleRemoveVariant = (index) => {
    if (formVariants.length <= 1) return;
    setFormVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleVariantChange = (index, field, value) => {
    setFormVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Pestaña activa en el Modal de Gestión de Información Detallada ('desc' | 'ficha' | 'uso' | 'envios')
  const [modalDetailTab, setModalDetailTab] = useState('desc');

  // Pestaña 1: Ventajas y Compatibilidad
  const [formKeyBenefits, setFormKeyBenefits] = useState('');
  const [formCannabisGenotype, setFormCannabisGenotype] = useState('');
  const [formCannabisStage, setFormCannabisStage] = useState('');
  const [formCannabisEnv, setFormCannabisEnv] = useState('');
  const [formCannabisQuality, setFormCannabisQuality] = useState('');

  // Pestaña 2: Ficha Técnica Oficial
  const [formBrand, setFormBrand] = useState('CultiShop Selección');
  const [formOrigin, setFormOrigin] = useState('Argentina');
  const [formFormat, setFormFormat] = useState('');
  const [formCultivationStage, setFormCultivationStage] = useState('');
  const [formPhRecommended, setFormPhRecommended] = useState('5.8 - 6.5');
  const [formEcRecommended, setFormEcRecommended] = useState('');
  const [formSuitableFor, setFormSuitableFor] = useState('');

  // Pestaña 3: Modo de Uso y Dosificación
  const [formDosage, setFormDosage] = useState('');
  const [formApplicationGuide, setFormApplicationGuide] = useState('');

  // Pestaña 4: Envíos y Retiro
  const [formShippingInfo, setFormShippingInfo] = useState('');

  // Subcategorías dinámicas dependientes de la categoría principal seleccionada
  const activeCategoryData = safeCategories.find(
    (c) =>
      (c?.name && c.name.toLowerCase() === formCategory.toLowerCase()) ||
      (c?.slug && c.slug.toLowerCase() === formCategory.toLowerCase())
  );
  const activeSubcategories = Array.isArray(activeCategoryData?.subcategories) ? activeCategoryData.subcategories : [];

  // Cambio de Categoría Principal en el formulario
  const handleCategoryChange = (newCatName) => {
    setFormCategory(newCatName);
    const newCatObj = safeCategories.find(
      (c) =>
        (c?.name && c.name.toLowerCase() === newCatName.toLowerCase()) ||
        (c?.slug && c.slug.toLowerCase() === newCatName.toLowerCase())
    );
    const newSubs = Array.isArray(newCatObj?.subcategories) ? newCatObj.subcategories : [];
    const isCurrentSubValid = newSubs.some(
      (s) =>
        (s?.name && s.name.toLowerCase() === formSubcategory.toLowerCase()) ||
        (s?.slug && s.slug.toLowerCase() === formSubcategory.toLowerCase())
    );
    if (!isCurrentSubValid) {
      setFormSubcategory('');
    }
  };

  // 1. Cargar pedidos desde el Backend
  const fetchOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(buildApiUrl('orders'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // 2. Cargar banners publicitarios desde el Backend
  const fetchBannersAdmin = async () => {
    setLoadingBanners(true);
    try {
      const headers = {
        'Accept': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let res = await fetch(buildApiUrl('banners?all=true'), { headers });
      if (!res.ok) {
        res = await fetch(buildApiUrl('banners/admin/all'), { headers });
      }
      if (!res.ok) {
        res = await fetch(buildApiUrl('banners'), { headers });
      }

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.banners || data.data || []);
        setBanners(list);
      }
    } catch (err) {
      console.error('Error al cargar banners:', err);
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchBannersAdmin();
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
      if (fetchCategories) fetchCategories();
    }
  }, [isAdmin, token]);

  const showNotification = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage({ type: '', text: '' });
    }, 4000);
  };

  // Handlers para Gestión de Banners Publicitarios
  const handleOpenCreateBannerModal = () => {
    setBannerModalMode('create');
    setCurrentBanner(null);
    setBannerFormTitle('');
    setBannerFormSubtitle('');
    setBannerFormImageUrl('');
    setBannerImageFileName('');
    setBannerFormLinkUrl('/categoria/control-de-plagas');
    setBannerFormButtonText('Ver Más');
    setBannerFormOrder(String((safeBanners?.length || 0) + 1));
    setBannerFormIsActive(true);
    setBannerFormShowText(true);
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBannerModal = (banner) => {
    if (!banner) return;
    setBannerModalMode('edit');
    setCurrentBanner(banner);
    setBannerFormTitle(banner.title || '');
    setBannerFormSubtitle(banner.subtitle || '');
    setBannerFormImageUrl(banner.image_url || '');
    setBannerImageFileName(banner.title ? `${banner.title}.jpg` : '');
    setBannerFormLinkUrl(banner.link_url || '');
    setBannerFormButtonText(banner.button_text || 'Ver Más');
    setBannerFormOrder(String(banner.display_order ?? 0));
    setBannerFormIsActive(banner.is_active !== false);
    setBannerFormShowText(banner.show_text !== false);
    setIsBannerModalOpen(true);
  };

  const handleSaveBannerSubmit = async (e) => {
    e.preventDefault();
    if (!bannerFormImageUrl.trim()) {
      showNotification('error', 'La imagen horizontal del banner es obligatoria.');
      return;
    }

    if (bannerFormShowText && !bannerFormTitle.trim()) {
      showNotification('error', 'El título del banner es obligatorio cuando se muestran textos.');
      return;
    }

    setIsSavingBanner(true);
    const payload = {
      title: bannerFormTitle.trim() || 'Banner Publicitario',
      subtitle: bannerFormSubtitle.trim(),
      image_url: bannerFormImageUrl.trim(),
      link_url: bannerFormLinkUrl.trim(),
      button_text: bannerFormButtonText.trim() || 'Ver Más',
      display_order: parseInt(bannerFormOrder, 10) || 0,
      is_active: bannerFormIsActive,
      show_text: bannerFormShowText
    };

    try {
      const url = bannerModalMode === 'create'
        ? buildApiUrl('banners')
        : buildApiUrl(`banners/${currentBanner.id}`);
      const method = bannerModalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al guardar el banner.');
      }

      showNotification('success', bannerModalMode === 'create' ? '¡Banner creado exitosamente!' : '¡Banner actualizado correctamente!');
      setIsBannerModalOpen(false);
      await fetchBannersAdmin();
    } catch (err) {
      console.error('Error guardando banner:', err);
      showNotification('error', err.message || 'Error al procesar el banner.');
    } finally {
      setIsSavingBanner(false);
    }
  };

  const handleToggleBanner = async (banner) => {
    try {
      const res = await fetch(buildApiUrl(`banners/${banner.id}/toggle`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showNotification('success', `Banner ${banner.is_active ? 'desactivado' : 'activado'} correctamente.`);
        await fetchBannersAdmin();
      }
    } catch (err) {
      console.error('Error al cambiar visibilidad:', err);
      showNotification('error', 'Error al modificar estado del banner.');
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    try {
      const res = await fetch(buildApiUrl(`banners/${bannerId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showNotification('success', 'Banner eliminado del sistema.');
        await fetchBannersAdmin();
      }
    } catch (err) {
      console.error('Error al eliminar banner:', err);
      showNotification('error', 'Error al eliminar el banner.');
    } finally {
      setDeleteBannerConfirmId(null);
    }
  };

  // Abrir Modal para Crear Producto
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCurrentProduct(null);
    setFormTitle('');
    setFormDescription('');
    setFormPrice('6000');
    setFormStock('20');
    const firstCat = safeCategories[0]?.name || 'Fertilizantes';
    setFormCategory(firstCat);
    setFormSubcategory('');
    setFormImageUrl('');
    setProductImageFileName('');
    setFormBadge('STOCK DISPONIBLE');
    setFormBadgeType('gold');
    setFormVariants([
      { name: '100 cc', price: '6000' },
      { name: '250 cc', price: '14500' },
      { name: '500 cc', price: '28000' }
    ]);
    // Reinicio de secciones de pestañas
    setModalDetailTab('desc');
    setFormKeyBenefits('');
    setFormCannabisGenotype('Apto para Índicas, Sativas, Híbridas y Autoflorecientes.');
    setFormCannabisStage('Vegetativo, Floración o Mantenimiento');
    setFormCannabisEnv('Optimizado para carpas de cultivo interior, invernaderos y exterior.');
    setFormCannabisQuality('Grado Agrícola Profesional para Cultivo Medicinal');
    setFormBrand('CultiShop Selección');
    setFormOrigin('Argentina');
    setFormFormat('Líquido concentrado soluble');
    setFormCultivationStage('Todo el ciclo de cultivo');
    setFormPhRecommended('5.8 - 6.5');
    setFormEcRecommended('1.2 - 1.6 mS/cm');
    setFormSuitableFor('Indoor, Exterior, Sustratos orgánicos y huertas.');
    setFormDosage('2 a 4 ml por litro de agua sin cloro, cada 7 a 10 días.');
    setFormApplicationGuide('');
    setFormShippingInfo('');
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar Producto
  const handleOpenEditModal = (prod) => {
    if (!prod) return;
    setModalMode('edit');
    setCurrentProduct(prod);
    setFormTitle(prod.title || '');
    setFormDescription(prod.description || '');
    const rawPrice = typeof prod.numericPrice === 'number'
      ? prod.numericPrice
      : (typeof prod.price === 'number' ? prod.price : parsePrice(prod.price));
    setFormPrice(rawPrice ? rawPrice.toString() : '0');
    setFormStock(prod.stock !== undefined ? prod.stock.toString() : '15');
    setFormCategory(prod.category || 'Fertilizantes');
    setFormSubcategory(prod.subcategory || '');
    setFormImageUrl(prod.image_url || prod.image || '');
    setProductImageFileName(prod.title ? `${prod.title}.jpg` : '');
    const isZeroStock = (prod.stock !== undefined && Number(prod.stock) <= 0) || prod.badge === 'SIN STOCK';
    setFormBadge(isZeroStock ? 'SIN STOCK' : (prod.badge || 'STOCK DISPONIBLE'));
    setFormBadgeType(isZeroStock ? 'red' : (prod.badge_type || prod.badgeType || 'gold'));

    const opts = getProductOptions(prod);
    if (opts && opts.length > 0) {
      setFormVariants(opts.map((o) => ({
        name: o.name,
        price: o.price !== undefined ? String(o.price) : (rawPrice ? String(rawPrice) : '0')
      })));
    } else {
      setFormVariants([{ name: 'Estándar', price: rawPrice ? String(rawPrice) : '0' }]);
    }

    // Especificaciones y detalles enriquecidos
    const specs = getProductDetails(prod) || {};

    // Pestaña 1: Ventajas y Compatibilidad
    const benefitsList = Array.isArray(prod.key_benefits) && prod.key_benefits.length > 0
      ? prod.key_benefits
      : (Array.isArray(prod.keyBenefits) && prod.keyBenefits.length > 0 ? prod.keyBenefits : (specs.keyBenefits || []));
    setFormKeyBenefits(Array.isArray(benefitsList) ? benefitsList.join('\n') : String(benefitsList || ''));

    const cSpecs = prod.cannabis_specs || prod.cannabisSpecs || specs.cannabisSpecs || {};
    setFormCannabisGenotype(cSpecs.genotypeCompatibility || '');
    setFormCannabisStage(cSpecs.cultivationStage || '');
    setFormCannabisEnv(cSpecs.environment || '');
    setFormCannabisQuality(cSpecs.qualityGrade || '');

    // Pestaña 2: Ficha Técnica
    setFormBrand(prod.brand || specs.brand || 'CultiShop Selección');
    setFormOrigin(prod.origin || specs.origin || 'Argentina');
    setFormFormat(prod.format || specs.format || '');
    setFormCultivationStage(prod.cultivation_stage || prod.cultivationStage || specs.cultivationStage || '');
    setFormPhRecommended(prod.ph_recommended || prod.phRecommended || specs.phRecommended || '');
    setFormEcRecommended(prod.ec_recommended || prod.ecRecommended || specs.ecRecommended || '');
    setFormSuitableFor(prod.suitable_for || prod.suitableFor || specs.suitableFor || '');

    // Pestaña 3: Modo de Uso
    setFormDosage(prod.dosage || specs.dosage || '');
    const guideList = Array.isArray(prod.application_guide) && prod.application_guide.length > 0
      ? prod.application_guide
      : (Array.isArray(prod.applicationGuide) && prod.applicationGuide.length > 0 ? prod.applicationGuide : (specs.applicationGuide || []));
    setFormApplicationGuide(Array.isArray(guideList) ? guideList.join('\n') : String(guideList || ''));

    // Pestaña 4: Envíos y Retiro
    setFormShippingInfo(prod.shipping_info || prod.shippingInfo || specs.shippingInfo || '');

    setModalDetailTab('desc');
    setIsModalOpen(true);
  };

  // Guardar Producto (Alta o Edición) con persistencia garantizada
  const handleSaveProductSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showNotification('error', 'Por favor, completa el título del producto.');
      return;
    }

    if (!formImageUrl || !formImageUrl.trim()) {
      showNotification('error', 'Por favor, selecciona una imagen desde tu equipo para el producto.');
      return;
    }

    setIsSavingProduct(true);

    const validVariants = formVariants
      .filter((v) => v.name.trim().length > 0)
      .map((v) => ({
        name: v.name.trim(),
        price: parseFloat(String(v.price).replace(/[^0-9.-]/g, '')) || 0
      }));

    const finalVariants = validVariants.length > 0
      ? validVariants
      : [{ name: 'Estándar', price: parseFloat(String(formPrice).replace(/[^0-9.-]/g, '')) || 0 }];

    const variantPrices = finalVariants.map((v) => v.price).filter((p) => p > 0);
    const finalBasePrice = variantPrices.length > 0
      ? Math.min(...variantPrices)
      : (parseFloat(String(formPrice).replace(/[^0-9.-]/g, '')) || 0);

    const numStock = parseInt(formStock, 10) || 0;
    let finalBadge = formBadge.trim();
    let finalBadgeType = formBadgeType;
    if (numStock <= 0) {
      finalBadge = 'SIN STOCK';
      finalBadgeType = 'red';
    }

    // Resolver IDs de categoría y subcategoría según lo seleccionado
    const catObj = safeCategories.find(
      c => (c?.name && c.name.toLowerCase() === formCategory.toLowerCase()) ||
           (c?.slug && c.slug.toLowerCase() === formCategory.toLowerCase())
    );
    const categoryId = catObj ? catObj.id : null;

    let subcategoryId = null;
    if (catObj && formSubcategory) {
      const subObj = Array.isArray(catObj.subcategories) ? catObj.subcategories.find(
        s => (s?.name && s.name.toLowerCase() === formSubcategory.toLowerCase()) ||
             (s?.slug && s.slug.toLowerCase() === formSubcategory.toLowerCase())
      ) : null;
      if (subObj) {
        subcategoryId = subObj.id;
      }
    }

    const keyBenefitsArray = formKeyBenefits
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    const applicationGuideArray = formApplicationGuide
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      price: finalBasePrice,
      stock: numStock,
      category: formCategory,
      category_id: categoryId,
      subcategory: formSubcategory || null,
      subcategory_id: subcategoryId,
      image_url: formImageUrl.trim() || 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&q=80&w=600',
      badge: finalBadge,
      badge_type: finalBadgeType,
      options: finalVariants,
      // Pestañas de Información Detallada
      brand: formBrand.trim(),
      origin: formOrigin.trim(),
      format: formFormat.trim(),
      cultivation_stage: formCultivationStage.trim(),
      dosage: formDosage.trim(),
      ph_recommended: formPhRecommended.trim(),
      ec_recommended: formEcRecommended.trim(),
      suitable_for: formSuitableFor.trim(),
      key_benefits: keyBenefitsArray,
      application_guide: applicationGuideArray,
      cannabis_specs: {
        genotypeCompatibility: formCannabisGenotype.trim(),
        cultivationStage: formCannabisStage.trim(),
        environment: formCannabisEnv.trim(),
        qualityGrade: formCannabisQuality.trim()
      },
      shipping_info: formShippingInfo.trim()
    };

    try {
      if (modalMode === 'create') {
        await addProduct(payload, token);
        showNotification('success', '¡Producto y especificaciones guardados exitosamente!');
      } else {
        await updateProduct(currentProduct.id, payload, token);
        showNotification('success', '¡Producto y pestañas de información actualizados!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error guardando producto:', err);
      showNotification('error', 'Ocurrió un error al procesar el guardado.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Eliminar Producto (Baja)
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id, token);
      showNotification('success', 'Producto eliminado exitosamente del catálogo.');
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      showNotification('error', 'Error al eliminar el producto.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Cambiar Estado de Pedido
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(buildApiUrl(`orders/${orderId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar estado.');
      }

      showNotification('success', `Pedido #${orderId} actualizado a "${newStatus}".`);
      fetchOrders();
    } catch (err) {
      // Actualización local
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showNotification('success', `Estado de pedido #${orderId} actualizado localmente.`);
    }
  };

  // ==========================================
  // FILTRADO DE PRODUCTOS Y PEDIDOS
  // ==========================================
  const filteredProducts = safeProducts.filter(p => {
    const matchesCategory = selectedProductCategory === 'todas' || 
      (p?.category || '').toLowerCase() === selectedProductCategory.toLowerCase();
    const query = productSearch.toLowerCase();
    const matchesSearch = !query || 
      (p?.title || '').toLowerCase().includes(query) ||
      (p?.description || '').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const filteredOrders = safeOrders.filter(o => {
    const matchesStatus = orderStatusFilter === 'todos' || o?.status === orderStatusFilter;
    if (!matchesStatus) return false;

    if (!orderSearchQuery.trim()) return true;

    const query = orderSearchQuery.trim().toLowerCase().replace(/^#/, '');
    const orderIdStr = String(o?.id || '').toLowerCase();
    const customerName = (o?.customer_name || '').toLowerCase();
    const customerEmail = (o?.customer_email || '').toLowerCase();
    const customerPhone = (o?.customer_phone || '').toLowerCase();

    return (
      orderIdStr.includes(query) ||
      customerName.includes(query) ||
      customerEmail.includes(query) ||
      customerPhone.includes(query)
    );
  });

  // Métricas
  const pendingOrdersCount = safeOrders.filter(o => o?.status === 'pending').length;
  const lowStockCount = safeProducts.filter(p => (parseInt(p?.stock, 10) || 0) <= 5).length;

  // Render si NO es Administrador
  if (!authLoading && !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto mb-6 shadow-xl">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-3xl font-black text-white font-heading mb-3">Acceso Exclusivo de Administrador</h2>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-md mx-auto">
          Esta sección está protegida y sólo puede ser gestionada por el usuario administrador de CultiShop ({'chonidacharygomez@gmail.com'}).
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/ingresar"
            className="px-6 py-2.5 rounded-full bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs uppercase tracking-wider transition"
          >
            Iniciar Sesión como Admin
          </Link>
          <Link
            to="/"
            className="px-6 py-2.5 rounded-full bg-[#142619] hover:bg-[#1f3b25] text-gray-300 font-bold text-xs uppercase tracking-wider border border-[#23422a] transition"
          >
            Volver a la Tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {/* Notificación flotante de estado */}
      {statusMessage.text && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-bold transition-all ${
          statusMessage.type === 'error' 
            ? 'bg-red-950/90 text-red-200 border-red-500' 
            : 'bg-[#122317] text-white border-[#4aa036]'
        }`}>
          {statusMessage.type === 'error' ? <AlertTriangle size={18} className="text-red-400" /> : <CheckCircle size={18} className="text-[#25d366]" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Encabezado Principal del Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#1f3b25] mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e0a96d] mb-1">
            <Shield size={14} className="fill-current" />
            <span>PORTAL OFICIAL DE ADMINISTRACIÓN CULTISHOP</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-heading">
            PANEL DE <span className="text-[#e0a96d] text-glow-gold">CONTROL</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Sesión activa como: <strong className="text-white">{user?.email}</strong> (Rol: <span className="text-[#e0a96d] font-bold">Admin</span>)
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#23422a] text-xs font-bold transition shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Ver Tienda</span>
          </Link>
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-[#e0a96d] border border-[#23422a] transition shadow-sm"
            title="Refrescar catálogo"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Total Productos</span>
            <Package size={16} className="text-[#4aa036]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-heading">{safeProducts.length}</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Catálogo en inventario</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Pedidos Totales</span>
            <ShoppingBag size={16} className="text-[#e0a96d]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-heading">{safeOrders.length}</div>
          <span className="text-[10px] text-gray-500 mt-1 block">{pendingOrdersCount} pendientes de entrega</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Stock Crítico (&le;5)</span>
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-heading">{lowStockCount}</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Insumos por reponer</span>
        </div>
      </div>

      {/* Pestañas de Navegación del Panel */}
      <div className="flex items-center gap-2 border-b border-[#1f3b25] mb-8 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('productos')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'productos'
              ? 'bg-[#2d5a27] text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#142619]'
          }`}
        >
          <Package size={16} />
          <span>Productos del Catálogo ({safeProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pedidos')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'pedidos'
              ? 'bg-[#2d5a27] text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#142619]'
          }`}
        >
          <ShoppingBag size={16} />
          <span>Gestión de Pedidos ({safeOrders.length})</span>
          {pendingOrdersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#e0a96d] text-black text-[9px] font-black">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'banners'
              ? 'bg-[#2d5a27] text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#142619]'
          }`}
        >
          <Sliders size={16} />
          <span>Banners Publicitarios ({safeBanners.length})</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN 1: GESTIÓN DE PRODUCTOS (CRUD COMPLETO) */}
      {/* ============================================================ */}
      {activeTab === 'productos' && (
        <div className="space-y-6">
          {/* Barra de herramientas: Búsqueda, Filtro de Categoría y Botón Crear */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e1c12] border border-[#1f3b25]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow max-w-2xl">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar producto por título o descripción..."
                  className="w-full py-2.5 pl-4 pr-10 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs placeholder-gray-400 focus:outline-none focus:border-[#4aa036]"
                />
                <Search size={15} className="absolute right-3.5 top-3 text-gray-400" />
              </div>

              <select
                value={selectedProductCategory}
                onChange={(e) => setSelectedProductCategory(e.target.value)}
                className="py-2.5 px-3 rounded-xl bg-[#142619] border border-[#23422a] text-gray-200 text-xs focus:outline-none focus:border-[#4aa036]"
              >
                <option value="todas">Todas las Categorías</option>
                {categories.map(cat => (
                  <option key={cat.id || cat.slug || cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
              <span>Alta de Producto</span>
            </button>
          </div>

          {/* Tabla de Productos del Catálogo */}
          <div className="bg-[#0e1c12] border border-[#1f3b25] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#142619] text-gray-400 font-bold uppercase tracking-wider border-b border-[#1f3b25]">
                  <tr>
                    <th className="py-3 px-4 min-w-[180px]">Producto / Imagen</th>
                    <th className="py-3 px-4 min-w-[160px]">Categoría / Subcategoría</th>
                    <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Precio</th>
                    <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">Stock</th>
                    <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">Etiqueta</th>
                    <th className="py-3 px-4 text-right min-w-[110px] whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f3b25]">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-400">
                        No se encontraron productos que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-[#122317] transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image_url || prod.image}
                              alt={prod.title}
                              className="w-12 h-12 rounded-xl object-cover border border-[#2d5a27] shrink-0"
                            />
                            <div>
                              <span className="font-bold text-white text-sm block font-heading">{prod.title}</span>
                              <span className="text-[11px] text-gray-400 line-clamp-1 max-w-sm">{prod.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#18311d] border border-[#2d5a27] text-gray-200 text-[11px]">
                              {prod.category || 'Varios'}
                            </span>
                            {prod.subcategory && (
                              <span className="px-2 py-0.5 rounded-md bg-[#0a140d] border border-[#e0a96d]/40 text-[#e0a96d] text-[10px] font-medium">
                                › {prod.subcategory}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-white font-heading whitespace-nowrap">
                          {(() => {
                            const pOpts = getProductOptions(prod);
                            if (pOpts.length > 1) {
                              const prices = pOpts.map(o => o.price).filter(p => !isNaN(p) && p > 0);
                              if (prices.length > 0) {
                                const min = Math.min(...prices);
                                const max = Math.max(...prices);
                                if (min !== max) {
                                   return (
                                     <div>
                                       <span className="text-xs text-[#e0a96d] block font-heading">{formatPrice(min)} – {formatPrice(max)}</span>
                                       <span className="text-[10px] text-gray-400 font-normal">({pOpts.length} medidas)</span>
                                     </div>
                                   );
                                }
                              }
                            }
                            return typeof prod.price === 'number' ? formatPrice(prod.price) : prod.price;
                          })()}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] inline-block ${
                            (prod.stock || 0) <= 0 
                              ? 'bg-red-950/80 text-red-400 border border-red-500/60' 
                              : (prod.stock || 0) <= 5
                                ? 'bg-amber-950/60 text-amber-400 border border-amber-500/50'
                                : 'bg-[#18311d] text-[#4aa036] border border-[#2d5a27]'
                          }`}>
                            {(prod.stock || 0) <= 0 ? '0 un. (Sin Stock)' : `${prod.stock} un.`}
                          </span>
                        </td>
                        <td className="py-3 px-4 min-w-[160px]">
                          {prod.badge ? (
                            <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-center shadow-sm ${
                              prod.badge_type === 'red' || prod.badgeType === 'red' || prod.badge.toUpperCase() === 'SIN STOCK'
                                ? 'bg-red-950/90 text-red-400 border border-red-500/60'
                                : prod.badge_type === 'gold' || prod.badgeType === 'gold'
                                  ? 'bg-[#e0a96d]/20 text-[#e0a96d] border border-[#e0a96d]/50'
                                  : 'bg-[#18311d] text-[#4aa036] border border-[#2d5a27]'
                            }`}>
                              {prod.badge}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-[11px] italic">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              className="p-2 rounded-lg bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#23422a] transition"
                              title="Modificar Producto"
                            >
                              <Edit size={14} className="text-[#e0a96d]" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(prod.id)}
                              className="p-2 rounded-lg bg-[#1a1414] hover:bg-red-950 text-gray-400 hover:text-red-400 border border-red-900/50 transition"
                              title="Baja / Eliminar Producto"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECCIÓN 2: GESTIÓN DE PEDIDOS */}
      {/* ============================================================ */}
      {activeTab === 'pedidos' && (
        <div className="space-y-6">
          {/* Filtros de estado y buscador de pedidos */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e1c12] border border-[#1f3b25]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow max-w-3xl">
              {/* Buscador de Pedidos por #ID o Cliente */}
              <div className="relative flex-grow sm:max-w-xs">
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Buscar por Nº de pedido (#12)..."
                  className="w-full py-2.5 pl-9 pr-8 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs placeholder-gray-400 focus:outline-none focus:border-[#4aa036]"
                />
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                {orderSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setOrderSearchQuery('')}
                    className="absolute right-2.5 top-2.5 p-0.5 text-gray-400 hover:text-white rounded-full transition"
                    title="Limpiar búsqueda"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filtro de estado */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-400 font-bold uppercase mr-1 hidden sm:inline">Estado:</span>
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'pending', label: 'Pendientes' },
                  { id: 'confirmed', label: 'Confirmados' },
                  { id: 'delivered', label: 'Entregados' },
                  { id: 'cancelled', label: 'Cancelados' }
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setOrderStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                      orderStatusFilter === st.id
                        ? 'bg-[#2d5a27] text-white border-[#4aa036]'
                        : 'bg-[#142619] text-gray-300 border-[#23422a] hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={fetchOrders}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white text-xs font-bold border border-[#23422a] shrink-0 transition"
            >
              <RefreshCw size={13} />
              <span>Actualizar Pedidos</span>
            </button>
          </div>

          {/* Listado de Pedidos */}
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-[#0e1c12] border border-[#1f3b25] rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#18311d] flex items-center justify-center text-[#e0a96d] mx-auto">
                <ShoppingBag size={22} />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                {orderSearchQuery
                  ? `No se encontraron pedidos con "${orderSearchQuery}"`
                  : 'No hay pedidos en esta categoría'}
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                {orderSearchQuery
                  ? 'Verificá el número de pedido o limpiá el buscador para ver los demás pedidos.'
                  : 'Los nuevos pedidos realizados por los clientes aparecerán listados aquí en tiempo real.'}
              </p>
              {orderSearchQuery && (
                <button
                  type="button"
                  onClick={() => setOrderSearchQuery('')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#142619] border border-[#23422a] text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  <X size={13} />
                  <span>Restablecer búsqueda</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const itemsList = Array.isArray(order.items) ? order.items : [];
                const formattedDate = new Date(order.created_at || Date.now()).toLocaleString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={order.id} className="p-5 sm:p-6 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] shadow-lg space-y-4">
                    {/* Encabezado del Pedido */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1f3b25]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-white font-heading">Pedido #{order.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'confirmed' ? 'bg-blue-950/80 text-blue-300 border border-blue-500/50' :
                            order.status === 'delivered' ? 'bg-emerald-950/80 text-[#25d366] border border-[#25d366]/50' :
                            order.status === 'cancelled' ? 'bg-red-950/80 text-red-400 border border-red-500/50' :
                            'bg-amber-950/80 text-[#e0a96d] border border-[#e0a96d]/50'
                          }`}>
                            {order.status === 'pending' ? '⏳ Pendiente' :
                             order.status === 'confirmed' ? '📦 Confirmado' :
                             order.status === 'delivered' ? '✅ Entregado' : '❌ Cancelado'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 mt-0.5 block">Fecha: {formattedDate}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400 font-semibold">Cambiar Estado:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs font-bold focus:outline-none focus:border-[#4aa036]"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="delivered">Entregado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>

                        {order.whatsapp_phone && (
                          <a
                            href={`https://wa.me/${order.whatsapp_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hola ${order.customer_name}! Te contactamos de CultiShop con respecto a tu pedido #${order.id}. Estado actual: ${order.status}.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-xl bg-[#18311d] hover:bg-[#25d366] hover:text-black text-[#25d366] border border-[#25d366]/50 transition"
                            title="Chatear con el cliente"
                          >
                            <WhatsAppIcon size={16} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Datos del Cliente y Envío */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#122317] p-3.5 rounded-xl border border-[#23442a]">
                      <div>
                        <span className="text-gray-400 block font-semibold">Cliente:</span>
                        <span className="font-bold text-white">{order.customer_name}</span>
                        {order.customer_email && <span className="text-gray-400 block">{order.customer_email}</span>}
                      </div>
                      <div>
                        <span className="text-gray-400 block font-semibold">Contacto WhatsApp:</span>
                        <span className="text-white font-medium">{order.whatsapp_phone || order.phone || 'No especificado'}</span>
                        {order.payment_method && (
                          <span className="text-[11px] text-[#e0a96d] block font-semibold mt-1">
                            Pago: {order.payment_method === 'transferencia' ? '🏦 Transferencia / Alias' : order.payment_method === 'efectivo' ? '💵 Efectivo al retirar' : '💬 Acordar por WhatsApp'}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-400 block font-semibold">Dirección de Entrega:</span>
                        <span className="text-white font-medium">{order.shipping_address || 'Entrega a convenir en local de Posadas'}</span>
                        {order.notes && <span className="text-gray-400 block mt-1">Nota: {order.notes}</span>}
                      </div>
                    </div>

                    {/* Ítems del pedido */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Productos del Pedido:</span>
                      <div className="divide-y divide-[#1f3b25] bg-[#09150d] rounded-xl p-3 border border-[#1b3621]">
                        {itemsList.map((item, idx) => (
                          <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#e0a96d]">{item.quantity}x</span>
                              <span className="text-white">{item.title}</span>
                              {(item.selectedOption || item.option) && (
                                <span className="text-gray-400 text-[11px]">({item.selectedOption || item.option})</span>
                              )}
                            </div>
                            <span className="font-bold text-white">
                              {formatPrice(parseFloat(item.unitPrice || item.price || 0) * (item.quantity || 1))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total del Pedido */}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-gray-400 uppercase font-bold">Monto Total:</span>
                      <span className="text-lg font-black text-[#e0a96d] font-heading">
                        {formatPrice(parseFloat(order.total_amount) || 0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SECCIÓN 3: GESTIÓN DE BANNERS PUBLICITARIOS (HERO CAROUSEL) */}
      {/* ============================================================ */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          {/* Barra de Controles y Botón de Creación */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0e1c12] border border-[#1f3b25] p-5 rounded-2xl">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
                <Sliders className="text-[#e0a96d]" size={22} />
                <span>Gestión de Banners Publicitarios</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Configura las diapositivas horizontales del Slider / Hero Carousel de la portada principal de CultiShop.
              </p>
            </div>

            <button
              onClick={handleOpenCreateBannerModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shrink-0"
            >
              <Plus size={16} />
              <span>Alta de Banner</span>
            </button>
          </div>

          {/* Listado de Banners */}
          {loadingBanners ? (
            <div className="p-12 text-center bg-[#0e1c12] border border-[#1f3b25] rounded-2xl">
              <RefreshCw className="animate-spin text-[#e0a96d] mx-auto mb-3" size={28} />
              <p className="text-xs text-gray-400">Cargando banners publicitarios desde la base de datos...</p>
            </div>
          ) : safeBanners.length === 0 ? (
            <div className="p-12 text-center bg-[#0e1c12] border border-[#1f3b25] rounded-2xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#142619] border border-[#23422a] flex items-center justify-center text-[#e0a96d] mx-auto">
                <ImageIcon size={28} />
              </div>
              <h3 className="text-lg font-black text-white font-heading">No hay banners registrados</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Crea el primer banner publicitario para mostrar promociones, lanzamientos o información importante en el slider principal.
              </p>
              <button
                onClick={handleOpenCreateBannerModal}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold uppercase tracking-wider transition shadow-md"
              >
                <Plus size={15} />
                <span>Crear Primer Banner</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#0e1c12] border border-[#1f3b25] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#1f3b25] bg-[#07110a] text-gray-400 uppercase font-black tracking-wider text-[11px]">
                      <th className="py-4 px-4 text-center w-16">Orden</th>
                      <th className="py-4 px-4 w-44">Vista Previa</th>
                      <th className="py-4 px-4">Contenido (Título & Subtítulo)</th>
                      <th className="py-4 px-4">Enlace / Botón</th>
                      <th className="py-4 px-4 text-center w-28">Estado</th>
                      <th className="py-4 px-4 text-right w-36">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#182e1c]">
                    {safeBanners.map((banner) => (
                      <tr key={banner.id} className="hover:bg-[#142619]/60 transition">
                        {/* Orden */}
                        <td className="py-4 px-4 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-[#142619] border border-[#23422a] text-[#e0a96d] font-black text-xs">
                            #{banner.display_order ?? 0}
                          </span>
                        </td>

                        {/* Vista Previa Horizontal */}
                        <td className="py-4 px-4">
                          <div className="relative w-36 sm:w-44 h-16 sm:h-20 rounded-xl overflow-hidden border border-[#23422a] bg-[#0b1610] group shrink-0">
                            <img
                              src={banner.image_url}
                              alt={banner.title}
                              className="w-full h-full object-contain object-center transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=800';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-1">
                              <span className="text-[9px] text-gray-300 font-mono truncate px-1">
                                Horizontal
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Contenido (Título & Subtítulo) */}
                        <td className="py-4 px-4 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white font-heading leading-tight line-clamp-1">
                              {banner.title}
                            </span>
                            {banner.show_text === false ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-500/50">
                                🖼️ Imagen Limpia
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#18311d] text-[#4aa036] border border-[#2d5a27]">
                                📝 Con Textos
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                            {banner.subtitle || <span className="italic text-gray-500">Sin subtítulo</span>}
                          </div>
                        </td>

                        {/* Enlace y Botón */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#142619] border border-[#23422a] text-gray-200 font-bold text-[11px]">
                              <span>{banner.button_text || 'Ver Más'}</span>
                            </div>
                            {banner.link_url && (
                              <div className="flex items-center gap-1 text-[11px] text-[#e0a96d] truncate max-w-[200px]" title={banner.link_url}>
                                <LinkIcon size={12} className="shrink-0" />
                                <span className="truncate">{banner.link_url}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Estado (Activo / Inactivo) */}
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleToggleBanner(banner)}
                            title={banner.is_active ? 'Clic para desactivar' : 'Clic para activar'}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition ${
                              banner.is_active
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900'
                                : 'bg-gray-800/80 text-gray-400 border border-gray-600/50 hover:bg-gray-700'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${banner.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                            <span>{banner.is_active ? 'Activo' : 'Inactivo'}</span>
                          </button>
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleBanner(banner)}
                              className={`p-2 rounded-xl border transition ${
                                banner.is_active
                                  ? 'bg-[#142619] text-gray-300 hover:text-white border-[#23422a] hover:bg-[#1f3b25]'
                                  : 'bg-[#142619] text-[#e0a96d] border-[#23422a] hover:bg-[#1f3b25]'
                              }`}
                              title={banner.is_active ? 'Ocultar banner' : 'Mostrar banner'}
                            >
                              {banner.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                            </button>
                            <button
                              onClick={() => handleOpenEditBannerModal(banner)}
                              className="p-2 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-[#e0a96d] border border-[#23422a] transition"
                              title="Editar banner"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteBannerConfirmId(banner.id)}
                              className="p-2 rounded-xl bg-[#142619] hover:bg-red-950/50 text-gray-400 hover:text-red-400 border border-[#23422a] hover:border-red-900 transition"
                              title="Eliminar banner"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PARA ALTA / MODIFICACIÓN DE PRODUCTOS */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#0e1c12] border-2 border-[#2d5a27] rounded-3xl p-5 sm:p-7 shadow-2xl my-6 flex flex-col max-h-[92vh]">
            {/* Cabecera del Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-[#1f3b25] shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    modalMode === 'create' ? 'bg-[#2d5a27] text-white' : 'bg-[#e0a96d]/20 text-[#e0a96d] border border-[#e0a96d]/40'
                  }`}>
                    {modalMode === 'create' ? 'Nuevo Insumo' : 'Edición de Insumo'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                  {modalMode === 'create' ? 'Alta de Producto en Catálogo' : `Modificar: ${currentProduct?.title || 'Producto'}`}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Gestiona las categorías, subcategorías y los contenidos de cada pestaña informativa del producto.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#1a3321] transition shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Formulario scrolleable */}
            <form onSubmit={handleSaveProductSubmit} className="flex flex-col overflow-hidden pt-4 flex-grow">
              <div className="overflow-y-auto pr-1 sm:pr-2 space-y-4 flex-grow custom-scrollbar">
                {/* 1. SECCIÓN BÁSICA */}
                <div className="space-y-3.5">
                  {/* Título */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Título del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ej: Oro Negro Namasté Nutrientes"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] transition"
                    />
                  </div>

                  {/* Categoría y Subcategoría Dinámica */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Categoría Principal *
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] transition cursor-pointer"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id || cat.slug || cat.name} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
                        <span>Subcategoría</span>
                        <span className="text-[10px] text-gray-400 font-normal">
                          {activeSubcategories.length > 0 
                            ? `${activeSubcategories.length} opción(es)` 
                            : 'Sin subcategorías'}
                        </span>
                      </label>
                      <select
                        value={formSubcategory}
                        onChange={(e) => setFormSubcategory(e.target.value)}
                        disabled={activeSubcategories.length === 0}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition cursor-pointer ${
                          activeSubcategories.length === 0
                            ? 'bg-[#0a140d] border-[#1b3420] text-gray-500 cursor-not-allowed'
                            : 'bg-[#142619] border-[#23422a] text-white focus:border-[#4aa036]'
                        }`}
                      >
                        <option value="">(Sin subcategoría / General)</option>
                        {activeSubcategories.map((sub) => (
                          <option key={sub.id || sub.slug || sub.name} value={sub.name}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Precio y Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Precio Base / Referencia ($ ARS) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        placeholder="14500"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] transition"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        Si defines medidas abajo, el precio base tomará automáticamente la opción más económica.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
                        <span>Stock Disponible</span>
                        {parseInt(formStock, 10) <= 0 && (
                          <span className="text-[10px] text-red-400 font-bold">⚠️ Asignará "Sin Stock"</span>
                        )}
                      </label>
                      <input
                        type="number"
                        value={formStock}
                        onChange={(e) => handleStockChange(e.target.value)}
                        placeholder="25"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition ${
                          parseInt(formStock, 10) <= 0
                            ? 'bg-red-950/30 border-red-500/80 text-red-200'
                            : 'bg-[#142619] border-[#23422a] text-white focus:border-[#4aa036]'
                        }`}
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        Al ingresar 0, el sistema asignará automáticamente "SIN STOCK" y deshabilitará la compra.
                      </span>
                    </div>
                  </div>

                  {/* Etiqueta Promocional (Badge) y Tipo */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Etiqueta Promocional (Badge)
                      </label>
                      <input
                        type="text"
                        value={formBadge}
                        onChange={(e) => setFormBadge(e.target.value)}
                        placeholder="Ej: STOCK DISPONIBLE, TOP VENTAS, LEY 27.350, SIN STOCK"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition ${
                          formBadge.toUpperCase() === 'SIN STOCK'
                            ? 'bg-red-950/30 border-red-500/80 text-red-200 font-bold'
                            : 'bg-[#142619] border-[#23422a] text-white focus:border-[#4aa036]'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Color Etiqueta
                      </label>
                      <select
                        value={formBadgeType}
                        onChange={(e) => setFormBadgeType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] transition cursor-pointer"
                      >
                        <option value="gold">Dorado Mostaza</option>
                        <option value="green">Verde Hoja</option>
                        <option value="red">Rojo (Sin Stock / Alerta)</option>
                      </select>
                    </div>
                  </div>

                  {/* Gestor de Medidas y Precios Independientes */}
                  <div className="p-3.5 rounded-2xl bg-[#0a140d] border border-[#1f3b25] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-xs font-bold text-white uppercase tracking-wider">
                          Medidas y Precios Independientes
                        </label>
                        <p className="text-[10px] text-gray-400">
                          Configurá cada presentación (ej: 100ml, 500ml, 2 Litros) con su propio precio de venta específico.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#183520] hover:bg-[#234b2d] text-[#e0a96d] text-xs font-bold border border-[#2d5a27] transition cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>Agregar Medida</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formVariants.map((variant, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-[#122317] p-2 rounded-xl border border-[#1f3b25]">
                          <div className="flex-1">
                            <input
                              type="text"
                              required
                              value={variant.name}
                              onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                              placeholder="Medida / Presentación (ej: 100 ml, 500 ml)"
                              className="w-full px-3 py-2 rounded-lg bg-[#0a140d] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                            />
                          </div>
                          <div className="w-36">
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-xs text-gray-400 font-bold">$</span>
                              <input
                                type="number"
                                step="0.01"
                                required
                                value={variant.price}
                                onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                                placeholder="Precio"
                                className="w-full pl-6 pr-2.5 py-2 rounded-lg bg-[#0a140d] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={formVariants.length <= 1}
                            onClick={() => handleRemoveVariant(idx)}
                            title={formVariants.length <= 1 ? "Mínimo 1 opción requerida" : "Eliminar esta presentación"}
                            className="p-2 rounded-lg bg-[#1a1414] hover:bg-red-950 text-gray-400 hover:text-red-400 border border-red-900/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selector de Archivo Local para Imagen del Producto */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                        Imagen del Producto *
                      </label>
                      <span className="text-[10px] text-[#e0a96d] font-semibold">
                        Archivo local (.jpg, .png, .webp)
                      </span>
                    </div>

                    {/* Input tipo file oculto accionado por el botón o zona de carga */}
                    <input
                      ref={productFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageFileChange(file, setFormImageUrl, setProductImageFileName);
                        }
                      }}
                    />

                    {!formImageUrl ? (
                      <div
                        onClick={() => productFileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#2d5a27] hover:border-[#4aa036] rounded-2xl p-6 bg-[#0a140d] hover:bg-[#122317] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group shadow-inner"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#183520] group-hover:bg-[#234b2d] text-[#e0a96d] flex items-center justify-center transition shadow-md">
                          <Upload size={22} />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block">
                            Elegir Imagen desde tu Equipo
                          </span>
                          <span className="text-[11px] text-gray-400 block">
                            Haz clic aquí para abrir tu explorador de archivos
                          </span>
                        </div>
                        <span className="px-3.5 py-1 rounded-full bg-[#1e3c25] text-[#e0a96d] text-[10px] font-bold uppercase tracking-wider">
                          Examinar Archivos
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#0a140d] rounded-2xl border border-[#2d5a27] space-y-3 shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#2d5a27] bg-black/60 shrink-0 shadow-inner">
                            <img
                              src={formImageUrl}
                              alt="Previsualización"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&q=80&w=600';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-0.5">
                              <CheckCircle2 size={14} className="text-[#25d366]" />
                              <span>Imagen cargada correctamente</span>
                            </div>
                            <p className="text-[11px] text-gray-400 truncate">
                              {productImageFileName || 'Imagen de producto'}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => productFileInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-lg bg-[#183520] hover:bg-[#234b2d] text-[#e0a96d] text-xs font-bold border border-[#2d5a27] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <Upload size={13} />
                                <span>Cambiar archivo</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormImageUrl('');
                                  setProductImageFileName('');
                                  if (productFileInputRef.current) productFileInputRef.current.value = '';
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold border border-red-900/40 transition flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={13} />
                                <span>Quitar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. SECCIÓN GESTIÓN DE PESTAÑAS DETALLADAS (TABS) */}
                <div className="pt-3 border-t border-[#1f3b25] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#e0a96d]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                        Pestañas de Información Detallada del Producto
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#e0a96d] font-semibold hidden sm:inline">
                      Visibles en la ficha técnica del producto
                    </span>
                  </div>

                  {/* Barra de pestañas del modal */}
                  <div className="flex rounded-xl bg-[#0a140d] p-1 border border-[#1b3420] overflow-x-auto gap-1">
                    {[
                      { id: 'desc', label: '1. Descripción & Ventajas', icon: FileText },
                      { id: 'ficha', label: '2. Ficha Técnica', icon: Layers },
                      { id: 'uso', label: '3. Modo de Uso', icon: Droplets },
                      { id: 'envios', label: '4. Envíos y Retiro', icon: Truck },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setModalDetailTab(tab.id)}
                          className={`flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                            modalDetailTab === tab.id
                              ? 'bg-[#183520] text-[#e0a96d] shadow-sm border border-[#2d5a27]'
                              : 'text-gray-400 hover:text-white hover:bg-[#122317]'
                          }`}
                        >
                          <Icon size={14} className={modalDetailTab === tab.id ? 'text-[#e0a96d]' : 'text-gray-400'} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* TAB 1: DESCRIPCIÓN & VENTAJAS */}
                  {modalDetailTab === 'desc' && (
                    <div className="space-y-3.5 p-4 rounded-2xl bg-[#0a140d] border border-[#1a3520]">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Descripción Principal del Producto *
                        </label>
                        <textarea
                          rows="3"
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          placeholder="Descripción completa del insumo, composición orgánica y beneficios generales..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] resize-none leading-relaxed"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-gray-300">
                            Ventajas Destacadas para el Cultivo (Viñetas con tilde verde)
                          </label>
                          <span className="text-[10px] text-[#e0a96d]">1 ventaja por renglón</span>
                        </div>
                        <textarea
                          rows="4"
                          value={formKeyBenefits}
                          onChange={(e) => setFormKeyBenefits(e.target.value)}
                          placeholder="Multiplica la superficie de contacto de las raíces con el medio hasta un 400%&#10;Facilita la solubilización biológica del Fósforo, nutriente clave para floración pesada&#10;Aumenta drásticamente la resistencia de las plantas a la sequía y calor"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] resize-none font-mono text-[11px] leading-relaxed"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          Cada renglón que ingreses se convertirá automáticamente en una tarjeta con tilde verde (✓) en la pestaña "Descripción Completa".
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#1b3420]">
                        <span className="text-[11px] font-bold text-[#e0a96d] uppercase tracking-wider block mb-2">
                          Compatibilidad Cannábica & Comportamiento en Cultivo (Opcional)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">Compatibilidad Genotípica</label>
                            <input
                              type="text"
                              value={formCannabisGenotype}
                              onChange={(e) => setFormCannabisGenotype(e.target.value)}
                              placeholder="Ej: Apto para Índicas, Sativas, Híbridas y Autoflorecientes."
                              className="w-full px-3 py-2 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">Etapa de Cultivo</label>
                            <input
                              type="text"
                              value={formCannabisStage}
                              onChange={(e) => setFormCannabisStage(e.target.value)}
                              placeholder="Ej: Vegetativo, Enraizamiento, Floración"
                              className="w-full px-3 py-2 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">Entorno Recomendado</label>
                            <input
                              type="text"
                              value={formCannabisEnv}
                              onChange={(e) => setFormCannabisEnv(e.target.value)}
                              placeholder="Ej: Optimizado para carpas indoor, invernaderos y exterior."
                              className="w-full px-3 py-2 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-400 mb-1">Grado de Calidad</label>
                            <input
                              type="text"
                              value={formCannabisQuality}
                              onChange={(e) => setFormCannabisQuality(e.target.value)}
                              placeholder="Ej: Grado Agrícola Profesional para Cultivo Medicinal"
                              className="w-full px-3 py-2 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: FICHA TÉCNICA */}
                  {modalDetailTab === 'ficha' && (
                    <div className="space-y-3 p-4 rounded-2xl bg-[#0a140d] border border-[#1a3520]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-gray-300 font-semibold mb-1">Marca / Fabricante</label>
                          <input
                            type="text"
                            value={formBrand}
                            onChange={(e) => setFormBrand(e.target.value)}
                            placeholder="Ej: Namasté Nutrientes, Mamboretá"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 font-semibold mb-1">País de Origen</label>
                          <input
                            type="text"
                            value={formOrigin}
                            onChange={(e) => setFormOrigin(e.target.value)}
                            placeholder="Ej: Argentina"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 font-semibold mb-1">Presentación / Formato Técnico</label>
                          <input
                            type="text"
                            value={formFormat}
                            onChange={(e) => setFormFormat(e.target.value)}
                            placeholder="Ej: Líquido concentrado soluble, Polvo soluble"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 font-semibold mb-1">Etapa Recomendada</label>
                          <input
                            type="text"
                            value={formCultivationStage}
                            onChange={(e) => setFormCultivationStage(e.target.value)}
                            placeholder="Ej: Fase Vegetativa & Enraizamiento"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 font-semibold mb-1">Rango de pH Sugerido</label>
                          <input
                            type="text"
                            value={formPhRecommended}
                            onChange={(e) => setFormPhRecommended(e.target.value)}
                            placeholder="Ej: 5.8 - 6.5"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 font-semibold mb-1">Conductividad (EC Sugerida)</label>
                          <input
                            type="text"
                            value={formEcRecommended}
                            onChange={(e) => setFormEcRecommended(e.target.value)}
                            placeholder="Ej: 1.2 - 1.6 mS/cm"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Medios de Cultivo Aptos
                        </label>
                        <input
                          type="text"
                          value={formSuitableFor}
                          onChange={(e) => setFormSuitableFor(e.target.value)}
                          placeholder="Ej: Indoor, Exterior, Sustratos orgánicos, Fibra de coco e Hidroponia."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 3: MODO DE USO Y APLICACIÓN */}
                  {modalDetailTab === 'uso' && (
                    <div className="space-y-3 p-4 rounded-2xl bg-[#0a140d] border border-[#1a3520]">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Dosis Referencial Recomendada
                        </label>
                        <input
                          type="text"
                          value={formDosage}
                          onChange={(e) => setFormDosage(e.target.value)}
                          placeholder="Ej: 2 a 4 ml por litro de agua sin cloro, cada 7 a 10 días."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-gray-300">
                            Paso a Paso de Aplicación y Dosificación
                          </label>
                          <span className="text-[10px] text-[#e0a96d]">1 paso por renglón</span>
                        </div>
                        <textarea
                          rows="4"
                          value={formApplicationGuide}
                          onChange={(e) => setFormApplicationGuide(e.target.value)}
                          placeholder="Agitar enérgicamente el envase antes de dosificar.&#10;Diluir en agua reposada o desclorada a temperatura ambiente (18°C - 22°C).&#10;Aplicar principalmente en el riego habitual al pie del tallo.&#10;Suspender al inicio de la 3ra semana de floración."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] resize-none font-mono text-[11px] leading-relaxed"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          Cada renglón se presentará como un paso numerado interactivo (1, 2, 3...) en la pestaña "Modo de Uso y Aplicación".
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ENVÍOS Y RETIRO */}
                  {modalDetailTab === 'envios' && (
                    <div className="space-y-3 p-4 rounded-2xl bg-[#0a140d] border border-[#1a3520]">
                      <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1">
                          Condiciones Específicas de Envío / Retiro de este Insumo
                        </label>
                        <textarea
                          rows="4"
                          value={formShippingInfo}
                          onChange={(e) => setFormShippingInfo(e.target.value)}
                          placeholder="Ej: Insumo frágil despachado con embalaje térmico y cámara de aire. Disponible para retiro inmediato sin costo en nuestro local de Av. López y Planes 2919 (Posadas, Misiones)."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] resize-none leading-relaxed"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          Se exhibirá de manera destacada en la pestaña "Envíos y Retiro" para comunicar condiciones particulares de empaque, almacenamiento o logística.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones fijos al pie del Modal */}
              <div className="pt-4 mt-3 flex items-center justify-end gap-3 border-t border-[#1f3b25] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-6 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold uppercase tracking-wider transition shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingProduct ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{modalMode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR (BAJA) */}
      {/* ============================================================ */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e1c12] border-2 border-red-600/50 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-black text-white font-heading">¿Dar de baja este producto?</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Esta acción eliminará el producto del catálogo de CultiShop. Los usuarios ya no podrán verlo ni agregarlo al carrito.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-md"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PARA ALTA / MODIFICACIÓN DE BANNERS */}
      {/* ============================================================ */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0e1c12] border-2 border-[#2d5a27] rounded-3xl p-5 sm:p-7 shadow-2xl my-6 flex flex-col max-h-[92vh]">
            {/* Cabecera del Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-[#1f3b25] shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    bannerModalMode === 'create' ? 'bg-[#2d5a27] text-white' : 'bg-[#e0a96d]/20 text-[#e0a96d] border border-[#e0a96d]/40'
                  }`}>
                    {bannerModalMode === 'create' ? 'Nuevo Banner' : 'Edición de Banner'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                  {bannerModalMode === 'create' ? 'Alta de Banner Publicitario' : `Modificar: ${currentBanner?.title || 'Banner'}`}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Gestiona las imágenes panorámicas y los mensajes del carrusel principal de la portada.
                </p>
              </div>

              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="p-2 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido / Formulario */}
            <form onSubmit={handleSaveBannerSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
              {/* Selector de Archivo Local para Banner Horizontal */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Imagen Horizontal del Banner *
                  </label>
                  <span className="text-[10px] text-[#e0a96d] font-bold">
                    Recomendado: 1920x600 o proporción panorámica
                  </span>
                </div>

                {/* Input tipo file oculto */}
                <input
                  ref={bannerFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageFileChange(file, setBannerFormImageUrl, setBannerImageFileName);
                    }
                  }}
                />

                {!bannerFormImageUrl ? (
                  <div
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#2d5a27] hover:border-[#4aa036] rounded-2xl p-6 bg-[#0a140d] hover:bg-[#122317] transition cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group shadow-inner"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#183520] group-hover:bg-[#234b2d] text-[#e0a96d] flex items-center justify-center transition shadow-md">
                      <Upload size={22} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block">
                        Elegir Imagen Panorámica desde tu Equipo
                      </span>
                      <span className="text-[11px] text-gray-400 block">
                        Haz clic aquí para abrir tu explorador de archivos local
                      </span>
                    </div>
                    <span className="px-3.5 py-1 rounded-full bg-[#1e3c25] text-[#e0a96d] text-[10px] font-bold uppercase tracking-wider">
                      Examinar Archivos
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Vista previa panorámica con simulación de portada */}
                    <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-[#2d5a27] bg-[#0b1610] shadow-inner group">
                      <img
                        src={bannerFormImageUrl}
                        alt="Vista previa banner"
                        className="w-full h-full object-contain object-center"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=1200';
                        }}
                      />
                      {bannerFormShowText ? (
                        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent flex flex-col justify-end p-4">
                          <span className="text-[10px] text-[#e0a96d] font-bold uppercase tracking-wider">
                            {bannerFormButtonText || 'Ver Más'}
                          </span>
                          <h4 className="text-sm sm:text-base font-black text-white font-heading truncate">
                            {bannerFormTitle || 'Título del Banner'}
                          </h4>
                          <p className="text-[11px] text-gray-300 line-clamp-1">
                            {bannerFormSubtitle || 'Subtítulo o descripción breve'}
                          </p>
                        </div>
                      ) : (
                        <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-lg bg-black/80 border border-[#2d5a27] text-[10px] font-bold text-gray-200 backdrop-blur-md shadow-md flex items-center gap-1.5">
                          <span>🖼️ Modo Limpio: Solo Imagen</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-[#0a140d] rounded-xl border border-[#1f3b25] text-xs">
                      <div className="flex items-center gap-2 text-gray-300 truncate mr-2">
                        <CheckCircle2 size={14} className="text-[#25d366] shrink-0" />
                        <span className="truncate text-[11px]">{bannerImageFileName || 'Imagen panorámica cargada'}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => bannerFileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-[#183520] hover:bg-[#234b2d] text-[#e0a96d] text-xs font-bold border border-[#2d5a27] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Upload size={13} />
                          <span>Cambiar imagen</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBannerFormImageUrl('');
                            setBannerImageFileName('');
                            if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold border border-red-900/40 transition flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Quitar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Interruptor para Mostrar u Ocultar Textos Superpuestos */}
              <div className="p-3.5 rounded-2xl bg-[#0a140d] border border-[#1f3b25] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white block">
                    Mostrar textos y botones superpuestos sobre la imagen
                  </span>
                  <p className="text-[11px] text-gray-400">
                    Desactiva esta opción si tu imagen ya incluye diseño gráfico o deseas exhibir el banner 100% limpio en la tienda.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={bannerFormShowText}
                    onChange={(e) => setBannerFormShowText(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d5a27]"></div>
                </label>
              </div>

              {bannerFormShowText ? (
                <>
                  {/* Título Principal */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Título Principal del Banner *
                    </label>
                    <input
                      type="text"
                      required
                      value={bannerFormTitle}
                      onChange={(e) => setBannerFormTitle(e.target.value)}
                      placeholder="Ej: EXPLOSIÓN DE RESINA, FLORES Y RAÍCES FUERTES"
                      className="w-full bg-[#07110a] border border-[#23422a] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#4aa036]"
                    />
                  </div>

                  {/* Subtítulo / Bajada Descriptiva */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Subtítulo / Bajada Descriptiva
                    </label>
                    <textarea
                      rows={2}
                      value={bannerFormSubtitle}
                      onChange={(e) => setBannerFormSubtitle(e.target.value)}
                      placeholder="Ej: Línea completa Namasté Nutrientes: Oro Negro, Amazonia Micorrizas y más..."
                      className="w-full bg-[#07110a] border border-[#23422a] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#4aa036] resize-none"
                    />
                  </div>

                  {/* Enlace de Destino y Texto del Botón */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                        Enlace de Destino (Ruta o URL)
                      </label>
                      <input
                        type="text"
                        value={bannerFormLinkUrl}
                        onChange={(e) => setBannerFormLinkUrl(e.target.value)}
                        placeholder="Ej: /categoria/fertilizantes o https://..."
                        className="w-full bg-[#07110a] border border-[#23422a] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#4aa036]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                        Texto del Botón CTA
                      </label>
                      <input
                        type="text"
                        value={bannerFormButtonText}
                        onChange={(e) => setBannerFormButtonText(e.target.value)}
                        placeholder="Ej: Ver Fertilizantes, Explorar Indoor"
                        className="w-full bg-[#07110a] border border-[#23422a] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#4aa036]"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3 p-3.5 rounded-2xl bg-[#0a140d] border border-[#1f3b25]">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Título de Referencia Interna (Opcional)
                    </label>
                    <input
                      type="text"
                      value={bannerFormTitle}
                      onChange={(e) => setBannerFormTitle(e.target.value)}
                      placeholder="Ej: Banner Promocional Imagen Panorámica (Solo visible en administración)"
                      className="w-full bg-[#07110a] border border-[#23422a] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#4aa036]"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      No se mostrará ningún texto sobre la imagen en la tienda; este título es únicamente para tu control interno.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Enlace de Destino al hacer clic en el Banner (Opcional)
                    </label>
                    <input
                      type="text"
                      value={bannerFormLinkUrl}
                      onChange={(e) => setBannerFormLinkUrl(e.target.value)}
                      placeholder="Ej: /categoria/fertilizantes o https://..."
                      className="w-full bg-[#07110a] border border-[#23422a] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#4aa036]"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Al hacer clic en cualquier parte de la imagen, el cliente será dirigido a esta ruta o dirección web.
                    </p>
                  </div>
                </div>
              )}

              {/* Orden y Visibilidad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={bannerFormOrder}
                    onChange={(e) => setBannerFormOrder(e.target.value)}
                    className="w-full bg-[#07110a] border border-[#23422a] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#4aa036]"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">Número menor se muestra primero en el carrusel</span>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                    Visibilidad en Portada
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-2.5 bg-[#07110a] border border-[#23422a] rounded-xl hover:border-[#4aa036] transition">
                    <input
                      type="checkbox"
                      checked={bannerFormIsActive}
                      onChange={(e) => setBannerFormIsActive(e.target.checked)}
                      className="w-4 h-4 accent-[#2d5a27] rounded"
                    />
                    <span className="text-xs text-gray-200 font-bold">
                      Banner Activo en la Portada
                    </span>
                  </label>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1f3b25]">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingBanner}
                  className="px-6 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center gap-2"
                >
                  {isSavingBanner ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{bannerModalMode === 'create' ? 'Crear Banner' : 'Guardar Cambios'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR BANNER */}
      {/* ============================================================ */}
      {deleteBannerConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e1c12] border-2 border-red-600/50 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-black text-white font-heading">¿Eliminar este banner publicitario?</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Esta acción eliminará permanentemente la diapositiva del carrusel de inicio.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteBannerConfirmId(null)}
                className="px-5 py-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteBanner(deleteBannerConfirmId)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-md"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
