import React, { useState, useEffect, useRef } from 'react';
import { Paperclip, Mic, Send, Terminal, HelpCircle, RotateCcw, Shield, Eye, Settings } from 'lucide-react';
import { AiStatus, ArgusLanguage, UI_TRANSLATIONS } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  status: AiStatus;
  isMicActive: boolean;
  onToggleMic: () => void;
  currentLanguage: ArgusLanguage;
  onLanguageChange: (lang: ArgusLanguage) => void;
  onReset: () => void;
  onToggleMemory?: () => void;
}

interface CommandItem {
  cmd: string;
  desc: string;
  icon: React.ReactNode;
  action: () => void;
}

export function ChatInput({
  onSendMessage,
  status,
  isMicActive,
  onToggleMic,
  currentLanguage,
  onLanguageChange,
  onReset,
  onToggleMemory
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS['pt-BR'];
  const isBusy = status === 'processing' || status === 'analyzing';

  // Automatically keep focus on the textarea whenever the system becomes idle
  useEffect(() => {
    if (!isBusy && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isBusy]);

  // Handle auto-resizing of textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Check if user is typing a command
  useEffect(() => {
    if (message.startsWith('/')) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  }, [message]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (message.trim() && !isBusy) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleCommandSelect = (cmd: string, action: () => void) => {
    setMessage('');
    setShowCommands(false);
    action();
  };

  const commands: CommandItem[] = [
    { cmd: '/reset', desc: t.resetContext, icon: <RotateCcw className="w-3.5 h-3.5" />, action: onReset },
    { cmd: '/memoria', desc: t.memoryPanel, icon: <Shield className="w-3.5 h-3.5" />, action: onToggleMemory || (() => {}) },
    { cmd: '/pt', desc: 'Mudar para Português', icon: <span className="text-xs">🇧🇷</span>, action: () => onLanguageChange('pt-BR') },
    { cmd: '/en', desc: 'Switch to English', icon: <span className="text-xs">🇬🇧</span>, action: () => onLanguageChange('en-GB') },
    { cmd: '/es', desc: 'Cambiar a Español', icon: <span className="text-xs">🇪🇸</span>, action: () => onLanguageChange('es-ES') },
    { cmd: '/fr', desc: 'Changer en Français', icon: <span className="text-xs">🇫🇷</span>, action: () => onLanguageChange('fr-FR') },
  ];

  const filteredCommands = commands.filter(c => 
    c.cmd.toLowerCase().startsWith(message.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-2 z-40 relative">
      
      {/* Quick Commands Popup Dropdown */}
      {showCommands && filteredCommands.length > 0 && (
        <div className="absolute bottom-full left-4 mb-2 w-64 bg-slate-950/95 border border-cyan-500/30 rounded-xl shadow-[0_-8px_30px_rgba(0,0,0,0.8)] z-50 backdrop-blur-xl animate-[fadeIn_0.2s_ease-out] overflow-hidden">
          <div className="px-3.5 py-2.5 bg-cyan-950/35 border-b border-cyan-500/10 flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase flex items-center gap-1.5">
              <Terminal className="w-3 h-3 animate-pulse" />
              {t.quickCommands}
            </span>
            <span className="text-[9px] text-gray-500 font-mono">TAB / CLICK</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredCommands.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleCommandSelect(item.cmd, item.action)}
                className="w-full px-3.5 py-2.5 text-left text-xs font-mono text-cyan-100 hover:bg-cyan-500/20 hover:text-cyan-300 flex items-center justify-between border-b border-cyan-500/5 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-cyan-400 group-hover:text-cyan-300">{item.icon}</span>
                  <span className="font-bold">{item.cmd}</span>
                </div>
                <span className="text-[10px] text-gray-500 group-hover:text-cyan-400/80">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Decorative Outer Tech Brackets */}
      <div className={`absolute inset-0 border border-cyan-500/20 pointer-events-none transition-all duration-500 ${isFocused ? 'scale-[1.01] border-cyan-400/50' : 'scale-100'}`}>
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 -translate-x-[1px] -translate-y-[1px]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 translate-x-[1px] -translate-y-[1px]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 -translate-x-[1px] translate-y-[1px]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 translate-x-[1px] translate-y-[1px]" />
      </div>

      <form 
        onSubmit={handleSubmit}
        className={`relative flex items-end gap-2 p-3 bg-black/60 border border-cyan-500/20 rounded-xl backdrop-blur-xl transition-all duration-300 ${
          isBusy ? 'opacity-50 pointer-events-none' : ''
        } ${isFocused ? 'shadow-[0_0_30px_rgba(0,240,255,0.15)] bg-cyan-950/20 border-cyan-400/40' : ''}`}
      >
        {/* Animated Scanning Line on Focus */}
        <div className={`absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />

        <button 
          type="button"
          className="p-3 text-cyan-500/60 hover:text-cyan-300 hover:bg-cyan-900/40 rounded-lg transition-all duration-200"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <div className="flex-1 relative flex items-center">
          {/* Custom Terminal Prompt Indicator */}
          <span className="text-cyan-500/50 font-mono text-sm mr-2 select-none">$&gt;</span>
          <textarea
            ref={textareaRef}
            autoFocus
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t.inputPlaceholder}
            className="flex-1 bg-transparent border-none text-cyan-50 placeholder:text-cyan-500/20 resize-none outline-none font-mono text-xs md:text-sm uppercase tracking-wider py-3 min-h-[48px] max-h-[120px] scrollbar-thin"
            rows={1}
            disabled={isBusy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2 pb-1 pr-1">
          <button 
            type="button"
            onClick={onToggleMic}
            className={`p-3 rounded-lg transition-all duration-300 ${
              isMicActive 
                ? 'text-cyan-100 bg-cyan-900/60 border border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.5)]' 
                : 'text-cyan-500/60 hover:text-cyan-300 hover:bg-cyan-900/40 border border-transparent'
            }`}
          >
            <Mic className={`w-5 h-5 ${isMicActive ? 'animate-pulse text-cyan-glow' : ''}`} />
          </button>
          
          <button 
            type="submit"
            disabled={!message.trim() || isBusy}
            className={`p-3 rounded-none transition-all duration-300 relative overflow-hidden group ${
              message.trim() 
                ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-400 hover:bg-cyan-400 hover:text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
                : 'bg-transparent text-cyan-800 border border-cyan-800/40'
            }`}
          >
            {message.trim() && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-200 to-transparent -translate-x-[150%] skew-x-[30deg] group-hover:animate-[shimmer_1.5s_infinite]" />
            )}
            <Send className="w-5 h-5 relative z-10" />
          </button>
        </div>
      </form>
    </div>
  );
}
