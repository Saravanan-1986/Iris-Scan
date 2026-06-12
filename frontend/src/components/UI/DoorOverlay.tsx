import React, { useEffect, useState } from 'react';
import { motion, Variants, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function DoorOverlay() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  // welcome text removed per request
  const center = useAnimation();
  const navigate = useNavigate();

  const segments = 12;
  const segVariantLeft: Variants = {
    closed: (i: number) => ({ x: '0%' }),
    open: (i: number) => ({ x: [`0%`, `-${60 + i * 4}%`], transition: { duration: 1.1, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] } }),
  };

  const segVariantRight: Variants = {
    closed: (i: number) => ({ x: '0%' }),
    open: (i: number) => ({ x: [`0%`, `${60 + i * 4}%`], transition: { duration: 1.1, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] } }),
  };

  const welcomeContainer: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  };

  const welcomeItem: Variants = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  useEffect(() => {
    const handler = () => {
      setVisible(true);
      setOpen(false);
      const appRoot = document.querySelector('.app-root') as HTMLElement | null;
      if (appRoot) appRoot.classList.add('door-zoom');

      (async () => {
        // small tick to ensure DOM painted
        await new Promise((r) => setTimeout(r, 40));

        // center glow build
        try {
          await center.set({ scale: 1, opacity: 0 });
        } catch {}
        try {
          await center.start({ opacity: [0, 0.7], scale: [1, 1.02], transition: { duration: 0.45, ease: 'easeOut' } });
        } catch {}

        // open segmented doors with staggered delays (snake-like)
        setOpen(true);
        // wait for segments animation to finish (approx)
        await new Promise((r) => setTimeout(r, 1400));

        // camera zoom forward through gap
        try {
          await center.start({ scale: [1.02, 1.12, 2.2], opacity: [0.7, 0.9, 0], transition: { duration: 1.0, ease: 'easeInOut' } });
        } catch {}

        // short pause, then route to home
        await new Promise((r) => setTimeout(r, 300));
        try { navigate('/'); } catch {}

        // cleanup
        if (appRoot) appRoot.classList.remove('door-zoom');
        setTimeout(() => setVisible(false), 80);
      })();
    };

    window.addEventListener('playDoor', handler as EventListener);
    return () => window.removeEventListener('playDoor', handler as EventListener);
  }, [center]);

  if (!visible) return null;

  const segWidth = 100 / segments;

  return (
    <div className="door-overlay fixed inset-0 z-[120] pointer-events-none" aria-hidden>
      <motion.div className="door left-door" initial={false}>
        {Array.from({ length: segments }).map((_, i) => {
          const hue1 = (i * 14) % 360;
          const hue2 = (hue1 + 60) % 360;
          return (
            <motion.div
              key={`l-${i}`}
              className="door-segment"
              custom={i}
              variants={segVariantLeft}
              initial="closed"
              animate={open ? 'open' : 'closed'}
              style={{ left: `${i * segWidth}%`, width: `${segWidth}%`, background: `linear-gradient(90deg, hsl(${hue1} 70% 45%), hsl(${hue2} 60% 55%))` }}
            />
          );
        })}
        <div className="door-edge" />
      </motion.div>

      <motion.div className="door right-door" initial={false}>
        {Array.from({ length: segments }).map((_, i) => {
          const hue1 = (i * 14) % 360;
          const hue2 = (hue1 + 60) % 360;
          return (
            <motion.div
              key={`r-${i}`}
              className="door-segment"
              custom={i}
              variants={segVariantRight}
              initial="closed"
              animate={open ? 'open' : 'closed'}
              style={{ right: `${i * segWidth}%`, width: `${segWidth}%`, background: `linear-gradient(270deg, hsl(${hue1} 70% 45%), hsl(${hue2} 60% 55%))` }}
            />
          );
        })}
        <div className="door-edge" />
      </motion.div>

      <motion.div className="door-center" animate={center} initial={{ opacity: 0 }} />
      {/* welcome text removed */}
    </div>
  );
}
