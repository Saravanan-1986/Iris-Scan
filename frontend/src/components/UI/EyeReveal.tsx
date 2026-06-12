import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function EyeReveal() {
  const [visible, setVisible] = useState(true);
  const topControls = useAnimation();
  const bottomControls = useAnimation();
  const irisControls = useAnimation();
  const lightControls = useAnimation();
  const overlayControls = useAnimation();

  // cinematic sequence runner so we can call it on mount or on demand
  async function cinematicSequence() {
      // initial subtle iris pulse
      irisControls.start({ scale: [1, 0.96, 1], transition: { duration: 1.0 } });

      // gentle ambient light build-up
      lightControls.start({ opacity: [0, 0.6, 0.35], scale: [1, 1.05, 1], transition: { duration: 1.2, ease: 'easeInOut' } });
      await new Promise((r) => setTimeout(r, 600));

      // begin slow, dramatic opening in two phases
      // phase 1: slight separation (dramatic slow start)
      await Promise.all([
        topControls.start({ y: ['0vh', '-18vh'], transition: { duration: 1.0, ease: 'easeOut' } }),
        bottomControls.start({ y: ['0vh', '18vh'], transition: { duration: 1.0, ease: 'easeOut' } }),
      ]);

      // small pause to let glow leak through
      await new Promise((r) => setTimeout(r, 250));

      // phase 2: wide open and final iris scale
      await Promise.all([
        topControls.start({ y: ['-18vh', '-120vh'], transition: { duration: 1.1, ease: 'easeInOut' } }),
        bottomControls.start({ y: ['18vh', '120vh'], transition: { duration: 1.1, ease: 'easeInOut' } }),
        irisControls.start({ scale: [1, 1.02, 1], transition: { duration: 1.1 } }),
      ]);

      // final camera zoom into the portal UI, with bloom and DOF feel
      await overlayControls.start({ scale: [1, 1.06, 1.6], opacity: [1, 1, 0], transition: { duration: 1.4, ease: 'easeInOut' } });

      // remove overlay so page remains interactive and navigate to next route
      setTimeout(() => {
        setVisible(false);
        try {
          const next = localStorage.getItem('nextAction');
          // explicit post-login marker -> go to main
          if (next === 'postLogin') {
            localStorage.removeItem('nextAction');
            window.location.href = '/';
            return;
          }
          // if nextAction is a path (starts with '/'), navigate there
          if (next && next.startsWith('/')) {
            localStorage.removeItem('nextAction');
            window.location.href = next;
            return;
          }
          // otherwise do not navigate automatically — just hide the reveal
        } catch (e) {
          // fallback: nothing
        }
      }, 200);
  }

  useEffect(() => {
    // play once on mount
    cinematicSequence();

    // listen for external triggers (e.g. after login)
    const handler = () => {
      // remount/force play: make visible and run
      setVisible(true);
      cinematicSequence();
    };
    window.addEventListener('playEyeReveal', handler as EventListener);
    return () => window.removeEventListener('playEyeReveal', handler as EventListener);
  }, [topControls, bottomControls, irisControls, lightControls, overlayControls]);

  if (!visible) return null;

  return (
    <motion.div className="eye-reveal-overlay" aria-hidden="true" animate={overlayControls} initial={{ scale: 1, opacity: 1 }}>
      <div className="eye-image-bg" />

      {/* volumetric light leak / bloom */}
      <motion.div className="light-leak" animate={lightControls} initial={{ opacity: 0, scale: 1 }} />

      {/* SVG eyelids + lashes — animate the groups to open */}
      <svg className="eye-svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="lidGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5b21b6" stopOpacity="1" />
            <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.98" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="18" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.g className="lid-group top-group" animate={topControls} initial={{ y: '0vh' }}>
          <ellipse cx="500" cy="360" rx="900" ry="480" fill="url(#lidGrad)" filter="url(#glow)" />
          <g className="lashes top-lashes" stroke="#0b1220" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.96">
            <path d="M120 300 C170 260 220 260 270 300" />
            <path d="M300 300 C360 260 420 260 480 300" />
            <path d="M480 300 C540 260 600 260 660 300" />
            <path d="M660 300 C720 260 780 260 880 300" />
          </g>
        </motion.g>

        <motion.g className="lid-group bottom-group" animate={bottomControls} initial={{ y: '0vh' }}>
          <ellipse cx="500" cy="640" rx="900" ry="480" fill="url(#lidGrad)" transform="rotate(180 500 640)" filter="url(#glow)" />
          <g className="lashes bottom-lashes" stroke="#0b1220" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.96">
            <path d="M120 700 C170 740 220 740 270 700" />
            <path d="M300 700 C360 740 420 740 480 700" />
            <path d="M480 700 C540 740 600 740 660 700" />
            <path d="M660 700 C720 740 780 740 880 700" />
          </g>
        </motion.g>
      </svg>

      {/* Portal UI inside the eye — glassmorphism panels */}
      {/* cinematic portal now only shows the light leak and eyelids — no internal dashboard */}
    </motion.div>
  );
}
