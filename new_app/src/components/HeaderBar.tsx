import {
  Archive,
  Building2,
  Check,
  Database,
  FileSpreadsheet,
  LayoutGrid,
  Loader2,
  Plus,
  Scale,
  Search,
  Table2,
  X,
  AlertCircle,
} from 'lucide-react';
import type { SaveStatus, StorageBackend, ViewMode, ViewTab } from '../types';

interface HeaderBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  activeCount: number;
  archivedCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  saveStatus: SaveStatus;
  backend: StorageBackend;
  onOpenAdd: () => void;
  onExportExcel: () => void;
  onOpenBackup: () => void;
}

export function HeaderBar({
  search,
  onSearchChange,
  activeTab,
  onTabChange,
  activeCount,
  archivedCount,
  viewMode,
  onViewModeChange,
  saveStatus,
  backend,
  onOpenAdd,
  onExportExcel,
  onOpenBackup,
}: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-3.5 pt-3 pb-3 sm:px-6">
        {/* Top Row: Brand, Save Indicator & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30">
              <Scale className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-extrabold tracking-tight text-white sm:text-lg">
                  מעקב התמחות במשרדי עורכי דין
                </h1>
                {saveStatus === 'saving' && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-200 ring-1 ring-amber-400/30">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    שומר...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span
                    data-testid="save-indicator"
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/40"
                  >
                    <Check className="h-3 w-3" />
                    נשמר
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-bold text-rose-200 ring-1 ring-rose-400/40">
                    <AlertCircle className="h-3 w-3" />
                    שגיאת שמירה
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {backend === 'local-api'
                  ? 'שמירה אוטומטית מקומית ב-data/tracker.json'
                  : 'שמירה אוטומטית מקומית במכשיר • מוכן לעבודה גם בטלפון'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onOpenAdd}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-400 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>משרד חדש</span>
            </button>

            <button
              type="button"
              onClick={onExportExcel}
              title="ייצוא לאקסל (XLSX)"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/90 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-500 active:scale-95"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">ייצוא לאקסל</span>
            </button>

            <button
              type="button"
              onClick={onOpenBackup}
              aria-label="ייבוא וגיבוי"
              title="ייבוא וגיבוי"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-800 px-2.5 text-xs font-semibold text-slate-200 ring-1 ring-slate-700 transition hover:bg-slate-700 active:scale-95"
            >
              <Database className="h-4 w-4" />
              <span className="hidden md:inline">גיבוי / ייבוא</span>
            </button>
          </div>
        </div>

        {/* Second Row: Search + Active/Archive Tabs + View Switcher */}
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="חיפוש לפי שם משרד, תחום התמחות, מחלקה, איש קשר, כתובת או הערות..."
              aria-label="חיפוש משרדים"
              className="w-full rounded-xl bg-slate-800/95 py-2 pr-9 pl-9 text-sm text-white placeholder-slate-400 ring-1 ring-slate-700/80 transition focus:bg-slate-800 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="נקה חיפוש"
                className="absolute top-1/2 left-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            {/* Active / Archive Switcher */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-800/90 p-1 ring-1 ring-slate-700/60">
              <button
                type="button"
                onClick={() => onTabChange('active')}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === 'active'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>פעילים</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeTab === 'active'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {activeCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('archived')}
                className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === 'archived'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Archive className="h-3.5 w-3.5" />
                <span>ארכיון</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeTab === 'archived'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {archivedCount}
                </span>
              </button>
            </div>

            {/* Table / Cards View Switcher */}
            <div className="hidden items-center gap-1 rounded-xl bg-slate-800/90 p-1 ring-1 ring-slate-700/60 sm:flex">
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                title="תצוגת טבלה"
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                  viewMode === 'table'
                    ? 'bg-indigo-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Table2 className="h-3.5 w-3.5" />
                <span className="hidden md:inline">טבלה</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('cards')}
                title="תצוגת כרטיסים"
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                  viewMode === 'cards'
                    ? 'bg-indigo-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden md:inline">כרטיסים</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
