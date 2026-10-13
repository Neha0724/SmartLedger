
import re
from typing import Any


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


def normalize(value: Any) -> str:
    value = str(value).strip().lower()
    value = re.sub(r"[_\-/]+", " ", value)
    value = re.sub(r"[^a-z0-9 ]+", "", value)
    return re.sub(r"\s+", " ", value).strip()


CATEGORY_SIGNALS = {
    "Purchase": [
        "po ref",
        "po reference",
        "transport cost",
        "other charges",
    ],
    "Sales": [
        "delivery ref",
        "delivery reference",
        "buyer invoice",
        "export item",
    ],
    "Purchase Return/Debit Note": [
        "units returned",
        "reason for return",
        "original doc ref",
    ],
    "Sales Return/Credit Note": [
        "units returned",
        "reason for return",
        "original invoice ref",
    ],
    "Payment": [
        "payer organization",
        "payee organization",
        "payment type",
        "payment id",
    ],
    "Receipt": [
        "receiving organization",
        "paying organization",
        "receipt nature",
        "receipt id",
        "against invoice",
    ],
    "Contra": [
        "source account",
        "destination account",
        "transfer amount",
        "bank ifsc code",
        "contra id",
    ],
    "Journal": [
        "debit side",
        "credit side",
        "journal type",
        "journal id",
    ],
    "Salary/Payroll": [
        "employee code",
        "employee full name",
        "payroll period",
        "gross salary",
        "net payable",
        "dearness allowance",
    ],
    "Attendance": [
        "attendance date",
        "attendance status",
        "working days",
        "leave days",
    ],
    "Purchase Order": [
        "po number",
        "quantity required",
        "promised delivery",
        "terms",
    ],
    "Sales Order": [
        "so number",
        "quantity ordered",
        "payment terms",
    ],
    "Receipt Note": [
        "grn number",
        "item received",
        "quality status",
        "storage location",
        "inspected by",
    ],
    "Delivery Note": [
        "delivery challan no",
        "item dispatched",
        "quantity shipped",
        "so reference",
    ],
    "Rejection In": [
        "rejection note no",
        "item rejected",
        "quantity rejected",
        "grn reference",
        "approved by",
    ],
    "Rejection Out": [
        "rejection note no",
        "item rejected",
        "quantity rejected",
        "dn reference",
        "authorized by",
    ],
    "Stock Journal": [
        "stock adj id",
        "adjustment qty",
        "storage facility",
        "adjustment date",
        "unit cost",
    ],
    "Physical Stock": [
        "stock count id",
        "book quantity",
        "counted quantity",
        "discrepancy",
    ],
    "Material In": [
        "inward job work no",
        "quantity sent",
        "subcontractor",
        "date of dispatch",
    ],
    "Material Out": [
        "outward job work no",
        "quantity received",
        "contractor",
        "date of receipt",
    ],
    "Job Work In": [
        "processing rate",
        "inward job work no",
        "subcontractor",
    ],
    "Job Work Out": [
        "service charge",
        "agreement terms",
    ],
    "Import": [
        "import bill no",
        "originating country",
        "importer",
        "customs duty",
        "import gst",
    ],
    "Export": [
        "export invoice no",
        "destination country",
        "exporter",
        "units exported",
        "free on board value",
    ],
    "Expense": [
        "expense claim no",
        "expense type",
        "amount claimed",
        "vendor provider",
    ],
    "Advance/Prepayment": [
        "advance reference",
        "advance amount",
        "prepayment date",
        "advance type",
    ],
    "Other/Miscellaneous": [
        "miscellaneous reference",
        "other transaction details",
    ],
}


IDENTIFIER_RULES = {
    "document number": {
        "PUR": "Purchase",
        "SAL": "Sales",
        "DBN": "Purchase Return/Debit Note",
        "CRN": "Sales Return/Credit Note",
    },
    "import bill no": {"IBL": "Import"},
    "export invoice no": {"EXP": "Export"},
    "po number": {"PO": "Purchase Order"},
    "so number": {"SO": "Sales Order"},
    "payment id": {"PMT": "Payment"},
    "receipt id": {"RCP": "Receipt"},
    "contra id": {"CTR": "Contra"},
    "journal id": {"JNL": "Journal"},
    "stock adj id": {"SA": "Stock Journal"},
}


JOB_WORK_REFERENCE_RULES = {
    "jwio ref": "Job Work In",
    "jwoo ref": "Job Work Out",
}


def _is_empty(value: Any) -> bool:
    if value is None:
        return True

    if isinstance(value, str) and not value.strip():
        return True

    try:
        if value != value:
            return True
    except (TypeError, ValueError):
        pass

    return False


def extract_evidence(transaction: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(transaction, dict):
        raise TypeError("transaction must be a dictionary")

    # Support both a flat transaction and an accidentally nested payload.
    while (
        isinstance(transaction.get("transaction"), dict)
        and len(transaction) == 1
    ):
        transaction = transaction["transaction"]

    normalized = {}

    for key, value in transaction.items():
        if _is_empty(value):
            continue

        field_name = normalize(key)

        if field_name:
            normalized[field_name] = str(value).strip()

    scores = {category: 0.0 for category in CATEGORIES}
    evidence = {category: [] for category in CATEGORIES}

    # Score distinctive fields.
    for category, fields in CATEGORY_SIGNALS.items():
        for field in fields:
            normalized_field = normalize(field)

            if normalized_field in JOB_WORK_REFERENCE_RULES:
                continue

            if normalized_field in normalized:
                scores[category] += 2.0
                evidence[category].append(
                    f"Field present: {normalized_field}"
                )

    # Strong category-specific job-work identifiers.
    for field_name, category in JOB_WORK_REFERENCE_RULES.items():
        if field_name in normalized:
            scores[category] += 12.0
            evidence[category].append(
                f"Strong job-work identifier: {field_name}"
            )

    # Prefix-based identifiers for other categories.
    for field_name, value in normalized.items():
        rules = IDENTIFIER_RULES.get(field_name)

        if not rules:
            continue

        identifier = value.strip().upper()

        for prefix, category in rules.items():
            if identifier.startswith(prefix):
                scores[category] += 12.0
                evidence[category].append(
                    f"{field_name} matches identifier prefix {prefix}"
                )
                break

    ranked = [
        {
            "category": category,
            "score": round(score, 2),
            "evidence": evidence[category],
        }
        for category, score in scores.items()
        if score > 0
    ]

    ranked.sort(
        key=lambda item: (-item["score"], item["category"])
    )

    top_score = ranked[0]["score"] if ranked else 0.0
    second_score = ranked[1]["score"] if len(ranked) > 1 else 0.0

    ambiguous_evidence = (
        not ranked
        or top_score < 4.0
        or (
            len(ranked) > 1
            and top_score - second_score < 2.0
        )
    )

    return {
        "candidates": ranked[:5],
        "ambiguous_evidence": ambiguous_evidence,
    }