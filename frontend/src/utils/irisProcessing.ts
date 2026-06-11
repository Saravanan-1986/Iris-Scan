import { SectorData, SectorLabel } from '@/types';

const SECTOR_LABELS: SectorLabel[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export function getSectorLabels(): SectorLabel[] {
  return SECTOR_LABELS;
}

export function generateMockSectorAnalysis(): SectorData[] {
  return SECTOR_LABELS.map((label, i) => ({
    label,
    index: i,
    anomalies: Math.random() > 0.5 ? ['Pigmentation irregularity detected'] : [],
    pigmentationScore: Math.round(Math.random() * 100),
    contourDensity: Math.round(Math.random() * 100),
    irregularityScore: Math.round(Math.random() * 100),
    severity: Math.random() > 0.6 ? 'low' : Math.random() > 0.6 ? 'moderate' : null,
  }));
}

export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteStrings = atob(base64.split(',')[1] || base64);
  const byteArrays: Uint8Array[] = [];
  for (let offset = 0; offset < byteStrings.length; offset += 512) {
    const slice = byteStrings.slice(offset, offset + 512);
    const byteNums = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNums[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNums));
  }
  return new Blob(byteArrays as BlobPart[], { type: mimeType });
}

export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  return base64ToBlob(arr[1], mime);
}