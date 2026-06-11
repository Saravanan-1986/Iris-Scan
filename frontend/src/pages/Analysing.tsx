import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useScanStore } from '@/store/useScanStore';

const steps = ['segmenting', 'extracting', 'pattern', 'symptoms', 'classifier', 'heatmap'] as const;

const tips = [
  'Did you know? The iris has over 200 unique features — more than fingerprints!',
  'Regular eye check-ups can prevent 80% of vision impairment cases.',
  'Glaucoma is often called the silent thief of sight as symptoms appear late.',
  'Blue eyes contain less melanin, making them more sensitive to light.',
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
        return prev;
      });
    }, 800);

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(tipInterval);
    };
  }, [currentStep, navigate]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="mb-12">
        <svg className="w-24 h-24 mx-auto" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1A6FD4" strokeWidth="2" opacity="0.3" />
          <circle cx="50" cy="50" r="30" fill="#1A6FD4" opacity="0.1" stroke="#1A6FD4" strokeWidth="1.5" strokeDasharray="4 4">
            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="50" r="12" fill="none" stroke="#1A6FD4" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="3" fill="#1A6FD4">
            <animate attributeName="r" values="2;4;2" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <h1 className="text-lg font-medium text-text-primary dark:text-white mb-8">{t('analysing.title')}</h1>

      <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              i <= currentStepIndex ? 'border-secondary bg-secondary text-white' : 'border-neutral-300 dark:border-neutral-600'
            }`}>
              {i <= currentStepIndex && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className={`text-sm transition-colors ${i <= currentStepIndex ? 'text-text-primary dark:text-white' : 'text-neutral'}`}>
              {t(`analysing.steps.${step}`)}
            </span>
          </div>
        ))}
      </div>

      <motion.p
        key={currentTip}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="text-sm text-neutral italic"
      >
        {t('analysing.tips')?.[currentTip] || tips[currentTip]}
      </motion.p>
    </div>
  );
}