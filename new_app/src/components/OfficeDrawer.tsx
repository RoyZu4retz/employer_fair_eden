import {
  AlertTriangle,
  Archive,
  ArchiveRestore,
  Award,
  Briefcase,
  Building2,
  Check,
  Edit3,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  Plus,
  Sparkles,
  TrainFront,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CV_STATUS_OPTIONS,
  EMAIL_STATUS_OPTIONS,
  LOCATION_FIT_OPTIONS,
  PROFILE_FIT_OPTIONS,
  TOUR_NOTES_STATUS_OPTIONS,
  TOUR_STATUS_OPTIONS,
  VISIT_RELEVANCE_OPTIONS,
  type Office,
  type SaveStatus,
} from '../types';
import {
  buildSelectOptions,
  extractEmailAddress,
  getFitBadgeClasses,
  getVisitRelevanceClasses,
} from '../utils/officeHelpers';

interface OfficeDrawerProps {
  office: Office | null;
  departments: string[];
  saveStatus: SaveStatus;
  onClose: () => void;
  onUpdate: (officeId: string, patch: Partial<Office>) => void;
  onAddDepartment: (deptName: string) => void;
  onArchiveToggle: (officeId: string, archived: boolean) => void;
  onDeletePermanent: (officeId: string) => void;
}

