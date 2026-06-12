import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useScanStore } from '@/store/useScanStore';
import Button from '@/components/UI/Button';
import Card from '@/components/UI/Card';

/**
 * Health Worker Mode - Simplified UI for rural healthcare workers.
 * Provides quick screening with minimal steps.
 */
export default function HealthWorkerMode() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const runAnalysis = useScanStore((s) => s.runAnalysis);
  const conditions = useScanStore((s) => s.conditions);
  const eyeHealthScore = useScanStore((s) => s.eyeHealthScore);

  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [symptomsNote, setSymptomsNote] = useState('');

  const handleQuickScan = async () => {
    await runAnalysis();
    navigate('/results');
  };

  // Quick symptom check buttons
  const quickSymptoms = [
    { label: 'Redness', risk: 'Medium' },
    { label: 'Pain', risk: 'High' },
    { label: 'Blurry vision', risk: 'High' },
    { label: 'Watering', risk: 'Low' },
    { label: 'No symptoms', risk: 'Low' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-secondary/20 text-secondary text-xs rounded-full font-medium">
            Health Worker Mode
          </span>
        </div>
        <h1 className="text-xl font-medium text-text-primary dark:text-white">Quick Eye Screening</h1>
        <p className="text-sm text-neutral mt-1">For community health workers — simple, fast, no login required</p>
      </div>

      {/* Patient info */}
      <Card className="mb-4">
        <h2 className="text-sm font-medium text-text-primary dark:text-white mb-3">Patient Information</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-neutral mb-1">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter name"
              className="w-full px-3 py-2 rounded-input border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-text-primary dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral mb-1">Age</label>
            <input
              type="number"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder="Years"
              min={0}
              max={120}
              className="w-full px-3 py-2 rounded-input border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-text-primary dark:text-white focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
            />
          </div>
        </div>
      </Card>

      {/* Quick symptom check */}
      <Card className="mb-4">
        <h2 className="text-sm font-medium text-text-primary dark:text-white mb-3">Quick Symptom Check</h2>
        <p className="text-xs text-neutral mb-3">Select any symptoms the patient reports:</p>
        <div className="flex flex-wrap gap-2">
          {quickSymptoms.map((s) => (
            <button
              key={s.label}
              onClick={() => setSymptomsNote(s.label)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                symptomsNote === s.label
                  ? 'bg-primary text-white border-primary'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral border-neutral-200 dark:border-neutral-700 hover:border-primary/50'
              }`}
            >
              {s.label}
              <span className={`ml-1.5 opacity-70 ${
                s.risk === 'High' ? 'text-danger' : s.risk === 'Medium' ? 'text-warning' : 'text-secondary'
              }`}>
                {s.risk === 'High' ? '⚠' : s.risk === 'Medium' ? '•' : ''}
              </span>
            </button>
          ))}
        </div>
        {symptomsNote && (
          <p className="text-xs text-neutral mt-2">Selected: <span className="text-text-primary dark:text-white">{symptomsNote}</span></p>
        )}
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button size="lg" onClick={handleQuickScan}>
          Start Screening
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate('/capture')}>
          Open Camera
        </Button>
      </div>

      {/* Recent screening results area (if available) */}
      {conditions.length > 0 && (
        <Card className="bg-secondary-50 dark:bg-secondary-900/10">
          <h3 className="text-sm font-medium text-text-primary dark:text-white mb-2">Last Screening</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-secondary">{eyeHealthScore}</span>
              <span className="text-xs text-neutral">/100</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary dark:text-white truncate">
                {conditions[0]?.name || 'No conditions detected'}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/results')}>
              View
            </Button>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-neutral-50 dark:bg-neutral-900/50">
        <h2 className="text-sm font-medium text-text-primary dark:text-white mb-2">Instructions</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li className="text-xs text-neutral">Ask patient to look directly into the camera</li>
          <li className="text-xs text-neutral">Ensure good lighting — avoid shadows on the face</li>
          <li className="text-xs text-neutral">Keep the device steady for 2-3 seconds</li>
          <li className="text-xs text-neutral">Review results and refer to specialist if needed</li>
        </ol>
      </Card>
    </div>
  );
}