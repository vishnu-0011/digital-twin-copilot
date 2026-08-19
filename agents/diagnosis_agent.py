"""
Diagnosis Agent (Groq backend)
================================
Same RAG-grounded diagnosis flow as before, but calls Groq's API instead of
Anthropic's — Groq has a free tier, so this sidesteps needing a paid
Anthropic balance. Get a free key at https://console.groq.com/keys and set
GROQ_API_KEY in your .env file.

Swap GROQ_MODEL below if you want a different Groq-hosted model. Current
solid free-tier options: "llama-3.3-70b-versatile" (best quality) or
"llama-3.1-8b-instant" (fastest, lower quality).
"""
from __future__ import annotations

import json
import os
import re

import requests

from agents.tools import lookup_sop_guidance

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")

DIAGNOSIS_SYSTEM_PROMPT = """You are a maintenance diagnosis assistant for a \
manufacturing plant. You will be given live telemetry for one machine and \
excerpts retrieved from that machine's Standard Operating Procedure (SOP) \
documentation. Using ONLY the retrieved SOP text as your factual basis \
(do not invent procedures or thresholds not present in the excerpts), respond \
with a JSON object with exactly these keys:
  - "likely_cause": one sentence, plain language
  - "recommended_action": one or two sentences, plain language, matching what \
the SOP excerpts actually say
  - "urgency": one of "low", "medium", "high"
  - "confidence": one of "low", "medium", "high" — how directly the retrieved \
SOP text supports this diagnosis
Respond with ONLY the JSON object, no markdown fences, no other text."""


def _strip_markdown_fences(text: str) -> str:
    """Some models wrap JSON in ```json ... ``` even when told not to —
    strip that before parsing."""
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
    return match.group(1) if match else text


def _call_groq(system_prompt: str, user_prompt: str) -> str:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY not set. Get a free key at https://console.groq.com/keys "
            "and add it to your .env file."
        )
    response = requests.post(
        GROQ_URL,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
        },
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


def build_diagnosis_node(twin, kb, model: str = None):
    machine_type_by_id = {mid: t.config.machine_type for mid, t in twin.machines.items()}

    def diagnosis_node(state):
        diagnoses = []
        fleet_by_id = {m["machine_id"]: m for m in state.get("fleet_snapshot", [])}

        for machine_id in state.get("flagged_machine_ids", []):
            machine_state = fleet_by_id.get(machine_id, {})
            machine_type = machine_type_by_id.get(machine_id, "UNKNOWN")
            symptom = (
                f"wear_level={machine_state.get('wear_level')}, "
                f"vibration_rms={machine_state.get('vibration_rms')}, "
                f"temperature_c={machine_state.get('temperature_c')}, "
                f"status={machine_state.get('status')}"
            )
            sop_chunks = lookup_sop_guidance(kb, symptom, machine_type)
            sop_context = "\n\n".join(f"[Source: {c['source']}]\n{c['text']}" for c in sop_chunks)
            user_prompt = (
                f"Machine: {machine_id} ({machine_type})\n"
                f"Telemetry: {symptom}\n\n"
                f"Retrieved SOP excerpts:\n{sop_context}"
            )

            try:
                raw_text = _call_groq(DIAGNOSIS_SYSTEM_PROMPT, user_prompt)
                parsed = json.loads(_strip_markdown_fences(raw_text))
            except Exception as e:
                parsed = {
                    "likely_cause": f"(diagnosis unavailable: {e})",
                    "recommended_action": "Escalate to a human technician for manual review.",
                    "urgency": "medium",
                    "confidence": "low",
                }

            diagnoses.append({
                "machine_id": machine_id,
                "machine_type": machine_type,
                "sop_sources": [c["source"] for c in sop_chunks],
                **parsed,
            })

        return {**state, "diagnoses": diagnoses}

    return diagnosis_node