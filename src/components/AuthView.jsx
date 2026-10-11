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
  Sparkles
} from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CultiShopLogo } from './CultiShopLogo';
import { WhatsAppIcon } from './WhatsAppIcon';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '104719283749-demo-cultishop-client.apps.googleusercontent.com';

export const AuthView = () => {
  const { user, login, register, loginWithGoogle, logout, loading } = useAuth();
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

  // ==========================================
  // VISTA SI EL USUARIO YA ESTÁ AUTENTICADO
  // ==========================================
  if (user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-[#0e1c12] border-2 border-[#2d5a27] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Adorno superior dorado */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2d5a27] via-[#e0a96d] to-[#2d5a27]" />

          {/* Encabezado del perfil */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-[#1f3b25]">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2d5a27] to-[#18311d] border-2 border-[#4aa036] flex items-center justify-center text-white text-2xl font-black font-heading shadow-lg shadow-black/50">
                {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h2 className="text-2xl font-black text-white font-heading">{user.name}</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#18311d] border border-[#4aa036]/50 text-[10px] font-bold text-[#4aa036] uppercase">
                    <ShieldCheck size={12} /> +18 Verificado
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                <span className="inline-block mt-1 text-[11px] font-semibold text-[#e0a96d]">
                  Cliente Oficial CultiShop
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

          {/* Botón de Google OAuth */}
          <div className="flex flex-col items-center justify-center w-full min-h-[44px]">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="pill"
                size="large"
                text={activeTab === 'login' ? 'signin_with' : 'signup_with'}
                locale="es"
              />
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

