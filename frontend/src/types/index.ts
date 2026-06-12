export type SeverityLevel = 'low' | 'moderate' | 'high' | 'critical';

export type SectorLabel = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export interface SectorData {
  label: SectorLabel;
  index: number;
  anomalies: string[];
  pigmentationScore: number;
  contourDensity: number;
  irregularityScore: number;
  severity: SeverityLevel | null;
}

export interface SymptomVector {
  eyePain: 'none' | 'mild' | 'moderate' | 'severe';
  visionStatus: 'normal' | 'slightlyBlurred' | 'veryBlurred' | 'blindSpots';
  lightSensitivity: 'none' | 'mild' | 'intolerable';
  rednessLevel: 'no' | 'slight' | 'veryRed';
  discharge: 'no' | 'watery' | 'thick';
  itchingBurning: 'none' | 'mild' | 'intense';
  symptomDuration: 'newToday' | 'fewDays' | 'weeks' | 'months';
  painConstant?: 'constant' | 'intermittent';
}

export interface Prediction {
  diseaseId: number;
  disease: string;
  confidence: number;
  severity: SeverityLevel;
  description: string;
  affectedSectors: SectorLabel[];
}

/** New multi-condition condition item from API */
export interface Condition {
  name: string;
  confidence: number;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  meaning: string;
  what_to_do: string;
}

export interface AnalysisResult {
  conditions: Condition[];
  eye_health_score: number;
  quality_score: number;
  heatmap: string;
}

export interface DiseaseInfo {
  id: number;
  name: string;
  description: string;
  causes: string[];
  commonSymptoms: string[];
  urgency: 'immediate' | 'withinWeek' | 'withinMonth' | 'monitor';
  recommendations: string[];
}

export interface ScanRecord {
  id: string;
  date: string;
  irisImageBase64: string;
  heatmapBase64: string;
  sectorAnalysis: SectorData[];
  symptoms: SymptomVector;
  predictions: Prediction[];
  topPrediction: string;
  language: 'en' | 'ta' | 'hi';
  /** Added fields for enhanced history */
  conditions?: Condition[];
  eyeHealthScore?: number;
  qualityScore?: number;
}

export type Language = 'en' | 'ta' | 'hi';

export type DiseaseClassId = number;

export interface NearbyHospital {
  name: string;
  address: string;
  distance: string;
  phone: string;
  rating: number;
  specialties: string[];
}