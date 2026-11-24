import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import initialOfficesJson from '../data/initialOffices.json';
import type { Office, SaveStatus, StorageBackend, TrackerDocument } from '../types';
import { exportOfficesToExcel, mergeOfficesNonDestructive, parseExcelFileInBrowser } from '../utils/excelIO';

const STORAGE_KEY = 'eden_law_internship_tracker_v1';

const SEED_OFFICES: Office[] = (initialOfficesJson as Office[]).map((o) => ({
  ...o,
  tourFreeNotes: o.tourFreeNotes ?? '',
  archived: Boolean(o.archived),
}));

function loadLocalDocument(): TrackerDocument {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        version: 1,
        updatedAt: new Date().toISOString(),
        departments: [],
        offices: SEED_OFFICES,
      };
    }
    const parsed = JSON.parse(raw) as Partial<TrackerDocument>;
    if (parsed && Array.isArray(parsed.offices) && parsed.offices.length > 0) {
      return {
        version: parsed.version ?? 1,
        updatedAt: parsed.updatedAt ?? new Date().toISOString(),
        departments: Array.isArray(parsed.departments) ? parsed.departments : [],
        offices: parsed.offices.map((o) => ({
          ...o,
          tourFreeNotes: o.tourFreeNotes ?? '',
          archived: Boolean(o.archived),
        })),
      };
    }
  } catch {
    // Fall back to seed data
  }
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    departments: [],
    offices: SEED_OFFICES,
  };
}

function saveLocalDocument(doc: TrackerDocument) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
  } catch {
    // Ignore quota errors in restricted browsing modes
  }
}

