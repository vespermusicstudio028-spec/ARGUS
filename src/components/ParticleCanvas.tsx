import React, { useEffect, useRef } from 'react';
import { AiStatus } from '../types';

interface ParticleCanvasProps {
  status: AiStatus;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  angle?: number;
  speed?: number;
  radialDist?: number;
  orbitSpeed?: number;
}

export function ParticleCanvas({ status }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);

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

    // Initial setup of particles
    const initParticles = () => {
      const particles: Particle[] = [];
      const numParticles = 60;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radialDist = 50 + Math.random() * 150;
        particles.push({
          x: centerX + Math.cos(angle) * radialDist,
          y: centerY + Math.sin(angle) * radialDist,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.5 + 0.2,
          decay: Math.random() * 0.002 + 0.001,
          color: '#00f0ff',
          angle,
          radialDist,
          orbitSpeed: (Math.random() * 0.01 + 0.002) * (Math.random() > 0.5 ? 1 : -1)
        });
      }
      particlesRef.current = particles;
    };

    initParticles();

    const getStatusParams = (status: AiStatus) => {
      switch (status) {
        case 'listening':
          return { color: '#00f0ff', speedMultiplier: 2.5, count: 80, mode: 'converge' };
        case 'processing':
          return { color: '#a855f7', speedMultiplier: 1.8, count: 70, mode: 'orbit' };
        case 'analyzing':
          return { color: '#eab308', speedMultiplier: 2.0, count: 75, mode: 'orbit-fast' };
        case 'responding':
          return { color: '#22d3ee', speedMultiplier: 1.5, count: 90, mode: 'diverge' };
        case 'standby':
          return { color: '#64748b', speedMultiplier: 0.3, count: 30, mode: 'drift' };
        // @ts-ignore
        case 'error':
          return { color: '#ef4444', speedMultiplier: 4.0, count: 100, mode: 'explode' };
        default:
          return { color: '#00f0ff', speedMultiplier: 0.8, count: 50, mode: 'drift' };
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      const params = getStatusParams(status);
      const particles = particlesRef.current;

      // Adjust particle count dynamically
      if (particles.length < params.count) {
        const angle = Math.random() * Math.PI * 2;
        const radialDist = params.mode === 'converge' ? 200 + Math.random() * 100 : 50 + Math.random() * 150;
        particles.push({
          x: centerX + Math.cos(angle) * radialDist,
          y: centerY + Math.sin(angle) * radialDist,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.5 + 0.2,
          decay: Math.random() * 0.002 + 0.001,
          color: params.color,
          angle,
          radialDist,
          orbitSpeed: (Math.random() * 0.01 + 0.002) * (Math.random() > 0.5 ? 1 : -1)
        });
      } else if (particles.length > params.count) {
        particles.pop();
      }

      particles.forEach((p, index) => {
        // Apply modes
        if (params.mode === 'orbit' || params.mode === 'orbit-fast') {
          if (p.angle !== undefined && p.radialDist !== undefined && p.orbitSpeed !== undefined) {
            const mult = params.mode === 'orbit-fast' ? 2 : 1;
            p.angle += p.orbitSpeed * params.speedMultiplier * mult;
            p.x = centerX + Math.cos(p.angle) * p.radialDist;
            p.y = centerY + Math.sin(p.angle) * p.radialDist;
          }
        } else if (params.mode === 'converge') {
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 15) {
            p.x += (dx / dist) * params.speedMultiplier * 0.8;
            p.y += (dy / dist) * params.speedMultiplier * 0.8;
          } else {
            // Re-emit outwards
            const angle = Math.random() * Math.PI * 2;
            p.radialDist = 180 + Math.random() * 70;
            p.x = centerX + Math.cos(angle) * p.radialDist;
            p.y = centerY + Math.sin(angle) * p.radialDist;
            p.alpha = Math.random() * 0.5 + 0.3;
          }
        } else if (params.mode === 'diverge') {
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            p.x += (dx / dist) * params.speedMultiplier * 1.2;
            p.y += (dy / dist) * params.speedMultiplier * 1.2;
          }
          if (dist > 220) {
            // Respawn in core
            const angle = Math.random() * Math.PI * 2;
            p.x = centerX + Math.cos(angle) * 10;
            p.y = centerY + Math.sin(angle) * 10;
            p.alpha = Math.random() * 0.7 + 0.3;
          }
        } else if (params.mode === 'explode') {
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          p.x += (dx / (dist || 1)) * params.speedMultiplier * (Math.random() * 1.5 + 0.5);
          p.y += (dy / (dist || 1)) * params.speedMultiplier * (Math.random() * 1.5 + 0.5);
          p.alpha -= 0.015;
          if (p.alpha <= 0) {
            // Respawn close to center
            const angle = Math.random() * Math.PI * 2;
            p.x = centerX + Math.cos(angle) * 20;
            p.y = centerY + Math.sin(angle) * 20;
            p.alpha = Math.random() * 0.8 + 0.2;
          }
        } else {
          // Standard drift
          p.x += p.vx * params.speedMultiplier;
          p.y += p.vy * params.speedMultiplier;

          // Bounce off boundaries with margin
          const margin = 10;
          if (p.x < margin || p.x > width - margin) p.vx *= -1;
          if (p.y < margin || p.y > height - margin) p.vy *= -1;
        }

        // Pulse alpha slowly for neon effect
        p.alpha += (Math.random() - 0.5) * 0.02;
        p.alpha = Math.max(0.05, Math.min(p.alpha, 0.85));

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = params.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = params.color;
        ctx.shadowBlur = p.size * 3;
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow for performance
        ctx.globalAlpha = 1;
      });

      // Draw subtle connecting lines in processing mode
      if (params.mode === 'orbit' || params.mode === 'orbit-fast') {
        ctx.strokeStyle = params.color;
        ctx.lineWidth = 0.2;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 60) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.globalAlpha = (1 - dist / 60) * 0.15;
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [status]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full z-0 mix-blend-screen"
    />
  );
}
