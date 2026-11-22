import { useCallback, useEffect, useState } from 'react';
import {
  QUICK_TAGS,
  type Firm,
  type FirmUserState,
  type QuickTagId,
  type TrackerState,
} from '../types';

const STORAGE_KEY = 'reichman_law_fair_2026_tracker_v1';

const EMPTY_FIRM_STATE: FirmUserState = {
  completed: false,
  tags: [],
  partnerContact: '',
  notes: '',
};

function loadState(): TrackerState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as TrackerState;
    }
    return {};
  } catch {
    return {};
  }
}

export function useTrackerState() {
  const [state, setState] = useState<TrackerState>(() => loadState());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors in restricted browsing modes
    }
  }, [state]);

  const getFirmState = useCallback(
    (firmId: string): FirmUserState => state[firmId] ?? EMPTY_FIRM_STATE,
    [state]
  );

  const toggleCompleted = useCallback((firmId: string): boolean => {
    let nextCompleted = false;
    setState((prev) => {
      const current = prev[firmId] ?? EMPTY_FIRM_STATE;
      nextCompleted = !current.completed;
      const now = new Date().toISOString();
      return {
        ...prev,
        [firmId]: {
          ...current,
          completed: nextCompleted,
          completedAt: nextCompleted ? now : undefined,
          updatedAt: now,
        },
      };
    });
    return nextCompleted;
  }, []);

  const setCompleted = useCallback((firmId: string, completed: boolean) => {
    setState((prev) => {
      const current = prev[firmId] ?? EMPTY_FIRM_STATE;
      const now = new Date().toISOString();
      return {
        ...prev,
        [firmId]: {
          ...current,
          completed,
          completedAt: completed ? now : undefined,
          updatedAt: now,
        },
      };
    });
  }, []);

  const toggleTag = useCallback((firmId: string, tagId: QuickTagId) => {
    setState((prev) => {
      const current = prev[firmId] ?? EMPTY_FIRM_STATE;
      const exists = current.tags.includes(tagId);
      const nextTags = exists
        ? current.tags.filter((t) => t !== tagId)
        : [...current.tags, tagId];
      return {
        ...prev,
        [firmId]: {
          ...current,
          tags: nextTags,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const updatePartnerContact = useCallback((firmId: string, partnerContact: string) => {
    setState((prev) => {
      const current = prev[firmId] ?? EMPTY_FIRM_STATE;
      return {
        ...prev,
        [firmId]: {
          ...current,
          partnerContact,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const updateNotes = useCallback((firmId: string, notes: string) => {
    setState((prev) => {
      const current = prev[firmId] ?? EMPTY_FIRM_STATE;
      return {
        ...prev,
        [firmId]: {
          ...current,
          notes,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const exportJSON = useCallback(
    (firms: Firm[]) => {
      const payload = {
        exportedAt: new Date().toISOString(),
        app: 'Reichman Law Fair 2026 – Internship 2028 Tracker',
        version: 1,
        trackerState: state,
        summary: {
          totalFirms: firms.length,
          completedCount: Object.values(state).filter((s) => s.completed).length,
        },
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      triggerDownload(blob, `reichman-law-fair-backup-${formatDateStamp()}.json`);
    },
    [state]
  );

  const exportCSV = useCallback(
    (firms: Firm[]) => {
      const tagMap = new Map(QUICK_TAGS.map((t) => [t.id, t.label]));
      const headers = [
        'מגזר',
        'שם המשרד / גוף',
        'מיקום ביריד',
        'עיר',
        'התאמה לפרופיל',
        'התאמה במיקום',
        'עדיפות ביקור',
        'הושלם',
        'תגיות מהירות',
        'שם / מייל שותף',
        'הערות מהיריד',
        'הערות מקוריות',
      ];

      const escapeCsv = (val: string) => {
        const clean = (val ?? '').replace(/\r?\n/g, ' ');
        return `"${clean.replace(/"/g, '""')}"`;
      };

      const rows = firms.map((firm) => {
        const st = state[firm.id] ?? EMPTY_FIRM_STATE;
        const tagLabels = st.tags.map((id) => tagMap.get(id) ?? id).join(' | ');
        return [
          firm.sector === 'private' ? 'משרד פרטי' : 'גוף ציבורי',
          firm.name,
          firm.fairLocation,
          firm.city,
          firm.profileFit,
          firm.locationFit,
          firm.visitPriority,
          st.completed ? 'כן' : 'לא',
          tagLabels,
          st.partnerContact,
          st.notes,
          firm.initialNotes,
        ]
          .map(escapeCsv)
          .join(',');
      });

      // UTF-8 BOM so Hebrew displays properly in Microsoft Excel
      const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      triggerDownload(blob, `reichman-law-fair-2026-${formatDateStamp()}.csv`);
    },
    [state]
  );

  const importJSON = useCallback((rawText: string): { ok: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(rawText) as unknown;
      let incoming: unknown = parsed;
      if (parsed && typeof parsed === 'object' && 'trackerState' in parsed) {
        incoming = (parsed as { trackerState?: unknown }).trackerState;
      }

      if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
        return { ok: false, error: 'קובץ הגיבוי אינו בפורמט תקין.' };
      }

      setState(incoming as TrackerState);
      return { ok: true };
    } catch {
      return { ok: false, error: 'לא ניתן היה לקרוא את קובץ ה-JSON.' };
    }
  }, []);

  const resetAll = useCallback(() => {
    setState({});
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    state,
    getFirmState,
    toggleCompleted,
    setCompleted,
    toggleTag,
    updatePartnerContact,
    updateNotes,
    exportJSON,
    exportCSV,
    importJSON,
    resetAll,
  };
}

function formatDateStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
