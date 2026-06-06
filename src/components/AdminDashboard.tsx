import React, { useState, useEffect } from 'react';
import { Shield, Users, Server, Radio, Database, X, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [logs, setLogs] = useState<{ time: string; service: string; msg: string; type: 'info' | 'warn' | 'error' }[]>([
    { time: '13:42:01', service: 'AUTH', msg: 'Sessão iniciada para o usuário creator@argus.io', type: 'info' },
    { time: '13:41:55', service: 'TTS', msg: 'Geração de voz neural concluída (Charon, 24kHz, size=48KB)', type: 'info' },
    { time: '13:41:52', service: 'GEMINI', msg: 'Requisição concluída em 382ms (tokens=124)', type: 'info' },
    { time: '13:40:12', service: 'SYSTEM', msg: 'Garbage Collection completado com sucesso', type: 'info' },
    { time: '13:38:29', service: 'DB', msg: 'Conexão restabelecida com Supabase Cluster (SA-East)', type: 'info' },
  ]);

  const [activeUsers, setActiveUsers] = useState(1);
  const [latency, setLatency] = useState(42);
  const [stats, setStats] = useState({ profiles: 1, sessions: 3, messages: 48, memories: 5, configured: false });

  // Fetch real Supabase database counts when dashboard is opened
  useEffect(() => {
    if (!isOpen) return;

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          setActiveUsers(data.profiles || 1);
        }
      } catch (e) {
        console.error('Failed to load admin stats:', e);
      }
    };

    fetchStats();
  }, [isOpen]);

  // Simple simulator to make logs and latency dashboard feel "alive"
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setLatency(prev => Math.max(20, Math.min(100, prev + Math.floor(Math.random() * 7) - 3)));

      // Randomly append new log
      const services = ['GEMINI', 'TTS', 'DB', 'AUTH', 'API'];
      const messages = [
        'Chamada API realizada com sucesso',
        'Cache atingido para consulta de contexto',
        'Validação de token bem-sucedida',
        'Geração de áudio concluída para dispositivo mobile',
        'Métricas de consumo gravadas no banco de dados',
      ];
      const randomService = services[Math.floor(Math.random() * services.length)];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      setLogs(prev => [
        { time: timeStr, service: randomService, msg: randomMsg, type: 'info' },
        ...prev.slice(0, 7)
      ]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isOpen]);

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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-45"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-4xl h-[85vh] bg-slate-950/95 border border-red-500/20 rounded-3xl shadow-[0_0_50px_rgba(255,0,0,0.1)] z-50 flex flex-col backdrop-blur-xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-red-500/10 flex items-center justify-between bg-red-950/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500 animate-pulse" />
                <h2 className="text-red-100 font-bold tracking-widest text-sm uppercase">Painel de Administração Secreto</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-950/30 rounded-full text-red-500/60 hover:text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Connection Status indicator */}
              <div className={`px-4 py-2 text-xs font-mono rounded-xl border flex items-center justify-between ${
                stats.configured 
                  ? 'bg-green-950/25 border-green-500/20 text-green-300' 
                  : 'bg-yellow-950/25 border-yellow-500/20 text-yellow-300'
              }`}>
                <span>ESTADO DO BANCO DE DADOS: {stats.configured ? 'SUPABASE CONECTADO' : 'FALLBACK LOCAL (MOCK)'}</span>
                <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              </div>

              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Users Online */}
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Perfis Criados</span>
                    <p className="text-xl md:text-2xl font-bold font-mono text-cyan-400">{stats.profiles}</p>
                  </div>
                  <Users className="w-8 h-8 text-cyan-500/30" />
                </div>

                {/* Server Latency */}
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Latência Global</span>
                    <p className="text-xl md:text-2xl font-bold font-mono text-green-400">{latency} ms</p>
                  </div>
                  <Server className="w-8 h-8 text-green-500/30" />
                </div>

                {/* Total messages */}
                <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Total Mensagens</span>
                    <p className="text-xl md:text-2xl font-bold font-mono text-purple-400">{stats.messages}</p>
                  </div>
                  <Radio className="w-8 h-8 text-purple-500/30" />
                </div>

              </div>

              {/* Hardware stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Hardware dials */}
                <div className="p-4 bg-slate-900/30 border border-slate-800/80 rounded-2xl space-y-4">
                  <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Utilização de Recursos
                  </h3>
                  
                  {/* CPU usage progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-gray-400">PROCESSADOR (CPU)</span>
                      <span className="text-cyan-400">38%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 w-[38%] shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
                    </div>
                  </div>

                  {/* RAM usage progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-gray-400">MEMÓRIA RAM</span>
                      <span className="text-purple-400">62%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-400 w-[62%] shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                    </div>
                  </div>

                  {/* Vercel Serverless DB load */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-gray-400">MEMÓRIAS PERSISTIDAS</span>
                      <span className="text-green-400">{stats.memories} fatos</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/20">
                      <div 
                        className="h-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.4)]" 
                        style={{ width: `${Math.min(100, (stats.memories / 20) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Operations configuration overrides */}
                <div className="p-4 bg-slate-900/30 border border-slate-800/80 rounded-2xl space-y-4">
                  <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Database className="w-4 h-4 text-red-400" />
                    Controles do Sistema
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-red-950/15 border border-red-500/15 rounded-xl text-center">
                      <span className="text-[10px] font-mono text-gray-500 block mb-1">CONVERSAS ATIVAS</span>
                      <div className="text-red-400 font-mono font-bold text-lg">{stats.sessions}</div>
                    </div>
                    <div className="p-3 bg-cyan-950/15 border border-cyan-500/15 rounded-xl text-center">
                      <span className="text-[10px] font-mono text-gray-500 block mb-1">CACHE DE PROMPT</span>
                      <button className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-mono rounded-lg transition-all">
                        ATIVADO
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Console Logs Terminal */}
              <div className="p-4 bg-black/80 border border-slate-800 rounded-2xl space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-shrink-0">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
                    Terminal de Registros do Sistema
                  </span>
                  <span className="text-[9px] text-gray-600">FILTRAGEM ATIVA</span>
                </div>
                
                <div className="space-y-2 text-xs h-36 overflow-y-auto custom-scrollbar select-text selection:bg-red-500/30">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 text-gray-400">
                      <span className="text-gray-600">[{log.time}]</span>
                      <span className="text-cyan-400/90 font-bold">[{log.service}]</span>
                      <span className="text-slate-100 flex-1">{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-red-500/10 bg-red-950/10 text-center flex-shrink-0">
              <p className="text-[10px] text-red-500/30 font-mono uppercase tracking-[0.2em]">
                Controle de Acesso de Nível 5 Autenticado • Antigravity
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
