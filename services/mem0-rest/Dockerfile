# Dockerfile for Mem0 REST API (Python/FastAPI)

FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 4321

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4321"]
