import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Compass, 
  WifiOff, 
  Sprout, 
  ArrowRight, 
  ShoppingBag,
  HelpCircle
} from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { CultiShopLogo } from './CultiShopLogo';

export const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 relative overflow-hidden bg-[#0a140d]">
      {/* Luces difusas decorativas de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2d5a27]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#e0a96d]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto text-center relative z-10 space-y-8">
        
        {/* Ilustración / Gráfico temático con humor */}
        <div className="relative inline-flex items-center justify-center">
          {/* Número 404 gigante de fondo con gradiente oro/verde */}
          <div className="text-8xl sm:text-9xl md:text-[11rem] font-black font-heading select-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#e0a96d]/20 via-[#4aa036]/10 to-transparent leading-none">
            404
          </div>

          {/* Composición visual central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative group">
              {/* Círculo contenedor con reborde brillante */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-b from-[#162d1c] to-[#0c1810] border-2 border-[#4aa036]/50 shadow-2xl shadow-[#4aa036]/20 flex flex-col items-center justify-center relative p-3">
                
                {/* Planta 'colgada' con ojos mareados/cansados */}
                <div className="relative">
                  <Sprout size={48} className="text-[#4aa036] rotate-45 transform drop-shadow-md animate-pulse" />
                  <span className="absolute -top-2 -right-2 text-2xl select-none" title="Colgada">
                    😵‍💫
                  </span>
                </div>

                {/* Indicador de señal */}
                <div className="flex items-center gap-1 mt-1 text-[11px] text-[#e0a96d] font-bold">
                  <WifiOff size={12} />
                  <span>Sin señal</span>
                </div>
              </div>

              {/* Badge flotante decorativo */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#e0a96d] text-black font-extrabold text-[10px] tracking-wider uppercase px-3 py-0.5 rounded-full shadow-md whitespace-nowrap">
                PLANTA COLGADA
              </div>
            </div>
          </div>
        </div>

        {/* Textos creativos obligatorios */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#142619] border border-[#23422a] text-[#e0a96d] text-xs font-bold uppercase tracking-wider shadow-inner">
            <Compass size={14} className="text-[#4aa036]" />
            <span>Zona Fuera de Cobertura</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-heading tracking-wide leading-tight">
            ¡Ups! Esta página se colgó de más
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-lg mx-auto leading-relaxed">
            Tranqui, los cogollos maduran a su tiempo, pero esta página parece que se secó. 
            Volvé al inicio antes de que te dé un pálida digital.
          </p>
        </div>

        {/* Botones de acción corporativos */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {/* Botón principal: Volver al inicio */}
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#2d5a27] hover:bg-[#38761d] text-white font-black text-sm border border-[#4aa036]/60 hover:border-[#4aa036] transition-all shadow-xl hover:shadow-[#4aa036]/25 hover:scale-105 active:scale-95 group font-heading"
          >
            <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            <span>Volver al inicio</span>
          </Link>

          {/* Botón secundario: Asistencia o WhatsApp */}
          <a
            href="https://wa.me/5493764356995?text=Hola%20CultiShop!%20Llegu%C3%A9%20a%20una%20p%C3%A1gina%20que%20no%20existe%20en%20la%20tienda%20y%20necesito%20ayuda"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#122317] hover:bg-[#1a3521] text-gray-200 hover:text-white font-bold text-sm border border-[#23442a] hover:border-[#25d366]/60 transition-all shadow-md group"
          >
            <WhatsAppIcon size={18} className="text-[#25d366] group-hover:scale-110 transition-transform" />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>

        {/* Atajos a categorías populares para el usuario perdido */}
        <div className="pt-8 border-t border-[#18311d] max-w-md mx-auto">
          <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">
            ¿Buscabas alguno de estos insumos?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link
              to="/categoria/fertilizantes"
              className="px-3 py-1.5 rounded-lg bg-[#102014] hover:bg-[#18331f] text-gray-300 hover:text-[#e0a96d] border border-[#1f3b25] transition"
            >
              Fertilizantes
            </Link>
            <Link
              to="/categoria/indoor"
              className="px-3 py-1.5 rounded-lg bg-[#102014] hover:bg-[#18331f] text-gray-300 hover:text-[#e0a96d] border border-[#1f3b25] transition"
            >
              Carpas Indoor
            </Link>
            <Link
              to="/categoria/sustratos-macetas"
              className="px-3 py-1.5 rounded-lg bg-[#102014] hover:bg-[#18331f] text-gray-300 hover:text-[#e0a96d] border border-[#1f3b25] transition"
            >
              Sustratos y Macetas
            </Link>
            <Link
              to="/categoria/parafernalia"
              className="px-3 py-1.5 rounded-lg bg-[#102014] hover:bg-[#18331f] text-gray-300 hover:text-[#e0a96d] border border-[#1f3b25] transition"
            >
              Parafernalia
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

