import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useScanStore } from '@/store/useScanStore';
import { setLanguage as persistLanguage, setDarkMode, exportHistoryAsJSON, clearAllHistory, isStorageAvailable } from '@/utils/storage';
import { Language } from '@/types';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { darkMode, setDarkMode: storeSetDark, language, setLanguage } = useScanStore();
  const [clearConfirm, setClearConfirm] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
    persistLanguage(lang);
    setLanguage(lang);
  };

  const handleDarkToggle = () => {
    const newVal = !darkMode;
    storeSetDark(newVal);
    setDarkMode(newVal);
  };

  const handleClearData = () => {
    clearAllHistory();
    setClearConfirm(false);
    setClearSuccess(true);
    setTimeout(() => setClearSuccess(false), 2000);
  };

  const handleExport = () => {
    const data = exportHistoryAsJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iriscan_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <h1 className="text-lg font-medium text-text-primary dark:text-white">{t('settings.title')}</h1>

      <Card raised>
        <h2 className="text-sm font-medium text-text-primary dark:text-white mb-4">{t('settings.language')}</h2>
        <div className="flex gap-2">
          {(['en', 'ta', 'hi'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-4 py-2 text-sm rounded-input border transition-colors ${
                language === lang
                  ? 'border-primary bg-primary-50 text-primary dark:bg-primary-900/20 dark:text-primary-300'
                  : 'border-neutral-200 dark:border-neutral-700 text-text-primary dark:text-white hover:border-primary'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'ta' ? 'தமிழ்' : 'हिंदी'}
            </button>
          ))}
        </div>
      </Card>

      <Card raised>
        <h2 className="text-sm font-medium text-text-primary dark:text-white mb-4">{t('settings.dark_mode')}</h2>
        <button
          onClick={handleDarkToggle}
          className={`relative w-12 h-6 rounded-pill transition-colors ${darkMode ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-600'}`}
          role="switch"
          aria-checked={darkMode}
          aria-label="Toggle dark mode"
        >
          <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </Card>

      <Card raised>
        <h2 className="text-sm font-medium text-text-primary dark:text-white mb-4">{t('settings.camera_guide')}</h2>
        <p className="text-sm text-neutral mb-3">{t('settings.camera_guide_desc')}</p>
        <ol className="text-sm text-neutral space-y-1.5 list-decimal list-inside">
          <li>{t('capture.camera_guide_step1')}</li>
          <li>{t('capture.camera_guide_step2')}</li>
          <li>{t('capture.camera_guide_step3')}</li>
        </ol>
      </Card>

      <Card raised>
        <h2 className="text-sm font-medium text-text-primary dark:text-white mb-2">{t('settings.model_info')}</h2>
        <div className="space-y-1 text-sm text-neutral">
          <p>{t('settings.model_arch')}</p>
          <p>{t('settings.model_dataset')}</p>
          <p>{t('settings.model_accuracy')}</p>
          <p className="mt-2">{t('settings.privacy')}</p>
        </div>
      </Card>

      <Card raised>
        <div className="space-y-3">
          <Button variant="outline" className="w-full" onClick={handleExport}>
            {t('settings.export_data')}
          </Button>

          {clearConfirm ? (
            <div className="space-y-2">
              <p className="text-sm text-danger">{t('settings.clear_data_confirm')}</p>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={handleClearData}>{t('common.confirm')}</Button>
                <Button variant="ghost" size="sm" onClick={() => setClearConfirm(false)}>{t('common.cancel')}</Button>
              </div>
            </div>
          ) : (
            <Button variant="danger" className="w-full" onClick={() => setClearConfirm(true)}>
              {t('settings.clear_data')}
            </Button>
          )}

          {clearSuccess && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-secondary"
            >
              {t('settings.clear_data_success')}
            </motion.p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-medium text-text-primary dark:text-white mb-2">{t('settings.about')}</h2>
        <div className="space-y-1 text-sm text-neutral">
          <p>{t('settings.version')}: 1.0.0</p>
          <p>{t('settings.model_accuracy')}</p>
          <p>{t('settings.privacy')}</p>
        </div>
      </Card>
    </div>
  );
}