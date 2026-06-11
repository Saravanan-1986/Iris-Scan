import { useState, useCallback } from 'react';
import { ScanRecord } from '@/types';
import { getHistory, deleteScan as removeScan, clearAllHistory as wipeHistory, saveScan as storeScan } from '@/utils/storage';

export function useHistory() {
  const [records, setRecords] = useState<ScanRecord[]>(() => getHistory());

  const refresh = useCallback(() => {
    setRecords(getHistory());
  }, []);

  const addRecord = useCallback((record: ScanRecord) => {
    const saved = storeScan(record);
    if (saved) refresh();
    return saved;
  }, [refresh]);

  const removeRecord = useCallback((id: string) => {
    removeScan(id);
    refresh();
  }, [refresh]);

  const clearAll = useCallback(() => {
    wipeHistory();
    refresh();
  }, [refresh]);

  return { records, refresh, addRecord, removeRecord, clearAll };
}

export function useCompareMode() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const clearSelection = () => setSelectedIds([]);

  return { selectedIds, toggleSelect, clearSelection, isCompareMode: selectedIds.length === 2 };
}