import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useScanStore } from '@/store/useScanStore';

const steps = [
  { key: 'segmenting', icon: 'eye' },
  { key: 'extracting', icon: 'grid' },
  { key: 'pattern', icon: 'activity' },
  { key: 'symptoms', icon: 'clipboard' },
  { key: 'classifier', icon: 'cpu' },
  { key: 'heatmap', icon: 'map' },
] as const;

const tips = [
  'Did you know? The iris has over 200 unique features — more than fingerprints!',
  'Regular eye check-ups can prevent 80% of vision impairment cases.',
  'Glaucoma is often called the "silent thief of sight" as symptoms appear late.',
  'More than 2.2 billion people worldwide have vision impairment — most is preventable.',
  'Blue eyes contain less melanin, making them more sensitive to light.',
  'Eating leafy greens can reduce your risk of many eye conditions.',
];

export default function Analysing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentStep = useScanStore((s) => s.currentStep);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    if (currentStep !== 'analysing') {
      navigate('/results');
      return;
    }

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 700);

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(tipInterval);
    };
  }, [currentStep, navigate]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      {/* Animated scanning animation */}
      <div className="mb-12 relative">
        <motion.div
          className="w-28 h-28 mx-auto relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
            {/* Outer ring */}
            <circle cx="60" cy="60" r="55" fill="none" stroke="#1A6FD4" strokeWidth="1.5" opacity="0.2" />
            {/* Scanning ring */}
            <circle cx="60" cy="60" r="45" fill="none" stroke="#1A6FD4" strokeWidth="2" strokeDasharray="8 6" opacity="0.4" />
            {/* Middle ring */}
            <circle cx="60" cy="60" r="30" fill="#1A6FD4" opacity="0.08" stroke="#1A6FD4" strokeWidth="1" />
            {/* Scanning dot */}
            <circle cx="60" cy="15" r="4" fill="#1A6FD4" opacity="0.8">
              <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
            </circle>
            {/* Center pupil */}
            <circle cx="60" cy="60" r="8" fill="#1A6FD4" opacity="0.3" />
            <circle cx="60" cy="60" r="3" fill="#1A6FD4">
              <animate attributeName="r" values="2;4;2" dur="1.2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </motion.div>

        {/* Scanning line effect */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent rounded-full"
          style={{ top: '40%' }}
          animate={{ top: ['35%', '65%', '35%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <h1 className="text-lg font-medium text-text-primary dark:text-white mb-8">
        {t('analysing.title')}
      </h1>

      {/* Step progress */}
      <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={step.key}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: i <= currentStepIndex ? 1 : 0.3 }}
            className="flex items-center gap-3"
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              i < currentStepIndex
                ? 'border-secondary bg-secondary text-white'
                : i === currentStepIndex
                ? 'border-secondary bg-secondary/20 text-secondary animate-pulse'
                : 'border-neutral-300 dark:border-neutral-600'
            }`}>
              {i < currentStepIndex ? (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                  <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : i === currentStepIndex ? (
                <div className="w-2 h-2 rounded-full bg-secondary" />
              ) : null}
            </div>
            <span className={`text-sm transition-colors ${
              i <= currentStepIndex ? 'text-text-primary dark:text-white font-medium' : 'text-neutral'
            }`}>
              {t(`analysing.steps.${step.key}`)}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Fun fact rotating tips */}
      <motion.div
        key={currentTip}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="text-sm text-neutral italic px-4"
      >
        <span className="inline-block mr-1">💡</span>
        {t('analysing.tips')?.[currentTip] || tips[currentTip]}
      </motion.div>
    </div>
  );
}