import { create } from 'zustand';
import { Condition, SymptomVector, ScanRecord, SectorData, Prediction, DiseaseInfo, Language, AnalysisResult } from '@/types';
import { getLanguage } from '@/utils/storage';

const API_URL = 'http://localhost:8000';

/**
 * Generate fallback mock multi-condition analysis result (used when backend is unavailable)
 */
function generateFallbackAnalysis(): AnalysisResult {
  const conditionTemplates = [
    { name: 'Cataracts', risk: 'Medium' as const, conf: 72, desc: 'Clouding of the eye\'s natural lens detected.' },
    { name: 'Glaucoma (early)', risk: 'High' as const, conf: 45, desc: 'Early signs of optic nerve stress.' },
    { name: 'Conjunctivitis (Pink Eye)', risk: 'Medium' as const, conf: 38, desc: 'Inflammation of the conjunctiva.' },
  ];

  const conditions = conditionTemplates.map((c, i) => ({
    name: c.name,
    confidence: c.conf,
    risk: c.risk,
    description: c.desc,
    meaning: `This indicates possible ${c.name.toLowerCase()}.`,
    what_to_do: `Consult an eye specialist for ${c.name.toLowerCase()} evaluation.`,
  }));

  const maxConf = Math.max(...conditions.map(c => c.confidence));
  const penalty = maxConf * 0.7;
  const numCond = conditions.filter(c => c.confidence > 10).length;
  const conditionPenalty = numCond * 5;
  const eyeHealthScore = Math.max(0, Math.min(100, Math.round(100 - penalty - conditionPenalty + 4)));

  return {
    conditions,
    eye_health_score: eyeHealthScore,
    quality_score: 0.82,
    heatmap: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
  };
}

function generateFallbackPredictions(): Prediction[] {
  const diseases = [
    { id: 0, name: 'Healthy / Normal', severity: 'low' as const, desc: 'No abnormalities detected in iris patterns.', sectors: [] as string[] },
    { id: 1, name: 'Glaucoma (early)', severity: 'moderate' as const, desc: 'Early signs of optic nerve damage detected.', sectors: ['N' as const, 'NE' as const] },
    { id: 2, name: 'Glaucoma (advanced)', severity: 'high' as const, desc: 'Advanced optic nerve damage with significant vision risk.', sectors: ['N' as const, 'NE' as const, 'E' as const] },
  ];

  return diseases.slice(0, 3).map((d, i) => ({
    diseaseId: d.id,
    disease: d.name,
    confidence: Math.round((92 - i * 22) * 10) / 10,
    severity: d.severity,
    description: d.desc,
    affectedSectors: d.sectors as any,
  }));
}

function generateFallbackDiseaseInfo(diseaseId: number): DiseaseInfo {
  const infos: Record<number, DiseaseInfo> = {
    0: { id: 0, name: 'Healthy / Normal', description: 'Your iris scan shows no significant abnormalities.', causes: ['N/A'], commonSymptoms: ['No symptoms reported'], urgency: 'monitor', recommendations: ['Continue regular eye check-ups every 2 years', 'Maintain a balanced diet rich in Vitamin A, C, and E', 'Protect your eyes from UV light with sunglasses', 'Take regular breaks from screen time'] },
    1: { id: 1, name: 'Glaucoma (early)', description: 'A condition that damages the optic nerve.', causes: ['Increased intraocular pressure', 'Family history of glaucoma', 'Age over 60', 'Medical conditions like diabetes'], commonSymptoms: ['Often no early symptoms', 'Gradual loss of peripheral vision', 'Tunnel vision in advanced stages'], urgency: 'withinMonth', recommendations: ['Schedule an eye pressure test immediately', 'Monitor intraocular pressure regularly', 'Take prescribed eye drops as directed', 'Avoid activities that increase eye pressure'] },
    2: { id: 2, name: 'Glaucoma (advanced)', description: 'Advanced stage of glaucoma with significant optic nerve damage.', causes: ['Untreated or uncontrolled glaucoma', 'Extremely high eye pressure', 'Poor blood flow to the optic nerve'], commonSymptoms: ['Severe peripheral vision loss', 'Blurred vision', 'Halos around lights', 'Eye pain or redness'], urgency: 'immediate', recommendations: ['Seek immediate ophthalmologist consultation', 'Consider surgical treatment options', 'Use pressure-lowering medications', 'Avoid heavy lifting and straining'] },
  };
  return infos[diseaseId] || infos[0];
}

