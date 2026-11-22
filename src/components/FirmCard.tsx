import {
  Award,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Mail,
  MapPin,
  MessageSquareText,
  TrainFront,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { QUICK_TAGS, type Firm, type FirmUserState, type QuickTagId } from '../types';
import {
  getFitBadgeClasses,
  getFloorBadgeClasses,
  getPriorityBadgeClasses,
  getShortCityDistrict,
} from '../utils/firmHelpers';

interface FirmCardProps {
  firm: Firm;
  userState: FirmUserState;
  onToggleCompleted: (firm: Firm) => void;
  onToggleTag: (firmId: string, tagId: QuickTagId) => void;
  onUpdatePartnerContact: (firmId: string, value: string) => void;
  onUpdateNotes: (firmId: string, value: string) => void;
}

export function FirmCard({
  firm,
  userState,
  onToggleCompleted,
  onToggleTag,
  onUpdatePartnerContact,
  onUpdateNotes,
}: FirmCardProps) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const hasPartnerOrNotes =
    userState.partnerContact.trim().length > 0 || userState.notes.trim().length > 0;
  const shortDistrict = getShortCityDistrict(firm);
  const isPrivate = firm.sector === 'private';

  return (
    <article
      data-testid={`firm-card-${firm.id}`}
      className={`animate-card-enter overflow-hidden rounded-2xl border transition-all duration-300 ${
        userState.completed
          ? 'border-emerald-200/80 bg-emerald-50/40 shadow-none'
          : 'border-slate-200/90 bg-white shadow-xs hover:border-slate-300'
      }`}
    >
      <div className="p-3.5">
        {/* Top Row: Large Thumb Checkbox (RTL right side) + Firm Heading & Floor */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            role="checkbox"
            aria-checked={userState.completed}
            aria-label={`סמן את ${firm.name} כהושלם`}
            data-testid={`checkbox-${firm.id}`}
            onClick={() => onToggleCompleted(firm)}
            className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-all active:scale-90 ${
              userState.completed
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                : 'border-slate-300 bg-slate-50 text-transparent hover:border-indigo-400 hover:bg-indigo-50/40'
            }`}
          >
            <Check className="h-6 w-6 stroke-[3]" />
          </button>

          <div className="min-w-0 flex-1">
            {/* Title + Priority */}
            <div className="flex flex-wrap items-start justify-between gap-1.5">
              <h2
                className={`text-[16px] leading-snug font-extrabold ${
                  userState.completed ? 'text-slate-500 line-through decoration-emerald-500/70' : 'text-slate-900'
                }`}
              >
                {firm.name}
              </h2>
              {firm.visitPriority && (
                <span
                  className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] leading-tight ${getPriorityBadgeClasses(
                    firm.visitPriority
                  )}`}
                >
                  {firm.visitPriority}
                </span>
              )}
            </div>

            {/* Floor / Hall Pill + City & Size */}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 font-bold ${getFloorBadgeClasses(
                  firm.floor
                )}`}
              >
                <MapPin className="h-3 w-3 shrink-0" />
                {firm.fairLocation}
              </span>

              {isPrivate && shortDistrict && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  {shortDistrict}
                </span>
              )}

              {firm.sizeCategory && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  <Building2 className="h-3 w-3 text-slate-500" />
                  {firm.sizeCategory}
                </span>
              )}
            </div>

            {/* Private Firm Fit Badges OR Public Practice Area */}
            {isPrivate ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {firm.profileFit && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getFitBadgeClasses(
                      firm.profileFit
                    )}`}
                  >
                    <span>פרופיל:</span>
                    <strong>{firm.profileFit}</strong>
                  </span>
                )}
                {firm.locationFit && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getFitBadgeClasses(
                      firm.locationFit
                    )}`}
                  >
                    <span>מיקום:</span>
                    <strong>{firm.locationFit}</strong>
                  </span>
                )}
              </div>
            ) : (
              firm.practiceAreas && (
                <p className="mt-1.5 text-xs font-medium text-slate-600">{firm.practiceAreas}</p>
              )
            )}
          </div>
        </div>

        {/* Original Excel Prep Note (if any) */}
        {firm.initialNotes && (
          <div className="mt-2.5 flex items-start gap-1.5 rounded-xl border border-amber-200/80 bg-amber-50/70 px-2.5 py-1.5 text-xs text-amber-900">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>
              <strong className="font-semibold">הערת הכנה: </strong>
              {firm.initialNotes}
            </span>
          </div>
        )}

        {/* Quick-Action Status Tags (Direct 1-Tap Multi-Select) */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {QUICK_TAGS.map((tag) => {
            const isSelected = userState.tags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggleTag(firm.id, tag.id)}
                data-testid={`tag-${firm.id}-${tag.id}`}
                aria-pressed={isSelected}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition active:scale-95 ${
                  isSelected ? tag.activeClass : tag.idleClass
                }`}
              >
                {isSelected ? `✓ ${tag.label}` : tag.label}
              </button>
            );
          })}
        </div>

        {/* Compact Preview of Saved Partner Contact / Notes when editor is collapsed */}
        {!notesOpen && hasPartnerOrNotes && (
          <button
            type="button"
            onClick={() => setNotesOpen(true)}
            className="mt-2.5 w-full rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-right text-xs text-slate-700 transition hover:bg-indigo-50"
          >
            {userState.partnerContact.trim() && (
              <div className="flex items-center gap-1.5 font-semibold text-indigo-900">
                <Mail className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                <span className="truncate">{userState.partnerContact}</span>
              </div>
            )}
            {userState.notes.trim() && (
              <p className="mt-0.5 line-clamp-2 text-slate-600">{userState.notes}</p>
            )}
          </button>
        )}

        {/* Bottom Accordion Toggles */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2.5">
          <button
            type="button"
            onClick={() => setNotesOpen((v) => !v)}
            data-testid={`toggle-notes-${firm.id}`}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition active:scale-[0.98] ${
              notesOpen || hasPartnerOrNotes
                ? 'border-indigo-200 bg-indigo-50 text-indigo-800'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <MessageSquareText className="h-3.5 w-3.5 shrink-0" />
            <span>{hasPartnerOrNotes ? 'עריכת הערות ושותף' : 'הערות / שם שותף'}</span>
            {notesOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {isPrivate && (
            <button
              type="button"
              onClick={() => setDetailsOpen((v) => !v)}
              data-testid={`toggle-details-${firm.id}`}
              className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition active:scale-[0.98] ${
                detailsOpen
                  ? 'border-slate-300 bg-slate-800 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="truncate">פרטים נוספים: תחב"צ, Dun's 100 והתמחויות</span>
              {detailsOpen ? (
                <ChevronUp className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Partner Contact & Free-Text Notes Area */}
      {notesOpen && (
        <div className="space-y-2.5 border-t border-indigo-100 bg-indigo-50/40 px-3.5 py-3">
          <div>
            <label
              htmlFor={`partner-${firm.id}`}
              className="mb-1 flex items-center gap-1.5 text-xs font-bold text-indigo-950"
            >
              <Mail className="h-3.5 w-3.5 text-indigo-600" />
              שם / מייל של שותף או איש קשר
            </label>
            <input
              id={`partner-${firm.id}`}
              type="text"
              value={userState.partnerContact}
              onChange={(e) => onUpdatePartnerContact(firm.id, e.target.value)}
              onBlur={(e) => onUpdatePartnerContact(firm.id, e.target.value)}
              placeholder='לדוגמה: עו"ד דנה לוי – dana@firm.co.il'
              className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor={`notes-${firm.id}`}
              className="mb-1 flex items-center justify-between text-xs font-bold text-indigo-950"
            >
              <span className="flex items-center gap-1.5">
                <MessageSquareText className="h-3.5 w-3.5 text-indigo-600" />
                הערות חופשיות מהשיחה בדוכן
              </span>
              <span className="text-[10px] font-medium text-emerald-700">נשמר אוטומטית ✓</span>
            </label>
            <textarea
              id={`notes-${firm.id}`}
              rows={3}
              value={userState.notes}
              onChange={(e) => onUpdateNotes(firm.id, e.target.value)}
              onBlur={(e) => onUpdateNotes(firm.id, e.target.value)}
              placeholder="רשמים מהשיחה, דגשים לראיון, מועד פתיחת מיונים..."
              className="w-full resize-y rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Expandable Details Accordion (Address, Transit, Headcount, Practice Areas, Dun's 100) */}
      {isPrivate && detailsOpen && (
        <div className="space-y-2.5 border-t border-slate-200/80 bg-slate-50/90 px-3.5 py-3 text-xs text-slate-700">
          {firm.addressDetails && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <div>
                <div className="font-bold text-slate-900">כתובת מלאה</div>
                <p className="mt-0.5 leading-relaxed">{firm.addressDetails}</p>
              </div>
            </div>
          )}

          {firm.transitAccess && (
            <div className="flex items-start gap-2">
              <TrainFront className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              <div>
                <div className="font-bold text-slate-900">נגישות תחב"צ</div>
                <p className="mt-0.5 leading-relaxed">{firm.transitAccess}</p>
              </div>
            </div>
          )}

          {firm.headcount && (
            <div className="flex items-start gap-2">
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
              <div>
                <div className="font-bold text-slate-900">גודל משרד (מועסקים / עו"ד)</div>
                <p className="mt-0.5">{firm.headcount}</p>
              </div>
            </div>
          )}

          {firm.practiceAreas && (
            <div className="flex items-start gap-2">
              <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <div className="font-bold text-slate-900">תחומי התמחות עיקריים</div>
                <p className="mt-0.5 leading-relaxed">{firm.practiceAreas}</p>
              </div>
            </div>
          )}

          {firm.dunsRanking && (
            <div className="flex items-start gap-2">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <div className="font-bold text-slate-900">דירוג Dun's 100</div>
                <p className="mt-0.5 leading-relaxed">{firm.dunsRanking}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
