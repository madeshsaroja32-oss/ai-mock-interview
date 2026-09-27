import os
import shutil
import uuid
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.resume import Resume
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.resume import ResumeDetail, ResumeResponse
from app.services.resume_parser import (
    build_summary,
    extract_skills,
    extract_text_from_pdf,
)

router = APIRouter(prefix="/api/resume", tags=["resume"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=ResumeDetail, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1. Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # 2. Save file temporarily
    tmp_name = f"{uuid.uuid4().hex}.pdf"
    tmp_path = os.path.join(UPLOAD_DIR, tmp_name)
    with open(tmp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # 3. Parse PDF
    try:
        raw_text = extract_text_from_pdf(tmp_path)
    except Exception as e:
        os.remove(tmp_path)
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {e}")

    if not raw_text.strip():
        os.remove(tmp_path)
        raise HTTPException(status_code=400, detail="PDF appears to be empty or image-only")

    skills = extract_skills(raw_text)
    summary = build_summary(raw_text, skills)

    # 4. Store in DB
    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        raw_text=raw_text,
        skills=skills,
        summary=summary,
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # 5. Clean up file (optional: keep if you want to show the original later)
    os.remove(tmp_path)

    return resume


@router.get("/list", response_model=List[ResumeResponse])
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .all()
    )


@router.get("/{resume_id}", response_model=ResumeDetail)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume