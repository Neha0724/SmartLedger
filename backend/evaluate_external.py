from pathlib import Path
import json

import joblib
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)

BASE = Path(__file__).resolve().parent

MODEL = BASE / "models" / "voucher_baseline.joblib"
DATA = BASE / "data" / "processed" / "voucher_test_cases_normalized.csv"
OUT = BASE / "logs"

OUT.mkdir(parents=True, exist_ok=True)

model = joblib.load(MODEL)
df = pd.read_csv(DATA).dropna(subset=["transaction_text", "label"])

# Evaluate only categories represented in the Tally training data.
trained_labels = set(model.classes_)
df = df[df["label"].isin(trained_labels)].copy()

if df.empty:
    raise ValueError("No overlapping categories found.")

X = df["transaction_text"].astype(str)
y = df["label"].astype(str)
pred = model.predict(X)

accuracy = accuracy_score(y, pred)
macro_f1 = f1_score(y, pred, average="macro")
weighted_f1 = f1_score(y, pred, average="weighted")

print("===== EXTERNAL CSV DIAGNOSTIC =====")
print("Rows evaluated:", len(df))
print("Categories:", sorted(y.unique()))
print(f"Accuracy: {accuracy:.4f}")
print(f"Macro F1: {macro_f1:.4f}")
print(f"Weighted F1: {weighted_f1:.4f}")
print("\nPer-category report:")
print(classification_report(y, pred, zero_division=0))

results = df[["label", "transaction_text"]].copy()
results["predicted_label"] = pred
results["correct"] = results["label"] == results["predicted_label"]
results.to_csv(OUT / "external_predictions.csv", index=False)

labels = sorted(set(y) | set(pred))
matrix = confusion_matrix(y, pred, labels=labels)
pd.DataFrame(matrix, index=labels, columns=labels).to_csv(
    OUT / "external_confusion_matrix.csv"
)

metrics = {
    "evaluation": "separate CSV diagnostic",
    "rows_evaluated": len(df),
    "categories": sorted(y.unique()),
    "accuracy": accuracy,
    "macro_f1": macro_f1,
    "weighted_f1": weighted_f1,
}
(OUT / "external_metrics.json").write_text(
    json.dumps(metrics, indent=2)
)

print("\nSaved logs/external_predictions.csv")
print("Saved logs/external_metrics.json")