export function OfficeDrawer({
  office,
  departments,
  saveStatus,
  onClose,
  onUpdate,
  onAddDepartment,
  onArchiveToggle,
  onDeletePermanent,
}: OfficeDrawerProps) {
  const [newDeptInput, setNewDeptInput] = useState('');
  const [showAddDept, setShowAddDept] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setNewDeptInput('');
    setShowAddDept(false);
    setEditingInfo(false);
    setConfirmDelete(false);
  }, [office?.id]);

  useEffect(() => {
    if (!office) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [office, onClose]);

  if (!office) return null;

  const visitOptions = buildSelectOptions(VISIT_RELEVANCE_OPTIONS, office.visitRelevance);
  const profileOptions = buildSelectOptions(PROFILE_FIT_OPTIONS, office.profileFit);
  const cvOptions = buildSelectOptions(CV_STATUS_OPTIONS, office.cvStatus);
  const emailOptions = buildSelectOptions(EMAIL_STATUS_OPTIONS, office.emailStatus);
  const tourOptions = buildSelectOptions(TOUR_STATUS_OPTIONS, office.tourStatus);
  const tourNotesOptions = buildSelectOptions(
    TOUR_NOTES_STATUS_OPTIONS,
    office.tourNotesStatus
  );
  const locationFitOptions = buildSelectOptions(LOCATION_FIT_OPTIONS, office.locationFit);
  const departmentOptions = buildSelectOptions(departments, office.department);

  const primaryMail = extractEmailAddress(office.primaryContact);
  const secondaryMail = extractEmailAddress(office.secondaryContact);

  const handleSaveNewDepartment = () => {
    const clean = newDeptInput.trim();
    if (!clean) return;
    onAddDepartment(clean);
    onUpdate(office.id, { department: clean });
    setNewDeptInput('');
    setShowAddDept(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/55 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`כרטיס משרד: ${office.name}`}
        className="animate-drawer-enter flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Drawer Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-900 px-4 py-3.5 text-white sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold leading-snug text-white sm:text-lg">
                {office.name}
              </h2>
              {office.visitRelevance && (
                <span
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] ${getVisitRelevanceClasses(
                    office.visitRelevance
                  )}`}
                >
                  {office.visitRelevance === 'חובה!!!' && <Sparkles className="h-3 w-3" />}
                  {office.visitRelevance}
                </span>
              )}
              {office.archived && (
                <span className="rounded-lg bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-200 ring-1 ring-amber-400/30">
                  בארכיון
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span>{office.location}</span>
              {office.firmSize && (
                <>
                  <span>•</span>
                  <span>{office.firmSize}</span>
                </>
              )}
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1 text-amber-300">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  שומר...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span
                  data-testid="drawer-saved-indicator"
                  className="inline-flex items-center gap-1 font-bold text-emerald-300"
                >
                  <Check className="h-3.5 w-3.5" />
                  נשמר
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="סגור כרטיס משרד"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-200 ring-1 ring-slate-700 transition hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {/* Editable Tracking Section */}
          <section className="rounded-2xl border border-indigo-200/80 bg-indigo-50/35 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-indigo-950">
                מעקב אישי ועדכון בזמן אמת
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700">
                שמירה אוטומטית בכל שינוי ✓
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Visit Relevance */}
              <SelectField
                id="edit-visitRelevance"
                label="האם רלוונטי לבקר?"
                value={office.visitRelevance}
                options={visitOptions}
                onChange={(visitRelevance) => onUpdate(office.id, { visitRelevance })}
              />

              {/* Profile Fit */}
              <SelectField
                id="edit-profileFit"
                label="התאמה לפרופיל שלי"
                value={office.profileFit}
                options={profileOptions}
                onChange={(profileFit) => onUpdate(office.id, { profileFit })}
              />

              {/* CV Status */}
              <SelectField
                id="edit-cvStatus"
                label="הגשת קו״ח"
                value={office.cvStatus}
                options={cvOptions}
                onChange={(cvStatus) => onUpdate(office.id, { cvStatus })}
              />

              {/* Email Status */}
              <SelectField
                id="edit-emailStatus"
                label="שליחת מייל"
                value={office.emailStatus}
                options={emailOptions}
                onChange={(emailStatus) => onUpdate(office.id, { emailStatus })}
              />

              {/* Tour Status */}
              <SelectField
                id="edit-tourStatus"
                label="סיור"
                value={office.tourStatus}
                options={tourOptions}
                onChange={(tourStatus) => onUpdate(office.id, { tourStatus })}
              />

              {/* Tour Notes Status (from Excel column) */}
              <SelectField
                id="edit-tourNotesStatus"
                label="הערות מסיור בקובץ (סטטוס)"
                value={office.tourNotesStatus}
                options={tourNotesOptions}
                onChange={(tourNotesStatus) => onUpdate(office.id, { tourNotesStatus })}
              />
            </div>

            {/* Department Selector + Add New Department */}
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="edit-department"
                  className="text-xs font-bold text-slate-700"
                >
                  מחלקה
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddDept((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-800 hover:bg-indigo-200"
                >
                  <Plus className="h-3 w-3" />
                  הוספת מחלקה חדשה
                </button>
              </div>

              <select
                id="edit-department"
                value={office.department}
                onChange={(e) => onUpdate(office.id, { department: e.target.value })}
                className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              >
                <option value="">— ללא מחלקה נבחרת —</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {showAddDept && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={newDeptInput}
                    onChange={(e) => setNewDeptInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveNewDepartment();
                      }
                    }}
                    placeholder="לדוגמה: הייטק, ליטיגציה מסחרית, M&A..."
                    className="flex-1 rounded-xl border border-indigo-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNewDepartment}
                    className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                  >
                    הוסף ושמור
                  </button>
                </div>
              )}
            </div>

            {/* Contacts */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="edit-primaryContact"
                  className="mb-1 flex items-center justify-between text-xs font-bold text-slate-700"
                >
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-indigo-600" />
                    איש קשר/מייל
                  </span>
                  {primaryMail && (
                    <a
                      href={`mailto:${primaryMail}`}
                      className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      פתח במייל
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </label>
                <input
                  id="edit-primaryContact"
                  type="text"
                  dir="auto"
                  value={office.primaryContact}
                  onChange={(e) => onUpdate(office.id, { primaryContact: e.target.value })}
                  placeholder="שם או כתובת מייל..."
                  className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-secondaryContact"
                  className="mb-1 flex items-center justify-between text-xs font-bold text-slate-700"
                >
                  <span className="inline-flex items-center gap-1">
                    <UserPlus className="h-3.5 w-3.5 text-indigo-600" />
                    איש קשר נוסף
                  </span>
                  {secondaryMail && (
                    <a
                      href={`mailto:${secondaryMail}`}
                      className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      פתח במייל
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </label>
                <input
                  id="edit-secondaryContact"
                  type="text"
                  dir="auto"
                  value={office.secondaryContact}
                  onChange={(e) =>
                    onUpdate(office.id, { secondaryContact: e.target.value })
                  }
                  placeholder="איש קשר נוסף / מגייסת / שותף..."
                  className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Separate Free-Text Field: הערות מסיור */}
            <div className="mt-3">
              <label
                htmlFor="edit-tourFreeNotes"
                className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-700"
              >
                <MessageSquareText className="h-3.5 w-3.5 text-emerald-600" />
                הערות מסיור (טקסט חופשי)
              </label>
              <textarea
                id="edit-tourFreeNotes"
                rows={3}
                value={office.tourFreeNotes}
                onChange={(e) => onUpdate(office.id, { tourFreeNotes: e.target.value })}
                placeholder="רשמים מהסיור, אווירה במשרד, מי דיבר איתך, שאלות שעלו..."
                className="w-full resize-y rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
            </div>

            {/* Personal Notes */}
            <div className="mt-3">
              <label
                htmlFor="edit-personalNotes"
                className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-700"
              >
                <MessageSquareText className="h-3.5 w-3.5 text-indigo-600" />
                הערות אישיות
              </label>
              <textarea
                id="edit-personalNotes"
                rows={3}
                value={office.personalNotes}
                onChange={(e) => onUpdate(office.id, { personalNotes: e.target.value })}
                placeholder="דגשים לראיון, מועדים, התלבטויות אישיות..."
                className="w-full resize-y rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
            </div>
          </section>

          {/* Read-Mostly Office Info Section */}
          <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900">פרטי המשרד</h3>
              <button
                type="button"
                onClick={() => setEditingInfo((v) => !v)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Edit3 className="h-3.5 w-3.5" />
                {editingInfo ? 'סיים עריכת פרטים' : 'ערוך פרטי משרד'}
              </button>
            </div>

            {!editingInfo ? (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex flex-wrap items-center gap-2">
                  {office.location && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-800 ring-1 ring-slate-200">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                      {office.location}
                    </span>
                  )}
                  {office.locationFit && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-semibold ${getFitBadgeClasses(
                        office.locationFit
                      )}`}
                    >
                      התאמה במיקום: {office.locationFit}
                    </span>
                  )}
                  {office.firmSize && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 font-semibold text-slate-800 ring-1 ring-slate-200">
                      <Building2 className="h-3.5 w-3.5 text-slate-500" />
                      {office.firmSize}
                    </span>
                  )}
                </div>

                {office.addressDetails && (
                  <InfoRow
                    icon={<MapPin className="h-4 w-4 text-slate-500" />}
                    title="כתובת / פירוט עירוני"
                    value={office.addressDetails}
                  />
                )}
                {office.transitAccess && (
                  <InfoRow
                    icon={<TrainFront className="h-4 w-4 text-sky-600" />}
                    title="נגישות לתחב״צ"
                    value={office.transitAccess}
                  />
                )}
                {office.headcount && (
                  <InfoRow
                    icon={<Users className="h-4 w-4 text-indigo-600" />}
                    title="גודל משרד (עו״ד/עובדים)"
                    value={office.headcount}
                  />
                )}
                {office.practiceAreas && (
                  <InfoRow
                    icon={<Briefcase className="h-4 w-4 text-emerald-600" />}
                    title="תחומי התמחות עיקריים"
                    value={office.practiceAreas}
                  />
                )}
                {office.dunsRanking && (
                  <InfoRow
                    icon={<Award className="h-4 w-4 text-amber-600" />}
                    title="דירוג Dun's 100 (ליטיגציה, M&A, סביבה, הייטק, שוק ההון, מסחרי)"
                    value={office.dunsRanking}
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <TextField
                  label="שם המשרד"
                  value={office.name}
                  onChange={(name) => onUpdate(office.id, { name })}
                />
                <TextField
                  label="מיקום"
                  value={office.location}
                  onChange={(location) => onUpdate(office.id, { location })}
                />
                <div className="sm:col-span-2">
                  <TextField
                    label="כתובת / פירוט עירוני"
                    value={office.addressDetails}
                    onChange={(addressDetails) => onUpdate(office.id, { addressDetails })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <TextField
                    label="נגישות לתחב״צ"
                    value={office.transitAccess}
                    onChange={(transitAccess) => onUpdate(office.id, { transitAccess })}
                  />
                </div>
                <SelectField
                  id="edit-locationFit"
                  label="התאמה במיקום"
                  value={office.locationFit}
                  options={locationFitOptions}
                  onChange={(locationFit) => onUpdate(office.id, { locationFit })}
                />
                <TextField
                  label="גודל משרד"
                  value={office.firmSize}
                  onChange={(firmSize) => onUpdate(office.id, { firmSize })}
                />
                <div className="sm:col-span-2">
                  <TextField
                    label="גודל משרד (עו״ד/עובדים)"
                    value={office.headcount}
                    onChange={(headcount) => onUpdate(office.id, { headcount })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <TextField
                    label="תחומי התמחות עיקריים"
                    value={office.practiceAreas}
                    onChange={(practiceAreas) => onUpdate(office.id, { practiceAreas })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <TextField
                    label="דירוג Dun's 100"
                    value={office.dunsRanking}
                    onChange={(dunsRanking) => onUpdate(office.id, { dunsRanking })}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Archive / Restore / Confirmed Delete */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {!office.archived ? (
                <button
                  type="button"
                  onClick={() => {
                    onArchiveToggle(office.id, true);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
                >
                  <Archive className="h-4 w-4" />
                  העברה לארכיון (משרד לא רלוונטי)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onArchiveToggle(office.id, false);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100"
                >
                  <ArchiveRestore className="h-4 w-4" />
                  שחזר למשרדים הפעילים
                </button>
              )}

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                >
                  <Trash2 className="h-4 w-4" />
                  מחיקה סופית
                </button>
              ) : (
                <div className="w-full rounded-xl border border-rose-300 bg-rose-50 p-3">
                  <div className="flex items-start gap-2 text-xs font-semibold text-rose-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                    <span>
                      למחוק לצמיתות את <strong>{office.name}</strong>? לא ניתן לשחזר פעולה זו
                      (אם רק לא רלוונטי, עדיף להעביר לארכיון).
                    </span>
                  </div>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDeletePermanent(office.id);
                        onClose();
                      }}
                      className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                    >
                      כן, מחק לצמיתות
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-slate-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
      >
        <option value="">— בחרי ערך —</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
      />
    </label>
  );
}

function InfoRow({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-white p-2.5 ring-1 ring-slate-200/70">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-bold text-slate-500">{title}</div>
        <p className="mt-0.5 leading-relaxed text-slate-800">{value}</p>
      </div>
    </div>
  );
}
