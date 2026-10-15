import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, ShieldCheck, Clock, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WhatsAppIcon } from './WhatsAppIcon';
import { buildApiUrl } from '../config/api';

const DEFAULT_BANNERS = [
  {
    id: 1,
    badge: 'SANIDAD VEGETAL • COMBATE EFICAZ',
    subtitle: 'Soluciones confiables para el cuidado de tus plantas',
    titlePrefix: 'PROTEGÉ TU CULTIVO CONTRA ',
    titleHighlight: 'TODO TIPO DE PLAGAS',
    title: 'PROTEGÉ TU CULTIVO CONTRA TODO TIPO DE PLAGAS',
    description: 'Fungicidas, insecticidas y acaricidas Mamboretá oficiales (D, CONFI, FOLI, ABA, OIL). Resultados comprobados para mantener tu jardín sano, fuerte y productivo.',
    ctaText: 'Ver Control de Plagas',
    button_text: 'Ver Control de Plagas',
    ctaLink: '/categoria/control-de-plagas',
    link_url: '/categoria/control-de-plagas',
    whatsappMessage: 'Hola CultiShop! Quiero consultar por productos Mamboretá para control de plagas',
    whatsappText: 'Consultar Mamboretá',
    image: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=1800',
    image_url: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=1800',
    accentColor: '#4aa036'
  },
  {
    id: 2,
    badge: 'NUTRICIÓN BIOESTIMULANTE • MÁXIMO RENDIMIENTO',
    subtitle: 'Grow • Cultiva • Crece en Posadas',
    titlePrefix: 'EXPLOSIÓN DE RESINA, FLORES Y ',
    titleHighlight: 'RAÍCES FUERTES',
    title: 'EXPLOSIÓN DE RESINA, FLORES Y RAÍCES FUERTES',
    description: 'Línea completa Namasté Nutrientes: Oro Negro, Amazonia Micorrizas, Flora Booster y Trico+. Todo lo que tu jardín necesita lo tenemos en stock permanente.',
    ctaText: 'Ver Fertilizantes',
    button_text: 'Ver Fertilizantes',
    ctaLink: '/categoria/fertilizantes',
    link_url: '/categoria/fertilizantes',
    whatsappMessage: 'Hola CultiShop! Consulto por la línea de fertilizantes Namasté Nutrientes',
    whatsappText: 'Pedir Fertilizantes',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1800',
    image_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1800',
    accentColor: '#e0a96d'
  },
  {
    id: 3,
    badge: 'LOCAL OFICIAL EN POSADAS • ATENCIÓN PERSONALIZADA',
    subtitle: 'Av. López y Planes 2919 (entre Lavalle y Santa Catalina)',
    titlePrefix: 'VISITANOS EN NUESTRO LOCAL • ',
    titleHighlight: 'HORARIOS DE ATENCIÓN',
    title: 'VISITANOS EN NUESTRO LOCAL • HORARIOS DE ATENCIÓN',
    description: 'Vení a conocernos, descubrí todo nuestro catálogo en exhibición y recibí asesoramiento técnico profesional para tu cultivo.',
    schedule: {
      weekdays: 'Lun a Vie: 09:00 a 12:00 y 16:30 a 19:30',
      saturday: 'Sábados: 08:30 a 12:00 y 16:30 a 19:00',
      sunday: 'Domingos: Cerrado',
      address: 'Av. López y Planes 2919, Posadas'
    },
    ctaText: 'Cómo Llegar (Google Maps)',
    button_text: 'Cómo Llegar (Google Maps)',
    ctaLink: 'https://maps.google.com/?q=Av.+López+y+Planes+2919,+Posadas',
    link_url: 'https://maps.google.com/?q=Av.+López+y+Planes+2919,+Posadas',
    isExternalCta: true,
    whatsappMessage: 'Hola CultiShop! Quiero consultar los horarios de atención y visita al local',
    whatsappText: 'Consultar por WhatsApp',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1800',
    image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1800',
    accentColor: '#e0a96d'
  },
  {
    id: 4,
    badge: 'INDOOR • ILUMINACIÓN • EQUIPAMIENTO',
    subtitle: 'Tecnología y precisión para tu espacio',
    titlePrefix: 'CARPAS, MEDICIÓN Y KITS ',
    titleHighlight: 'COMPLETOS DE CULTIVO',
    title: 'CARPAS, MEDICIÓN Y KITS COMPLETOS DE CULTIVO',
    description: 'Equipate con lo mejor: carpas indoor, paneles LED de alta eficiencia, instrumentos de medición PH/EC, ventilación y kits completos para iniciar o potenciar tu cosecha.',
    ctaText: 'Explorar Indoor',
    button_text: 'Explorar Indoor',
    ctaLink: '/categoria/indoor',
    link_url: '/categoria/indoor',
    whatsappMessage: 'Hola CultiShop! Quiero asesoramiento para equipamiento y carpas de cultivo Indoor',
    whatsappText: 'Armar Mi Espacio',
    image: 'https://images.unsplash.com/photo-1624990833801-56c1b6a56ba7?auto=format&fit=crop&q=80&w=1800',
    image_url: 'https://images.unsplash.com/photo-1624990833801-56c1b6a56ba7?auto=format&fit=crop&q=80&w=1800',
    accentColor: '#e0a96d'
  }
];

