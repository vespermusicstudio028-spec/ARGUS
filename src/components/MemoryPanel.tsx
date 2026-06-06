import React, { useState, useEffect } from 'react';
import { Brain, Trash2, Plus, X, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ArgusLanguage, UI_TRANSLATIONS } from '../types';

interface MemoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: ArgusLanguage;
}

export function MemoryPanel({ isOpen, onClose, language }: MemoryPanelProps) {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['pt-BR'];
  
  const [memories, setMemories] = useState<{ id: string; fact: string }[]>([]);
  const [newFact, setNewFact] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load memories from backend when panel is opened
  useEffect(() => {
    if (!isOpen) return;

    const loadMemories = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/memory');
        if (res.ok) {
          const data = await res.json();
          setMemories(data);
        }
      } catch (err) {
        console.error('Failed to load memories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemories();
  }, [isOpen]);

  const handleAddFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;

    try {
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fact: newFact.trim() })
      });

      if (res.ok) {
        const newMemory = await res.json();
        setMemories(prev => [newMemory, ...prev]);
        setNewFact('');
      }
    } catch (err) {
      console.error('Failed to add fact:', err);
    }
  };

  const handleDeleteFact = async (id: string) => {
    try {
      const res = await fetch('/api/memory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        setMemories(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete fact:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch('/api/memory', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearAll: true })
      });

      if (res.ok) {
        setMemories([]);
      }
    } catch (err) {
      console.error('Failed to clear memories:', err);
    }
  };

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

          {/* Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-full max-w-sm bg-slate-950/90 border-r border-cyan-500/20 shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-50 flex flex-col backdrop-blur-md"
          >
            {/* Header */}
            <div className="p-6 border-b border-cyan-500/10 flex items-center justify-between bg-cyan-950/20">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h2 className="text-cyan-100 font-bold tracking-widest text-sm uppercase">
                  {t.memoryPanel || 'Memória Contextual'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-cyan-900/40 rounded-full text-cyan-400/60 hover:text-cyan-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input to insert fact */}
            <form onSubmit={handleAddFact} className="p-4 border-b border-cyan-500/10 bg-cyan-950/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFact}
                  onChange={(e) => setNewFact(e.target.value)}
                  placeholder="ADICIONAR FATO À MEMÓRIA..."
                  className="flex-1 bg-slate-900/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-xs font-mono text-cyan-100 placeholder-cyan-500/30 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newFact.trim()}
                  className="p-2 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all disabled:opacity-35"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-cyan-400/50 font-mono text-xs uppercase tracking-widest gap-2">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Carregando...
                </div>
              ) : memories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-cyan-500/30 opacity-50 text-center px-4 py-8">
                  <Lightbulb className="w-10 h-10 mb-3 text-cyan-500/40" />
                  <p className="text-xs uppercase tracking-widest font-mono">
                    {t.memoryEmpty || 'Nenhum fato na memória.'}
                  </p>
                </div>
              ) : (
                memories.map((item, idx) => (
                  <motion.div
                    key={item.id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                    className="p-3 bg-cyan-950/10 border border-cyan-500/10 rounded-lg flex items-start justify-between gap-3 group hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex gap-2 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0 animate-pulse" />
                      <p className="text-xs md:text-sm font-sans text-cyan-100/90 leading-relaxed">
                        {item.fact}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteFact(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all rounded-md"
                      title="Apagar Fato"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-cyan-500/10 bg-cyan-950/20 flex items-center justify-between">
              <span className="text-[10px] text-cyan-500/40 font-mono tracking-widest uppercase">
                {memories.length} FATOS RETIDOS
              </span>
              {memories.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1.5 border border-red-500/20 px-2.5 py-1 rounded bg-red-950/10 hover:bg-red-950/30 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  {t.clearMemory || 'Limpar Tudo'}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
