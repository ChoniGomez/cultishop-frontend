import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  ChevronDown, 
  Search, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Sprout, 
  MapPin, 
  RefreshCw,
  PhoneCall,
  CheckCircle2,
  PackageOpen
} from 'lucide-react';
import { buildApiUrl } from '../config/api';
import { WhatsAppIcon } from './WhatsAppIcon';
import { CultiShopLogo } from './CultiShopLogo';

// Preguntas frecuentes de respaldo en caso de demora por Cold Start de la API
const FALLBACK_FAQS = [
  {
    id: 1,
    question: '¿Cómo realizo una compra y cuáles son los medios de pago?',
    answer: 'Podés armar tu pedido directamente agregando productos al carrito. Aceptamos transferencias bancarias con alias oficial, Mercado Pago, billeteras virtuales y efectivo en nuestro local. Al confirmar tu pedido podés coordinar el pago y la entrega rápidamente por WhatsApp con nuestro equipo.',
    category: 'Compras & Pagos',
    order_index: 1,
    is_active: true
  },
  {
    id: 2,
    question: '¿Cuáles son los métodos de envío y retiro disponibles?',
    answer: 'Disponemos de las siguientes modalidades de entrega: 1) Retiro por Local sin costo en Av. López y Planes casi Lavalle (adentro del ACUARIUM), Posadas, Misiones. 2) Envíos locales (Posadas / Garupá): Coordinación ágil de envío por moto, Uber o Líder Mandados. 3) Envíos Nacionales: Realizamos envíos a todo el país por Correo Argentino o Vía Cargo (con costo adicional dependiendo del lugar de destino).',
    category: 'Envíos & Retiro',
    order_index: 2,
    is_active: true
  },
  {
    id: 3,
    question: '¿Dónde queda el local físico y cuáles son los horarios de atención?',
    answer: 'Estamos ubicados en Av. López y Planes casi Lavalle (adentro del ACUARIUM), Posadas, Misiones. Te invitamos a visitarnos para conocer todos los productos exhibidos y recibir asesoramiento técnico personalizado para tus cultivos.',
    category: 'Local & Retiro',
    order_index: 3,
    is_active: true
  },
  {
    id: 4,
    question: '¿Qué fertilizantes y marcas oficiales trabajan?',
    answer: 'Trabajamos únicamente con marcas oficiales y reconocidas por su pureza y eficacia: Namasté Nutrientes, Sanidad Vegetal Mamboretá, Treemix, Mad Grow, Top Crop, sustratos profesionales Grow Mix y Klasmann, iluminación LED de alta eficiencia y parafernalia de primer nivel.',
    category: 'Cultivo & Insumos',
    order_index: 4,
    is_active: true
  },
  {
    id: 5,
    question: '¿Los insumos son aptos para cultivo medicinal bajo Ley 27.350 (Reprocann)?',
    answer: 'Sí, todos nuestros fertilizantes, sustratos y preventivos orgánicos cumplen con los estándares agronómicos para el cultivo medicinal responsable amparado por el marco regulatorio del Reprocann (Ley 27.350).',
    category: 'Cultivo & Normativa',
    order_index: 5,
    is_active: true
  },
  {
    id: 6,
    question: '¿Brindan asesoramiento técnico si recién estoy comenzando?',
    answer: '¡Absolutamente! Nuestro equipo cuenta con amplia experiencia y te acompaña en cada fase: germinación, vegetativo, floración, lavado de raíces y curado. No dudes en consultarnos por WhatsApp o en el local ante cualquier duda sobre plagas, deficiencias o dosificación.',
    category: 'Asesoramiento',
    order_index: 6,
    is_active: true
  }
];

