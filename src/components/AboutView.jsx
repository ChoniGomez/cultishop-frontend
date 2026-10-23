import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Instagram, 
  Play, 
  ExternalLink, 
  ShieldCheck, 
  MapPin, 
    HeartHandshake, 
  Leaf, 
  ArrowRight, 
  RefreshCw,
  Video,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { buildApiUrl } from '../config/api';
import { WhatsAppIcon } from './WhatsAppIcon';
import { CultiShopLogo } from './CultiShopLogo';

// Bloques de respaldo en caso de que el backend demore por Cold Start
const FALLBACK_ABOUT_SECTIONS = [
  {
    id: 1,
    title: 'Nuestra Historia & Pasión por el Cultivo',
    subtitle: 'Desde Posadas hacia toda la provincia y región',
    content: 'CultiShop nació con una misión clara: brindar a la comunidad de cultivadores insumos de máxima pureza, asesoramiento técnico genuino y soluciones reales adaptadas a nuestro clima subtropical. Creemos en el autocultivo consciente, responsable y medicinal, promoviendo cosechas de calidad superior con el respaldo de las mejores marcas del mercado nacional e internacional.',
    image_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1200',
    order_index: 1
  },
  {
    id: 2,
    title: 'Asesoramiento Técnico & Cercanía',
    subtitle: 'Acompañamiento en cada etapa de tu ciclo',
    content: 'Ya sea que estés dando tus primeros pasos con tu primera planta o gestionando salas indoor automatizadas de alta exigencia, te acompañamos en cada fase: germinación, vegetativo, floración y curado. En nuestro local físico en Av. López y Planes 2919 y en nuestros canales digitales encontrás respuestas claras, tablas de nutrición y diagnóstico preventivo de plagas.',
    image_url: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=1200',
    order_index: 2
  },
  {
    id: 3,
    title: 'Compromiso con la Calidad y la Ley 27.350',
    subtitle: 'Insumos certificados para cultivo medicinal',
    content: 'Trabajamos exclusivamente con líneas oficiales y certificadas como Namasté Nutrientes, Sanidad Vegetal Mamboretá, Treemix, Mad Grow y Top Crop. Apoyamos y fomentamos el marco regulatorio del Reprocann (Ley 27.350), garantizando que cuentes con sustratos libres de patógenos, fertilizantes de grado agronómico y equipamiento de medición de precisión.',
    image_url: 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&q=80&w=1200',
    order_index: 3
  }
];

const FALLBACK_INSTAGRAM_VIDEOS = [
  {
    id: 1,
    title: 'Guía de Nutrición: Cómo usar Oro Negro y Amazonia de Namasté',
    post_url: 'https://www.instagram.com/culti.shopp/',
    thumbnail_url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800',
    order_index: 1
  },
  {
    id: 2,
    title: 'Combate definitivo contra trips y arañuela roja con Sanidad Mamboretá',
    post_url: 'https://www.instagram.com/culti.shopp/',
    thumbnail_url: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=800',
    order_index: 2
  },
  {
    id: 3,
    title: 'Montaje de Carpas Indoor e Iluminación LED de Alta Eficiencia',
    post_url: 'https://www.instagram.com/culti.shopp/',
    thumbnail_url: 'https://images.unsplash.com/photo-1624990833801-56c1b6a56ba7?auto=format&fit=crop&q=80&w=800',
    order_index: 3
  },
  {
    id: 4,
    title: 'Recorrido por nuestro local oficial en Posadas • Av. López y Planes 2919',
    post_url: 'https://www.instagram.com/culti.shopp/',
    thumbnail_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800',
    order_index: 4
  }
];

