import json
import os
from dotenv import load_dotenv

# load .env variables
load_dotenv()

try:
    import google.generativeai as genai
except Exception:
    genai = None

# fetch from .env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

model = None
ACTIVE_MODEL_NAME = None


def _short_model_name(name):
    if isinstance(name, str) and name.startswith("models/"):
        return name.split("/", 1)[1]
    return name


def _list_supported_generate_models():
    if not genai:
        return []

    try:
        models = genai.list_models()
    except Exception:
        return []

    supported = []
    for item in models:
        methods = getattr(item, "supported_generation_methods", []) or []
        if "generateContent" in methods:
            name = getattr(item, "name", "")
            if name:
                supported.append(name)
    return supported


def _pick_model_name(preferred_name, available_models):
    preferred_candidates = [
        preferred_name,
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
    ]

    if not available_models:
        return preferred_name

    by_short_name = {
        _short_model_name(name): name for name in available_models if isinstance(name, str)
    }

    for candidate in preferred_candidates:
        if not isinstance(candidate, str):
            continue
        candidate_short = _short_model_name(candidate)
        if candidate in available_models:
            return candidate
        if candidate_short in by_short_name:
            return by_short_name[candidate_short]

    for name in available_models:
        short_name = _short_model_name(name)
        if isinstance(short_name, str) and "flash" in short_name.lower():
            return name

    return available_models[0]


def _init_model(force_refresh=False):
    global model, ACTIVE_MODEL_NAME

    if not genai or not GEMINI_API_KEY:
        model = None
        ACTIVE_MODEL_NAME = None
        return

    if model is not None and not force_refresh:
        return

    available_models = _list_supported_generate_models()
    chosen = _pick_model_name(GEMINI_MODEL, available_models)
    chosen_short = _short_model_name(chosen)

    try:
        model = genai.GenerativeModel(chosen_short)
        ACTIVE_MODEL_NAME = chosen_short
        return
    except Exception:
        pass

    for candidate in available_models:
        try:
            candidate_short = _short_model_name(candidate)
            model = genai.GenerativeModel(candidate_short)
            ACTIVE_MODEL_NAME = candidate_short
            return
        except Exception:
            continue

    model = None
    ACTIVE_MODEL_NAME = None


def _is_model_unavailable_error(exc):
    message = str(exc).lower()
    return (
        "not found" in message
        or "not supported for generatecontent" in message
        or "404" in message
    )


if genai and GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    _init_model()


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
Analyze this resume and return STRICT JSON with keys:

score (0-100 number)
skills (array)
missing_skills (array)
suggestions (array)

Resume:
{text}
"""

    try:
        response = model.generate_content(prompt)
    except Exception as exc:
        # If configured model is unavailable, refresh model selection once and retry.
        if _is_model_unavailable_error(exc):
            _init_model(force_refresh=True)
            if model is not None:
                try:
                    response = model.generate_content(prompt)
                except Exception as retry_exc:
                    return _fallback_analysis(f"AI analysis failed: {retry_exc}")
            else:
                return _fallback_analysis("AI analysis failed: no supported Gemini model was found.")
        else:
            return _fallback_analysis(f"AI analysis failed: {exc}")

    raw_text = getattr(response, "text", "") or ""
    cleaned = _strip_markdown_code_fence(raw_text)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        return _fallback_analysis("AI returned non-JSON output. Please try again.")

    if not isinstance(parsed, dict):
        return _fallback_analysis("AI returned an unexpected response format.")

    parsed.setdefault("score", 0)
    parsed.setdefault("skills", [])
    parsed.setdefault("missing_skills", [])
    parsed.setdefault("suggestions", [])

    if ACTIVE_MODEL_NAME and "model_used" not in parsed:
        parsed["model_used"] = ACTIVE_MODEL_NAME

    return parsed