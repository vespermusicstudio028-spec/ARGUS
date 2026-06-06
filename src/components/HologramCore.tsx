import React from 'react';
import { ArgusLanguage, UI_TRANSLATIONS } from '../types';
import { ParticleCanvas } from './ParticleCanvas';
import { AudioVisualizer } from './AudioVisualizer';

interface HologramCoreProps {
  status: 'listening' | 'processing' | 'analyzing' | 'responding' | 'waiting' | 'standby' | 'error';
  language: ArgusLanguage;
  analyser?: AnalyserNode | null;
  isMicActive?: boolean;
}

export function HologramCore({ status, language, analyser, isMicActive = false }: HologramCoreProps) {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['pt-BR'];

  // Determine speeds and visual settings based on AI state
  const isProcessing = status === 'processing' || status === 'analyzing';
  const processingSpeed = status === 'error' ? '0.1s' : isProcessing ? '0.4s' : '4s';
  const ringSpeed1 = status === 'error' ? '0.5s' : isProcessing ? '1.5s' : status === 'standby' ? '35s' : '12s';
  const ringSpeed2 = status === 'error' ? '0.8s' : isProcessing ? '2s' : status === 'standby' ? '50s' : '18s';
  const ringSpeed3 = status === 'error' ? '1.2s' : isProcessing ? '2.8s' : status === 'standby' ? '70s' : '24s';

  const opacityClass = status === 'standby' ? 'opacity-30' : 'opacity-100';

  // Glow colors based on status
  const getGlowColor = () => {
    switch (status) {
      case 'listening':
        return 'rgba(0, 240, 255, 0.14)';
      case 'processing':
        return 'rgba(168, 85, 247, 0.14)';
      case 'analyzing':
        return 'rgba(234, 179, 8, 0.14)';
      case 'responding':
        return 'rgba(34, 211, 238, 0.18)';
      case 'standby':
        return 'rgba(100, 100, 100, 0.05)';
      case 'error':
        return 'rgba(239, 68, 68, 0.2)';
      default:
        return 'rgba(0, 240, 255, 0.1)';
    }
  };

  const getCoreGlowClass = () => {
    switch (status) {
      case 'listening':
        return 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.6),inset_0_0_15px_rgba(0,240,255,0.4)]';
      case 'processing':
        return 'border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.6),inset_0_0_15px_rgba(168,85,247,0.4)]';
      case 'analyzing':
        return 'border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.6),inset_0_0_15px_rgba(234,179,8,0.4)]';
      case 'responding':
        return 'border-cyan-300 shadow-[0_0_35px_rgba(34,211,238,0.8),inset_0_0_20px_rgba(34,211,238,0.6)] animate-pulse';
      case 'error':
        return 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.9),inset_0_0_25px_rgba(239,68,68,0.7)] animate-bounce';
      case 'standby':
        return 'border-slate-600 shadow-[0_0_10px_rgba(100,116,139,0.2),inset_0_0_5px_rgba(100,116,139,0.1)]';
      default:
        return 'border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.3)]';
    }
  };

  const getCorePlasmaClass = () => {
    switch (status) {
      case 'listening':
        return 'bg-cyan-100 shadow-[0_0_20px_#fff,0_0_40px_#00f0ff]';
      case 'processing':
        return 'bg-purple-200 shadow-[0_0_20px_#fff,0_0_40px_#a855f7]';
      case 'analyzing':
        return 'bg-yellow-100 shadow-[0_0_20px_#fff,0_0_40px_#eab308]';
      case 'responding':
        return 'bg-cyan-50 shadow-[0_0_30px_#fff,0_0_50px_#22d3ee]';
      case 'error':
        return 'bg-red-200 shadow-[0_0_30px_#fff,0_0_50px_#ef4444]';
      case 'standby':
        return 'bg-slate-400 shadow-[0_0_5px_#94a3b8]';
      default:
        return 'bg-cyan-200 shadow-[0_0_15px_#fff,0_0_30px_#00f0ff]';
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center flex-1 w-full max-w-3xl mx-auto z-0 overflow-hidden py-4 md:py-8 transition-all duration-1000 ${opacityClass}`}>
      
      {/* Background glow radiating from center */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-screen transition-all duration-1000" 
        style={{ background: `radial-gradient(circle at center, ${getGlowColor()} 0%, transparent 65%)` }}
      />

      {/* Particle Canvas Layer */}
      <ParticleCanvas status={status} />

      {/* Real-time Audio Visualizer waves around the core */}
      <AudioVisualizer status={status} analyser={analyser} isMicActive={isMicActive} />

      {/* The Holographic Construct */}
      <div className="relative w-[280px] h-[280px] md:w-[440px] md:h-[440px] flex items-center justify-center hologram-effect perspective-container">
        
        {/* 3D Gyroscopic Rings */}
        {/* Outer Ring */}
        <div 
          className={`absolute w-[95%] h-[95%] border rounded-full border-dashed opacity-70 transition-colors duration-500 ${
            status === 'error' ? 'border-red-500/40' : status === 'processing' ? 'border-purple-500/40' : 'border-cyan-500/30'
          }`}
          style={{ animation: `gyro-1 ${ringSpeed3} linear infinite` }}
        />
        
        {/* Middle Ring */}
        <div 
          className={`absolute w-[80%] h-[80%] border-[2px] border-transparent rounded-full opacity-80 transition-all duration-500 ${
            status === 'error' 
              ? 'border-t-red-500 border-b-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)_inset]' 
              : status === 'processing'
              ? 'border-t-purple-400 border-b-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)_inset]'
              : 'border-t-cyan-400 border-b-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)_inset]'
          }`}
          style={{ animation: `gyro-2 ${ringSpeed2} linear infinite` }}
        >
          <div className={`absolute top-0 left-1/2 w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#fff] transition-colors duration-500 ${
            status === 'error' ? 'bg-red-300' : status === 'processing' ? 'bg-purple-300' : 'bg-cyan-200'
          }`} />
          <div className={`absolute bottom-0 left-1/2 w-2.5 h-2.5 rounded-full -translate-x-1/2 translate-y-1/2 shadow-[0_0_10px_#fff] transition-colors duration-500 ${
            status === 'error' ? 'bg-red-300' : status === 'processing' ? 'bg-purple-300' : 'bg-cyan-200'
          }`} />
        </div>
        
        {/* Inner Ring */}
        <div 
          className={`absolute w-[65%] h-[65%] border-[1.5px] border-transparent rounded-full border-dashed transition-colors duration-500 ${
            status === 'error' ? 'border-l-red-400/50 border-r-red-400/50' : status === 'processing' ? 'border-l-purple-400/50 border-r-purple-400/50' : 'border-l-cyan-300/60 border-r-cyan-300/60'
          }`}
          style={{ animation: `gyro-3 ${ringSpeed1} linear infinite` }}
        />

        {/* HUD Crosshairs/Targeting Elements (Fixed) */}
        <div className="absolute inset-0 pointer-events-none opacity-45">
          <div className={`absolute top-[8%] left-1/2 w-[1px] h-5 -translate-x-1/2 transition-colors duration-500 ${status === 'error' ? 'bg-red-500' : 'bg-cyan-500'}`} />
          <div className={`absolute bottom-[8%] left-1/2 w-[1px] h-5 -translate-x-1/2 transition-colors duration-500 ${status === 'error' ? 'bg-red-500' : 'bg-cyan-500'}`} />
          <div className={`absolute left-[8%] top-1/2 h-[1px] w-5 -translate-y-1/2 transition-colors duration-500 ${status === 'error' ? 'bg-red-500' : 'bg-cyan-500'}`} />
          <div className={`absolute right-[8%] top-1/2 h-[1px] w-5 -translate-y-1/2 transition-colors duration-500 ${status === 'error' ? 'bg-red-500' : 'bg-cyan-500'}`} />
        </div>

        {/* Central Glowing Core (Holographic Core Energy) */}
        <div 
          className={`absolute w-[24%] h-[24%] rounded-full bg-black/60 backdrop-blur-md border flex items-center justify-center mix-blend-screen z-10 transition-all duration-500 ${getCoreGlowClass()}`} 
          style={{ animation: `core-pulse ${processingSpeed} ease-in-out infinite` }}
        >
          {/* Intense center plasma */}
          <div className={`w-[45%] h-[45%] rounded-full transition-all duration-500 ${getCorePlasmaClass()}`} />
          
          {/* Emitting Ripple Rings if responding/listening */}
          {status === 'responding' && (
            <>
              <div className="absolute inset-[-50%] border border-cyan-400 rounded-full animate-[pulse-ring_1.8s_infinite] pointer-events-none" />
              <div className="absolute inset-[-50%] border border-cyan-300/60 rounded-full animate-[pulse-ring_1.8s_infinite_0.6s] pointer-events-none" />
            </>
          )}
          {status === 'listening' && (
            <div className="absolute inset-[-35%] border border-cyan-500/40 rounded-full animate-[pulse-ring_2.2s_infinite] pointer-events-none" />
          )}
        </div>

        {/* Central Logo Overlay (Floating Above) */}
        <div 
          className={`absolute top-1/2 left-1/2 pointer-events-none z-30 font-mono font-bold tracking-[0.5em] text-white text-2xl md:text-4xl transition-all duration-500 ${
            status === 'error' ? 'text-red-400 text-shadow-red' : 'text-cyan-50'
          }`}
          style={{ 
            transform: 'translate(calc(-50% + 0.25em), -50%)', 
            textShadow: status === 'error' 
              ? '0 0 15px rgba(239, 68, 68, 0.9), 0 2px 10px rgba(0,0,0,1)' 
              : '0 0 12px rgba(0, 240, 255, 0.8), 0 2px 10px rgba(0,0,0,1)' 
          }}
        >
          ARGUS
        </div>

      </div>

      {/* Greeting Message Panel */}
      <div className={`absolute bottom-[10%] w-full max-w-lg mx-auto flex flex-col items-center gap-2 transition-all duration-700 ${status !== 'listening' && status !== 'waiting' && status !== 'standby' && status !== 'error' ? 'opacity-0 translate-y-6 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'}`}>
        <div className={`hud-bracket px-10 py-3 flex flex-col items-center bg-cyan-950/20 backdrop-blur-md border-t border-b border-cyan-500/20 transition-all duration-500 ${
          status === 'error' ? 'border-red-500/30 bg-red-950/10' : ''
        }`}>
          <p className={`font-bold tracking-[0.2em] uppercase text-base md:text-lg text-center text-cyan-glow transition-colors duration-500 ${
            status === 'error' ? 'text-red-400 text-shadow-red' : 'text-cyan-300'
          }`}>
            {status === 'standby' ? t.standby : status === 'error' ? t.error : t.howCanIHelp}
          </p>
          <div className={`h-[1px] w-full max-w-[160px] my-2 opacity-80 ${
            status === 'error' ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent' : 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent'
          }`} />
          <p className="text-cyan-200/60 font-mono text-[10px] md:text-xs tracking-widest uppercase flex items-center gap-2">
            {status === 'waiting' ? (
              <span className="w-1.5 h-3 bg-red-500/40" />
            ) : status === 'standby' ? (
              <span className="w-1.5 h-3 bg-amber-500/40" />
            ) : status === 'error' ? (
              <span className="w-1.5 h-3 bg-red-500 animate-pulse" />
            ) : (
              <span className="w-1.5 h-3 bg-cyan-500 animate-pulse" />
            )}
            {status === 'waiting' ? t.voiceDisabled : status === 'standby' ? t.standby : status === 'error' ? 'VERIFIQUE O SERVIDOR' : t.waitingCommand}
          </p>
        </div>
      </div>

      {/* Response Message Panel */}
      <div className={`absolute bottom-[10%] flex flex-col items-center gap-2 transition-all duration-700 ${status === 'responding' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95 pointer-events-none'}`}>
        <div className="px-6 py-2.5 bg-cyan-900/30 border border-cyan-400/40 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <p className="text-cyan-100 font-bold tracking-widest uppercase text-xs md:text-sm text-center text-cyan-glow flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            {t.transmitting}
          </p>
        </div>
      </div>

    </div>
  );
}
