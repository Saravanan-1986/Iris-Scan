import { ScanRecord, Language } from '@/types';

const HISTORY_KEY = 'iriscan_history';
const LANG_KEY = 'iriscan_lang';
const DARK_KEY = 'iriscan_dark';
const MAX_SCANS = 20;

export function getHistory(): ScanRecord[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    console.warn('Failed to read scan history from localStorage');
    return [];
  }
}

export function saveScan(scan: ScanRecord): boolean {
  try {
    const history = getHistory();
    if (history.length >= MAX_SCANS) {
      history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      history.splice(0, history.length - MAX_SCANS + 1);
    }
    history.unshift(scan);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (e) {
    console.error('localStorage full or unavailable', e);
    return false;
  }
}

export function deleteScan(id: string): void {
  const history = getHistory().filter((s) => s.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearAllHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function exportHistoryAsJSON(): string {
  return JSON.stringify(getHistory(), null, 2);
}

export function getLanguage(): Language {
  return (localStorage.getItem(LANG_KEY) as Language) || 'en';
}

export function setLanguage(lang: Language): void {
  localStorage.setItem(LANG_KEY, lang);
}

export function getDarkMode(): boolean {
  return localStorage.getItem(DARK_KEY) === 'true';
}

export function setDarkMode(dark: boolean): void {
  localStorage.setItem(DARK_KEY, dark ? 'true' : 'false');
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}