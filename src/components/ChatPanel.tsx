import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, Cpu, User } from 'lucide-react';
import { Message, AiStatus, ArgusLanguage, UI_TRANSLATIONS } from '../types';
import { TypingIndicator } from './TypingIndicator';

interface ChatPanelProps {
  messages: Message[];
  status: AiStatus;
  language: ArgusLanguage;
  onFeedback?: (messageIndex: number, type: 'positive' | 'negative') => void;
}

export function ChatPanel({ messages, status, language, onFeedback }: ChatPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<number, 'positive' | 'negative'>>({});

  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['pt-BR'];

  // Smooth scroll to bottom when messages list changes or status changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, status]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handleFeedback = (index: number, type: 'positive' | 'negative') => {
    setFeedbackState(prev => ({ ...prev, [index]: type }));
    if (onFeedback) {
      onFeedback(index, type);
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return timestamp;
  };

  const isAiTyping = status === 'processing' || status === 'analyzing';

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-transparent relative z-10">
      
      {/* Messages Scroll Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin max-h-full"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20 px-6">
            <Cpu className="w-12 h-12 text-cyan-400 mb-4 animate-pulse" />
            <p className="font-mono text-sm tracking-widest text-cyan-200">
              {t.waitingCommand.toUpperCase()}
            </p>
            <p className="text-xs text-gray-500 mt-2 max-w-xs">
              Mande uma mensagem de texto ou clique no microfone para falar com a ARGUS.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            
            return (
              <div 
                key={index} 
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] animate-[fadeIn_0.35s_ease-out] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border backdrop-blur-md ${
                  isUser 
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                    : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
                </div>

                {/* Message Bubble Wrapper */}
                <div className="flex flex-col space-y-1">
                  <div className={`px-4 py-3 rounded-2xl border text-sm leading-relaxed shadow-lg backdrop-blur-sm relative transition-all duration-300 ${
                    isUser 
                      ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-100 rounded-tr-sm' 
                      : 'bg-slate-900/40 border-slate-700/20 text-slate-100 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
                  }`}>
                    
                    {/* Header Label (USER / ARGUS) */}
                    <div className="flex items-center gap-2 mb-1.5 text-[9px] font-mono tracking-widest text-gray-500 uppercase">
                      <span>{isUser ? 'USER' : 'ARGUS'}</span>
                      <span>•</span>
                      <span>{formatTime(msg.timestamp)}</span>
                    </div>

                    {/* Text content */}
                    <p className="whitespace-pre-wrap select-text selection:bg-cyan-500/30 font-sans leading-relaxed text-[13px] md:text-sm">
                      {msg.text}
                    </p>
                  </div>

                  {/* Actions Bar under Bubble (Only for AI responses) */}
                  {!isUser && (
                    <div className="flex items-center gap-3 px-1 text-[10px] text-gray-500 font-mono">
                      {/* Copy Action */}
                      <button 
                        onClick={() => handleCopy(msg.text, index)}
                        className="flex items-center gap-1 hover:text-cyan-400 transition-colors duration-200 py-1"
                        title={t.copy}
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">{t.copied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{t.copy}</span>
                          </>
                        )}
                      </button>

                      {/* Divider */}
                      <span>|</span>

                      {/* Feedback buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFeedback(index, 'positive')}
                          className={`hover:text-green-400 transition-colors duration-200 py-1 ${
                            feedbackState[index] === 'positive' ? 'text-green-400 font-bold' : ''
                          }`}
                          title={t.feedbackPositive}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(index, 'negative')}
                          className={`hover:text-red-400 transition-colors duration-200 py-1 ${
                            feedbackState[index] === 'negative' ? 'text-red-400 font-bold' : ''
                          }`}
                          title={t.feedbackNegative}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* AI Processing Typing Wave */}
        {isAiTyping && (
          <div className="flex gap-3 max-w-[85%] sm:max-w-[75%] animate-pulse">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Cpu className="w-4 h-4 animate-spin" />
            </div>
            <TypingIndicator />
          </div>
        )}
      </div>
    </div>
  );
}
