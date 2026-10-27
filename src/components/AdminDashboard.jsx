import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Upload,
  CreditCard,
  Copy,
  Check,
  Save,
  Landmark,
  FolderTree,
  Tag,
  ChevronDown,
  ChevronUp,
  Hash,
  BookOpen,
  Video,
  Instagram,
  Play,
  HelpCircle,
  MapPin,
  PhoneCall
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api';
import { formatPrice, parsePrice, useShop, getProductOptions } from '../context/ShopContext';
import { PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';
import { getProductDetails } from '../data/productDetailsData';
import { WhatsAppIcon } from './WhatsAppIcon';
import { CultiShopLogo } from './CultiShopLogo';
import { BannerCropperModal } from './BannerCropperModal';

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
    fetchCategories,
    paymentSettings,
    updatePaymentSettings,
    locationSettings,
    updateLocationSettings
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
  const [formCategory, setFormCategory] = useState('Fertilizantes');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formBadge, setFormBadge] = useState('STOCK DISPONIBLE');
  const [formBadgeType, setFormBadgeType] = useState('gold');
  const [formVariants, setFormVariants] = useState([
    { name: '100 cc', price: '6000', stock: '10' },
    { name: '250 cc', price: '14500', stock: '10' },
    { name: '500 cc', price: '28000', stock: '10' }
  ]);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Cálculo en vivo de precio y stock total a partir de las variantes
  const computedVariantSummary = useMemo(() => {
    const valid = formVariants.filter((v) => v.name && v.name.trim().length > 0);
    const prices = valid
      .map((v) => parseFloat(String(v.price).replace(/[^0-9.-]/g, '')))
      .filter((p) => !isNaN(p) && p >= 0);
    const totalStock = valid.reduce((acc, v) => acc + (parseInt(String(v.stock), 10) || 0), 0);

    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    let priceText = '$0,00';
    if (prices.length > 0) {
      if (minPrice === maxPrice) {
        priceText = formatPrice(minPrice);
      } else {
        priceText = `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;
      }
    }

    return {
      minPrice,
      maxPrice,
      priceText,
      totalStock,
      hasVariants: valid.length > 0
    };
  }, [formVariants]);

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

  // Estados para editor interactivo de zoom y encuadre de banners
  const [isBannerCropperOpen, setIsBannerCropperOpen] = useState(false);
  const [rawBannerSourceImage, setRawBannerSourceImage] = useState('');

  // Referencias a inputs de archivos locales e información de archivo
  const productFileInputRef = useRef(null);
  const bannerFileInputRef = useRef(null);
  const [productImageFileName, setProductImageFileName] = useState('');
  const [bannerImageFileName, setBannerImageFileName] = useState('');

  // Estados para Configuración de Datos de Pago / Alias Bancario
  const [bankAlias, setBankAlias] = useState('');
  const [bankCbu, setBankCbu] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [copiedPreviewAlias, setCopiedPreviewAlias] = useState(false);

  // Estados para Configuración de Local Físico & Google Maps
  const [locAddress, setLocAddress] = useState('');
  const [locHours, setLocHours] = useState('');
  const [locPhone, setLocPhone] = useState('');
  const [locGoogleMapsUrl, setLocGoogleMapsUrl] = useState('');
  const [locEmbedUrl, setLocEmbedUrl] = useState('');
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [extractedIframeNotice, setExtractedIframeNotice] = useState(false);

  // Estados para Gestión de Categorías y Subcategorías
  const [adminCategories, setAdminCategories] = useState([]);
  const [loadingAdminCategories, setLoadingAdminCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});

  // Formulario de Crear / Editar Categoría o Subcategoría
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = crear, objeto = editar
  const [categoryFormParentId, setCategoryFormParentId] = useState(''); // '' para categoría principal, o ID numérico para subcategoría
  const [categoryFormName, setCategoryFormName] = useState('');
  const [categoryFormSlug, setCategoryFormSlug] = useState('');
  const [categoryFormDescription, setCategoryFormDescription] = useState('');
  const [categoryFormOrder, setCategoryFormOrder] = useState('1');
  const [categoryFormIsVisible, setCategoryFormIsVisible] = useState(true);
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Modal de Confirmación de Eliminación de Categoría
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  // Sub-pestaña activa en sección Institucional & Instagram ('sobre-nosotros' | 'instagram')
  const [subTabInstitucional, setSubTabInstitucional] = useState('sobre-nosotros');

  // Estados para Bloques Institucionales "Sobre Nosotros" (about_sections)
  const [aboutSections, setAboutSections] = useState([]);
  const [loadingAboutSections, setLoadingAboutSections] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [aboutModalMode, setAboutModalMode] = useState('create'); // 'create' | 'edit'
  const [currentAboutSection, setCurrentAboutSection] = useState(null);
  const [deleteAboutConfirmId, setDeleteAboutConfirmId] = useState(null);
  const [isSavingAbout, setIsSavingAbout] = useState(false);

  // Formulario de Bloque "Sobre Nosotros"
  const [aboutFormTitle, setAboutFormTitle] = useState('');
  const [aboutFormSubtitle, setAboutFormSubtitle] = useState('');
  const [aboutFormContent, setAboutFormContent] = useState('');
  const [aboutFormImageUrl, setAboutFormImageUrl] = useState('');
  const [aboutFormOrder, setAboutFormOrder] = useState('1');
  const [aboutFormIsActive, setAboutFormIsActive] = useState(true);
  const [aboutImageFileName, setAboutImageFileName] = useState('');
  const aboutFileInputRef = useRef(null);

  // Estados para Videos y Publicaciones de Instagram (instagram_videos)
  const [instagramVideos, setInstagramVideos] = useState([]);
  const [loadingInstagramVideos, setLoadingInstagramVideos] = useState(false);
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);
  const [instagramModalMode, setInstagramModalMode] = useState('create'); // 'create' | 'edit'
  const [currentInstagramVideo, setCurrentInstagramVideo] = useState(null);
  const [deleteInstagramConfirmId, setDeleteInstagramConfirmId] = useState(null);
  const [isSavingInstagram, setIsSavingInstagram] = useState(false);

  // Formulario de Video de Instagram
  const [instagramFormTitle, setInstagramFormTitle] = useState('');
  const [instagramFormPostUrl, setInstagramFormPostUrl] = useState('');
  const [instagramFormThumbnailUrl, setInstagramFormThumbnailUrl] = useState('');
  const [instagramFormOrder, setInstagramFormOrder] = useState('1');
  const [instagramFormIsActive, setInstagramFormIsActive] = useState(true);
    const [instagramThumbnailFileName, setInstagramThumbnailFileName] = useState('');
  const instagramFileInputRef = useRef(null);

  // Estados para Preguntas Frecuentes (faqs)
  const [faqs, setFaqs] = useState([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqModalMode, setFaqModalMode] = useState('create'); // 'create' | 'edit'
  const [currentFaq, setCurrentFaq] = useState(null);
  const [deleteFaqConfirmId, setDeleteFaqConfirmId] = useState(null);
  const [isSavingFaq, setIsSavingFaq] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('all');

  // Formulario de Pregunta Frecuente
  const [faqFormQuestion, setFaqFormQuestion] = useState('');
  const [faqFormAnswer, setFaqFormAnswer] = useState('');
  const [faqFormCategory, setFaqFormCategory] = useState('Compras & Pagos');
  const [faqFormOrder, setFaqFormOrder] = useState('1');
  const [faqFormIsActive, setFaqFormIsActive] = useState(true);

  useEffect(() => {
    if (paymentSettings) {
      setBankAlias(paymentSettings.bank_alias || 'CULTISHOP.POSADAS');
      setBankCbu(paymentSettings.bank_cbu || '');
      setBankName(paymentSettings.bank_name || 'Mercado Pago / Billeteras Virtuales');
      setAccountHolder(paymentSettings.account_holder || 'CultiShop Posadas');
      setPaymentNotes(paymentSettings.payment_notes || 'Al confirmar el pedido podrás enviar el comprobante de transferencia directamente por WhatsApp.');
    }
  }, [paymentSettings]);

  useEffect(() => {
    if (locationSettings) {
      setLocAddress(locationSettings.address || 'Av. López y Planes casi Lavalle ("adentro del ACUARIUM"), Posadas, Misiones, Argentina');
      setLocHours(locationSettings.hours || 'Lunes a Sábados de 9:00 a 13:00 y de 16:30 a 20:30 hs');
      setLocPhone(locationSettings.phone || '+54 9 376 435-6995');
      setLocGoogleMapsUrl(locationSettings.google_maps_url || 'https://maps.google.com/?q=Av.+L%C3%B3pez+y+Planes+y+Lavalle,+Posadas,+Misiones,+Argentina');
      setLocEmbedUrl(locationSettings.google_maps_embed_url || 'https://maps.google.com/maps?q=Av.+L%C3%B3pez+y+Planes+y+Lavalle,+Posadas,+Misiones,+Argentina&t=&z=16&ie=UTF8&iwloc=&output=embed');
    }
  }, [locationSettings]);

  // Colecciones seguras para evitar errores de renderizado si están cargando o vacías
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeAdminCategories = Array.isArray(adminCategories) ? adminCategories : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeBanners = Array.isArray(banners) ? banners : [];
  const safeAboutSections = Array.isArray(aboutSections) ? aboutSections : [];
    const safeInstagramVideos = Array.isArray(instagramVideos) ? instagramVideos : [];
  const safeFaqs = Array.isArray(faqs) ? faqs : [];

  const filteredAdminFaqs = useMemo(() => {
    return safeFaqs.filter((item) => {
      const matchesCategory =
        faqCategoryFilter === 'all' ||
        (item.category && item.category.trim().toLowerCase() === faqCategoryFilter.toLowerCase());
      const query = faqSearch.trim().toLowerCase();
      if (!query) return matchesCategory;
      const qMatch = item.question && item.question.toLowerCase().includes(query);
      const aMatch = item.answer && item.answer.toLowerCase().includes(query);
      const cMatch = item.category && item.category.toLowerCase().includes(query);
      return matchesCategory && (qMatch || aMatch || cMatch);
    });
  }, [safeFaqs, faqCategoryFilter, faqSearch]);

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

  // Manejo de filas de variantes con precio y stock independiente
  const handleAddVariant = () => {
    setFormVariants((prev) => {
      const lastPrice = prev.length > 0 ? prev[prev.length - 1].price : '';
      return [
        ...prev,
        { name: '', price: lastPrice || '', stock: '10' }
      ];
    });
  };

  const handleRemoveVariant = (index) => {
    if (formVariants.length <= 1) return;
    setFormVariants((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      const total = updated.reduce((acc, curr) => acc + (parseInt(curr.stock, 10) || 0), 0);
      if (total <= 0) {
        setFormBadge('SIN STOCK');
        setFormBadgeType('red');
      } else if (formBadge === 'SIN STOCK') {
        setFormBadge('STOCK DISPONIBLE');
        setFormBadgeType('gold');
      }
      return updated;
    });
  };

  const handleVariantChange = (index, field, value) => {
    setFormVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'stock') {
        const total = updated.reduce((acc, curr) => acc + (parseInt(curr.stock, 10) || 0), 0);
        if (total <= 0) {
          setFormBadge('SIN STOCK');
          setFormBadgeType('red');
        } else if (formBadge === 'SIN STOCK') {
          setFormBadge('STOCK DISPONIBLE');
          setFormBadgeType('gold');
        }
      }
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

  // Helper para convertir texto a slug amigable
  const clientSlugify = (text) => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Cargar categorías completas para el panel de administración
  const fetchAdminCategories = async () => {
    setLoadingAdminCategories(true);
    try {
      const res = await fetch(buildApiUrl('categories?all=true'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories)) {
          setAdminCategories(data.categories);
          // Expandir categorías principales con subcategorías por defecto
          const initialExpanded = {};
          data.categories.forEach((c) => {
            if (c.subcategories && c.subcategories.length > 0) {
              initialExpanded[c.id] = true;
            }
          });
          setExpandedCategories((prev) => ({ ...initialExpanded, ...prev }));
        }
      }
    } catch (err) {
      console.error('Error al cargar categorías en administración:', err);
    } finally {
      setLoadingAdminCategories(false);
    }
  };

  // Cargar bloques de Sobre Nosotros para administración
  const fetchAboutSectionsAdmin = async () => {
    setLoadingAboutSections(true);
    try {
      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res = await fetch(buildApiUrl('about?all=true'), { headers });
      if (!res.ok) {
        res = await fetch(buildApiUrl('about/admin/all'), { headers });
      }
      if (!res.ok) {
        res = await fetch(buildApiUrl('about'), { headers });
      }

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.sections || data.data || []);
        setAboutSections(list);
      }
    } catch (err) {
      console.error('Error al cargar bloques institucionales:', err);
    } finally {
      setLoadingAboutSections(false);
    }
  };

  // Cargar videos de Instagram para administración
  const fetchInstagramVideosAdmin = async () => {
    setLoadingInstagramVideos(true);
    try {
      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res = await fetch(buildApiUrl('instagram?all=true'), { headers });
      if (!res.ok) {
        res = await fetch(buildApiUrl('instagram/admin/all'), { headers });
      }
      if (!res.ok) {
        res = await fetch(buildApiUrl('instagram'), { headers });
      }

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.videos || data.data || []);
        setInstagramVideos(list);
      }
    } catch (err) {
      console.error('Error al cargar videos de Instagram:', err);
    } finally {
            setLoadingInstagramVideos(false);
    }
  };

  // Cargar preguntas frecuentes para administración
  const fetchFaqsAdmin = async () => {
    setLoadingFaqs(true);
    try {
      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let res = await fetch(buildApiUrl('faqs?all=true'), { headers });
      if (!res.ok) {
        res = await fetch(buildApiUrl('faqs/admin/all'), { headers });
      }
      if (!res.ok) {
        res = await fetch(buildApiUrl('faqs'), { headers });
      }

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.faqs || data.data || []);
        setFaqs(list);
      }
    } catch (err) {
      console.error('Error al cargar preguntas frecuentes:', err);
    } finally {
      setLoadingFaqs(false);
    }
  };

  const loadedTabsRef = useRef(new Set());

  // Carga bajo demanda por pestaña activa: evita ejecutar 8 llamadas concurrentes al entrar a /admin
  useEffect(() => {
    if (!isAdmin) return;

    if (activeTab === 'productos') {
      if (!loadedTabsRef.current.has('productos')) {
        loadedTabsRef.current.add('productos');
        fetchProducts();
        fetchAdminCategories();
      }
    } else if (activeTab === 'pedidos') {
      if (!loadedTabsRef.current.has('pedidos')) {
        loadedTabsRef.current.add('pedidos');
        fetchOrders();
      }
    } else if (activeTab === 'banners') {
      if (!loadedTabsRef.current.has('banners')) {
        loadedTabsRef.current.add('banners');
        fetchBannersAdmin();
      }
    } else if (activeTab === 'categorias') {
      if (!loadedTabsRef.current.has('categorias')) {
        loadedTabsRef.current.add('categorias');
        fetchAdminCategories();
      }
    } else if (activeTab === 'institucional') {
      if (!loadedTabsRef.current.has('institucional')) {
        loadedTabsRef.current.add('institucional');
        fetchAboutSectionsAdmin();
        fetchInstagramVideosAdmin();
      }
    } else if (activeTab === 'faq') {
      if (!loadedTabsRef.current.has('faq')) {
        loadedTabsRef.current.add('faq');
        fetchFaqsAdmin();
      }
    }
  }, [activeTab, isAdmin, token]);

  const handleOpenCreateCategoryModal = (parentId = null) => {
    setEditingCategory(null);
    setCategoryFormParentId(parentId !== null ? String(parentId) : '');
    setCategoryFormName('');
    setCategoryFormSlug('');
    setCategoryFormDescription('');
    setCategoryFormIsVisible(true);
    setIsAutoSlug(true);

    if (parentId !== null) {
      const parent = adminCategories.find((c) => c.id === Number(parentId));
      const nextOrder = (parent?.subcategories?.length || 0) + 1;
      setCategoryFormOrder(String(nextOrder));
    } else {
      const nextOrder = adminCategories.length + 1;
      setCategoryFormOrder(String(nextOrder));
    }

    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (category) => {
    setEditingCategory(category);
    setCategoryFormParentId(category.parent_id !== null && category.parent_id !== undefined ? String(category.parent_id) : '');
    setCategoryFormName(category.name || '');
    setCategoryFormSlug(category.slug || '');
    setCategoryFormDescription(category.description || '');
    setCategoryFormOrder(category.display_order !== undefined && category.display_order !== null ? String(category.display_order) : '1');
    setCategoryFormIsVisible(category.is_visible !== false);
    setIsAutoSlug(false);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!categoryFormName.trim()) {
      showNotification('error', 'Por favor, ingresa el nombre de la categoría.');
      return;
    }

    setIsSavingCategory(true);
    try {
      const payload = {
        name: categoryFormName.trim(),
        slug: categoryFormSlug.trim() || clientSlugify(categoryFormName),
        parent_id: categoryFormParentId !== '' ? Number(categoryFormParentId) : null,
        description: categoryFormDescription.trim() || null,
        display_order: parseInt(categoryFormOrder, 10) || 1,
        is_visible: categoryFormIsVisible
      };

      const isEdit = Boolean(editingCategory && editingCategory.id);
      const url = isEdit ? buildApiUrl(`categories/${editingCategory.id}`) : buildApiUrl('categories');
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al guardar la categoría.');
      }

      showNotification('success', isEdit ? '¡Categoría actualizada exitosamente!' : '¡Categoría creada exitosamente!');
      setIsCategoryModalOpen(false);

      // Sincronizar en cascada todas las vistas
      await fetchAdminCategories();
      if (fetchCategories) await fetchCategories();
      if (fetchProducts) await fetchProducts();
    } catch (err) {
      console.error('Error al guardar categoría:', err);
      showNotification('error', err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleToggleCategoryVisibility = async (category) => {
    try {
      const res = await fetch(buildApiUrl(`categories/${category.id}/toggle-visibility`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al modificar visibilidad.');
      }

      showNotification('success', data.message || 'Visibilidad de categoría actualizada.');
      await fetchAdminCategories();
      if (fetchCategories) await fetchCategories();
    } catch (err) {
      console.error('Error al cambiar visibilidad:', err);
      showNotification('error', err.message || 'Error al alternar visibilidad de categoría.');
    }
  };

  const handleOpenDeleteCategoryModal = (category) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryModalOpen(true);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeletingCategory(true);
    try {
      const res = await fetch(buildApiUrl(`categories/${categoryToDelete.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar la categoría.');
      }

      showNotification('success', data.message || `Categoría "${categoryToDelete.name}" eliminada.`);
      setIsDeleteCategoryModalOpen(false);
      setCategoryToDelete(null);

      // Sincronizar en cascada todas las vistas
      await fetchAdminCategories();
      if (fetchCategories) await fetchCategories();
      if (fetchProducts) await fetchProducts();
    } catch (err) {
      console.error('Error al eliminar categoría:', err);
      showNotification('error', err.message || 'Error al eliminar la categoría.');
    } finally {
      setIsDeletingCategory(false);
    }
  };

  const toggleExpandCategory = (catId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const showNotification = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage({ type: '', text: '' });
    }, 4000);
  };

  // Handlers para Bloques "Sobre Nosotros"
  const handleOpenCreateAboutModal = () => {
    setAboutModalMode('create');
    setCurrentAboutSection(null);
    setAboutFormTitle('');
    setAboutFormSubtitle('');
    setAboutFormContent('');
    setAboutFormImageUrl('');
    setAboutImageFileName('');
    setAboutFormOrder(String((safeAboutSections?.length || 0) + 1));
    setAboutFormIsActive(true);
    setIsAboutModalOpen(true);
  };

  const handleOpenEditAboutModal = (section) => {
    if (!section) return;
    setAboutModalMode('edit');
    setCurrentAboutSection(section);
    setAboutFormTitle(section.title || '');
    setAboutFormSubtitle(section.subtitle || '');
    setAboutFormContent(section.content || '');
    setAboutFormImageUrl(section.image_url || '');
    setAboutImageFileName(section.title ? `${section.title}.jpg` : '');
    setAboutFormOrder(String(section.order_index ?? 1));
    setAboutFormIsActive(section.is_active !== false);
    setIsAboutModalOpen(true);
  };

  const handleSaveAboutSection = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!aboutFormTitle.trim()) {
      showNotification('error', 'Por favor, ingresa el título del bloque.');
      return;
    }
    if (!aboutFormContent.trim()) {
      showNotification('error', 'Por favor, completa el contenido del bloque.');
      return;
    }

    setIsSavingAbout(true);
    try {
      const isEdit = aboutModalMode === 'edit' && currentAboutSection;
      const url = isEdit
        ? buildApiUrl(`about/${currentAboutSection.id}`)
        : buildApiUrl('about');
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: aboutFormTitle.trim(),
          subtitle: aboutFormSubtitle.trim() || null,
          content: aboutFormContent.trim(),
          image_url: aboutFormImageUrl.trim() || null,
          order_index: parseInt(aboutFormOrder, 10) || 1,
          is_active: aboutFormIsActive
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el bloque institucional.');
      }

      showNotification('success', isEdit ? '¡Bloque institucional actualizado!' : '¡Bloque institucional creado!');
      setIsAboutModalOpen(false);
      await fetchAboutSectionsAdmin();
    } catch (err) {
      console.error('Error al guardar bloque institucional:', err);
      showNotification('error', err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSavingAbout(false);
    }
  };

  const handleToggleAboutActive = async (section) => {
    try {
      const res = await fetch(buildApiUrl(`about/${section.id}/toggle`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al cambiar visibilidad.');
      }
      showNotification('success', data.message || 'Visibilidad de bloque actualizada.');
      await fetchAboutSectionsAdmin();
    } catch (err) {
      console.error('Error al cambiar visibilidad:', err);
      showNotification('error', err.message || 'Error al alternar visibilidad del bloque.');
    }
  };

  const handleDeleteAboutSection = async (sectionId) => {
    try {
      const res = await fetch(buildApiUrl(`about/${sectionId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showNotification('success', 'Bloque institucional eliminado del sistema.');
        await fetchAboutSectionsAdmin();
      }
    } catch (err) {
      console.error('Error al eliminar bloque institucional:', err);
      showNotification('error', 'Error al eliminar el bloque.');
    } finally {
      setDeleteAboutConfirmId(null);
    }
  };

  // Handlers para Videos de Instagram
  const handleOpenCreateInstagramModal = () => {
    setInstagramModalMode('create');
    setCurrentInstagramVideo(null);
    setInstagramFormTitle('');
    setInstagramFormPostUrl('');
    setInstagramFormThumbnailUrl('');
    setInstagramThumbnailFileName('');
    setInstagramFormOrder(String((safeInstagramVideos?.length || 0) + 1));
    setInstagramFormIsActive(true);
    setIsInstagramModalOpen(true);
  };

  const handleOpenEditInstagramModal = (video) => {
    if (!video) return;
    setInstagramModalMode('edit');
    setCurrentInstagramVideo(video);
    setInstagramFormTitle(video.title || '');
    setInstagramFormPostUrl(video.post_url || '');
    setInstagramFormThumbnailUrl(video.thumbnail_url || '');
    setInstagramThumbnailFileName(video.title ? `${video.title}.jpg` : '');
    setInstagramFormOrder(String(video.order_index ?? 1));
    setInstagramFormIsActive(video.is_active !== false);
    setIsInstagramModalOpen(true);
  };

  const handleSaveInstagramVideo = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!instagramFormPostUrl.trim()) {
      showNotification('error', 'Por favor, ingresa el enlace de Instagram.');
      return;
    }

    setIsSavingInstagram(true);
    try {
      const isEdit = instagramModalMode === 'edit' && currentInstagramVideo;
      const url = isEdit
        ? buildApiUrl(`instagram/${currentInstagramVideo.id}`)
        : buildApiUrl('instagram');
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: instagramFormTitle.trim() || 'Video CultiShop @culti.shopp',
          post_url: instagramFormPostUrl.trim(),
          thumbnail_url: instagramFormThumbnailUrl.trim() || null,
          order_index: parseInt(instagramFormOrder, 10) || 1,
          is_active: instagramFormIsActive
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar video de Instagram.');
      }

      showNotification('success', isEdit ? '¡Publicación de Instagram actualizada!' : '¡Publicación de Instagram agregada!');
      setIsInstagramModalOpen(false);
      await fetchInstagramVideosAdmin();
    } catch (err) {
      console.error('Error al guardar video de Instagram:', err);
      showNotification('error', err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSavingInstagram(false);
    }
  };

  const handleToggleInstagramActive = async (video) => {
    try {
      const res = await fetch(buildApiUrl(`instagram/${video.id}/toggle`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al cambiar visibilidad.');
      }
      showNotification('success', data.message || 'Visibilidad de video actualizada.');
      await fetchInstagramVideosAdmin();
    } catch (err) {
      console.error('Error al cambiar visibilidad:', err);
      showNotification('error', err.message || 'Error al alternar visibilidad.');
    }
  };

    const handleDeleteInstagramVideo = async (videoId) => {
    try {
      const res = await fetch(buildApiUrl(`instagram/${videoId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showNotification('success', 'Publicación de Instagram eliminada del sistema.');
        await fetchInstagramVideosAdmin();
      }
    } catch (err) {
      console.error('Error al eliminar video de Instagram:', err);
      showNotification('error', 'Error al eliminar la publicación.');
    } finally {
      setDeleteInstagramConfirmId(null);
    }
  };

  // Handlers para Preguntas Frecuentes (FAQ)
  const handleOpenCreateFaqModal = () => {
    setFaqModalMode('create');
    setCurrentFaq(null);
    setFaqFormQuestion('');
    setFaqFormAnswer('');
    setFaqFormCategory('Compras & Pagos');
    setFaqFormOrder(String((safeFaqs?.length || 0) + 1));
    setFaqFormIsActive(true);
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaqModal = (faq) => {
    if (!faq) return;
    setFaqModalMode('edit');
    setCurrentFaq(faq);
    setFaqFormQuestion(faq.question || '');
    setFaqFormAnswer(faq.answer || '');
    setFaqFormCategory(faq.category || 'General');
    setFaqFormOrder(String(faq.order_index ?? 1));
    setFaqFormIsActive(faq.is_active !== false);
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!faqFormQuestion.trim()) {
      showNotification('error', 'Por favor, ingresa el texto de la pregunta.');
      return;
    }
    if (!faqFormAnswer.trim()) {
      showNotification('error', 'Por favor, completa la respuesta de la pregunta.');
      return;
    }

    setIsSavingFaq(true);
    try {
      const isEdit = faqModalMode === 'edit' && currentFaq;
      const url = isEdit
        ? buildApiUrl(`faqs/${currentFaq.id}`)
        : buildApiUrl('faqs');
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: faqFormQuestion.trim(),
          answer: faqFormAnswer.trim(),
          category: faqFormCategory.trim() || 'General',
          order_index: parseInt(faqFormOrder, 10) || 1,
          is_active: faqFormIsActive
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar la pregunta frecuente.');
      }

      showNotification('success', isEdit ? '¡Pregunta frecuente actualizada!' : '¡Pregunta frecuente creada exitosamente!');
      setIsFaqModalOpen(false);
      await fetchFaqsAdmin();
    } catch (err) {
      console.error('Error al guardar pregunta frecuente:', err);
      showNotification('error', err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSavingFaq(false);
    }
  };

  const handleToggleFaqActive = async (faq) => {
    try {
      const res = await fetch(buildApiUrl(`faqs/${faq.id}/toggle`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al cambiar visibilidad.');
      }
      showNotification('success', data.message || 'Visibilidad de la pregunta actualizada.');
      await fetchFaqsAdmin();
    } catch (err) {
      console.error('Error al cambiar visibilidad:', err);
      showNotification('error', err.message || 'Error al alternar visibilidad.');
    }
  };

  const handleDeleteFaq = async (faqId) => {
    try {
      const res = await fetch(buildApiUrl(`faqs/${faqId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showNotification('success', 'Pregunta frecuente eliminada de la base de datos.');
        await fetchFaqsAdmin();
      }
    } catch (err) {
      console.error('Error al eliminar pregunta frecuente:', err);
      showNotification('error', 'Error al eliminar la pregunta.');
    } finally {
      setDeleteFaqConfirmId(null);
    }
  };

  // Guardar configuración de pagos y alias
  const handleSavePaymentSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!bankAlias.trim()) {
      showNotification('error', 'El Alias de transferencia no puede estar vacío.');
      return;
    }

    setIsSavingPayment(true);
    const res = await updatePaymentSettings({
      bank_alias: bankAlias.trim().toUpperCase(),
      bank_cbu: bankCbu.trim(),
      bank_name: bankName.trim(),
      account_holder: accountHolder.trim(),
      payment_notes: paymentNotes.trim()
    }, token);
    setIsSavingPayment(false);

    if (res.success) {
      showNotification('success', '¡Datos de pago y Alias bancario guardados exitosamente!');
    } else {
      showNotification('error', res.error || 'Error al guardar los datos de pago.');
    }
  };

  const handleEmbedUrlChange = (val) => {
    let finalUrl = val.trim();
    // Si el usuario pega un tag <iframe> completo de Google Maps, extraer automáticamente el atributo src="..."
    if (finalUrl.includes('<iframe') && finalUrl.includes('src=')) {
      const match = finalUrl.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) {
        finalUrl = match[1];
        setExtractedIframeNotice(true);
        setTimeout(() => setExtractedIframeNotice(false), 4500);
      }
    }
    setLocEmbedUrl(finalUrl);
  };

  const handleSaveLocationSettings = async (e) => {
    if (e) e.preventDefault();
    if (!token) {
      showNotification('error', 'Sesión expirada. Por favor vuelve a iniciar sesión.');
      return;
    }

    if (!locAddress.trim()) {
      showNotification('error', 'Por favor ingresa la dirección del local comercial.');
      return;
    }

    setIsSavingLocation(true);
    const res = await updateLocationSettings({
      address: locAddress.trim(),
      hours: locHours.trim(),
      phone: locPhone.trim(),
      google_maps_url: locGoogleMapsUrl.trim(),
      google_maps_embed_url: locEmbedUrl.trim()
    }, token);
    setIsSavingLocation(false);

    if (res.success) {
      showNotification('success', '¡Ubicación del local comercial y mapa de Google Maps guardados exitosamente!');
    } else {
      showNotification('error', res.error || 'Error al guardar la configuración de ubicación.');
    }
  };

  const handleCopyPreviewAlias = (aliasText) => {
    if (aliasText) {
      navigator.clipboard.writeText(aliasText);
      setCopiedPreviewAlias(true);
      setTimeout(() => setCopiedPreviewAlias(false), 2000);
    }
  };

  // Handlers para Gestión de Banners Publicitarios
  const handleOpenCreateBannerModal = () => {
    setBannerModalMode('create');
    setCurrentBanner(null);
    setBannerFormTitle('');
    setBannerFormSubtitle('');
    setBannerFormImageUrl('');
    setRawBannerSourceImage('');
    setBannerImageFileName('');
    setBannerFormLinkUrl('/categoria/control-de-plagas');
    setBannerFormButtonText('Ver Más');
    setBannerFormOrder(String((safeBanners?.length || 0) + 1));
    setBannerFormIsActive(true);
    setBannerFormShowText(true);
    setIsBannerCropperOpen(false);
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBannerModal = (banner) => {
    if (!banner) return;
    setBannerModalMode('edit');
    setCurrentBanner(banner);
    setBannerFormTitle(banner.title || '');
    setBannerFormSubtitle(banner.subtitle || '');
    setBannerFormImageUrl(banner.image_url || '');
    setRawBannerSourceImage(banner.image_url || '');
    setBannerImageFileName(banner.title ? `${banner.title}.jpg` : '');
    setBannerFormLinkUrl(banner.link_url || '');
    setBannerFormButtonText(banner.button_text || 'Ver Más');
    setBannerFormOrder(String(banner.display_order ?? 0));
    setBannerFormIsActive(banner.is_active !== false);
    setBannerFormShowText(banner.show_text !== false);
    setIsBannerCropperOpen(false);
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
    const firstCat = safeCategories[0]?.name || 'Fertilizantes';
    setFormCategory(firstCat);
    setFormSubcategory('');
    setFormImageUrl('');
    setProductImageFileName('');
    setFormBadge('STOCK DISPONIBLE');
    setFormBadgeType('gold');
    setFormVariants([
      { name: '100 cc', price: '6000', stock: '10' },
      { name: '250 cc', price: '14500', stock: '10' },
      { name: '500 cc', price: '28000', stock: '10' }
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
    setFormCategory(prod.category || 'Fertilizantes');
    setFormSubcategory(prod.subcategory || '');
    setFormImageUrl(prod.image_url || prod.image || '');
    setProductImageFileName(prod.title ? `${prod.title}.jpg` : '');

    const opts = getProductOptions(prod);
    let loadedVariants = [];
    if (opts && opts.length > 0) {
      loadedVariants = opts.map((o) => ({
        name: o.name,
        price: o.price !== undefined ? String(o.price) : (rawPrice ? String(rawPrice) : '0'),
        stock: o.stock !== undefined ? String(o.stock) : (prod.stock !== undefined ? String(prod.stock) : '10')
      }));
    } else {
      loadedVariants = [{
        name: 'Estándar',
        price: rawPrice ? String(rawPrice) : '0',
        stock: prod.stock !== undefined ? String(prod.stock) : '10'
      }];
    }
    setFormVariants(loadedVariants);

    const totalStock = loadedVariants.reduce((acc, v) => acc + (parseInt(v.stock, 10) || 0), 0);
    const isZeroStock = totalStock <= 0 || prod.badge === 'SIN STOCK';
    const initialBadge = isZeroStock
      ? 'SIN STOCK'
      : (prod.badge && prod.badge.trim() !== '' && prod.badge.toLowerCase() !== 'sin etiqueta' ? prod.badge : 'STOCK DISPONIBLE');
    setFormBadge(initialBadge);
    setFormBadgeType(isZeroStock ? 'red' : (prod.badge_type || prod.badgeType || 'gold'));

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

    const validVariants = formVariants
      .filter((v) => v.name && v.name.trim().length > 0)
      .map((v) => ({
        name: v.name.trim(),
        price: parseFloat(String(v.price).replace(/[^0-9.-]/g, '')) || 0,
        stock: Math.max(0, parseInt(String(v.stock !== undefined && v.stock !== '' ? v.stock : 0), 10) || 0)
      }));

    if (validVariants.length === 0) {
      showNotification('error', 'Debes configurar al menos una medida o presentación en la tabla con su precio y stock.');
      return;
    }

    // Comprobar que todas las variantes tengan precio válido
    const hasInvalidPrice = validVariants.some((v) => isNaN(v.price) || v.price < 0);
    if (hasInvalidPrice) {
      showNotification('error', 'Todos los precios de las presentaciones deben ser números mayores o iguales a 0.');
      return;
    }

    setIsSavingProduct(true);

    const finalVariants = validVariants;
    const variantPrices = finalVariants.map((v) => v.price).filter((p) => !isNaN(p) && p >= 0);
    const finalBasePrice = variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
    const totalVariantStock = finalVariants.reduce((acc, v) => acc + (v.stock || 0), 0);
    const numStock = totalVariantStock;

    let finalBadge = formBadge.trim();
    if (finalBadge === 'none' || finalBadge.toLowerCase() === 'sin etiqueta' || finalBadge === '') {
      finalBadge = '';
    }
    let finalBadgeType = formBadgeType;
    if (numStock <= 0) {
      finalBadge = 'SIN STOCK';
      finalBadgeType = 'red';
    } else if (finalBadge === 'SIN STOCK') {
      finalBadge = 'STOCK DISPONIBLE';
      finalBadgeType = 'gold';
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
          Esta sección está protegida y sólo puede ser gestionada por cuentas con permisos de administrador en CultiShop.
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

    // Renderizado compartido para la gestión de preguntas frecuentes (FAQ)
  const renderFaqSectionContent = () => (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e1c12] border border-[#1f3b25]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-grow max-w-2xl">
          <div className="relative flex-grow">
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Buscar en preguntas frecuentes..."
              className="w-full py-2.5 pl-4 pr-10 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs placeholder-gray-400 focus:outline-none focus:border-[#4aa036]"
            />
            {faqSearch && (
              <button
                type="button"
                onClick={() => setFaqSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <select
            value={faqCategoryFilter}
            onChange={(e) => setFaqCategoryFilter(e.target.value)}
            className="py-2.5 px-3.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs focus:outline-none focus:border-[#4aa036]"
          >
            <option value="all">Todas las Categorías</option>
            <option value="Compras & Pagos">Compras & Pagos</option>
            <option value="Envíos & Entregas">Envíos & Entregas</option>
            <option value="Local & Horarios">Local & Horarios</option>
            <option value="Cultivo & Insumos">Cultivo & Insumos</option>
            <option value="Cultivo & Normativa">Cultivo & Normativa</option>
            <option value="Asesoramiento">Asesoramiento</option>
            <option value="General">General</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchFaqsAdmin}
            className="p-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#23422a] transition cursor-pointer"
            title="Recargar preguntas"
          >
            <RefreshCw size={15} className={loadingFaqs ? 'animate-spin text-[#4aa036]' : ''} />
          </button>

          <button
            type="button"
            onClick={handleOpenCreateFaqModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Plus size={15} />
            <span>Nueva Pregunta</span>
          </button>
        </div>
      </div>

      {loadingFaqs && safeFaqs.length === 0 ? (
        <div className="text-center py-16 bg-[#0e1c12] border border-[#1f3b25] rounded-2xl space-y-3">
          <RefreshCw className="animate-spin text-[#4aa036] mx-auto" size={32} />
          <p className="text-sm font-bold text-gray-300">Cargando preguntas frecuentes...</p>
        </div>
      ) : filteredAdminFaqs.length === 0 ? (
        <div className="text-center py-16 bg-[#0e1c12] border border-[#1f3b25] rounded-2xl space-y-4">
          <HelpCircle className="text-gray-500 mx-auto" size={48} />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">No hay preguntas frecuentes registradas</h4>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Crea preguntas y respuestas claras para resolver las dudas recurrentes de tus clientes.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreateFaqModal}
            className="px-5 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Crear Primera Pregunta</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAdminFaqs.map((faq) => (
            <div
              key={faq.id}
              className="p-5 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] hover:border-[#2d5a27] transition shadow-md flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#162a1b] text-[#e0a96d] text-[10px] font-bold uppercase tracking-wider border border-[#23422a]">
                      {faq.category || 'General'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#142619] text-gray-400 text-[10px] font-mono border border-[#1f3b25]">
                      Orden: {faq.order_index ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        faq.is_active !== false
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                          : 'bg-yellow-950/80 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {faq.is_active !== false ? '● Visible en Tienda' : '○ Oculta'}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {faq.question}
                </h3>

                <p className="text-xs text-gray-300 bg-[#0a140d]/70 p-3.5 rounded-xl border border-[#162a1b] leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </p>
              </div>

              <div className="pt-3 border-t border-[#18311d] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleFaqActive(faq)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                    faq.is_active !== false
                      ? 'bg-[#142619] text-gray-400 hover:text-white border-[#23422a]'
                      : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                  }`}
                >
                  {faq.is_active !== false ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{faq.is_active !== false ? 'Ocultar' : 'Publicar'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditFaqModal(faq)}
                    className="px-3 py-1.5 rounded-lg bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-[#e0a96d] border border-[#23422a] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit size={13} />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteFaqConfirmId(faq.id)}
                    className="p-1.5 rounded-lg bg-[#1a1414] hover:bg-red-950 text-gray-400 hover:text-red-400 border border-red-900/40 transition cursor-pointer"
                    title="Eliminar pregunta"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {deleteFaqConfirmId === faq.id && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 space-y-2 text-xs">
                  <span className="text-red-200 block text-xs font-semibold">
                    ¿Estás seguro de que deseas eliminar esta pregunta frecuente permanentemente?
                  </span>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteFaqConfirmId(null)}
                      className="px-3 py-1 rounded bg-[#142619] text-gray-300 text-xs cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

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

        <button
          onClick={() => setActiveTab('categorias')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'categorias'
              ? 'bg-[#2d5a27] text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#142619]'
          }`}
        >
          <FolderTree size={16} />
          <span>Categorías ({adminCategories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pagos')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'pagos'
              ? 'bg-[#2d5a27] text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#142619]'
          }`}
        >
          <CreditCard size={16} />
          <span>Datos de Pago / Alias</span>
        </button>

                <button
          onClick={() => setActiveTab('institucional')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'institucional'
              ? 'bg-[#2d5a27] text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#142619]'
          }`}
        >
          <BookOpen size={16} />
          <span>Institucional & Instagram ({safeAboutSections.length + safeInstagramVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
            activeTab === 'faq'
              ? 'bg-[#2d5a27] text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-[#142619]'
          }`}
        >
          <HelpCircle size={16} />
          <span>Preguntas Frecuentes FAQ ({safeFaqs.length})</span>
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
                  {loadingProducts ? (
                    <tr>
                      <td colSpan="6" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-8 h-8 border-2 border-[#4aa036] border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-gray-400 font-semibold">
                            Cargando catálogo de productos en tiempo real desde Neon DB...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
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
                              className="w-12 h-12 rounded-xl object-contain bg-[#0b1610] p-0.5 border border-[#2d5a27] shrink-0"
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
                          {prod.badge && prod.badge.trim() !== '' && prod.badge.toLowerCase() !== 'sin etiqueta' ? (
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
                            <span className="text-gray-500 text-[11px] italic">Sin etiqueta</span>
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
          {loadingOrders ? (
            <div className="p-16 text-center bg-[#0e1c12] border border-[#1f3b25] rounded-3xl space-y-4 shadow-xl">
              <div className="w-8 h-8 border-2 border-[#4aa036] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-400 font-medium">Cargando pedidos en tiempo real desde la base de datos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
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
                        {order.shipping_method && (
                          <span className="text-[11px] text-emerald-400 block font-semibold mt-1">
                            Modalidad: {order.shipping_method === 'retiro_local' ? '🏪 Retiro en Local Oficial' : order.shipping_method === 'envio_posadas' ? '🛵 Envío a Domicilio (Posadas)' : '📦 Envío Nacional'}
                          </span>
                        )}
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

                        {/* Vista Previa Horizontal con acceso directo al encuadre */}
                        <td className="py-4 px-4">
                          <div
                            onClick={() => {
                              handleOpenEditBannerModal(banner);
                              setIsBannerCropperOpen(true);
                            }}
                            className="relative w-36 sm:w-44 h-16 sm:h-20 rounded-xl overflow-hidden border border-[#23422a] hover:border-[#e0a96d]/60 bg-[#0b1610] group shrink-0 cursor-pointer shadow-sm transition"
                            title="Clic para ajustar zoom y encuadre"
                          >
                            <img
                              src={banner.image_url}
                              alt={banner.title}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=800';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
                              <Sliders size={13} className="text-[#e0a96d]" />
                              <span className="text-[10px] text-white font-bold">Ajustar Zoom</span>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                              <span className="text-[9px] text-gray-300 font-mono truncate px-1 block">
                                16:5 Panorámico
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
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
                              onClick={() => {
                                handleOpenEditBannerModal(banner);
                                setIsBannerCropperOpen(true);
                              }}
                              className="p-2 rounded-xl bg-[#142619] hover:bg-[#1a3821] text-[#e0a96d] border border-[#23422a] hover:border-[#e0a96d]/60 transition cursor-pointer shadow-sm"
                              title="Ajustar zoom y encuadre"
                            >
                              <Sliders size={15} />
                            </button>
                            <button
                              onClick={() => handleToggleBanner(banner)}
                              className={`p-2 rounded-xl border transition cursor-pointer ${
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
                              className="p-2 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-[#e0a96d] border border-[#23422a] transition cursor-pointer"
                              title="Editar banner"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteBannerConfirmId(banner.id)}
                              className="p-2 rounded-xl bg-[#142619] hover:bg-red-950/50 text-gray-400 hover:text-red-400 border border-[#23422a] hover:border-red-900 transition cursor-pointer"
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
      {/* SECCIÓN 4: GESTIÓN DE CATEGORÍAS Y SUBCATEGORÍAS (CRUD)       */}
      {/* ============================================================ */}
      {activeTab === 'categorias' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Encabezado y Acciones Principales */}
          <div className="bg-[#0e1c12] border border-[#1f3b25] p-5 sm:p-6 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2.5">
                <FolderTree className="text-[#e0a96d]" size={24} />
                <span>Estructura de Categorías y Subcategorías</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Administrá las categorías principales y subcategorías del catálogo. Los cambios se sincronizan en tiempo real con la barra de navegación (Navbar) y los filtros de la tienda.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
              <button
                type="button"
                onClick={() => {
                  fetchAdminCategories();
                  if (fetchCategories) fetchCategories();
                }}
                disabled={loadingAdminCategories}
                className="px-3.5 py-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white text-xs font-semibold border border-[#23422a] transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                title="Sincronizar con la base de datos"
              >
                <RefreshCw size={14} className={loadingAdminCategories ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Sincronizar</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenCreateCategoryModal(null)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Plus size={15} />
                <span>Nueva Categoría Principal</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenCreateCategoryModal(adminCategories[0]?.id || null)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#1a3521] hover:bg-[#23482d] text-[#e0a96d] hover:text-white text-xs font-bold border border-[#e0a96d]/40 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Tag size={15} />
                <span>Nueva Subcategoría</span>
              </button>
            </div>
          </div>

          {/* Tarjetas de Métricas de Categorías */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] shadow-sm">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-1.5">
                <span>Principales</span>
                <FolderTree size={15} className="text-[#4aa036]" />
              </div>
              <div className="text-2xl font-black text-white font-heading">{adminCategories.length}</div>
              <span className="text-[10px] text-gray-500 block">Menú nivel 1 en Navbar</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] shadow-sm">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-1.5">
                <span>Subcategorías</span>
                <Tag size={15} className="text-[#e0a96d]" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-heading">
                {adminCategories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)}
              </div>
              <span className="text-[10px] text-gray-500 block">Desplegables dependientes</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] shadow-sm">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-1.5">
                <span>Productos Clasificados</span>
                <Package size={15} className="text-[#25d366]" />
              </div>
              <div className="text-2xl font-black text-[#25d366] font-heading">
                {adminCategories.reduce((acc, cat) => acc + (Number(cat.total_products_count) || 0), 0)}
              </div>
              <span className="text-[10px] text-gray-500 block">Artículos en catálogo</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] shadow-sm">
              <div className="flex items-center justify-between text-gray-400 text-xs mb-1.5">
                <span>Ocultas en Tienda</span>
                <EyeOff size={15} className="text-gray-400" />
              </div>
              <div className="text-2xl font-black text-gray-300 font-heading">
                {adminCategories.filter(c => c.is_visible === false).length +
                  adminCategories.reduce((acc, c) => acc + (c.subcategories || []).filter(s => s.is_visible === false).length, 0)}
              </div>
              <span className="text-[10px] text-gray-500 block">Borradores o inactivas</span>
            </div>
          </div>

          {/* Barra de Filtro y Búsqueda */}
          <div className="p-4 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Buscar categoría o subcategoría por nombre o slug..."
                className="w-full py-2.5 pl-9 pr-9 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs placeholder-gray-400 focus:outline-none focus:border-[#4aa036]"
              />
              <Search className="absolute left-3 top-3 text-gray-400" size={15} />
              {categorySearch && (
                <button
                  type="button"
                  onClick={() => setCategorySearch('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 justify-end text-xs">
              <button
                type="button"
                onClick={() => {
                  const allOpen = {};
                  adminCategories.forEach(c => { allOpen[c.id] = true; });
                  setExpandedCategories(allOpen);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#142619] hover:bg-[#1f3b25] text-gray-300 text-xs font-semibold border border-[#23422a] transition cursor-pointer"
              >
                Expandir Todo
              </button>
              <button
                type="button"
                onClick={() => setExpandedCategories({})}
                className="px-3 py-1.5 rounded-lg bg-[#142619] hover:bg-[#1f3b25] text-gray-300 text-xs font-semibold border border-[#23422a] transition cursor-pointer"
              >
                Colapsar Todo
              </button>
            </div>
          </div>

          {/* Árbol Jerárquico de Categorías */}
          {loadingAdminCategories ? (
            <div className="text-center py-16 bg-[#0e1c12] border border-[#1f3b25] rounded-2xl space-y-3">
              <RefreshCw className="animate-spin text-[#4aa036] mx-auto" size={32} />
              <p className="text-sm font-bold text-gray-300">Cargando jerarquía de categorías...</p>
            </div>
          ) : adminCategories.length === 0 ? (
            <div className="text-center py-16 bg-[#0e1c12] border border-[#1f3b25] rounded-2xl space-y-4">
              <FolderTree className="text-gray-500 mx-auto" size={48} />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No hay categorías configuradas en la base de datos</h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  Comienza creando tu primera categoría principal para estructurar los insumos de CultiShop.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCreateCategoryModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition inline-flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Crear Primera Categoría</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {adminCategories
                .filter(cat => {
                  if (!categorySearch.trim()) return true;
                  const q = categorySearch.toLowerCase().trim();
                  const matchName = (cat.name || '').toLowerCase().includes(q);
                  const matchSlug = (cat.slug || '').toLowerCase().includes(q);
                  const matchSubs = (cat.subcategories || []).some(
                    sub => (sub.name || '').toLowerCase().includes(q) || (sub.slug || '').toLowerCase().includes(q)
                  );
                  return matchName || matchSlug || matchSubs;
                })
                .map((cat) => {
                  const subcategories = Array.isArray(cat.subcategories) ? cat.subcategories : [];
                  const isExpanded = Boolean(expandedCategories[cat.id]);
                  const totalProducts = Number(cat.total_products_count) || 0;

                  return (
                    <div
                      key={cat.id}
                      className="bg-[#0e1c12] border border-[#1f3b25] hover:border-[#2d5a27]/80 rounded-2xl overflow-hidden shadow-sm transition-all"
                    >
                      {/* Fila Principal de la Categoría */}
                      <div className="p-3.5 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-gradient-to-r from-[#0e1c12] via-[#112316] to-[#0e1c12]">
                        <div className="flex items-center gap-2.5 sm:gap-3 flex-grow min-w-0">
                          {/* Botón de acordeón para expandir/colapsar subcategorías */}
                          <button
                            type="button"
                            onClick={() => toggleExpandCategory(cat.id)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isExpanded
                                ? 'bg-[#18311d] text-[#e0a96d] border-[#2d5a27]'
                                : 'bg-[#142619] text-gray-400 hover:text-white border-[#23422a]'
                            }`}
                            title={isExpanded ? 'Colapsar subcategorías' : 'Expandir subcategorías'}
                          >
                            <ChevronDown
                              size={15}
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#e0a96d]' : ''}`}
                            />
                          </button>

                          <div className="p-2 rounded-xl bg-[#142619] border border-[#23422a] text-[#4aa036] shrink-0">
                            <FolderTree size={18} />
                          </div>

                          <div className="min-w-0 flex-grow">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-bold text-white font-heading truncate">
                                {cat.name}
                              </h3>

                              {/* Badge de Slug URL */}
                              <Link
                                to={`/categoria/${cat.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[#142619] text-[#e0a96d] border border-[#23422a] hover:border-[#e0a96d]/60 transition"
                                title="Ver en tienda pública"
                              >
                                <span>/{cat.slug}</span>
                                <ExternalLink size={10} className="shrink-0" />
                              </Link>

                              {/* Orden de visualización */}
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-mono text-gray-400 bg-[#09150d] border border-[#162d1b]" title="Orden de aparición en el menú">
                                <Hash size={10} />
                                <span>{cat.display_order}</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 mt-1 text-[11px] text-gray-400 flex-wrap">
                              <span className="text-gray-300 font-semibold">
                                {subcategories.length} {subcategories.length === 1 ? 'subcategoría' : 'subcategorías'}
                              </span>
                              <span>•</span>
                              <span className="text-[#25d366] font-semibold">
                                {totalProducts} {totalProducts === 1 ? 'producto vinculado' : 'productos vinculados'}
                              </span>
                              {cat.description && (
                                <>
                                  <span>•</span>
                                  <span className="text-gray-400 truncate max-w-xs">{cat.description}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Botones de Acción de Categoría Principal */}
                        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#1a3320]">
                          {/* Toggle Visibilidad */}
                          <button
                            type="button"
                            onClick={() => handleToggleCategoryVisibility(cat)}
                            title={cat.is_visible !== false ? 'Visible en tienda pública (clic para ocultar)' : 'Oculta en tienda pública (clic para hacer visible)'}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                              cat.is_visible !== false
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900'
                                : 'bg-gray-800/80 text-gray-400 border border-gray-600/50 hover:bg-gray-700'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cat.is_visible !== false ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                            <span>{cat.is_visible !== false ? 'Visible' : 'Oculta'}</span>
                          </button>

                          {/* Añadir Subcategoría Directa */}
                          <button
                            type="button"
                            onClick={() => handleOpenCreateCategoryModal(cat.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-[#e0a96d] hover:text-white text-xs font-semibold border border-[#23422a] hover:border-[#e0a96d]/50 transition flex items-center gap-1 cursor-pointer"
                            title="Añadir nueva subcategoría dependiente de esta categoría"
                          >
                            <Plus size={13} />
                            <span className="hidden sm:inline">Subcategoría</span>
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategoryModal(cat)}
                            className="p-1.5 sm:p-2 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#23422a] transition cursor-pointer"
                            title="Modificar categoría"
                          >
                            <Edit size={14} />
                          </button>

                          {/* Eliminar */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteCategoryModal(cat)}
                            className="p-1.5 sm:p-2 rounded-xl bg-[#142619] hover:bg-red-950/80 text-gray-400 hover:text-red-400 border border-[#23422a] hover:border-red-600/50 transition cursor-pointer"
                            title="Eliminar categoría principal y validar impacto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Subcategorías Desplegables (Acordeón) */}
                      {isExpanded && (
                        <div className="p-3 sm:p-4 bg-[#08120a] border-t border-[#18311d]">
                          {subcategories.length === 0 ? (
                            <div className="py-3 px-4 rounded-xl bg-[#0e1c12] border border-dashed border-[#1f3b25] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
                              <span className="italic">Esta categoría principal no tiene subcategorías dependientes aún.</span>
                              <button
                                type="button"
                                onClick={() => handleOpenCreateCategoryModal(cat.id)}
                                className="px-3 py-1 rounded-lg bg-[#142619] hover:bg-[#1f3b25] text-[#e0a96d] font-bold text-xs border border-[#23422a] transition flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={13} />
                                <span>Añadir primera subcategoría</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 pb-1 flex items-center gap-1.5">
                                <Tag size={12} className="text-[#e0a96d]" />
                                <span>Subcategorías de {cat.name} ({subcategories.length})</span>
                              </div>

                              <div className="grid grid-cols-1 gap-1.5">
                                {subcategories.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className="p-2.5 sm:p-3 rounded-xl bg-[#0e1c12] border border-[#1a3320] hover:border-[#2d5a27] flex items-center justify-between gap-3 transition"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-2 h-2 rounded-full bg-[#4aa036] shrink-0" />
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-xs sm:text-sm font-bold text-gray-200">
                                            {sub.name}
                                          </span>
                                          <Link
                                            to={`/categoria/${cat.slug}/${sub.slug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-400 hover:text-[#e0a96d] bg-[#09150d] border border-[#162d1b] transition"
                                            title="Ver subcategoría en tienda pública"
                                          >
                                            <span>/{sub.slug}</span>
                                            <ExternalLink size={9} />
                                          </Link>
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-400 bg-[#09150d] border border-[#162d1b]">
                                            #{sub.display_order}
                                          </span>
                                        </div>
                                        {sub.description && (
                                          <p className="text-[11px] text-gray-400 mt-0.5 truncate">{sub.description}</p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-[11px] font-semibold text-[#25d366] bg-[#142619] px-2 py-0.5 rounded-lg border border-[#23422a]">
                                        {sub.products_count || 0} {sub.products_count === 1 ? 'producto' : 'productos'}
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() => handleToggleCategoryVisibility(sub)}
                                        title={sub.is_visible !== false ? 'Visible (clic para ocultar)' : 'Oculta (clic para hacer visible)'}
                                        className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                                          sub.is_visible !== false
                                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                                            : 'bg-gray-800 text-gray-400 border-gray-600/50'
                                        }`}
                                      >
                                        {sub.is_visible !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditCategoryModal(sub)}
                                        className="p-1.5 rounded-lg bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#23422a] transition cursor-pointer"
                                        title="Modificar subcategoría"
                                      >
                                        <Edit size={13} />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleOpenDeleteCategoryModal(sub)}
                                        className="p-1.5 rounded-lg bg-[#142619] hover:bg-red-950/80 text-gray-400 hover:text-red-400 border border-[#23422a] hover:border-red-600/50 transition cursor-pointer"
                                        title="Eliminar subcategoría"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SECCIÓN 5: CONFIGURACIÓN DE DATOS DE PAGO Y ALIAS BANCARIO   */}
      {/* ============================================================ */}
      {activeTab === 'pagos' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Encabezado de la Sección */}
          <div className="bg-[#0e1c12] border border-[#1f3b25] p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2.5">
                <Landmark className="text-[#e0a96d]" size={24} />
                <span>Datos de Pago y Alias Bancario</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Personaliza el Alias oficial, CBU/CVU y notas que se muestran a los clientes al elegir transferencia bancaria en el Checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSavePaymentSettings}
              disabled={isSavingPayment}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shrink-0 disabled:opacity-50"
            >
              <Save size={16} className={isSavingPayment ? 'animate-spin' : ''} />
              <span>{isSavingPayment ? 'Guardando en BD...' : 'Guardar Cambios'}</span>
            </button>
          </div>

          {/* Cuadrícula: Formulario a la izquierda, Vista previa a la derecha */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Formulario de Configuración */}
            <form onSubmit={handleSavePaymentSettings} className="lg:col-span-7 bg-[#0e1c12] border border-[#1f3b25] p-5 sm:p-6 rounded-2xl space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1b3420] pb-3">
                <CreditCard size={16} className="text-[#4aa036]" />
                <span>Parámetros de Cobro por Transferencia</span>
              </h3>

              {/* Alias Oficial */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Alias de Transferencia Bancaria <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={bankAlias}
                  onChange={(e) => setBankAlias(e.target.value.toUpperCase())}
                  placeholder="Ej: CULTISHOP.POSADAS"
                  required
                  className="w-full bg-[#122317] border border-[#23422a] focus:border-[#4aa036] rounded-xl px-4 py-2.5 text-white font-mono text-sm tracking-wide outline-none transition uppercase"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Es el identificador que los clientes copiarán con un solo toque desde su celular o homebanking.
                </p>
              </div>

              {/* CBU / CVU */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  CBU o CVU (Opcional)
                </label>
                <input
                  type="text"
                  value={bankCbu}
                  onChange={(e) => setBankCbu(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Ej: 0000003100012345678901"
                  maxLength={22}
                  className="w-full bg-[#122317] border border-[#23422a] focus:border-[#4aa036] rounded-xl px-4 py-2.5 text-white font-mono text-sm tracking-wider outline-none transition"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Código de 22 dígitos para transferencias directas entre bancos o billeteras virtuales.
                </p>
              </div>

              {/* Entidad / Billetera */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Entidad Financiera / Billetera Virtual
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ej: Mercado Pago / Billeteras Virtuales o Banco Macro"
                  className="w-full bg-[#122317] border border-[#23422a] focus:border-[#4aa036] rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                />
              </div>

              {/* Titular de la Cuenta */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Titular de la Cuenta
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Ej: CultiShop Posadas / Jonathan Gomez"
                  className="w-full bg-[#122317] border border-[#23422a] focus:border-[#4aa036] rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                />
              </div>

              {/* Notas e instrucciones adicionales */}
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Instrucciones o Notas para el Cliente
                </label>
                <textarea
                  rows={3}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Instrucciones que acompañan a los datos bancarios..."
                  className="w-full bg-[#122317] border border-[#23422a] focus:border-[#4aa036] rounded-xl p-3 text-white text-xs outline-none transition resize-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Se visualiza inmediatamente debajo de los datos del alias en el formulario de Checkout.
                </p>
              </div>

              {/* Botón inferior */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPayment}
                  className="w-full py-3 px-6 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} className={isSavingPayment ? 'animate-spin' : ''} />
                  <span>{isSavingPayment ? 'Guardando en Base de Datos Neon...' : 'Guardar y Publicar en Tienda'}</span>
                </button>
              </div>
            </form>

            {/* Vista Previa en Vivo */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#0e1c12] border border-[#1f3b25] p-5 sm:p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1b3420] pb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#e0a96d]" />
                    <span>Vista Previa en Checkout</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#4aa036] bg-[#142619] px-2 py-0.5 rounded-full border border-[#23422a]">
                    En tiempo real
                  </span>
                </div>

                <p className="text-xs text-gray-400">
                  Así es exactamente como los compradores visualizarán la opción de pago en el paso final de la compra:
                </p>

                {/* Caja simulada del checkout */}
                <div className="p-4 rounded-2xl bg-[#09150d] border-2 border-[#2d5a27] space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-[#4aa036] flex items-center justify-center bg-[#4aa036]/20">
                        <div className="w-2 h-2 rounded-full bg-[#4aa036]" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">Transferencia Bancaria</span>
                        <span className="text-[11px] text-gray-400">Transferí desde Mercado Pago o cualquier banco</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#e0a96d] bg-[#2a1e0f] px-2 py-0.5 rounded-full border border-[#e0a96d]/40">
                      Recomendado
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#1b3621] space-y-2.5 text-xs bg-[#102014] p-3.5 rounded-xl border border-[#1b3420]">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">Alias Oficial:</span>
                      <div className="flex items-center gap-1.5">
                        <code className="text-[#e0a96d] font-bold bg-[#142619] px-2.5 py-1 rounded-lg border border-[#23422a] tracking-wide select-all">
                          {bankAlias || 'CULTISHOP.POSADAS'}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopyPreviewAlias(bankAlias || 'CULTISHOP.POSADAS')}
                          className="p-1.5 hover:text-white text-gray-300 bg-[#142619] hover:bg-[#1e3b26] border border-[#23422a] rounded-lg transition flex items-center gap-1"
                          title="Probar copiar alias"
                        >
                          {copiedPreviewAlias ? <Check size={14} className="text-[#4aa036]" /> : <Copy size={14} />}
                          <span className="text-[10px]">{copiedPreviewAlias ? '¡Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    {bankCbu && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-medium">CBU / CVU:</span>
                        <div className="flex items-center gap-1.5">
                          <code className="text-gray-300 font-mono text-[11px] bg-[#142619] px-2 py-0.5 rounded border border-[#23422a] select-all">
                            {bankCbu}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyPreviewAlias(bankCbu)}
                            className="p-1 hover:text-white text-gray-400 transition"
                            title="Probar copiar CBU"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-400">Titular de la cuenta:</span>
                      <span className="text-white font-medium">{accountHolder || 'CultiShop Posadas'}</span>
                    </div>

                    {bankName && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">Entidad / Billetera:</span>
                        <span className="text-gray-200">{bankName}</span>
                      </div>
                    )}

                    <p className="text-[10px] text-gray-400 pt-1.5 border-t border-[#152a1b] leading-relaxed">
                      {paymentNotes || 'Al confirmar el pedido podrás enviar el comprobante de transferencia directamente por WhatsApp.'}
                    </p>
                  </div>
                </div>

                {/* Nota informativa */}
                <div className="p-3.5 rounded-xl bg-[#142619] border border-[#23422a] text-[11px] text-gray-300 flex items-start gap-2.5">
                  <Shield size={16} className="text-[#4aa036] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Al presionar <strong>"Guardar Cambios"</strong>, la información se persiste en la tabla <code className="text-[#e0a96d]">settings</code> de tu base de datos Neon DB, reflejándose inmediatamente sin tiempos de espera.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECCIÓN 6: GESTIÓN DE INSTITUCIONAL & INSTAGRAM */}
      {/* ============================================================ */}
      {activeTab === 'institucional' && (
        <div className="space-y-6">
          {/* Cabecera y Selector de Sub-pestañas */}
          <div className="p-5 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e0a96d] mb-1">
                <BookOpen size={15} />
                <span>Gestión de Contenido Institucional</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
                PÁGINA "SOBRE NOSOTROS" & VIDEOS DE INSTAGRAM
              </h2>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                Controlá de forma dinámica los textos, fotos e historia de CultiShop y mantené actualizada la galería de publicaciones/reels de Instagram vinculados a tu cuenta oficial.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[#0a140d] border border-[#1f3b25] w-full xl:w-auto shrink-0 shadow-inner">
              <button
                type="button"
                onClick={() => setSubTabInstitucional('sobre-nosotros')}
                className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  subTabInstitucional === 'sobre-nosotros'
                    ? 'bg-[#2d5a27] text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-[#142619]'
                }`}
              >
                <FileText size={14} className="shrink-0" />
                <span className="truncate">Sobre Nosotros ({safeAboutSections.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSubTabInstitucional('instagram')}
                className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  subTabInstitucional === 'instagram'
                    ? 'bg-[#2d5a27] text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-[#142619]'
                }`}
              >
                <Instagram size={14} className="shrink-0" />
                <span className="truncate">Instagram ({safeInstagramVideos.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSubTabInstitucional('faq')}
                className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  subTabInstitucional === 'faq'
                    ? 'bg-[#2d5a27] text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-[#142619]'
                }`}
              >
                <HelpCircle size={14} className="shrink-0" />
                <span className="truncate">Preguntas FAQ ({safeFaqs.length})</span>
              </button>
            </div>
          </div>

          {/* SUB-PESTAÑA 1: BLOQUES DE "SOBRE NOSOTROS" */}
          {subTabInstitucional === 'sobre-nosotros' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0e1c12] border border-[#1f3b25]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-[#4aa036]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Bloques Narrativos Institucionales</h3>
                    <p className="text-xs text-gray-400">
                      Se muestran secuencialmente en la vista pública de CultiShop ordenados por su índice.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/sobre-nosotros"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#23422a] text-xs font-bold transition"
                  >
                    <ExternalLink size={14} />
                    <span>Ver Página Pública</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleOpenCreateAboutModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition shadow-md cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Crear Bloque</span>
                  </button>
                </div>
              </div>

              {loadingAboutSections ? (
                <div className="text-center py-16 bg-[#0e1c12] border border-[#1f3b25] rounded-2xl space-y-3">
                  <RefreshCw className="animate-spin text-[#4aa036] mx-auto" size={32} />
                  <p className="text-sm font-bold text-gray-300">Cargando bloques institucionales...</p>
                </div>
              ) : safeAboutSections.length === 0 ? (
                <div className="text-center py-16 bg-[#0e1c12] border border-[#1f3b25] rounded-2xl space-y-4">
                  <BookOpen className="text-gray-500 mx-auto" size={48} />
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">No hay bloques institucionales cargados</h4>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      Comienza creando el primer bloque de historia, valores o presentación para que tus clientes conozcan CultiShop.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenCreateAboutModal}
                    className="px-5 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    <span>Crear Primer Bloque</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {safeAboutSections.map((sec) => (
                    <div
                      key={sec.id}
                      className="bg-[#0e1c12] border border-[#1f3b25] hover:border-[#2d5a27] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition shadow-sm"
                    >
                      <div className="flex items-start gap-4 flex-grow min-w-0">
                        {/* Miniatura de imagen si existe */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-[#0a140d] border border-[#23422a] shrink-0 flex items-center justify-center">
                          {sec.image_url ? (
                            <img
                              src={sec.image_url}
                              alt={sec.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-500 text-[10px]">
                              <ImageIcon size={22} className="mb-1 text-gray-600" />
                              <span>Sin foto</span>
                            </div>
                          )}
                        </div>

                        {/* Texto y detalles */}
                        <div className="space-y-1 min-w-0 flex-grow">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold bg-[#142619] text-[#e0a96d] border border-[#23422a] px-2 py-0.5 rounded-md">
                              Orden #{sec.order_index ?? 0}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              sec.is_active !== false
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                                : 'bg-gray-800/60 text-gray-400 border-gray-600/40'
                            }`}>
                              {sec.is_active !== false ? '● Visible en Tienda' : '○ Oculto'}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white font-heading truncate">
                            {sec.title}
                          </h4>

                          {sec.subtitle && (
                            <p className="text-xs text-[#e0a96d] font-medium truncate">
                              {sec.subtitle}
                            </p>
                          )}

                          <p className="text-xs text-gray-400 line-clamp-2 max-w-3xl leading-relaxed">
                            {sec.content}
                          </p>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleAboutActive(sec)}
                          className={`p-2 rounded-xl border transition cursor-pointer ${
                            sec.is_active !== false
                              ? 'bg-[#142619] text-gray-400 hover:text-white border-[#23422a]'
                              : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                          }`}
                          title={sec.is_active !== false ? 'Ocultar bloque' : 'Hacer visible'}
                        >
                          {sec.is_active !== false ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditAboutModal(sec)}
                          className="p-2 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-[#e0a96d] border border-[#23422a] transition cursor-pointer"
                          title="Editar bloque institucional"
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteAboutConfirmId(sec.id)}
                          className="p-2 rounded-xl bg-[#1a1414] hover:bg-red-950 text-gray-400 hover:text-red-400 border border-red-900/40 transition cursor-pointer"
                          title="Eliminar bloque"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Confirmación de eliminación inline */}
                      {deleteAboutConfirmId === sec.id && (
                        <div className="w-full mt-2 p-3 rounded-xl bg-red-950/50 border border-red-500/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                          <span className="text-red-200">
                            ¿Estás seguro de eliminar el bloque <strong>"{sec.title}"</strong>?
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setDeleteAboutConfirmId(null)}
                              className="px-3 py-1 rounded-lg bg-[#142619] hover:bg-[#1f3b25] text-gray-300 text-xs"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAboutSection(sec.id)}
                              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                            >
                              Confirmar Eliminación
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ============================================================ */}
              {/* TARJETA DE CONFIGURACIÓN DE UBICACIÓN & GOOGLE MAPS */}
              {/* ============================================================ */}
              <div className="mt-8 pt-8 border-t border-[#1f3b25] space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0e1c12] border border-[#1f3b25]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-[#e0a96d]">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Local Comercial & Mapa Interactivo de Google Maps</h3>
                      <p className="text-xs text-gray-400">
                        Configura la dirección de atención, horarios de retiro y el mapa interactivo que se muestra en la sección pública "Visítanos".
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/sobre-nosotros#visitanos"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#23422a] text-xs font-bold transition shrink-0"
                  >
                    <ExternalLink size={14} />
                    <span>Ver Sección en Tienda</span>
                  </Link>
                </div>

                <div className="bg-[#0e1c12] border border-[#1f3b25] rounded-2xl p-5 sm:p-6 space-y-6">
                  {/* Formulario de campos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dirección */}
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#e0a96d]" />
                        <span>Dirección Comercial del Local</span>
                      </label>
                      <input
                        type="text"
                        value={locAddress}
                        onChange={(e) => setLocAddress(e.target.value)}
                        placeholder='Ej: Av. López y Planes casi Lavalle ("adentro del ACUARIUM"), Posadas, Misiones'
                        className="w-full bg-[#122317] border border-[#23422a] focus:border-[#4aa036] rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm outline-none transition"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">Dirección visible para los compradores y punto de retiro.</p>
                    </div>

                    {/* Horarios */}
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Clock size={13} className="text-[#4aa036]" />
                        <span>Horarios de Atención al Público</span>
                      </label>
                      <input
                        type="text"
                        value={locHours}
                        onChange={(e) => setLocHours(e.target.value)}
                        placeholder="Ej: Lunes a Sábados de 9:00 a 13:00 y de 16:30 a 20:30 hs"
                        className="w-full bg-[#122317] border border-[#23422a] focus:border-[#4aa036] rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm outline-none transition"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">Días y franjas horarias en las que el local está abierto.</p>
                    </div>

                    {/* Teléfono / WhatsApp */}
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <PhoneCall size={13} className="text-[#25d366]" />
                        <span>Teléfono / WhatsApp de Contacto</span>
                      </label>
                      <input
                        type="text"
                        value={locPhone}
                        onChange={(e) => setLocPhone(e.target.value)}
                        placeholder="Ej: +54 9 376 435-6995"
                        className="w-full bg-[#122317] border border-[#23422a] focus:border-[#4aa036] rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm outline-none transition"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">Número de contacto directo con la tienda.</p>
                    </div>

                    {/* Enlace Directo Google Maps GPS */}
                    <div>
                      <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <ExternalLink size={13} className="text-[#e0a96d]" />
                        <span>Enlace de Navegación GPS (Cómo Llegar)</span>
                      </label>
                      <input
                        type="text"
                        value={locGoogleMapsUrl}
                        onChange={(e) => setLocGoogleMapsUrl(e.target.value)}
                        placeholder="Ej: https://maps.google.com/?q=Av.+López+y+Planes+y+Lavalle,+Posadas"
                        className="w-full bg-[#122317] border border-[#23422a] focus:border-[#4aa036] rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm outline-none transition"
                      />
                      <p className="text-[11px] text-gray-500 mt-1">URL directa para iniciar la navegación en Google Maps o Waze.</p>
                    </div>
                  </div>

                  {/* URL / Código iframe de Google Maps */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#4aa036]" />
                        <span>Código Iframe o URL Incrustada de Google Maps (Embed)</span>
                      </span>
                      <span className="text-[11px] text-gray-400 normal-case font-normal">
                        Detecta automáticamente si pegas el código <code className="text-[#e0a96d]">&lt;iframe&gt;</code> completo
                      </span>
                    </label>

                    <input
                      type="text"
                      value={locEmbedUrl}
                      onChange={(e) => handleEmbedUrlChange(e.target.value)}
                      placeholder="Pega la URL embed o el código completo <iframe src=... de Google Maps"
                      className="w-full bg-[#122317] border border-[#23422a] focus:border-[#4aa036] rounded-xl px-4 py-2.5 text-white text-xs sm:text-sm outline-none transition font-mono"
                    />

                    {extractedIframeNotice && (
                      <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 size={15} className="shrink-0" />
                        <span>¡Código &lt;iframe&gt; detectado! Se extrajo automáticamente la URL limpia de Google Maps.</span>
                      </div>
                    )}

                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      💡 <strong>¿Cómo obtenerlo?:</strong> En Google Maps, busca el local &gt; pulsa <em>Compartir</em> &gt; selecciona la pestaña <em>"Incorporar un mapa"</em> &gt; pulsa <em>"Copiar HTML"</em> y pégalo directamente en este campo.
                    </p>
                  </div>

                  {/* Vista Previa Interactiva en Vivo */}
                  <div className="space-y-2 pt-2 border-t border-[#18311d]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Vista Previa Interactiva en Vivo</span>
                      </span>
                      {locGoogleMapsUrl && (
                        <a
                          href={locGoogleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#e0a96d] hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          <span>Probar enlace GPS</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#23422a] bg-[#070e09] relative shadow-inner">
                      {locEmbedUrl ? (
                        <iframe
                          title="Vista previa del mapa de Google Maps"
                          src={locEmbedUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="w-full h-full block"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-xs p-6 text-center space-y-2">
                          <MapPin size={32} className="text-gray-600 mb-1" />
                          <span className="font-bold text-gray-400">Sin URL de mapa configurada</span>
                          <span className="text-gray-600 max-w-sm">
                            Ingresa una URL de Google Maps para previsualizar aquí el mapa en tiempo real.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón Guardar */}
                  <div className="flex justify-end pt-3 border-t border-[#18311d]">
                    <button
                      type="button"
                      onClick={handleSaveLocationSettings}
                      disabled={isSavingLocation}
                      className="px-6 py-3 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg inline-flex items-center gap-2 cursor-pointer"
                    >
                      {isSavingLocation ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>Guardando Configuración...</span>
                        </>
                      ) : (
                        <>
                          <Save size={15} />
                          <span>Guardar Configuración de Ubicación y Mapa</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-PESTAÑA 2: VIDEOS Y REELS DE INSTAGRAM */}
          {subTabInstitucional === 'instagram' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0e1c12] border border-[#1f3b25]">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-[#e0a96d]">
                    <Instagram size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Galería de Videos y Publicaciones de Instagram</h3>
                    <p className="text-xs text-gray-400">
                      Aparecerán en la cuadrícula interactiva de "Sobre Nosotros" con enlaces directos a Instagram.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://instagram.com/culti.shopp"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#23422a] text-xs font-bold transition"
                  >
                    <Instagram size={14} />
                    <span>Ver @culti.shopp</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleOpenCreateInstagramModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition shadow-md cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Agregar Video</span>
                  </button>
                </div>
              </div>

              {loadingInstagramVideos ? (
                <div className="text-center py-16 bg-[#0e1c12] border border-[#1f3b25] rounded-2xl space-y-3">
                  <RefreshCw className="animate-spin text-[#4aa036] mx-auto" size={32} />
                  <p className="text-sm font-bold text-gray-300">Cargando publicaciones de Instagram...</p>
                </div>
              ) : safeInstagramVideos.length === 0 ? (
                <div className="text-center py-16 bg-[#0e1c12] border border-[#1f3b25] rounded-2xl space-y-4">
                  <Instagram className="text-gray-500 mx-auto" size={48} />
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">No hay publicaciones de Instagram cargadas</h4>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      Copia el enlace de tus reels o fotos de @culti.shopp para destacarlos en la galería de la tienda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenCreateInstagramModal}
                    className="px-5 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition inline-flex items-center gap-2"
                  >
                    <Plus size={16} />
                    <span>Agregar Primer Video</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {safeInstagramVideos.map((vid) => (
                    <div
                      key={vid.id}
                      className="bg-[#0e1c12] border border-[#1f3b25] hover:border-[#2d5a27] rounded-2xl overflow-hidden flex flex-col justify-between transition shadow-md group"
                    >
                      {/* Portada / Miniatura */}
                      <div className="h-44 relative bg-[#0a140d] overflow-hidden flex items-center justify-center">
                        {vid.thumbnail_url ? (
                          <img
                            src={vid.thumbnail_url}
                            alt={vid.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-500 p-4 text-center">
                            <Video size={32} className="text-[#e0a96d] mb-1 opacity-70" />
                            <span className="text-[10px]">CultiShop Instagram Reel</span>
                          </div>
                        )}

                        {/* Badges superiores */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-[#e0a96d] px-2 py-0.5 rounded-md border border-white/10">
                            #{vid.order_index ?? 0}
                          </span>
                        </div>

                        <div className="absolute top-2.5 right-2.5">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border ${
                            vid.is_active !== false
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                              : 'bg-black/80 text-gray-400 border-gray-600/50'
                          }`}>
                            {vid.is_active !== false ? '● Visible' : '○ Oculto'}
                          </span>
                        </div>

                        {/* Ícono de Instagram / Play central */}
                        <a
                          href={vid.post_url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/30 hover:bg-black/10 flex items-center justify-center transition"
                          title="Abrir en Instagram"
                        >
                          <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:scale-110 transition shadow-lg">
                            <Play size={18} className="fill-current translate-x-0.5 text-[#e0a96d]" />
                          </div>
                        </a>
                      </div>

                      {/* Info y Pie */}
                      <div className="p-3.5 space-y-2 flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                            {vid.title || 'Video CultiShop @culti.shopp'}
                          </h4>
                          <a
                            href={vid.post_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-[#e0a96d] hover:underline flex items-center gap-1 mt-1 truncate"
                          >
                            <ExternalLink size={11} className="shrink-0" />
                            <span className="truncate">{vid.post_url}</span>
                          </a>
                        </div>

                        {/* Botones de acción */}
                        <div className="pt-2 border-t border-[#18311d] flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleInstagramActive(vid)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                              vid.is_active !== false
                                ? 'bg-[#142619] text-gray-400 hover:text-white border-[#23422a]'
                                : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                            }`}
                          >
                            {vid.is_active !== false ? <EyeOff size={12} /> : <Eye size={12} />}
                            <span>{vid.is_active !== false ? 'Ocultar' : 'Mostrar'}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditInstagramModal(vid)}
                              className="p-1.5 rounded-lg bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-[#e0a96d] border border-[#23422a] transition cursor-pointer"
                              title="Editar publicación"
                            >
                              <Edit size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteInstagramConfirmId(vid.id)}
                              className="p-1.5 rounded-lg bg-[#1a1414] hover:bg-red-950 text-gray-400 hover:text-red-400 border border-red-900/40 transition cursor-pointer"
                              title="Eliminar publicación"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Confirmación de eliminación inline */}
                        {deleteInstagramConfirmId === vid.id && (
                          <div className="mt-2 p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 space-y-2 text-xs">
                            <span className="text-red-200 block text-[11px]">
                              ¿Eliminar este video de Instagram?
                            </span>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setDeleteInstagramConfirmId(null)}
                                className="px-2.5 py-1 rounded bg-[#142619] text-gray-300 text-[10px]"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteInstagramVideo(vid.id)}
                                className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-[10px]"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-PESTAÑA 3: PREGUNTAS FRECUENTES (FAQ) */}
          {subTabInstitucional === 'faq' && (
            <div className="space-y-4">
              {renderFaqSectionContent()}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SECCIÓN 7: GESTIÓN DE PREGUNTAS FRECUENTES (FAQ) */}
      {/* ============================================================ */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e0a96d] mb-1">
                <HelpCircle size={15} />
                <span>Gestión de Preguntas Frecuentes</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
                PREGUNTAS FRECUENTES (FAQ)
              </h2>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                Controlá de forma dinámica las preguntas y respuestas públicas sobre envíos, medios de pago, sustratos, fertilizantes y normativa legal Reprocann (Ley 27.350).
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateFaqModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition shadow-md cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>Nueva Pregunta</span>
            </button>
          </div>

          {renderFaqSectionContent()}
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

                  {/* Etiqueta Promocional (Badge) y Tipo */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-gray-300">
                          Etiqueta Promocional (Badge)
                        </label>
                        {formBadge && (
                          <button
                            type="button"
                            onClick={() => setFormBadge('')}
                            className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
                          >
                            Quitar etiqueta (Sin etiqueta)
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={
                            !formBadge
                              ? 'none'
                              : ['STOCK DISPONIBLE', 'TOP VENTAS', 'LEY 27.350', 'OFERTA ESPECIAL', 'NUEVO INGRESO', 'SIN STOCK'].includes(formBadge.toUpperCase())
                                ? formBadge.toUpperCase()
                                : 'custom'
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'none') {
                              setFormBadge('');
                            } else if (val === 'STOCK DISPONIBLE') {
                              setFormBadge('STOCK DISPONIBLE');
                              setFormBadgeType('gold');
                            } else if (val === 'TOP VENTAS') {
                              setFormBadge('TOP VENTAS');
                              setFormBadgeType('gold');
                            } else if (val === 'LEY 27.350') {
                              setFormBadge('LEY 27.350');
                              setFormBadgeType('green');
                            } else if (val === 'OFERTA ESPECIAL') {
                              setFormBadge('OFERTA ESPECIAL');
                              setFormBadgeType('gold');
                            } else if (val === 'NUEVO INGRESO') {
                              setFormBadge('NUEVO INGRESO');
                              setFormBadgeType('green');
                            } else if (val === 'SIN STOCK') {
                              setFormBadge('SIN STOCK');
                              setFormBadgeType('red');
                            }
                          }}
                          className="w-full px-3 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] transition cursor-pointer"
                        >
                          <option value="none">Sin etiqueta (Ninguna)</option>
                          <option value="STOCK DISPONIBLE">STOCK DISPONIBLE</option>
                          <option value="TOP VENTAS">TOP VENTAS</option>
                          <option value="LEY 27.350">LEY 27.350</option>
                          <option value="OFERTA ESPECIAL">OFERTA ESPECIAL</option>
                          <option value="NUEVO INGRESO">NUEVO INGRESO</option>
                          <option value="SIN STOCK">SIN STOCK (Agotado)</option>
                          <option value="custom">Personalizada / Otro texto...</option>
                        </select>

                        <input
                          type="text"
                          value={formBadge}
                          onChange={(e) => setFormBadge(e.target.value)}
                          placeholder="Texto personalizado o vacío"
                          className={`w-full px-3 py-2.5 rounded-xl border text-xs outline-none transition ${
                            formBadge.toUpperCase() === 'SIN STOCK'
                              ? 'bg-red-950/30 border-red-500/80 text-red-200 font-bold'
                              : !formBadge
                                ? 'bg-[#0a140d] border-[#1f3b25] text-gray-400 placeholder:italic'
                                : 'bg-[#142619] border-[#23422a] text-white focus:border-[#4aa036]'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Color Etiqueta
                      </label>
                      <select
                        value={formBadgeType}
                        onChange={(e) => setFormBadgeType(e.target.value)}
                        disabled={!formBadge}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition cursor-pointer ${
                          !formBadge
                            ? 'bg-[#0a140d] border-[#1f3b25] text-gray-500 cursor-not-allowed'
                            : 'bg-[#142619] border-[#23422a] text-white focus:border-[#4aa036]'
                        }`}
                      >
                        <option value="gold">Dorado Mostaza</option>
                        <option value="green">Verde Hoja</option>
                        <option value="red">Rojo (Sin Stock / Alerta)</option>
                      </select>
                    </div>
                  </div>

                  {/* Gestor de Medidas, Precios y Stock Independientes (Estándar Obligatorio) */}
                  <div className="p-4 rounded-2xl bg-[#0a140d] border border-[#1f3b25] space-y-3.5 shadow-inner">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1b3420]">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="block text-xs font-bold text-white uppercase tracking-wider">
                            Medidas, Precios y Stock Independiente *
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#183520] text-[#4aa036] border border-[#2d5a27]">
                            Estándar Obligatorio
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Configura cada presentación con su precio y stock. El precio publicado y el stock total se calculan automáticamente.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#183520] hover:bg-[#234b2d] text-[#e0a96d] text-xs font-bold border border-[#2d5a27] transition cursor-pointer self-start sm:self-auto shrink-0 shadow-sm"
                      >
                        <Plus size={14} />
                        <span>Agregar Medida</span>
                      </button>
                    </div>

                    {/* Resumen en tiempo real del Precio y Stock Calculados */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#122317] border border-[#23422a]">
                      <div className="flex items-center justify-between sm:justify-start gap-2.5">
                        <span className="text-[11px] text-gray-400 font-medium">Precio Calculado:</span>
                        <span className="text-xs font-black text-[#e0a96d] font-heading bg-[#0a140d] px-2.5 py-1 rounded-lg border border-[#1f3b25]">
                          {computedVariantSummary.priceText}
                        </span>
                      </div>

                      <div className="flex items-center justify-between sm:justify-start gap-2.5">
                        <span className="text-[11px] text-gray-400 font-medium">Stock Total Calculado:</span>
                        <span className={`text-xs font-black font-heading px-2.5 py-1 rounded-lg border ${
                          computedVariantSummary.totalStock <= 0
                            ? 'bg-red-950/40 text-red-400 border-red-500/50'
                            : 'bg-[#0a140d] text-[#4aa036] border-[#1f3b25]'
                        }`}>
                          {computedVariantSummary.totalStock <= 0 
                            ? '0 unidades (Sin Stock ⚠️)' 
                            : `${computedVariantSummary.totalStock} unidades`}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-gray-400 uppercase px-2 hidden sm:grid">
                        <span className="col-span-5">Medida / Presentación</span>
                        <span className="col-span-3">Precio ($)</span>
                        <span className="col-span-3">Stock (Unidades)</span>
                        <span className="col-span-1 text-right">Acción</span>
                      </div>

                      {formVariants.map((variant, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-[#122317] p-2.5 rounded-xl border border-[#1f3b25] items-center">
                          <div className="sm:col-span-5">
                            <label className="text-[10px] text-gray-400 sm:hidden block mb-0.5">Medida</label>
                            <input
                              type="text"
                              required
                              value={variant.name}
                              onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                              placeholder="Ej: 100 ml, 500 ml"
                              className="w-full px-3 py-2 rounded-lg bg-[#0a140d] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-gray-400 sm:hidden block mb-0.5">Precio</label>
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

                          <div className="sm:col-span-3">
                            <label className="text-[10px] text-gray-400 sm:hidden block mb-0.5">Stock</label>
                            <input
                              type="number"
                              min="0"
                              required
                              value={variant.stock !== undefined ? variant.stock : '10'}
                              onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                              placeholder="Stock"
                              className="w-full px-3 py-2 rounded-lg bg-[#0a140d] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                            />
                          </div>

                          <div className="sm:col-span-1 flex justify-end">
                            <button
                              type="button"
                              disabled={formVariants.length <= 1}
                              onClick={() => handleRemoveVariant(idx)}
                              title={formVariants.length <= 1 ? "Mínimo 1 opción requerida" : "Eliminar esta presentación"}
                              className="p-2 rounded-lg bg-[#1a1414] hover:bg-red-950 text-gray-400 hover:text-red-400 border border-red-900/40 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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
                              className="w-full h-full object-contain p-1 bg-[#0b1610]"
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
                      <FileText size={16} className="text-[#e0a96d]" />
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
                          placeholder='Ej: Insumo frágil despachado con embalaje térmico y cámara de aire. Disponible para retiro inmediato sin costo en nuestro local de Av. López y Planes casi Lavalle ("adentro del ACUARIUM"), Posadas, Misiones.'
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
                      handleImageFileChange(
                        file, 
                        (dataUrl) => {
                          setRawBannerSourceImage(dataUrl);
                          setBannerFormImageUrl(dataUrl);
                          setIsBannerCropperOpen(true);
                        }, 
                        setBannerImageFileName
                      );
                    }
                  }}
                />

                {!bannerFormImageUrl ? (
                  <div className="space-y-3">
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
                          Haz clic aquí para examinar archivos. Se abrirá la herramienta de ajuste de zoom y encuadre.
                        </span>
                      </div>
                      <span className="px-3.5 py-1 rounded-full bg-[#1e3c25] text-[#e0a96d] text-[10px] font-bold uppercase tracking-wider">
                        Examinar Archivos
                      </span>
                    </div>

                    {/* Opción alternativa por URL web directa */}
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={bannerFormImageUrl.startsWith('data:') ? '' : bannerFormImageUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBannerFormImageUrl(val);
                          setRawBannerSourceImage(val);
                          if (val) setBannerImageFileName('Imagen desde enlace web');
                        }}
                        placeholder="O ingresá una URL web directa (https://...)"
                        className="flex-grow bg-[#07110a] border border-[#23422a] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#4aa036]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Vista previa panorámica interactiva con proporción exacta 16:5 */}
                    <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden border-2 border-[#2d5a27] bg-[#0b1610] shadow-inner group">
                      <img
                        src={bannerFormImageUrl}
                        alt="Vista previa banner"
                        className="w-full h-full object-cover object-center"
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

                      {/* Botón flotante para reajustar zoom y encuadre */}
                      <button
                        type="button"
                        onClick={() => setIsBannerCropperOpen(true)}
                        className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-black/85 hover:bg-[#1a3821] text-[#e0a96d] hover:text-white border border-[#e0a96d]/60 text-xs font-bold transition flex items-center gap-1.5 shadow-xl backdrop-blur-md cursor-pointer group-hover:scale-105"
                      >
                        <Sliders size={13} className="text-[#e0a96d]" />
                        <span>Ajustar Zoom y Encuadre</span>
                      </button>
                    </div>

                    {/* Barra de herramientas y controles del banner */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-[#0a140d] rounded-2xl border border-[#1f3b25] gap-3 text-xs">
                      <div className="flex items-center gap-2 text-gray-300 truncate mr-2">
                        <CheckCircle2 size={16} className="text-[#25d366] shrink-0" />
                        <div className="truncate">
                          <span className="truncate text-xs font-semibold block text-white">
                            {bannerImageFileName || 'Imagen panorámica seleccionada'}
                          </span>
                          <span className="text-[10px] text-[#e0a96d]">
                            Lista para publicación o encuadre interactivo
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setIsBannerCropperOpen(true)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#1b3621] to-[#254b2d] hover:from-[#23482c] hover:to-[#2e5d37] text-[#e0a96d] hover:text-white text-xs font-bold border border-[#e0a96d]/50 transition flex items-center gap-1.5 cursor-pointer shadow-md"
                          title="Abrir herramienta interactiva de zoom y encuadre"
                        >
                          <Sliders size={13} />
                          <span>Ajustar Encuadre</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => bannerFileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white text-xs font-semibold border border-[#23422a] transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Upload size={13} />
                          <span>Cambiar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBannerFormImageUrl('');
                            setRawBannerSourceImage('');
                            setBannerImageFileName('');
                            if (bannerFileInputRef.current) bannerFileInputRef.current.value = '';
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-semibold border border-red-900/40 transition flex items-center gap-1 cursor-pointer"
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
      {/* MODAL INTERACTIVO DE ENCUADRE Y ZOOM DE BANNER                */}
      {/* ============================================================ */}
      <BannerCropperModal
        isOpen={isBannerCropperOpen}
        imageUrl={rawBannerSourceImage || bannerFormImageUrl}
        title={bannerFormTitle}
        subtitle={bannerFormSubtitle}
        buttonText={bannerFormButtonText}
        showText={bannerFormShowText}
        onClose={() => setIsBannerCropperOpen(false)}
        onApply={(croppedDataUrl) => {
          setBannerFormImageUrl(croppedDataUrl);
          showNotification('success', '¡Encuadre y zoom del banner aplicados con éxito!');
        }}
      />

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

      {/* ============================================================ */}
      {/* MODAL PARA CREAR / EDITAR CATEGORÍA O SUBCATEGORÍA            */}
      {/* ============================================================ */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-[#0e1c12] border border-[#1f3b25] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
            {/* Acento dorado superior */}
            <div className="h-1.5 bg-gradient-to-r from-[#2d5a27] via-[#e0a96d] to-[#2d5a27]" />

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1f3b25]">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-[#142619] text-[#e0a96d]">
                    <FolderTree size={20} />
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-white font-heading">
                      {editingCategory
                        ? (editingCategory.parent_id ? 'Modificar Subcategoría' : 'Modificar Categoría Principal')
                        : (categoryFormParentId ? 'Nueva Subcategoría' : 'Nueva Categoría Principal')}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {editingCategory ? 'Actualiza los datos y asignación jerárquica' : 'Define el nombre, slug y orden en el menú'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-1.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                {/* Selector de Nivel Jerárquico: Principal vs Subcategoría */}
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1.5 block">
                    Nivel de Categoría
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={Boolean(editingCategory && editingCategory.subcategories && editingCategory.subcategories.length > 0)}
                      onClick={() => {
                        setCategoryFormParentId('');
                        if (!editingCategory) {
                          setCategoryFormOrder(String(adminCategories.length + 1));
                        }
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                        categoryFormParentId === ''
                          ? 'bg-[#2d5a27] text-white border-[#4aa036] shadow-sm'
                          : 'bg-[#142619] text-gray-400 border-[#23422a] hover:text-white'
                      } ${Boolean(editingCategory && editingCategory.subcategories && editingCategory.subcategories.length > 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <FolderTree size={14} />
                      <span>Categoría Principal</span>
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(editingCategory && editingCategory.subcategories && editingCategory.subcategories.length > 0)}
                      onClick={() => {
                        const fallbackParent = adminCategories.find(c => c.id !== editingCategory?.id)?.id || '';
                        setCategoryFormParentId(fallbackParent ? String(fallbackParent) : '');
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                        categoryFormParentId !== ''
                          ? 'bg-[#2d5a27] text-white border-[#4aa036] shadow-sm'
                          : 'bg-[#142619] text-gray-400 border-[#23422a] hover:text-white'
                      } ${Boolean(editingCategory && editingCategory.subcategories && editingCategory.subcategories.length > 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Tag size={14} />
                      <span>Subcategoría</span>
                    </button>
                  </div>
                  {Boolean(editingCategory && editingCategory.subcategories && editingCategory.subcategories.length > 0) && (
                    <span className="text-[10px] text-amber-400 mt-1 block">
                      ⚠️ Esta categoría contiene subcategorías hijas asociadas y debe permanecer como categoría principal.
                    </span>
                  )}
                </div>

                {/* Si es subcategoría: Selector de Categoría Padre */}
                {categoryFormParentId !== '' && (
                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1.5 block">
                      Categoría Padre Asociada *
                    </label>
                    <select
                      value={categoryFormParentId}
                      onChange={(e) => setCategoryFormParentId(e.target.value)}
                      required
                      className="w-full py-2.5 px-3 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs focus:outline-none focus:border-[#4aa036]"
                    >
                      <option value="">-- Seleccionar Categoría Principal --</option>
                      {adminCategories
                        .filter(c => !editingCategory || c.id !== editingCategory.id)
                        .map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Nombre de la Categoría */}
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1.5 block">
                    Nombre de la Categoría / Subcategoría *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryFormName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategoryFormName(val);
                      if (isAutoSlug) {
                        setCategoryFormSlug(clientSlugify(val));
                      }
                    }}
                    placeholder="Ej. Fertilizantes, Lavado de Raíces, Iluminación..."
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#4aa036]"
                  />
                </div>

                {/* Slug URL amigable */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-gray-300">
                      Slug URL Amigable *
                    </label>
                    <span className="text-[10px] text-gray-400">
                      Identificador único en la URL
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={categoryFormSlug}
                    onChange={(e) => {
                      setIsAutoSlug(false);
                      setCategoryFormSlug(clientSlugify(e.target.value));
                    }}
                    placeholder="ej-nombre-categoria"
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#142619] border border-[#23422a] text-[#e0a96d] font-mono text-xs focus:outline-none focus:border-[#4aa036]"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block font-mono">
                    Vista previa enlace:{' '}
                    <span className="text-[#e0a96d]">
                      {categoryFormParentId !== ''
                        ? `/categoria/${adminCategories.find(c => String(c.id) === String(categoryFormParentId))?.slug || 'categoria'}/${categoryFormSlug || 'subcategoria'}`
                        : `/categoria/${categoryFormSlug || 'categoria'}`}
                    </span>
                  </span>
                </div>

                {/* Orden de visualización y Visibilidad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1.5 block">
                      Orden de Visualización (#)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={categoryFormOrder}
                      onChange={(e) => setCategoryFormOrder(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs focus:outline-none focus:border-[#4aa036]"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Posición relativa en la barra</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1.5 block">
                      Estado en Tienda Pública
                    </label>
                    <button
                      type="button"
                      onClick={() => setCategoryFormIsVisible(!categoryFormIsVisible)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                        categoryFormIsVisible
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                          : 'bg-gray-800 text-gray-400 border-gray-600/50'
                      }`}
                    >
                      {categoryFormIsVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                      <span>{categoryFormIsVisible ? 'Visible en Tienda' : 'Oculta en Tienda'}</span>
                    </button>
                    <span className="text-[10px] text-gray-500 mt-1 block">Visible en Navbar y filtros</span>
                  </div>
                </div>

                {/* Descripción Opcional */}
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1.5 block">
                    Descripción / Notas (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={categoryFormDescription}
                    onChange={(e) => setCategoryFormDescription(e.target.value)}
                    placeholder="Breve detalle sobre los insumos de esta categoría..."
                    className="w-full py-2 px-3 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#4aa036] resize-none"
                  />
                </div>

                {/* Botones de Acción */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1f3b25]">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingCategory}
                    className="px-5 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    {isSavingCategory ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>{editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR CATEGORÍA                 */}
      {/* ============================================================ */}
      {isDeleteCategoryModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0e1c12] border-2 border-red-600/50 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 size={24} />
            </div>

            <h3 className="text-xl font-black text-white font-heading">
              ¿Eliminar "{categoryToDelete.name}"?
            </h3>

            <div className="space-y-2 text-left bg-[#142619] border border-[#23422a] p-4 rounded-2xl text-xs">
              {categoryToDelete.subcategories && categoryToDelete.subcategories.length > 0 && (
                <div className="flex items-start gap-2 text-amber-300">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    Contiene <strong>{categoryToDelete.subcategories.length} subcategorías dependientes</strong> que también serán eliminadas.
                  </span>
                </div>
              )}

              {(Number(categoryToDelete.total_products_count) > 0 || Number(categoryToDelete.products_count) > 0) ? (
                <div className="flex items-start gap-2 text-gray-300">
                  <Package size={15} className="shrink-0 mt-0.5 text-[#e0a96d]" />
                  <span>
                    Hay <strong>{categoryToDelete.total_products_count || categoryToDelete.products_count} producto(s) vinculado(s)</strong>. Los productos <strong>no se borrarán</strong>, pero quedarán sin categoría asignada en el catálogo para su posterior reclasificación.
                  </span>
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  Esta categoría no tiene productos asociados y será removida de forma segura.
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400">
              Esta acción actualizará la barra de navegación pública y los menús desplegables inmediatamente.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteCategoryModalOpen(false);
                  setCategoryToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingCategory}
                onClick={handleConfirmDeleteCategory}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isDeletingCategory ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Confirmar Eliminación</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PARA CREAR / EDITAR BLOQUE "SOBRE NOSOTROS" */}
      {/* ============================================================ */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0e1c12] border-2 border-[#2d5a27] rounded-3xl p-5 sm:p-7 shadow-2xl my-6 flex flex-col max-h-[92vh]">
            <div className="flex items-start justify-between pb-3 border-b border-[#1f3b25] shrink-0">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  aboutModalMode === 'create' ? 'bg-[#2d5a27] text-white' : 'bg-[#e0a96d]/20 text-[#e0a96d] border border-[#e0a96d]/40'
                }`}>
                  {aboutModalMode === 'create' ? 'Nuevo Bloque' : 'Editar Bloque'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-heading mt-1">
                  {aboutModalMode === 'create' ? 'Crear Bloque "Sobre Nosotros"' : 'Modificar Bloque Institucional'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAboutModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#142619] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAboutSection} className="space-y-4 py-4 overflow-y-auto pr-1 flex-grow">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Título del Bloque *
                </label>
                <input
                  type="text"
                  required
                  value={aboutFormTitle}
                  onChange={(e) => setAboutFormTitle(e.target.value)}
                  placeholder="Ej: Nuestra Historia & Pasión por el Cultivo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Subtítulo o Destacado (Opcional)
                </label>
                <input
                  type="text"
                  value={aboutFormSubtitle}
                  onChange={(e) => setAboutFormSubtitle(e.target.value)}
                  placeholder="Ej: Desde Posadas hacia toda la región"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Contenido / Texto Explicativo *
                </label>
                <textarea
                  rows={5}
                  required
                  value={aboutFormContent}
                  onChange={(e) => setAboutFormContent(e.target.value)}
                  placeholder="Describe la historia, propuesta de valor, asesoramiento técnico o compromiso institucional de CultiShop..."
                  className="w-full p-3.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] resize-none"
                />
              </div>

              {/* Selector de Imagen (Local o URL) */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#0a140d] border border-[#1f3b25]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide">
                    Imagen Ilustrativa del Bloque (Opcional)
                  </label>
                  {aboutFormImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAboutFormImageUrl('');
                        setAboutImageFileName('');
                      }}
                      className="text-xs text-red-400 hover:text-red-300 transition flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <X size={13} />
                      <span>Quitar imagen</span>
                    </button>
                  )}
                </div>
                <input
                  ref={aboutFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageFileChange(file, setAboutFormImageUrl, setAboutImageFileName);
                    }
                  }}
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Vista previa con proporción estética */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl bg-[#142619] border border-[#23422a] overflow-hidden flex items-center justify-center relative shadow-inner">
                    {aboutFormImageUrl ? (
                      <img src={aboutFormImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-500 text-center px-2 leading-tight">Sin imagen asignada</span>
                    )}
                  </div>

                  {/* Campo de URL y Botones de acción */}
                  <div className="flex-1 w-full space-y-2.5">
                    <input
                      type="url"
                      value={aboutFormImageUrl}
                      onChange={(e) => setAboutFormImageUrl(e.target.value)}
                      placeholder="Insertar URL directa (https://...) o subir archivo..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => aboutFileInputRef.current?.click()}
                        className="py-2.5 px-3 rounded-xl bg-[#183520] hover:bg-[#234b2d] text-[#e0a96d] border border-[#2d5a27] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
                      >
                        <Upload size={14} className="shrink-0" />
                        <span className="truncate">{aboutImageFileName ? `Archivo: ${aboutImageFileName}` : 'Subir imagen local'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAboutFormImageUrl('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1200');
                          setAboutImageFileName('cultivo_oficial.jpg');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 border border-[#23422a] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm"
                        title="Cargar foto institucional recomendada"
                      >
                        <ImageIcon size={14} className="shrink-0 text-[#e0a96d]" />
                        <span className="truncate">Imagen por defecto</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={aboutFormOrder}
                    onChange={(e) => setAboutFormOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                  />
                </div>

                <div className="sm:self-end">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-300 cursor-pointer bg-[#0a140d] px-3.5 py-2.5 rounded-xl border border-[#1f3b25] hover:border-[#2d5a27] transition">
                    <input
                      type="checkbox"
                      checked={aboutFormIsActive}
                      onChange={(e) => setAboutFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#4aa036] focus:ring-0 bg-[#142619] border-[#23422a] cursor-pointer"
                    />
                    <span>Bloque Visible en la Tienda Pública</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1f3b25] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAboutModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#23422a] text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingAbout}
                  className="px-6 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Save size={15} />
                  <span>{isSavingAbout ? 'Guardando...' : (aboutModalMode === 'edit' ? 'Guardar Cambios' : 'Guardar Bloque')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL PARA AGREGAR / EDITAR VIDEO DE INSTAGRAM */}
      {/* ============================================================ */}
      {isInstagramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#0e1c12] border-2 border-[#2d5a27] rounded-3xl p-5 sm:p-7 shadow-2xl my-6 flex flex-col max-h-[92vh]">
            <div className="flex items-start justify-between pb-3 border-b border-[#1f3b25] shrink-0">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  instagramModalMode === 'create' ? 'bg-[#2d5a27] text-white' : 'bg-[#e0a96d]/20 text-[#e0a96d] border border-[#e0a96d]/40'
                }`}>
                  {instagramModalMode === 'create' ? 'Nueva Publicación' : 'Editar Publicación'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-heading mt-1">
                  {instagramModalMode === 'create' ? 'Agregar Video / Reel de Instagram' : 'Modificar Publicación de Instagram'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInstagramModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#142619] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveInstagramVideo} className="space-y-4 py-4 overflow-y-auto pr-1 flex-grow">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Enlace de Instagram (URL del Reel, Post o Video) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">
                    <Instagram size={14} />
                  </span>
                  <input
                    type="url"
                    required
                    value={instagramFormPostUrl}
                    onChange={(e) => setInstagramFormPostUrl(e.target.value)}
                    placeholder="https://www.instagram.com/reel/C..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Pega el link directo copiado desde Instagram al compartir el video o reel.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Título o Pie de Foto Descriptivo
                </label>
                <input
                  type="text"
                  value={instagramFormTitle}
                  onChange={(e) => setInstagramFormTitle(e.target.value)}
                  placeholder="Ej: Cómo fertilizar en floración con Namasté"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                />
              </div>

              {/* Selector de Miniatura */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#0a140d] border border-[#1f3b25]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide">
                    Imagen de Portada / Miniatura (Thumbnail)
                  </label>
                  {instagramFormThumbnailUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setInstagramFormThumbnailUrl('');
                        setInstagramThumbnailFileName('');
                      }}
                      className="text-xs text-red-400 hover:text-red-300 transition flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <X size={13} />
                      <span>Quitar portada</span>
                    </button>
                  )}
                </div>
                <input
                  ref={instagramFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageFileChange(file, setInstagramFormThumbnailUrl, setInstagramThumbnailFileName);
                    }
                  }}
                />

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Vista previa con proporción estética */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-xl bg-[#142619] border border-[#23422a] overflow-hidden flex items-center justify-center relative shadow-inner">
                    {instagramFormThumbnailUrl ? (
                      <img src={instagramFormThumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500 p-2 text-center">
                        <Video size={22} className="mb-1 text-gray-600" />
                        <span className="text-[10px] leading-tight">Sin portada</span>
                      </div>
                    )}
                  </div>

                  {/* Campo de URL y Botones de acción */}
                  <div className="flex-1 w-full space-y-2.5">
                    <input
                      type="url"
                      value={instagramFormThumbnailUrl}
                      onChange={(e) => setInstagramFormThumbnailUrl(e.target.value)}
                      placeholder="Insertar URL directa (https://...) o subir archivo..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => instagramFileInputRef.current?.click()}
                        className="py-2.5 px-3 rounded-xl bg-[#183520] hover:bg-[#234b2d] text-[#e0a96d] border border-[#2d5a27] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-sm"
                      >
                        <Upload size={14} className="shrink-0" />
                        <span className="truncate">{instagramThumbnailFileName ? `Archivo: ${instagramThumbnailFileName}` : 'Subir portada local'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setInstagramFormThumbnailUrl('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800');
                          setInstagramThumbnailFileName('portada_cultishop.jpg');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 border border-[#23422a] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm"
                        title="Cargar portada temática por defecto"
                      >
                        <ImageIcon size={14} className="shrink-0 text-[#e0a96d]" />
                        <span className="truncate">Portada por defecto</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Orden de Cuadrícula
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={instagramFormOrder}
                    onChange={(e) => setInstagramFormOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                  />
                </div>

                <div className="sm:self-end">
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-300 cursor-pointer bg-[#0a140d] px-3.5 py-2.5 rounded-xl border border-[#1f3b25] hover:border-[#2d5a27] transition">
                    <input
                      type="checkbox"
                      checked={instagramFormIsActive}
                      onChange={(e) => setInstagramFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#4aa036] focus:ring-0 bg-[#142619] border-[#23422a] cursor-pointer"
                    />
                    <span>Publicación Visible en la Galería</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1f3b25] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsInstagramModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#23422a] text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingInstagram}
                  className="px-6 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Save size={15} />
                  <span>{isSavingInstagram ? 'Guardando...' : (instagramModalMode === 'edit' ? 'Guardar Cambios' : 'Guardar Video')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ============================================================ */}
      {/* MODAL PARA CREAR / MODIFICAR PREGUNTAS FRECUENTES (FAQ) */}
      {/* ============================================================ */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0e1c12] border-2 border-[#2d5a27] rounded-3xl p-5 sm:p-7 shadow-2xl my-6 flex flex-col max-h-[92vh]">
            <div className="flex items-start justify-between pb-3 border-b border-[#1f3b25] shrink-0">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  faqModalMode === 'create' ? 'bg-[#2d5a27] text-white' : 'bg-[#e0a96d]/20 text-[#e0a96d] border border-[#e0a96d]/40'
                }`}>
                  {faqModalMode === 'create' ? 'Nueva Pregunta' : 'Editar Pregunta'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-heading mt-1">
                  {faqModalMode === 'create' ? 'Crear Pregunta Frecuente' : 'Modificar Pregunta Frecuente'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#142619] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4 py-4 overflow-y-auto pr-1 flex-grow">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Pregunta Frecuente *
                </label>
                <input
                  type="text"
                  value={faqFormQuestion}
                  onChange={(e) => setFaqFormQuestion(e.target.value)}
                  placeholder="Ej: ¿Cuáles son las formas de envío en Posadas?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={faqFormCategory}
                    onChange={(e) => setFaqFormCategory(e.target.value)}
                    list="faq-category-suggestions"
                    placeholder="Ej: Compras & Pagos, Envíos..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                  />
                  <datalist id="faq-category-suggestions">
                    <option value="Compras & Pagos" />
                    <option value="Envíos & Entregas" />
                    <option value="Local & Horarios" />
                    <option value="Cultivo & Insumos" />
                    <option value="Cultivo & Normativa" />
                    <option value="Asesoramiento" />
                    <option value="General" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={faqFormOrder}
                    onChange={(e) => setFaqFormOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Respuesta Detallada *
                </label>
                <textarea
                  rows={6}
                  value={faqFormAnswer}
                  onChange={(e) => setFaqFormAnswer(e.target.value)}
                  placeholder="Escribe la respuesta clara que resolverá la inquietud de los cultivadores..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] resize-none leading-relaxed"
                  required
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-300 cursor-pointer bg-[#0a140d] px-3.5 py-2.5 rounded-xl border border-[#1f3b25] hover:border-[#2d5a27] transition">
                  <input
                    type="checkbox"
                    checked={faqFormIsActive}
                    onChange={(e) => setFaqFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4aa036] focus:ring-0 bg-[#142619] border-[#23422a] cursor-pointer"
                  />
                  <span>Pregunta Activa y Visible en la Tienda (/faq)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1f3b25] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#23422a] text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingFaq}
                  className="px-6 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Save size={15} />
                  <span>{isSavingFaq ? 'Guardando...' : (faqModalMode === 'edit' ? 'Guardar Cambios' : 'Guardar Pregunta')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
