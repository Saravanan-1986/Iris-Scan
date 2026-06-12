import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/utils/auth';

export default function Door() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    // sequence: doors open (1s), show welcome (1.2s), navigate to main
    const t = setTimeout(() => {
      // after welcome, go to main
      navigate('/');
    }, 2200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-black">
      <div className="relative w-full h-[60vh] max-w-4xl">
        <motion.div className="door left-door" initial={{ x: 0 }} animate={{ x: ['0%', '-55%'] }} transition={{ duration: 0.9, ease: 'easeInOut' }} />
        <motion.div className="door right-door" initial={{ x: 0 }} animate={{ x: ['0%', '55%'] }} transition={{ duration: 0.9, ease: 'easeInOut' }} />

        <motion.div className="welcome" initial={{ opacity: 0, y: 12 }} animate={{ opacity: [0, 1], y: [12, 0] }} transition={{ delay: 0.95, duration: 0.6 }}>
          <h2 className="text-3xl font-semibold text-white">Welcome to IrisScan{user ? `, ${user.username}` : ''}</h2>
        </motion.div>
      </div>
    </div>
  );
}
