import json
import os

try:
    import google.generativeai as genai
except Exception:
    genai = None

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

model = None
if genai and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)


def _fallback_analysis(message):
    return {
        "score": 0,
        "skills": [],
        "missing_skills": [],
        "suggestions": [message],
    }


def _strip_markdown_code_fence(text):
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if len(lines) >= 3:
            return "\n".join(lines[1:-1]).strip()
    return cleaned


def analyze_resume(text):
    if not text or not text.strip():
        return _fallback_analysis("Could not extract text from the uploaded PDF.")

    if model is None:
        return _fallback_analysis(
            "AI analysis is unavailable. Set GEMINI_API_KEY in your environment."
        )

    prompt = f"""
Analyze this resume and return strict JSON with keys:
score (0-100 number), skills (array), missing_skills (array), suggestions (array).

Resume:
{text}
"""

    try:
        response = model.generate_content(prompt)
        raw_text = getattr(response, "text", "") or ""
        cleaned = _strip_markdown_code_fence(raw_text)
        parsed = json.loads(cleaned)

        if not isinstance(parsed, dict):
            return _fallback_analysis("AI returned an unexpected response format.")

        parsed.setdefault("score", 0)
        parsed.setdefault("skills", [])
        parsed.setdefault("missing_skills", [])
        parsed.setdefault("suggestions", [])
        return parsed
    except Exception as exc:
        return _fallback_analysis(f"AI analysis failed: {exc}")