import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Upload,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { Firm, TrackerState } from '../types';
import { hasActiveNotesOrTags } from '../utils/firmHelpers';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  firms: Firm[];
  state: TrackerState;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onImportJSON: (text: string) => { ok: boolean; error?: string };
  onResetAll: () => void;
}

export function SettingsDrawer({
  open,
  onClose,
  firms,
  state,
  onExportJSON,
  onExportCSV,
  onImportJSON,
  onResetAll,
}: SettingsDrawerProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const privateFirms = firms.filter((f) => f.sector === 'private');
  const publicFirms = firms.filter((f) => f.sector === 'public');
  const privateDone = privateFirms.filter((f) => state[f.id]?.completed).length;
  const publicDone = publicFirms.filter((f) => state[f.id]?.completed).length;
  const notedCount = firms.filter((f) => hasActiveNotesOrTags(state[f.id])).length;
  const contactsCount = firms.filter((f) => (state[f.id]?.partnerContact ?? '').trim().length > 0).length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = onImportJSON(text);
    if (res.ok) {
      setImportFeedback({ type: 'ok', msg: 'הגיבוי שוחזר בהצלחה!' });
    } else {
      setImportFeedback({ type: 'err', msg: res.error ?? 'שגיאה בשחזור הקובץ.' });
    }
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-2xl sm:rounded-3xl sm:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">הגדרות וגיבוי נתונים</h2>
            <p className="text-xs text-slate-500">כל הנתונים נשמרים מקומית במכשיר (Offline-First)</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור הגדרות"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[11px] font-semibold text-slate-500">משרדים פרטיים</div>
            <div className="mt-0.5 text-lg font-extrabold text-slate-900">
              {privateDone} / {privateFirms.length}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[11px] font-semibold text-slate-500">גופים ציבוריים</div>
            <div className="mt-0.5 text-lg font-extrabold text-slate-900">
              {publicDone} / {publicFirms.length}
            </div>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3">
            <div className="text-[11px] font-semibold text-indigo-700">עם תגיות / הערות</div>
            <div className="mt-0.5 text-lg font-extrabold text-indigo-950">{notedCount}</div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
            <div className="text-[11px] font-semibold text-emerald-700">אנשי קשר שנאספו</div>
            <div className="mt-0.5 text-lg font-extrabold text-emerald-950">{contactsCount}</div>
          </div>
        </div>

        {/* Export / Import Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={onExportJSON}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            ייצוא גיבוי מלא (JSON)
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 active:scale-[0.98]"
          >
            <FileSpreadsheet className="h-4 w-4" />
            ייצוא טבלה לאקסל (CSV)
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
          >
            <Upload className="h-4 w-4" />
            שחזור מגיבוי JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleFileChange}
          />

          {importFeedback && (
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                importFeedback.type === 'ok'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {importFeedback.msg}
            </div>
          )}
        </div>

        {/* Reset Data Section */}
        <div className="mt-5 border-t border-slate-200 pt-4">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
            >
              <RotateCcw className="h-4 w-4" />
              איפוס כל הנתונים (Reset Data)
            </button>
          ) : (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3">
              <div className="flex items-start gap-2 text-xs font-semibold text-rose-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <span>פעולה זו תמחק את כל הסימונים, התגיות וההערות ששמרת. להמשיך?</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetAll();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-700"
                >
                  כן, אפס הכל
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 rounded-xl border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  ביטול
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
