import { Paperclip, Mic, Send } from 'lucide-react';
import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  status: string;
  isMicActive: boolean;
  onToggleMic: () => void;
}

export function ChatInput({ onSendMessage, status, isMicActive, onToggleMic }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && status !== 'processing' && status !== 'analyzing') {
      onSendMessage(message);
      setMessage('');
    }
  };

  const isBusy = status === 'processing' || status === 'analyzing';

  return (
    <div className="w-full max-w-4xl mx-auto p-2 z-10 relative">
      {/* Decorative Outer Tech Brackets */}
      <div className={`absolute inset-0 border border-cyan-500/20 pointer-events-none transition-all duration-500 ${isFocused ? 'scale-[1.02] border-cyan-400/50' : 'scale-100'}`}>
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 -translate-x-[1px] -translate-y-[1px]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 translate-x-[1px] -translate-y-[1px]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 -translate-x-[1px] translate-y-[1px]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 translate-x-[1px] translate-y-[1px]" />
      </div>

      <form 
        onSubmit={handleSubmit}
        className={`relative flex items-end gap-2 p-3 bg-black/60 backdrop-blur-xl transition-all duration-300 ${
          isBusy ? 'opacity-50 pointer-events-none' : ''
        } ${isFocused ? 'shadow-[0_0_30px_rgba(0,240,255,0.15)] bg-cyan-950/30' : ''}`}
      >
        {/* Animated Scanning Line on Focus */}
        <div className={`absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />

        <button 
          type="button"
          className="p-3 text-cyan-500/60 hover:text-cyan-300 hover:bg-cyan-900/40 rounded-lg transition-colors duration-200"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <div className="flex-1 relative flex items-center">
          {/* Custom Terminal Prompt Indicator */}
          <span className="text-cyan-500/50 font-mono text-sm mr-2 select-none">$&gt;</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="INSERIR DADOS..."
            className="flex-1 bg-transparent border-none text-cyan-50 placeholder:text-cyan-500/30 resize-none outline-none font-mono text-sm uppercase tracking-wider py-3 min-h-[48px] max-h-[120px]"
            rows={1}
            disabled={isBusy}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
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
