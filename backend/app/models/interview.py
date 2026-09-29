from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)
    role = Column(String(120), nullable=False)
    mode = Column(String(20), nullable=False, default="interview")  # "interview" | "quiz"
    topic = Column(String(160), nullable=True)
    questions = Column(JSON, nullable=False, default=list)
    answers = Column(JSON, nullable=False, default=list)
    scores = Column(JSON, nullable=False, default=list)
    average_score = Column(Integer, nullable=True)
    final_report = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())