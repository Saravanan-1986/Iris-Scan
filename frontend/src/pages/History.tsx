import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ScanRecord } from '@/types';
import { useHistory, useCompareMode } from '@/hooks/useHistory';
import Button from '@/components/UI/Button';
import Badge from '@/components/UI/Badge';
import Card from '@/components/UI/Card';

export default function History() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { records, removeRecord, clearAll } = useHistory();
  const { selectedIds, toggleSelect, clearSelection, isCompareMode } = useCompareMode();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  const handleDelete = (id: string) => {
    removeRecord(id);
    setDeleteConfirm(null);
  };

  const handleClearAll = () => {
    clearAll();
    setClearConfirm(false);
  };

  const handleDownload = (record: ScanRecord) => {
    // PDF generation placeholder
    alert('PDF download will be implemented with jsPDF');
  };

  if (records.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <svg className="w-20 h-20 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <p className="text-base text-neutral mb-4">{t('history.no_scans')}</p>
        <Button onClick={() => navigate('/capture')}>{t('history.no_scans_action')}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-medium text-text-primary dark:text-white">{t('history.title')}</h1>
        <div className="flex gap-2">
          {isCompareMode && (
            <Button variant="secondary" size="sm" onClick={clearSelection}>{t('common.cancel')}</Button>
          )}
          <Button variant="danger" size="sm" onClick={() => setClearConfirm(true)}>{t('history.clear_all')}</Button>
        </div>
      </div>

      <div className="space-y-3">
        {records.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card
              raised
              onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
              ariaLabel={`Scan ${new Date(record.date).toLocaleDateString()} - ${record.topPrediction}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(record.id)}
                    onChange={() => toggleSelect(record.id)}
                    className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    aria-label={`Select scan ${index + 1} for comparison`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {record.irisImageBase64 && (
                  <img src={record.irisImageBase64} alt="Iris" className="w-12 h-12 rounded-full object-cover border border-subtle" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary dark:text-white truncate">
                    {record.topPrediction}
                  </p>
                  <p className="text-xs text-neutral">
                    {new Date(record.date).toLocaleDateString()} — {record.id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {record.predictions[0] && (
                    <Badge severity={record.predictions[0].severity}>
                      {t(`results.severity.${record.predictions[0].severity}`)}
                    </Badge>
                  )}
                  <span className="text-xs text-neutral min-w-[3rem] text-right">
                    {record.predictions[0]?.confidence}%
                  </span>
                </div>
              </div>

              {expandedId === record.id && (
                <div className="mt-4 pt-4 border-t border-subtle">
                  <div className="space-y-2 mb-4">
                    {record.predictions.slice(0, 3).map((pred) => (
                      <div key={pred.diseaseId} className="flex items-center justify-between text-sm">
                        <span className="text-text-primary dark:text-white">{pred.disease}</span>
                        <div className="flex items-center gap-2">
                          <Badge severity={pred.severity}>{t(`results.severity.${pred.severity}`)}</Badge>
                          <span className="text-neutral">{pred.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleDownload(record); }}>
                      {t('history.download')}
                    </Button>
                    {deleteConfirm === record.id ? (
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-danger">{t('history.delete_confirm')}</span>
                        <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}>
                          {t('common.confirm')}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}>
                          {t('common.cancel')}
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(record.id); }}>
                        {t('history.delete')}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {clearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <div className="card-raised p-6 max-w-sm mx-4">
              <p className="text-sm text-text-primary dark:text-white mb-4">{t('history.clear_confirm')}</p>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setClearConfirm(false)}>{t('common.cancel')}</Button>
                <Button variant="danger" onClick={handleClearAll}>{t('common.confirm')}</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}