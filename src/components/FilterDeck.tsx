import { RotateCcw, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import {
  FLOOR_OPTIONS,
  LOCATION_FIT_OPTIONS,
  PRIORITY_OPTIONS,
  PROFILE_FIT_OPTIONS,
  STATUS_OPTIONS,
  type FilterState,
  type StatusFilter,
} from '../types';

interface FilterDeckProps {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onResetFilters: () => void;
  filteredCount: number;
  totalInSector: number;
}

export function FilterDeck({
  filters,
  onChange,
  onResetFilters,
  filteredCount,
  totalInSector,
}: FilterDeckProps) {
  const [showAdvanced, setShowAdvanced] = useState(true);

  const activeFilterCount = [
    filters.floor !== 'הכל',
    filters.status !== 'all',
    filters.sector === 'private' && filters.profileFit !== 'הכל',
    filters.sector === 'private' && filters.locationFit !== 'הכל',
    filters.sector === 'private' && filters.priority !== 'הכל',
  ].filter(Boolean).length;

  return (
    <section className="border-b border-slate-200 bg-white/95 shadow-2xs">
      <div className="mx-auto max-w-2xl space-y-2 px-3.5 py-2.5">
        {/* Row 1: Floor Filter (Always visible) */}
        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-[11px] font-bold text-slate-500">קומה:</span>
          <div className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto py-0.5">
            {FLOOR_OPTIONS.map((floor) => {
              const active = filters.floor === floor;
              return (
                <button
                  key={floor}
                  type="button"
                  onClick={() => onChange({ floor })}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                    active
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {floor}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Status Filter (Always visible) */}
        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-[11px] font-bold text-slate-500">סטטוס:</span>
          <div className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto py-0.5">
            {STATUS_OPTIONS.map((opt) => {
              const active = filters.status === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange({ status: opt.id as StatusFilter })}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Private-only filters (Profile Fit, Location Fit, Priority) */}
        {filters.sector === 'private' && (
          <>
            {showAdvanced && (
              <div className="space-y-2 border-t border-slate-100 pt-2">
                {/* Profile Fit */}
                <div className="flex items-center gap-2">
                  <span className="w-12 shrink-0 text-[11px] font-bold text-slate-500">פרופיל:</span>
                  <div className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto py-0.5">
                    {PROFILE_FIT_OPTIONS.map((opt) => {
                      const active = filters.profileFit === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => onChange({ profileFit: opt })}
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold transition active:scale-95 ${
                            active
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location Fit */}
                <div className="flex items-center gap-2">
                  <span className="w-12 shrink-0 text-[11px] font-bold text-slate-500">מיקום:</span>
                  <div className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto py-0.5">
                    {LOCATION_FIT_OPTIONS.map((opt) => {
                      const active = filters.locationFit === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => onChange({ locationFit: opt })}
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold transition active:scale-95 ${
                            active
                              ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Visit Priority */}
                <div className="flex items-center gap-2">
                  <span className="w-12 shrink-0 text-[11px] font-bold text-slate-500">עדיפות:</span>
                  <div className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto py-0.5">
                    {PRIORITY_OPTIONS.map((opt) => {
                      const active = filters.priority === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => onChange({ priority: opt })}
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold transition active:scale-95 ${
                            active
                              ? 'border-rose-600 bg-rose-600 text-white shadow-xs'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Compact Summary + Toggle / Reset Row */}
        <div className="flex items-center justify-between pt-0.5 text-xs">
          <span className="font-medium text-slate-500">
            מציג <strong className="text-slate-800">{filteredCount}</strong> מתוך {totalInSector}
          </span>

          <div className="flex items-center gap-2">
            {(activeFilterCount > 0 || filters.search.trim().length > 0) && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95"
              >
                <RotateCcw className="h-3 w-3" />
                נקה סינונים
              </button>
            )}

            {filters.sector === 'private' && (
              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                <SlidersHorizontal className="h-3 w-3" />
                <span>{showAdvanced ? 'צמצם סינונים' : 'סינונים נוספים'}</span>
                {showAdvanced ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
