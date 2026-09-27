from datetime import datetime
from typing import List
from pydantic import BaseModel


class ResumeResponse(BaseModel):
    id: int
    filename: str
    skills: List[str]
    summary: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class ResumeDetail(ResumeResponse):
    raw_text: str