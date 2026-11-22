"""Extract private firms and public bodies from יריד מעסיקים.xlsx into src/data/firmsData.json."""
from __future__ import annotations

import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
XLSX_PATH = ROOT / "יריד מעסיקים.xlsx"
OUT_PATH = ROOT / "src" / "data" / "firmsData.json"

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def col_to_idx(col_str: str) -> int:
    idx = 0
    for ch in col_str:
        idx = idx * 26 + (ord(ch) - ord("A") + 1)
    return idx - 1


def read_sheet_rows(z: zipfile.ZipFile, shared: list[str], sheet_path: str) -> list[list[str]]:
    root = ET.fromstring(z.read(sheet_path))
    rows: list[list[str]] = []
    for row in root.findall(".//m:sheetData/m:row", NS):
        cells: dict[int, str] = {}
        max_col = -1
        for c in row.findall("m:c", NS):
            ref = c.attrib.get("r", "")
            match = re.match(r"([A-Z]+)", ref)
            if not match:
                continue
            ci = col_to_idx(match.group(1))
            max_col = max(max_col, ci)
            t = c.attrib.get("t")
            v = c.find("m:v", NS)
            is_el = c.find("m:is", NS)
            val = ""
            if t == "s" and v is not None and v.text is not None:
                val = shared[int(v.text)]
            elif t == "inlineStr" and is_el is not None:
                val = "".join(x.text or "" for x in is_el.findall(".//m:t", NS))
            elif v is not None and v.text is not None:
                val = v.text
            cells[ci] = val.strip()
        if max_col >= 0 and any(cells.values()):
            rows.append([cells.get(i, "") for i in range(max_col + 1)])
    return rows


def extract_floor(fair_location: str) -> str:
    for floor in ("קומה 1-", "קומה 2", "קומה 1", "קומה 0"):
        if floor in fair_location:
            return floor
    return "אחר"


def main() -> None:
    if not XLSX_PATH.exists():
        raise FileNotFoundError(f"Excel file not found: {XLSX_PATH}")

    with zipfile.ZipFile(XLSX_PATH) as z:
        ss_root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        shared = [
            "".join(t.text or "" for t in si.findall(".//m:t", NS))
            for si in ss_root.findall("m:si", NS)
        ]

        priv_rows = read_sheet_rows(z, shared, "xl/worksheets/sheet1.xml")
        pub_rows = read_sheet_rows(z, shared, "xl/worksheets/sheet2.xml")

    firms: list[dict[str, str]] = []

    # Sheet 1: Private firms (row 0 is header)
    for idx, row in enumerate(priv_rows[1:], start=1):
        padded = row + [""] * max(0, 14 - len(row))
        name = padded[0]
        if not name:
            continue
        fair_location = padded[1]
        firms.append(
            {
                "id": f"private-{idx:02d}",
                "name": name,
                "fairLocation": fair_location,
                "floor": extract_floor(fair_location),
                "city": padded[2],
                "addressDetails": padded[3],
                "transitAccess": padded[4],
                "locationFit": padded[5],
                "sizeCategory": padded[6],
                "headcount": padded[7],
                "practiceAreas": padded[8],
                "dunsRanking": padded[9],
                "profileFit": padded[10],
                "fairStatus": padded[11],
                "initialNotes": padded[12],
                "visitPriority": padded[13],
                "sector": "private",
            }
        )

    # Sheet 2: Public bodies (row 0 is title, row 1 is header, last row is summary total)
    pub_idx = 0
    for row in pub_rows[2:]:
        padded = row + [""] * max(0, 4 - len(row))
        name = padded[0]
        if not name or name.startswith('סה"כ'):
            continue
        pub_idx += 1
        fair_location = padded[1] or "קומה 0, חלל מרכזי"
        firms.append(
            {
                "id": f"public-{pub_idx:02d}",
                "name": name,
                "fairLocation": fair_location,
                "floor": extract_floor(fair_location),
                "city": "גוף ציבורי / ממשלתי",
                "addressDetails": "",
                "transitAccess": "",
                "locationFit": "",
                "sizeCategory": "גוף ציבורי",
                "headcount": "",
                "practiceAreas": padded[2],
                "dunsRanking": "",
                "profileFit": "",
                "fairStatus": "טרם ביקרתי",
                "initialNotes": padded[3],
                "visitPriority": "",
                "sector": "public",
            }
        )

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(firms, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    priv_count = sum(1 for f in firms if f["sector"] == "private")
    pub_count = sum(1 for f in firms if f["sector"] == "public")
    print(f"Wrote {len(firms)} total entries ({priv_count} private, {pub_count} public) to {OUT_PATH}")


if __name__ == "__main__":
    main()
