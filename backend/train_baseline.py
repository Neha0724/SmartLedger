from pathlib import Path
import json

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

BASE = Path(__file__).resolve().parent
DATA = BASE / "data" / "processed" / "tally_normalized.csv"
MODEL_DIR = BASE / "models"
REPORT_DIR = BASE / "logs"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)

df = pd.read_csv(DATA)
df = df.dropna(subset=["transaction_text", "label"])
df["transaction_text"] = df["transaction_text"].astype(str)
df["label"] = df["label"].astype(str)

X = df["transaction_text"]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.25,
    random_state=42,
    stratify=y,
)

pipeline = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            sublinear_tf=True,
            max_features=50000,
        ),
    ),
    (
        "classifier",
        LogisticRegression(
            max_iter=2000,
            class_weight="balanced",
            random_state=42,
        ),
    ),
])

print(f"Total rows: {len(df)}")
print(f"Train rows: {len(X_train)}")
print(f"Test rows: {len(X_test)}")
print(f"Categories: {y.nunique()}")

print("\nTraining baseline...")
pipeline.fit(X_train, y_train)

predictions = pipeline.predict(X_test)

accuracy = accuracy_score(y_test, predictions)
macro_f1 = f1_score(y_test, predictions, average="macro")
weighted_f1 = f1_score(y_test, predictions, average="weighted")

report = classification_report(
    y_test,
    predictions,
    output_dict=True,
    zero_division=0,
)

print("\n===== HOLDOUT RESULTS =====")
print(f"Accuracy: {accuracy:.4f}")
print(f"Macro F1: {macro_f1:.4f}")
print(f"Weighted F1: {weighted_f1:.4f}")
print("\nPer-category metrics:")
print(classification_report(y_test, predictions, zero_division=0))

labels = sorted(y.unique())
matrix = confusion_matrix(y_test, predictions, labels=labels)

pd.DataFrame(
    matrix, index=labels, columns=labels
).to_csv(REPORT_DIR / "baseline_confusion_matrix.csv")

with open(REPORT_DIR / "baseline_metrics.json", "w") as f:
    json.dump({
        "dataset": str(DATA),
        "split": "stratified 75/25",
        "random_state": 42,
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "categories": labels,
        "accuracy": accuracy,
        "macro_f1": macro_f1,
        "weighted_f1": weighted_f1,
        "per_category": report,
    }, f, indent=2)

# Fit on the full Tally dataset only after the holdout evaluation.
# Keep the evaluation metrics from the untouched holdout above.
print("\nFitting final baseline on all Tally records...")
pipeline.fit(X, y)

model_path = MODEL_DIR / "voucher_baseline.joblib"
joblib.dump(pipeline, model_path)

print(f"\nSaved model: {model_path}")
print(f"Saved metrics: {REPORT_DIR / 'baseline_metrics.json'}")
print(f"Saved confusion matrix: {REPORT_DIR / 'baseline_confusion_matrix.csv'}")
