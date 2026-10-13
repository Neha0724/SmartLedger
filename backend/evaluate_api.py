import argparse
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)

ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = ROOT / "backend/data/raw/voucher_test_cases.csv"
LOG_DIR = ROOT / "backend/logs"
API_URL = "http://127.0.0.1:8000/api/predict"

ALIASES = {
    "Purchase Return / Debit Note": "Purchase Return/Debit Note",
    "Sales Return / Credit Note": "Sales Return/Credit Note",
    "Salary / Payroll": "Salary/Payroll",
    "Job Work In Order": "Job Work In",
    "Job Work Out Order": "Job Work Out",
}

def call_api(transaction):
    payload = json.dumps(
        {"transaction": transaction},
        default=str,
    ).encode("utf-8")

    request = urllib.request.Request(
        API_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=300) as response:
        result = json.loads(response.read().decode("utf-8"))

    if not result.get("success") or "prediction" not in result:
        raise ValueError(f"Unexpected API response: {result}")

    return result["prediction"]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Number of rows to evaluate; 0 means all rows.",
    )
    args = parser.parse_args()

    if not DATA_FILE.exists():
        raise SystemExit(f"Dataset not found: {DATA_FILE}")

    LOG_DIR.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(DATA_FILE)
    label_col = "Voucher Category"

    if label_col not in df.columns:
        raise SystemExit(
            f"Label column '{label_col}' not found. "
            f"Available columns: {df.columns.tolist()}"
        )

    if args.limit > 0:
        df = df.head(args.limit)

    total = len(df)
    records = []
    start = time.time()

    print(f"Dataset: {DATA_FILE}")
    print(f"Records to evaluate: {total}")
    print(f"API: {API_URL}")
    print("Starting Qwen evaluation...\n", flush=True)

    for position, (_, row) in enumerate(df.iterrows(), start=1):
        raw_label = str(row[label_col]).strip()
        actual = ALIASES.get(raw_label, raw_label)

        transaction = {
            str(column): value
            for column, value in row.items()
            if column != label_col
            and pd.notna(value)
            and str(value).strip()
        }

        try:
            prediction = call_api(transaction)
            predicted = prediction.get("category", "UNKNOWN")

            records.append({
                "row": position,
                "actual": actual,
                "model_category": prediction.get("model_category"),
                "predicted": predicted,
                "correct": actual == predicted,
                "model_correct": (
                    actual == prediction.get("model_category")
                    if prediction.get("model_category") else None
                ),
                "decision_source": prediction.get("decision_source"),
                "evidence_override": prediction.get("evidence_override"),
                "needs_review": prediction.get("needs_review"),
                "reasoning": prediction.get("reasoning", ""),
                "evidence_candidates": json.dumps(
                    prediction.get("evidence", {}).get("candidates", []),
                    ensure_ascii=False,
                ),
                "error": "",
            })

        except Exception as exc:
            records.append({
                "row": position,
                "actual": actual,
                "model_category": None,
                "predicted": "API_ERROR",
                "correct": False,
                "model_correct": None,
                "decision_source": None,
                "evidence_override": None,
                "needs_review": True,
                "reasoning": "",
                "evidence_candidates": "",
                "error": f"{type(exc).__name__}: {exc}",
            })

        elapsed = time.time() - start
        done = len(records)
        errors = sum(r["predicted"] == "API_ERROR" for r in records)

        print(
            f"\rProgress: {done}/{total} | "
            f"API failures: {errors} | "
            f"Elapsed: {elapsed / 60:.1f} min",
            end="",
            flush=True,
        )

    print("\n\nEvaluation finished.")

    results = pd.DataFrame(records)
    predictions_path = LOG_DIR / "qwen_evaluation_predictions.csv"
    results.to_csv(predictions_path, index=False)

    successful = results[results["predicted"] != "API_ERROR"].copy()
    failed = results[results["predicted"] == "API_ERROR"].copy()

    report_path = LOG_DIR / "qwen_evaluation_report.txt"
    confusion_path = LOG_DIR / "qwen_confusion_matrix.csv"
    errors_path = LOG_DIR / "qwen_misclassified.csv"

    lines = [
        "SMARTLEDGER QWEN API EVALUATION",
        "=" * 40,
        f"Dataset records requested: {total}",
        f"Successful API responses: {len(successful)}",
        f"API failures: {len(failed)}",
        f"Total elapsed time: {(time.time() - start) / 60:.2f} minutes",
        "",
    ]

    if not successful.empty:
        y_true = successful["actual"]
        y_pred = successful["predicted"]

        accuracy = accuracy_score(y_true, y_pred)
        macro_f1 = f1_score(
            y_true, y_pred, average="macro", zero_division=0
        )

        lines.extend([
            "FINAL API PREDICTION",
            f"Accuracy: {accuracy:.4f}",
            f"Macro F1: {macro_f1:.4f}",
            "",
        ])

        raw = successful[
            successful["model_category"].notna()
            & (successful["model_category"].astype(str).str.strip() != "")
        ]

        if not raw.empty:
            raw_accuracy = accuracy_score(
                raw["actual"], raw["model_category"]
            )
            raw_macro_f1 = f1_score(
                raw["actual"], raw["model_category"],
                average="macro", zero_division=0
            )
            lines.extend([
                "RAW QWEN MODEL PREDICTION",
                f"Records with raw model output: {len(raw)}",
                f"Accuracy: {raw_accuracy:.4f}",
                f"Macro F1: {raw_macro_f1:.4f}",
                "",
            ])
        else:
            lines.extend([
                "RAW QWEN MODEL PREDICTION",
                "Unavailable: API did not return model_category.",
                "",
            ])

        overrides = successful["evidence_override"].fillna(False).astype(bool)
        review = successful["needs_review"].fillna(False).astype(bool)
        lines.extend([
            "EVIDENCE AND REVIEW SUMMARY",
            f"Evidence overrides: {int(overrides.sum())}",
            f"Flagged for human review: {int(review.sum())}",
            f"Review rate: {review.mean():.2%}",
            "",
        ])

        lines.extend([
            "METRICS ON SUCCESSFUL API RESPONSES",
            f"Accuracy: {accuracy:.4f}",
            f"Macro F1: {macro_f1:.4f}",
            "",
            "CLASSIFICATION REPORT",
            classification_report(
                y_true, y_pred, zero_division=0
            ),
        ])

        labels = sorted(set(y_true) | set(y_pred))
        matrix = confusion_matrix(y_true, y_pred, labels=labels)
        pd.DataFrame(
            matrix, index=labels, columns=labels
        ).rename_axis("actual").to_csv(confusion_path)

    else:
        lines.append("No successful predictions; metrics unavailable.")

    misclassified = results[
        (results["predicted"] == "API_ERROR")
        | (results["actual"] != results["predicted"])
    ]
    misclassified.to_csv(errors_path, index=False)

    if not failed.empty:
        lines.extend([
            "",
            "API FAILURE DETAILS",
            failed[["row", "error"]].to_string(index=False),
        ])

    report = "\n".join(lines)
    report_path.write_text(report, encoding="utf-8")

    print("\n" + report)
    print("\nSaved files:")
    print(f"Predictions: {predictions_path}")
    print(f"Report:      {report_path}")
    print(f"Confusion:   {confusion_path}")
    print(f"Errors:      {errors_path}")

    if not failed.empty:
        print(
            "\nWARNING: API failures are excluded from accuracy/F1. "
            "Check the failure details before interpreting metrics."
        )


if __name__ == "__main__":
    main()
