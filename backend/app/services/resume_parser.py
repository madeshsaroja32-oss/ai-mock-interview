import re
import pdfplumber
from typing import List

# A curated list of common technical + soft skills
SKILL_KEYWORDS = [
    # Languages
    "python", "java", "javascript", "typescript", "c", "c++", "c#", "go", "rust",
    "php", "ruby", "swift", "kotlin", "dart", "r", "scala", "matlab",
    # Frontend
    "react", "next.js", "vue", "angular", "svelte", "html", "css", "sass",
    "tailwind", "bootstrap", "redux", "vite", "webpack",
    # Backend
    "node.js", "express", "fastapi", "django", "flask", "spring", "rails",
    "rest api", "graphql", "grpc", "microservices",
    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "sqlite", "dynamodb",
    "oracle", "cassandra", "neo4j",
    # Data / AI
    "pandas", "numpy", "matplotlib", "seaborn", "scikit-learn", "tensorflow",
    "pytorch", "keras", "opencv", "nltk", "spacy", "huggingface", "langchain",
    "machine learning", "deep learning", "nlp", "computer vision",
    # DevOps / Cloud
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible",
    "jenkins", "github actions", "ci/cd", "linux", "bash", "nginx",
    # Tools
    "git", "github", "gitlab", "jira", "postman", "figma", "vs code",
    # Concepts
    "data structures", "algorithms", "oop", "dbms", "operating systems",
    "networking", "system design", "agile", "scrum",
]


def extract_text_from_pdf(file_path: str) -> str:
    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
    return "\n".join(text_parts).strip()


def extract_skills(text: str) -> List[str]:
    lowered = text.lower()
    found = set()
    for skill in SKILL_KEYWORDS:
        # word-boundary match; escape special chars like + and #
        pattern = r"(?<![a-zA-Z0-9])" + re.escape(skill) + r"(?![a-zA-Z0-9])"
        if re.search(pattern, lowered):
            # Title-case common ones
            found.add(skill.title() if " " not in skill else skill.title())
    return sorted(found)


def extract_name(text: str) -> str | None:
    # first non-empty line often is the name
    for line in text.splitlines():
        line = line.strip()
        if line and len(line) < 40 and "@" not in line and not any(c.isdigit() for c in line):
            return line
    return None


def extract_email(text: str) -> str | None:
    m = re.search(r"[\w\.\-]+@[\w\.\-]+\.\w+", text)
    return m.group(0) if m else None


def extract_phone(text: str) -> str | None:
    m = re.search(r"(\+?\d[\d\s\-()]{8,}\d)", text)
    return m.group(0).strip() if m else None


def build_summary(text: str, skills: List[str]) -> str:
    name = extract_name(text) or "The candidate"
    email = extract_email(text) or "N/A"
    phone = extract_phone(text) or "N/A"
    top_skills = ", ".join(skills[:10]) if skills else "no detected skills"
    return (
        f"{name} — Contact: {email} | {phone}. "
        f"Detected {len(skills)} skills including: {top_skills}. "
        f"Resume length: {len(text.split())} words."
    )