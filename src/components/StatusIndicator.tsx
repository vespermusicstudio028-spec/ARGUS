import React from 'react';
import { Mic, Disc, Brain, Activity, Volume2, ShieldAlert, Wifi, Moon } from 'lucide-react';
import { AiStatus, ArgusLanguage, UI_TRANSLATIONS } from '../types';

interface StatusIndicatorProps {
  status: AiStatus;
  language: ArgusLanguage;
  showText?: boolean;
}

export function StatusIndicator({ status, language, showText = true }: StatusIndicatorProps) {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['pt-BR'];

  const getStatusConfig = (status: AiStatus) => {
    switch (status) {
      case 'listening':
        return {
          color: 'text-cyan-400',
          bg: 'bg-cyan-500/10',
          border: 'border-cyan-500/30',
          glow: 'bg-cyan-400',
          text: t.listening || 'ESCUTANDO',
          icon: <Mic className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
        };
      case 'processing':
        return {
          color: 'text-purple-400',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          glow: 'bg-purple-400',
          text: t.processing || 'PROCESSANDO',
          icon: <Brain className="w-3.5 h-3.5 animate-[spin_4s_linear_infinite] text-purple-400" />
        };
      case 'analyzing':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          glow: 'bg-yellow-400',
          text: t.analyzing || 'ANALISANDO',
          icon: <Activity className="w-3.5 h-3.5 text-yellow-400" />
        };
      case 'responding':
        return {
          color: 'text-cyan-300',
          bg: 'bg-cyan-400/20',
          border: 'border-cyan-400/40',
          glow: 'bg-cyan-300',
          text: t.responding || 'RESPONDENDO',
          icon: <Volume2 className="w-3.5 h-3.5 text-cyan-300 animate-bounce" />
        };
      case 'standby':
        return {
          color: 'text-slate-400',
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          glow: 'bg-slate-400',
          text: t.standby || 'MODO DE ESPERA',
          icon: <Moon className="w-3.5 h-3.5 text-slate-400" />
        };
      // @ts-ignore
      case 'error':
        return {
          color: 'text-red-400',
          bg: 'bg-red-500/15',
          border: 'border-red-500/40',
          glow: 'bg-red-500',
          text: 'ERRO DE CONEXÃO',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-bounce" />
        };
      case 'waiting':
      default:
        return {
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          glow: 'bg-green-400',
          text: 'SISTEMA ONLINE',
          icon: <Wifi className="w-3.5 h-3.5 text-green-400" />
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all duration-500 ${config.bg} ${config.border}`}>
      {/* Wave pulse animation behind the status indicator */}
      <div className="relative flex h-2 w-2">
        {status !== 'standby' && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.glow}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.glow}`} />
      </div>

      {showText && (
        <span className={`text-[10px] font-mono font-bold tracking-widest uppercase leading-none transition-colors duration-500 ${config.color}`}>
          {config.text}
        </span>
      )}

      {config.icon}
    </div>
  );
}
