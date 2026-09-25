/**
 * ScreenFXOverlay.jsx — Dynamic Active Gameplay Overlays & Particle FX.
 * Applies visual overlays to the game canvas based on `equipped.screenFX`.
 * Supports 20 distinct animated CSS/Canvas overlays.
 */
import { useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { useEconomyStore } from '../../store/economyStore';

export const ScreenFXOverlay = memo(function ScreenFXOverlay({ fxId: customFxId, className = '' }) {
  const storeFxId = useEconomyStore((s) => s.equipped?.screenFX);
  const activeFxId = customFxId || storeFxId;
  const canvasRef = useRef(null);

  // Canvas particle animations
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

    if (activeFxId === 'sfx_matrix_rain' || activeFxId === 'fx_matrix_rain' || activeFxId === 'fx_overclock_rain') {
      const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン';
      const fontSize = 14;
      const columns = Math.floor(canvas.width / fontSize) + 1;
      const drops = Array(columns).fill(1);
      const color = activeFxId === 'fx_overclock_rain' ? '#06b6d4' : '#22c55e';

      const drawMatrix = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color;
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
    } else if (activeFxId === 'sfx_gold_lux' || activeFxId === 'fx_gold_confetti' || activeFxId === 'fx_starlight_shimmer') {
      const colors = activeFxId === 'fx_starlight_shimmer' 
        ? ['#fef08a', '#ffffff', '#e0f2fe', '#fef3c7']
        : ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff'];

      const particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
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
    } else if (activeFxId === 'sfx_fire_aura' || activeFxId === 'fx_fire_aura' || activeFxId === 'fx_ember_glow') {
      const embers = Array.from({ length: 55 }, () => ({
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
    } else if (activeFxId === 'fx_snowstorm' || activeFxId === 'fx_sakura_bloom') {
      const isSakura = activeFxId === 'fx_sakura_bloom';
      const flakes = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: isSakura ? Math.random() * 4 + 2 : Math.random() * 3 + 1,
        color: isSakura ? ['#f472b6', '#f43f5e', '#fbcfe8'][Math.floor(Math.random() * 3)] : '#e0f2fe',
        vy: Math.random() * 2 + 1,
        vx: Math.sin(Math.random() * Math.PI) * 1.5,
      }));

      const drawSnow = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        flakes.forEach((f) => {
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
          ctx.fillStyle = f.color;
          ctx.globalAlpha = 0.8;
          ctx.fill();

          f.y += f.vy;
          f.x += f.vx;

          if (f.y > canvas.height) {
            f.y = -10;
            f.x = Math.random() * canvas.width;
          }
        });
        ctx.globalAlpha = 1;
        animationFrameId = requestAnimationFrame(drawSnow);
      };
      drawSnow();
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [activeFxId]);

  if (!activeFxId) return null;

  // 1 & 15. Matrix / Overclock Rain
  if (activeFxId === 'sfx_matrix_rain' || activeFxId === 'fx_matrix_rain' || activeFxId === 'fx_overclock_rain') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className={`absolute inset-0 border-4 ${activeFxId === 'fx_overclock_rain' ? 'border-cyan-500/40 shadow-[inset_0_0_30px_rgba(6,182,212,0.3)]' : 'border-emerald-500/40 shadow-[inset_0_0_30px_rgba(34,197,94,0.3)]'} animate-pulse`} />
        <canvas ref={canvasRef} className="w-full h-full opacity-40" />
      </div>
    );
  }

  // 2 & 13. Fire Aura / Ember Glow
  if (activeFxId === 'sfx_fire_aura' || activeFxId === 'fx_fire_aura' || activeFxId === 'fx_ember_glow') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-orange-500/50 shadow-[inset_0_0_50px_rgba(249,115,22,0.4)]" />
        <canvas ref={canvasRef} className="w-full h-full opacity-60" />
      </div>
    );
  }

  // 3 & 11. Gold Lux / Starlight Shimmer
  if (activeFxId === 'sfx_gold_lux' || activeFxId === 'fx_gold_confetti' || activeFxId === 'fx_starlight_shimmer') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-amber-400/50 shadow-[inset_0_0_40px_rgba(251,191,36,0.35)]" />
        <canvas ref={canvasRef} className="w-full h-full opacity-70" />
      </div>
    );
  }

  // 4. Cosmic Void
  if (activeFxId === 'fx_cosmic_void') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-purple-500/40 shadow-[inset_0_0_60px_rgba(168,85,247,0.4)]" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>
    );
  }

  // 5. Blood Moon
  if (activeFxId === 'fx_blood_moon') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-red-600/50 shadow-[inset_0_0_60px_rgba(239,68,68,0.45)]" />
      </div>
    );
  }

  // 6. Cyber Grid / Glitch
  if (activeFxId === 'fx_cyber_grid' || activeFxId === 'fx_cyber_glitch') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-cyan-400/40 shadow-[inset_0_0_40px_rgba(6,182,212,0.35)] animate-pulse" />
      </div>
    );
  }

  // 7 & 20. Snowstorm / Sakura Bloom
  if (activeFxId === 'fx_snowstorm' || activeFxId === 'fx_sakura_bloom') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <canvas ref={canvasRef} className="w-full h-full opacity-60" />
      </div>
    );
  }

  // 8. Electric Storm
  if (activeFxId === 'fx_electric_storm') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-sky-400/50 shadow-[inset_0_0_40px_rgba(56,189,248,0.4)]" />
      </div>
    );
  }

  // 9. Vaporwave Grid
  if (activeFxId === 'fx_vaporwave_grid') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-fuchsia-500/40 shadow-[inset_0_0_50px_rgba(217,70,239,0.35)]" />
      </div>
    );
  }

  // 10. Hypnotic Portal
  if (activeFxId === 'fx_hypnotic_portal') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-violet-600/50 shadow-[inset_0_0_50px_rgba(139,92,246,0.4)]" />
      </div>
    );
  }

  // 12. Slime Hazard
  if (activeFxId === 'fx_slime_hazard') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-lime-400/50 shadow-[inset_0_0_45px_rgba(132,204,22,0.4)] animate-pulse" />
      </div>
    );
  }

  // 14. Neon Pulse
  if (activeFxId === 'fx_neon_pulse') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-pink-500/40 shadow-[inset_0_0_40px_rgba(236,72,153,0.35)] animate-pulse" />
      </div>
    );
  }

  // 16. Quantum Realm
  if (activeFxId === 'fx_quantum_realm') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-teal-400/40 shadow-[inset_0_0_40px_rgba(20,184,166,0.35)]" />
      </div>
    );
  }

  // 17. Solar Flare
  if (activeFxId === 'fx_solar_flare') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-amber-500/50 shadow-[inset_0_0_50px_rgba(245,158,11,0.4)]" />
      </div>
    );
  }

  // 18. Abyssal Deep
  if (activeFxId === 'fx_abyssal_deep') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-blue-600/40 shadow-[inset_0_0_45px_rgba(37,99,235,0.35)]" />
      </div>
    );
  }

  // 19. Aurora Borealis
  if (activeFxId === 'fx_aurora_borealis') {
    return (
      <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
        <div className="absolute inset-0 border-4 border-emerald-400/40 shadow-[inset_0_0_50px_rgba(52,211,153,0.35)] animate-pulse" />
      </div>
    );
  }

  return null;
});

export default ScreenFXOverlay;