export const FaqView = () => {
  const [faqs, setFaqs] = useState(FALLBACK_FAQS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFaqIds, setOpenFaqIds] = useState(new Set([1])); // Primer elemento desplegado por defecto

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(buildApiUrl('faqs'));
      if (!res.ok) {
        throw new Error('No se pudieron obtener las preguntas frecuentes.');
      }
      const data = await res.json();
      const list = data.faqs || data.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setFaqs(list);
      } else {
        setFaqs(FALLBACK_FAQS);
      }
    } catch (err) {
      console.warn('Error al cargar preguntas frecuentes desde la API:', err);
      setError('Mostrando información de respaldo local.');
      setFaqs(FALLBACK_FAQS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleFaq = (id) => {
    setOpenFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Obtener categorías únicas presentes en las FAQs
  const categories = useMemo(() => {
    const set = new Set();
    faqs.forEach((item) => {
      if (item.category && item.category.trim()) {
        set.add(item.category.trim());
      }
    });
    return Array.from(set);
  }, [faqs]);

  // Filtrado por categoría y buscador de texto
  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        (item.category && item.category.trim().toLowerCase() === selectedCategory.toLowerCase());

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const qMatches = item.question && item.question.toLowerCase().includes(query);
      const aMatches = item.answer && item.answer.toLowerCase().includes(query);
      const cMatches = item.category && item.category.toLowerCase().includes(query);

      return matchesCategory && (qMatches || aMatches || cMatches);
    });
  }, [faqs, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a140d] text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* ENCABEZADO PRINCIPAL */}
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#162a1b] border border-[#2d5a27] text-xs font-bold text-[#e0a96d] uppercase tracking-wider">
            <HelpCircle size={15} />
            <span>Centro de Ayuda CultiShop</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight">
            PREGUNTAS FRECUENTES <span className="text-[#4aa036]">(FAQ)</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300 leading-relaxed">
            Respuestas claras y rápidas sobre compras, envíos en Posadas y todo el país, asesoramiento sobre nutrientes, plagas y normativa legal Reprocann (Ley 27.350).
          </p>

          {/* BUSCADOR INTERACTIVO */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por pregunta, palabra clave o fertilizante..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] text-white text-sm placeholder-gray-400 focus:outline-none focus:border-[#4aa036] focus:ring-1 focus:ring-[#4aa036] transition shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-white bg-[#142619] px-2 py-1 rounded-md"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* FILTRO POR CATEGORÍAS */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === 'all'
                    ? 'bg-[#2d5a27] text-white shadow-md'
                    : 'bg-[#0e1c12] text-gray-400 hover:text-white hover:bg-[#142619] border border-[#1f3b25]'
                }`}
              >
                Todas ({faqs.length})
              </button>
              {categories.map((cat) => {
                const count = faqs.filter(
                  (f) => f.category && f.category.trim().toLowerCase() === cat.toLowerCase()
                ).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? 'bg-[#2d5a27] text-white shadow-md'
                        : 'bg-[#0e1c12] text-gray-400 hover:text-white hover:bg-[#142619] border border-[#1f3b25]'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* LISTADO DE PREGUNTAS (ACORDEÓN INTERACTIVO) */}
        <div className="space-y-4">
          {loading && faqs.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#0e1c12] border border-[#1f3b25] space-y-3">
              <RefreshCw className="animate-spin text-[#4aa036] mx-auto" size={28} />
              <p className="text-sm text-gray-300">Cargando preguntas frecuentes desde la base de datos...</p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-[#0e1c12] border border-[#1f3b25] space-y-3">
              <PackageOpen className="text-gray-500 mx-auto" size={32} />
              <h3 className="text-base font-bold text-white">No encontramos preguntas con esa búsqueda</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Probá con otros términos o consultanos directamente por WhatsApp para recibir atención personalizada.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2d5a27] text-white text-xs font-bold hover:bg-[#38761d] transition"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqIds.has(faq.id);
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl bg-[#0e1c12] border border-[#1f3b25] overflow-hidden transition-all duration-200 hover:border-[#2d5a27]"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="space-y-1.5 flex-1 pr-2">
                      {faq.category && (
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#162a1b] text-[#e0a96d] text-[10px] font-bold uppercase tracking-wider border border-[#23422a]">
                          {faq.category}
                        </span>
                      )}
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <div
                      className={`p-2 rounded-xl bg-[#142619] border border-[#23422a] text-[#4aa036] transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 bg-[#1f3b25] text-white' : ''
                      }`}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-6 sm:px-6 pt-1 border-t border-[#162a1b] text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line animate-fadeIn">
                      <div className="p-4 rounded-xl bg-[#0a140d]/60 border border-[#162a1b] text-gray-300">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* TARJETAS DE SERVICIO RÁPIDO & BENEFICIOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          <div className="p-5 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#162a1b] text-[#4aa036] flex items-center justify-center border border-[#2d5a27]">
              <Truck size={20} />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wide">Envíos & Retiro en Local</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Retiro por local sin costo, envíos en Posadas por moto, Uber o Líder Mandados, y envíos a todo el país por Correo Argentino o Vía Cargo (costo adicional según destino).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#162a1b] text-[#e0a96d] flex items-center justify-center border border-[#e0a96d]/40">
              <CreditCard size={20} />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wide">Múltiples Formas de Pago</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Transferencias con acreditación inmediata vía alias oficial, Mercado Pago y efectivo en local.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e1c12] border border-[#1f3b25] space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#162a1b] text-[#4aa036] flex items-center justify-center border border-[#2d5a27]">
              <ShieldCheck size={20} />
            </div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wide">Respaldo Ley 27.350</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Insumos agronómicos aprobados para pacientes y cultivadores registrados bajo el marco de autocultivo medicinal Reprocann.
            </p>
          </div>
        </div>

        {/* BLOQUE CTA: ¿TENÉS OTRA CONSULTA O QUERÉS PEDIR ASESORAMIENTO? */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#122416] via-[#0e1c12] to-[#0a140d] border border-[#23422a] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#e0a96d]">
              Atención Personalizada en Posadas
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
              ¿No encontraste la respuesta a tu consulta?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
              Nuestro equipo técnico está listo para ayudarte con cálculos de dosis, planes de fertilización preventiva, control de plagas o armado de salas.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#e0a96d]" />
                Av. López y Planes 2919, Posadas
              </span>
              <span className="flex items-center gap-1.5">
                <PhoneCall size={13} className="text-[#4aa036]" />
                +54 9 376 435-6995
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href="https://wa.me/5493764356995?text=Hola%20CultiShop!%20Tengo%20una%20consulta%20que%20no%20encontr%C3%A9%20en%20las%20Preguntas%20Frecuentes"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#25d366] hover:bg-[#20ba5a] text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-[#25d366]/20 cursor-pointer"
            >
              <WhatsAppIcon size={18} className="text-black fill-current" />
              <span>Consultar por WhatsApp</span>
            </a>

            <Link
              to="/sobre-nosotros"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#142619] hover:bg-[#1a3321] text-white font-bold text-xs uppercase tracking-wider border border-[#23422a] transition cursor-pointer"
            >
              <span>Sobre Nosotros</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqView;
