import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WhatsAppIcon } from './WhatsAppIcon';

const SLIDES = [
  {
    id: 1,
    badge: 'SANIDAD VEGETAL • COMBATE EFICAZ',
    subtitle: 'Soluciones confiables para el cuidado de tus plantas',
    titlePrefix: 'PROTEGÉ TU CULTIVO CONTRA ',
    titleHighlight: 'TODO TIPO DE PLAGAS',
    description: 'Fungicidas, insecticidas y acaricidas Mamboretá oficiales (D, CONFI, FOLI, ABA, OIL). Resultados comprobados para mantener tu jardín sano, fuerte y productivo.',
    ctaText: 'Ver Control de Plagas',
    ctaLink: '/categoria/control-de-plagas',
    whatsappMessage: 'Hola CultiShop! Quiero consultar por productos Mamboretá para control de plagas',
    whatsappText: 'Consultar Mamboretá',
    image: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=1800',
    accentColor: '#4aa036'
  },
  {
    id: 2,
    badge: 'NUTRICIÓN BIOESTIMULANTE • MÁXIMO RENDIMIENTO',
    subtitle: 'Grow • Cultiva • Crece en Posadas',
    titlePrefix: 'EXPLOSIÓN DE RESINA, FLORES Y ',
    titleHighlight: 'RAÍCES FUERTES',
    description: 'Línea completa Namasté Nutrientes: Oro Negro, Amazonia Micorrizas, Flora Booster y Trico+. Todo lo que tu jardín necesita lo tenemos en stock permanente.',
    ctaText: 'Ver Fertilizantes',
    ctaLink: '/categoria/fertilizantes',
    whatsappMessage: 'Hola CultiShop! Consulto por la línea de fertilizantes Namasté Nutrientes',
    whatsappText: 'Pedir Fertilizantes',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1800',
    accentColor: '#e0a96d'
  },
  {
    id: 3,
    badge: 'CUMPLÍ LA LEY 27.350 • REPROCANN OFICIAL',
    subtitle: 'Seguridad, hermeticidad y control UV',
    titlePrefix: 'TRANSPORTÁ LEGAL, ',
    titleHighlight: 'TRANSPORTÁ SEGURO',
    description: 'Contenedores herméticos Grower (GT5, GT25, GT40) de alto impacto con filtro UV, código QR de normativa legal y sellado anti-olor para curado y transporte óptimo.',
    ctaText: 'Ver Contenedores',
    ctaLink: '/categoria/transporte-legal',
    whatsappMessage: 'Hola CultiShop! Quiero consultar por los Contenedores herméticos Grower de Ley 27.350',
    whatsappText: 'Consultar Transporte',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=1800',
    accentColor: '#4aa036'
  },
  {
    id: 4,
    badge: 'INDOOR • ILUMINACIÓN • EQUIPAMIENTO',
    subtitle: 'Tecnología y precisión para tu espacio',
    titlePrefix: 'CARPAS, MEDICIÓN Y KITS ',
    titleHighlight: 'COMPLETOS DE CULTIVO',
    description: 'Equipate con lo mejor: carpas indoor, paneles LED de alta eficiencia, instrumentos de medición PH/EC, ventilación y kits completos para iniciar o potenciar tu cosecha.',
    ctaText: 'Explorar Indoor',
    ctaLink: '/categoria/indoor',
    whatsappMessage: 'Hola CultiShop! Quiero asesoramiento para equipamiento y carpas de cultivo Indoor',
    whatsappText: 'Armar Mi Espacio',
    image: 'https://images.unsplash.com/photo-1624990833801-56c1b6a56ba7?auto=format&fit=crop&q=80&w=1800',
    accentColor: '#e0a96d'
  }
];

