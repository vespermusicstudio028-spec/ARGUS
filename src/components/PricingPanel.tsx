import React, { useState, useEffect } from 'react';
import { Check, X, Shield, Star, Zap, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PricingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeComplete?: () => void;
}

export function PricingPanel({ isOpen, onClose, onUpgradeComplete }: PricingPanelProps) {
  const [currentPlanName, setCurrentPlanName] = useState('Pro');

  useEffect(() => {
    if (!isOpen) return;

    const fetchCurrentPlan = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setCurrentPlanName(data.plan_name || 'Gratuito');
        }
      } catch (e) {
        console.error('Failed to load current plan:', e);
      }
    };

    fetchCurrentPlan();
  }, [isOpen]);

  const handleUpgrade = async (planName: string) => {
    let maxMessages = 50;
    if (planName === 'Básico') maxMessages = 500;
    else if (planName === 'Pro') maxMessages = 2000;
    else if (planName === 'Ultra') maxMessages = 10000;

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName, maxMessages })
      });

      if (res.ok) {
        if (onUpgradeComplete) onUpgradeComplete();
        onClose();
      }
    } catch (e) {
      console.error('Failed to upgrade plan:', e);
    }
  };

  const plans = [
    {
      name: 'Gratuito',
      price: 'R$ 0',
      period: 'para sempre',
      desc: 'Para testar os limites do mordomo inteligente.',
      limit: '50 solicitações / mês',
      features: [
        'Voz neural padrão',
        'Tempo de resposta padrão',
        'Memória de sessão curta',
        'Suporte a 1 idioma',
      ],
      unavailable: [
        'Dashboard de consumo avançado',
        'Acesso prioritário a novos modelos',
        'Integrações com APIs terceiras',
        'Vozes exclusivas ultra-realistas'
      ],
      highlight: false,
      color: 'border-slate-800 bg-slate-950/40 text-slate-400',
      icon: <Cpu className="w-5 h-5 text-gray-500" />
    },
    {
      name: 'Básico',
      price: 'R$ 19',
      period: 'por mês',
      desc: 'Essencial para quem deseja o uso diário casual.',
      limit: '500 solicitações / mês',
      features: [
        'Voz neural padrão',
        'Resposta priorizada',
        'Memória de sessão média',
        'Suporte a múltiplos idiomas',
        'Histórico ilimitado de chat',
      ],
      unavailable: [
        'Acesso prioritário a novos modelos',
        'Integrações com APIs terceiras',
        'Vozes exclusivas ultra-realistas'
      ],
      highlight: false,
      color: 'border-cyan-500/10 bg-slate-950/60 text-cyan-400',
      icon: <Zap className="w-5 h-5 text-cyan-500" />
    },
    {
      name: 'Pro',
      price: 'R$ 49',
      period: 'por mês',
      desc: 'A experiência ARGUS definitiva e ilimitada.',
      limit: '2.000 solicitações / mês',
      features: [
        'Acesso prioritário a novos modelos (Gemini 2.5 Pro)',
        'Vozes exclusivas ultra-realistas',
        'Memória persistente de longo prazo',
        'Dashboard operacional de métricas',
        'Integrações com APIs terceiras',
        'Suporte prioritário 24/7',
      ],
      unavailable: [],
      highlight: true,
      color: 'border-cyan-400 bg-cyan-950/20 text-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.15)]',
      icon: <Star className="w-5 h-5 text-cyan-400 animate-pulse" />
    },
    {
      name: 'Ultra',
      price: 'R$ 99',
      period: 'por mês',
      desc: 'Para desenvolvedores e automação extrema.',
      limit: '10.000 solicitações / mês',
      features: [
        'Tudo do plano PRO',
        'Webhooks e chamadas de API diretas',
        'Subcontas e compartilhamento familiar',
        'Ajuste fino de entonação de voz',
        'Infraestrutura dedicada com ultra baixa latência',
      ],
      unavailable: [],
      highlight: false,
      color: 'border-purple-500/30 bg-purple-950/10 text-purple-400',
      icon: <Shield className="w-5 h-5 text-purple-400" />
    }
  ];

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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-45"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-5xl h-[88vh] bg-slate-950/95 border border-cyan-500/20 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 flex flex-col backdrop-blur-xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-cyan-500/10 flex items-center justify-between bg-cyan-950/25 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-cyan-400" />
                <h2 className="text-cyan-100 font-bold tracking-widest text-sm uppercase">Níveis de Assinatura</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-cyan-900/40 rounded-full text-cyan-400/60 hover:text-cyan-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable grid area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <div className="text-center max-w-xl mx-auto mb-10">
                <h3 className="text-lg md:text-2xl font-bold tracking-wide text-cyan-100 font-sans">
                  Eleve a Inteligência do seu Dia a Dia
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-2">
                  Escolha o plano ideal para as suas necessidades operacionais e desbloqueie novos recursos de voz e memória.
                </p>
              </div>

              {/* Grid of Plans */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map((plan, idx) => {
                  const isActive = currentPlanName.toLowerCase() === plan.name.toLowerCase() || 
                    (currentPlanName === 'Gratuito' && plan.name === 'Gratuito') || 
                    (currentPlanName === 'Básico' && plan.name === 'Básico');

                  return (
                    <div
                      key={idx}
                      className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative ${
                        isActive 
                          ? 'border-cyan-400 bg-cyan-950/20 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.05)]' 
                          : plan.color
                      }`}
                    >
                      {plan.highlight && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-cyan-400 text-black text-[9px] font-mono tracking-widest font-extrabold uppercase px-3 py-1 rounded-full shadow-[0_0_12px_rgba(0,240,255,0.6)]">
                          MAIS POPULAR
                        </div>
                      )}

                      <div>
                        {/* Icon & Name */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-100">
                            {plan.name}
                          </span>
                          {plan.icon}
                        </div>

                        {/* Pricing */}
                        <div className="mb-4">
                          <span className="text-2xl md:text-3xl font-extrabold text-cyan-100">{plan.price}</span>
                          <span className="text-xs text-gray-500 ml-1">/{plan.period}</span>
                        </div>

                        <p className="text-[11px] text-gray-400 leading-relaxed mb-4">{plan.desc}</p>
                        
                        <div className="text-[10px] font-mono text-cyan-400/80 mb-4 bg-cyan-950/20 px-2 py-1.5 rounded border border-cyan-500/10">
                          LIMITE: {plan.limit}
                        </div>

                        {/* Feature lists */}
                        <div className="space-y-2 mb-6">
                          {plan.features.map((feat, fidx) => (
                            <div key={fidx} className="flex gap-2 items-start text-[11px] text-gray-300">
                              <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                          {plan.unavailable.map((feat, uidx) => (
                            <div key={uidx} className="flex gap-2 items-start text-[11px] text-gray-600">
                              <X className="w-3.5 h-3.5 text-gray-700 flex-shrink-0 mt-0.5" />
                              <span className="line-through">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => !isActive && handleUpgrade(plan.name)}
                        disabled={isActive}
                        className={`w-full py-2.5 rounded-xl text-xs font-mono tracking-widest uppercase transition-all duration-300 ${
                          isActive
                            ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-default'
                            : plan.highlight
                              ? 'bg-cyan-400 text-black font-extrabold hover:bg-cyan-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                              : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                        }`}
                      >
                        {isActive ? 'Plano Ativo' : 'Adquirir Nível'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-cyan-500/10 bg-cyan-950/20 text-center flex-shrink-0">
              <p className="text-[10px] text-cyan-500/30 font-mono uppercase tracking-[0.2em]">
                Pagamento seguro criptografado via Stripe & Supabase Auth
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
