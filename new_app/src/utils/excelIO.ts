import * as XLSX from 'xlsx';
import type { Office } from '../types';

export const EXCEL_SHEET_NAME = 'משרדים פרטיים';

export const EXCEL_COLUMNS: { key: keyof Office; header: string; editable: boolean }[] = [
  { key: 'name', header: 'שם המשרד', editable: false },
  { key: 'location', header: 'מיקום', editable: false },
  { key: 'addressDetails', header: 'כתובת / פירוט עירוני', editable: false },
  { key: 'transitAccess', header: 'נגישות לתחב״צ', editable: false },
  { key: 'locationFit', header: 'התאמה במיקום', editable: false },
  { key: 'firmSize', header: 'גודל משרד', editable: false },
  { key: 'headcount', header: 'גודל משרד (עו״ד/עובדים)', editable: false },
  { key: 'practiceAreas', header: 'תחומי התמחות עיקריים', editable: false },
  {
    key: 'dunsRanking',
    header: "דירוג Dun's 100 (ליטיגציה, M&A, סביבה, הייטק, שוק ההון, מסחרי)",
    editable: false,
  },
  { key: 'profileFit', header: 'התאמה לפרופיל שלי', editable: true },
  { key: 'visitRelevance', header: 'האם רלוונטי לבקר?', editable: true },
  { key: 'cvStatus', header: 'הגשת קו״ח', editable: true },
  { key: 'emailStatus', header: 'שליחת מייל', editable: true },
  { key: 'department', header: 'מחלקה', editable: true },
  { key: 'tourStatus', header: 'סיור', editable: true },
  { key: 'tourNotesStatus', header: 'הערות מסיור בקובץ', editable: true },
  { key: 'primaryContact', header: 'איש קשר/מייל', editable: true },
  { key: 'secondaryContact', header: 'איש קשר נוסף', editable: true },
  { key: 'personalNotes', header: 'הערות אישיות', editable: true },
];

const FREE_TOUR_NOTES_HEADER = 'הערות מסיור';

function formatStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
}

export function exportOfficesToExcel(offices: Office[], includeArchived = false) {
  const list = includeArchived ? offices : offices.filter((o) => !o.archived);
  const rows = list.map((office) => {
    const row: Record<string, string> = {};
    for (const col of EXCEL_COLUMNS) {
      row[col.header] = String(office[col.key] ?? '');
    }
    row[FREE_TOUR_NOTES_HEADER] = office.tourFreeNotes ?? '';
    return row;
  });

  const headers = [...EXCEL_COLUMNS.map((c) => c.header), FREE_TOUR_NOTES_HEADER];
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  worksheet['!views'] = [{ RTL: true }];
  worksheet['!cols'] = [
    { wch: 28 },
    { wch: 14 },
    { wch: 42 },
    { wch: 44 },
    { wch: 14 },
    { wch: 14 },
    { wch: 26 },
    { wch: 36 },
    { wch: 46 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 26 },
    { wch: 24 },
    { wch: 32 },
    { wch: 32 },
  ];

  const workbook = XLSX.utils.book_new();
  workbook.Workbook = { Views: [{ RTL: true }] };
  XLSX.utils.book_append_sheet(workbook, worksheet, EXCEL_SHEET_NAME);
  XLSX.writeFile(workbook, `מעקב-התמחות-משרדים-${formatStamp()}.xlsx`);
}

function cleanCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

