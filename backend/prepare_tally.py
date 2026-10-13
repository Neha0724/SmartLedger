from pathlib import Path
import pandas as pd

BASE = Path(__file__).resolve().parent
RAW = BASE / "data" / "raw"
PROCESSED = BASE / "data" / "processed"

PROCESSED.mkdir(parents=True, exist_ok=True)

INPUT = RAW / "tally_vouchers.xlsx"
OUTPUT = PROCESSED / "tally_normalized.csv"
AUDIT = PROCESSED / "tally_mapping_audit.csv"

# Only map sheets whose transaction type is clear.
SHEET_LABELS = {
    "Sales": "Sales",
    "Purchases": "Purchase",
    "Receipts": "Receipt",
    "Payments": "Payment",
    "Journal": "Journal",
    "Contra": "Contra",
    "Stock Journals": "Stock Journal",
    "Bills of Entry": "Import",
}

# Identifiers are preserved in the source workbook, but not
# included in model input text.
EXCLUDE_FIELDS = {
    "Voucher No",
    "Date",
}

sheets = pd.read_excel(INPUT, sheet_name=None)

records = []
audit = []

for sheet_name, df in sheets.items():
    if sheet_name not in SHEET_LABELS:
        audit.append({
            "sheet": sheet_name,
            "rows": len(df),
            "decision": "excluded_pending_mapping",
            "reason": (
                "Master/reference sheet or category requires "
                "manual verification"
            ),
        })
        continue

    label = SHEET_LABELS[sheet_name]
    added = 0

    for _, row in df.iterrows():
        fields = []

        for column, value in row.items():
            if column in EXCLUDE_FIELDS or pd.isna(value):
                continue

            value = str(value).strip()
            if not value:
                continue

            fields.append(f"{column}: {value}")

        if not fields:
            continue

        records.append({
            "transaction_text": " | ".join(fields),
            "label": label,
            "source_sheet": sheet_name,
        })
        added += 1

    audit.append({
        "sheet": sheet_name,
        "rows": len(df),
        "decision": "mapped",
        "label": label,
        "rows_exported": added,
        "reason": "Clear transaction sheet mapping",
    })

result = pd.DataFrame(records)
audit_df = pd.DataFrame(audit)

result.to_csv(OUTPUT, index=False)
audit_df.to_csv(AUDIT, index=False)

print("TALLY PREPARATION COMPLETE")
print(f"Rows exported: {len(result)}")
print(f"Output: {OUTPUT}")
print("\nMapped category counts:")
print(result["label"].value_counts().to_string())
print("\nSheet mapping audit:")
print(audit_df.to_string(index=False))
