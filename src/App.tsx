import React, { useState } from 'react';
import { Header } from './components/Header';
import { HologramCore } from './components/HologramCore';
import { ChatInput } from './components/ChatInput';
import { HistoryDrawer } from './components/HistoryDrawer';
import { useArgusSpeech } from './hooks/useArgusSpeech';
import { ArgusLanguage } from './types';

export default function App() {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<ArgusLanguage>('pt-BR');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleMessageUser = (msg: string) => {
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
  };

  const handleMessageAi = (msg: string) => {
    setMessages(prev => [...prev, { role: 'ai', text: msg }]);
  };

  const { status, isMicActive, toggleMic, sendTextMessage, hasBrowserSupport, resetSession } = useArgusSpeech({
    onMessageUser: handleMessageUser,
    onMessageAi: handleMessageAi,
    language: currentLanguage
  });

  const handleReset = () => {
    resetSession();
    setMessages([]);
  };

  return (
    <div className="relative flex flex-col h-screen w-full hud-container overflow-hidden text-cyan-50">
      {/* Immersive Background Environments */}
      <div className="absolute inset-0 bg-tech-grid pointer-events-none z-0 rotate-180 mix-blend-screen" />
      
      {/* Dynamic scanline overlay effect for the "Holographic" vibe */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.25)_51%)] bg-[length:100%_4px] opacity-30 mix-blend-overlay" />
      
      {/* Deep vignette for focus */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.95)] z-40" />

      {/* Main Layout Hierarchy */}
      <div className="relative z-20">
        <Header 
          status={status} 
          currentLanguage={currentLanguage} 
          onLanguageChange={setCurrentLanguage} 
          onReset={handleReset}
          onHistoryToggle={() => setIsHistoryOpen(!isHistoryOpen)}
        />
      </div>

      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        messages={messages}
        onRecall={(text) => {
          sendTextMessage(text);
          setIsHistoryOpen(false);
        }}
      />
      
      {!hasBrowserSupport && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-900/50 border border-red-500 text-red-100 px-4 py-2 rounded">
          Alerta: API de Voz não suportada neste navegador.
        </div>
      )}

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
         <HologramCore status={status} language={currentLanguage} />
          
         {/* HUD Subtitle projection for recent messages */}
         <div className="absolute bottom-20 left-0 w-full flex flex-col items-center pointer-events-none px-4 pb-12 overflow-hidden">
            <div className="w-full max-w-2xl flex flex-col justify-end min-h-[100px]">
              {messages.slice(-2).map((msg, idx) => (
                <div key={idx} className={`w-full text-center mb-3 animate-[pulse-glow_2s_ease-in-out_infinite] transition-all opacity-90 ${msg.role === 'user' ? 'text-gray-400 font-mono text-xs uppercase' : 'text-cyan-200 text-lg font-medium tracking-wide drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]'}`}>
                   {msg.text}
                </div>
              ))}
            </div>
         </div>
      </main>

      <div className="mt-auto mb-6 px-4 md:px-8 z-30 relative">
        {/* Glow behind input */}
        {status === 'processing' || status === 'analyzing' ? (
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-cyan-500/20 blur-[60px] rounded-full pointer-events-none animate-pulse" />
        ) : (
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />
        )}
        <ChatInput 
            onSendMessage={sendTextMessage} 
            status={status} 
            isMicActive={isMicActive} 
            onToggleMic={toggleMic} 
        />
      </div>
    </div>
  );
}
