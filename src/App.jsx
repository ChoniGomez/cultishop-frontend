import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { ProductSection } from './components/ProductSection';
import { CultiShopLogo } from './components/CultiShopLogo';
import { WhatsAppIcon } from './components/WhatsAppIcon';
import { HeroCarousel } from './components/HeroCarousel';
import { AuthView } from './components/AuthView';
import { NotFound } from './components/NotFound';
import { FavoritesView } from './components/FavoritesView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { CartDrawer } from './components/CartDrawer';
import { 
  MapPin, 
  Clock, 
  Instagram, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

const HomePage = () => (
  <div className="space-y-4">
    {/* HERO CAROUSEL ROTATIVO */}
    <HeroCarousel interval={5000} />

    {/* SECCIÓN DE PRODUCTOS */}
    <div id="catalogo">
      <ProductSection />
    </div>

    {/* BANNER TRANSPORTE LEGAL (Directo del Flyer 5) */}
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-[#0d1c11] via-[#152a1b] to-[#0d1c11] border-2 border-[#2d5a27] rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#2d5a27]/40 text-[#4aa036] text-xs font-bold uppercase tracking-wider border border-[#4aa036]/40">
              <ShieldCheck size={16} />
              Cumplí la Ley 27.350
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-heading leading-tight">
              TRANSPORTÁ LEGAL, <span className="text-[#e0a96d] block">TRANSPORTÁ SEGURO.</span>
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Contenedores herméticos Grower (GT5, GT25, GT40) de alto impacto con filtro de rayos UV y sistema de sellado hermético que conserva terpenos, humedad y potencia.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <a
              href="https://wa.me/5493764356995?text=Hola%20CultiShop!%20Quiero%20consultar%20por%20los%20Contenedores%20de%20transporte%20legal%20Grower"
              target="_blank"
              rel="noreferrer"
              className="bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold px-6 py-3.5 rounded-full transition flex items-center justify-center gap-2 shadow-lg border border-[#4aa036]/50 text-sm group"
            >
              <WhatsAppIcon size={18} className="text-[#25d366] group-hover:scale-110 transition-transform" />
              <span>Consultar Contenedores</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    {/* SECCIÓN NUEVO HORARIO & UBICACIÓN (Directo del Flyer 1) */}
    <section id="horarios" className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-[#0e1a12] border border-[#1f3b25] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        {/* Fondo sutil tipo mesa de madera rústica en la base */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="flex justify-center mb-3">
            <CultiShopLogo size="md" showText={false} />
          </div>
          <span className="text-xs font-extrabold tracking-widest text-[#4aa036] uppercase block mb-1">
            ATENCIÓN EN NUESTRO LOCAL
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#e0a96d] font-heading tracking-wide uppercase text-glow-gold">
            NUEVO HORARIO
          </h2>
        </div>

        {/* Grilla de horarios de atención */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
          {/* Lunes a Viernes */}
          <div className="bg-[#122317] border border-[#23442a] p-6 rounded-2xl text-center shadow-md">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-3">
              Lunes a Viernes
            </span>
            <div className="flex justify-center items-center gap-4 text-base sm:text-lg font-black text-white font-heading">
              <span className="bg-[#0a140d] px-3.5 py-2 rounded-xl border border-[#1f3b25] text-[#e0a96d]">
                09:00 a 12:00
              </span>
              <span className="text-gray-500 font-normal">y</span>
              <span className="bg-[#0a140d] px-3.5 py-2 rounded-xl border border-[#1f3b25] text-[#e0a96d]">
                16:30 a 19:30
              </span>
            </div>
          </div>

          {/* Sábados */}
          <div className="bg-[#122317] border border-[#23442a] p-6 rounded-2xl text-center shadow-md">
            <span className="text-xs font-black uppercase tracking-wider text-gray-400 block mb-3">
              Sábados
            </span>
            <div className="flex justify-center items-center gap-4 text-base sm:text-lg font-black text-white font-heading">
              <span className="bg-[#0a140d] px-3.5 py-2 rounded-xl border border-[#1f3b25] text-[#e0a96d]">
                08:30 a 12:00
              </span>
              <span className="text-gray-500 font-normal">y</span>
              <span className="bg-[#0a140d] px-3.5 py-2 rounded-xl border border-[#1f3b25] text-[#e0a96d]">
                16:30 a 19:00
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 rounded-full bg-red-950/40 text-red-300 border border-red-800/40 text-xs font-bold uppercase tracking-wider">
            Domingo Cerrado
          </span>
        </div>

        {/* Dirección física destacada (del flyer 1) */}
        <div className="bg-gradient-to-r from-[#23170e] via-[#3a2717] to-[#23170e] border-2 border-[#e0a96d]/40 rounded-2xl p-6 text-center max-w-2xl mx-auto shadow-xl">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-widest mb-1">
            <MapPin size={16} className="text-[#e0a96d]" />
            Visitanos en nuestro local
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-[#e0a96d] font-heading tracking-wider mb-3">
            AV LOPEZ Y PLANES 2919
          </h3>
          <p className="text-xs text-gray-300 mb-4">
            Posadas, Misiones, Argentina. Asesoramiento personalizado en cultivo.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://maps.google.com/?q=Av.+López+y+Planes+2919,+Posadas"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#0d1a11] hover:bg-[#152a1b] text-white px-5 py-2.5 rounded-full text-xs font-bold transition border border-[#2d5a27]"
            >
              <span>Abrir en Google Maps</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
);

const PlaceholderPage = ({ title, description }) => (
  <div className="max-w-4xl mx-auto px-4 py-24 text-center">
    <div className="flex justify-center mb-4">
      <CultiShopLogo size="lg" showText={false} />
    </div>
    <h2 className="text-3xl font-black text-white font-heading mb-4">{title}</h2>
    <p className="text-gray-400 mb-8 max-w-md mx-auto">{description || "Estamos actualizando este contenido para vos. Podés escribirnos directamente a nuestro WhatsApp oficial."}</p>
    <a
      href="https://wa.me/5493764356995"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 bg-[#25d366] hover:bg-[#20ba5a] text-black font-bold px-6 py-3 rounded-full text-sm transition shadow-lg hover:scale-105"
    >
      <WhatsAppIcon size={18} />
      <span>Consultar por WhatsApp</span>
    </a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#0a140d] text-gray-100 selection:bg-[#38761d] selection:text-white">
            <AgeVerificationModal />
            <CartDrawer />
            <Navbar />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/productos" element={<HomePage />} />
              <Route path="/categoria/:category/:subcategory" element={<ProductSection />} />
              <Route path="/categoria/:slug" element={<ProductSection />} />
              <Route path="/sobre-nosotros" element={<PlaceholderPage title="Sobre CultiShop" description="Somos CultiShop. Te brindamos los mejores insumos para que tu cultivo crezca sano y productivo." />} />
              <Route path="/faq" element={<PlaceholderPage title="Preguntas Frecuentes" description="¿Dudas sobre dosis de fertilizantes, combate de plagas o transporte bajo Ley 27.350? Escribinos." />} />
              <Route path="/contacto" element={<PlaceholderPage title="Contactanos" description="Estamos en Av. López y Planes 2919, Posadas. WhatsApp: +54 9 376 435-6995." />} />
              <Route path="/favoritos" element={<FavoritesView />} />
              <Route path="/ingresar" element={<AuthView />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

        {/* BOTÓN FLOTANTE DE WHATSAPP (Directo para pedidos) */}
        <a
          href="https://wa.me/5493764356995?text=Hola%20CultiShop!%20Quiero%20hacer%20un%20pedido%20o%20consulta"
          target="_blank"
          rel="noreferrer"
          title="Chatear con CultiShop por WhatsApp"
          className="fixed bottom-6 right-6 z-40 bg-[#25d366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-2xl shadow-[#25d366]/40 flex items-center gap-2.5 group transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <WhatsAppIcon size={24} className="text-white fill-current drop-shadow-sm" />
          <span className="hidden group-hover:inline-block font-sans text-xs font-black pr-1.5 text-white tracking-wide">
            Pedir por WhatsApp
          </span>
        </a>

        {/* FOOTER CORPORATIVO CULTISHOP */}
        <footer className="bg-[#08100a] text-gray-400 border-t border-[#162a1b] pt-14 pb-8">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Columna Marca */}
            <div className="space-y-4">
              <CultiShopLogo size="md" />
              <p className="text-xs text-gray-400 leading-relaxed">
                Tu tienda especializada en cultivo en Posadas. Insumos de calidad, resultados comprobados y asesoramiento técnico.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://instagram.com/culti.shopp"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#122317] border border-[#23422a] flex items-center justify-center text-[#e0a96d] hover:text-white hover:border-[#4aa036] transition"
                  title="Instagram @culti.shopp"
                >
                  <Instagram size={17} />
                </a>
                <a
                  href="https://wa.me/5493764356995"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#122317] border border-[#23422a] flex items-center justify-center text-[#25d366] hover:bg-[#25d366] hover:text-black hover:border-[#25d366] hover:scale-110 transition-all duration-200 shadow-sm"
                  title="WhatsApp CultiShop"
                >
                  <WhatsAppIcon size={17} />
                </a>
              </div>
            </div>

            {/* Columna Contacto */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider font-heading">
                Contacto Oficial
              </h4>
              <ul className="text-xs space-y-2.5">
                <li className="flex items-start gap-2">
                  <MapPin size={15} className="text-[#e0a96d] shrink-0 mt-0.5" />
                  <span>Av. López y Planes 2919, Posadas, Misiones</span>
                </li>
                <li className="flex items-center gap-2">
                  <WhatsAppIcon size={15} className="text-[#25d366] shrink-0" />
                  <a href="https://wa.me/5493764356995" target="_blank" rel="noreferrer" className="hover:text-[#25d366] transition font-medium">
                    +54 9 376 435-6995
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Instagram size={15} className="text-[#e0a96d] shrink-0" />
                  <a href="https://instagram.com/culti.shopp" target="_blank" rel="noreferrer" className="hover:text-white transition">
                    @culti.shopp
                  </a>
                </li>
              </ul>
            </div>

            {/* Columna Horarios */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider font-heading">
                Horario de Atención
              </h4>
              <ul className="text-xs space-y-2 text-gray-300">
                <li><strong className="text-white">Lunes a Viernes:</strong><br/>09:00 a 12:00 • 16:30 a 19:30</li>
                <li><strong className="text-white">Sábados:</strong><br/>08:30 a 12:00 • 16:30 a 19:00</li>
                <li className="text-gray-400"><strong className="text-red-400">Domingos:</strong> Cerrado</li>
              </ul>
            </div>

            {/* Columna Marcas */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider font-heading">
                Marcas Destacadas
              </h4>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="bg-[#122317] border border-[#1f3b25] px-2.5 py-1 rounded-md text-gray-300">Namasté Nutrientes</span>
                <span className="bg-[#122317] border border-[#1f3b25] px-2.5 py-1 rounded-md text-gray-300">Mamboretá</span>
                <span className="bg-[#122317] border border-[#1f3b25] px-2.5 py-1 rounded-md text-gray-300">Grower Things</span>
                <span className="bg-[#122317] border border-[#1f3b25] px-2.5 py-1 rounded-md text-gray-300">Roots</span>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-[#162a1b] text-center text-xs text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} CULTISHOP — Todos los derechos reservados.</p>
            <p className="text-[11px] text-gray-400">Grow • Cultiva • Crece • Posadas, Misiones</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  </ShopProvider>
</AuthProvider>
  );
}

export default App;
