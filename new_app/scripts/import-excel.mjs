import fs from 'node:fs';
import XLSX from 'xlsx';
import {
  EXCEL_PATH,
  TRACKER_PATH,
  mergeImportedOffices,
  parseExcelWorkbook,
  readTrackerData,
  writeTrackerDataAtomic,
} from '../server/storage.mjs';

function main() {
  const customPath = process.argv[2] || EXCEL_PATH;

  if (!fs.existsSync(customPath)) {
    console.error(`לא נמצא קובץ אקסל בנתיב: ${customPath}`);
    console.error('יש למקם את קובץ האקסל בתיקיית data/ בשם offices.xlsx ולהריץ שוב npm run import.');
    process.exit(1);
  }

  const workbook = XLSX.readFile(customPath);
  const imported = parseExcelWorkbook(workbook);

  const existing = fs.existsSync(TRACKER_PATH)
    ? readTrackerData()
    : { version: 1, departments: [], offices: [] };

  const { offices, added, updated } = mergeImportedOffices(existing.offices, imported);

  const saved = writeTrackerDataAtomic({
    version: 1,
    departments: existing.departments,
    offices,
  });

  console.log(`הייבוא הושלם בהצלחה מתוך: ${customPath}`);
  console.log(`נוספו ${added} משרדים חדשים, עודכנו ${updated} משרדים קיימים (ללא דריסת שדות שמילאת).`);
  console.log(`סה״כ משרדים בקובץ data/tracker.json: ${saved.offices.length}`);
}

main();
