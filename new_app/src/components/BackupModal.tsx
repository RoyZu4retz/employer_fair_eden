import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  Upload,
  X,
  AlertCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { StorageBackend } from '../types';

interface BackupModalProps {
  open: boolean;
  backend: StorageBackend;
  activeCount: number;
  archivedCount: number;
  onClose: () => void;
  onExportExcel: (includeArchived: boolean) => void;
  onImportExcel: (file: File) => Promise<{ ok: boolean; msg: string }>;
  onExportJSON: () => void;
  onImportJSON: (file: File) => Promise<{ ok: boolean; msg: string }>;
}

export function BackupModal({
  open,
  backend,
  activeCount,
  archivedCount,
  onClose,
  onExportExcel,
  onImportExcel,
  onExportJSON,
  onImportJSON,
}: BackupModalProps) {
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleExcelPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await onImportExcel(file);
    setFeedback(res);
    e.target.value = '';
  };

  const handleJsonPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = await onImportJSON(file);
    setFeedback(res);
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
            <h2 className="text-lg font-extrabold text-slate-900">גיבוי, ייצוא וייבוא אקסל</h2>
            <p className="text-xs text-slate-500">
              {backend === 'local-api'
                ? 'מחובר לשרת המקומי (data/tracker.json + גיבוי אחרון אוטומטי)'
                : 'שמירה אוטומטית בדפדפן (Offline-First)'}
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

        <div className="mb-4 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-[11px] font-semibold text-slate-500">משרדים פעילים</div>
            <div className="mt-0.5 text-xl font-extrabold text-slate-900">{activeCount}</div>
          </div>
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3">
            <div className="text-[11px] font-semibold text-amber-800">בארכיון</div>
            <div className="mt-0.5 text-xl font-extrabold text-amber-950">{archivedCount}</div>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => onExportExcel(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            <FileSpreadsheet className="h-4 w-4" />
            ייצוא משרדים פעילים לאקסל (XLSX)
          </button>

          {archivedCount > 0 && (
            <button
              type="button"
              onClick={() => onExportExcel(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100"
            >
              <FileSpreadsheet className="h-4 w-4" />
              ייצוא כל המשרדים כולל ארכיון (XLSX)
            </button>
          )}

          <button
            type="button"
            onClick={() => excelInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-900 transition hover:bg-indigo-100 active:scale-[0.98]"
          >
            <FileUp className="h-4 w-4" />
            ייבוא / מיזוג מאקסל (ללא דריסת שינויים)
          </button>
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleExcelPick}
          />

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onExportJSON}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              גיבוי JSON
            </button>

            <button
              type="button"
              onClick={() => jsonInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Upload className="h-4 w-4" />
              שחזור JSON
            </button>
            <input
              ref={jsonInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleJsonPick}
            />
          </div>

          {feedback && (
            <div
              className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                feedback.ok
                  ? 'bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200'
                  : 'bg-rose-50 text-rose-800 ring-1 ring-rose-200'
              }`}
            >
              {feedback.ok ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
