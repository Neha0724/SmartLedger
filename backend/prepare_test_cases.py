from pathlib import Path
import pandas as pd

BASE = Path(__file__).resolve().parent
RAW = BASE / "data" / "raw"
PROCESSED = BASE / "data" / "processed"

PROCESSED.mkdir(parents=True, exist_ok=True)

INPUT = RAW / "voucher_test_cases.csv"
OUTPUT = PROCESSED / "voucher_test_cases_normalized.csv"
AUDIT = PROCESSED / "test_case_mapping_audit.csv"

LABEL_MAP = {
    "Purchase Order": "Purchase Order",
    "Rejection Out": "Rejection Out",
    "Purchase Return / Debit Note": "Purchase Return/Debit Note",
    "Sales": "Sales",
    "Receipt Note": "Receipt Note",
    "Material Out": "Material Out",
    "Sales Return / Credit Note": "Sales Return/Credit Note",
    "Contra": "Contra",
    "Payment": "Payment",
    "Salary / Payroll": "Salary/Payroll",
    "Purchase": "Purchase",
    "Export": "Export",
    "Job Work Out Order": "Job Work Out",
    "Delivery Note": "Delivery Note",
    "Import": "Import",
    "Rejection In": "Rejection In",
    "Journal": "Journal",
    "Expense": "Expense",
    "Stock Journal": "Stock Journal",
    "Physical Stock": "Physical Stock",
    "Receipt": "Receipt",
    "Job Work In Order": "Job Work In",
    "Material In": "Material In",
    "Sales Order": "Sales Order",
}

df = pd.read_csv(INPUT)

if "Voucher Category" not in df.columns:
    raise ValueError("Missing required column: Voucher Category")

df["label"] = df["Voucher Category"].astype(str).str.strip()
df["canonical_label"] = df["label"].map(LABEL_MAP)

unknown = sorted(
    df.loc[df["canonical_label"].isna(), "label"].unique()
)
if unknown:
    raise ValueError(f"Unmapped labels: {unknown}")

# Keep identifiers out of the model's evidence text.
identifier_fields = {
    "PO Number", "Rejection Note No", "Document Number",
    "Contra ID", "Payment ID", "Reference Number",
    "Journal ID", "Stock Adj ID", "Stock Count ID",
    "Receipt ID", "Export Invoice No", "Import Bill No",
    "JWOO Ref", "JWIO Ref", "Delivery Challan No",
    "GRN Number", "GRN Reference", "Instrument No",
    "Voucher Category", "label", "canonical_label",
}

records = []

for _, row in df.iterrows():
    fields = []

    for column, value in row.items():
        if column in identifier_fields or pd.isna(value):
            continue

        value = str(value).strip()
        if value:
            fields.append(f"{column}: {value}")

    records.append({
        "transaction_text": " | ".join(fields),
        "label": row["canonical_label"],
        "source": "voucher_test_cases",
    })

result = pd.DataFrame(records)
result.to_csv(OUTPUT, index=False)

audit = (
    result["label"]
    .value_counts()
    .rename_axis("canonical_label")
    .reset_index(name="records")
)
audit.to_csv(AUDIT, index=False)

print(f"Rows prepared: {len(result)}")
print(f"Output: {OUTPUT}")
print("\nCanonical category counts:")
print(audit.to_string(index=False))

print("\nCategories in test cases but absent from Tally baseline:")
tally = pd.read_csv(PROCESSED / "tally_normalized.csv")
missing = sorted(set(result["label"]) - set(tally["label"]))
print(missing if missing else "None")
