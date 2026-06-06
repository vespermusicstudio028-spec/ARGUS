import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HologramCore } from './components/HologramCore';
import { ChatPanel } from './components/ChatPanel';
import { ChatInput } from './components/ChatInput';
import { HistoryDrawer } from './components/HistoryDrawer';
import { MemoryPanel } from './components/MemoryPanel';
import { UserPanel } from './components/UserPanel';
import { PricingPanel } from './components/PricingPanel';
import { AdminDashboard } from './components/AdminDashboard';
import { useArgusSpeech } from './hooks/useArgusSpeech';
import { ArgusLanguage, Message } from './types';
import { supabase } from './lib/supabase';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<ArgusLanguage>('pt-BR');
  
  // Drawer states
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [profileTrigger, setProfileTrigger] = useState(0); // Trigger to reload profile in panels

  // Load message history from Supabase on init or when sessionId changes
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let savedId = localStorage.getItem('argus_session_id');
    if (!savedId) {
      savedId = crypto.randomUUID();
      localStorage.setItem('argus_session_id', savedId);
    }
    setSessionId(savedId);
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('argus_messages')
          .select('role, text, created_at')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = data.map((msg: any) => {
            const time = new Date(msg.created_at);
            return {
              role: msg.role,
              text: msg.text,
              timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          });
          setMessages(mapped);
        }
      } catch (e) {
        console.warn('Failed to load message history from Supabase (this is normal if tables do not exist yet):', e);
      }
    };

    fetchHistory();
  }, [sessionId]);

  const handleMessageUser = (msg: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: msg, timestamp }]);
    setProfileTrigger(prev => prev + 1); // Trigger profile reload due to message count increase
  };

  const handleMessageAi = (msg: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'ai', text: msg, timestamp }]);
    setProfileTrigger(prev => prev + 1); // Trigger profile reload
  };

  const { 
    status, 
    isMicActive, 
    toggleMic, 
    sendTextMessage, 
    hasBrowserSupport, 
    resetSession,
    analyser
  } = useArgusSpeech({
    onMessageUser: handleMessageUser,
    onMessageAi: handleMessageAi,
    language: currentLanguage
  });

  const handleReset = async () => {
    await resetSession();
    setMessages([]);
    setProfileTrigger(prev => prev + 1);
  };

  return (
    <div className="relative flex flex-col h-screen w-full hud-container overflow-hidden text-cyan-50">
      
      {/* Immersive Background Environments */}
      <div className="absolute inset-0 bg-tech-grid pointer-events-none z-0 rotate-180 mix-blend-screen" />
      
      {/* Dynamic scanline overlay effect for the "Holographic" vibe */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.2)_51%)] bg-[length:100%_4px] opacity-30 mix-blend-overlay" />
      
      {/* Deep vignette for focus */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.95)] z-40" />

      {/* Main Layout Hierarchy Header */}
      <div className="relative z-20">
        <Header 
          status={status} 
          currentLanguage={currentLanguage} 
          onLanguageChange={setCurrentLanguage} 
          onReset={handleReset}
          onHistoryToggle={() => setIsHistoryOpen(!isHistoryOpen)}
          onSettingsToggle={() => setIsMemoryOpen(!isMemoryOpen)}
          onProfileToggle={() => setIsUserOpen(!isUserOpen)}
          onPlansToggle={() => setIsPlansOpen(!isPlansOpen)}
          onAdminToggle={() => setIsAdminOpen(!isAdminOpen)}
        />
      </div>

      {/* Drawer Panels */}
      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        messages={messages}
        onRecall={(text) => {
          sendTextMessage(text);
          setIsHistoryOpen(false);
        }}
      />

      <MemoryPanel 
        isOpen={isMemoryOpen} 
        onClose={() => setIsMemoryOpen(false)} 
        language={currentLanguage} 
      />

      <UserPanel 
        isOpen={isUserOpen} 
        onClose={() => setIsUserOpen(false)} 
        language={currentLanguage} 
        triggerReload={profileTrigger}
        onUpgradeComplete={() => setProfileTrigger(prev => prev + 1)}
      />

      <PricingPanel 
        isOpen={isPlansOpen} 
        onClose={() => setIsPlansOpen(false)} 
        onUpgradeComplete={() => setProfileTrigger(prev => prev + 1)}
      />

      <AdminDashboard 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
      />
      
      {!hasBrowserSupport && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-950/70 border border-red-500/50 text-red-200 px-4 py-2 text-xs font-mono rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.3)] backdrop-blur-md">
          Alerta: API de Voz não suportada neste navegador.
        </div>
      )}

      {/* Responsive Workspace Layout */}
      <main className="flex-1 flex flex-col md:flex-row relative z-10 overflow-hidden min-h-0">
        
        {/* Hologram Section (Compact stacked on mobile, left-side on desktop) */}
        <div className="h-[230px] md:h-full w-full md:w-[42%] flex-shrink-0 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-cyan-500/10 overflow-hidden">
          {/* Subtle status colored radial ambient glow behind core */}
          <div className="absolute w-[200px] h-[200px] md:w-[320px] md:h-[320px] bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
          <HologramCore 
            status={status} 
            language={currentLanguage} 
            analyser={analyser} 
            isMicActive={isMicActive} 
          />
        </div>

        {/* Chat Timeline Panel Section */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
          <ChatPanel 
            messages={messages} 
            status={status} 
            language={currentLanguage} 
          />
        </div>
      </main>

      {/* Futuristic input block at the footer */}
      <div className="mt-auto mb-5 px-4 md:px-8 z-30 relative flex-shrink-0">
        {/* Ambient glow under active processing states */}
        {status === 'processing' || status === 'analyzing' ? (
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-cyan-500/15 blur-[60px] rounded-full pointer-events-none animate-pulse" />
        ) : (
           <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-cyan-500/5 blur-[50px] rounded-full pointer-events-none" />
        )}
        <ChatInput 
          onSendMessage={sendTextMessage} 
          status={status} 
          isMicActive={isMicActive} 
          onToggleMic={toggleMic}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onReset={handleReset}
          onToggleMemory={() => setIsMemoryOpen(!isMemoryOpen)}
        />
      </div>
    </div>
  );
}
