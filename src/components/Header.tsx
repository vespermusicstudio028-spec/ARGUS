import { Settings, X, Cpu, Globe, History } from 'lucide-react';
import React from 'react';
import { ArgusLanguage, UI_TRANSLATIONS } from '../types';
import { BatteryIndicator } from './BatteryIndicator';

interface HeaderProps {
  status: string;
  currentLanguage: ArgusLanguage;
  onLanguageChange: (lang: ArgusLanguage) => void;
  onReset: () => void;
  onHistoryToggle: () => void;
}

export function Header({ status, currentLanguage, onLanguageChange, onReset, onHistoryToggle }: HeaderProps) {
  const languages: { code: ArgusLanguage; label: string; icon: string }[] = [
    { code: 'pt-BR', label: 'PT', icon: '🇧🇷' },
    { code: 'en-GB', label: 'EN', icon: '🇬🇧' },
    { code: 'es-ES', label: 'ES', icon: '🇪🇸' },
    { code: 'fr-FR', label: 'FR', icon: '🇫🇷' },
  ];

  return (
    <header className="hud-panel flex items-center justify-between p-4 relative z-10 rounded-b-xl border-t-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Left side: Logo and Status */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center w-12 h-12 bg-black rounded-full border border-cyan-500/30 overflow-hidden hud-border-cyan group">
          <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-[spin_3s_linear_infinite]" />
          <Cpu className="text-cyan-400 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-cyan-400 font-bold tracking-[0.2em] text-lg lg:text-xl flex items-center gap-2">
            ARGUS <span className="text-xs text-cyan-400/50 mt-1">v1.0</span>
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono mt-1">
            <span className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse"></span>
            <span className="text-gray-400 tracking-wider">SISTEMA ONLINE</span>
          </div>
        </div>
        
        <div className="ml-2">
          <BatteryIndicator />
        </div>
      </div>

      {/* Center: Language Selector */}
      <div className="flex items-center bg-cyan-950/40 rounded-lg p-1 border border-cyan-500/10 gap-1">
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

      {/* Right side Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex flex-col items-end mr-4">
          <div className="flex gap-1 items-center mb-1">
            <span className="text-cyan-500 text-[10px] uppercase font-bold tracking-widest text-cyan-glow">
              {status === 'listening' ? UI_TRANSLATIONS[currentLanguage].listening : 
               status === 'processing' ? UI_TRANSLATIONS[currentLanguage].processing : 
               status === 'analyzing' ? UI_TRANSLATIONS[currentLanguage].analyzing : 
               status === 'responding' ? UI_TRANSLATIONS[currentLanguage].responding :
               UI_TRANSLATIONS[currentLanguage].waiting}
            </span>
          </div>
          <div className={`flex items-end justify-center gap-[1px] h-2 w-12 transition-opacity duration-300 ${status !== 'listening' && status !== 'responding' ? 'opacity-20' : 'opacity-100'}`}>
            <div className="w-[3px] bg-cyan-400/60 rounded-t-sm" style={{ animation: 'typing-wave 1.2s infinite ease-in-out' }}></div>
            <div className="w-[3px] bg-cyan-500/80 rounded-t-sm" style={{ animation: 'typing-wave 1.2s infinite ease-in-out 0.2s' }}></div>
            <div className="w-[3px] bg-cyan-400 rounded-t-sm" style={{ animation: 'typing-wave 1.2s infinite ease-in-out 0.4s' }}></div>
            <div className="w-[3px] bg-cyan-500/80 rounded-t-sm" style={{ animation: 'typing-wave 1.2s infinite ease-in-out 0.6s' }}></div>
          </div>
        </div>
        
        <button 
          onClick={onHistoryToggle}
          className="p-2 rounded-full hover:bg-cyan-900/30 text-gray-400 hover:text-cyan-400 transition-colors duration-300 border border-transparent hover:border-cyan-500/30"
          title="Ver Histórico"
        >
          <History className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-cyan-900/30 text-gray-400 hover:text-cyan-400 transition-colors duration-300 border border-transparent hover:border-cyan-500/30">
          <Settings className="w-5 h-5" />
        </button>
        <button 
          onClick={onReset}
          className="p-2 rounded-full hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors duration-300 border border-transparent hover:border-red-500/30"
          title="Reset Context"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
