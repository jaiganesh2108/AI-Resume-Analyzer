import os
import tempfile
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, File, HTTPException, UploadFile
from database import resumes
from utils.pdf_parser import extract_text
from gemini_ai import analyze_resume

router = APIRouter()


def _clamp_score(value):
    try:
        numeric = int(round(float(value)))
    except (TypeError, ValueError):
        numeric = 0
    return max(0, min(100, numeric))


def _as_str_list(value):
    if not isinstance(value, list):
        return []
    return [str(item).strip() for item in value if str(item).strip()]


def _doc_created_at(doc):
    created_at = doc.get("created_at")
    if isinstance(created_at, datetime):
        if created_at.tzinfo is None:
            return created_at.replace(tzinfo=timezone.utc)
        return created_at.astimezone(timezone.utc)

    object_id = doc.get("_id")
    if object_id and hasattr(object_id, "generation_time"):
        return object_id.generation_time.astimezone(timezone.utc)

    return datetime.now(timezone.utc)


def _build_dashboard_payload(history_docs):
    if not history_docs:
        return {
            "overall_score": 0,
            "ats_pass_rate": 0,
            "versions_uploaded": 0,
            "issues_found": 0,
            "latest_analysis": {
                "score": 0,
                "skills": [],
                "missing_skills": [],
                "suggestions": [],
            },
            "radar_data": [
                {"axis": "Score", "score": 0},
                {"axis": "Skills", "score": 0},
                {"axis": "Gaps", "score": 100},
                {"axis": "ATS", "score": 0},
                {"axis": "History", "score": 0},
                {"axis": "Action", "score": 100},
            ],
            "keyword_data": [],
            "trend_data": [],
            "section_data": [],
            "activity_data": [
                {"day": "Mon", "uploads": 0},
                {"day": "Tue", "uploads": 0},
                {"day": "Wed", "uploads": 0},
                {"day": "Thu", "uploads": 0},
                {"day": "Fri", "uploads": 0},
                {"day": "Sat", "uploads": 0},
                {"day": "Sun", "uploads": 0},
            ],
            "action_items": ["Upload a resume to see your analysis dashboard."],
        }

    latest_doc = history_docs[0]
    latest_analysis = latest_doc.get("analysis", {}) if isinstance(latest_doc.get("analysis"), dict) else {}

    latest_score = _clamp_score(latest_analysis.get("score", 0))
    latest_skills = _as_str_list(latest_analysis.get("skills", []))
    latest_missing = _as_str_list(latest_analysis.get("missing_skills", []))
    latest_suggestions = _as_str_list(latest_analysis.get("suggestions", []))

    all_scores = []
    for doc in history_docs:
        analysis = doc.get("analysis", {}) if isinstance(doc.get("analysis"), dict) else {}
        all_scores.append(_clamp_score(analysis.get("score", 0)))

    versions_uploaded = len(history_docs)
    passed = sum(1 for score in all_scores if score >= 70)
    ats_pass_rate = int(round((passed / versions_uploaded) * 100)) if versions_uploaded else 0
    issues_found = len(latest_missing) + len(latest_suggestions)

    skill_strength = min(100, len(latest_skills) * 18)
    gap_strength = max(0, 100 - len(latest_missing) * 14)
    action_strength = max(0, 100 - len(latest_suggestions) * 12)

    oldest_score = all_scores[-1] if all_scores else latest_score
    improvement = latest_score - oldest_score
    history_strength = _clamp_score(50 + improvement)
    ats_strength = _clamp_score((latest_score + gap_strength) / 2)

    radar_data = [
        {"axis": "Score", "score": latest_score},
        {"axis": "Skills", "score": skill_strength},
        {"axis": "Gaps", "score": gap_strength},
        {"axis": "ATS", "score": ats_strength},
        {"axis": "History", "score": history_strength},
        {"axis": "Action", "score": action_strength},
    ]

    keyword_data = []
    for idx, skill in enumerate(latest_skills[:5]):
        keyword_data.append({"kw": skill, "match": _clamp_score(latest_score + 12 - idx * 6)})
    for idx, missing in enumerate(latest_missing[:5]):
        keyword_data.append({"kw": missing, "match": max(5, 35 - idx * 6)})
    if not keyword_data:
        keyword_data = [{"kw": "No keyword data", "match": 0}]

    trend_docs = list(reversed(history_docs[:7]))
    trend_data = []
    for index, doc in enumerate(trend_docs, start=1):
        analysis = doc.get("analysis", {}) if isinstance(doc.get("analysis"), dict) else {}
        trend_data.append({"v": f"v{index}", "score": _clamp_score(analysis.get("score", 0))})

    section_data = [
        {"name": "Resume Score", "score": latest_score},
        {"name": "Skills Depth", "score": skill_strength},
        {"name": "Keyword Gaps", "score": gap_strength},
        {"name": "ATS Readiness", "score": ats_strength},
        {"name": "Actionability", "score": action_strength},
    ]

    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    day_counters = {day: 0 for day in day_names}
    cutoff = datetime.now(timezone.utc) - timedelta(days=6)

    for doc in history_docs:
        created_at = _doc_created_at(doc)
        if created_at >= cutoff:
            day_counters[day_names[created_at.weekday()]] += 1

    activity_data = [{"day": day, "uploads": day_counters[day]} for day in day_names]

    action_items = latest_suggestions or [
        "No action items returned by AI for the latest resume.",
    ]

    return {
        "overall_score": latest_score,
        "ats_pass_rate": ats_pass_rate,
        "versions_uploaded": versions_uploaded,
        "issues_found": issues_found,
        "latest_analysis": {
            "score": latest_score,
            "skills": latest_skills,
            "missing_skills": latest_missing,
            "suggestions": latest_suggestions,
        },
        "radar_data": radar_data,
        "keyword_data": keyword_data,
        "trend_data": trend_data,
        "section_data": section_data,
        "activity_data": activity_data,
        "action_items": action_items,
    }


@router.get("/dashboard-data")
def dashboard_data():
    docs = list(
        resumes.find({}, {"analysis": 1, "created_at": 1})
        .sort([("_id", -1)])
        .limit(100)
    )
    return _build_dashboard_payload(docs)

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="A resume file is required")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(contents)
            temp_path = temp_file.name

        text = extract_text(temp_path)
        result = analyze_resume(text)

        resumes.insert_one({
            "filename": file.filename,
            "analysis": result,
            "created_at": datetime.now(timezone.utc),
        })

        return {"analysis": result}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {exc}") from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)