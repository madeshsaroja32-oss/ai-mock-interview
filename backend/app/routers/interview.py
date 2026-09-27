from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.interview import Interview
from app.models.resume import Resume
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.interview import AnswerSubmission, InterviewResponse, StartInterview
from app.services.llm_service import (
    evaluate_answer,
    generate_final_report,
    generate_questions,
)

router = APIRouter(prefix="/api/interview", tags=["interview"])


@router.post("/start", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def start_interview(
    payload: StartInterview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate resume belongs to user
    resume = (
        db.query(Resume)
        .filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Generate questions
    try:
        questions = generate_questions(
            role=payload.role,
            skills=resume.skills or [],
            resume_summary=resume.summary or "",
            num_questions=payload.num_questions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {e}")

    interview = Interview(
        user_id=current_user.id,
        resume_id=resume.id,
        role=payload.role,
        questions=questions,
        answers=[],
        scores=[],
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


@router.post("/{interview_id}/answer", response_model=InterviewResponse)
def submit_answer(
    interview_id: int,
    payload: AnswerSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.user_id == current_user.id)
        .first()
    )
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # Evaluate
    try:
        evaluation = evaluate_answer(
            question=payload.question,
            answer=payload.answer,
            role=interview.role,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI evaluation failed: {e}")

    new_answers = list(interview.answers or [])
    new_scores = list(interview.scores or [])

    new_answers.append(
        {
            "question": payload.question,
            "answer": payload.answer,
            **evaluation,
        }
    )
    new_scores.append(evaluation["score"])

    interview.answers = new_answers
    interview.scores = new_scores
    interview.average_score = int(sum(new_scores) / len(new_scores)) if new_scores else None

    db.commit()
    db.refresh(interview)
    return interview


@router.post("/{interview_id}/finish", response_model=InterviewResponse)
def finish_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.user_id == current_user.id)
        .first()
    )
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if not interview.answers:
        raise HTTPException(status_code=400, detail="No answers submitted yet")

    try:
        report = generate_final_report(
            role=interview.role,
            qa_pairs=interview.answers,
            avg_score=interview.average_score or 0,
        )
    except Exception as e:
        report = f"(Report generation failed: {e})"

    interview.final_report = report
    db.commit()
    db.refresh(interview)
    return interview


@router.get("/list", response_model=List[InterviewResponse])
def list_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Interview)
        .filter(Interview.user_id == current_user.id)
        .order_by(Interview.created_at.desc())
        .all()
    )


@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.user_id == current_user.id)
        .first()
    )
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview