import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/UI/Button';
import DisclaimerBanner from '@/components/Layout/DisclaimerBanner';
import GlassHero from '@/components/UI/GlassHero';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Full page hero */}
      <section className="hero-fullpage min-h-[calc(100vh-3.5rem)] flex items-center">
        <div className="hero-overlay" aria-hidden="true">
          <div className="hero-blob-large left-[-8%] top-[-10%] w-96 h-96 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4]" />
          <div className="hero-blob-large right-[-6%] top-20 w-96 h-96 bg-gradient-to-br from-[#ec4899] to-[#7c3aed]" />
          <div className="hero-blob-large left-10 bottom-[-8%] w-72 h-72 bg-gradient-to-br from-[#06b6d4] to-[#34d399]" />
        </div>

        <div className="hero-content w-full">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-0.5 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
                    AI-Powered Screening
                  </span>
                  <span className="px-2.5 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary text-xs rounded-full font-medium">
                    Early Detection
                  </span>
                </div>
                <h1 className="text-3xl sm:text-[44px] font-medium text-white leading-tight mb-4">
                  {t('hero.title')}
                </h1>
                <p className="text-lg text-white/85 mb-8 max-w-lg">
                  {t('hero.description')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    onClick={() => navigate('/capture')}
                    aria-label={t('hero.cta')}
                  >
                    {t('hero.cta')}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/health-worker')}
                  >
                    🏥 Health Worker Mode
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center"
              >
                <GlassHero />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6"
        >
          {[
            { value: '15+', label: 'Conditions detectable' },
            { value: '97%', label: 'AI accuracy' },
            { value: '3', label: 'Languages supported' },
            { value: '0', label: 'Data uploaded — fully private' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-neutral mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-center text-lg font-medium text-text-primary dark:text-white mb-8">How It Works</h2>
          <div className="grid sm:grid-cols-1 gap-6">
            {[1].map((step) => (
              <div key={step} className="glass-card p-6 text-center rounded-xl">
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
          </div>
        </motion.div>

      <DisclaimerBanner />
    </div>
  );
}