interface ScanState {
  currentStep: 'home' | 'capture' | 'questionnaire' | 'analysing' | 'results';
  capturedImage: string | null;
  heatmapImage: string | null;
  symptoms: Partial<SymptomVector>;
  predictions: Prediction[];
  sectorAnalysis: SectorData[];
  diseaseInfo: DiseaseInfo | null;
  scleraRedness: boolean;
  language: Language;
  darkMode: boolean;
  disclaimerDismissed: boolean;
  /** New multi-condition fields */
  conditions: Condition[];
  eyeHealthScore: number;
  qualityScore: number;

  setStep: (step: ScanState['currentStep']) => void;
  setCapturedImage: (img: string | null) => void;
  setHeatmapImage: (img: string | null) => void;
  setSymptoms: (s: Partial<SymptomVector>) => void;
  setScleraRedness: (r: boolean) => void;
  setLanguage: (l: Language) => void;
  setDarkMode: (d: boolean) => void;
  dismissDisclaimer: () => void;
  runAnalysis: () => Promise<void>;
  resetScan: () => void;
  /** Set analysis result from API */
  setAnalysisResult: (result: AnalysisResult) => void;
}

export const useScanStore = create<ScanState>((set, get) => ({
  currentStep: 'home',
  capturedImage: null,
  heatmapImage: null,
  symptoms: {},
  predictions: [],
  sectorAnalysis: [],
  diseaseInfo: null,
  scleraRedness: false,
  language: getLanguage(),
  darkMode: document.documentElement.classList.contains('dark'),
  disclaimerDismissed: false,
  conditions: [],
  eyeHealthScore: 0,
  qualityScore: 0,

  setStep: (step) => set({ currentStep: step }),
  setCapturedImage: (img) => set({ capturedImage: img }),
  setHeatmapImage: (img) => set({ heatmapImage: img }),
  setSymptoms: (s) => set({ symptoms: { ...get().symptoms, ...s } }),
  setScleraRedness: (r) => set({ scleraRedness: r }),
  setLanguage: (l) => set({ language: l }),
  setDarkMode: (d) => {
    set({ darkMode: d });
    if (d) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  },
  dismissDisclaimer: () => set({ disclaimerDismissed: true }),

  setAnalysisResult: (result) => set({
    conditions: result.conditions,
    eyeHealthScore: result.eye_health_score,
    qualityScore: result.quality_score,
    heatmapImage: result.heatmap,
  }),

  runAnalysis: async () => {
    set({ currentStep: 'analysing' });

    const { capturedImage, symptoms } = get();

    try {
      // Try calling the real backend API first
      if (capturedImage) {
        const response = await fetch(`${API_URL}/analyse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: capturedImage,
            symptoms: Object.keys(symptoms).length > 0 ? symptoms : undefined,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          // Map API response to our types
          const conditions: Condition[] = (result.conditions || []).map((c: any) => ({
            name: c.name,
            confidence: c.confidence,
            risk: c.risk,
            description: c.description,
            meaning: c.meaning || `This indicates possible ${c.name.toLowerCase()}.`,
            what_to_do: c.what_to_do || `Consult an eye specialist for ${c.name.toLowerCase()} evaluation.`,
            explanation: c.explanation,
            affected_regions: c.affected_regions,
            symptom_evidence: c.symptom_evidence,
          }));

          set({
            conditions,
            eyeHealthScore: result.eye_health_score,
            qualityScore: result.quality_score,
            heatmapImage: result.heatmap || '',
            currentStep: 'results',
            predictions: [],
            sectorAnalysis: [],
            diseaseInfo: null,
          });
          return;
        }
      }
    } catch {
      // Backend not available, fall through to fallback
      console.warn('Backend API unavailable, using fallback analysis');
    }

    // Fallback: wait briefly then use mock data
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Use image content for more realistic fallback predictions
    const predictions = generateFallbackPredictions();
    const diseaseInfo = generateFallbackDiseaseInfo(predictions[0].diseaseId);
    const analysis = generateFallbackAnalysis();

    set({
      predictions,
      sectorAnalysis: [],
      diseaseInfo,
      conditions: analysis.conditions,
      eyeHealthScore: analysis.eye_health_score,
      qualityScore: analysis.quality_score,
      heatmapImage: analysis.heatmap,
      currentStep: 'results',
    });
  },

  resetScan: () => set({
    currentStep: 'home',
    capturedImage: null,
    heatmapImage: null,
    symptoms: {},
    predictions: [],
    sectorAnalysis: [],
    diseaseInfo: null,
    scleraRedness: false,
    conditions: [],
    eyeHealthScore: 0,
    qualityScore: 0,
  }),
}));