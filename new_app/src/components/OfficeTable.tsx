import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Mail,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';
import type { Office, SortDirection, SortField } from '../types';
import {
  getCvBadgeClasses,
  getEmailBadgeClasses,
  getFitBadgeClasses,
  getRowAccentClasses,
  getTourBadgeClasses,
  getTourNotesStatusClasses,
  getVisitRelevanceClasses,
} from '../utils/officeHelpers';

interface OfficeTableProps {
  offices: Office[];
  selectedId: string | null;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortColumn: (field: SortField) => void;
  onSelectOffice: (office: Office) => void;
}

export function OfficeTable({
  offices,
  selectedId,
  sortField,
  sortDirection,
  onSortColumn,
  onSelectOffice,
}: OfficeTableProps) {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-slate-300" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-indigo-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-indigo-600" />
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-right text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/95 text-[11px] font-extrabold text-slate-600">
              <th className="px-3.5 py-3">
                <button
                  type="button"
                  onClick={() => onSortColumn('name')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  שם המשרד
                  {renderSortIcon('name')}
                </button>
              </th>
              <th className="px-2.5 py-3">
                <button
                  type="button"
                  onClick={() => onSortColumn('visitRelevance')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  רלוונטי לבקר?
                  {renderSortIcon('visitRelevance')}
                </button>
              </th>
              <th className="px-2.5 py-3">
                <button
                  type="button"
                  onClick={() => onSortColumn('profileFit')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  פרופיל
                  {renderSortIcon('profileFit')}
                </button>
              </th>
              <th className="px-2.5 py-3">
                <button
                  type="button"
                  onClick={() => onSortColumn('cvStatus')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  הגשת קו״ח
                  {renderSortIcon('cvStatus')}
                </button>
              </th>
              <th className="px-2.5 py-3">
                <button
                  type="button"
                  onClick={() => onSortColumn('emailStatus')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  שליחת מייל
                  {renderSortIcon('emailStatus')}
                </button>
              </th>
              <th className="px-2.5 py-3">
                <button
                  type="button"
                  onClick={() => onSortColumn('tourStatus')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  סיור
                  {renderSortIcon('tourStatus')}
                </button>
              </th>
              <th className="px-2.5 py-3">הערות מסיור</th>
              <th className="px-2.5 py-3">
                <button
                  type="button"
                  onClick={() => onSortColumn('department')}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  מחלקה
                  {renderSortIcon('department')}
                </button>
              </th>
              <th className="px-3 py-3">איש קשר / הערות</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {offices.map((office) => {
              const isSelected = selectedId === office.id;
              const hasNotes =
                Boolean(office.personalNotes.trim()) || Boolean(office.tourFreeNotes.trim());

              return (
                <tr
                  key={office.id}
                  onClick={() => onSelectOffice(office)}
                  data-testid={`office-row-${office.id}`}
                  className={`cursor-pointer transition-colors ${getRowAccentClasses(
                    office.visitRelevance
                  )} ${isSelected ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/50!' : ''}`}
                >
                  {/* Office Name & Meta */}
                  <td className="max-w-[240px] px-3.5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 text-[13px] leading-snug">
                        {office.name}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      {office.location && <span>{office.location}</span>}
                      {office.firmSize && (
                        <>
                          <span>•</span>
                          <span>{office.firmSize}</span>
                        </>
                      )}
                      {office.locationFit && (
                        <>
                          <span>•</span>
                          <span>מיקום: {office.locationFit}</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Visit Relevance */}
                  <td className="px-2.5 py-3 whitespace-nowrap">
                    {office.visitRelevance ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] ${getVisitRelevanceClasses(
                          office.visitRelevance
                        )}`}
                      >
                        {office.visitRelevance === 'חובה!!!' && (
                          <Sparkles className="h-3 w-3 shrink-0" />
                        )}
                        {office.visitRelevance}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Profile Fit */}
                  <td className="px-2.5 py-3 whitespace-nowrap">
                    {office.profileFit ? (
                      <span
                        className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${getFitBadgeClasses(
                          office.profileFit
                        )}`}
                      >
                        {office.profileFit}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* CV Status */}
                  <td className="px-2.5 py-3 whitespace-nowrap">
                    {office.cvStatus ? (
                      <span
                        className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${getCvBadgeClasses(
                          office.cvStatus
                        )}`}
                      >
                        {office.cvStatus}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Email Status */}
                  <td className="px-2.5 py-3 whitespace-nowrap">
                    {office.emailStatus ? (
                      <span
                        className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${getEmailBadgeClasses(
                          office.emailStatus
                        )}`}
                      >
                        {office.emailStatus}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Tour Status */}
                  <td className="px-2.5 py-3 whitespace-nowrap">
                    {office.tourStatus ? (
                      <span
                        className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${getTourBadgeClasses(
                          office.tourStatus
                        )}`}
                      >
                        {office.tourStatus}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Tour Notes Status (from Excel) */}
                  <td className="px-2.5 py-3 whitespace-nowrap">
                    {office.tourNotesStatus ? (
                      <span
                        className={`inline-flex rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${getTourNotesStatusClasses(
                          office.tourNotesStatus
                        )}`}
                      >
                        {office.tourNotesStatus}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Department */}
                  <td className="max-w-[130px] px-2.5 py-3">
                    {office.department ? (
                      <span className="inline-flex max-w-full truncate rounded-lg bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-800 ring-1 ring-indigo-200/70">
                        {office.department}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Contact & Notes preview */}
                  <td className="max-w-[200px] px-3 py-3">
                    <div className="flex flex-col gap-0.5">
                      {office.primaryContact ? (
                        <div className="flex items-center gap-1 truncate text-[11px] font-medium text-slate-700">
                          <Mail className="h-3 w-3 shrink-0 text-indigo-500" />
                          <span className="truncate" dir="auto">
                            {office.primaryContact}
                          </span>
                        </div>
                      ) : null}
                      {hasNotes ? (
                        <div className="flex items-center gap-1 truncate text-[11px] text-slate-500">
                          <MessageSquareText className="h-3 w-3 shrink-0 text-emerald-600" />
                          <span className="truncate">
                            {office.personalNotes.trim() || office.tourFreeNotes.trim()}
                          </span>
                        </div>
                      ) : null}
                      {!office.primaryContact && !hasNotes && (
                        <span className="text-[11px] text-slate-300">לחצי לעריכה</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
