/**
 * ScreenFXOverlay.jsx — Dynamic Active Gameplay Overlays & Particle FX.
 * Applies visual overlays to the game canvas based on `equipped.screenFX`.
 *
 * Supported FX:
 *  - sfx_matrix_rain / fx_matrix_rain: Glowing neon border + matrix code particle rain.
 *  - sfx_fire_aura: Animated orange/red flame particles & pulse aura around prompt box.
 *  - sfx_gold_lux / fx_gold_confetti: Golden glowing aura + sparkling golden ribbons.
 *  - fx_cosmic_void: Pulsing purple cosmic nebula & galaxy starfield.
 *  - fx_blood_moon: Crimson red eclipse vignette + blood moon aura.
 */
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useEconomyStore } from '../../store/economyStore';

export function ScreenFXOverlay({ fxId: customFxId, className = '' }) {
  const storeFxId = useEconomyStore((s) => s.equipped?.screenFX);
  const activeFxId = customFxId || storeFxId;
  const canvasRef = useRef(null);

  // Canvas particle animation for Matrix Rain and Gold Sparkles
  useEffect(() => {
    if (!activeFxId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    if (activeFxId === 'sfx_matrix_rain' || activeFxId === 'fx_matrix_rain') {
      // Matrix Rain code effect
      const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン';
      const fontSize = 14;
      const columns = Math.floor(canvas.width / fontSize) + 1;
      const drops = Array(columns).fill(1);

      const drawMatrix = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#22c55e';
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const text = chars.charAt(Math.floor(Math.random() * chars.length));
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          ctx.fillText(text, x, y);

          if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
        animationFrameId = requestAnimationFrame(drawMatrix);
      };
      drawMatrix();
    } else if (activeFxId === 'sfx_gold_lux' || activeFxId === 'fx_gold_confetti') {
      // Golden Lux Sparkling particles effect
      const particles = Array.from({ length: 45 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        color: ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff'][Math.floor(Math.random() * 4)],
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 0.5,
        alpha: Math.random(),
      }));

      const drawGold = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();

          p.y += p.vy;
          p.x += p.vx;
          p.alpha += (Math.random() - 0.5) * 0.05;
          if (p.alpha < 0.1) p.alpha = 0.8;
          if (p.alpha > 1) p.alpha = 1;

          if (p.y < 0) {
            p.y = canvas.height;
            p.x = Math.random() * canvas.width;
          }
        });
        ctx.globalAlpha = 1;
        animationFrameId = requestAnimationFrame(drawGold);
      };
      drawGold();
    } else if (activeFxId === 'sfx_fire_aura') {
      // Fire Aura rising ember particles effect
      const embers = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 20,
        radius: Math.random() * 4 + 1.5,
        color: ['#f97316', '#ef4444', '#eab308', '#ffedd5'][Math.floor(Math.random() * 4)],
        vy: -Math.random() * 3 - 1,
        vx: (Math.random() - 0.5) * 2,
        alpha: Math.random() * 0.8 + 0.2,
      }));

      const drawFire = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        embers.forEach((e) => {
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
          ctx.fillStyle = e.color;
          ctx.globalAlpha = e.alpha;
          ctx.shadowBlur = 12;
          ctx.shadowColor = e.color;
          ctx.fill();

          e.y += e.vy;
          e.x += e.vx;
          e.alpha -= 0.008;

          if (e.y < 0 || e.alpha <= 0) {
            e.y = canvas.height + 10;
            e.x = Math.random() * canvas.width;
            e.alpha = Math.random() * 0.8 + 0.2;
          }
        });
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        animationFrameId = requestAnimationFrame(drawFire);
      };
      drawFire();
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [activeFxId]);

  if (!activeFxId) return null;

  // 1. Matrix Rain / Cyber Grid
  if (activeFxId === 'sfx_matrix_rain' || activeFxId === 'fx_matrix_rain') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        {/* Neon green border glow */}
        <div className="absolute inset-0 border-4 border-emerald-500/40 shadow-[inset_0_0_30px_rgba(34,197,94,0.3)] animate-pulse" />
        <canvas ref={canvasRef} className="w-full h-full opacity-40" />
      </div>
    );
  }

  // 2. Fire Aura
  if (activeFxId === 'sfx_fire_aura') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        {/* Fire border vignette & canvas embers */}
        <div className="absolute inset-0 border-4 border-orange-500/50 shadow-[inset_0_0_50px_rgba(249,115,22,0.4)]" />
        <canvas ref={canvasRef} className="w-full h-full opacity-60" />
      </div>
    );
  }

  // 3. Gold Lux / Royal Gold Confetti
  if (activeFxId === 'sfx_gold_lux' || activeFxId === 'fx_gold_confetti') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-amber-400/50 shadow-[inset_0_0_40px_rgba(251,191,36,0.35)]" />
        <canvas ref={canvasRef} className="w-full h-full opacity-70" />
      </div>
    );
  }

  // 4. Cosmic Void / Supernova
  if (activeFxId === 'fx_cosmic_void') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-purple-500/40 bg-gradient-radial from-purple-900/20 via-transparent to-purple-950/40 shadow-[inset_0_0_60px_rgba(168,85,247,0.4)]" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>
    );
  }

  // 5. Crimson Eclipse / Blood Moon
  if (activeFxId === 'fx_blood_moon') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-red-600/50 shadow-[inset_0_0_60px_rgba(239,68,68,0.45)]" />
      </div>
    );
  }

  return null;
}

export default ScreenFXOverlay;
