import React, { useEffect, useState } from 'react';
import { Button, Card } from './UI';
import { Download, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  // Controla la visibilidad del banner. 
  // Inicialmente true, se oculta si detectamos que ya es standalone.
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // 1. Detectar si ya está en modo standalone (App nativa)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone === true;
      
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        setShowBanner(false);
      }
    };

    checkStandalone();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

    // 2. Detectar si es iOS (para mostrar instrucciones manuales)
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // 3. Capturar evento de instalación (Chrome/Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        // Esperamos a que el navegador lance la app o recargue
      }
    }
  };

  // Si ya es standalone, no renderizamos nada
  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full space-y-8"
      >
        {/* Logo / Icono */}
        <div className="mx-auto h-24 w-24 rounded-3xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white shadow-2xl shadow-primary-500/40 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10v6M22 16a6 6 0 0 1-12 0 6 6 0 0 1-12 0M2 16v6h20v-6"/></svg>
        </div>

        <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Instala UniFlow</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
                Para garantizar la mejor experiencia, funcionamiento offline y acceso rápido, es necesario instalar la aplicación en tu dispositivo.
            </p>
        </div>

        <Card className="p-6 bg-white border border-slate-100 shadow-xl">
            {isIOS ? (
                // Instrucciones para iOS
                <div className="space-y-4 text-left">
                    <p className="text-sm font-bold text-slate-900 text-center mb-4">Sigue estos pasos:</p>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Share size={20} className="text-primary-600" />
                        <span>1. Toca el botón <strong>Compartir</strong> abajo.</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <PlusSquare size={20} className="text-primary-600" />
                        <span>2. Selecciona <strong>"Agregar a Inicio"</strong>.</span>
                    </div>
                    <div className="mt-4 p-2 bg-slate-50 rounded-lg text-xs text-center text-slate-400">
                        Nota: Debes usar Safari para instalar.
                    </div>
                </div>
            ) : (
                // Botón automático para Android/Chrome
                <div className="space-y-4">
                     <Button 
                        size="lg" 
                        onClick={handleInstallClick} 
                        className="w-full py-4 text-base shadow-lg shadow-primary-500/20"
                        disabled={!deferredPrompt}
                    >
                        <Download size={20} />
                        {deferredPrompt ? 'Instalar App' : 'Instalando...'}
                    </Button>
                    {!deferredPrompt && (
                        <p className="text-xs text-slate-400">
                            Si el botón no funciona, busca la opción "Instalar App" en el menú de tu navegador.
                        </p>
                    )}
                </div>
            )}
        </Card>
        
        <p className="text-[10px] text-slate-300 uppercase font-bold tracking-widest pt-8">
            Requisito Obligatorio
        </p>
      </motion.div>
    </div>
  );
};

export default PWAInstallPrompt;