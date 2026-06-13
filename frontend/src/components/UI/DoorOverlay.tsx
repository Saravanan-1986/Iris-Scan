import React, { useEffect, useState } from 'react';
import { motion, Variants, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function DoorOverlay() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const center = useAnimation();
  const navigate = useNavigate();

  const segments = 12;
  const segVariantLeft: Variants = {
    closed: () => ({ x: '0%' }),
    open: () => ({ x: [`0%`, `-100%`], transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] } }),
  };

  const segVariantRight: Variants = {
    closed: () => ({ x: '0%' }),
    open: () => ({ x: [`0%`, `100%`], transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] } }),
  };

  useEffect(() => {
    const handler = () => {
      setVisible(true);
      setOpen(false);
      const appRoot = document.querySelector('.app-root') as HTMLElement | null;
      if (appRoot) appRoot.classList.add('door-zoom');

      (async () => {
        await new Promise((r) => setTimeout(r, 40));

        try {
          await center.set({ scale: 1, opacity: 0 });
        } catch {}
        try {
          await center.start({ opacity: [0, 0.5], scale: [1, 1.02], transition: { duration: 0.45, ease: 'easeOut' } });
        } catch {}

        setOpen(true);
        await new Promise((r) => setTimeout(r, 1200));

        try {
          await center.start({ scale: [1.02, 1.12, 2.2], opacity: [0.5, 0.9, 0], transition: { duration: 1.0, ease: 'easeInOut' } });
        } catch {}

        await new Promise((r) => setTimeout(r, 300));
        try { navigate('/'); } catch {}

        if (appRoot) appRoot.classList.remove('door-zoom');
        setTimeout(() => setVisible(false), 80);
      })();
    };

    window.addEventListener('playDoor', handler as EventListener);
    return () => window.removeEventListener('playDoor', handler as EventListener);
  }, [center]);

  if (!visible) return null;

  return (
    <div className="door-overlay fixed inset-0 z-[120] pointer-events-none" aria-hidden>
      <motion.div className="door left-door" initial={false}>
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={`l-${i}`}
            className="door-segment"
            custom={i}
            variants={segVariantLeft}
            initial="closed"
            animate={open ? 'open' : 'closed'}
            style={{
              left: `${i * (100 / segments)}%`,
              width: `${100 / segments}%`,
              background: `linear-gradient(180deg, #1a1f36 0%, #0F1117 100%)`,
            }}
          />
        ))}
        <div className="door-edge" />
      </motion.div>

      <motion.div className="door right-door" initial={false}>
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={`r-${i}`}
            className="door-segment"
            custom={i}
            variants={segVariantRight}
            initial="closed"
            animate={open ? 'open' : 'closed'}
            style={{
              right: `${i * (100 / segments)}%`,
              width: `${100 / segments}%`,
              background: `linear-gradient(180deg, #1a1f36 0%, #0F1117 100%)`,
            }}
          />
        ))}
        <div className="door-edge" />
      </motion.div>

      <motion.div className="door-center" animate={center} initial={{ opacity: 0 }} />
    </div>
  );
}