export const AboutView = () => {
  const [sections, setSections] = useState([]);
  const [instagramVideos, setInstagramVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll al inicio al ingresar
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let isMounted = true;

    const fetchPublicData = async () => {
      setLoading(true);
      try {
        // 1. Cargar bloques institucionales
        const aboutPromise = fetch(buildApiUrl('about'))
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null);

        // 2. Cargar videos de Instagram
        const instaPromise = fetch(buildApiUrl('instagram'))
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null);

        const [aboutData, instaData] = await Promise.all([aboutPromise, instaPromise]);

        if (isMounted) {
          const loadedSections = aboutData?.sections || aboutData?.data;
          if (Array.isArray(loadedSections) && loadedSections.length > 0) {
            setSections(loadedSections);
          } else {
            setSections(FALLBACK_ABOUT_SECTIONS);
          }

          const loadedVideos = instaData?.videos || instaData?.data;
          if (Array.isArray(loadedVideos) && loadedVideos.length > 0) {
            setInstagramVideos(loadedVideos);
          } else {
            setInstagramVideos(FALLBACK_INSTAGRAM_VIDEOS);
          }
        }
      } catch (err) {
        console.error('Error cargando información de Sobre Nosotros:', err);
        if (isMounted) {
          setSections(FALLBACK_ABOUT_SECTIONS);
          setInstagramVideos(FALLBACK_INSTAGRAM_VIDEOS);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPublicData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a140d] text-gray-100 selection:bg-[#38761d] selection:text-white pb-20">
      {/* ============================================================ */}
      {/* 1. HERO INSTITUCIONAL CULTISHOP */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden border-b border-[#1b3420] bg-gradient-to-b from-[#0e1d13] via-[#0b160f] to-[#0a140d] pt-12 pb-16 sm:pt-16 sm:pb-24">
        {/* Luces y destellos decorativos de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[#4aa036]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-[#e0a96d]/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#142619] border border-[#2d5a27] text-xs font-bold text-[#e0a96d] shadow-sm">
            <BookOpen size={14} className="text-[#e0a96d]" />
            <span className="tracking-widest uppercase">SOBRE CULTISHOP • POSADAS, MISIONES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white font-heading tracking-tight max-w-4xl mx-auto leading-tight">
            PASIÓN POR EL CULTIVO, <br />
            <span className="text-[#e0a96d] text-glow-gold">SANIDAD VEGETAL</span> Y COMUNIDAD
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-sans">
            Somos tu grow shop especializado en Misiones. Te acompañamos con insumos seleccionados de máxima pureza, asesoramiento agronómico cercano y soluciones reales para cada etapa de tu cultivo.
          </p>

          {/* Pilares / Valores destacados */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#0e1c12]/80 border border-[#1f3b25] backdrop-blur-sm flex flex-col items-center text-center space-y-1.5 shadow-sm">
              <Leaf size={22} className="text-[#4aa036]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Insumos Oficiales</span>
              <span className="text-[11px] text-gray-400">Namasté, Mamboretá & más</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1c12]/80 border border-[#1f3b25] backdrop-blur-sm flex flex-col items-center text-center space-y-1.5 shadow-sm">
              <HeartHandshake size={22} className="text-[#e0a96d]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Asesoría Técnica</span>
              <span className="text-[11px] text-gray-400">Respuestas para cada fase</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1c12]/80 border border-[#1f3b25] backdrop-blur-sm flex flex-col items-center text-center space-y-1.5 shadow-sm">
              <ShieldCheck size={22} className="text-[#4aa036]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Ley 27.350</span>
              <span className="text-[11px] text-gray-400">Apoyo a Reprocann</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e1c12]/80 border border-[#1f3b25] backdrop-blur-sm flex flex-col items-center text-center space-y-1.5 shadow-sm">
              <MapPin size={22} className="text-[#e0a96d]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Local en Posadas</span>
              <span className="text-[11px] text-gray-400">Av. López y Planes 2919</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. BLOQUES NARRATIVOS INSTITUCIONALES (ABOUT_SECTIONS) */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-24 space-y-16 sm:space-y-24">
        {loading ? (
          <div className="text-center py-20 space-y-4">
            <RefreshCw className="animate-spin text-[#4aa036] mx-auto" size={36} />
            <p className="text-sm font-bold text-gray-300">Cargando historia y valores de CultiShop...</p>
          </div>
        ) : (
          sections.map((section, index) => {
            const isReversed = index % 2 !== 0;

            return (
              <div
                key={section.id || index}
                className={`flex flex-col ${
                  isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'
                } items-center gap-8 sm:gap-12 lg:gap-16`}
              >
                {/* Lado Imagen */}
                <div className="w-full lg:w-1/2">
                  <div className="relative group">
                    {/* Efecto de borde brillante y sombra */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#2d5a27] to-[#e0a96d]/40 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500" />
                    <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden bg-[#0d1a10] border border-[#23422a] shadow-2xl">
                      {section.image_url ? (
                        <img
                          src={section.image_url}
                          alt={section.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center space-y-2">
                          <CultiShopLogo size="lg" showText={false} />
                          <span className="text-xs text-gray-400">CultiShop • Pasión por el Cultivo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Texto */}
                <div className="w-full lg:w-1/2 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#183520] border border-[#2d5a27] text-[#e0a96d] font-heading font-black text-xs flex items-center justify-center shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {section.subtitle && (
                      <span className="text-xs font-bold text-[#e0a96d] uppercase tracking-wider">
                        {section.subtitle}
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-heading leading-tight">
                    {section.title}
                  </h2>

                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-sans whitespace-pre-line">
                    {section.content}
                  </p>

                  <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-[#4aa036]">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 size={15} />
                      <span>Calidad Garantizada</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 size={15} />
                      <span>Soporte Permanente</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* ============================================================ */}
      {/* 3. MÓDULO DINÁMICO DE VIDEOS DE INSTAGRAM (@culti.shopp) */}
      {/* ============================================================ */}
      <section id="instagram-videos" className="bg-[#0b1610] border-y border-[#1b3420] py-16 sm:py-24 relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[600px] h-[400px] bg-[#e0a96d]/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 relative z-10 space-y-10">
          {/* Encabezado de la galería */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-[#1f3b25]">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e0a96d]">
                <Instagram size={15} className="text-[#e0a96d]" />
                <span>COMUNIDAD & REDES SOCIALES</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight">
                SEGUINOS EN NUESTRO <span className="text-[#e0a96d]">INSTAGRAM</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
                Conocé nuestros unboxings, guías de aplicación de fertilizantes, combate de plagas y novedades del local en Posadas.
              </p>
            </div>

            <a
              href="https://instagram.com/culti.shopp"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-to-r from-[#d62976] via-[#fa7e1e] to-[#feda75] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider transition shadow-lg hover:scale-105 active:scale-95 shrink-0"
            >
              <Instagram size={17} />
              <span>Seguir @culti.shopp</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Cuadrícula de Videos / Reels */}
          {instagramVideos.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              No hay publicaciones de Instagram disponibles en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {instagramVideos.map((video, idx) => (
                <a
                  key={video.id || idx}
                  href={video.post_url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#0e1c12] border border-[#1f3b25] hover:border-[#e0a96d]/60 rounded-2xl overflow-hidden flex flex-col justify-between transition group shadow-md hover:shadow-xl hover:-translate-y-1 duration-300"
                >
                  {/* Contenedor de Miniatura */}
                  <div className="aspect-[4/5] relative bg-[#070e09] overflow-hidden flex items-center justify-center">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title || 'Video Instagram CultiShop'}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                        <Video size={36} className="text-[#e0a96d] mb-2 opacity-80" />
                        <span className="text-xs font-bold text-gray-300">CultiShop Reel</span>
                        <span className="text-[10px] text-gray-500">@culti.shopp</span>
                      </div>
                    )}

                    {/* Badge superior de Instagram */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                      <Instagram size={11} className="text-[#e0a96d]" />
                      <span>Reel</span>
                    </div>

                    {/* Botón flotante Play central */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition">
                      <div className="w-12 h-12 rounded-full bg-black/70 backdrop-blur-md border border-[#e0a96d]/40 text-[#e0a96d] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#25d366] group-hover:text-black group-hover:border-transparent transition shadow-2xl">
                        <Play size={20} className="fill-current translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Título y Enlace inferior */}
                  <div className="p-4 space-y-2.5 flex-grow flex flex-col justify-between bg-gradient-to-b from-[#0e1c12] to-[#0a140d]">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#e0a96d] transition line-clamp-2 leading-snug">
                      {video.title || 'Video oficial de CultiShop'}
                    </h3>

                    <div className="pt-2 border-t border-[#18311d] flex items-center justify-between text-[11px] font-bold text-[#e0a96d]">
                      <span>Ver en Instagram</span>
                      <ExternalLink size={12} className="group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. LOCAL FÍSICO, MAPA Y ASESORAMIENTO DIRECTO */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 pt-16 sm:pt-24">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#122317] via-[#142619] to-[#0e1c12] border-2 border-[#2d5a27] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183520] border border-[#2d5a27] text-xs font-bold text-[#e0a96d]">
              <MapPin size={13} />
              <span>PUNTO DE RETIRO & ATENCIÓN AL PÚBLICO</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-heading">
              VISITANOS EN NUESTRO LOCAL EN POSADAS
            </h2>

            <div className="space-y-2 text-xs sm:text-sm text-gray-300">
              <p className="flex items-center justify-center lg:justify-start gap-2">
                <MapPin size={16} className="text-[#e0a96d] shrink-0" />
                <span><strong>Av. López y Planes 2919</strong> (entre Lavalle y Santa Catalina), Posadas, Misiones.</span>
              </p>
              <p className="flex items-center justify-center lg:justify-start gap-2 text-gray-400">
                <HeartHandshake size={16} className="text-[#4aa036] shrink-0" />
                <span>Vení a sacarte todas las dudas sobre dosis, prevención de plagas y armado de carpas.</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            <a
              href="https://maps.google.com/?q=Av.+López+y+Planes+2919,+Posadas"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#142619] hover:bg-[#1f3b25] text-white border border-[#23422a] text-xs font-bold transition flex items-center justify-center gap-2 text-center"
            >
              <MapPin size={15} className="text-[#e0a96d]" />
              <span>Cómo Llegar (Google Maps)</span>
            </a>

            <a
              href="https://wa.me/5493764356995?text=Hola%20CultiShop!%20Quiero%20hacer%20una%20consulta%20institucional%20o%20de%20cultivo"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#25d366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 text-center"
            >
              <WhatsAppIcon size={17} />
              <span>Escribinos por WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutView;
