FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app

RUN mkdir -p /app/uploads

EXPOSE 10000

CMD ["sh", "-c", "echo '=== CONTAINER START ==='; env | grep -E 'DATABASE|SECRET|GROQ'; echo '=== STARTING UVICORN ==='; uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000} || (echo '=== UVICORN FAILED ==='; sleep 60)"]