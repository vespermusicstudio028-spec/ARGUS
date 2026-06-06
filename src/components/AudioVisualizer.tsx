import React, { useEffect, useRef } from 'react';
import { AiStatus } from '../types';

interface AudioVisualizerProps {
  status: AiStatus;
  analyser?: AnalyserNode | null;
  isMicActive?: boolean;
}

export function AudioVisualizer({ status, analyser, isMicActive = false }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);
  const synthProgress = useRef<number>(0);
  const lastWaveHeights = useRef<number[]>(new Array(64).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const getWaveColor = (status: AiStatus) => {
      switch (status) {
        case 'listening':
          return '#00f0ff'; // Cyan
        case 'responding':
          return '#22d3ee'; // Teal/Cyan
        case 'processing':
          return '#a855f7'; // Purple
        case 'analyzing':
          return '#eab308'; // Amber
        case 'standby':
          return '#64748b'; // Gray
        // @ts-ignore
        case 'error':
          return '#ef4444'; // Red
        default:
          return '#00f0ff';
      }
    };

    const draw = () => {
      if (!ctx || !canvas) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.22; // Orbit ring distance

      ctx.clearRect(0, 0, width, height);

      const numPoints = 80;
      const points: { x: number; y: number }[] = [];
      const waveColor = getWaveColor(status);

      // Increase progress parameter for procedural waves
      synthProgress.current += 0.05;

      let heights: number[] = [];

      if (analyser && dataArray) {
        // Read real-time frequency data
        analyser.getByteFrequencyData(dataArray);
        const step = Math.floor(dataArray.length / numPoints);
        for (let i = 0; i < numPoints; i++) {
          const val = dataArray[i * step] || 0;
          // Smooth the height changes
          const targetHeight = (val / 255) * 60; // Max amplitude 60px
          const prevHeight = lastWaveHeights.current[i] || 0;
          const newHeight = prevHeight + (targetHeight - prevHeight) * 0.3;
          heights.push(newHeight);
          lastWaveHeights.current[i] = newHeight;
        }
      } else {
        // Procedural synthetic waves when real data is not connected
        for (let i = 0; i < numPoints; i++) {
          let amplitude = 0;
          const angleIndex = (i / numPoints) * Math.PI * 2;

          if (status === 'listening' && isMicActive) {
            // Standard listening voice wave: soft ripples with occasional peaks
            amplitude = Math.sin(angleIndex * 6 + synthProgress.current) * 12 +
                        Math.cos(angleIndex * 3 - synthProgress.current * 1.5) * 8 +
                        Math.sin(angleIndex * 12 + synthProgress.current * 2) * 5;
            amplitude = Math.max(2, amplitude);
          } else if (status === 'responding') {
            // Active responding: vibrant, larger speech waves
            amplitude = Math.sin(angleIndex * 8 + synthProgress.current * 1.5) * 22 +
                        Math.cos(angleIndex * 4 - synthProgress.current * 2) * 12 +
                        Math.sin(angleIndex * 16 + synthProgress.current * 3) * 6;
            amplitude = Math.max(3, amplitude);
          } else if (status === 'processing' || status === 'analyzing') {
            // Pulse loading wave: circular rotation
            amplitude = Math.sin(angleIndex * 5 + synthProgress.current * 2) * 8;
            amplitude = Math.max(1, amplitude);
          } else if (status === 'standby') {
            // Drift mode: very faint base wave
            amplitude = Math.sin(angleIndex * 2 + synthProgress.current * 0.2) * 1.5;
          } else {
            // Waiting mode
            amplitude = Math.sin(angleIndex * 4 + synthProgress.current * 0.5) * 3;
          }

          const prevHeight = lastWaveHeights.current[i] || 0;
          const newHeight = prevHeight + (amplitude - prevHeight) * 0.2;
          heights.push(newHeight);
          lastWaveHeights.current[i] = newHeight;
        }
      }

      // Generate points around the circle
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const currentRadius = radius + heights[i];
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;
        points.push({ x, y });
      }

      // Draw the wave shape (Inner fill + Outer line)
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < numPoints; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      ctx.quadraticCurveTo(
        points[numPoints - 1].x,
        points[numPoints - 1].y,
        points[0].x,
        points[0].y
      );

      ctx.closePath();

      // Outer glow styling
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = waveColor;
      ctx.shadowBlur = status === 'responding' ? 15 : status === 'listening' ? 10 : 4;
      ctx.stroke();

      // Inner fill styling
      const gradient = ctx.createRadialGradient(centerX, centerY, radius - 15, centerX, centerY, radius + 40);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.7, `${waveColor}08`); // Very faint fill
      gradient.addColorStop(1, `${waveColor}20`); // Edge opacity
      ctx.fillStyle = gradient;
      ctx.fill();

      // Clean shadow settings for performance
      ctx.shadowBlur = 0;

      // Draw radial frequency lines projecting outwards
      if (status === 'responding' || status === 'listening') {
        const lineCount = 40;
        ctx.strokeStyle = `${waveColor}40`;
        ctx.lineWidth = 1.5;
        
        for (let i = 0; i < lineCount; i++) {
          const index = Math.floor((i / lineCount) * numPoints);
          const angle = (index / numPoints) * Math.PI * 2;
          
          const startR = radius + heights[index];
          const endR = startR + heights[index] * 0.45 + 3;
          
          const sx = centerX + Math.cos(angle) * startR;
          const sy = centerY + Math.sin(angle) * startR;
          const ex = centerX + Math.cos(angle) * endR;
          const ey = centerY + Math.sin(angle) * endR;
          
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [status, analyser, isMicActive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full z-10 mix-blend-screen"
    />
  );
}
