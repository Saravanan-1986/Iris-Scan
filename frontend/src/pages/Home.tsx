import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/UI/Button';
import DisclaimerBanner from '@/components/Layout/DisclaimerBanner';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-xl sm:text-[28px] font-medium text-text-primary dark:text-white leading-tight mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-base text-neutral mb-8 max-w-lg">
              {t('hero.description')}
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/capture')}
              aria-label={t('hero.cta')}
            >
              {t('hero.cta')}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative w-72 h-72 sm:w-80 sm:h-80">
              <svg viewBox="0 0 320 320" className="w-full h-full" aria-hidden="true">
                <circle cx="160" cy="160" r="140" fill="none" stroke="#E5E7EB" strokeWidth="1" className="dark:stroke-neutral-700" />
                <circle cx="160" cy="160" r="110" fill="#EBF3FC" opacity="0.3" className="dark:fill-primary-900/10" />
                <circle cx="160" cy="160" r="90" fill="none" stroke="#1A6FD4" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5">
                  <animateTransform attributeName="transform" type="rotate" from="0 160 160" to="360 160 160" dur="20s" repeatCount="indefinite" />
                </circle>
                <circle cx="160" cy="160" r="65" fill="none" stroke="#1A6FD4" strokeWidth="0.5" opacity="0.3" />
                <circle cx="160" cy="160" r="45" fill="#1A6FD4" opacity="0.05" />
                <circle cx="160" cy="160" r="30" fill="none" stroke="#1A6FD4" strokeWidth="1" opacity="0.4">
                  <animate attributeName="r" values="28;32;28" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="160" cy="160" r="8" fill="#1A6FD4" opacity="0.6" />
                <line x1="160" y1="20" x2="160" y2="50" stroke="#1A6FD4" strokeWidth="0.5" opacity="0.4" />
                <line x1="160" y1="270" x2="160" y2="300" stroke="#1A6FD4" strokeWidth="0.5" opacity="0.4" />
                <line x1="20" y1="160" x2="50" y2="160" stroke="#1A6FD4" strokeWidth="0.5" opacity="0.4" />
                <line x1="270" y1="160" x2="300" y2="160" stroke="#1A6FD4" strokeWidth="0.5" opacity="0.4" />
              </svg>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20 grid sm:grid-cols-3 gap-8"
        >
          {[1, 2, 3].map((step) => (
            <div key={step} className="card-flat p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary dark:text-primary-300 flex items-center justify-center mx-auto mb-4 text-sm font-medium">
                {step}
              </div>
              <h3 className="text-base font-medium text-text-primary dark:text-white mb-2">
                {t(`hero.step${step}`)}
              </h3>
              <p className="text-sm text-neutral">
                {t(`hero.step${step}desc`)}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-neutral">
            {t('hero.stats', { diseases: '15+' })}
          </p>
        </motion.div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}