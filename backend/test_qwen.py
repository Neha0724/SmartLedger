import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

MODEL_ID = "Qwen/Qwen2.5-1.5B-Instruct"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ["HF_HOME"] = os.path.join(
    BASE_DIR, "models", "huggingface_cache"
)

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)

print("Loading model on CPU...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float32,
    low_cpu_mem_usage=True,
)
model.eval()

transaction = {
    "description": "Paid monthly office rent to building owner",
    "amount": 25000,
    "party": "ABC Properties",
    "payment_mode": "Bank Transfer",
}

categories = [
    "Purchase", "Sales", "Purchase Return/Debit Note",
    "Sales Return/Credit Note", "Payment", "Receipt",
    "Contra", "Journal", "Salary/Payroll", "Attendance",
    "Purchase Order", "Sales Order", "Receipt Note",
    "Delivery Note", "Rejection In", "Rejection Out",
    "Stock Journal", "Physical Stock", "Material In",
    "Material Out", "Job Work In", "Job Work Out",
    "Import", "Export", "Expense", "Advance/Prepayment",
    "Other/Miscellaneous",
]

messages = [
    {
        "role": "system",
        "content": (
            "You classify accounting vouchers. "
            "Use only the supplied categories. "
            "Return a JSON object with category, reasoning, "
            "and needs_review. Do not invent missing facts."
        ),
    },
    {
        "role": "user",
        "content": (
            f"Categories: {categories}\n"
            f"Transaction: {transaction}\n"
            "Classify this transaction."
        ),
    },
]

prompt = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
)

inputs = tokenizer(prompt, return_tensors="pt")

print("Generating prediction...")
with torch.inference_mode():
    outputs = model.generate(
        **inputs,
        max_new_tokens=120,
        do_sample=False,
        pad_token_id=tokenizer.eos_token_id,
    )

new_tokens = outputs[0][inputs["input_ids"].shape[1]:]
print("\n===== QWEN RESULT =====")
print(tokenizer.decode(new_tokens, skip_special_tokens=True))
print("\n===== TEST COMPLETE =====")
