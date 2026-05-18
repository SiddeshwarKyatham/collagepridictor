"""
TG EAPCET College Predictor -- Data Cleaner
============================================
Reads all 3 XLSX files from ../datasets/
Cleans, normalizes, and exports JSON files.

Usage:
    python clean.py

Output (saved to ../datasets/):
    - clean_FirstPhase.json
    - clean_SecondPhase.json
    - clean_FinalPhase.json
    - all_cutoffs.json  <-- merged master file
"""

import pandas as pd
import json
import os
import sys

# ---------------------------------------------------------------
# CONFIG -- map exact filename -> (year, phase)
# ---------------------------------------------------------------

DATASETS_DIR = os.path.join(os.path.dirname(__file__), "..", "datasets")
OUTPUT_DIR   = DATASETS_DIR

FILES = [
    {
        "filename": "TGEAPCET_2025_LASTRANKS_FirstPhase.xlsx",
        "year":     2025,
        "phase":    "First",
        "output":   "clean_FirstPhase.json",
    },
    {
        "filename": "TGEAPCET_2025_LASTRANKS_SecondPhase (1).xlsx",
        "year":     2025,
        "phase":    "Second",
        "output":   "clean_SecondPhase.json",
    },
    {
        "filename": "TGEAPCET_2025_FINALPHASE_LASTRANKS.xlsx",
        "year":     2025,
        "phase":    "Final",
        "output":   "clean_FinalPhase.json",
    },
]

CLEAN_COLUMNS = [
    "collegeCode",
    "collegeName",
    "place",
    "district",
    "coEducation",
    "collegeType",
    "branchCode",
    "branchName",
    "oc_boys",
    "oc_girls",
    "bc_a_boys",
    "bc_a_girls",
    "bc_b_boys",
    "bc_b_girls",
    "bc_c_boys",
    "bc_c_girls",
    "bc_d_boys",
    "bc_d_girls",
    "bc_e_boys",
    "bc_e_girls",
    "sc_i_boys",
    "sc_i_girls",
    "sc_ii_boys",
    "sc_ii_girls",
    "sc_iii_boys",
    "sc_iii_girls",
    "st_boys",
    "st_girls",
    "ews_boys",
    "ews_girls",
    "affiliatedTo",
]

RANK_COLUMNS = [
    ("oc_boys",     "OC",      "BOYS"),
    ("oc_girls",    "OC",      "GIRLS"),
    ("bc_a_boys",   "BC_A",    "BOYS"),
    ("bc_a_girls",  "BC_A",    "GIRLS"),
    ("bc_b_boys",   "BC_B",    "BOYS"),
    ("bc_b_girls",  "BC_B",    "GIRLS"),
    ("bc_c_boys",   "BC_C",    "BOYS"),
    ("bc_c_girls",  "BC_C",    "GIRLS"),
    ("bc_d_boys",   "BC_D",    "BOYS"),
    ("bc_d_girls",  "BC_D",    "GIRLS"),
    ("bc_e_boys",   "BC_E",    "BOYS"),
    ("bc_e_girls",  "BC_E",    "GIRLS"),
    ("sc_i_boys",   "SC_I",    "BOYS"),
    ("sc_i_girls",  "SC_I",    "GIRLS"),
    ("sc_ii_boys",  "SC_II",   "BOYS"),
    ("sc_ii_girls", "SC_II",   "GIRLS"),
    ("sc_iii_boys", "SC_III",  "BOYS"),
    ("sc_iii_girls","SC_III",  "GIRLS"),
    ("st_boys",     "ST",      "BOYS"),
    ("st_girls",    "ST",      "GIRLS"),
    ("ews_boys",    "EWS",     "BOYS"),
    ("ews_girls",   "EWS",     "GIRLS"),
]


# ---------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------

def safe_int(value):
    """Convert rank value to int, return None if invalid/missing."""
    try:
        v = str(value).strip().replace(",", "").replace("\n", "")
        if v.lower() in ("", "-", "na", "n/a", "nan", "none", "not allotted"):
            return None
        return int(float(v))
    except (ValueError, TypeError):
        return None


