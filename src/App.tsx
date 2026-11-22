import { ArrowUp, CheckCircle2, ChevronDown, ChevronUp, SearchX, Undo2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import firmsJson from './data/firmsData.json';
import { FilterDeck } from './components/FilterDeck';
import { FirmCard } from './components/FirmCard';
import { SettingsDrawer } from './components/SettingsDrawer';
import { StickyHeader } from './components/StickyHeader';
import { useTrackerState } from './hooks/useTrackerState';
import type { FilterState, Firm, Sector } from './types';
import { hasActiveNotesOrTags } from './utils/firmHelpers';

const FIRMS = firmsJson as Firm[];

const DEFAULT_FILTERS: FilterState = {
  sector: 'private',
  search: '',
  floor: 'הכל',
  profileFit: 'הכל',
  locationFit: 'הכל',
  priority: 'הכל',
  status: 'all',
};

interface UndoToast {
  firmId: string;
  firmName: string;
  wasCompleted: boolean;
}

export function App() {
  const {
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
  } = useTrackerState();

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [completedOpen, setCompletedOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState<UndoToast | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const privateFirms = useMemo(() => FIRMS.filter((f) => f.sector === 'private'), []);
  const publicFirms = useMemo(() => FIRMS.filter((f) => f.sector === 'public'), []);

  const privateCompletedCount = useMemo(
    () => privateFirms.filter((f) => state[f.id]?.completed).length,
    [privateFirms, state]
  );

  const publicCompletedCount = useMemo(
    () => publicFirms.filter((f) => state[f.id]?.completed).length,
    [publicFirms, state]
  );

  const sectorFirms = filters.sector === 'private' ? privateFirms : publicFirms;

  const filteredFirms = useMemo(() => {
    const q = filters.search.trim().toLowerCase();

    return sectorFirms.filter((firm) => {
      const userState = state[firm.id];
      const isCompleted = Boolean(userState?.completed);

      if (filters.floor !== 'הכל' && firm.floor !== filters.floor) {
        return false;
      }

      if (filters.sector === 'private') {
        if (filters.profileFit !== 'הכל' && firm.profileFit !== filters.profileFit) {
          return false;
        }
        if (filters.locationFit !== 'הכל' && firm.locationFit !== filters.locationFit) {
          return false;
        }
        if (filters.priority !== 'הכל' && firm.visitPriority !== filters.priority) {
          return false;
        }
      }

      if (filters.status === 'pending' && isCompleted) return false;
      if (filters.status === 'completed' && !isCompleted) return false;
      if (filters.status === 'noted' && !hasActiveNotesOrTags(userState)) return false;

      if (q) {
        const haystack = [
          firm.name,
          firm.fairLocation,
          firm.city,
          firm.addressDetails,
          firm.practiceAreas,
          firm.dunsRanking,
          firm.sizeCategory,
          firm.initialNotes,
          userState?.partnerContact ?? '',
          userState?.notes ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [sectorFirms, filters, state]);

  const activeFirms = useMemo(
    () => filteredFirms.filter((f) => !state[f.id]?.completed),
    [filteredFirms, state]
  );

  const completedFirms = useMemo(() => {
    return filteredFirms
      .filter((f) => state[f.id]?.completed)
      .sort((a, b) => {
        const tA = state[a.id]?.completedAt ?? '';
        const tB = state[b.id]?.completedAt ?? '';
        return tB.localeCompare(tA);
      });
  }, [filteredFirms, state]);

  const handleSectorChange = (sector: Sector) => {
    setFilters((prev) => ({
      ...prev,
      sector,
      floor: 'הכל',
      profileFit: 'הכל',
      locationFit: 'הכל',
      priority: 'הכל',
    }));
  };

  const handleFilterChange = (patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    if (patch.status === 'completed') {
      setCompletedOpen(true);
    }
  };

  const handleToggleCompleted = (firm: Firm) => {
    const nextCompleted = toggleCompleted(firm.id);
    setToast({
      firmId: firm.id,
      firmName: firm.name,
      wasCompleted: nextCompleted,
    });
  };

  const handleUndoToast = () => {
    if (!toast) return;
    setCompleted(toast.firmId, !toast.wasCompleted);
    setToast(null);
  };

  return (
    <div className="min-h-dvh bg-slate-50 pb-20">
      <StickyHeader
        sector={filters.sector}
        onSectorChange={handleSectorChange}
        search={filters.search}
        onSearchChange={(search) => handleFilterChange({ search })}
        privateTotal={privateFirms.length}
        privateCompleted={privateCompletedCount}
        publicTotal={publicFirms.length}
        publicCompleted={publicCompletedCount}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <FilterDeck
        filters={filters}
        onChange={handleFilterChange}
        onResetFilters={() => setFilters((prev) => ({ ...DEFAULT_FILTERS, sector: prev.sector }))}
        filteredCount={filteredFirms.length}
        totalInSector={sectorFirms.length}
      />

      <main className="mx-auto max-w-2xl px-3.5 pt-3.5">
        {filteredFirms.length === 0 ? (
          <div className="my-10 flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <SearchX className="h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-base font-bold text-slate-800">לא נמצאו משרדים תואמים</h3>
            <p className="mt-1 text-xs text-slate-500">
              נסה לשנות את הסינון או לנקות את שדה החיפוש.
            </p>
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...DEFAULT_FILTERS, sector: prev.sector }))}
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
            >
              נקה את כל הסינונים
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Active (Unchecked) Firms List */}
            {activeFirms.length > 0 && (
              <section aria-label="משרדים ממתינים לביקור" data-testid="active-firms-section">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 className="text-xs font-extrabold tracking-wide text-slate-500">
                    ממתינים לביקור ({activeFirms.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {activeFirms.map((firm) => (
                    <FirmCard
                      key={firm.id}
                      firm={firm}
                      userState={getFirmState(firm.id)}
                      onToggleCompleted={handleToggleCompleted}
                      onToggleTag={toggleTag}
                      onUpdatePartnerContact={updatePartnerContact}
                      onUpdateNotes={updateNotes}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Collapsible Completed Firms Section at Bottom */}
            {completedFirms.length > 0 && (
              <section
                aria-label="הושלמו / עברתי בדוכן"
                data-testid="completed-firms-section"
                className="pt-1"
              >
                <button
                  type="button"
                  onClick={() => setCompletedOpen((v) => !v)}
                  data-testid="completed-section-toggle"
                  className="flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-right transition hover:bg-emerald-100/70"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-extrabold text-emerald-950">
                      הושלמו / עברתי בדוכן ({completedFirms.length})
                    </span>
                  </div>
                  {completedOpen ? (
                    <ChevronUp className="h-5 w-5 text-emerald-700" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-emerald-700" />
                  )}
                </button>

                {completedOpen && (
                  <div className="mt-3 space-y-3">
                    {completedFirms.map((firm) => (
                      <FirmCard
                        key={firm.id}
                        firm={firm}
                        userState={getFirmState(firm.id)}
                        onToggleCompleted={handleToggleCompleted}
                        onToggleTag={toggleTag}
                        onUpdatePartnerContact={updatePartnerContact}
                        onUpdateNotes={updateNotes}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>

      {/* Scroll-to-top FAB */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="חזור למעלה"
          className="fixed bottom-5 left-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/90 text-white shadow-lg ring-1 ring-white/20 transition hover:bg-slate-800 active:scale-90"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      {/* Undo Completion Toast */}
      {toast && (
        <div
          role="status"
          className="fixed right-4 bottom-5 left-4 z-40 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-xs text-white shadow-xl ring-1 ring-slate-700"
        >
          <span className="truncate font-medium">
            <strong>{toast.firmName}</strong>{' '}
            {toast.wasCompleted ? 'הועבר להושלמו ✓' : 'הוחזר לרשימה הפעילה'}
          </span>
          <button
            type="button"
            onClick={handleUndoToast}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-500 px-2.5 py-1.5 font-bold text-white transition hover:bg-indigo-400 active:scale-95"
          >
            <Undo2 className="h-3.5 w-3.5" />
            בטל
          </button>
        </div>
      )}

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        firms={FIRMS}
        state={state}
        onExportJSON={() => exportJSON(FIRMS)}
        onExportCSV={() => exportCSV(FIRMS)}
        onImportJSON={importJSON}
        onResetAll={resetAll}
      />
    </div>
  );
}

export default App;
