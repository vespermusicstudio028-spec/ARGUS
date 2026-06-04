import React from 'react';
import { ArgusLanguage, UI_TRANSLATIONS } from '../types';

interface HologramCoreProps {
  status: 'listening' | 'processing' | 'analyzing' | 'responding' | 'waiting' | 'standby';
  language: ArgusLanguage;
}

export function HologramCore({ status, language }: HologramCoreProps) {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS['pt-BR'];
  // Determine styles based on state
  const isProcessing = status === 'processing' || status === 'analyzing';
  const processingSpeed = isProcessing ? '0.4s' : '4s';
  const ringSpeed1 = isProcessing ? '1.5s' : status === 'standby' ? '30s' : '12s';
  const ringSpeed2 = isProcessing ? '2s' : status === 'standby' ? '45s' : '18s';
  const ringSpeed3 = isProcessing ? '2.5s' : status === 'standby' ? '60s' : '24s';

  const opacityClass = status === 'standby' ? 'opacity-30' : 'opacity-100';
  const glowColorStr = status === 'standby' ? 'rgba(100,100,100,0.12)' : 'rgba(0,240,255,0.12)';

  return (
    <div className={`relative flex flex-col items-center justify-center flex-1 w-full max-w-3xl mx-auto z-0 overflow-hidden py-10 transition-opacity duration-1000 ${opacityClass}`}>
      
      {/* Intense Background glow radiating from center */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-screen transition-all duration-1000" 
        style={{ background: `radial-gradient(circle at center, ${glowColorStr} 0%, transparent 60%)` }}
      />

      {/* The Holographic Construct */}
      <div className="relative w-[320px] h-[320px] md:w-[480px] md:h-[480px] flex items-center justify-center hologram-effect perspective-container">
        
        {/* 3D Gyroscopic Rings */}
        {/* Outer Ring */}
        <div 
          className="absolute w-[95%] h-[95%] border border-cyan-500/30 rounded-full border-dashed opacity-80"
          style={{ animation: `gyro-1 ${ringSpeed3} linear infinite` }}
        />
        
        {/* Middle Ring */}
        <div 
          className="absolute w-[80%] h-[80%] border-[3px] border-transparent border-t-cyan-400 border-b-cyan-400 rounded-full opacity-90 shadow-[0_0_15px_rgba(0,240,255,0.5)_inset]"
          style={{ animation: `gyro-2 ${ringSpeed2} linear infinite` }}
        >
            <div className="absolute top-0 left-1/2 w-3 h-3 bg-cyan-300 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#fff]" />
            <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-cyan-300 rounded-full -translate-x-1/2 translate-y-1/2 shadow-[0_0_10px_#fff]" />
        </div>
        
        {/* Inner Ring */}
        <div 
          className="absolute w-[65%] h-[65%] border-[2px] border-transparent border-l-cyan-300/80 border-r-cyan-300/80 rounded-full border-dashed"
          style={{ animation: `gyro-3 ${ringSpeed1} linear infinite` }}
        />

        {/* HUD Crosshairs/Targeting Elements (Fixed) */}
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[10%] left-1/2 w-[1px] h-4 bg-cyan-500/50 -translate-x-1/2" />
            <div className="absolute bottom-[10%] left-1/2 w-[1px] h-4 bg-cyan-500/50 -translate-x-1/2" />
            <div className="absolute left-[10%] top-1/2 h-[1px] w-4 bg-cyan-500/50 -translate-y-1/2" />
            <div className="absolute right-[10%] top-1/2 h-[1px] w-4 bg-cyan-500/50 -translate-y-1/2" />
        </div>

        {/* Central Glowing Core */}
        <div 
            className="absolute w-[28%] h-[28%] rounded-full bg-cyan-950/60 backdrop-blur-md border border-cyan-400/50 flex items-center justify-center mix-blend-screen z-10" 
            style={{ animation: `core-pulse ${processingSpeed} ease-in-out infinite` }}
        >
          {/* Intense center plasma */}
          <div className="w-[45%] h-[45%] rounded-full bg-cyan-100 shadow-[0_0_30px_#fff,0_0_60px_#00f0ff]" />
          
          {/* Emitting Rings if responding */}
          {status === 'responding' && (
            <>
              <div className="absolute inset-[-40%] border-2 border-cyan-300 rounded-full animate-[pulse-ring_1.5s_infinite]" />
              <div className="absolute inset-[-40%] border-[1px] border-cyan-400/80 rounded-full animate-[pulse-ring_1.5s_infinite_0.4s]" />
              <div className="absolute inset-[-40%] border-[2px] border-cyan-200/60 rounded-full animate-[pulse-ring_1.5s_infinite_0.8s]" />
            </>
          )}
        </div>

        {/* Central Logo Overlay (Floating Above) */}
        <div 
          className="absolute top-1/2 left-1/2 pointer-events-none z-30 font-bold tracking-[0.6em] text-white text-3xl md:text-5xl"
          style={{ 
            transform: 'translate(calc(-50% + 0.3em), -50%)', 
            textShadow: '0 0 10px rgba(0, 240, 255, 0.8), 0 2px 15px rgba(0,0,0,1)' 
          }}
        >
          ARGUS
        </div>

      </div>

      {/* Greeting Message Panel */}
      <div className={`absolute bottom-[15%] w-full max-w-lg mx-auto flex flex-col items-center gap-2 transition-all duration-700 ${status !== 'listening' && status !== 'waiting' && status !== 'standby' ? 'opacity-0 translate-y-8 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'}`}>
        <div className="hud-bracket px-12 py-4 flex flex-col items-center bg-cyan-950/20 backdrop-blur-sm border-t border-b border-cyan-500/20">
          <p className="text-cyan-300 font-bold tracking-[0.2em] uppercase text-lg md:text-xl text-center text-cyan-glow">
            {status === 'standby' ? t.standby : t.howCanIHelp}
          </p>
          <div className="h-[2px] w-full max-w-[200px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-2 opacity-80" />
          <p className="text-cyan-200/70 font-mono text-xs md:text-sm tracking-widest uppercase flex items-center gap-2">
            {status === 'waiting' ? (
               <span className="w-1 h-3 bg-red-500/50" />
            ) : status === 'standby' ? (
               <span className="w-1 h-3 bg-amber-500/50" />
            ) : (
               <span className="w-1 h-3 bg-cyan-500 animate-pulse" />
            )}
            {status === 'waiting' ? t.voiceDisabled : status === 'standby' ? t.standby : t.waitingCommand}
          </p>
        </div>
      </div>

      {/* Response Message Panel */}
      <div className={`absolute bottom-[15%] flex flex-col items-center gap-2 transition-all duration-700 ${status === 'responding' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        <div className="px-8 py-3 bg-cyan-900/40 border border-cyan-400/50 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(0,240,255,0.3)]">
          <p className="text-cyan-100 font-bold tracking-widest uppercase text-sm md:text-base text-center text-cyan-glow flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
            {t.transmitting}
          </p>
        </div>
      </div>

    </div>
  );
}
