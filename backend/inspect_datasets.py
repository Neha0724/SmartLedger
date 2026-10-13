from pathlib import Path
import pandas as pd

BASE = Path(__file__).resolve().parent
RAW = BASE / "data" / "raw"


def inspect_csv(path):
    print("\n" + "=" * 70)
    print("DATASET 1: VOUCHER TEST CASES")
    print("=" * 70)

    df = pd.read_csv(path)

    print(f"\nShape: {df.shape[0]} rows x {df.shape[1]} columns")
    print(f"Duplicate rows: {df.duplicated().sum()}")
    print("\nColumns:")
    for col in df.columns:
        print(f"  - {col}")

    print("\nMissing values (top 20):")
    missing = df.isna().sum().sort_values(ascending=False)
    print(missing[missing > 0].head(20).to_string() or "None")

    if "Voucher Category" in df.columns:
        print("\nVoucher Category counts:")
        print(df["Voucher Category"].value_counts(dropna=False).to_string())
    else:
        print("\nWARNING: 'Voucher Category' column not found.")

    print("\nSample records (first 3 rows, transposed):")
    print(df.head(3).T.to_string())


def inspect_excel(path):
    print("\n" + "=" * 70)
    print("DATASET 2: TALLY ERP9")
    print("=" * 70)

    sheets = pd.read_excel(path, sheet_name=None)

    print(f"\nTotal sheets: {len(sheets)}")

    for sheet_name, df in sheets.items():
        print("\n" + "-" * 60)
        print(f"Sheet: {sheet_name}")
        print(f"Shape: {df.shape[0]} rows x {df.shape[1]} columns")
        print(f"Duplicate rows: {df.duplicated().sum()}")
        print("Columns:")

        for col in df.columns:
            print(f"  - {col}")

        print("\nFirst 2 rows:")
        print(df.head(2).to_string(index=False, max_cols=12))

        missing = df.isna().sum()
        missing = missing[missing > 0].sort_values(ascending=False)

        if not missing.empty:
            print("\nColumns with most missing values:")
            print(missing.head(10).to_string())


def main():
    csv_path = RAW / "voucher_test_cases.csv"
    excel_path = RAW / "tally_vouchers.xlsx"

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    if not excel_path.exists():
        raise FileNotFoundError(f"Excel file not found: {excel_path}")

    inspect_csv(csv_path)
    inspect_excel(excel_path)


if __name__ == "__main__":
    main()
