import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();

  const links = [
    { path: '/', label: t('nav.home') },
    { path: '/capture', label: t('nav.capture') },
    { path: '/history', label: t('nav.history') },
    { path: '/settings', label: t('nav.settings') },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0F1117]/80 backdrop-blur-md border-b border-subtle" role="navigation" aria-label="Main navigation">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 text-text-primary dark:text-white no-underline" aria-label="IrisScan Home">
            <svg width="28" height="28" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#1A6FD4" strokeWidth="2"/>
              <circle cx="50" cy="50" r="30" fill="#1A6FD4" opacity="0.1" stroke="#1A6FD4" strokeWidth="1.5"/>
              <circle cx="50" cy="50" r="12" fill="none" stroke="#1A6FD4" strokeWidth="1.5"/>
              <circle cx="50" cy="50" r="3" fill="#1A6FD4"/>
            </svg>
            <span className="text-base font-medium">{t('app.name')}</span>
          </Link>
          
          <div className="hidden sm:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 text-sm rounded-input transition-colors no-underline ${
                  location.pathname === link.path
                    ? 'bg-primary-50 text-primary dark:bg-primary-900/20 dark:text-primary-300'
                    : 'text-neutral hover:text-text-primary dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}