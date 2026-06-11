import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Layout/Navbar';
import { getDarkMode, getLanguage } from '@/utils/storage';

const Home = lazy(() => import('@/pages/Home'));
const Capture = lazy(() => import('@/pages/Capture'));
const Questionnaire = lazy(() => import('@/pages/Questionnaire'));
const Analysing = lazy(() => import('@/pages/Analysing'));
const Results = lazy(() => import('@/pages/Results'));
const History = lazy(() => import('@/pages/History'));
const Settings = lazy(() => import('@/pages/Settings'));

function Loading() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <svg className="w-8 h-8 animate-spin text-primary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
          <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="text-sm text-neutral">Loading...</span>
      </div>
    </div>
  );
}

export default function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const dark = getDarkMode();
    if (dark) {
      document.documentElement.classList.add('dark');
    }
    const lang = getLanguage();
    i18n.changeLanguage(lang);
  }, [i18n]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white dark:bg-[#0F1117] transition-colors">
        <Navbar />
        <main>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/capture" element={<Capture />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/analysing" element={<Analysing />} />
              <Route path="/results" element={<Results />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}