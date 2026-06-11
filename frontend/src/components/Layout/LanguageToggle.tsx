import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScanStore } from '@/store/useScanStore';
import { setLanguage as persistLanguage } from '@/utils/storage';
import { Language } from '@/types';

const languages: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिंदी' },
];

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const setLang = useScanStore((s) => s.setLanguage);

  const handleChange = (code: Language) => {
    i18n.changeLanguage(code);
    persistLanguage(code);
    setLang(code);
  };

  return (
    <div className="flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-input p-0.5" role="radiogroup" aria-label="Language selector">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleChange(lang.code)}
          className={`px-2 py-1 text-xs rounded-input transition-colors ${
            i18n.language === lang.code
              ? 'bg-white dark:bg-neutral-700 text-text-primary dark:text-white shadow-sm'
              : 'text-neutral hover:text-text-primary dark:hover:text-white'
          }`}
          role="radio"
          aria-checked={i18n.language === lang.code}
          aria-label={lang.label}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}