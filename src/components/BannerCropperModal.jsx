import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  RotateCcw, 
  Check, 
  Eye, 
  EyeOff, 
  Sliders, 
    ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Maximize2
} from 'lucide-react';

export const BannerCropperModal = ({
  isOpen,
  imageUrl,
  title = '',
  subtitle = '',
  buttonText = 'Ver Más',
  showText = true,
  onClose,
  onApply
}) => {
  // Zoom: de 1 (100% cobertura) a 3 (300%)
  const [zoom, setZoom] = useState(1);
  // Posición del encuadre en píxeles relativos al centro
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // Simulación de textos sobre el banner
  const [previewOverlay, setPreviewOverlay] = useState(showText);
  // Estado de arrastre (drag)
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, startOffsetX: 0, startOffsetY: 0 });
  // Procesamiento canvas
  const [isProcessing, setIsProcessing] = useState(false);

  // Referencias a elementos DOM
  const viewportRef = useRef(null);
  const imageRef = useRef(null);

  // Dimensiones calculadas del contenedor
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 250 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  // Resetear estados al abrir con una nueva imagen
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setPreviewOverlay(showText);
    }
  }, [isOpen, imageUrl, showText]);

  // Medir dimensiones del viewport al montar o redimensionar
  const updateViewportSize = useCallback(() => {
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewportSize({ width: rect.width, height: rect.height });
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateViewportSize();
      window.addEventListener('resize', updateViewportSize);
      return () => window.removeEventListener('resize', updateViewportSize);
    }
  }, [isOpen, updateViewportSize]);

  // Al cargar la imagen en el DOM, guardar su tamaño natural
  const handleImageLoad = (e) => {
    const img = e.target;
    if (img) {
      setNaturalSize({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height
      });
      updateViewportSize();
    }
  };

  // Calcular límites de movimiento (Clamping) para no dejar huecos vacíos
  const getClampedOffset = useCallback((candidateX, candidateY, currentZoom) => {
    if (!naturalSize.width || !naturalSize.height || !viewportSize.width || !viewportSize.height) {
      return { x: candidateX, y: candidateY };
    }

    const scaleToCover = Math.max(
      viewportSize.width / naturalSize.width,
      viewportSize.height / naturalSize.height
    );
    const displayWidth = naturalSize.width * scaleToCover * currentZoom;
    const displayHeight = naturalSize.height * scaleToCover * currentZoom;

    const maxOffsetX = Math.max(0, (displayWidth - viewportSize.width) / 2);
    const maxOffsetY = Math.max(0, (displayHeight - viewportSize.height) / 2);

    return {
      x: Math.min(maxOffsetX, Math.max(-maxOffsetX, candidateX)),
      y: Math.min(maxOffsetY, Math.max(-maxOffsetY, candidateY))
    };
  }, [naturalSize, viewportSize]);

  // Manejo de Arrastre (Mouse)
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y
    };
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const newX = dragStartRef.current.startOffsetX + dx;
    const newY = dragStartRef.current.startOffsetY + dy;
    setOffset(getClampedOffset(newX, newY, zoom));
  }, [isDragging, zoom, getClampedOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  // Manejo de Arrastre Táctil (Touch)
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        startOffsetX: offset.x,
        startOffsetY: offset.y
      };
    }
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !e.touches || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    const newX = dragStartRef.current.startOffsetX + dx;
    const newY = dragStartRef.current.startOffsetY + dy;
    setOffset(getClampedOffset(newX, newY, zoom));
  }, [isDragging, zoom, getClampedOffset]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Escuchar mouseup y mousemove globales durante el arrastre
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cambio de Zoom
  const handleZoomChange = (newZoom) => {
    const clampedZoom = Math.min(3, Math.max(1, newZoom));
    setZoom(clampedZoom);
    // Reajustar offset al cambiar escala para mantener la imagen en cuadro
    setOffset((prev) => getClampedOffset(prev.x, prev.y, clampedZoom));
  };

  // Reajuste al Centro
  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Micro-ajustes de posición (teclas o botones flecha)
  const nudge = (dx, dy) => {
    setOffset((prev) => getClampedOffset(prev.x + dx, prev.y + dy, zoom));
  };

  // =========================================================================
  // PROCESAMIENTO CON CANVAS: RENDERIZADO EN ALTA RESOLUCIÓN Y EXPORTACIÓN
  // =========================================================================
  const handleConfirmCrop = async () => {
    if (!imageUrl) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => {
          // Si falla con crossOrigin anonymous, intentar sin él
          const fallbackImg = new Image();
          fallbackImg.onload = () => resolve(fallbackImg);
          fallbackImg.onerror = reject;
          fallbackImg.src = imageUrl;
        };
        img.src = imageUrl;
      });

      const natW = img.naturalWidth || img.width;
      const natH = img.naturalHeight || img.height;
      const vpW = viewportSize.width || 800;
      const vpH = viewportSize.height || 250;

      // Escala de cobertura base en el viewport
      const scaleToCover = Math.max(vpW / natW, vpH / natH);
      const currentScale = scaleToCover * zoom;

      // Dimensiones de la imagen en el viewport
      const dispW = natW * currentScale;
      const dispH = natH * currentScale;

      // Coordenadas del viewport en la imagen original
      const centerX = vpW / 2 + offset.x;
      const centerY = vpH / 2 + offset.y;

      const imgLeft = centerX - dispW / 2;
      const imgTop = centerY - dispH / 2;

      const srcX = Math.max(0, (0 - imgLeft) / currentScale);
      const srcY = Math.max(0, (0 - imgTop) / currentScale);
      const srcW = Math.min(natW - srcX, vpW / currentScale);
      const srcH = Math.min(natH - srcY, vpH / currentScale);

      // Resolución panorámica oficial de salida (1920x600 o proporción exacta 16:5)
      const outWidth = 1920;
      const outHeight = Math.round((outWidth * vpH) / vpW) || 600;

      const canvas = document.createElement('canvas');
      canvas.width = outWidth;
      canvas.height = outHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No se pudo inicializar el contexto 2D de Canvas.');
      }

      // Fondo oscuro uniforme de respaldo
      ctx.fillStyle = '#0b1610';
      ctx.fillRect(0, 0, outWidth, outHeight);

      // Dibujar la porción encuadrada exactamente
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outWidth, outHeight);

      // Exportar en formato JPEG optimizado (calidad 90%)
      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.90);

      onApply(croppedDataUrl);
      onClose();
    } catch (err) {
      console.error('Error al procesar el encuadre en canvas:', err);
      // Fallback seguro: Si no se puede recortar por CORS, usar la imagen tal cual
      onApply(imageUrl);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      style={{ zIndex: 100 }}
    >
      <div className="w-full max-w-4xl bg-[#0e1c12] border-2 border-[#2d5a27] rounded-3xl p-4 sm:p-6 shadow-2xl relative flex flex-col space-y-4 max-h-[95vh] overflow-y-auto no-scrollbar">
        {/* Acento dorado superior */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2d5a27] via-[#e0a96d] to-[#2d5a27]" />

        {/* Encabezado del modal */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#1f3b25]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#1a3521] text-[#e0a96d]">
                <Sliders size={16} />
              </span>
              <h3 className="text-base sm:text-lg font-black text-white font-heading">
                Ajustar Encuadre y Zoom del Banner
              </h3>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#18311d] text-[#e0a96d] border border-[#e0a96d]/30">
                Editor Panorámico
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Arrastrá la imagen con el mouse o dedo para posicionarla y usá el control deslizante para ajustar el zoom con la proporción real de la tienda.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-400 hover:text-white transition cursor-pointer shrink-0"
            title="Cerrar sin aplicar"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================================================================= */}
        {/* ÁREA DE VISUALIZACIÓN INTERACTIVA (VIEWPORT CON RATIO BANNER)    */}
        {/* ================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-300 flex items-center gap-1.5">
              <Maximize2 size={13} className="text-[#4aa036]" />
              <span>Ventana de Encuadre Panorámico (16:5 Oficial)</span>
            </span>
            <button
              type="button"
              onClick={() => setPreviewOverlay(!previewOverlay)}
              className="text-xs font-semibold text-[#e0a96d] hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#142619] border border-[#23422a] transition cursor-pointer"
            >
              {previewOverlay ? <EyeOff size={13} /> : <Eye size={13} />}
              <span>{previewOverlay ? 'Ocultar Simulación' : 'Simular Texto en Portada'}</span>
            </button>
          </div>

          <div
            ref={viewportRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`w-full h-52 sm:h-64 md:h-72 rounded-2xl overflow-hidden relative select-none bg-[#07110a] border-2 border-[#2d5a27] shadow-inner ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ touchAction: 'none' }}
          >
            {/* Imagen interactiva con transformación dinámica */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Banner para encuadrar"
                onLoad={handleImageLoad}
                draggable={false}
                className="max-w-none select-none pointer-events-none"
                style={{
                  width: naturalSize.width && naturalSize.height
                    ? (viewportSize.width / naturalSize.width > viewportSize.height / naturalSize.height
                        ? '100%'
                        : 'auto')
                    : '100%',
                  height: naturalSize.width && naturalSize.height
                    ? (viewportSize.width / naturalSize.width > viewportSize.height / naturalSize.height
                        ? 'auto'
                        : '100%')
                    : 'auto',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* Guías sutiles de cuadrícula (Regla de los Tercios para encuadre pro) */}
            <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-25">
              <div className="border-r border-b border-white/40" />
              <div className="border-r border-b border-white/40" />
              <div className="border-b border-white/40" />
              <div className="border-r border-b border-white/40" />
              <div className="border-r border-b border-white/40" />
              <div className="border-b border-white/40" />
              <div className="border-r border-white/40" />
              <div className="border-r border-white/40" />
              <div />
            </div>

            {/* Simulación en tiempo real de los textos del Hero Carousel si está activa */}
            {previewOverlay && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-4 sm:p-6 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                <span className="text-[10px] font-bold text-[#e0a96d] uppercase tracking-wider mb-1">
                  PREVISUALIZACIÓN DE PORTADA
                </span>
                <h4 className="text-base sm:text-xl font-black text-white font-heading truncate drop-shadow-md">
                  {title || 'Título Principal del Banner'}
                </h4>
                {subtitle && (
                  <p className="text-xs text-gray-200 line-clamp-1 drop-shadow mt-0.5">
                    {subtitle}
                  </p>
                )}
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2d5a27] text-white text-[11px] font-bold uppercase tracking-wider shadow-md w-max">
                  <span>{buttonText || 'Ver Más'}</span>
                </div>
              </div>
            )}

            {/* Indicador de arrastre flotante en esquina */}
            <div className="absolute top-2.5 left-2.5 pointer-events-none px-2.5 py-1 rounded-lg bg-black/75 border border-[#2d5a27] text-[10px] font-bold text-gray-200 backdrop-blur-md flex items-center gap-1.5 shadow-md">
              <Move size={12} className="text-[#e0a96d]" />
              <span>Arrastrá para reubicar</span>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CONTROLES DE ZOOM Y AJUSTES DE POSICIÓN                         */}
        {/* ================================================================= */}
        <div className="bg-[#07110a] border border-[#1f3b25] rounded-2xl p-4 space-y-3 shadow-inner">
          {/* Fila del slider de zoom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-300 shrink-0">
              <ZoomIn size={15} className="text-[#e0a96d]" />
              <span>Nivel de Zoom:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#162f1c] text-[#e0a96d] font-heading font-black text-xs border border-[#2d5a27]">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Slider interactivo suave */}
            <div className="flex items-center gap-3 w-full sm:w-auto flex-grow max-w-md px-2">
              <button
                type="button"
                onClick={() => handleZoomChange(zoom - 0.15)}
                disabled={zoom <= 1}
                className="p-1.5 rounded-lg bg-[#142619] hover:bg-[#1f3b25] text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Alejar (Zoom Out)"
              >
                <ZoomOut size={16} />
              </button>

              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="w-full accent-[#4aa036] bg-[#1a3521] h-2 rounded-lg cursor-pointer"
              />

              <button
                type="button"
                onClick={() => handleZoomChange(zoom + 0.15)}
                disabled={zoom >= 3}
                className="p-1.5 rounded-lg bg-[#142619] hover:bg-[#1f3b25] text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Acercar (Zoom In)"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* Botón de centrado rápido */}
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white border border-[#23422a] text-xs font-bold transition cursor-pointer shrink-0"
              title="Restablecer posición inicial y 100% de zoom"
            >
              <RotateCcw size={13} />
              <span>Centrar</span>
            </button>
          </div>

          {/* Micro-controles de alineación rápida */}
          <div className="pt-2 border-t border-[#162d1c] flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-gray-400 font-medium">
              Ajuste fino de posición:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => nudge(0, -15)}
                className="p-1.5 rounded-lg bg-[#122416] hover:bg-[#183520] text-gray-300 hover:text-white border border-[#23422a] transition cursor-pointer"
                title="Mover arriba"
              >
                <ArrowUp size={13} />
              </button>
              <button
                type="button"
                onClick={() => nudge(0, 15)}
                className="p-1.5 rounded-lg bg-[#122416] hover:bg-[#183520] text-gray-300 hover:text-white border border-[#23422a] transition cursor-pointer"
                title="Mover abajo"
              >
                <ArrowDown size={13} />
              </button>
              <button
                type="button"
                onClick={() => nudge(-20, 0)}
                className="p-1.5 rounded-lg bg-[#122416] hover:bg-[#183520] text-gray-300 hover:text-white border border-[#23422a] transition cursor-pointer"
                title="Mover a la izquierda"
              >
                <ArrowLeft size={13} />
              </button>
              <button
                type="button"
                onClick={() => nudge(20, 0)}
                className="p-1.5 rounded-lg bg-[#122416] hover:bg-[#183520] text-gray-300 hover:text-white border border-[#23422a] transition cursor-pointer"
                title="Mover a la derecha"
              >
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BOTONES DE ACCIÓN: CANCELAR O CONFIRMAR Y GUARDAR ENCUADRE         */}
        {/* ================================================================= */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#1f3b25]">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white text-xs font-bold transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmCrop}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-black/50 border border-[#4aa036]/50 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Encuadrando...</span>
              </>
            ) : (
              <>
                <Check size={16} className="text-[#25d366]" />
                <span>Aplicar y Guardar Encuadre</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

