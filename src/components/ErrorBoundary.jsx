import React from 'react';
import { AlertCircle, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import logo from '../assets/logo.png';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error en la aplicación:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07110a] text-gray-200 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0d1a11] border-2 border-[#2d5a27] rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
            {/* Acento dorado superior */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2d5a27] via-[#e0a96d] to-[#2d5a27]" />

            {/* Logo */}
            <div className="flex justify-center">
              <img
                src={logo}
                alt="CultiShop Logo"
                className="h-14 w-auto rounded-xl shadow-lg border border-[#2d5a27]"
              />
            </div>

            {/* Mensaje descriptivo */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-bold uppercase tracking-wider">
                <AlertCircle size={14} className="text-red-400" />
                <span>Error de Carga Temporal</span>
              </div>
              <h2 className="text-xl font-black text-white font-heading mt-2">
                No pudimos cargar esta sección
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                El servidor está tardando en responder o hubo una pérdida de conexión momentánea. Podés reintentar ahora o regresar a la tienda.
              </p>
            </div>

            {/* Acciones principales */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-6 rounded-xl bg-[#2d5a27] hover:bg-[#38761d] text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={15} />
                <span>Reintentar y Recargar</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-6 rounded-xl bg-[#142619] hover:bg-[#1f3b25] text-gray-300 hover:text-white font-bold text-xs transition border border-[#23422a] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home size={15} />
                <span>Volver a la Tienda Principal</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
