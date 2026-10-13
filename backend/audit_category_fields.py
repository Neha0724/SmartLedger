from pathlib import Path
import pandas as pd

BASE = Path(__file__).resolve().parent
INPUT = BASE / "data" / "raw" / "voucher_test_cases.csv"
OUTPUT = BASE / "logs" / "category_field_audit.txt"

df = pd.read_csv(INPUT)
lines = []

for category, group in df.groupby("Voucher Category", dropna=False):
    lines.append(f"\n{'=' * 65}")
    lines.append(f"CATEGORY: {category} | RECORDS: {len(group)}")
    lines.append("=" * 65)

    # A field is considered present when at least one row has a value.
    present_fields = [
        col for col in df.columns
        if col != "Voucher Category" and group[col].notna().any()
    ]

    lines.append("Fields present:")
    lines.extend(f"  - {col}" for col in present_fields)

    # Show example values to distinguish genuinely useful evidence.
    lines.append("Example values:")
    for col in present_fields:
        values = group[col].dropna().astype(str).unique()[:2]
        lines.append(f"  {col}: {'; '.join(values)}")

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text("\n".join(lines), encoding="utf-8")

print(f"Audit saved to: {OUTPUT}")
print(f"Categories inspected: {df['Voucher Category'].nunique()}")
print(f"Total records inspected: {len(df)}")

for category, group in df.groupby("Voucher Category"):
    fields = [
        col for col in df.columns
        if col != "Voucher Category" and group[col].notna().any()
    ]
    print(f"\n{category} ({len(group)} records)")
    print(", ".join(fields))
