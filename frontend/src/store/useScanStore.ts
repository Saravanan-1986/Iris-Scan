import { create } from 'zustand';
import { Condition, SymptomVector, ScanRecord, SectorData, Prediction, DiseaseInfo, Language, AnalysisResult } from '@/types';
import { generateMockSectorAnalysis } from '@/utils/irisProcessing';
import { getLanguage } from '@/utils/storage';

/**
 * Generate mock multi-condition analysis result
 * Returns conditions with confidence, health score, quality score
 */
function generateMockAnalysis(): AnalysisResult {
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

  // Calculate health score
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

function generateMockPredictions(topDisease?: string): Prediction[] {
  const diseases = [
    { id: 0, name: 'Healthy / Normal', severity: 'low' as const, desc: 'No abnormalities detected in iris patterns.', sectors: [] as string[] },
    { id: 1, name: 'Glaucoma (early)', severity: 'moderate' as const, desc: 'Early signs of optic nerve damage detected.', sectors: ['N' as const, 'NE' as const] },
    { id: 2, name: 'Glaucoma (advanced)', severity: 'high' as const, desc: 'Advanced optic nerve damage with significant vision risk.', sectors: ['N' as const, 'NE' as const, 'E' as const] },
    { id: 4, name: 'Uveitis (anterior)', severity: 'moderate' as const, desc: 'Inflammation of the front part of the uvea detected.', sectors: ['SE' as const, 'S' as const] },
    { id: 7, name: 'Iridocyclitis', severity: 'high' as const, desc: 'Inflammation of the iris and ciliary body observed.', sectors: ['W' as const, 'SW' as const] },
  ];

  if (topDisease) {
    const found = diseases.find(d => d.name === topDisease);
    if (found) return [found, ...diseases.filter(d => d.id !== found.id).slice(0, 2)].map((d, i) => ({
      diseaseId: d.id,
      disease: d.name,
      confidence: Math.round((95 - i * 20) * 10) / 10,
      severity: d.severity,
      description: d.desc,
      affectedSectors: d.sectors as any,
    }));
  }

  return diseases.slice(0, 3).map((d, i) => ({
    diseaseId: d.id,
    disease: d.name,
    confidence: Math.round((92 - i * 22) * 10) / 10,
    severity: d.severity,
    description: d.desc,
    affectedSectors: d.sectors as any,
  }));
}

function generateDiseaseInfo(diseaseId: number): DiseaseInfo {
  const infos: Record<number, DiseaseInfo> = {
    0: { id: 0, name: 'Healthy / Normal', description: 'Your iris scan shows no significant abnormalities.', causes: ['N/A'], commonSymptoms: ['No symptoms reported'], urgency: 'monitor', recommendations: ['Continue regular eye check-ups every 2 years', 'Maintain a balanced diet rich in Vitamin A, C, and E', 'Protect your eyes from UV light with sunglasses', 'Take regular breaks from screen time'] },
    1: { id: 1, name: 'Glaucoma (early)', description: 'A condition that damages the optic nerve.', causes: ['Increased intraocular pressure', 'Family history of glaucoma', 'Age over 60', 'Medical conditions like diabetes'], commonSymptoms: ['Often no early symptoms', 'Gradual loss of peripheral vision', 'Tunnel vision in advanced stages'], urgency: 'withinMonth', recommendations: ['Schedule an eye pressure test immediately', 'Monitor intraocular pressure regularly', 'Take prescribed eye drops as directed', 'Avoid activities that increase eye pressure'] },
    2: { id: 2, name: 'Glaucoma (advanced)', description: 'Advanced stage of glaucoma with significant optic nerve damage.', causes: ['Untreated or uncontrolled glaucoma', 'Extremely high eye pressure', 'Poor blood flow to the optic nerve'], commonSymptoms: ['Severe peripheral vision loss', 'Blurred vision', 'Halos around lights', 'Eye pain or redness'], urgency: 'immediate', recommendations: ['Seek immediate ophthalmologist consultation', 'Consider surgical treatment options', 'Use pressure-lowering medications', 'Avoid heavy lifting and straining'] },
    4: { id: 4, name: 'Uveitis (anterior)', description: 'Inflammation of the uvea.', causes: ['Autoimmune disorders', 'Infections', 'Eye injury', 'Unknown causes'], commonSymptoms: ['Eye redness', 'Eye pain', 'Light sensitivity', 'Blurred vision', 'Floaters'], urgency: 'withinWeek', recommendations: ['Visit an ophthalmologist within the week', 'Use anti-inflammatory eye drops', 'Take prescribed oral medications if needed', 'Wear sunglasses for light sensitivity'] },
    7: { id: 7, name: 'Iridocyclitis', description: 'Inflammation of the iris and ciliary body.', causes: ['Autoimmune diseases', 'Infections', 'Trauma to the eye', 'Idiopathic'], commonSymptoms: ['Red eye', 'Eye pain', 'Photophobia', 'Blurred vision', 'Small or irregular pupil'], urgency: 'immediate', recommendations: ['Seek immediate medical attention', 'Use corticosteroid eye drops', 'Dilating eye drops to prevent scarring', 'Treat underlying cause if identified'] },
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
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Generate both legacy and new format results
    const sectorAnalysis = generateMockSectorAnalysis();
    const predictions = generateMockPredictions();
    const diseaseInfo = generateDiseaseInfo(predictions[0].diseaseId);
    const analysis = generateMockAnalysis();

    set({
      predictions,
      sectorAnalysis,
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