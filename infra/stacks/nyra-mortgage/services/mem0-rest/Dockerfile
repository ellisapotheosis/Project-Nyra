FROM python:3.11-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir fastapi==0.115.6 uvicorn==0.34.0 pydantic==2.10.4

COPY app /app/app
EXPOSE 4321
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4321"]
