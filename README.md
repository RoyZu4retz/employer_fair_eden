# Reichman Law Fair 2026 – Internship 2028 Tracker

Mobile-first, Hebrew RTL web application built for tracking private law firms (59) and public legal bodies (29) live on an iPhone during the Reichman University Law Career Fair.

## Features
- **Smart Auto-Sorting Checklist:** Large thumb-friendly checkbox moves completed firms into a collapsible **"הושלמו / עברתי בדוכן"** section at the bottom (with instant Undo toast).
- **One-Tap Status Tags & Live Notes:** 6 multi-select quick-action tags, plus expandable partner name/email and free-text notes fields saved automatically on every keystroke.
- **Offline-First Persistence (`localStorage`):** All progress, tags, contacts, and notes survive page refreshes and exhibition-hall signal drops.
- **Floor & Priority Filtering:** Instant search + horizontal scrollable filters for Sector (`משרדים פרטיים` / `גופים ציבוריים`), Floor (`קומה 2`, `קומה 1`, `קומה 0`, `קומה 1-`), Profile Fit, Location Fit, Visit Priority, and Status.
- **Details Accordion:** Reveals exact street address, public transit directions, firm size/headcount, practice areas, and Dun's 100 ranking on demand.
- **Backup & Export:** Settings drawer includes full JSON backup/restore, Hebrew-compatible CSV export (UTF-8 BOM for Excel), and 2-step Reset.

## Running Locally & Opening on iPhone (Same Wi-Fi)

```bash
npm install
npm run dev -- --host
```

1. Ensure your computer and iPhone are connected to the **same Wi-Fi network**.
2. Vite will print both a **Local** URL (`http://localhost:5173`) and a **Network** URL (e.g., `http://10.0.0.6:5173`).
3. Open the **Network** URL in Safari on your iPhone.
4. *(Optional)* Tap Safari's **Share** button → **Add to Home Screen** to use it like a native app during the fair.

## Updating Firm Data from Excel
To re-extract `src/data/firmsData.json` from `יריד מעסיקים.xlsx`:

```bash
python scripts/extract_firms.py
```
