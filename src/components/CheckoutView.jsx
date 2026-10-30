import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Lock, 
  CreditCard, 
  Building2, 
  Banknote, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Check, 
  ShieldCheck, 
  HelpCircle, 
  ExternalLink,
  UserPlus,
  Shield,
  Store,
  Bike
} from 'lucide-react';
import { useShop, formatPrice } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl, buildImageUrl } from '../config/api';
import { WhatsAppIcon } from './WhatsAppIcon';

const PROVINCIAS_ARGENTINA = [
  'Misiones',
  'Buenos Aires',
  'Ciudad Autónoma de Buenos Aires (CABA)',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán'
];

export const CheckoutView = () => {
  const navigate = useNavigate();
  const { user, token, setSession, isAdmin } = useAuth();
  const { 
    cart, 
    totalItems, 
    totalPrice, 
    formattedTotalPrice, 
    clearCart,
    paymentSettings
  } = useShop();

  // Estados del formulario de Envío y Contacto
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    country: 'Argentina',
    streetAddress: '',
    apartment: '',
    city: 'Posadas',
    state: 'Misiones',
    postalCode: '',
    phone: '',
    email: user?.email || '',
    notes: '',
    // Creación de cuenta opcional
    createAccount: false,
    password: '',
    confirmPassword: '',
    // Opciones seleccionadas
    paymentMethod: 'transferencia', // 'transferencia' | 'efectivo' | 'whatsapp'
    shippingMethod: 'retiro_local'   // 'retiro_local' | 'envio_posadas' | 'envio_nacional'
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copiedAlias, setCopiedAlias] = useState(false);

  // Autocompletar datos si el usuario inicia sesión durante la vista
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        createAccount: false
      }));
    }
  }, [user]);

  // Manejar cambios en campos de texto
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Copiar alias al portapapeles
  const handleCopyAlias = (aliasText) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(aliasText);
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2000);
    }
  };

  // Validaciones del formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Ingresá tu nombre y apellido completo.';
    }

    // Para retiro en local no es obligatoria la dirección domiciliaria
    if (formData.shippingMethod !== 'retiro_local') {
      if (!formData.streetAddress.trim()) {
        errors.streetAddress = 'Ingresá la calle y número de tu domicilio para el envío.';
      }

      if (!formData.city.trim()) {
        errors.city = 'Ingresá tu localidad o ciudad.';
      }

      if (!formData.state.trim()) {
        errors.state = 'Seleccioná una provincia de Argentina.';
      }

      if (!formData.postalCode.trim()) {
        errors.postalCode = 'Ingresá tu código postal.';
      }
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Ingresá un número de teléfono o WhatsApp de contacto.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Ingresá tu dirección de correo electrónico.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Ingresá un formato de correo electrónico válido.';
    }

    if (!user && formData.createAccount) {
      if (!formData.password || formData.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres.';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Envío del pedido al backend
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (isAdmin) {
      setSubmitError('Los usuarios administradores no pueden generar pedidos. Por favor, utilizá una cuenta de cliente.');
      return;
    }

    if (cart.length === 0) {
      setSubmitError('Tu carrito está vacío. Agregá productos antes de confirmar el pedido.');
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Formatear dirección limpia y coherente con el método elegido
      const fullShippingAddress = formData.shippingMethod === 'retiro_local'
        ? (formData.streetAddress.trim()
            ? `${formData.streetAddress.trim()}${formData.apartment ? ', ' + formData.apartment.trim() : ''}, ${formData.city.trim() || 'Posadas'}, ${formData.state.trim() || 'Misiones'} (Retiro en Local Oficial: Av. López y Planes casi Lavalle (adentro del ACUARIUM), Posadas, Misiones)`
            : 'Retiro por Local Oficial - Av. López y Planes casi Lavalle (adentro del ACUARIUM), Posadas, Misiones')
        : `${formData.streetAddress.trim()}${formData.apartment ? ', ' + formData.apartment.trim() : ''}, ${formData.city.trim()}, ${formData.state.trim()} (CP: ${formData.postalCode.trim()}), Argentina`;

      const payload = {
        customer_name: formData.fullName.trim(),
        customer_email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        whatsapp_phone: formData.phone.trim(),
        country: 'Argentina',
        street_address: formData.streetAddress.trim() || (formData.shippingMethod === 'retiro_local' ? 'Retiro en Local' : ''),
        apartment: formData.apartment.trim() || null,
        city: formData.city.trim() || (formData.shippingMethod === 'retiro_local' ? 'Posadas' : ''),
        state: formData.state.trim() || (formData.shippingMethod === 'retiro_local' ? 'Misiones' : ''),
        postal_code: formData.postalCode.trim() || (formData.shippingMethod === 'retiro_local' ? '3300' : ''),
        shipping_address: fullShippingAddress,
        payment_method: formData.paymentMethod,
        shipping_method: formData.shippingMethod,
        notes: formData.notes.trim() || null,
        items: cart.map(item => ({
          id: item.id,
          productId: item.id,
          title: item.title,
          selectedOption: item.selectedOption || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          price: item.unitPrice,
          image: item.image || item.image_url || null
        })),
        total_amount: totalPrice,
        create_account: !user && formData.createAccount,
        password: formData.password || undefined
      };

      const res = await fetch(buildApiUrl('orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al procesar tu pedido. Por favor, intentá nuevamente.');
      }

      // Si el backend creó y devolvió un nuevo usuario y token, guardamos la sesión
      if (data.token && data.user && setSession) {
        setSession(data.user, data.token);
      }

      // Vaciar carrito y guardar estado del pedido completado
      clearCart();
      setCompletedOrder(data.order || {
        id: Math.floor(1000 + Math.random() * 9000),
        ...payload,
        created_at: new Date().toISOString()
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error al registrar pedido en Checkout:', err);
      setSubmitError(err.message || 'Error de conexión con el servidor. Revisá tus datos e intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Construir mensaje oficial para coordinar por WhatsApp al terminar la compra
  const getWhatsAppConfirmationUrl = (order) => {
    const phoneNumber = '5493764356995'; // WhatsApp oficial de CultiShop
    const orderId = order.id || 'NUEVO';
    const clientName = order.customer_name || formData.fullName;
    const paymentLabel = 
      order.payment_method === 'transferencia' ? 'Transferencia Bancaria / Alias' :
      order.payment_method === 'efectivo' ? 'Efectivo al retirar en local' :
      'A coordinar por WhatsApp';
    
    const shippingLabel = 
      order.shipping_method === 'retiro_local' ? 'Retiro por Local sin costo (Av. López y Planes casi Lavalle (adentro del ACUARIUM), Posadas, Misiones)' :
      order.shipping_method === 'envio_posadas' ? 'Envío Local en Posadas / Garupá (Moto, Uber o Líder Mandados)' :
      'Envío Nacional a todo el país (Correo Argentino o Vía Cargo - costo adicional según destino)';

    const itemsSummary = (order.items || cart || [])
      .map(it => `• ${it.quantity}x ${it.title}${it.selectedOption ? ` (${it.selectedOption})` : ''} - ${formatPrice((it.unitPrice || it.price) * it.quantity)}`)
      .join('\n');

    const message = [
      `🌱 *¡HOLA CULTISHOP! ACABO DE REALIZAR UN PEDIDO EN LA TIENDA WEB*`,
      ``,
      `📋 *Número de Pedido:* #${orderId}`,
      `👤 *Cliente:* ${clientName}`,
      `📞 *Teléfono:* ${order.phone || formData.phone}`,
      `📍 *Destino:* ${order.shipping_address || `${formData.city}, ${formData.state}`}`,
      `🚚 *Modalidad de Entrega:* ${shippingLabel}`,
      `💳 *Medio de Pago Seleccionado:* ${paymentLabel}`,
      ``,
      `📦 *Productos Solicitados:*`,
      itemsSummary,
      ``,
      `💰 *Total del Pedido:* ${formatPrice(parseFloat(order.total_amount) || totalPrice)}`,
      ``,
      order.notes ? `📝 *Notas:* ${order.notes}\n` : '',
      `¿Me confirman disponibilidad y los datos para coordinar la entrega? ¡Muchas gracias!`
    ].filter(line => line !== undefined).join('\n');

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  // =========================================================================
  // VISTA DE CONFIRMACIÓN DE PEDIDO COMPLETADO EXITOSAMENTE
  // =========================================================================
  if (completedOrder) {
    const orderNumber = completedOrder.id || 'WEB';
    const waUrl = getWhatsAppConfirmationUrl(completedOrder);

    return (
      <div className="min-h-screen bg-[#0a140d] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
          
          {/* Tarjeta principal de éxito */}
          <div className="bg-[#0e1c12] border-2 border-[#2d5a27] rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2d5a27] via-[#e0a96d] to-[#2d5a27]" />

            <div className="w-20 h-20 bg-[#142619] border-2 border-[#4aa036] text-[#4aa036] rounded-full flex items-center justify-center mx-auto shadow-xl shadow-[#4aa036]/10 animate-bounce">
              <CheckCircle2 size={42} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4aa036] block">
                ¡Pedido Registrado con Éxito!
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-heading">
                Muchas gracias por tu compra en CultiShop
              </h1>
              <p className="text-sm text-gray-300 max-w-xl mx-auto">
                Tu pedido <span className="text-[#e0a96d] font-bold">#{orderNumber}</span> ha sido guardado en nuestro sistema. Ya podés coordinar el pago y la entrega directamente con nosotros.
              </p>
            </div>

            {/* Cuadro destacado de acción con WhatsApp */}
            <div className="p-5 rounded-2xl bg-[#09150d] border border-[#23442a] space-y-4 max-w-xl mx-auto text-left">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#25d366]/20 text-[#25d366]">
                  <WhatsAppIcon size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Siguiente Paso: Coordinar por WhatsApp</h3>
                  <p className="text-xs text-gray-400">
                    Hacé clic en el botón de abajo para enviar automáticamente los datos de tu pedido y coordinar el pago o retiro.
                  </p>
                </div>
              </div>

              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-6 rounded-xl bg-[#25d366] hover:bg-[#20ba5a] text-black font-black text-sm flex items-center justify-center gap-2.5 transition shadow-lg shadow-[#25d366]/20 hover:scale-[1.02] active:scale-95"
              >
                <WhatsAppIcon size={20} />
                <span>Enviar Pedido #{orderNumber} por WhatsApp</span>
              </a>
            </div>

            {/* Si eligió transferencia bancaria, recordatorio de datos de pago */}
            {completedOrder.payment_method === 'transferencia' && (
              <div className="p-4 rounded-2xl bg-[#09150d] border border-[#e0a96d]/40 space-y-2 max-w-xl mx-auto text-left text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-semibold">💳 Datos para la Transferencia:</span>
                  <span className="text-[10px] text-[#e0a96d] font-bold uppercase bg-[#281d0f] px-2 py-0.5 rounded border border-[#e0a96d]/30">
                    Alias Oficial
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[#122317] p-2.5 rounded-xl border border-[#23422a]">
                  <span className="text-gray-400">Alias:</span>
                  <div className="flex items-center gap-1.5">
                    <code className="text-[#e0a96d] font-bold select-all">{paymentSettings?.bank_alias || 'CULTISHOP.POSADAS'}</code>
                    <button
                      type="button"
                      onClick={() => handleCopyAlias(paymentSettings?.bank_alias || 'CULTISHOP.POSADAS')}
                      className="p-1 text-gray-400 hover:text-white"
                      title="Copiar alias"
                    >
                      {copiedAlias ? <Check size={14} className="text-[#4aa036]" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                {paymentSettings?.bank_cbu && (
                  <div className="flex items-center justify-between text-[11px] px-1">
                    <span className="text-gray-400">CBU / CVU:</span>
                    <span className="text-gray-200 font-mono select-all">{paymentSettings.bank_cbu}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] px-1">
                  <span className="text-gray-400">Titular:</span>
                  <span className="text-white font-medium">{paymentSettings?.account_holder || 'CultiShop Posadas'}</span>
                </div>
              </div>
            )}

            {/* Resumen detallado del pedido confirmado */}
            <div className="border-t border-[#1b3420] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs bg-[#122317] p-5 rounded-2xl border border-[#23422a]">
              <div>
                <span className="text-gray-400 block font-semibold">Cliente:</span>
                <span className="text-white font-bold text-sm">{completedOrder.customer_name}</span>
                <span className="text-gray-300 block">{completedOrder.customer_email}</span>
                <span className="text-gray-300 block">{completedOrder.phone || completedOrder.whatsapp_phone}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold">Destino de Entrega:</span>
                <span className="text-white font-bold">{completedOrder.shipping_address}</span>
                <span className="text-gray-400 block mt-1">
                  Modalidad: <strong className="text-gray-200">
                    {completedOrder.shipping_method === 'retiro_local'
                      ? 'Retiro por Local sin costo (Av. López y Planes casi Lavalle (adentro del ACUARIUM), Posadas, Misiones)'
                      : completedOrder.shipping_method === 'envio_posadas'
                      ? 'Envío Local en Posadas / Garupá (Moto, Uber o Líder Mandados)'
                      : 'Envío Nacional (Correo Argentino o Vía Cargo - costo adicional según destino)'}
                  </strong>
                </span>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-[#1f3b25] flex justify-between items-center">
                <span className="text-gray-400 font-semibold uppercase">Total del Pedido:</span>
                <span className="text-xl font-black text-[#e0a96d] font-heading">
                  {formatPrice(parseFloat(completedOrder.total_amount) || 0)}
                </span>
              </div>
            </div>

            {/* Botones secundarios */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#142619] hover:bg-[#1f3b25] text-gray-200 hover:text-white text-xs font-bold border border-[#23422a] transition"
              >
                <ArrowLeft size={14} />
                <span>Volver al Catálogo</span>
              </Link>
              <Link
                to="/ingresar"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2d5a27] hover:bg-[#38761d] text-white text-xs font-bold transition shadow-md"
              >
                <User size={14} />
                <span>Ver Mi Cuenta / Pedidos</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RESTRICCIÓN PARA ADMINISTRADORES
  // =========================================================================
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a140d] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#0e1c12] border border-[#e0a96d]/40 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#1b2b1e] border border-[#e0a96d]/50 flex items-center justify-center text-[#e0a96d] mx-auto shadow-inner">
            <Shield size={32} />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#e0a96d] uppercase tracking-widest bg-[#1b2b1e] px-3 py-1 rounded-full border border-[#e0a96d]/30">
              Modo Administrador
            </span>
            <h2 className="text-xl font-black text-white font-heading mt-2">Compras Inhabilitadas</h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              Las cuentas con rol de administrador están reservadas para la gestión del catálogo, stock y pedidos. No podés generar compras ni transacciones con este perfil.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              to="/admin"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg"
            >
              <Shield size={16} />
              <span>Ir al Panel de Administración</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white font-bold text-xs transition border border-[#23422a]"
            >
              <ArrowLeft size={14} />
              <span>Volver a la Tienda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ESTADO VACÍO (Si el carrito no tiene productos)
  // =========================================================================
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a140d] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#0e1c12] border border-[#1f3b25] rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#142619] border border-[#23422a] flex items-center justify-center text-[#e0a96d] mx-auto shadow-inner">
            <ShoppingBag size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white font-heading">Tu carrito está vacío</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              No tenés ningún producto acumulado para finalizar la compra. Explorá nuestro catálogo de fertilizantes, iluminación, sustratos y kits de cultivo.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-full bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg"
          >
            <span>Explorar Catálogo de Productos</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VISTA PRINCIPAL DEL FORMULARIO DE CHECKOUT
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#0a140d] text-gray-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Cabecera / Breadcrumb */}
        <div className="border-b border-[#1f3b25] pb-5 space-y-2">
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-[#4aa036] transition">Inicio</Link>
            <span>/</span>
            <span className="text-[#e0a96d] font-bold">Finalizar la Compra</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-wide">
                FINALIZAR <span className="text-[#e0a96d]">LA COMPRA</span>
              </h1>
              <p className="text-xs text-gray-400">
                Completá tus datos de entrega y coordiná tu pedido con CultiShop Posadas.
              </p>
            </div>
            {user && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#122317] border border-[#2d5a27] text-xs text-gray-300">
                <CheckCircle2 size={14} className="text-[#4aa036]" />
                <span>Sesión iniciada: <strong className="text-white">{user.name.split(' ')[0]}</strong></span>
              </div>
            )}
          </div>
        </div>

        {submitError && (
          <div className="p-4 rounded-2xl bg-red-950/70 border border-red-500/50 flex items-start gap-3 text-red-200 text-xs shadow-xl animate-in fade-in">
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">No pudimos procesar el pedido</span>
              <p>{submitError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ============================================================ */}
          {/* COLUMNA IZQUIERDA: FORMULARIO DE ENVÍO Y CONTACTO (7 Cols) */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* SECCIÓN 1: DATOS DEL CLIENTE Y ENVÍO */}
            <div className="bg-[#0e1c12] border border-[#1f3b25] rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#1b3420] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#142619] border border-[#23422a] text-[#4aa036] flex items-center justify-center shadow-inner">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white font-heading">
                      Datos de Envío y Contacto
                    </h2>
                    <p className="text-[11px] text-gray-400">
                      Ingresá los datos donde querés recibir tus productos o retirar en el local.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#e0a96d] bg-[#1a2e1d] px-2.5 py-1 rounded-full border border-[#2d5a27]">
                  Paso 1 de 2
                </span>
              </div>

              <div className="space-y-4">
                {/* Nombre y Apellido */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Nombre y Apellidos <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                    className={`w-full py-2.5 px-4 rounded-xl bg-[#142619] text-gray-100 placeholder-gray-500 border text-xs focus:outline-none transition ${
                      validationErrors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-[#23422a] focus:border-[#4aa036]'
                    }`}
                  />
                  {validationErrors.fullName && (
                    <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.fullName}</span>
                  )}
                </div>

                {/* País fijo en Argentina */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    País / Región <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="country"
                      value="Argentina"
                      readOnly
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl bg-[#09150d] text-gray-300 border border-[#1b3420] text-xs cursor-not-allowed font-semibold"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs">🇦🇷</span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    CultiShop despacha desde Posadas, Misiones a todo el territorio argentino.
                  </span>
                </div>

                {/* Aviso contextual según modalidad de entrega */}
                {formData.shippingMethod === 'retiro_local' ? (
                  <div className="p-4 rounded-2xl bg-[#142918] border border-[#2d5a27] text-xs text-gray-300 flex items-start gap-3 shadow-md animate-in fade-in">
                    <Store size={18} className="text-[#4aa036] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-white font-bold flex items-center gap-2">
                        <span>Retiro por Local Comercial</span>
                        <span className="text-[10px] font-black text-[#4aa036] uppercase bg-[#0e1f12] px-2 py-0.5 rounded-full border border-[#4aa036]/50">Sin Costo</span>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-relaxed">
                        📍 Dirección del local: <strong className="text-[#e0a96d]">Av. López y Planes casi Lavalle (adentro del ACUARIUM), Posadas, Misiones.</strong>
                      </p>
                      <p className="text-[10px] text-gray-400">
                        No es obligatorio ingresar dirección de entrega. Te avisaremos por WhatsApp cuando tu pedido esté empaquetado para retirar.
                      </p>
                    </div>
                  </div>
                ) : formData.shippingMethod === 'envio_posadas' ? (
                  <div className="p-4 rounded-2xl bg-[#1d2716] border border-amber-600/40 text-xs text-gray-300 flex items-start gap-3 shadow-md animate-in fade-in">
                    <Bike size={18} className="text-[#e0a96d] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-white font-bold flex items-center gap-2">
                        <span>Envío Local (Posadas / Garupá)</span>
                        <span className="text-[10px] font-semibold text-gray-300 uppercase bg-[#122317] px-2 py-0.5 rounded-full border border-amber-600/40">A coordinar</span>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-relaxed">
                        🛵 Coordinación de envío ágil por <strong className="text-white">moto, Uber o Líder Mandados</strong>.
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Ingresá tu domicilio exacto. El costo de cadetería se abona contra entrega o se coordina por WhatsApp según la distancia.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#102230] border border-blue-600/40 text-xs text-gray-300 flex items-start gap-3 shadow-md animate-in fade-in">
                    <Truck size={18} className="text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-white font-bold flex items-center gap-2">
                        <span>Envíos Nacionales a Todo el País</span>
                        <span className="text-[10px] font-bold text-amber-300 uppercase bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-600/40">Costo adicional</span>
                      </div>
                      <p className="text-[11px] text-gray-300 leading-relaxed">
                        📦 Envío a todo el país por <strong className="text-white">Correo Argentino o Vía Cargo</strong> con embalaje 100% seguro y discreto.
                      </p>
                      <p className="text-[11px] text-amber-300 font-medium">
                        ⚠️ Tiene un costo adicional que dependerá del lugar de destino (se calcula y coordina por WhatsApp).
                      </p>
                    </div>
                  </div>
                )}

                {/* Dirección de la calle */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Dirección de la calle {formData.shippingMethod === 'retiro_local' ? (
                      <span className="text-gray-500 font-normal lowercase">(opcional para retiro en local)</span>
                    ) : (
                      <span className="text-red-400">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleChange}
                    placeholder={
                      formData.shippingMethod === 'retiro_local'
                        ? 'Opcional (se retira en Av. López y Planes casi Lavalle (adentro del ACUARIUM), Posadas, Misiones)'
                        : 'Número de casa y nombre de la calle (ej: Av. San Martín 1234)'
                    }
                    className={`w-full py-2.5 px-4 rounded-xl bg-[#142619] text-gray-100 placeholder-gray-500 border text-xs focus:outline-none transition ${
                      validationErrors.streetAddress ? 'border-red-500 ring-1 ring-red-500' : 'border-[#23422a] focus:border-[#4aa036]'
                    }`}
                  />
                  {validationErrors.streetAddress && (
                    <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.streetAddress}</span>
                  )}
                </div>

                {/* Piso / Dpto (Opcional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Piso, Departamento, Edificio o Torre <span className="text-gray-500 font-normal lowercase">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleChange}
                    placeholder="Ej: Piso 2, Dpto B / Frente rejas verdes"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#142619] text-gray-100 placeholder-gray-500 border border-[#23422a] focus:border-[#4aa036] text-xs focus:outline-none transition"
                  />
                </div>

                {/* Localidad, Provincia y Código Postal en grilla */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Localidad / Ciudad */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Localidad / Ciudad <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Ej: Posadas"
                      className={`w-full py-2.5 px-4 rounded-xl bg-[#142619] text-gray-100 placeholder-gray-500 border text-xs focus:outline-none transition ${
                        validationErrors.city ? 'border-red-500 ring-1 ring-red-500' : 'border-[#23422a] focus:border-[#4aa036]'
                      }`}
                    />
                    {validationErrors.city && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.city}</span>
                    )}
                  </div>

                  {/* Región / Provincia */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Provincia <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full py-2.5 px-3 rounded-xl bg-[#142619] text-gray-100 border text-xs focus:outline-none transition cursor-pointer font-medium ${
                        validationErrors.state ? 'border-red-500 ring-1 ring-red-500' : 'border-[#23422a] focus:border-[#4aa036]'
                      }`}
                    >
                      {PROVINCIAS_ARGENTINA.map((prov) => (
                        <option key={prov} value={prov} className="bg-[#0e1c12] text-white">
                          {prov}
                        </option>
                      ))}
                    </select>
                    {validationErrors.state && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.state}</span>
                    )}
                  </div>

                  {/* Código Postal */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Código Postal <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="Ej: 3300"
                      className={`w-full py-2.5 px-4 rounded-xl bg-[#142619] text-gray-100 placeholder-gray-500 border text-xs focus:outline-none transition ${
                        validationErrors.postalCode ? 'border-red-500 ring-1 ring-red-500' : 'border-[#23422a] focus:border-[#4aa036]'
                      }`}
                    />
                    {validationErrors.postalCode && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.postalCode}</span>
                    )}
                  </div>
                </div>

                {/* Teléfono y Correo Electrónico */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Teléfono / WhatsApp <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Ej: 376 435-6995"
                        className={`w-full py-2.5 pl-9 pr-4 rounded-xl bg-[#142619] text-gray-100 placeholder-gray-500 border text-xs focus:outline-none transition ${
                          validationErrors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-[#23422a] focus:border-[#4aa036]'
                        }`}
                      />
                      <Phone size={14} className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    {validationErrors.phone && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.phone}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                      Correo Electrónico <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        className={`w-full py-2.5 pl-9 pr-4 rounded-xl bg-[#142619] text-gray-100 placeholder-gray-500 border text-xs focus:outline-none transition ${
                          validationErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-[#23422a] focus:border-[#4aa036]'
                        }`}
                      />
                      <Mail size={14} className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    {validationErrors.email && (
                      <span className="text-[11px] text-red-400 mt-1 block">{validationErrors.email}</span>
                    )}
                  </div>
                </div>

                {/* Notas adicionales del pedido */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Notas adicionales del pedido <span className="text-gray-500 font-normal lowercase">(opcional)</span>
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Instrucciones para la entrega, horarios preferidos, timbre, etc."
                    className="w-full py-2 px-4 rounded-xl bg-[#142619] text-gray-100 placeholder-gray-500 border border-[#23422a] focus:border-[#4aa036] text-xs focus:outline-none transition"
                  />
                </div>
              </div>

              {/* VINCULACIÓN CON CREACIÓN DE CUENTA */}
              {!user && (
                <div className="pt-4 border-t border-[#1b3420] space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="createAccount"
                      checked={formData.createAccount}
                      onChange={handleChange}
                      className="mt-0.5 w-4 h-4 rounded text-[#2d5a27] bg-[#142619] border-[#23422a] focus:ring-[#4aa036] cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-white group-hover:text-[#e0a96d] transition flex items-center gap-1.5">
                        <UserPlus size={14} className="text-[#e0a96d]" />
                        <span>¿Crear una cuenta con estos datos?</span>
                      </span>
                      <p className="text-gray-400 text-[11px]">
                        Guardá tus datos para futuras compras y seguí el estado de tus pedidos.
                      </p>
                    </div>
                  </label>

                  {formData.createAccount && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#09150d] border border-[#23442a] animate-in fade-in duration-200">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                          Crear Contraseña <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mínimo 6 caracteres"
                            className={`w-full py-2 pl-9 pr-3 rounded-xl bg-[#142619] text-gray-100 border text-xs focus:outline-none ${
                              validationErrors.password ? 'border-red-500' : 'border-[#23422a] focus:border-[#4aa036]'
                            }`}
                          />
                          <Lock size={13} className="absolute left-3 top-2.5 text-gray-400" />
                        </div>
                        {validationErrors.password && (
                          <span className="text-[10px] text-red-400 mt-0.5 block">{validationErrors.password}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1">
                          Confirmar Contraseña <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Repetí la contraseña"
                            className={`w-full py-2 pl-9 pr-3 rounded-xl bg-[#142619] text-gray-100 border text-xs focus:outline-none ${
                              validationErrors.confirmPassword ? 'border-red-500' : 'border-[#23422a] focus:border-[#4aa036]'
                            }`}
                          />
                          <Lock size={13} className="absolute left-3 top-2.5 text-gray-400" />
                        </div>
                        {validationErrors.confirmPassword && (
                          <span className="text-[10px] text-red-400 mt-0.5 block">{validationErrors.confirmPassword}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECCIÓN 2: DETALLES Y MÉTODOS DE PAGO (INFORMATIVOS) */}
            <div className="bg-[#0e1c12] border border-[#1f3b25] rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#1b3420] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#142619] border border-[#23422a] text-[#e0a96d] flex items-center justify-center shadow-inner">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white font-heading">
                      Detalles y Métodos de Pago
                    </h2>
                    <p className="text-[11px] text-gray-400">
                      Opciones oficiales para coordinar y abonar tu pedido.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#e0a96d] bg-[#1a2e1d] px-2.5 py-1 rounded-full border border-[#2d5a27]">
                  Paso 2 de 2
                </span>
              </div>

              {/* AVISO IMPORTANTE: Pasarelas automáticas no integradas */}
              <div className="p-3.5 rounded-2xl bg-[#102315] border border-[#23442a] flex items-start gap-3 text-xs text-gray-300">
                <ShieldCheck size={18} className="text-[#4aa036] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white block">
                    Pago 100% coordinado y seguro
                  </span>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    Las pasarelas de pago automáticas con tarjeta están en proceso de integración. Podés coordinar y abonar tu compra de manera directa mediante las siguientes modalidades oficiales:
                  </p>
                </div>
              </div>

              {/* Opciones seleccionables de Pago */}
              <div className="space-y-3">
                {/* Opción 1: Transferencia Bancaria */}
                <label 
                  className={`block p-4 rounded-2xl border transition-all cursor-pointer ${
                    formData.paymentMethod === 'transferencia'
                      ? 'bg-[#122517] border-[#4aa036] shadow-md shadow-black/40 ring-1 ring-[#4aa036]/50'
                      : 'bg-[#102014] border-[#1e3b24] hover:border-[#2d5a27]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transferencia"
                        checked={formData.paymentMethod === 'transferencia'}
                        onChange={handleChange}
                        className="mt-1 text-[#2d5a27] focus:ring-[#4aa036] cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-[#e0a96d]" />
                          <span className="font-bold text-white text-xs sm:text-sm">
                            Transferencia Bancaria / Billeteras Virtuales
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Transferí desde Mercado Pago, Ualá o cualquier cuenta bancaria.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[#e0a96d] bg-[#2a1e0f] px-2 py-0.5 rounded-full border border-[#e0a96d]/40 shrink-0">
                      Recomendado
                    </span>
                  </div>

                  {/* Detalle informativo cuando está seleccionado */}
                  {formData.paymentMethod === 'transferencia' && (
                    <div className="mt-3.5 pt-3 border-t border-[#1b3621] space-y-2.5 text-xs bg-[#09150d] p-3.5 rounded-xl border border-[#1b3420] animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-medium">Alias Oficial:</span>
                        <div className="flex items-center gap-1.5">
                          <code className="text-[#e0a96d] font-bold bg-[#142619] px-2.5 py-1 rounded-lg border border-[#23422a] tracking-wide select-all">
                            {paymentSettings?.bank_alias || 'CULTISHOP.POSADAS'}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyAlias(paymentSettings?.bank_alias || 'CULTISHOP.POSADAS')}
                            className="p-1.5 hover:text-white text-gray-300 bg-[#142619] hover:bg-[#1e3b26] border border-[#23422a] rounded-lg transition flex items-center gap-1"
                            title="Copiar alias"
                          >
                            {copiedAlias ? <Check size={14} className="text-[#4aa036]" /> : <Copy size={14} />}
                            <span className="text-[10px] hidden sm:inline">{copiedAlias ? '¡Copiado!' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>

                      {paymentSettings?.bank_cbu && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 font-medium">CBU / CVU:</span>
                          <div className="flex items-center gap-1.5">
                            <code className="text-gray-300 font-mono text-[11px] bg-[#142619] px-2 py-0.5 rounded border border-[#23422a] select-all">
                              {paymentSettings.bank_cbu}
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopyAlias(paymentSettings.bank_cbu)}
                              className="p-1 hover:text-white text-gray-400 transition"
                              title="Copiar CBU/CVU"
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">Titular de la cuenta:</span>
                        <span className="text-white font-medium">{paymentSettings?.account_holder || 'CultiShop Posadas'}</span>
                      </div>

                      {paymentSettings?.bank_name && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Entidad / Billetera:</span>
                          <span className="text-gray-200">{paymentSettings.bank_name}</span>
                        </div>
                      )}

                      <p className="text-[10px] text-gray-400 pt-1.5 border-t border-[#152a1b] leading-relaxed">
                        {paymentSettings?.payment_notes || 'Al confirmar el pedido podrás enviar el comprobante de transferencia directamente por WhatsApp.'}
                      </p>
                    </div>
                  )}
                </label>

                {/* Opción 2: Efectivo al Retirar / Contra Entrega */}
                <label 
                  className={`block p-4 rounded-2xl border transition-all cursor-pointer ${
                    formData.paymentMethod === 'efectivo'
                      ? 'bg-[#122517] border-[#4aa036] shadow-md shadow-black/40 ring-1 ring-[#4aa036]/50'
                      : 'bg-[#102014] border-[#1e3b24] hover:border-[#2d5a27]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="efectivo"
                      checked={formData.paymentMethod === 'efectivo'}
                      onChange={handleChange}
                      className="mt-1 text-[#2d5a27] focus:ring-[#4aa036] cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Banknote size={16} className="text-[#4aa036]" />
                        <span className="font-bold text-white text-xs sm:text-sm">
                          Efectivo al Retirar en Local / Contra Entrega
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Aboná en efectivo al retirar tu pedido en nuestro local de Posadas (Av. López y Planes 2919) o contra entrega en envíos locales.
                      </p>
                    </div>
                  </div>
                </label>

                {/* Opción 3: Coordinar por WhatsApp */}
                <label 
                  className={`block p-4 rounded-2xl border transition-all cursor-pointer ${
                    formData.paymentMethod === 'whatsapp'
                      ? 'bg-[#122517] border-[#4aa036] shadow-md shadow-black/40 ring-1 ring-[#4aa036]/50'
                      : 'bg-[#102014] border-[#1e3b24] hover:border-[#2d5a27]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="whatsapp"
                      checked={formData.paymentMethod === 'whatsapp'}
                      onChange={handleChange}
                      className="mt-1 text-[#2d5a27] focus:ring-[#4aa036] cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <WhatsAppIcon size={16} className="text-[#25d366]" />
                        <span className="font-bold text-white text-xs sm:text-sm">
                          Acordar Medio de Pago por WhatsApp
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Coordiná planes especiales, promociones bancarias o cuotas con nuestro asesor técnico.
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* COLUMNA DERECHA: RESUMEN DEL PEDIDO (ORDER SUMMARY) (5 Cols) */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            <div className="bg-[#0e1c12] border border-[#1f3b25] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#1b3420] pb-4">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag size={18} className="text-[#e0a96d]" />
                  <h3 className="font-heading font-black text-white text-base">
                    Resumen del Pedido
                  </h3>
                </div>
                <span className="bg-[#e0a96d] text-black font-black text-xs px-2.5 py-0.5 rounded-full">
                  {totalItems} ítem(s)
                </span>
              </div>

              {/* Lista de productos en el carrito */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div 
                    key={item.cartId} 
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#09150d] border border-[#1b3420] text-xs"
                  >
                    <img
                      src={buildImageUrl(item.image || item.image_url)}
                      alt={item.title}
                      className="w-12 h-12 object-contain bg-[#0b1610] p-0.5 rounded-lg border border-[#23422a] shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=200';
                      }}
                    />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-white truncate text-xs font-heading">
                        {item.title}
                      </h4>
                      {item.selectedOption && (
                        <span className="text-[10px] text-[#e0a96d] font-semibold block">
                          Presentación: {item.selectedOption}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">
                        {item.quantity} x {formatPrice(item.unitPrice)}
                      </span>
                    </div>
                    <span className="font-bold text-white text-xs shrink-0 font-heading">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Selección de Modalidad de Entrega */}
              <div className="pt-2 border-t border-[#1b3420] space-y-2.5">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Modalidad de Entrega
                </label>
                <div className="space-y-2 text-xs">
                  {/* Opción 1: Retiro por Local */}
                  <label className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition ${
                    formData.shippingMethod === 'retiro_local'
                      ? 'bg-[#18311d] border-[#4aa036] shadow-md shadow-[#4aa036]/10'
                      : 'bg-[#122317] border-[#23442a] hover:border-[#4aa036]/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="retiro_local"
                          checked={formData.shippingMethod === 'retiro_local'}
                          onChange={handleChange}
                          className="text-[#2d5a27] focus:ring-[#4aa036]"
                        />
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <Store size={15} className="text-[#4aa036]" />
                          <span>Retiro por Local</span>
                        </div>
                      </div>
                      <span className="font-black text-[#4aa036] text-[10px] uppercase tracking-wider bg-[#0e1f12] px-2 py-0.5 rounded-full border border-[#4aa036]/40">
                        Sin costo
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 pl-6 mt-1 leading-relaxed">
                      Av. López y Planes casi Lavalle (adentro del ACUARIUM), Posadas, Misiones.
                    </p>
                  </label>

                  {/* Opción 2: Envío Local */}
                  <label className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition ${
                    formData.shippingMethod === 'envio_posadas'
                      ? 'bg-[#18311d] border-[#4aa036] shadow-md shadow-[#4aa036]/10'
                      : 'bg-[#122317] border-[#23442a] hover:border-[#4aa036]/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="envio_posadas"
                          checked={formData.shippingMethod === 'envio_posadas'}
                          onChange={handleChange}
                          className="text-[#2d5a27] focus:ring-[#4aa036]"
                        />
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <Bike size={15} className="text-[#e0a96d]" />
                          <span>Envío Local (Posadas / Garupá)</span>
                        </div>
                      </div>
                      <span className="font-semibold text-gray-300 text-[10px] uppercase bg-[#1a2e1d] px-2 py-0.5 rounded-full border border-[#2d5a27]">
                        A coordinar
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 pl-6 mt-1 leading-relaxed">
                      Coordinación de envío por moto, Uber o Líder Mandados.
                    </p>
                  </label>

                  {/* Opción 3: Envíos Nacionales */}
                  <label className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition ${
                    formData.shippingMethod === 'envio_nacional'
                      ? 'bg-[#18311d] border-[#4aa036] shadow-md shadow-[#4aa036]/10'
                      : 'bg-[#122317] border-[#23442a] hover:border-[#4aa036]/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="envio_nacional"
                          checked={formData.shippingMethod === 'envio_nacional'}
                          onChange={handleChange}
                          className="text-[#2d5a27] focus:ring-[#4aa036]"
                        />
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <Truck size={15} className="text-blue-400" />
                          <span>Envío Nacional</span>
                        </div>
                      </div>
                      <span className="font-semibold text-amber-400 text-[10px] uppercase bg-[#2a2210] px-2 py-0.5 rounded-full border border-amber-500/40">
                        Costo adicional
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 pl-6 mt-1 leading-relaxed">
                      Envío a todo el país por Correo Argentino o Vía Cargo (el costo dependerá del destino).
                    </p>
                  </label>
                </div>
              </div>

              {/* Totales y Desglose */}
              <div className="pt-3 border-t border-[#1b3420] space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal productos:</span>
                  <span className="text-white font-semibold">{formattedTotalPrice}</span>
                </div>
                <div className="flex justify-between items-start text-gray-400 gap-2">
                  <span>Costo de envío:</span>
                  <span className="font-semibold text-right">
                    {formData.shippingMethod === 'retiro_local' ? (
                      <span className="text-[#4aa036]">Sin costo (Retiro en local)</span>
                    ) : formData.shippingMethod === 'envio_posadas' ? (
                      <span className="text-gray-300">A coordinar (Moto / Uber / Líder Mandados)</span>
                    ) : (
                      <span className="text-amber-400 text-[11px]">Costo adicional según destino (Correo Arg. / Vía Cargo)</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-[#1f3b25]">
                  <span className="text-sm font-bold text-white uppercase tracking-wider font-heading">
                    Total Estimado:
                  </span>
                  <span className="text-2xl font-black text-[#e0a96d] font-heading">
                    {formattedTotalPrice}
                  </span>
                </div>
              </div>

              {/* BOTÓN PRINCIPAL DE CONFIRMACIÓN */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-wider uppercase font-heading transition-all shadow-xl shadow-black/50 flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-[#18311d] text-gray-400 cursor-wait'
                    : 'bg-[#2d5a27] hover:bg-[#38761d] text-white hover:scale-[1.02] active:scale-95 border border-[#4aa036]/60 hover:shadow-[#4aa036]/20'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Procesando Pedido...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar y Realizar Pedido</span>
                    <ArrowRight size={18} className="text-[#e0a96d]" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#4aa036]" />
                  <span>Compra respaldada por CultiShop Posadas.</span>
                </span>
              </div>
            </div>

            {/* Acceso rápido a WhatsApp para dudas */}
            <div className="p-4 rounded-2xl bg-[#09150d] border border-[#1b3420] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <WhatsAppIcon size={18} className="text-[#25d366]" />
                <span className="text-gray-300">¿Dudas con tu compra?</span>
              </div>
              <a
                href="https://wa.me/5493764356995?text=Hola%20CultiShop!%20Tengo%20una%20consulta%20antes%20de%20finalizar%20mi%20compra"
                target="_blank"
                rel="noreferrer"
                className="text-[#e0a96d] hover:text-white font-bold transition flex items-center gap-1"
              >
                <span>Consultar</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

