import React, { useState, useEffect } from 'react';
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
  Droplets,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api';
import { formatPrice, parsePrice, useShop } from '../context/ShopContext';
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
  const [formOptions, setFormOptions] = useState('100 cc, 250 cc, 500 cc');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

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
  const activeCategoryData = categories.find(
    (c) =>
      c.name.toLowerCase() === formCategory.toLowerCase() ||
      c.slug.toLowerCase() === formCategory.toLowerCase()
  );
  const activeSubcategories = activeCategoryData?.subcategories || [];

  // Cambio de Categoría Principal en el formulario
  const handleCategoryChange = (newCatName) => {
    setFormCategory(newCatName);
    const newCatObj = categories.find(
      (c) =>
        c.name.toLowerCase() === newCatName.toLowerCase() ||
        c.slug.toLowerCase() === newCatName.toLowerCase()
    );
    const newSubs = newCatObj?.subcategories || [];
    const isCurrentSubValid = newSubs.some(
      (s) =>
        s.name.toLowerCase() === formSubcategory.toLowerCase() ||
        s.slug.toLowerCase() === formSubcategory.toLowerCase()
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

  useEffect(() => {
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

  // Abrir Modal para Crear Producto
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCurrentProduct(null);
    setFormTitle('');
    setFormDescription('');
    setFormPrice('14500');
    setFormStock('20');
    const firstCat = categories[0]?.name || 'Fertilizantes';
    setFormCategory(firstCat);
    setFormSubcategory('');
    setFormImageUrl('https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&q=80&w=600');
    setFormBadge('STOCK DISPONIBLE');
    setFormBadgeType('gold');
    setFormOptions('100 cc, 250 cc, 500 cc');
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
    setFormBadge(prod.badge || 'STOCK DISPONIBLE');
    setFormBadgeType(prod.badge_type || prod.badgeType || 'gold');
    setFormOptions(Array.isArray(prod.options) ? prod.options.join(', ') : (prod.options || 'Estándar'));

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
    if (!formTitle || !formPrice) {
      showNotification('error', 'Por favor, completa el título y el precio del producto.');
      return;
    }

    setIsSavingProduct(true);
    const optionsArray = formOptions
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);

    // Resolver IDs de categoría y subcategoría según lo seleccionado
    const catObj = categories.find(
      c => c.name.toLowerCase() === formCategory.toLowerCase() ||
           c.slug.toLowerCase() === formCategory.toLowerCase()
    );
    const categoryId = catObj ? catObj.id : null;

    let subcategoryId = null;
    if (catObj && formSubcategory) {
      const subObj = catObj.subcategories?.find(
        s => s.name.toLowerCase() === formSubcategory.toLowerCase() ||
             s.slug.toLowerCase() === formSubcategory.toLowerCase()
      );
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
      price: parseFloat(formPrice.toString().replace(/[^0-9.-]/g, '')) || 0,
      stock: parseInt(formStock, 10) || 0,
      category: formCategory,
      category_id: categoryId,
      subcategory: formSubcategory || null,
      subcategory_id: subcategoryId,
      image_url: formImageUrl.trim() || 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&q=80&w=600',
      badge: formBadge.trim(),
      badge_type: formBadgeType,
      options: optionsArray.length > 0 ? optionsArray : ['Estándar'],
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
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedProductCategory === 'todas' || 
      (p.category || '').toLowerCase() === selectedProductCategory.toLowerCase();
    const query = productSearch.toLowerCase();
    const matchesSearch = !query || 
      (p.title || '').toLowerCase().includes(query) ||
      (p.description || '').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'todos') return true;
    return o.status === orderStatusFilter;
  });

  // Métricas
  const totalRevenue = orders.reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const lowStockCount = products.filter(p => (parseInt(p.stock, 10) || 0) <= 5).length;

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Total Productos</span>
            <Package size={16} className="text-[#4aa036]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-heading">{products.length}</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Catálogo en inventario</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Pedidos Totales</span>
            <ShoppingBag size={16} className="text-[#e0a96d]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-heading">{orders.length}</div>
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

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Ventas Acumuladas</span>
            <Sparkles size={16} className="text-[#25d366]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#25d366] font-heading">{formatPrice(totalRevenue)}</div>
          <span className="text-[10px] text-gray-500 mt-1 block">Monto total estimado</span>
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
          <span>Productos del Catálogo ({products.length})</span>
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
          <span>Gestión de Pedidos ({orders.length})</span>
          {pendingOrdersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#e0a96d] text-black text-[9px] font-black">
              {pendingOrdersCount}
            </span>
          )}
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
                    <th className="py-3 px-4">Producto / Imagen</th>
                    <th className="py-3 px-4">Categoría / Subcategoría</th>
                    <th className="py-3 px-4">Precio</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Etiqueta</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
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
                        <td className="py-3 px-4 font-bold text-white font-heading">
                          {typeof prod.price === 'number' ? formatPrice(prod.price) : prod.price}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            (prod.stock || 0) <= 5 
                              ? 'bg-red-950/60 text-red-400 border border-red-500/50' 
                              : 'bg-[#18311d] text-[#4aa036] border border-[#2d5a27]'
                          }`}>
                            {prod.stock || 0} un.
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {prod.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-[#e0a96d]/20 text-[#e0a96d] border border-[#e0a96d]/40 text-[10px] font-bold">
                              {prod.badge}
                            </span>
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
          {/* Filtros de estado de pedidos */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-bold uppercase mr-2">Filtrar por:</span>
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition border ${
                    orderStatusFilter === st.id
                      ? 'bg-[#2d5a27] text-white border-[#4aa036]'
                      : 'bg-[#142619] text-gray-300 border-[#23422a] hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchOrders}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white text-xs font-bold border border-[#23422a]"
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
              <h3 className="text-lg font-bold text-white font-heading">No hay pedidos en esta categoría</h3>
              <p className="text-xs text-gray-400">Los nuevos pedidos realizados por los clientes aparecerán listados aquí en tiempo real.</p>
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
                        <span className="text-white font-medium">{order.whatsapp_phone || 'No especificado'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-semibold">Dirección / Notas:</span>
                        <span className="text-white font-medium">{order.shipping_address || order.notes || 'Entrega a convenir en local de Posadas'}</span>
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
                        Precio ($ ARS) *
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
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1">
                        Stock Disponible
                      </label>
                      <input
                        type="number"
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        placeholder="25"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] transition"
                      />
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
                        placeholder="Ej: STOCK DISPONIBLE, TOP VENTAS, LEY 27.350"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] transition"
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
                      </select>
                    </div>
                  </div>

                  {/* Presentaciones / Opciones */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Opciones y Presentaciones (separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={formOptions}
                      onChange={(e) => setFormOptions(e.target.value)}
                      placeholder="100 cc, 250 cc, 500 cc"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] transition"
                    />
                  </div>

                  {/* URL de Imagen con Previsualizador */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      URL de la Imagen del Producto *
                    </label>
                    <input
                      type="url"
                      required
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#142619] border border-[#23422a] text-white text-xs outline-none focus:border-[#4aa036] transition"
                    />
                    
                    {formImageUrl && (
                      <div className="mt-2.5 flex items-center gap-3 p-2.5 bg-[#0a140d] rounded-xl border border-[#1f3b25]">
                        <img
                          src={formImageUrl}
                          alt="Previsualización"
                          className="w-14 h-14 rounded-lg object-cover border border-[#2d5a27]"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&q=80&w=600';
                          }}
                        />
                        <div className="text-xs">
                          <span className="font-bold text-white block">Previsualización de Imagen</span>
                          <span className="text-[11px] text-gray-400">Verifica que la imagen cargue correctamente y tenga buena resolución.</span>
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
    </div>
  );
};
