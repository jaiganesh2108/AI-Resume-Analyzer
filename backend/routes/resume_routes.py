import os
import tempfile

from fastapi import APIRouter, File, HTTPException, UploadFile
from database import resumes
from utils.pdf_parser import extract_text
from gemini_ai import analyze_resume

router = APIRouter()

@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="A resume file is required")

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
        })

        return {"analysis": result}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to analyze resume: {exc}") from exc
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)