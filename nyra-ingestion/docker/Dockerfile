FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir chardet
CMD ["python", "pipelines/bootstrap_ingest.py"]
