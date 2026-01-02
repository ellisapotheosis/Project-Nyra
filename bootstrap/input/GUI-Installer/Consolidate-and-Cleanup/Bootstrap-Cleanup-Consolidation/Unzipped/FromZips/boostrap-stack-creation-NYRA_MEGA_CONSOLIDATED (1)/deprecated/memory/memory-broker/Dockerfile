FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml /app/pyproject.toml
RUN pip install --no-cache-dir fastapi uvicorn[standard] httpx python-dotenv pydantic
COPY . /app
CMD ["uvicorn","broker:app","--host","0.0.0.0","--port","8099"]
