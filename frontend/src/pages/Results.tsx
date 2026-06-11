import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useScanStore } from '@/store/useScanStore';
import { useHistory } from '@/hooks/useHistory';
import { ScanRecord } from '@/types';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import Card from '@/components/UI/Card';
import ProgressBar from '@/components/UI/ProgressBar';

export default function Results() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { predictions, sectorAnalysis, diseaseInfo, capturedImage, heatmapImage, scleraRedness, symptoms, resetScan } = useScanStore();
  const { addRecord } = useHistory();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [saved, setSaved] = useState(false);

  const topPrediction = predictions[0];

  const handleSave = () => {
    if (saved || !capturedImage) return;
    const record: ScanRecord = {
      id: 'scan_' + Date.now(),
      date: new Date().toISOString(),
      irisImageBase64: capturedImage,
      heatmapBase64: heatmapImage || '',
      sectorAnalysis,
      symptoms: symptoms as any,
      predictions,
      topPrediction: topPrediction?.disease || '',
      language: 'en',
    };
    const ok = addRecord(record);
    if (ok) setSaved(true);
  };

  const handleNewScan = () => {
    resetScan();
    navigate('/capture');
  };

  if (!topPrediction) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-neutral">{t('errors.generic')}</p>
        <Button className="mt-4" onClick={() => navigate('/capture')}>{t('errors.retry')}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-text-primary dark:text-white">{t('results.title')}</h1>
        <div className="flex gap-2">
          {!saved && <Button variant="secondary" size="sm" onClick={handleSave}>Save</Button>}
          <Button size="sm" onClick={handleNewScan}>{t('results.new_scan')}</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card raised>
          <h2 className="text-base font-medium text-text-primary dark:text-white mb-4">{t('results.iris_analysis')}</h2>
          {capturedImage && (
            <div className="relative">
              <img src={capturedImage} alt="Iris scan" className="w-full rounded-card" />
              {showHeatmap && heatmapImage && (
                <img src={heatmapImage} alt="Heatmap overlay" className="absolute inset-0 w-full h-full object-cover rounded-card opacity-60" />
              )}
            </div>
          )}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="mt-3 text-sm text-primary hover:text-primary-600 transition-colors"
            aria-label={showHeatmap ? t('results.hide_heatmap') : t('results.show_heatmap')}
          >
            {showHeatmap ? t('results.hide_heatmap') : t('results.show_heatmap')}
          </button>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {sectorAnalysis.map((sector) => (
              <div
                key={sector.label}
                className={`text-center p-2 rounded-input border text-xs ${
                  sector.severity
                    ? 'border-warning bg-warning-50 dark:bg-warning-900/20'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}
                title={sector.anomalies.join(', ')}
              >
                <span className="font-medium text-text-primary dark:text-white">{sector.label}</span>
                {sector.anomalies.length > 0 && <span className="block text-warning mt-0.5">⚠</span>}
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-base font-medium text-text-primary dark:text-white">{t('results.predictions')}</h2>
          {predictions.map((pred, i) => (
            <motion.div
              key={pred.diseaseId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card raised className="relative">
                {i === 0 && (
                  <Badge variant="primary" className="absolute -top-2 -right-2">{t('results.most_likely')}</Badge>
                )}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-medium text-text-primary dark:text-white">{pred.disease}</h3>
                  <Badge severity={pred.severity}>{t(`results.severity.${pred.severity}`)}</Badge>
                </div>
                <p className="text-sm text-neutral mb-3">{pred.description}</p>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-text-primary dark:text-white font-medium">{t('results.confidence', { percent: pred.confidence })}</span>
                </div>
                <ProgressBar value={pred.confidence} variant={pred.severity === 'low' ? 'secondary' : pred.severity === 'moderate' ? 'warning' : 'danger'} />
                {pred.affectedSectors.length > 0 && (
                  <p className="text-xs text-neutral mt-2">
                    {t('results.affected_sectors', { sectors: pred.affectedSectors.join(', ') })}
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {diseaseInfo && (
        <Card raised>
          <h2 className="text-base font-medium text-text-primary dark:text-white mb-4">{t('results.disease_info')}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-text-primary dark:text-white mb-1">{t('results.what_is_it')}</h3>
              <p className="text-sm text-neutral">{diseaseInfo.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-primary dark:text-white mb-1">{t('results.common_causes')}</h3>
              <ul className="list-disc list-inside text-sm text-neutral space-y-0.5">
                {diseaseInfo.causes.map((cause, i) => (
                  <li key={i}>{cause}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-primary dark:text-white mb-1">{t('results.symptoms')}</h3>
              <ul className="list-disc list-inside text-sm text-neutral space-y-0.5">
                {diseaseInfo.commonSymptoms.map((sym, i) => (
                  <li key={i}>{sym}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-primary dark:text-white mb-1">{t('results.recommendations')}</h3>
              <ul className="list-disc list-inside text-sm text-neutral space-y-0.5">
                {diseaseInfo.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {scleraRedness && (
        <Card raised>
          <h2 className="text-base font-medium text-text-primary dark:text-white mb-2">{t('results.sclera_analysis')}</h2>
          <p className="text-sm text-warning">{t('results.sclera_finding')}</p>
        </Card>
      )}

      <Card className="bg-warning-50 dark:bg-warning-900/10 border-warning/20">
        <p className="text-sm text-warning font-medium">{t('results.disclaimer')}</p>
      </Card>
    </div>
  );
}