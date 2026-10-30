import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { ProductSection } from './components/ProductSection';
import { CultiShopLogo } from './components/CultiShopLogo';
import { WhatsAppIcon } from './components/WhatsAppIcon';
import { HeroCarousel } from './components/HeroCarousel';
import { HomeFeaturedProducts } from './components/HomeFeaturedProducts';
import { AuthView } from './components/AuthView';
import { NotFound } from './components/NotFound';
import { FavoritesView } from './components/FavoritesView';
import { AdminDashboard } from './components/AdminDashboard';
import { ProductDetail } from './components/ProductDetail';
import { CheckoutView } from './components/CheckoutView';
import { AboutView } from './components/AboutView';
import { FaqView } from './components/FaqView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider } from './context/ShopContext';
import { CartDrawer } from './components/CartDrawer';
import { 
  MapPin, 
  Instagram 
} from 'lucide-react';

const HomePage = () => (
  <div className="space-y-4">
    {/* HERO CAROUSEL ROTATIVO */}
    <HeroCarousel interval={5000} />

    {/* SECCIÓN DE PRODUCTOS DESTACADOS Y ÚLTIMOS INGRESOS (OPTIMIZADA) */}
    <HomeFeaturedProducts />
  </div>
);

const CatalogPage = () => (
  <div id="catalogo" className="w-full">
    <ProductSection />
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
          <div className="min-h-screen w-full flex flex-col bg-[#0a140d] text-gray-100 selection:bg-[#38761d] selection:text-white overflow-x-hidden">
            <AgeVerificationModal />
            <CartDrawer />
            <Navbar />
          
          <main className="flex-grow w-full overflow-x-hidden">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalogo" element={<CatalogPage />} />
                <Route path="/productos" element={<CatalogPage />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/producto/:id/:slug" element={<ProductDetail />} />
                <Route path="/categoria/:category/:subcategory" element={<ProductSection />} />
                <Route path="/categoria/:slug" element={<ProductSection />} />
                <Route path="/sobre-nosotros" element={<AboutView />} />
                <Route path="/faq" element={<FaqView />} />
                <Route path="/contacto" element={<PlaceholderPage title="Contactanos" description="Estamos en Av. López y Planes casi Lavalle (&quot;adentro del ACUARIUM&quot;), Posadas, Misiones. WhatsApp: +54 9 376 435-6995." />} />
                <Route path="/favoritos" element={<FavoritesView />} />
                <Route path="/finalizar-compra" element={<CheckoutView />} />
                <Route path="/checkout" element={<CheckoutView />} />
                <Route path="/ingresar" element={<AuthView />} />
                <Route path="/perfil" element={<AuthView />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
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
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Columna 1: Marca CultiShop */}
            <div className="space-y-3">
              <CultiShopLogo size="md" />
              <p className="text-xs text-gray-400 leading-relaxed text-justify">
                Tu tienda especializada en cultivo en Posadas. Insumos seleccionados de alta calidad, resultados comprobados y asesoramiento técnico profesional para cada etapa de tu cultivo.
              </p>
              <span className="inline-block text-[10px] tracking-widest text-[#e0a96d] font-bold uppercase">
                GROW • CULTIVA • CRECE
              </span>
            </div>

            {/* Columna 2: Catálogo de la Tienda */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider font-heading">
                Catálogo de la Tienda
              </h4>
              <ul className="text-xs space-y-2">
                <li>
                  <Link to="/categoria/fertilizantes" className="hover:text-[#4aa036] transition">
                    Fertilizantes y Bioestimulantes
                  </Link>
                </li>
                <li>
                  <Link to="/categoria/control-de-plagas" className="hover:text-[#4aa036] transition">
                    Control de Plagas y Sanidad
                  </Link>
                </li>
                <li>
                  <Link to="/categoria/sustratos-y-cultivo" className="hover:text-[#4aa036] transition">
                    Sustratos y Enmiendas
                  </Link>
                </li>
                <li>
                  <Link to="/categoria/indoor" className="hover:text-[#4aa036] transition">
                    Indoor e Iluminación
                  </Link>
                </li>
                <li>
                  <Link to="/" className="text-[#e0a96d] hover:underline transition font-semibold">
                    Ver Todos los Productos &rarr;
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 3: Institucional & Comunidad */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider font-heading">
                Institucional & Comunidad
              </h4>
              <ul className="text-xs space-y-2">
                <li>
                  <Link to="/sobre-nosotros" className="text-gray-300 hover:text-[#4aa036] transition font-medium flex items-center gap-1.5">
                    <span>Sobre Nosotros (Historia & Valores)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/sobre-nosotros#visitanos" className="text-gray-300 hover:text-[#e0a96d] transition flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#e0a96d]" />
                    <span>Visítanos en Posadas (Mapa)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/sobre-nosotros#instagram-videos" className="text-gray-300 hover:text-[#e0a96d] transition flex items-center gap-1.5">
                    <Instagram size={13} className="text-[#e0a96d]" />
                    <span>Galería de Videos Instagram</span>
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-[#4aa036] transition">
                    Preguntas Frecuentes (FAQ)
                  </Link>
                </li>
                <li>
                  <a
                    href="https://instagram.com/culti.shopp"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#e0a96d] hover:underline transition flex items-center gap-1"
                  >
                    <span>Seguinos en @culti.shopp &rarr;</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Columna 4: Contacto Oficial & Local */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider font-heading">
                Local Físico & Contacto
              </h4>
              <ul className="text-xs space-y-2.5">
                <li className="flex items-start gap-2">
                  <MapPin size={15} className="text-[#e0a96d] shrink-0 mt-0.5" />
                  <div>
                    <span>Av. López y Planes casi Lavalle (&ldquo;adentro del ACUARIUM&rdquo;), Posadas, Misiones</span>
                    <div className="pt-0.5">
                      <Link to="/sobre-nosotros#visitanos" className="text-[#e0a96d] hover:underline text-[11px] font-semibold inline-flex items-center gap-1">
                        <span>Ver mapa interactivo &rarr;</span>
                      </Link>
                    </div>
                  </div>
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
                <li className="text-[11px] text-gray-400 pt-1 border-t border-[#162a1b] leading-relaxed">
                  Retiro por local sin costo • Envíos locales (Moto / Uber / Líder Mandados) y Nacionales (Correo Argentino / Vía Cargo).
                </li>
              </ul>
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
