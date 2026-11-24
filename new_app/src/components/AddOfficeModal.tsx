import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import {
  CV_STATUS_OPTIONS,
  EMAIL_STATUS_OPTIONS,
  LOCATION_FIT_OPTIONS,
  PROFILE_FIT_OPTIONS,
  TOUR_NOTES_STATUS_OPTIONS,
  TOUR_STATUS_OPTIONS,
  VISIT_RELEVANCE_OPTIONS,
  type Office,
} from '../types';
import { createEmptyOffice } from '../utils/officeHelpers';

interface AddOfficeModalProps {
  open: boolean;
  departments: string[];
  onClose: () => void;
  onAdd: (office: Office) => void;
}

export function AddOfficeModal({ open, departments, onClose, onAdd }: AddOfficeModalProps) {
  const [form, setForm] = useState<Office>(() => createEmptyOffice());
  const [error, setError] = useState('');

  if (!open) return null;

  const patch = (next: Partial<Office>) => setForm((prev) => ({ ...prev, ...next }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('יש להזין שם משרד.');
      return;
    }
    onAdd({
      ...form,
      id: `office-manual-${Date.now()}`,
      name: form.name.trim(),
      updatedAt: new Date().toISOString(),
    });
    setForm(createEmptyOffice());
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">הוספת משרד חדש</h2>
            <p className="text-xs text-slate-500">
              ניתן למלא רק שם משרד וסטטוסים בסיסיים ולהשלים פרטים בהמשך
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                שם המשרד *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => {
                  setError('');
                  patch({ name: e.target.value });
                }}
                placeholder="לדוגמה: אגמון עם טולצ'ינסקי"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              />
            </div>

            <SimpleSelect
              label="האם רלוונטי לבקר?"
              value={form.visitRelevance}
              options={VISIT_RELEVANCE_OPTIONS}
              onChange={(visitRelevance) => patch({ visitRelevance })}
            />
            <SimpleSelect
              label="התאמה לפרופיל שלי"
              value={form.profileFit}
              options={PROFILE_FIT_OPTIONS}
              onChange={(profileFit) => patch({ profileFit })}
            />
            <SimpleSelect
              label="הגשת קו״ח"
              value={form.cvStatus}
              options={CV_STATUS_OPTIONS}
              onChange={(cvStatus) => patch({ cvStatus })}
            />
            <SimpleSelect
              label="שליחת מייל"
              value={form.emailStatus}
              options={EMAIL_STATUS_OPTIONS}
              onChange={(emailStatus) => patch({ emailStatus })}
            />
            <SimpleSelect
              label="סיור"
              value={form.tourStatus}
              options={TOUR_STATUS_OPTIONS}
              onChange={(tourStatus) => patch({ tourStatus })}
            />
            <SimpleSelect
              label="הערות מסיור בקובץ (סטטוס)"
              value={form.tourNotesStatus}
              options={TOUR_NOTES_STATUS_OPTIONS}
              onChange={(tourNotesStatus) => patch({ tourNotesStatus })}
            />

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">מחלקה</label>
              <input
                type="text"
                list="departments-datalist"
                value={form.department}
                onChange={(e) => patch({ department: e.target.value })}
                placeholder="בחרי או הקלידי מחלקה..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
              <datalist id="departments-datalist">
                {departments.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">מיקום</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => patch({ location: e.target.value })}
                placeholder="ת״א / ר״ג / הרצליה..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <SimpleSelect
              label="התאמה במיקום"
              value={form.locationFit}
              options={LOCATION_FIT_OPTIONS}
              onChange={(locationFit) => patch({ locationFit })}
            />

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">גודל משרד</label>
              <input
                type="text"
                value={form.firmSize}
                onChange={(e) => patch({ firmSize: e.target.value })}
                placeholder="ענק / גדול / בינוני / בוטיק"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                כתובת / פירוט עירוני
              </label>
              <input
                type="text"
                value={form.addressDetails}
                onChange={(e) => patch({ addressDetails: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                תחומי התמחות עיקריים
              </label>
              <input
                type="text"
                value={form.practiceAreas}
                onChange={(e) => patch({ practiceAreas: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                איש קשר/מייל
              </label>
              <input
                type="text"
                dir="auto"
                value={form.primaryContact}
                onChange={(e) => patch({ primaryContact: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                איש קשר נוסף
              </label>
              <input
                type="text"
                dir="auto"
                value={form.secondaryContact}
                onChange={(e) => patch({ secondaryContact: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                הערות אישיות
              </label>
              <textarea
                rows={2}
                value={form.personalNotes}
                onChange={(e) => patch({ personalNotes: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              הוסף משרד
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SimpleSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
