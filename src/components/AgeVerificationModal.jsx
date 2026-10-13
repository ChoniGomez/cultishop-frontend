import React, { useState, useEffect } from 'react';
import { CultiShopLogo } from './CultiShopLogo';
import { ShieldAlert } from 'lucide-react';

export const AgeVerificationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    // Limpiamos la clave antigua de localStorage para restaurar la consulta de edad
    try {
      localStorage.removeItem('cultishop_age_verified');
    } catch (e) {
      // Ignorar si el navegador restringe localStorage
    }

    // Usamos sessionStorage para preguntar por sesión
    const verified = sessionStorage.getItem('cultishop_age_verified');
    if (!verified) {
      setIsOpen(true);
    }

    // Permitir reabrir manualmente para pruebas
    const handleReopen = () => {
      setDenied(false);
      setIsOpen(true);
    };
    window.addEventListener('cultishop_reopen_age_modal', handleReopen);
    return () => window.removeEventListener('cultishop_reopen_age_modal', handleReopen);
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem('cultishop_age_verified', 'true');
    setIsOpen(false);
  };

  const handleDeny = () => {
    setDenied(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200" style={{ zIndex: 100000 }}>
      <div className="bg-[#0e1a12] border-2 border-[#2d5a27] rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
        {/* Adorno superior sutil */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2d5a27] via-[#e0a96d] to-[#2d5a27]"></div>

        <div className="flex justify-center mb-5">
          <CultiShopLogo size="lg" showText={false} />
        </div>

        {!denied ? (
          <>
            <span className="text-[11px] font-bold tracking-widest text-[#e0a96d] uppercase block mb-1">
              Acceso a la Tienda
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 font-heading">
              ¿Sos mayor de edad?
            </h2>
            <p className="text-gray-300 text-sm mb-7 leading-relaxed">
              Debes tener al menos <strong className="text-white">+18 años</strong> para acceder a los productos, parafernalia y catálogo de <strong className="text-[#e0a96d]">CULTISHOP</strong>. Por favor confirmá tu edad.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleAccept}
                className="bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold py-3 px-6 rounded-full transition shadow-lg shadow-black/40 border border-[#4aa036]/50 text-sm active:scale-95"
              >
                Tengo 18 Años O Más
              </button>
              <button
                onClick={handleDeny}
                className="bg-[#142619] hover:bg-[#1a3321] text-gray-300 font-semibold py-3 px-6 rounded-full transition border border-gray-700/50 text-sm active:scale-95"
              >
                Soy Menor
              </button>
            </div>
          </>
        ) : (
          <div className="py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
              <ShieldAlert size={26} />
            </div>
            <h2 className="text-2xl font-bold text-red-400 font-heading">Acceso restringido</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Debes ser mayor de 18 años para navegar y adquirir productos en nuestra tienda.
            </p>
            <button
              onClick={() => setDenied(false)}
              className="text-xs text-gray-400 hover:text-[#e0a96d] transition underline"
            >
              Me equivoqué, volver a verificar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
