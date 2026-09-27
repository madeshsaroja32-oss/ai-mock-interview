from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import user, resume, interview  # noqa: F401  (import registers models)
from app.routers import auth, resume as resume_router, interview as interview_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Mock Interview API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resume_router.router)
app.include_router(interview_router.router)


@app.get("/")
async def root():
    return {"message": "AI Mock Interview API is running"}


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "backend"}