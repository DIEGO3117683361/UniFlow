import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/UI';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login: React.FC = () => {
  const { login, checkEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  // States: 'email' (preguntando email) | 'register' (preguntando nombre para nuevo usuario)
  const [step, setStep] = useState<'email' | 'register'>('email');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const exists = checkEmail(email);
    if (exists) {
        // Usuario existe, login directo
        login(email);
    } else {
        // Usuario nuevo, pedir nombre
        setStep('register');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(email && name) {
          login(email, name);
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <div className="w-full max-w-sm space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white shadow-xl shadow-primary-500/30 mb-6 transform rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10v6M22 16a6 6 0 0 1-12 0 6 6 0 0 1-12 0M2 16v6h20v-6"/></svg>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">UniFlow</h1>
            <p className="text-slate-500 mt-2 font-medium">Gestión académica simplificada.</p>
        </div>

        <Card className="p-8 shadow-2xl shadow-slate-200/50 border-0">
          <AnimatePresence mode='wait'>
            {step === 'email' ? (
                 <motion.form 
                    key="email-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleEmailSubmit} 
                    className="space-y-6"
                 >
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">Bienvenido</h2>
                        <p className="text-sm text-slate-500">Ingresa tu correo para continuar.</p>
                    </div>
                    <Input 
                      label="Correo Electrónico"
                      type="email" 
                      placeholder="ej. juan@universidad.edu" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required
                      autoFocus
                    />
                    <Button type="submit" className="w-full mt-2 group" size="lg">
                      Continuar <ArrowRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform"/>
                    </Button>
                </motion.form>
            ) : (
                <motion.form 
                    key="register-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleRegisterSubmit} 
                    className="space-y-6"
                >
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">Crear Cuenta</h2>
                        <p className="text-sm text-slate-500">Parece que eres nuevo. ¿Cómo te llamas?</p>
                    </div>
                    <Input 
                        label="Nombre Completo"
                        type="text" 
                        placeholder="Ej. Juan Pérez" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required
                        autoFocus
                    />
                     <Input 
                        type="email" 
                        value={email} 
                        disabled
                        className="bg-slate-100 text-slate-500 cursor-not-allowed"
                    />
                    <div className="flex flex-col gap-3 mt-4">
                        <Button type="submit" className="w-full" size="lg">
                            Registrarse
                        </Button>
                        <button type="button" onClick={() => setStep('email')} className="text-xs text-slate-400 hover:text-slate-600 font-medium">
                            Volver / Cambiar correo
                        </button>
                    </div>
                </motion.form>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
};

export default Login;