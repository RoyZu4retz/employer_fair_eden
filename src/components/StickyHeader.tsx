import { Search, Settings, X, Building2, Landmark, CheckCircle2 } from 'lucide-react';
import type { Sector } from '../types';

interface StickyHeaderProps {
  sector: Sector;
  onSectorChange: (sector: Sector) => void;
  search: string;
  onSearchChange: (value: string) => void;
  privateTotal: number;
  privateCompleted: number;
  publicTotal: number;
  publicCompleted: number;
  onOpenSettings: () => void;
}

export function StickyHeader({
  sector,
  onSectorChange,
  search,
  onSearchChange,
  privateTotal,
  privateCompleted,
  publicTotal,
  publicCompleted,
  onOpenSettings,
}: StickyHeaderProps) {
  const activeTotal = sector === 'private' ? privateTotal : publicTotal;
  const activeCompleted = sector === 'private' ? privateCompleted : publicCompleted;
  const progressPct = activeTotal > 0 ? Math.round((activeCompleted / activeTotal) * 100) : 0;
  const sectorLabel = sector === 'private' ? 'משרדים פרטיים' : 'גופים ציבוריים';

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md">
      <div className="mx-auto max-w-2xl px-3.5 pt-3 pb-2.5">
        {/* Top Row: Title, Live Progress & Settings */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="truncate text-[16px] font-extrabold tracking-tight text-white">
              יריד מעסיקים רייכמן 2026
            </h1>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span className="font-semibold text-emerald-300" data-testid="progress-counter">
                {activeCompleted} / {activeTotal} {sectorLabel} הושלמו
              </span>
              <span className="text-slate-400">({progressPct}%)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="הגדרות וגיבוי"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-200 ring-1 ring-slate-700 transition hover:bg-slate-700 active:scale-95"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Thin Progress Bar */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-teal-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Search Input */}
        <div className="relative mt-2.5">
          <Search className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="חיפוש לפי שם משרד, תחום התמחות, עיר או אולם..."
            aria-label="חיפוש משרדים"
            className="w-full rounded-xl bg-slate-800/95 py-2.5 pr-9 pl-9 text-sm text-white placeholder-slate-400 ring-1 ring-slate-700/80 transition focus:bg-slate-800 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
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

        {/* Sector Tab Switcher */}
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-800/80 p-1">
          <button
            type="button"
            onClick={() => onSectorChange('private')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
              sector === 'private'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>משרדים פרטיים</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                sector === 'private'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {privateCompleted}/{privateTotal}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSectorChange('public')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
              sector === 'public'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Landmark className="h-3.5 w-3.5" />
            <span>גופים ציבוריים</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                sector === 'public'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {publicCompleted}/{publicTotal}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
