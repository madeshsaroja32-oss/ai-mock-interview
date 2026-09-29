from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.interview import Interview
from app.models.resume import Resume
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.interview import (
    AnswerSubmission,
    InterviewResponse,
    QuizAnswerSubmission,
    StartInterview,
    StartQuiz,
)
from app.services.llm_service import (
    evaluate_answer,
    generate_final_report,
    generate_mcq_questions,
    generate_mcq_report,
    generate_questions,
)

router = APIRouter(prefix="/api/interview", tags=["interview"])


# ============================================================
# OPEN-ENDED INTERVIEW
# ============================================================

@router.post("/start", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def start_interview(
    payload: StartInterview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

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
        mode="interview",
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

    if interview.mode == "quiz":
        try:
            report = generate_mcq_report(
                topic=interview.topic or interview.role,
                results=interview.answers,
            )
        except Exception as e:
            report = f"(Report generation failed: {e})"
    else:
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


# ============================================================
# QUIZ (MCQ)
# ============================================================

@router.post("/quiz/start", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def start_quiz(
    payload: StartQuiz,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == payload.resume_id, Resume.user_id == current_user.id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    try:
        questions = generate_mcq_questions(
            topic=payload.topic,
            skills=resume.skills or [],
            resume_summary=resume.summary or "",
            num_questions=payload.num_questions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {e}")

    if not questions:
        raise HTTPException(status_code=500, detail="AI failed to generate valid questions. Try again.")

    interview = Interview(
        user_id=current_user.id,
        resume_id=resume.id,
        role=payload.topic,
        mode="quiz",
        topic=payload.topic,
        questions=questions,
        answers=[],
        scores=[],
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


@router.post("/{interview_id}/quiz-answer", response_model=InterviewResponse)
def submit_quiz_answer(
    interview_id: int,
    payload: QuizAnswerSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    interview = (
        db.query(Interview)
        .filter(Interview.id == interview_id, Interview.user_id == current_user.id)
        .first()
    )
    if not interview:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = interview.questions or []
    if payload.question_index < 0 or payload.question_index >= len(questions):
        raise HTTPException(status_code=400, detail="Invalid question index")

    q = questions[payload.question_index]
    correct_index = q.get("correct_index", 0)
    is_correct = payload.selected_index == correct_index

    new_answers = list(interview.answers or [])
    new_scores = list(interview.scores or [])

    new_answers.append(
        {
            "question": q["question"],
            "options": q["options"],
            "selected_index": payload.selected_index,
            "correct_index": correct_index,
            "is_correct": is_correct,
            "explanation": q.get("explanation", ""),
        }
    )
    new_scores.append(1 if is_correct else 0)

    interview.answers = new_answers
    interview.scores = new_scores
    interview.average_score = int((sum(new_scores) / len(new_scores)) * 10) if new_scores else None

    db.commit()
    db.refresh(interview)
    return interview


# ============================================================
# LIST / GET
# ============================================================

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