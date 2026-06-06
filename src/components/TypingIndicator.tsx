import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-cyan-950/20 border border-cyan-500/10 rounded-2xl rounded-tl-sm w-fit max-w-[80%] backdrop-blur-md">
      <span className="text-[10px] font-mono tracking-widest text-cyan-400/60 uppercase mr-1">ARGUS:</span>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-cyan-400/90 shadow-[0_0_8px_rgba(0,240,255,0.8)] animate-[bounce_1s_infinite] [animation-delay:-0.3s]" />
        <div className="w-2 h-2 rounded-full bg-cyan-400/90 shadow-[0_0_8px_rgba(0,240,255,0.8)] animate-[bounce_1s_infinite] [animation-delay:-0.15s]" />
        <div className="w-2 h-2 rounded-full bg-cyan-400/90 shadow-[0_0_8px_rgba(0,240,255,0.8)] animate-[bounce_1s_infinite]" />
      </div>
    </div>
  );
}