export const HeroCarousel = ({ interval = 5000 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Rotación automática con pausa en hover
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, interval, nextSlide]);

  // Soporte para gestos táctiles (swipe en móviles)
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      nextSlide(); // Swipe izquierda -> siguiente
    } else if (diff < -50) {
      prevSlide(); // Swipe derecha -> anterior
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#07110a] border-b border-[#1f3b25] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Banner destacado rotativo"
    >
      {/* Contenedor principal de diapositivas */}
      <div className="relative min-h-[520px] sm:min-h-[580px] md:min-h-[640px] flex items-center">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Imagen de fondo con gradientes oscuros CultiShop */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.subtitle}
                  className={`w-full h-full object-cover object-center transform transition-transform duration-10000 ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                {/* Capas de overlay para legibilidad y estética corporativa */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#07110a]/95 via-[#0a160d]/85 to-[#07110a]/60 sm:to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07110a] via-transparent to-[#07110a]/80" />
                <div className="absolute inset-0 bg-[#0d1a11]/40 mix-blend-multiply" />
              </div>

              {/* Contenido textual superpuesto */}
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                <div className="max-w-2xl lg:max-w-3xl space-y-4 sm:space-y-6">
                  {/* Badge temático */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#122317]/90 border border-[#2d5a27] text-[11px] sm:text-xs font-bold text-[#e0a96d] uppercase tracking-widest shadow-lg backdrop-blur-md animate-in fade-in duration-500">
                    <Sparkles size={13} className="text-[#e0a96d] shrink-0" />
                    <span>{slide.badge}</span>
                  </div>

                  {/* Subtítulo corporativo */}
                  <p className="text-[#e0a96d] text-sm sm:text-base font-semibold tracking-wide">
                    {slide.subtitle}
                  </p>

                  {/* Título principal con tono mostaza/dorado */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white font-heading leading-[1.15] tracking-tight">
                    {slide.titlePrefix}
                    <span className="text-[#e0a96d] text-glow-gold block sm:inline">
                      {slide.titleHighlight}
                    </span>
                  </h1>

                  {/* Descripción detallada */}
                  <p className="text-gray-200 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl text-shadow-sm">
                    {slide.description}
                  </p>

                  {/* Botones de acción */}
                  <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <Link
                      to={slide.ctaLink}
                      className="bg-[#2d5a27] hover:bg-[#38761d] text-white font-black px-7 py-3.5 sm:py-4 rounded-full transition-all shadow-xl shadow-black/50 border border-[#4aa036]/50 flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wider uppercase font-heading hover:scale-105 active:scale-95"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight size={17} />
                    </Link>

                    <a
                      href={`https://wa.me/5493764356995?text=${encodeURIComponent(slide.whatsappMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#122517]/90 hover:bg-[#1a3521] text-gray-200 hover:text-white font-bold px-6 py-3.5 sm:py-4 rounded-full transition-all border border-[#23442a] hover:border-[#25d366]/60 flex items-center justify-center gap-2.5 text-xs sm:text-sm backdrop-blur-md group hover:scale-105 active:scale-95"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#25d366]/20 flex items-center justify-center text-[#25d366] group-hover:scale-110 transition-transform">
                        <WhatsAppIcon size={14} />
                      </div>
                      <span>{slide.whatsappText}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flechas de navegación manual (Anterior / Siguiente) */}
      <button
        onClick={prevSlide}
        aria-label="Diapositiva anterior"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0a160d]/70 hover:bg-[#2d5a27] text-gray-300 hover:text-white border border-[#234428] hover:border-[#4aa036] flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-xl hover:scale-110 active:scale-90 group"
      >
        <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Siguiente diapositiva"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0a160d]/70 hover:bg-[#2d5a27] text-gray-300 hover:text-white border border-[#234428] hover:border-[#4aa036] flex items-center justify-center transition-all duration-200 backdrop-blur-md shadow-xl hover:scale-110 active:scale-90 group"
      >
        <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Indicadores de puntos / Dots en la parte inferior */}
      <div className="absolute bottom-5 sm:bottom-7 left-0 right-0 z-20 flex items-center justify-center gap-2.5 sm:gap-3">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;

          return (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              aria-label={`Ir a diapositiva ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                isActive
                  ? 'w-8 sm:w-10 bg-[#e0a96d] shadow-lg shadow-[#e0a96d]/40'
                  : 'w-2.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          );
        })}
      </div>

      {/* Cinta de atributos inferior: CALIDAD • DURABILIDAD • EFICIENCIA */}
      <div className="relative z-20 bg-[#09150d]/90 border-t border-[#18311d] py-2.5 px-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-[11px] sm:text-xs font-bold tracking-widest text-gray-300 uppercase">
          <span className="flex items-center gap-2">
            <span className="text-[#4aa036]">🌱</span> CALIDAD ASEGURADA
          </span>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="text-[#4aa036]">🌿</span> DURABILIDAD & RENDIMIENTO
          </span>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <span className="flex items-center gap-2">
            <span className="text-[#4aa036]">🌾</span> EFICIENCIA COMPROBADA
          </span>
        </div>
      </div>
    </section>
  );
};

