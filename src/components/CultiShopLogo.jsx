import React from 'react';
import logo from '../assets/logo.png';

export const CultiShopLogo = ({ size = "md", showText = true }) => {
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-11 md:h-12 w-auto",
    lg: "h-16 w-auto",
    xl: "h-20 w-auto"
  };

  return (
    <div className="flex items-center gap-3">
      {/* Imagen oficial del logo */}
      <img
        src={logo}
        alt="CultiShop Logo Oficial"
        className={`${sizeClasses[size] || sizeClasses.md} object-contain rounded-xl shadow-md border border-[#2d5a27]/60`}
      />

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-xl md:text-2xl font-black tracking-wider text-white font-heading">
            CULTI<span className="text-[#e0a96d]">SHOP</span>
          </span>
          <span className="text-[10px] tracking-widest text-gray-300 font-semibold uppercase">
            GROW • CULTIVA • CRECE
          </span>
        </div>
      )}
    </div>
  );
};