def load_file(filepath):
    """
    Load XLSX. Structure:
      - pandas row 0  = merged title row  (e.g. 'TGEAPCET-2025 LAST RANK...')
      - pandas row 1  = real headers      (Inst Code, Institute Name, ...)
      - pandas row 2+ = data
    header=1 tells pandas to use row index 1 as the column header.
    """
    print("\n[LOADING] " + os.path.basename(filepath))

    df = pd.read_excel(filepath, header=1, dtype=str)

    print("  Raw shape : %d rows x %d cols" % (df.shape[0], df.shape[1]))
    print("  Columns   : " + str(list(df.columns)))

    # Drop fully-empty rows
    df = df.dropna(how="all").reset_index(drop=True)

    # Drop repeated header rows (sometimes the header text reappears)
    first_col = df.columns[0]
    bad_values = {"inst code", "institute code", first_col.strip().lower()}
    df = df[~df[first_col].astype(str).str.strip().str.lower().isin(bad_values)]
    df = df[df[first_col].notna()].reset_index(drop=True)

    print("  After clean: %d rows" % df.shape[0])

    # Rename columns to clean names
    if df.shape[1] != len(CLEAN_COLUMNS):
        print("  WARNING: Column count mismatch: got %d, expected %d" % (df.shape[1], len(CLEAN_COLUMNS)))
        print("  Using best-effort mapping...")
        mapping = dict(zip(df.columns, CLEAN_COLUMNS[:df.shape[1]]))
    else:
        mapping = dict(zip(df.columns, CLEAN_COLUMNS))

    df = df.rename(columns=mapping)
    return df


def normalize(df, year, phase):
    """Wide-format -> long-format: one record per college x branch x category x gender."""
    records = []
    skipped = 0

    for _, row in df.iterrows():
        college_name = str(row.get("collegeName", "")).strip()

        if not college_name or college_name.lower() in ("nan", ""):
            skipped += 1
            continue

        branch_name = str(row.get("branchName", "")).strip().replace("\n", " ").replace("  ", " ")

        base = {
            "year":        year,
            "phase":       phase,
            "collegeCode": str(row.get("collegeCode", "")).strip(),
            "collegeName": college_name,
            "place":       str(row.get("place", "")).strip(),
            "district":    str(row.get("district", "")).strip(),
            "collegeType": str(row.get("collegeType", "")).strip(),
            "coEducation": str(row.get("coEducation", "")).strip(),
            "branchCode":  str(row.get("branchCode", "")).strip(),
            "branchName":  branch_name,
            "affiliatedTo":str(row.get("affiliatedTo", "")).strip(),
        }

        for col, category, gender in RANK_COLUMNS:
            rank = safe_int(row.get(col))
            if rank is None:
                continue
            records.append({**base, "category": category, "gender": gender, "closingRank": rank})

    if skipped:
        print("  Skipped %d blank rows" % skipped)

    return records


def export_json(records, output_path, label):
    """Write records to JSON file."""
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    size_kb = os.path.getsize(output_path) / 1024
    print("  [OK] %s: %d records -> %s (%.1f KB)" % (
        label, len(records), os.path.basename(output_path), size_kb))


def print_summary(records, label):
    colleges  = len(set(r["collegeName"] for r in records))
    branches  = len(set(r["branchName"]  for r in records))
    districts = len(set(r["district"]    for r in records))
    cats      = sorted(set(r["category"] for r in records))

    print("\n  [SUMMARY] %s Phase" % label)
    print("    Records   : %d" % len(records))
    print("    Colleges  : %d" % colleges)
    print("    Branches  : %d" % branches)
    print("    Districts : %d" % districts)
    print("    Categories: " + str(cats))
    print("\n  Sample records (first 3):")
    for r in records[:3]:
        print("    %s | %-28s | %-6s | %-8s %-5s | Rank: %d" % (
            r["collegeCode"], r["collegeName"][:28],
            r["branchCode"], r["category"], r["gender"], r["closingRank"]))


# ---------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------

def main():
    print("=" * 60)
    print("  TG EAPCET Data Cleaner - Phase 1")
    print("=" * 60)

    all_records = []
    errors      = []

    for cfg in FILES:
        filepath = os.path.join(DATASETS_DIR, cfg["filename"])

        if not os.path.exists(filepath):
            print("\n[SKIP] File not found: " + cfg["filename"])
            errors.append(cfg["filename"])
            continue

        try:
            df      = load_file(filepath)
            records = normalize(df, cfg["year"], cfg["phase"])
            print_summary(records, cfg["phase"])

            out = os.path.join(OUTPUT_DIR, cfg["output"])
            export_json(records, out, cfg["phase"])

            all_records.extend(records)

        except Exception as e:
            print("\n[ERROR] " + str(e))
            import traceback
            traceback.print_exc()
            errors.append(cfg["filename"])

    # Merged master file
    if all_records:
        merged_path = os.path.join(OUTPUT_DIR, "all_cutoffs.json")
        export_json(all_records, merged_path, "MERGED ALL PHASES")

        print("\n" + "=" * 60)
        print("  ALL DONE!")
        print("  Total records : %d" % len(all_records))
        print("  Output folder : datasets/")
        print("  Master file   : all_cutoffs.json")
        if errors:
            print("  Skipped files : " + str(errors))
        print("=" * 60)
    else:
        print("\n[FAILED] No records generated. Check your files.")
        sys.exit(1)


if __name__ == "__main__":
    main()
