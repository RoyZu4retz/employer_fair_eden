import { SearchX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AddOfficeModal } from './components/AddOfficeModal';
import { BackupModal } from './components/BackupModal';
import { FilterBar } from './components/FilterBar';
import { HeaderBar } from './components/HeaderBar';
import { OfficeCards } from './components/OfficeCards';
import { OfficeDrawer } from './components/OfficeDrawer';
import { OfficeTable } from './components/OfficeTable';
import { SummaryStrip } from './components/SummaryStrip';
import { useOfficesTracker } from './hooks/useOfficesTracker';
import {
  DEFAULT_FILTERS,
  type FilterState,
  type SortDirection,
  type SortField,
  type ViewMode,
  type ViewTab,
} from './types';
import { isCvSubmitted, isEmailReplied, isEmailSent, isTourDone, sortOffices } from './utils/officeHelpers';

export function App() {
  const {
    offices,
    departments,
    backend,
    saveStatus,
    updateOffice,
    addOffice,
    addDepartment,
    setArchived,
    deleteOfficePermanently,
    exportExcel,
    importExcelFile,
    exportJSON,
    importJSON,
  } = useOfficesTracker();

  const [activeTab, setActiveTab] = useState<ViewTab>('active');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [quickFilter, setQuickFilter] = useState<
    'all' | 'cv' | 'emailSent' | 'emailReplied' | 'tourDone'
  >('all');
  const [sortField, setSortField] = useState<SortField>('default');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobileViewport(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const activeOffices = useMemo(
    () => offices.filter((o) => !o.archived),
    [offices]
  );
  const archivedOffices = useMemo(
    () => offices.filter((o) => o.archived),
    [offices]
  );

  const tabOffices = activeTab === 'active' ? activeOffices : archivedOffices;

  const filteredAndSorted = useMemo(() => {
    const q = filters.search.trim().toLowerCase();

    const filtered = tabOffices.filter((office) => {
      if (quickFilter === 'cv' && !isCvSubmitted(office.cvStatus)) return false;
      if (quickFilter === 'emailSent' && !isEmailSent(office.emailStatus)) return false;
      if (quickFilter === 'emailReplied' && !isEmailReplied(office.emailStatus)) return false;
      if (quickFilter === 'tourDone' && !isTourDone(office.tourStatus)) return false;

      if (
        filters.visitRelevance !== 'הכל' &&
        office.visitRelevance.trim() !== filters.visitRelevance
      ) {
        return false;
      }
      if (filters.profileFit !== 'הכל' && office.profileFit.trim() !== filters.profileFit) {
        return false;
      }
      if (filters.cvStatus !== 'הכל' && office.cvStatus.trim() !== filters.cvStatus) {
        return false;
      }
      if (
        filters.emailStatus !== 'הכל' &&
        office.emailStatus.trim() !== filters.emailStatus
      ) {
        return false;
      }
      if (filters.tourStatus !== 'הכל' && office.tourStatus.trim() !== filters.tourStatus) {
        return false;
      }
      if (
        filters.tourNotesStatus !== 'הכל' &&
        office.tourNotesStatus.trim() !== filters.tourNotesStatus
      ) {
        return false;
      }
      if (filters.department !== 'הכל') {
        if (filters.department === '__empty__') {
          if (office.department.trim() !== '') return false;
        } else if (office.department.trim() !== filters.department) {
          return false;
        }
      }
      if (
        filters.locationFit !== 'הכל' &&
        office.locationFit.trim() !== filters.locationFit
      ) {
        return false;
      }

      if (q) {
        const haystack = [
          office.name,
          office.location,
          office.addressDetails,
          office.transitAccess,
          office.firmSize,
          office.headcount,
          office.practiceAreas,
          office.dunsRanking,
          office.department,
          office.primaryContact,
          office.secondaryContact,
          office.personalNotes,
          office.tourFreeNotes,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    return sortOffices(filtered, sortField, sortDirection);
  }, [tabOffices, filters, quickFilter, sortField, sortDirection]);

  const selectedOffice = useMemo(
    () => offices.find((o) => o.id === selectedId) ?? null,
    [offices, selectedId]
  );

  const handleFilterChange = (patch: Partial<FilterState>) => {
    setQuickFilter('all');
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleResetFilters = () => {
    setQuickFilter('all');
    setFilters(DEFAULT_FILTERS);
  };

  const handleQuickFilter = (
    preset: 'all' | 'cv' | 'emailSent' | 'emailReplied' | 'tourDone'
  ) => {
    setActiveTab('active');
    setFilters(DEFAULT_FILTERS);
    setQuickFilter((prev) => (prev === preset ? 'all' : preset));
  };

  const handleSortColumn = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSortChange = (field: SortField, direction?: SortDirection) => {
    setSortField(field);
    if (direction) setSortDirection(direction);
  };

  const effectiveViewMode: ViewMode = isMobileViewport ? 'cards' : viewMode;

  const quickFilterLabel: Record<typeof quickFilter, string> = {
    all: '',
    cv: 'משרדים שהוגשו להם קו״ח',
    emailSent: 'משרדים שנשלח אליהם מייל',
    emailReplied: 'משרדים שענו / התקבל עדכון',
    tourDone: 'משרדים שבהם בוצע סיור',
  };

  return (
    <div className="min-h-dvh bg-slate-50 pb-16">
      <HeaderBar
        search={filters.search}
        onSearchChange={(search) => handleFilterChange({ search })}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeCount={activeOffices.length}
        archivedCount={archivedOffices.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        saveStatus={saveStatus}
        backend={backend}
        onOpenAdd={() => setAddModalOpen(true)}
        onExportExcel={() => exportExcel(false)}
        onOpenBackup={() => setBackupModalOpen(true)}
      />

      <SummaryStrip activeOffices={activeOffices} onQuickFilter={handleQuickFilter} />

      {quickFilter !== 'all' && (
        <div className="mx-auto max-w-7xl px-3.5 pt-2.5 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-800 ring-1 ring-indigo-200">
            <span>סינון מהיר פעיל: {quickFilterLabel[quickFilter]}</span>
            <button
              type="button"
              onClick={() => setQuickFilter('all')}
              className="rounded-md bg-indigo-600 px-2 py-0.5 text-[11px] text-white hover:bg-indigo-700"
            >
              הצג הכל
            </button>
          </div>
        </div>
      )}

      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        offices={tabOffices}
        departments={departments}
        filteredCount={filteredAndSorted.length}
        totalCount={tabOffices.length}
      />

      <main className="mx-auto max-w-7xl px-3.5 pt-4 sm:px-6">
        {filteredAndSorted.length === 0 ? (
          <div className="my-8 flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <SearchX className="h-10 w-10 text-slate-400" />
            <h3 className="mt-3 text-base font-bold text-slate-800">
              {activeTab === 'archived' && archivedOffices.length === 0
                ? 'הארכיון ריק'
                : 'לא נמצאו משרדים תואמים'}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {activeTab === 'archived' && archivedOffices.length === 0
                ? 'משרדים שתעבירי לארכיון יופיעו כאן ותוכלי לשחזר אותם בכל עת.'
                : 'נסי לשנות את הסינון או לנקות את שדה החיפוש.'}
            </p>
            {(activeTab === 'active' || archivedOffices.length > 0) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700"
              >
                נקה סינונים
              </button>
            )}
          </div>
        ) : effectiveViewMode === 'table' ? (
          <OfficeTable
            offices={filteredAndSorted}
            selectedId={selectedId}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortColumn={handleSortColumn}
            onSelectOffice={(o) => setSelectedId(o.id)}
          />
        ) : (
          <OfficeCards
            offices={filteredAndSorted}
            selectedId={selectedId}
            onSelectOffice={(o) => setSelectedId(o.id)}
          />
        )}
      </main>

      <OfficeDrawer
        office={selectedOffice}
        departments={departments}
        saveStatus={saveStatus}
        onClose={() => setSelectedId(null)}
        onUpdate={updateOffice}
        onAddDepartment={addDepartment}
        onArchiveToggle={setArchived}
        onDeletePermanent={deleteOfficePermanently}
      />

      <AddOfficeModal
        open={addModalOpen}
        departments={departments}
        onClose={() => setAddModalOpen(false)}
        onAdd={(office) => {
          addOffice(office);
          setActiveTab('active');
          setSelectedId(office.id);
        }}
      />

      <BackupModal
        open={backupModalOpen}
        backend={backend}
        activeCount={activeOffices.length}
        archivedCount={archivedOffices.length}
        onClose={() => setBackupModalOpen(false)}
        onExportExcel={exportExcel}
        onImportExcel={importExcelFile}
        onExportJSON={exportJSON}
        onImportJSON={importJSON}
      />
    </div>
  );
}

export default App;
