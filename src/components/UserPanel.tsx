import React, { useState, useEffect } from 'react';
import { User, Shield, CreditCard, BarChart2, Settings, X, LogOut, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ArgusLanguage, UserPlan } from '../types';

interface UserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: ArgusLanguage;
  triggerReload?: number;
  onUpgradeComplete?: () => void;
}

export function UserPanel({ isOpen, onClose, language, triggerReload = 0, onUpgradeComplete }: UserPanelProps) {
  // Local state for mock user & plan details
  const [user, setUser] = useState({
    name: 'Patrick & Família',
    email: 'creator@argus.io',
    avatar: '/argus-logo.png'
  });

  const [plan, setPlan] = useState<UserPlan>({
    name: 'Pro',
    maxMessages: 2000,
    usedMessages: 482,
    price: 'R$ 49,90/mês'
  });

  const [selectedVoice, setSelectedVoice] = useState('Charon');

  const voices = ['Charon (Neural)', 'Daniel (Nativo)', 'Google Português', 'Browser Default'];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setUser({
            name: data.name || 'Patrick & Família',
            email: data.email || 'creator@argus.io',
            avatar: data.avatar_url || '/argus-logo.png'
          });
          
          let calculatedPrice = 'R$ 0';
          if (data.plan_name === 'Básico' || data.plan_name === 'Basic') calculatedPrice = 'R$ 19,90/mês';
          else if (data.plan_name === 'Pro') calculatedPrice = 'R$ 49,90/mês';
          else if (data.plan_name === 'Ultra') calculatedPrice = 'R$ 99,90/mês';

          setPlan({
            name: data.plan_name || 'Gratuito',
            maxMessages: data.max_messages || 50,
            usedMessages: data.used_messages || 0,
            price: calculatedPrice
          });
        }
      } catch (e) {
        console.error('Failed to fetch profile:', e);
      }
    };

    fetchProfile();
  }, [isOpen, triggerReload]);

  const usagePercentage = Math.min(100, (plan.usedMessages / plan.maxMessages) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-slate-950/95 border-l border-cyan-500/20 shadow-[-10px_0_30px_rgba(0,0,0,0.6)] z-50 flex flex-col backdrop-blur-md"
          >
            {/* Header */}
            <div className="p-6 border-b border-cyan-500/10 flex items-center justify-between bg-cyan-950/20">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                <h2 className="text-cyan-100 font-bold tracking-widest text-sm uppercase">Painel do Usuário</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-cyan-900/40 rounded-full text-cyan-400/60 hover:text-cyan-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Profile Card */}
              <div className="p-4 bg-cyan-950/10 border border-cyan-500/15 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-colors" />
                <div className="w-14 h-14 rounded-full border-2 border-cyan-400/80 bg-black flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <img src={user.avatar} alt="User Avatar" className="w-10 h-10 object-contain" onError={(e)=>{(e.target as any).src='https://psjhxzekvyadrmcgokqr.supabase.co/storage/v1/object/public/avatars/default.png'}} />
                </div>
                <div>
                  <h3 className="text-cyan-100 font-bold text-base tracking-wide font-sans">{user.name}</h3>
                  <p className="text-gray-500 text-xs font-mono">{user.email}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/30 text-[9px] font-mono tracking-widest text-cyan-300 uppercase font-bold">
                    PLANO {plan.name}
                  </span>
                </div>
              </div>

              {/* Plan & Usage Stats */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold flex items-center gap-1.5 border-b border-cyan-500/10 pb-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  Assinatura & Consumo
                </h4>
                <div className="p-4 bg-slate-900/40 border border-slate-700/20 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans text-slate-300">Mensagens Utilizadas</span>
                    <span className="text-xs font-mono text-cyan-300 font-bold">
                      {plan.usedMessages} / {plan.maxMessages}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/30">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all duration-1000"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <span>Renova em 24 dias</span>
                    <span>Custo: {plan.price}</span>
                  </div>
                </div>
              </div>

              {/* Configurações Rápidas */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold flex items-center gap-1.5 border-b border-cyan-500/10 pb-2">
                  <Settings className="w-3.5 h-3.5" />
                  Preferências de Voz
                </h4>
                <div className="space-y-2">
                  {voices.map((voice) => (
                    <button
                      key={voice}
                      onClick={() => setSelectedVoice(voice)}
                      className={`w-full px-4 py-3 rounded-xl border text-xs font-mono text-left flex items-center justify-between transition-all ${
                        selectedVoice === voice
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-[inset_0_0_12px_rgba(0,240,255,0.05)]'
                          : 'bg-slate-900/20 border-slate-800/80 text-gray-400 hover:bg-slate-900/40 hover:text-gray-300'
                      }`}
                    >
                      <span>{voice}</span>
                      {selectedVoice === voice && <Check className="w-4 h-4 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estatísticas Gráficas */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold flex items-center gap-1.5 border-b border-cyan-500/10 pb-2">
                  <BarChart2 className="w-3.5 h-3.5" />
                  Métricas Operacionais
                </h4>
                <div className="p-4 bg-slate-900/40 border border-slate-700/20 rounded-xl flex items-end justify-between h-32 pt-6">
                  {/* Basic Bar charts */}
                  {[45, 60, 32, 75, 80, 52, 95].map((val, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-full max-w-[14px] bg-slate-800 h-20 rounded-t relative overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-cyan-500/80 rounded-t shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                          style={{ height: `${val}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-gray-500">D{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-cyan-500/10 bg-cyan-950/20 flex items-center justify-between">
              <span className="text-[10px] text-cyan-500/30 font-mono">ID DO CLIENTE: ARG-99238</span>
              <button className="text-xs font-mono text-red-400/70 hover:text-red-300 flex items-center gap-1">
                <LogOut className="w-3.5 h-3.5" />
                Desconectar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
