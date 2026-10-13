
import csv
import io

import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.llm_service import voucher_llm


app = FastAPI(
    title="SmartLedger API",
    description=(
        "Voucher classification using a local Qwen model "
        "and a field-evidence engine."
    ),
    version="0.3.1",
)


class PredictRequest(BaseModel):
    transaction: dict = Field(
        ...,
        description="Structured transaction fields to classify",
    )


class BatchPredictRequest(BaseModel):
    transactions: list[dict] = Field(
        ...,
        min_length=1,
        max_length=200,
        description="List of structured transactions to classify",
    )


def align_prediction_reasoning(result: dict) -> dict:
    """Keep explanations consistent with evidence-based decisions."""
    if not isinstance(result, dict):
        raise ValueError("Classification service returned an invalid result.")

    result = result.copy()

    category = result.get("category")
    model_category = result.get("model_category")
    decision_source = result.get("decision_source")
    evidence_override = result.get("evidence_override", False)

    if not category:
        return result

    overridden = evidence_override or (
        model_category
        and model_category != category
        and decision_source == "evidence_validation"
    )

    if not overridden:
        return result

    evidence = result.get("evidence") or {}
    candidates = evidence.get("candidates", [])

    selected = next(
        (
            item
            for item in candidates
            if item.get("category") == category
        ),
        None,
    )

    evidence_items = selected.get("evidence", []) if selected else []

    if evidence_items:
        evidence_text = "; ".join(evidence_items)
        reasoning = (
            f"The evidence engine selected '{category}' based on "
            f"the following transaction evidence: {evidence_text}. "
        )
    else:
        reasoning = (
            f"The evidence engine selected '{category}' as the "
            "final voucher category. "
        )

    if model_category:
        reasoning += (
            f"Qwen originally predicted '{model_category}', "
            f"but the evidence engine selected '{category}'. "
        )

    if result.get("needs_review", False):
        reasoning += (
            "Human review is recommended because the model and "
            "evidence-based decision disagree."
        )

    result["reasoning"] = reasoning.strip()
    return result


def classify_one(transaction: dict) -> dict:
    if not isinstance(transaction, dict) or not transaction:
        raise ValueError("Transaction fields cannot be empty.")

    result = voucher_llm.predict(transaction)
    return align_prediction_reasoning(result)


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "SmartLedger",
        "model": "Qwen/Qwen2.5-1.5B-Instruct",
        "model_loaded": voucher_llm.loaded,
    }


@app.post("/api/predict")
def predict(request: PredictRequest):
    try:
        result = classify_one(request.transaction)
        return {"success": True, "prediction": result}
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Classification failed: {type(exc).__name__}: {exc}",
        ) from exc


@app.post("/api/predict/batch")
def predict_batch(request: BatchPredictRequest):
    results = []
    failures = 0

    for index, transaction in enumerate(request.transactions, start=1):
        try:
            prediction = classify_one(transaction)
            results.append({
                "row": index,
                "success": True,
                "prediction": prediction,
                "error": None,
            })
        except Exception as exc:
            failures += 1
            results.append({
                "row": index,
                "success": False,
                "prediction": None,
                "error": f"{type(exc).__name__}: {exc}",
            })

    return {
        "success": failures == 0,
        "total": len(results),
        "successful": len(results) - failures,
        "failed": failures,
        "results": results,
    }


@app.post("/api/predict/file")
async def predict_file(file: UploadFile = File(...)):
    filename = (file.filename or "").lower()

    if not filename.endswith((".csv", ".xlsx")):
        raise HTTPException(
            status_code=415,
            detail="Only CSV and XLSX files are supported.",
        )

    try:
        content = await file.read()

        if not content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty.",
            )

        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))

        if df.empty:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file contains no transaction rows.",
            )

        if len(df) > 200:
            raise HTTPException(
                status_code=413,
                detail="Maximum 200 rows per upload. Split larger files.",
            )

        results = []
        output_rows = []

        for index, row in df.iterrows():
            transaction = {
                str(column): value
                for column, value in row.items()
                if pd.notna(value) and str(value).strip()
            }

            try:
                prediction = classify_one(transaction)

                results.append({
                    "row": index + 1,
                    "success": True,
                    "prediction": prediction,
                    "error": None,
                })

                output_rows.append({
                    **transaction,
                    "Predicted Category": prediction["category"],
                    "Model Category": prediction.get("model_category"),
                    "Reasoning": prediction.get("reasoning", ""),
                    "Needs Review": prediction.get("needs_review", True),
                    "Decision Source": prediction.get("decision_source", ""),
                })

            except Exception as exc:
                results.append({
                    "row": index + 1,
                    "success": False,
                    "prediction": None,
                    "error": f"{type(exc).__name__}: {exc}",
                })

                output_rows.append({
                    **transaction,
                    "Predicted Category": "ERROR",
                    "Model Category": "",
                    "Reasoning": "",
                    "Needs Review": True,
                    "Decision Source": "",
                    "Classification Error": str(exc),
                })

        output_df = pd.DataFrame(output_rows)
        csv_buffer = io.StringIO()
        output_df.to_csv(csv_buffer, index=False)

        csv_bytes = csv_buffer.getvalue().encode("utf-8-sig")

        return StreamingResponse(
            iter([csv_bytes]),
            media_type="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": (
                    'attachment; filename="smartledger_classified_results.csv"'
                ),
                "X-Total-Rows": str(len(results)),
                "X-Successful-Rows": str(
                    sum(item["success"] for item in results)
                ),
                "X-Failed-Rows": str(
                    sum(not item["success"] for item in results)
                ),
            },
        )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Could not process uploaded file: "
                f"{type(exc).__name__}: {exc}"
            ),
        ) from exc