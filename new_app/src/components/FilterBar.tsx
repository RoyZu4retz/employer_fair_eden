import { ArrowUpDown, ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import {
  CV_STATUS_OPTIONS,
  EMAIL_STATUS_OPTIONS,
  LOCATION_FIT_OPTIONS,
  PROFILE_FIT_OPTIONS,
  TOUR_NOTES_STATUS_OPTIONS,
  TOUR_STATUS_OPTIONS,
  VISIT_RELEVANCE_OPTIONS,
  type FilterState,
  type Office,
  type SortDirection,
  type SortField,
} from '../types';
import { buildSelectOptions } from '../utils/officeHelpers';

interface FilterBarProps {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction?: SortDirection) => void;
  offices: Office[];
  departments: string[];
  filteredCount: number;
  totalCount: number;
}

export function FilterBar({
  filters,
  onChange,
  onReset,
  sortField,
  sortDirection,
  onSortChange,
  offices,
  departments,
  filteredCount,
  totalCount,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(true);

  const visitOptions = buildSelectOptions(
    VISIT_RELEVANCE_OPTIONS,
    undefined,
    offices.map((o) => o.visitRelevance)
  );
  const profileOptions = buildSelectOptions(
    PROFILE_FIT_OPTIONS,
    undefined,
    offices.map((o) => o.profileFit)
  );
  const cvOptions = buildSelectOptions(
    CV_STATUS_OPTIONS,
    undefined,
    offices.map((o) => o.cvStatus)
  );
  const emailOptions = buildSelectOptions(
    EMAIL_STATUS_OPTIONS,
    undefined,
    offices.map((o) => o.emailStatus)
  );
  const tourOptions = buildSelectOptions(
    TOUR_STATUS_OPTIONS,
    undefined,
    offices.map((o) => o.tourStatus)
  );
  const tourNotesOptions = buildSelectOptions(
    TOUR_NOTES_STATUS_OPTIONS,
    undefined,
    offices.map((o) => o.tourNotesStatus)
  );
  const locationFitOptions = buildSelectOptions(
    LOCATION_FIT_OPTIONS,
    undefined,
    offices.map((o) => o.locationFit)
  );

  const activeFiltersCount = [
    filters.visitRelevance !== 'הכל',
    filters.profileFit !== 'הכל',
    filters.cvStatus !== 'הכל',
    filters.emailStatus !== 'הכל',
    filters.tourStatus !== 'הכל',
    filters.tourNotesStatus !== 'הכל',
    filters.department !== 'הכל',
    filters.locationFit !== 'הכל',
  ].filter(Boolean).length;

  const hasAnyFilter = activeFiltersCount > 0 || filters.search.trim().length > 0;

  return (
    <section aria-label="סינון ומיון" className="mx-auto max-w-7xl px-3.5 pt-3.5 sm:px-6">
      <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs sm:p-3.5">
        {/* Top Control Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-600" />
              <span>סינון</span>
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] text-white">
                  {activeFiltersCount}
                </span>
              )}
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            <span className="text-xs font-medium text-slate-500">
              מציג <strong className="text-slate-900">{filteredCount}</strong> מתוך {totalCount}
            </span>

            {hasAnyFilter && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1 rounded-xl bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
              >
                <RotateCcw className="h-3 w-3" />
                נקה סינונים
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <label htmlFor="sort-select" className="text-xs font-semibold text-slate-500">
              מיון:
            </label>
            <select
              id="sort-select"
              value={sortField}
              onChange={(e) => onSortChange(e.target.value as SortField, 'asc')}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
            >
              <option value="default">ברירת מחדל (רלוונטיות ← פרופיל)</option>
              <option value="name">שם המשרד (א-ת)</option>
              <option value="visitRelevance">האם רלוונטי לבקר?</option>
              <option value="profileFit">התאמה לפרופיל</option>
              <option value="cvStatus">הגשת קו״ח</option>
              <option value="emailStatus">שליחת מייל</option>
              <option value="tourStatus">סיור</option>
              <option value="locationFit">התאמה במיקום</option>
              <option value="department">מחלקה</option>
            </select>
            {sortField !== 'default' && (
              <button
                type="button"
                onClick={() =>
                  onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc')
                }
                title="הפוך כיוון מיון"
                className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            )}
          </div>
        </div>

        {/* Expandable Dropdown Filter Grid */}
        {expanded && (
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-4 lg:grid-cols-8">
            <FilterSelect
              label="רלוונטי לבקר?"
              value={filters.visitRelevance}
              options={visitOptions}
              onChange={(visitRelevance) => onChange({ visitRelevance })}
            />
            <FilterSelect
              label="התאמה לפרופיל"
              value={filters.profileFit}
              options={profileOptions}
              onChange={(profileFit) => onChange({ profileFit })}
            />
            <FilterSelect
              label="הגשת קו״ח"
              value={filters.cvStatus}
              options={cvOptions}
              onChange={(cvStatus) => onChange({ cvStatus })}
            />
            <FilterSelect
              label="שליחת מייל"
              value={filters.emailStatus}
              options={emailOptions}
              onChange={(emailStatus) => onChange({ emailStatus })}
            />
            <FilterSelect
              label="סיור"
              value={filters.tourStatus}
              options={tourOptions}
              onChange={(tourStatus) => onChange({ tourStatus })}
            />
            <FilterSelect
              label="הערות מסיור (סטטוס)"
              value={filters.tourNotesStatus}
              options={tourNotesOptions}
              onChange={(tourNotesStatus) => onChange({ tourNotesStatus })}
            />
            <FilterSelect
              label="מחלקה"
              value={filters.department}
              options={departments}
              emptyLabel="הכל"
              includeBlankOption
              onChange={(department) => onChange({ department })}
            />
            <FilterSelect
              label="התאמה במיקום"
              value={filters.locationFit}
              options={locationFitOptions}
              onChange={(locationFit) => onChange({ locationFit })}
            />
          </div>
        )}
      </div>
    </section>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  emptyLabel?: string;
  includeBlankOption?: boolean;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  emptyLabel = 'הכל',
  includeBlankOption = false,
}: FilterSelectProps) {
  const active = value !== 'הכל';
  return (
    <label className="flex flex-col gap-1">
      <span className="truncate text-[11px] font-bold text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border px-2 py-1.5 text-xs font-semibold transition focus:border-indigo-500 focus:outline-none ${
          active
            ? 'border-indigo-400 bg-indigo-50/70 text-indigo-950'
            : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
        }`}
      >
        <option value="הכל">{emptyLabel}</option>
        {includeBlankOption && <option value="__empty__">ללא מחלקה</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
