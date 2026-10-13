
import json
import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

os.environ.setdefault(
    "HF_HOME",
    str(BASE_DIR / "models" / "huggingface_cache"),
)

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

from app.evidence_service import extract_evidence


MODEL_ID = "Qwen/Qwen2.5-1.5B-Instruct"

CATEGORIES = [
    "Purchase",
    "Sales",
    "Purchase Return/Debit Note",
    "Sales Return/Credit Note",
    "Payment",
    "Receipt",
    "Contra",
    "Journal",
    "Salary/Payroll",
    "Attendance",
    "Purchase Order",
    "Sales Order",
    "Receipt Note",
    "Delivery Note",
    "Rejection In",
    "Rejection Out",
    "Stock Journal",
    "Physical Stock",
    "Material In",
    "Material Out",
    "Job Work In",
    "Job Work Out",
    "Import",
    "Export",
    "Expense",
    "Advance/Prepayment",
    "Other/Miscellaneous",
]


class VoucherLLM:
    def __init__(self):
        self.tokenizer = None
        self.model = None

    @property
    def loaded(self):
        return self.model is not None and self.tokenizer is not None

    def load(self):
        if self.loaded:
            return

        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)

        model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            dtype=torch.float32,
            low_cpu_mem_usage=True,
        )

        model.eval()

        self.tokenizer = tokenizer
        self.model = model

    @staticmethod
    def _parse_json(text: str) -> dict:
        text = text.strip()

        try:
            result = json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", text, re.DOTALL)

            if not match:
                raise ValueError(
                    "Qwen did not return a JSON object."
                )

            try:
                result = json.loads(match.group())
            except json.JSONDecodeError as exc:
                raise ValueError(
                    "Qwen returned malformed JSON."
                ) from exc

        if not isinstance(result, dict):
            raise ValueError(
                "Qwen response must be a JSON object."
            )

        return result

    @staticmethod
    def _evidence_conflict(evidence: dict) -> bool:
        candidates = evidence.get("candidates", [])

        if len(candidates) < 2:
            return False

        first = candidates[0]
        second = candidates[1]

        return first["score"] - second["score"] < 2.0

    @staticmethod
    def _validate_prediction(
        model_category: str,
        evidence: dict,
    ) -> dict:
        """
        Validate Qwen's prediction using the evidence rules.

        Evidence scores are heuristic scores, not probabilities.
        """
        candidates = evidence.get("candidates", [])
        ambiguous = evidence.get("ambiguous_evidence", True)

        decision = {
            "category": model_category,
            "model_category": model_category,
            "decision_source": "qwen",
            "evidence_override": False,
            "override_reason": None,
            "needs_review": False,
        }

        if not candidates or ambiguous:
            decision["needs_review"] = True
            decision["override_reason"] = (
                "Evidence is missing or marked ambiguous."
            )
            return decision

        top = candidates[0]

        second_score = (
            candidates[1]["score"]
            if len(candidates) > 1
            else 0.0
        )

        margin = top["score"] - second_score

        strong_evidence = (
            top["score"] >= 8.0
            and margin >= 4.0
        )

        if (
            strong_evidence
            and model_category != top["category"]
        ):
            decision.update({
                "category": top["category"],
                "decision_source": "evidence_validation",
                "evidence_override": True,
                "override_reason": (
                    f"Qwen predicted '{model_category}', but the evidence "
                    f"engine strongly supports '{top['category']}' "
                    f"(score={top['score']}, margin={margin}). "
                    "Human review is recommended because the predictions "
                    "disagree."
                ),
                "needs_review": True,
            })

        elif not strong_evidence:
            decision["needs_review"] = True
            decision["override_reason"] = (
                "Evidence did not meet the configured strength threshold."
            )

        return decision

    def predict(self, transaction: dict) -> dict:
        if not isinstance(transaction, dict) or not transaction:
            raise ValueError(
                "Transaction must be a non-empty JSON object."
            )

        evidence = extract_evidence(transaction)

        self.load()

        messages = [
            {
                "role": "system",
                "content": (
                    "You are an accounting voucher classification assistant. "
                    "Classify the transaction into exactly one allowed "
                    "category. Distinguish purchase from sales, purchase "
                    "orders from completed purchases, receipt notes from "
                    "purchases, and purchase returns from sales returns. "
                    "Use the supplied evidence as clues, not guaranteed truth. "
                    "Never invent missing facts. If fields are insufficient "
                    "or conflicting, set needs_review to true. Return only "
                    "JSON with category, reasoning, needs_review."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Allowed categories:\n{json.dumps(CATEGORIES)}\n\n"
                    f"Transaction:\n"
                    f"{json.dumps(transaction, default=str)}\n\n"
                    f"Evidence candidates:\n"
                    f"{json.dumps(evidence, default=str)}\n\n"
                    "Choose the best-supported category. Do not confuse a "
                    "purchase order with a completed purchase, or a goods "
                    "receipt note with a purchase invoice. Return JSON only."
                ),
            },
        ]

        prompt = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=2048,
        )

        with torch.inference_mode():
            output = self.model.generate(
                **inputs,
                max_new_tokens=180,
                do_sample=False,
                pad_token_id=self.tokenizer.eos_token_id,
            )

        generated = output[0][
            inputs["input_ids"].shape[1]:
        ]

        generated_text = self.tokenizer.decode(
            generated,
            skip_special_tokens=True,
        )

        result = self._parse_json(generated_text)

        model_category = result.get("category")

        if (
            not isinstance(model_category, str)
            or model_category not in CATEGORIES
        ):
            raise ValueError(
                f"Qwen returned an unsupported category: "
                f"{model_category!r}"
            )

        model_review = result.get("needs_review", True)

        if not isinstance(model_review, bool):
            model_review = True

        decision = self._validate_prediction(
            model_category,
            evidence,
        )

        competing_evidence = self._evidence_conflict(evidence)

        ambiguous_evidence = evidence.get(
            "ambiguous_evidence",
            True,
        )

        weak_evidence = (
            decision["override_reason"]
            == "Evidence did not meet the configured strength threshold."
        )

        review_reasons = {
            "model_requested_review": model_review,
            "ambiguous_evidence": ambiguous_evidence,
            "competing_evidence": competing_evidence,
            "evidence_override": decision["evidence_override"],
            "weak_evidence": weak_evidence,
        }

        needs_review = any(review_reasons.values())

        reasoning = str(
            result.get("reasoning", "")
        ).strip()

        if decision["evidence_override"]:
            reasoning += (
                " Validation note: the evidence engine selected "
                f"{decision['category']} instead of Qwen's original "
                f"prediction, {model_category}. Human review is recommended."
            )

        if weak_evidence and not decision["evidence_override"]:
            reasoning += (
                " Human review is recommended because the evidence "
                "did not meet the configured strength threshold."
            )

        return {
            "category": decision["category"],
            "model_category": model_category,
            "decision_source": decision["decision_source"],
            "evidence_override": decision["evidence_override"],
            "override_reason": decision["override_reason"],
            "reasoning": reasoning.strip(),
            "needs_review": needs_review,
            "review_reasons": review_reasons,
            "evidence": evidence,
            "model": MODEL_ID,
        }


voucher_llm = VoucherLLM()