import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useScanStore } from '@/store/useScanStore';
import { useHistory } from '@/hooks/useHistory';
import { Condition, ScanRecord, NearbyHospital } from '@/types';
import EyeHealthScore from '@/components/UI/EyeHealthScore';
import ConditionCard from '@/components/UI/ConditionCard';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';

/** Mock nearby hospitals for impact feature */
const MOCK_HOSPITALS: NearbyHospital[] = [
  { name: 'Aravind Eye Hospital', address: 'No 1, Anna Nagar, Chennai', distance: '2.3 km', phone: '+91 44 2822 8888', rating: 4.8, specialties: ['Ophthalmology', 'Retina', 'Glaucoma'] },
  { name: 'Sankara Nethralaya', address: '18, College Road, Nungambakkam', distance: '4.1 km', phone: '+91 44 2827 1616', rating: 4.7, specialties: ['Cataract', 'Cornea', 'Vitreo-retina'] },
  { name: 'Dr. Agarwal Eye Hospital', address: 'New No 7, Old No 51, Cathedral Road', distance: '3.5 km', phone: '+91 44 2811 3300', rating: 4.5, specialties: ['Lasik', 'Cataract', 'Glaucoma'] },
];

export default function Results() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    heatmapImage,
    conditions,
    eyeHealthScore,
    qualityScore,
    predictions,
    diseaseInfo,
    scleraRedness,
    symptoms,
    sectorAnalysis,
    resetScan,
    capturedImage: img,
  } = useScanStore();

  const { addRecord } = useHistory();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showHospitals, setShowHospitals] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedConditionId, setExpandedConditionId] = useState<string | null>(null);
  const [showAIReasoning, setShowAIReasoning] = useState(true);

  // Auto-save scan to history when results are first displayed
  const autoSavedRef = React.useRef(false);
  React.useEffect(() => {
    if (autoSavedRef.current || !img || conditions.length === 0) return;
    autoSavedRef.current = true;
    const record: ScanRecord = {
      id: 'scan_' + Date.now(),
      date: new Date().toISOString(),
      irisImageBase64: img,
      heatmapBase64: heatmapImage || '',
      sectorAnalysis,
      symptoms: symptoms as any,
      predictions,
      topPrediction: conditions[0]?.name || predictions[0]?.disease || 'Unknown',
      language: 'en',
      conditions,
      eyeHealthScore,
      qualityScore,
    };
    const ok = addRecord(record);
    if (ok) setSaved(true);
  }, [img, conditions, heatmapImage, sectorAnalysis, symptoms, predictions, eyeHealthScore, qualityScore, addRecord]);

  const handleSave = () => {
    if (!autoSavedRef.current) {
      if (saved || !img) return;
      const record: ScanRecord = {
        id: 'scan_' + Date.now(),
        date: new Date().toISOString(),
        irisImageBase64: img,
        heatmapBase64: heatmapImage || '',
        sectorAnalysis,
        symptoms: symptoms as any,
        predictions,
        topPrediction: conditions[0]?.name || predictions[0]?.disease || 'Unknown',
        language: 'en',
        conditions,
        eyeHealthScore,
        qualityScore,
      };
      const ok = addRecord(record);
      if (ok) setSaved(true);
    }
  };

  const handleNewScan = () => {
    resetScan();
    navigate('/capture');
  };

  const handleDownloadReport = () => {
    try {
      const { jsPDF } = window as any;
      if (jsPDF) {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('EyeSight Screening Report', 20, 30);
        doc.setFontSize(11);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
        doc.text(`Eye Health Score: ${eyeHealthScore}/100`, 20, 55);
        doc.text('---', 20, 65);
        conditions.forEach((c, i) => {
          doc.text(`${i + 1}. ${c.name} — ${c.confidence}% (${c.risk})`, 20, 75 + i * 10);
        });
        doc.text('---', 20, 75 + conditions.length * 10 + 5);
        doc.text('This is a screening tool only. NOT a medical diagnosis.', 20, 85 + conditions.length * 10 + 5);
        doc.save('EyeSight_Screening_Report.pdf');
      } else {
        alert('PDF generation will be available after importing jsPDF');
      }
    } catch {
      alert('PDF generation error. Please save and try again.');
    }
  };

  const getRecommendations = useMemo(() => {
    const riskLevels = conditions.map(c => c.risk);
    if (riskLevels.includes('Critical')) return { title: 'Immediate attention needed', items: ['Seek immediate medical attention', 'Visit the nearest hospital emergency room', 'Bring this screening report with you'] };
    if (riskLevels.includes('High')) return { title: 'Schedule a visit soon', items: ['Consult an ophthalmologist within the week', 'Avoid self-medication', 'Rest your eyes and monitor symptoms'] };
    if (riskLevels.includes('Medium')) return { title: 'Monitor and follow up', items: ['Schedule an eye exam within the month', 'Note any changes in symptoms', 'Maintain good eye care habits'] };
    return { title: 'Keep up the good work!', items: ['Continue regular eye check-ups', 'Maintain healthy diet for eyes', 'Protect eyes from UV light'] };
  }, [conditions]);

  // Guard: no conditions
  if (conditions.length === 0 && predictions.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-neutral mb-4">{t('errors.generic')}</p>
        <Button onClick={() => navigate('/capture')}>{t('errors.retry')}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-text-primary dark:text-white">Screening Results</h1>
          <p className="text-sm text-neutral mt-0.5">AI-powered eye health screening — {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          {!saved && <Button variant="secondary" size="sm" onClick={handleSave}>Save</Button>}
          <Button size="sm" onClick={handleNewScan}>{t('results.new_scan')}</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Image + Health Score */}
        <div className="space-y-6">
          {/* Eye Health Score - Animated Circular */}
          <Card className="!p-0 overflow-hidden">
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 p-6 flex flex-col items-center">
              <div className="relative">
                <EyeHealthScore score={eyeHealthScore} size={160} />
              </div>
              <p className="text-xs text-neutral mt-4">
                Quality score: {Math.round(qualityScore * 100)}% · {conditions.length} condition{conditions.length > 1 ? 's' : ''} detected
              </p>
            </div>
          </Card>

          {/* Iris Image with heatmap toggle */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-text-primary dark:text-white">Eye Scan</h2>
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className="text-xs text-primary hover:text-primary-600 transition-colors"
              >
                {showHeatmap ? 'Hide heatmap' : 'Show heatmap'}
              </button>
            </div>
            <div className="relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              {img && (
                <img src={img} alt="Eye scan" className="w-full aspect-square object-cover" />
              )}
              {showHeatmap && heatmapImage && (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  src={heatmapImage}
                  alt="AI heatmap overlay"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
            {showHeatmap && (
              <p className="text-xs text-neutral mt-2 italic">
                Highlighted regions indicate areas the AI focused on during analysis.
              </p>
            )}
          </Card>
        </div>

        {/* Right: Conditions + Info */}
        <div className="space-y-4">
          <h2 className="text-base font-medium text-text-primary dark:text-white">
            Detected Conditions
          </h2>

          {/* Condition Cards */}
          {conditions.map((condition: Condition, i: number) => (
            <ConditionCard
              key={`${condition.name}-${i}`}
              condition={condition}
              index={i}
              isExpanded={expandedConditionId === `${condition.name}-${i}`}
              onToggle={() =>
                setExpandedConditionId(
                  expandedConditionId === `${condition.name}-${i}` ? null : `${condition.name}-${i}`
                )
              }
            />
          ))}

          {/* Legacy predictions fallback if new conditions empty */}
          {conditions.length === 0 && predictions.map((pred, i) => (
            <Card key={pred.diseaseId} className="border border-subtle">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-text-primary dark:text-white">{pred.disease}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral">
                  {pred.confidence}%
                </span>
              </div>
              <p className="text-xs text-neutral">{pred.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Reasoning Summary Section - NEW */}
      {conditions.length > 0 && conditions.some(c => c.explanation) && (
        <Card className="!p-0 overflow-hidden">
          <button
            onClick={() => setShowAIReasoning(!showAIReasoning)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-primary dark:text-white">How the AI analyzed your scan</span>
            </div>
            <svg
              className={`w-5 h-5 text-neutral transition-transform ${showAIReasoning ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showAIReasoning && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="border-t border-subtle"
            >
              <div className="p-4 space-y-4">
                {conditions.map((condition, i) => condition.explanation && (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary dark:text-white mb-1">{condition.name}</p>
                      <p className="text-xs text-neutral leading-relaxed">{condition.explanation}</p>
                      {condition.affected_regions && condition.affected_regions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {condition.affected_regions.map((r) => (
                            <span key={r} className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-primary-50 dark:bg-primary-900/20 text-primary">
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </Card>
      )}

      {/* Recommendations Section */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-medium text-text-primary dark:text-white mb-2">{getRecommendations.title}</h3>
            <ul className="space-y-1.5">
              {getRecommendations.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-neutral">
                  <span className="text-secondary mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Disease info from legacy support */}
      {diseaseInfo && (
        <Card>
          <h2 className="text-base font-medium text-text-primary dark:text-white mb-3">{diseaseInfo.description}</h2>
          {diseaseInfo.causes?.[0] !== 'N/A' && (
            <div className="mb-3">
              <p className="text-xs font-medium text-neutral uppercase tracking-wider mb-1">Common Causes</p>
              <ul className="list-disc list-inside text-sm text-neutral space-y-0.5">
                {diseaseInfo.causes.map((cause, i) => <li key={i}>{cause}</li>)}
              </ul>
            </div>
          )}
          {diseaseInfo.recommendations.length > 0 && (
            <div>
              <p className="text-xs font-medium text-neutral uppercase tracking-wider mb-1">Recommendations</p>
              <ul className="list-disc list-inside text-sm text-neutral space-y-0.5">
                {diseaseInfo.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Sclera warning */}
      {scleraRedness && (
        <Card className="bg-warning-50 dark:bg-warning-900/10 border-warning/20">
          <p className="text-sm text-warning font-medium">
            ⚠ Scleral redness detected — may indicate conjunctivitis or uveitis. Please consult an eye doctor.
          </p>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={handleDownloadReport}>
          📄 Download PDF Report
        </Button>
        <Button variant="outline" onClick={() => setShowHospitals(!showHospitals)}>
          🏥 {showHospitals ? 'Hide' : 'Find'} Nearby Eye Hospitals
        </Button>
      </div>

      {/* Nearby hospitals section */}
      {showHospitals && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h3 className="text-sm font-medium text-text-primary dark:text-white">Nearby Eye Hospitals</h3>
          {MOCK_HOSPITALS.map((hospital, i) => (
            <Card key={i} className="border border-subtle">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary dark:text-white">{hospital.name}</p>
                  <p className="text-xs text-neutral">{hospital.address}</p>
                  <p className="text-xs text-neutral mt-0.5">{hospital.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-secondary">{hospital.distance}</p>
                  <p className="text-xs text-warning">★ {hospital.rating}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {hospital.specialties.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary">
                    {s}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Disclaimer */}
      <Card className="bg-warning-50 dark:bg-warning-900/10 border-warning/20">
        <p className="text-xs text-warning">
          ⚠️ <strong>Medical Disclaimer:</strong> This is a screening tool only. It does NOT provide a medical diagnosis.
          The results shown are for informational purposes and should not replace professional medical advice.
          Always consult a qualified ophthalmologist for a complete eye examination.
        </p>
      </Card>
    </div>
  );
}

// Export for react-router lazy loading
export { Results };