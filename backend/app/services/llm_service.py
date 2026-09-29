import json
from typing import Dict, List
from groq import Groq

from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

MODEL = "openai/gpt-oss-120b"


def _chat(messages: List[Dict], temperature: float = 0.7, max_tokens: int = 1500) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content.strip()


def _clean_json(raw: str) -> str:
    return (
        raw.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )


# ============================================================
# ORIGINAL OPEN-ENDED INTERVIEW FUNCTIONS
# ============================================================

def generate_questions(
    role: str,
    skills: List[str],
    resume_summary: str,
    num_questions: int = 5,
) -> List[str]:
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

    try:
        questions = json.loads(_clean_json(raw))
        if isinstance(questions, list):
            return [str(q).strip() for q in questions][:num_questions]
    except Exception:
        pass

    lines = [l.strip(" -0123456789.") for l in raw.splitlines() if l.strip()]
    return lines[:num_questions]


def evaluate_answer(question: str, answer: str, role: str) -> Dict:
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
        data = json.loads(_clean_json(raw))
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


def generate_final_report(role: str, qa_pairs: List[Dict], avg_score: float) -> str:
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


# ============================================================
# NEW: MCQ QUIZ FUNCTIONS
# ============================================================

def generate_mcq_questions(
    topic: str,
    skills: List[str],
    resume_summary: str,
    num_questions: int = 5,
) -> List[Dict]:
    """Generate multiple-choice questions. Each has question, 4 options, correct_index."""
    skills_str = ", ".join(skills) if skills else "not specified"

    system = (
        "You are an exam question generator. "
        "Generate multiple-choice questions with exactly 4 options each. "
        "Return ONLY a valid JSON array, no extra text."
    )

    user = f"""Topic: {topic}
Candidate Skills: {skills_str}
Candidate Summary: {resume_summary}

Generate exactly {num_questions} multiple-choice questions on the given topic.
Each question MUST have:
- "question": the question text
- "options": array of exactly 4 short strings
- "correct_index": integer 0-3 (index of the correct option)
- "explanation": 1 sentence explaining why the answer is correct

Return as JSON array:
[
  {{
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct_index": 1,
    "explanation": "..."
  }},
  ...
]

Make sure the 4 options are plausible but only 1 is correct."""

    raw = _chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.7,
        max_tokens=2500,
    )

    try:
        data = json.loads(_clean_json(raw))
        if isinstance(data, list):
            cleaned = []
            for q in data[:num_questions]:
                if (
                    isinstance(q, dict)
                    and "question" in q
                    and isinstance(q.get("options"), list)
                    and len(q["options"]) == 4
                    and isinstance(q.get("correct_index"), int)
                    and 0 <= q["correct_index"] <= 3
                ):
                    cleaned.append(
                        {
                            "question": str(q["question"]).strip(),
                            "options": [str(o).strip() for o in q["options"]],
                            "correct_index": q["correct_index"],
                            "explanation": str(q.get("explanation", "")).strip(),
                        }
                    )
            return cleaned
    except Exception:
        pass

    return []


def generate_mcq_report(topic: str, results: List[Dict]) -> str:
    """Final report for a quiz."""
    lines = []
    for r in results:
        status = "✅" if r.get("is_correct") else "❌"
        lines.append(f"{status} Q: {r['question']}")

    summary = "\n".join(lines)

    system = "You are a quiz coach. Give a short, motivating final report."
    user = f"""Topic: {topic}
Results:
{summary}

Write a 3-4 sentence report: overall performance, areas to focus on, and one study tip."""

    return _chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.5,
        max_tokens=400,
    )