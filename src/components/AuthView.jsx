import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  LogOut, 
  ShoppingBag, 
  Heart, 
  Sparkles,
  KeyRound,
  Shield,
  LayoutDashboard
} from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CultiShopLogo } from './CultiShopLogo';
import { WhatsAppIcon } from './WhatsAppIcon';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '104719283749-demo-cultishop-client.apps.googleusercontent.com';

export const AuthView = () => {
  const { user, login, register, loginWithGoogle, logout, changePassword, loading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdult, setIsAdult] = useState(false);

  // Estados para cambio de contraseña seguro
  const [showChangePassForm, setShowChangePassForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setIsAdult(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  // Enviar Login Tradicional
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Por favor, completa tu correo y contraseña.');
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Credenciales inválidas.');
    } else {
      setSuccessMessage('¡Bienvenido a CultiShop!');
    }
  };

  // Enviar Registro Tradicional con validación obligatoria de +18
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name || !email || !password) {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Validación obligatoria de mayoría de edad
    if (!isAdult) {
      setErrorMessage('Es obligatorio declarar ser mayor de 18 años para poder registrarse en CultiShop.');
      return;
    }

    const res = await register({ name, email, password, isAdult });
    if (!res.success) {
      setErrorMessage(res.error || 'Error al procesar el registro.');
    } else {
      setSuccessMessage('¡Cuenta creada exitosamente! Bienvenido a CultiShop.');
    }
  };

  // Manejo de respuesta de Google OAuth
  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMessage('');
    setSuccessMessage('');

    if (credentialResponse?.credential) {
      const res = await loginWithGoogle(credentialResponse.credential);
      if (!res.success) {
        setErrorMessage(res.error || 'No se pudo completar el inicio de sesión con Google.');
      } else {
        setSuccessMessage('¡Autenticado con Google correctamente!');
      }
    } else {
      setErrorMessage('No se recibió la credencial de Google.');
    }
  };

  const handleGoogleError = () => {
    setErrorMessage('Error al conectar con el servicio de Google Sign-In.');
  };

  // Manejo de cambio de contraseña
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setPassError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Las nuevas contraseñas no coinciden.');
      return;
    }

    setIsSubmittingPass(true);
    const res = await changePassword(currentPassword, newPassword);
    setIsSubmittingPass(false);

    if (!res.success) {
      setPassError(res.error || 'Error al actualizar la contraseña.');
    } else {
      setPassSuccess(res.message || '¡Contraseña actualizada exitosamente!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // ==========================================
  // VISTA SI EL USUARIO YA ESTÁ AUTENTICADO
  // ==========================================
  if (user) {
    const isAdmin = user.role === 'admin';

    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-[#0e1c12] border-2 border-[#2d5a27] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Adorno superior dorado */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2d5a27] via-[#e0a96d] to-[#2d5a27]" />

          {/* Encabezado del perfil */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-[#1f3b25]">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-white text-2xl font-black font-heading shadow-lg shadow-black/50 ${
                isAdmin 
                  ? 'bg-gradient-to-br from-[#e0a96d] to-[#b37d45] border-[#e0a96d] text-black' 
                  : 'bg-gradient-to-br from-[#2d5a27] to-[#18311d] border-[#4aa036]'
              }`}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                  <h2 className="text-2xl font-black text-white font-heading">{user.name}</h2>
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#362410] border border-[#e0a96d] text-[10px] font-black text-[#e0a96d] uppercase tracking-wider shadow-sm">
                      <Shield size={12} className="fill-[#e0a96d]" /> Rol: Administrador
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#142619] border border-[#4aa036]/60 text-[10px] font-bold text-[#4aa036] uppercase tracking-wider">
                      <ShieldCheck size={12} /> Rol: Consumidor
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#18311d] border border-[#4aa036]/50 text-[10px] font-bold text-[#4aa036] uppercase">
                    +18 Verificado
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                <span className="inline-block mt-1 text-[11px] font-semibold text-[#e0a96d]">
                  {isAdmin ? 'Cuenta de Administración Oficial' : 'Cliente Registrado de CultiShop'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#142619] hover:bg-red-950/40 text-gray-300 hover:text-red-400 border border-[#23422a] hover:border-red-600/50 text-xs font-bold transition shadow-sm"
            >
              <LogOut size={15} />
              <span>Cerrar Sesión</span>
            </button>
          </div>

          {/* BANNER DESTACADO PARA ADMINISTRADORES */}
          {isAdmin && (
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-[#1a3821] via-[#24492b] to-[#1a3821] border-2 border-[#e0a96d] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-xl bg-[#e0a96d] text-black flex items-center justify-center font-black shadow-md shrink-0">
                  <LayoutDashboard size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#e0a96d]">Acceso de Gestión</span>
                  <h3 className="text-lg font-black text-white font-heading">Panel de Administración CultiShop</h3>
                  <p className="text-xs text-gray-200">Alta, baja y modificación de productos (CRUD), stock e imágenes, y gestión de pedidos.</p>
                </div>
              </div>
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#e0a96d] hover:bg-[#f5c387] text-black font-black text-xs uppercase tracking-wider transition shadow-lg shrink-0 group hover:scale-105"
              >
                <span>Abrir Panel Admin</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}

          {/* Tarjetas de acciones rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            <Link
              to="/favoritos"
              className="p-5 rounded-2xl bg-[#122317] border border-[#23442a] hover:border-[#4aa036] transition group shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1a3321] text-[#e0a96d] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <Heart size={20} />
              </div>
              <h3 className="font-bold text-sm text-white font-heading">Tus Favoritos</h3>
              <p className="text-xs text-gray-400 mt-1">Revisa los artículos guardados para tu próximo pedido.</p>
            </Link>

            <Link
              to="/"
              className="p-5 rounded-2xl bg-[#122317] border border-[#23442a] hover:border-[#4aa036] transition group shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1a3321] text-[#4aa036] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <ShoppingBag size={20} />
              </div>
              <h3 className="font-bold text-sm text-white font-heading">Catálogo en Stock</h3>
              <p className="text-xs text-gray-400 mt-1">Explorá fertilizantes, carpas indoor y parafernalia.</p>
            </Link>

            <a
              href="https://wa.me/5493764356995?text=Hola%20CultiShop!%20Tengo%20una%20consulta%20sobre%20mi%20cuenta"
              target="_blank"
              rel="noreferrer"
              className="p-5 rounded-2xl bg-[#122317] border border-[#23442a] hover:border-[#25d366]/60 transition group shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1a3321] text-[#25d366] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <WhatsAppIcon size={20} />
              </div>
              <h3 className="font-bold text-sm text-white font-heading">Atención Directa</h3>
              <p className="text-xs text-gray-400 mt-1">Contactate con nuestro equipo en Posadas por WhatsApp.</p>
            </a>
          </div>

          {/* SECCIÓN SEGURIDAD Y CAMBIO DE CONTRASEÑA */}
          <div className="mb-8 bg-[#122317] border border-[#23442a] rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1c3623] text-[#e0a96d] flex items-center justify-center">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">Seguridad de la Cuenta</h3>
                  <p className="text-xs text-gray-400">Actualiza tu contraseña de acceso para mantener protegida tu cuenta.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowChangePassForm(!showChangePassForm);
                  setPassError('');
                  setPassSuccess('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#18311d] hover:bg-[#23442a] text-gray-200 border border-[#2d5a27] transition shadow-sm"
              >
                {showChangePassForm ? 'Ocultar Formulario' : 'Cambiar Contraseña'}
              </button>
            </div>

            {showChangePassForm && (
              <form onSubmit={handlePasswordChangeSubmit} className="mt-4 pt-4 border-t border-[#1f3b25] space-y-4 max-w-lg">
                {passError && (
                  <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-red-400" />
                    <span>{passError}</span>
                  </div>
                )}
                {passSuccess && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0 text-[#25d366]" />
                    <span>{passSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Contraseña Actual (dejar en blanco si te registraste con Google)
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c1810] border border-[#23442a] focus:border-[#4aa036] text-white text-xs outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full px-3.5 py-2.5 pr-9 rounded-xl bg-[#0c1810] border border-[#23442a] focus:border-[#4aa036] text-white text-xs outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repetir nueva contraseña"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c1810] border border-[#23442a] focus:border-[#4aa036] text-white text-xs outline-none transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingPass}
                    className="px-5 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
                  >
                    {isSubmittingPass ? 'Guardando...' : 'Actualizar Contraseña'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Banner de beneficios */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#142619] via-[#1a3321] to-[#142619] border border-[#2d5a27] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-[#e0a96d] shrink-0" />
              <p className="text-xs text-gray-200">
                Tu cuenta está activa bajo los lineamientos oficiales de CultiShop y la Ley 27.350.
              </p>
            </div>
            <Link
              to="/"
              className="text-xs font-bold text-[#e0a96d] hover:text-white transition whitespace-nowrap"
            >
              Ir a la tienda →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA DE FORMULARIO (LOGIN / REGISTRO)
  // ==========================================
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="bg-[#0e1c12] border-2 border-[#2d5a27] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Adorno superior dorado */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2d5a27] via-[#e0a96d] to-[#2d5a27]" />

          {/* Logo y Encabezado */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <CultiShopLogo size="md" showText={false} />
            </div>
            <span className="text-[11px] font-bold tracking-widest text-[#e0a96d] uppercase block">
              PORTAL DE CLIENTES
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading mt-1">
              {activeTab === 'login' ? 'Bienvenido a CultiShop' : 'Creá tu Cuenta Oficial'}
            </h1>
            <p className="text-xs text-gray-400 mt-1.5">
              {activeTab === 'login'
                ? 'Ingresá a tu cuenta para gestionar tus compras e insumos.'
                : 'Registrate para acceder al catálogo con stock en Posadas.'}
            </p>
          </div>

          {/* Alternancia de Pestañas (Tabs) */}
          <div className="grid grid-cols-2 p-1 bg-[#09150d] rounded-2xl border border-[#1b3420] mb-6">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
                activeTab === 'login'
                  ? 'bg-[#2d5a27] text-white shadow-md shadow-black/40 border border-[#4aa036]/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
                activeTab === 'register'
                  ? 'bg-[#2d5a27] text-white shadow-md shadow-black/40 border border-[#4aa036]/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Mensajes de error / éxito */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-[#25d366]/50 text-[#25d366] text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FORMULARIO DE LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ejemplo@cultishop.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09150d] text-white placeholder-gray-500 border border-[#23422a] focus:outline-none focus:border-[#4aa036] text-xs sm:text-sm transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#09150d] text-white placeholder-gray-500 border border-[#23422a] focus:outline-none focus:border-[#4aa036] text-xs sm:text-sm transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition"
                    aria-label="Alternar visibilidad de contraseña"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-black/50 border border-[#4aa036]/50 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>Iniciando sesión...</span>
                ) : (
                  <>
                    <span>Ingresar a Mi Cuenta</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORMULARIO DE REGISTRO */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Nombre y Apellido
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Tu nombre completo"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09150d] text-white placeholder-gray-500 border border-[#23422a] focus:outline-none focus:border-[#4aa036] text-xs sm:text-sm transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="tuemail@ejemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09150d] text-white placeholder-gray-500 border border-[#23422a] focus:outline-none focus:border-[#4aa036] text-xs sm:text-sm transition shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Contraseña (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#09150d] text-white placeholder-gray-500 border border-[#23422a] focus:outline-none focus:border-[#4aa036] text-xs sm:text-sm transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition"
                    aria-label="Alternar visibilidad de contraseña"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Casilla obligatoria de mayoría de edad (+18) */}
              <div className="p-3.5 rounded-2xl bg-[#09150d] border border-[#23422a] hover:border-[#4aa036]/60 transition">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAdult}
                    onChange={(e) => setIsAdult(e.target.checked)}
                    required
                    className="mt-0.5 w-4 h-4 rounded text-[#4aa036] bg-[#142619] border-gray-600 focus:ring-[#4aa036] focus:ring-offset-0 cursor-pointer accent-[#2d5a27]"
                  />
                  <div className="text-xs leading-relaxed text-gray-300">
                    <strong className="text-white block font-heading text-[12px]">
                      Declaración de Mayoría de Edad (Obligatorio)
                    </strong>
                    <span>
                      Declaro bajo juramento ser <span className="text-[#e0a96d] font-bold">mayor de 18 años</span> para acceder, comprar y registrarme en CultiShop bajo la normativa legal vigente.
                    </span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !isAdult}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-black/50 flex items-center justify-center gap-2 mt-2 ${
                  isAdult
                    ? 'bg-[#2d5a27] hover:bg-[#38761d] text-white border border-[#4aa036]/50 cursor-pointer'
                    : 'bg-[#18301e] text-gray-500 border border-[#23422a] cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span>Registrando cuenta...</span>
                ) : (
                  <>
                    <span>Completar Registro</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Separador con "O continuar con" */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1b3420]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-[#0e1c12] px-3 text-gray-400">
                O continuar con
              </span>
            </div>
          </div>

          {/* Botón de Google OAuth integrado sin fondo blanco */}
          <div className="flex flex-col items-center justify-center w-full min-h-[44px]">
            <div 
              className="google-btn-wrapper w-full flex justify-center items-center overflow-hidden rounded-full bg-transparent transition-opacity"
              style={{ colorScheme: 'light' }}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="pill"
                size="large"
                text={activeTab === 'login' ? 'signin_with' : 'signup_with'}
                locale="es"
                containerProps={{
                  style: {
                    display: 'flex',
                    justifyContent: 'center',
                    background: 'transparent',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

