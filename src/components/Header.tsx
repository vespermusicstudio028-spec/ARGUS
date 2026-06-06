import { Settings, X, Globe, History, Star, Shield } from 'lucide-react';
import React from 'react';
import { AiStatus, ArgusLanguage, UI_TRANSLATIONS } from '../types';
import { BatteryIndicator } from './BatteryIndicator';
import { StatusIndicator } from './StatusIndicator';

interface HeaderProps {
  status: AiStatus;
  currentLanguage: ArgusLanguage;
  onLanguageChange: (lang: ArgusLanguage) => void;
  onReset: () => void;
  onHistoryToggle: () => void;
  onSettingsToggle?: () => void;
  onProfileToggle?: () => void;
  onPlansToggle?: () => void;
  onAdminToggle?: () => void;
}

export function Header({
  status,
  currentLanguage,
  onLanguageChange,
  onReset,
  onHistoryToggle,
  onSettingsToggle,
  onProfileToggle,
  onPlansToggle,
  onAdminToggle
}: HeaderProps) {
  const languages: { code: ArgusLanguage; label: string; icon: string }[] = [
    { code: 'pt-BR', label: 'PT', icon: '🇧🇷' },
    { code: 'en-GB', label: 'EN', icon: '🇬🇧' },
    { code: 'es-ES', label: 'ES', icon: '🇪🇸' },
    { code: 'fr-FR', label: 'FR', icon: '🇫🇷' },
  ];

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS['pt-BR'];

  // Border colors based on status
  const getHeaderBorderClass = () => {
    switch (status) {
      case 'listening':
        return 'border-b border-cyan-500/20';
      case 'processing':
        return 'border-b border-purple-500/20';
      case 'analyzing':
        return 'border-b border-yellow-500/20';
      case 'responding':
        return 'border-b border-cyan-400/35';
      case 'error':
        return 'border-b border-red-500/35';
      case 'standby':
        return 'border-b border-slate-700/10';
      default:
        return 'border-b border-cyan-500/10';
    }
  };

  return (
    <header className={`hud-panel flex items-center justify-between p-4 relative z-50 rounded-b-xl border-t-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-colors duration-500 ${getHeaderBorderClass()}`}>
      {/* Left side: Logo and Status / Battery */}
      <div className="flex items-center gap-4">
        <div 
          onClick={onProfileToggle}
          className="relative flex items-center justify-center w-12 h-12 bg-black rounded-full border border-cyan-500/30 overflow-hidden hud-border-cyan group cursor-pointer"
        >
          <div className={`absolute inset-0 border-t-2 rounded-full animate-[spin_3s_linear_infinite] transition-colors duration-500 ${
            status === 'error' ? 'border-red-500' : status === 'processing' ? 'border-purple-500' : 'border-cyan-400'
          }`} />
          <img 
            src="/argus-logo.png" 
            alt="ARGUS Logo" 
            className="w-8 h-8 object-contain relative z-10 group-hover:scale-110 transition-transform duration-300" 
          />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-cyan-400 font-bold tracking-[0.2em] text-lg lg:text-xl flex items-center gap-2 cursor-pointer" onClick={onProfileToggle}>
            ARGUS <span className="text-cyan-300/70 font-medium tracking-[0.15em]">IA</span> <span className="text-xs text-cyan-400/50 mt-1">v2.0</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <BatteryIndicator />
          </div>
        </div>
      </div>

      {/* Center: Language Selector */}
      <div className="flex items-center bg-cyan-950/40 rounded-lg p-1 border border-cyan-500/10 gap-1 backdrop-blur-md">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest transition-all duration-300 flex items-center gap-1.5 ${
              currentLanguage === lang.code
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-cyan-400/40 hover:text-cyan-400/80 hover:bg-cyan-900/40 border border-transparent'
            }`}
          >
            <span>{lang.icon}</span>
            <span className="hidden sm:inline">{lang.label}</span>
          </button>
        ))}
      </div>

      {/* Right side Actions and Live Status Indicator */}
      <div className="flex items-center gap-3">
        <div className="hidden md:block">
          <StatusIndicator status={status} language={currentLanguage} />
        </div>
        
        {onPlansToggle && (
          <button 
            onClick={onPlansToggle}
            className="p-2 rounded-full hover:bg-yellow-900/20 text-yellow-500/60 hover:text-yellow-400 transition-all duration-300 border border-transparent hover:border-yellow-500/30"
            title="Planos Premium"
          >
            <Star className="w-5 h-5 animate-pulse" />
          </button>
        )}
        {onAdminToggle && (
          <button 
            onClick={onAdminToggle}
            className="p-2 rounded-full hover:bg-red-950/20 text-red-500/60 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/30"
            title="Painel Admin Secreto"
          >
            <Shield className="w-5 h-5" />
          </button>
        )}
        
        <button 
          onClick={onHistoryToggle}
          className="p-2 rounded-full hover:bg-cyan-900/30 text-gray-400 hover:text-cyan-400 transition-all duration-300 border border-transparent hover:border-cyan-500/30"
          title={t.history}
        >
          <History className="w-5 h-5" />
        </button>
        <button 
          onClick={onSettingsToggle}
          className="p-2 rounded-full hover:bg-cyan-900/30 text-gray-400 hover:text-cyan-400 transition-all duration-300 border border-transparent hover:border-cyan-500/30"
          title={t.settings}
        >
          <Settings className="w-5 h-5" />
        </button>
        <button 
          onClick={onReset}
          className="p-2 rounded-full hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/30"
          title={t.resetContext}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
