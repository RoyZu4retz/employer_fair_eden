import {
  Building2,
  ChevronLeft,
  Mail,
  MapPin,
  MessageSquareText,
  Sparkles,
  Tag,
} from 'lucide-react';
import type { Office } from '../types';
import {
  getCvBadgeClasses,
  getEmailBadgeClasses,
  getFitBadgeClasses,
  getRowAccentClasses,
  getTourBadgeClasses,
  getTourNotesStatusClasses,
  getVisitRelevanceClasses,
} from '../utils/officeHelpers';

interface OfficeCardsProps {
  offices: Office[];
  selectedId: string | null;
  onSelectOffice: (office: Office) => void;
}

export function OfficeCards({ offices, selectedId, onSelectOffice }: OfficeCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {offices.map((office) => {
        const isSelected = selectedId === office.id;
        const previewNote = office.personalNotes.trim() || office.tourFreeNotes.trim();

        return (
          <article
            key={office.id}
            onClick={() => onSelectOffice(office)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectOffice(office);
              }
            }}
            data-testid={`office-card-${office.id}`}
            className={`animate-soft-enter cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs transition active:scale-[0.99] ${getRowAccentClasses(
              office.visitRelevance
            )} ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] leading-snug font-extrabold text-slate-900">
                  {office.name}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  {office.location && (
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {office.location}
                    </span>
                  )}
                  {office.firmSize && (
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                      <Building2 className="h-3 w-3 text-slate-400" />
                      {office.firmSize}
                    </span>
                  )}
                  {office.department && (
                    <span className="inline-flex items-center gap-0.5 rounded-md bg-indigo-50 px-1.5 py-0.5 font-bold text-indigo-800 ring-1 ring-indigo-200/70">
                      <Tag className="h-3 w-3" />
                      {office.department}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {office.visitRelevance && (
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
                )}
                <ChevronLeft className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Status Badges Grid */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
              {office.profileFit && (
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold ${getFitBadgeClasses(
                    office.profileFit
                  )}`}
                >
                  <span className="opacity-75">פרופיל:</span>
                  {office.profileFit}
                </span>
              )}
              {office.cvStatus && (
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold ${getCvBadgeClasses(
                    office.cvStatus
                  )}`}
                >
                  <span className="opacity-75">קו״ח:</span>
                  {office.cvStatus}
                </span>
              )}
              {office.emailStatus && (
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold ${getEmailBadgeClasses(
                    office.emailStatus
                  )}`}
                >
                  <span className="opacity-75">מייל:</span>
                  {office.emailStatus}
                </span>
              )}
              {office.tourStatus && (
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold ${getTourBadgeClasses(
                    office.tourStatus
                  )}`}
                >
                  <span className="opacity-75">סיור:</span>
                  {office.tourStatus}
                </span>
              )}
              {office.tourNotesStatus && (
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold ${getTourNotesStatusClasses(
                    office.tourNotesStatus
                  )}`}
                >
                  <span className="opacity-75">הערות מסיור:</span>
                  {office.tourNotesStatus}
                </span>
              )}
            </div>

            {/* Contact / Notes Footer */}
            {(office.primaryContact || previewNote) && (
              <div className="mt-2.5 space-y-1 border-t border-slate-100 pt-2 text-[11px]">
                {office.primaryContact && (
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                    <span className="truncate font-medium" dir="auto">
                      {office.primaryContact}
                    </span>
                  </div>
                )}
                {previewNote && (
                  <div className="flex items-start gap-1.5 text-slate-500">
                    <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <p className="line-clamp-2">{previewNote}</p>
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