export function useOfficesTracker() {
  const [doc, setDoc] = useState<TrackerDocument>(() => loadLocalDocument());
  const [backend, setBackend] = useState<StorageBackend>('browser-local');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const backendRef = useRef<StorageBackend>('browser-local');
  const saveTimerRef = useRef<number | null>(null);
  const statusClearRef = useRef<number | null>(null);

  // Detect local Express API on startup; fall back cleanly to localStorage on GitHub Pages
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/data', {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('API unavailable');
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Not JSON');
        const remote = (await res.json()) as TrackerDocument;
        if (!cancelled && remote && Array.isArray(remote.offices)) {
          backendRef.current = 'local-api';
          setBackend('local-api');
          setDoc(remote);
          saveLocalDocument(remote);
        }
      } catch {
        // Static deployment (GitHub Pages) — stay in browser-local mode
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistDocument = useCallback((nextDoc: TrackerDocument) => {
    saveLocalDocument(nextDoc);
    setSaveStatus('saving');

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    if (statusClearRef.current) window.clearTimeout(statusClearRef.current);

    const finalizeSaved = () => {
      setSaveStatus('saved');
      setLastSavedAt(new Date().toISOString());
      statusClearRef.current = window.setTimeout(() => {
        setSaveStatus('idle');
      }, 2500);
    };

    if (backendRef.current === 'local-api') {
      saveTimerRef.current = window.setTimeout(async () => {
        try {
          const res = await fetch('/api/data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nextDoc),
          });
          if (!res.ok) throw new Error('Save failed');
          finalizeSaved();
        } catch {
          setSaveStatus('error');
        }
      }, 220);
    } else {
      saveTimerRef.current = window.setTimeout(finalizeSaved, 120);
    }
  }, []);

  const mutateDoc = useCallback(
    (updater: (prev: TrackerDocument) => TrackerDocument) => {
      setDoc((prev) => {
        const next = updater(prev);
        const withTimestamp: TrackerDocument = {
          ...next,
          updatedAt: new Date().toISOString(),
        };
        persistDocument(withTimestamp);
        return withTimestamp;
      });
    },
    [persistDocument]
  );

  const departments = useMemo(() => {
    const set = new Set<string>();
    doc.departments.forEach((d) => {
      const clean = d.trim();
      if (clean) set.add(clean);
    });
    doc.offices.forEach((o) => {
      const clean = (o.department ?? '').trim();
      if (clean) set.add(clean);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'he'));
  }, [doc.departments, doc.offices]);

  const addDepartment = useCallback(
    (deptName: string) => {
      const clean = deptName.trim();
      if (!clean) return;
      mutateDoc((prev) => ({
        ...prev,
        departments: Array.from(new Set([...prev.departments, clean])),
      }));
    },
    [mutateDoc]
  );

  const updateOffice = useCallback(
    (officeId: string, patch: Partial<Office>) => {
      mutateDoc((prev) => {
        const nextDepts =
          patch.department && patch.department.trim()
            ? Array.from(new Set([...prev.departments, patch.department.trim()]))
            : prev.departments;

        return {
          ...prev,
          departments: nextDepts,
          offices: prev.offices.map((o) =>
            o.id === officeId
              ? { ...o, ...patch, updatedAt: new Date().toISOString() }
              : o
          ),
        };
      });
    },
    [mutateDoc]
  );

  const addOffice = useCallback(
    (office: Office) => {
      mutateDoc((prev) => {
        const nextDepts = office.department.trim()
          ? Array.from(new Set([...prev.departments, office.department.trim()]))
          : prev.departments;
        return {
          ...prev,
          departments: nextDepts,
          offices: [office, ...prev.offices],
        };
      });
    },
    [mutateDoc]
  );

  const setArchived = useCallback(
    (officeId: string, archived: boolean) => {
      updateOffice(officeId, { archived });
    },
    [updateOffice]
  );

  const deleteOfficePermanently = useCallback(
    (officeId: string) => {
      mutateDoc((prev) => ({
        ...prev,
        offices: prev.offices.filter((o) => o.id !== officeId),
      }));
    },
    [mutateDoc]
  );

  const exportExcel = useCallback(
    (includeArchived = false) => {
      exportOfficesToExcel(doc.offices, includeArchived);
    },
    [doc.offices]
  );

  const importExcelFile = useCallback(
    async (file: File): Promise<{ ok: boolean; msg: string }> => {
      try {
        const incoming = await parseExcelFileInBrowser(file);
        if (incoming.length === 0) {
          return { ok: false, msg: 'לא נמצאו שורות משרדים תקינות בקובץ.' };
        }
        let summary = { added: 0, updated: 0 };
        mutateDoc((prev) => {
          const merged = mergeOfficesNonDestructive(prev.offices, incoming);
          summary = { added: merged.added, updated: merged.updated };
          return {
            ...prev,
            offices: merged.offices,
          };
        });
        return {
          ok: true,
          msg: `יובאו ${summary.added} משרדים חדשים ועודכנו ${summary.updated} משרדים קיימים (ללא דריסת שדות שמילאת).`,
        };
      } catch (err) {
        return {
          ok: false,
          msg: err instanceof Error ? err.message : 'שגיאה בקריאת קובץ האקסל.',
        };
      }
    },
    [mutateDoc]
  );

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [doc]);

  const importJSON = useCallback(
    async (file: File): Promise<{ ok: boolean; msg: string }> => {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as Partial<TrackerDocument>;
        if (!parsed || !Array.isArray(parsed.offices)) {
          return { ok: false, msg: 'קובץ הגיבוי אינו בפורמט תקין.' };
        }
        mutateDoc(() => ({
          version: 1,
          updatedAt: new Date().toISOString(),
          departments: Array.isArray(parsed.departments) ? parsed.departments : [],
          offices: parsed.offices!.map((o) => ({
            ...o,
            tourFreeNotes: o.tourFreeNotes ?? '',
            archived: Boolean(o.archived),
          })),
        }));
        return { ok: true, msg: `שוחזרו ${parsed.offices.length} משרדים בהצלחה.` };
      } catch {
        return { ok: false, msg: 'לא ניתן לקרוא את קובץ ה-JSON.' };
      }
    },
    [mutateDoc]
  );

  return {
    offices: doc.offices,
    departments,
    backend,
    saveStatus,
    lastSavedAt,
    loading,
    updateOffice,
    addOffice,
    addDepartment,
    setArchived,
    deleteOfficePermanently,
    exportExcel,
    importExcelFile,
    exportJSON,
    importJSON,
  };
}
