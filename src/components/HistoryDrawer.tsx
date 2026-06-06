import React, { useState } from 'react';
import { History, X, MessageSquare, Terminal, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Message } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onRecall?: (text: string) => void;
}

export function HistoryDrawer({ isOpen, onClose, messages, onRecall }: HistoryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter messages based on search query
  const filteredMessages = messages.filter(msg => 
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-slate-950/90 border-l border-cyan-500/20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-50 flex flex-col backdrop-blur-md"
          >
            {/* Header */}
            <div className="p-6 border-b border-cyan-500/10 flex items-center justify-between bg-cyan-950/20">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                <h2 className="text-cyan-100 font-bold tracking-widest text-sm uppercase">Histórico de Dados</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-cyan-900/40 rounded-full text-cyan-400/60 hover:text-cyan-400 transition-colors"
                id="close-history-drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Box */}
            <div className="p-4 border-b border-cyan-500/10 bg-cyan-950/10 relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="FILTRAR MENSAGENS..."
                  className="w-full bg-slate-900/60 border border-cyan-500/20 rounded-lg pl-9 pr-8 py-2 text-xs font-mono text-cyan-100 placeholder-cyan-500/40 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all duration-300"
                />
                <Search className="w-4 h-4 text-cyan-500/40 absolute left-3 top-2.5" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2 text-cyan-500 hover:text-cyan-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-cyan-500/40 opacity-50">
                  <Terminal className="w-12 h-12 mb-4 animate-pulse" />
                  <p className="text-xs uppercase tracking-widest font-mono">
                    {searchQuery ? 'Nenhum match encontrado' : 'Nenhum registro encontrado'}
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                    className={`p-4 rounded-lg border flex flex-col gap-2 group transition-all duration-300 ${
                      msg.role === 'user' 
                        ? 'bg-cyan-500/5 border-cyan-500/10 hover:border-cyan-500/30' 
                        : 'bg-slate-900/40 border-slate-700/20 hover:border-cyan-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold tracking-widest uppercase font-mono ${
                        msg.role === 'user' ? 'text-cyan-400' : 'text-purple-400'
                      }`}>
                        {msg.role === 'user' ? 'Solicitação' : 'Replicação'}
                      </span>
                      {msg.role === 'user' && onRecall && (
                        <button 
                          onClick={() => {
                            onRecall(msg.text);
                            onClose();
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono tracking-wider transition-opacity"
                        >
                          [REPETIR]
                        </button>
                      )}
                    </div>
                    <p className={`text-xs md:text-sm tracking-wide leading-relaxed font-sans ${
                      msg.role === 'user' ? 'text-cyan-100/90' : 'text-gray-300'
                    }`}>
                      {msg.text}
                    </p>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-cyan-500/10 text-center bg-cyan-950/20">
              <p className="text-[10px] text-cyan-500/30 font-mono uppercase tracking-[0.3em]">
                Argus Logging System v2.0
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
