from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class StartInterview(BaseModel):
    role: str
    resume_id: int
    num_questions: int = 5


class AnswerSubmission(BaseModel):
    question: str
    answer: str


class InterviewResponse(BaseModel):
    id: int
    role: str
    questions: List[str]
    answers: List[dict]
    scores: List[int]
    average_score: Optional[int] = None
    final_report: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True