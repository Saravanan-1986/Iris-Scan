import React from 'react';
import { useTranslation } from 'react-i18next';
import { useScanStore } from '@/store/useScanStore';

export default function DisclaimerBanner() {
  const { t } = useTranslation();
  const dismissed = useScanStore((s) => s.disclaimerDismissed);
  const dismiss = useScanStore((s) => s.dismissDisclaimer);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-subtle" role="alert" aria-label="Medical disclaimer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
        <p className="text-sm text-neutral flex-1">
          {t('disclaimer.text')}
        </p>
        <button
          onClick={dismiss}
          className="text-sm text-primary hover:text-primary-600 font-medium whitespace-nowrap transition-colors"
          aria-label={t('disclaimer.dismiss')}
        >
          {t('disclaimer.dismiss')}
        </button>
      </div>
    </div>
  );
}