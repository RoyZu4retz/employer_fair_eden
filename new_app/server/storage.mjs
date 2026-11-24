import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '..');
export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const TRACKER_PATH = path.join(DATA_DIR, 'tracker.json');
export const BACKUP_PATH = path.join(DATA_DIR, 'tracker.backup.json');
export const EXCEL_PATH = path.join(DATA_DIR, 'offices.xlsx');
export const SEED_PATH = path.join(ROOT_DIR, 'src', 'data', 'initialOffices.json');

export const EXCEL_SHEET_NAME = 'משרדים פרטיים';

export const EXCEL_COLUMNS = [
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

export const FREE_TOUR_NOTES_HEADER = 'הערות מסיור';

function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function slugifyOfficeId(name, index = 0) {
  const clean = normalizeText(name)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return clean ? `office-${clean}` : `office-${Date.now()}-${index}`;
}

export function normalizeOffice(raw, fallbackIndex = 0) {
  const now = new Date().toISOString();
  const name = normalizeText(raw?.name);
  return {
    id: normalizeText(raw?.id) || slugifyOfficeId(name, fallbackIndex),
    name,
    location: normalizeText(raw?.location),
    addressDetails: normalizeText(raw?.addressDetails),
    transitAccess: normalizeText(raw?.transitAccess),
    locationFit: normalizeText(raw?.locationFit),
    firmSize: normalizeText(raw?.firmSize),
    headcount: normalizeText(raw?.headcount),
    practiceAreas: normalizeText(raw?.practiceAreas),
    dunsRanking: normalizeText(raw?.dunsRanking),
    profileFit: normalizeText(raw?.profileFit),
    visitRelevance: normalizeText(raw?.visitRelevance),
    cvStatus: normalizeText(raw?.cvStatus),
    emailStatus: normalizeText(raw?.emailStatus),
    department: normalizeText(raw?.department),
    tourStatus: normalizeText(raw?.tourStatus),
    tourNotesStatus: normalizeText(raw?.tourNotesStatus),
    tourFreeNotes: normalizeText(raw?.tourFreeNotes),
    primaryContact: normalizeText(raw?.primaryContact),
    secondaryContact: normalizeText(raw?.secondaryContact),
    personalNotes: normalizeText(raw?.personalNotes),
    archived: Boolean(raw?.archived),
    updatedAt: raw?.updatedAt || now,
  };
}

export function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadSeedOffices() {
  if (!fs.existsSync(SEED_PATH)) return [];
  const raw = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
  return Array.isArray(raw) ? raw.map((item, idx) => normalizeOffice(item, idx)) : [];
}

export function readTrackerData() {
  ensureDataDir();
  if (!fs.existsSync(TRACKER_PATH)) {
    const initial = {
      version: 1,
      updatedAt: new Date().toISOString(),
      departments: [],
      offices: loadSeedOffices(),
    };
    writeTrackerDataAtomic(initial);
    return initial;
  }

  const parsed = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf8'));
  const offices = Array.isArray(parsed?.offices)
    ? parsed.offices.map((o, idx) => normalizeOffice(o, idx))
    : [];
  const departments = Array.isArray(parsed?.departments)
    ? Array.from(new Set(parsed.departments.map(normalizeText).filter(Boolean)))
    : [];

  return {
    version: parsed?.version || 1,
    updatedAt: parsed?.updatedAt || new Date().toISOString(),
    departments,
    offices,
  };
}

/**
 * Atomic write:
 * 1. Copies current tracker.json to tracker.backup.json (last automatic backup)
 * 2. Writes new JSON to tracker.json.tmp
 * 3. Atomically replaces tracker.json with renameSync
 */
export function writeTrackerDataAtomic(payload) {
  ensureDataDir();
  const normalized = {
    version: 1,
    updatedAt: new Date().toISOString(),
    departments: Array.from(
      new Set(
        [
          ...(Array.isArray(payload?.departments) ? payload.departments : []),
          ...(Array.isArray(payload?.offices) ? payload.offices.map((o) => o?.department) : []),
        ]
          .map(normalizeText)
          .filter(Boolean)
      )
    ),
    offices: Array.isArray(payload?.offices)
      ? payload.offices.map((o, idx) => normalizeOffice(o, idx))
      : [],
  };

  if (fs.existsSync(TRACKER_PATH)) {
    fs.copyFileSync(TRACKER_PATH, BACKUP_PATH);
  }

  const tmpPath = `${TRACKER_PATH}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(normalized, null, 2), 'utf8');
  fs.renameSync(tmpPath, TRACKER_PATH);
  return normalized;
}

/**
 * Parses an Excel buffer or file path into normalized office records.
 */
export function parseExcelWorkbook(workbook) {
  const sheetName = workbook.SheetNames.includes(EXCEL_SHEET_NAME)
    ? EXCEL_SHEET_NAME
    : workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('לא נמצא גיליון בקובץ האקסל.');
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const headerLookup = (row, ...candidates) => {
    for (const candidate of candidates) {
      if (Object.prototype.hasOwnProperty.call(row, candidate)) {
        return normalizeText(row[candidate]);
      }
    }
    const keys = Object.keys(row);
    for (const candidate of candidates) {
      const normalizedCand = candidate.replace(/["״׳']/g, '').trim();
      const matched = keys.find(
        (k) => k.replace(/["״׳']/g, '').trim() === normalizedCand
      );
      if (matched) return normalizeText(row[matched]);
    }
    return '';
  };

  const offices = [];
  rows.forEach((row, idx) => {
    const name = headerLookup(row, 'שם המשרד');
    if (!name) return;

    const hasExplicitStatusCol = Object.keys(row).some((k) =>
      k.trim().includes('הערות מסיור בקובץ')
    );
    const tourNotesStatus = hasExplicitStatusCol
      ? headerLookup(row, 'הערות מסיור בקובץ')
      : headerLookup(row, 'הערות מסיור');

    const tourFreeNotes = hasExplicitStatusCol
      ? headerLookup(row, FREE_TOUR_NOTES_HEADER, 'הערות מסיור (טקסט חופשי)')
      : '';

    offices.push(
      normalizeOffice(
        {
          name,
          location: headerLookup(row, 'מיקום'),
          addressDetails: headerLookup(row, 'כתובת / פירוט עירוני'),
          transitAccess: headerLookup(row, 'נגישות לתחב״צ', 'נגישות לתחב"צ'),
          locationFit: headerLookup(row, 'התאמה במיקום'),
          firmSize: headerLookup(row, 'גודל משרד'),
          headcount: headerLookup(row, 'גודל משרד (עו״ד/עובדים)', 'גודל משרד (עו"ד/עובדים)'),
          practiceAreas: headerLookup(row, 'תחומי התמחות עיקריים'),
          dunsRanking: headerLookup(
            row,
            "דירוג Dun's 100 (ליטיגציה, M&A, סביבה, הייטק, שוק ההון, מסחרי)",
            "דירוג Dun's 100"
          ),
          profileFit: headerLookup(row, 'התאמה לפרופיל שלי'),
          visitRelevance: headerLookup(row, 'האם רלוונטי לבקר?'),
          cvStatus: headerLookup(row, 'הגשת קו״ח', 'הגשת קו"ח'),
          emailStatus: headerLookup(row, 'שליחת מייל'),
          department: headerLookup(row, 'מחלקה'),
          tourStatus: headerLookup(row, 'סיור'),
          tourNotesStatus,
          tourFreeNotes,
          primaryContact: headerLookup(row, 'איש קשר/מייל'),
          secondaryContact: headerLookup(row, 'איש קשר נוסף'),
          personalNotes: headerLookup(row, 'הערות אישיות'),
          archived: false,
        },
        idx
      )
    );
  });

  return offices;
}

/**
 * Non-destructive merge:
 * - Matches offices by trimmed `name` (`שם המשרד`).
 * - Updates read-only office info fields from Excel when present.
 * - NEVER overwrites user-filled tracking fields in existing tracker.json.
 * - Preserves unknown values verbatim.
 */
export function mergeImportedOffices(existingOffices, importedOffices) {
  const byName = new Map(
    existingOffices.map((o) => [normalizeText(o.name), { ...o }])
  );

  let added = 0;
  let updated = 0;

  const readOnlyKeys = EXCEL_COLUMNS.filter((c) => !c.editable && c.key !== 'name').map(
    (c) => c.key
  );
  const editableKeys = [
    ...EXCEL_COLUMNS.filter((c) => c.editable).map((c) => c.key),
    'tourFreeNotes',
  ];

  for (const incoming of importedOffices) {
    const key = normalizeText(incoming.name);
    if (!key) continue;

    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, incoming);
      added += 1;
    } else {
      const merged = { ...existing };
      for (const field of readOnlyKeys) {
        if (incoming[field]) {
          merged[field] = incoming[field];
        }
      }
      for (const field of editableKeys) {
        if (!normalizeText(merged[field]) && normalizeText(incoming[field])) {
          merged[field] = incoming[field];
        }
      }
      merged.updatedAt = new Date().toISOString();
      byName.set(key, merged);
      updated += 1;
    }
  }

  return {
    offices: Array.from(byName.values()),
    added,
    updated,
  };
}

export function buildExcelBuffer(offices) {
  const rows = offices.map((office) => {
    const row = {};
    for (const col of EXCEL_COLUMNS) {
      row[col.header] = office[col.key] ?? '';
    }
    row[FREE_TOUR_NOTES_HEADER] = office.tourFreeNotes ?? '';
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [...EXCEL_COLUMNS.map((c) => c.header), FREE_TOUR_NOTES_HEADER],
  });
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
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
