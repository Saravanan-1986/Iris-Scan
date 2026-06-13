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

  const howItWorksSteps = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Capture Your Eye Scan',
      description: 'Take a clear photo of your eye using your smartphone camera. Make sure your iris is well-lit and centered in the frame.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'AI Analysis',
      description: 'Our advanced AI model scans your iris patterns, detecting early signs of up to 16 different eye conditions with high accuracy.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Get Detailed Results',
      description: 'Receive a comprehensive health report with AI explanations, risk levels, and personalized recommendations for next steps.',
    },
  ];

  const features = [
    { icon: '🩺', label: '16 Conditions', desc: 'Detectable diseases' },
    { icon: '🎯', label: '97% Accuracy', desc: 'AI model precision' },
    { icon: '🔒', label: '100% Private', desc: 'No data uploaded' },
    { icon: '🌍', label: '3 Languages', desc: 'EN, Tamil, Hindi' },
    { icon: '⚡', label: 'Real-time', desc: 'Instant analysis' },
    { icon: '📱', label: 'Mobile Ready', desc: 'Works on any device' },
  ];

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.05 }}
              className="glass-card p-4 rounded-xl text-center hover:scale-105 transition-transform"
            >
              <span className="text-2xl">{feature.icon}</span>
              <p className="text-lg font-bold text-primary mt-1">{feature.label}</p>
              <p className="text-xs text-neutral">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white">How It Works</h2>
            <p className="text-sm text-neutral mt-2 max-w-md mx-auto">
              Three simple steps to get your AI-powered eye health screening
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {howItWorksSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.15 }}
                className="glass-card p-6 text-center rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                  Step {i + 1}
                </div>
                <h3 className="text-lg font-medium text-text-primary dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Why Choose IrisScan */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white">Why IrisScan?</h2>
            <p className="text-sm text-neutral mt-2">AI-powered early detection for better eye health</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700/30">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary dark:text-white">Non-invasive Screening</h4>
                <p className="text-xs text-neutral mt-0.5">No needles, no drops — just a simple photo of your eye</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700/30">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary dark:text-white">Private & Secure</h4>
                <p className="text-xs text-neutral mt-0.5">Your scan never leaves your device — 100% on-device processing</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700/30">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary dark:text-white">Fast Results</h4>
                <p className="text-xs text-neutral mt-0.5">Get your screening results in seconds, not days</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-gray-700/30">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary dark:text-white">Actionable Insights</h4>
                <p className="text-xs text-neutral mt-0.5">Clear explanations and recommendations you can act on</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <div className="glass-card p-12 rounded-2xl bg-gradient-to-br from-primary/5 to-cyan-500/5 border border-primary/10">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-3">
              Ready to check your eye health?
            </h2>
            <p className="text-sm text-neutral mb-6 max-w-md mx-auto">
              Take a photo of your eye and get an AI-powered analysis in seconds. No registration required.
            </p>
            <div className="flex justify-center gap-3">
              <Button size="lg" onClick={() => navigate('/capture')}>
                Start Screening
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}