const BANNERS_STORAGE_KEY = 'cultishop_banners_cache_v2';
const BANNERS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos de validez máxima para caché local

export const HeroCarousel = ({ interval = 5000 }) => {
  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem(BANNERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.timestamp && Array.isArray(parsed.banners)) {
          if (Date.now() - parsed.timestamp < BANNERS_CACHE_TTL_MS && parsed.banners.length > 0) {
            return parsed.banners;
          }
        }
      }
    } catch (e) {
      console.warn('Error leyendo caché de banners:', e);
    }
    return [];
  });

  const [loadingBanners, setLoadingBanners] = useState(() => {
    try {
      const saved = localStorage.getItem(BANNERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.timestamp && Date.now() - parsed.timestamp < BANNERS_CACHE_TTL_MS && parsed.banners?.length > 0) {
          return false;
        }
      }
    } catch (e) {}
    return true;
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Cargar banners activos desde el backend (prioriza respuesta fresca de la API)
  useEffect(() => {
    let isMounted = true;
    const fetchActiveBanners = async () => {
      try {
        const res = await fetch(buildApiUrl('banners'));
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data?.banners || data?.data || []);
          if (isMounted) {
            if (Array.isArray(list) && list.length > 0) {
              setBanners(list);
              try {
                localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify({
                  timestamp: Date.now(),
                  banners: list
                }));
              } catch (e) {}
            } else if (banners.length === 0) {
              setBanners(DEFAULT_BANNERS);
            }
          }
        } else if (banners.length === 0) {
          setBanners(DEFAULT_BANNERS);
        }
      } catch (err) {
        console.warn('HeroCarousel: utilizando banners de contingencia.', err);
        if (banners.length === 0) {
          setBanners(DEFAULT_BANNERS);
        }
      } finally {
        if (isMounted) {
          setLoadingBanners(false);
        }
      }
    };

    fetchActiveBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = banners.length || 1;

  // Garantizar que currentSlide no exceda la cantidad de banners al actualizarse
  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [currentSlide, totalSlides]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Rotación automática con pausa en hover
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, interval, nextSlide, totalSlides]);

  // Soporte para gestos táctiles (swipe en dispositivos móviles)
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

  // Renderizar Esqueleto de Carga si está obteniendo los banners del backend
  if (loadingBanners && banners.length === 0) {
    return (
      <section
        className="relative w-full overflow-hidden bg-[#0b1610] border-b border-[#1f3b25] min-h-[280px] sm:min-h-[340px] md:min-h-[400px] md:h-[400px] flex items-center justify-center select-none"
        aria-label="Cargando banner destacado"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1610] via-[#102416] to-[#0b1610] animate-pulse" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#142619] border border-[#23422a] flex items-center justify-center text-[#e0a96d] shadow-lg">
            <Sparkles size={22} className="animate-spin text-[#4aa036]" style={{ animationDuration: '3s' }} />
          </div>
          <div className="space-y-2 w-full flex flex-col items-center">
            <div className="h-3 w-32 bg-[#18311d] rounded-full animate-pulse" />
            <div className="h-7 w-4/5 bg-[#1b3621] rounded-xl animate-pulse" />
            <div className="h-3 w-1/2 bg-[#18311d] rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-[#09150d]/90 px-4 py-1.5 rounded-full border border-[#1f3b25] shadow-inner">
            <div className="w-2 h-2 rounded-full bg-[#4aa036] animate-ping" />
            <span>Cargando novedades en tiempo real...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0b1610] border-b border-[#1f3b25] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Banner destacado rotativo"
    >
      {/* Contenedor principal de diapositivas con altura adaptada y proporción panorámica */}
      <div className="relative min-h-[280px] sm:min-h-[340px] md:min-h-[400px] md:h-[400px] flex items-center justify-center bg-[#0b1610]">
        {banners.map((slide, index) => {
          const isActive = index === currentSlide;
          const imageUrl = slide.image_url || slide.image;
          const showText = slide.show_text !== false && slide.show_overlay !== false;
          const title = slide.title || (slide.titlePrefix ? `${slide.titlePrefix}${slide.titleHighlight || ''}` : 'CultiShop');
          const subtitle = slide.subtitle || '';
          const description = slide.description || '';
          const ctaLink = slide.link_url || slide.ctaLink || '/tienda';
          const ctaText = slide.button_text || slide.ctaText || 'Ver Más';
          const isExternalCta = Boolean(slide.isExternalCta || (typeof ctaLink === 'string' && ctaLink.startsWith('http')));
          const whatsappMessage = slide.whatsappMessage || `Hola CultiShop! Quiero consultar sobre: ${title}`;
          const whatsappText = slide.whatsappText || 'Consultar por WhatsApp';

          // Detectar si la diapositiva corresponde a los horarios o al local oficial
          const isSchedule = Boolean(
            slide.schedule ||
            (title + ' ' + subtitle + ' ' + description).toLowerCase().includes('horario') ||
            (title + ' ' + subtitle + ' ' + description).toLowerCase().includes('local') ||
            (title + ' ' + subtitle + ' ' + description).toLowerCase().includes('visitanos')
          );

          const badgeText = slide.badge || (
            isSchedule 
              ? 'LOCAL OFICIAL EN POSADAS • ATENCIÓN PERSONALIZADA' 
              : 'CULTISHOP OFICIAL • POSADAS'
          );

          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center justify-center bg-[#0b1610] ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Imagen del banner horizontal panorámica con fondo sólido #0b1610 */}
              <div className="absolute inset-0 bg-[#0b1610] flex items-center justify-center overflow-hidden">
                {!showText && ctaLink ? (
                  isExternalCta ? (
                    <a href={ctaLink} target="_blank" rel="noreferrer" className="w-full h-full block cursor-pointer">
                      <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover object-center select-none"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=1800';
                        }}
                      />
                    </a>
                  ) : (
                    <Link to={ctaLink} className="w-full h-full block cursor-pointer">
                      <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover object-center select-none"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=1800';
                        }}
                      />
                    </Link>
                  )
                ) : (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover object-center select-none"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=1800';
                    }}
                  />
                )}

                {/* Atenuación oscura uniforme sólo si showText es true */}
                {showText && (
                  <>
                    <div className="absolute inset-0 bg-[#0b1610]/60 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1610] via-transparent to-[#0b1610]/70 pointer-events-none" />
                  </>
                )}
              </div>

              {/* Contenido textual superpuesto completamente centrado sólo si showText es true */}
              {showText && (
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 w-full flex flex-col items-center justify-center text-center">
                  <div className="space-y-2 sm:space-y-3.5 max-w-3xl flex flex-col items-center text-center">
                    {/* Badge temático centrado */}
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-[#122317]/90 border border-[#2d5a27] text-[9px] sm:text-[11px] md:text-xs font-bold text-[#e0a96d] uppercase tracking-wider sm:tracking-widest shadow-md backdrop-blur-md animate-in fade-in duration-500">
                      <Sparkles size={11} className="text-[#e0a96d] shrink-0" />
                      <span>{badgeText}</span>
                    </div>

                    {/* Subtítulo previo */}
                    {description && subtitle && (
                      <p className="text-[#e0a96d] text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide">
                        {subtitle}
                      </p>
                    )}

                    {/* Título principal centrado con tono mostaza/dorado */}
                    <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white font-heading leading-tight tracking-tight drop-shadow-md">
                      {slide.titlePrefix && slide.titleHighlight ? (
                        <>
                          {slide.titlePrefix}
                          <span className="text-[#e0a96d] text-glow-gold block sm:inline">
                            {slide.titleHighlight}
                          </span>
                        </>
                      ) : title.includes('•') ? (
                        <>
                          {title.split('•')[0].trim()}{' '}
                          <span className="text-[#e0a96d] text-glow-gold block sm:inline">
                            • {title.split('•').slice(1).join('•').trim()}
                          </span>
                        </>
                      ) : (
                        <span className="text-white">{title}</span>
                      )}
                    </h1>

                    {/* Bajada descriptiva centrada */}
                    {(description || subtitle) && (
                      <p className="text-gray-200 text-[11px] sm:text-xs md:text-base leading-relaxed max-w-2xl drop-shadow text-center line-clamp-2 sm:line-clamp-none">
                        {description || subtitle}
                      </p>
                    )}

                    {/* Cuadro destacado de horarios (centrado) */}
                    {isSchedule && (
                      <div className="bg-[#0b160e]/95 backdrop-blur-md border border-[#2d5a27]/70 rounded-2xl p-2.5 sm:p-3.5 max-w-lg w-full shadow-xl space-y-1.5 sm:space-y-2 text-center mx-auto">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[#e0a96d] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                          <Clock size={13} className="shrink-0" />
                          <span>Horarios en Nuestro Local</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
                          <div className="bg-[#122416] p-1.5 sm:p-2 rounded-lg border border-[#1f3b25]">
                            <span className="text-gray-400 block font-semibold text-[9px] sm:text-[10px]">Lunes a Viernes</span>
                            <span className="text-white font-bold text-[11px] sm:text-xs">09:00 a 12:00 <span className="text-[#e0a96d]">•</span> 16:30 a 19:30</span>
                          </div>
                          <div className="bg-[#122416] p-1.5 sm:p-2 rounded-lg border border-[#1f3b25]">
                            <span className="text-gray-400 block font-semibold text-[9px] sm:text-[10px]">Sábados</span>
                            <span className="text-white font-bold text-[11px] sm:text-xs">08:30 a 12:00 <span className="text-[#e0a96d]">•</span> 16:30 a 19:00</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-0.5 text-[9px] sm:text-[10px]">
                          <span className="text-red-400 font-bold bg-red-950/50 px-2 py-0.5 rounded border border-red-900/50">
                            Domingos: Cerrado
                          </span>
                          <span className="text-gray-300 flex items-center gap-1 font-medium">
                            <MapPin size={11} className="text-[#e0a96d]" />
                            Av. López y Planes 2919, Posadas
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Botones de acción centrados */}
                    <div className="pt-1.5 sm:pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                      {isExternalCta ? (
                        <a
                          href={ctaLink}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#2d5a27] hover:bg-[#38761d] text-white font-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all shadow-xl shadow-black/50 border border-[#4aa036]/50 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm tracking-wider uppercase font-heading hover:scale-105 active:scale-95"
                        >
                          {ctaLink.includes('maps') && <MapPin size={14} className="text-[#e0a96d]" />}
                          <span>{ctaText}</span>
                          <ExternalLink size={13} />
                        </a>
                      ) : (
                        <Link
                          to={ctaLink}
                          className="bg-[#2d5a27] hover:bg-[#38761d] text-white font-black px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all shadow-xl shadow-black/50 border border-[#4aa036]/50 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm tracking-wider uppercase font-heading hover:scale-105 active:scale-95"
                        >
                          <span>{ctaText}</span>
                          <ArrowRight size={14} />
                        </Link>
                      )}

                      <a
                        href={`https://wa.me/5493764356995?text=${encodeURIComponent(whatsappMessage)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#122517]/90 hover:bg-[#1a3521] text-gray-200 hover:text-white font-bold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all border border-[#23422a] hover:border-[#25d366]/60 flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm backdrop-blur-md group hover:scale-105 active:scale-95"
                      >
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#25d366]/20 flex items-center justify-center text-[#25d366] group-hover:scale-110 transition-transform">
                          <WhatsAppIcon size={12} />
                        </div>
                        <span>{whatsappText}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Flechas de navegación manual (Anterior / Siguiente) - Ocultas en móvil para evitar superposición con textos */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Diapositiva anterior"
            className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0b1610]/80 hover:bg-[#2d5a27] text-gray-300 hover:text-white border border-[#234228] hover:border-[#4aa036] items-center justify-center transition-all duration-200 backdrop-blur-md shadow-xl hover:scale-110 active:scale-90 group"
          >
            <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Siguiente diapositiva"
            className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0b1610]/80 hover:bg-[#2d5a27] text-gray-300 hover:text-white border border-[#234228] hover:border-[#4aa036] items-center justify-center transition-all duration-200 backdrop-blur-md shadow-xl hover:scale-110 active:scale-90 group"
          >
            <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Indicadores de puntos / Dots en la parte inferior */}
      {totalSlides > 1 && (
        <div className="absolute bottom-2.5 sm:bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-2 sm:gap-2.5">
          {banners.map((slide, index) => {
            const isActive = index === currentSlide;

            return (
              <button
                key={slide.id || index}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a diapositiva ${index + 1}`}
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'w-6 sm:w-10 bg-[#e0a96d] shadow-lg shadow-[#e0a96d]/40'
                    : 'w-2 sm:w-2.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Cinta de atributos inferior: CALIDAD • DURABILIDAD • EFICIENCIA */}
      <div className="relative z-20 bg-[#0b1610] border-t border-[#18311d] py-2.5 px-4 backdrop-blur-md">
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