export async function parseExcelFileInBrowser(file: File): Promise<Office[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames.includes(EXCEL_SHEET_NAME)
    ? EXCEL_SHEET_NAME
    : workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('לא נמצא גיליון בקובץ האקסל.');
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  const pick = (row: Record<string, unknown>, ...candidates: string[]) => {
    for (const c of candidates) {
      if (Object.prototype.hasOwnProperty.call(row, c)) return cleanCell(row[c]);
    }
    const keys = Object.keys(row);
    for (const c of candidates) {
      const norm = c.replace(/["״׳']/g, '').trim();
      const found = keys.find((k) => k.replace(/["״׳']/g, '').trim() === norm);
      if (found) return cleanCell(row[found]);
    }
    return '';
  };

  const parsed: Office[] = [];
  rows.forEach((row, idx) => {
    const name = pick(row, 'שם המשרד');
    if (!name) return;

    const hasExplicitStatus = Object.keys(row).some((k) =>
      k.trim().includes('הערות מסיור בקובץ')
    );

    parsed.push({
      id: `office-import-${Date.now()}-${idx}`,
      name,
      location: pick(row, 'מיקום'),
      addressDetails: pick(row, 'כתובת / פירוט עירוני'),
      transitAccess: pick(row, 'נגישות לתחב״צ', 'נגישות לתחב"צ'),
      locationFit: pick(row, 'התאמה במיקום'),
      firmSize: pick(row, 'גודל משרד'),
      headcount: pick(row, 'גודל משרד (עו״ד/עובדים)', 'גודל משרד (עו"ד/עובדים)'),
      practiceAreas: pick(row, 'תחומי התמחות עיקריים'),
      dunsRanking: pick(
        row,
        "דירוג Dun's 100 (ליטיגציה, M&A, סביבה, הייטק, שוק ההון, מסחרי)",
        "דירוג Dun's 100"
      ),
      profileFit: pick(row, 'התאמה לפרופיל שלי'),
      visitRelevance: pick(row, 'האם רלוונטי לבקר?'),
      cvStatus: pick(row, 'הגשת קו״ח', 'הגשת קו"ח'),
      emailStatus: pick(row, 'שליחת מייל'),
      department: pick(row, 'מחלקה'),
      tourStatus: pick(row, 'סיור'),
      tourNotesStatus: hasExplicitStatus
        ? pick(row, 'הערות מסיור בקובץ')
        : pick(row, 'הערות מסיור'),
      tourFreeNotes: hasExplicitStatus
        ? pick(row, FREE_TOUR_NOTES_HEADER, 'הערות מסיור (טקסט חופשי)')
        : '',
      primaryContact: pick(row, 'איש קשר/מייל'),
      secondaryContact: pick(row, 'איש קשר נוסף'),
      personalNotes: pick(row, 'הערות אישיות'),
      archived: false,
      updatedAt: new Date().toISOString(),
    });
  });

  return parsed;
}

/**
 * Non-destructive merge by `שם המשרד` — never overwrites user-filled fields.
 */
export function mergeOfficesNonDestructive(
  existing: Office[],
  incoming: Office[]
): { offices: Office[]; added: number; updated: number } {
  const byName = new Map<string, Office>(existing.map((o) => [o.name.trim(), { ...o }]));
  let added = 0;
  let updated = 0;

  const readOnlyKeys: (keyof Office)[] = [
    'location',
    'addressDetails',
    'transitAccess',
    'locationFit',
    'firmSize',
    'headcount',
    'practiceAreas',
    'dunsRanking',
  ];

  const editableKeys: (keyof Office)[] = [
    'profileFit',
    'visitRelevance',
    'cvStatus',
    'emailStatus',
    'department',
    'tourStatus',
    'tourNotesStatus',
    'tourFreeNotes',
    'primaryContact',
    'secondaryContact',
    'personalNotes',
  ];

  for (const item of incoming) {
    const key = item.name.trim();
    if (!key) continue;
    const prev = byName.get(key);
    if (!prev) {
      byName.set(key, item);
      added += 1;
    } else {
      const next: Office = { ...prev };
      for (const field of readOnlyKeys) {
        const val = String(item[field] ?? '').trim();
        if (val) (next as unknown as Record<string, unknown>)[field] = val;
      }
      for (const field of editableKeys) {
        const curVal = String(next[field] ?? '').trim();
        const incVal = String(item[field] ?? '').trim();
        if (!curVal && incVal) {
          (next as unknown as Record<string, unknown>)[field] = incVal;
        }
      }
      next.updatedAt = new Date().toISOString();
      byName.set(key, next);
      updated += 1;
    }
  }

  return {
    offices: Array.from(byName.values()),
    added,
    updated,
  };
}
