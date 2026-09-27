import json
from typing import List, Dict
from groq import Groq

from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

MODEL = "openai/gpt-oss-120b"


def _chat(messages: List[Dict], temperature: float = 0.7, max_tokens: int = 800) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content.strip()


def generate_questions(
    role: str,
    skills: List[str],
    resume_summary: str,
    num_questions: int = 5,
) -> List[str]:
    """Generate N interview questions based on role + skills + resume."""
    skills_str = ", ".join(skills) if skills else "not specified"

    system = (
        "You are an expert technical interviewer. "
        "Generate concise, relevant interview questions. "
        "Return ONLY a valid JSON array of strings, no extra text."
    )

    user = f"""Target Role: {role}
Candidate Skills: {skills_str}
Candidate Summary: {resume_summary}

Generate exactly {num_questions} interview questions for this role.
Mix: 3 technical (based on the skills), 1 behavioral, 1 problem-solving.
Return as JSON array like: ["Q1", "Q2", "Q3", "Q4", "Q5"]"""

    raw = _chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.8,
    )

    # Try to parse JSON; fall back to line splitting
    try:
        # Strip markdown fences if present
        cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        questions = json.loads(cleaned)
        if isinstance(questions, list):
            return [str(q).strip() for q in questions][:num_questions]
    except Exception:
        pass

    # Fallback: split by newlines
    lines = [l.strip(" -0123456789.") for l in raw.splitlines() if l.strip()]
    return lines[:num_questions]


def evaluate_answer(question: str, answer: str, role: str) -> Dict:
    """Score the answer 0-10 with feedback."""
    system = (
        "You are a strict but fair technical interviewer. "
        "Evaluate the candidate's answer. "
        "Return ONLY valid JSON with keys: score (0-10), feedback (2-3 sentences), strengths (list), improvements (list)."
    )

    user = f"""Role: {role}
Question: {question}
Candidate Answer: {answer}

Score this answer from 0 to 10. Provide brief, constructive feedback.
Return JSON like:
{{"score": 7, "feedback": "...", "strengths": ["..."], "improvements": ["..."]}}"""

    raw = _chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.3,
    )

    try:
        cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        data = json.loads(cleaned)
        return {
            "score": int(data.get("score", 0)),
            "feedback": data.get("feedback", ""),
            "strengths": data.get("strengths", []),
            "improvements": data.get("improvements", []),
        }
    except Exception:
        return {
            "score": 5,
            "feedback": raw[:300] if raw else "Unable to evaluate.",
            "strengths": [],
            "improvements": [],
        }


def generate_final_report(
    role: str,
    qa_pairs: List[Dict],
    avg_score: float,
) -> str:
    """Overall narrative report."""
    qa_text = "\n".join(
        f"Q: {p['question']}\nA: {p['answer']}\nScore: {p['score']}/10"
        for p in qa_pairs
    )

    system = "You are an interview coach. Give a short, motivating final report."
    user = f"""Role: {role}
Average Score: {avg_score:.1f}/10

Interview Transcript:
{qa_text}

Write a 3-4 sentence final report covering overall performance, top strength, and one key improvement."""

    return _chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.5,
        max_tokens=400,
    )