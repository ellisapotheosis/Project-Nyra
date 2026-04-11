# 🚀 KYUTAI POCKET-TTS OFFICIAL-GRADE OPENAI WRAPPER
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uv/bin/uv
ENV PATH="/uv/bin:${PATH}"

WORKDIR /app

# Install dependencies from PyPI
# We use the CPU version of torch as mandated
RUN uv pip install --system \
    pocket-tts \
    fastapi \
    uvicorn \
    scipy \
    torch --index-url https://download.pytorch.org/whl/cpu

# Copy our OpenAI wrapper
COPY main.py .

EXPOSE 8000

ENV HF_HOME=/root/.cache/huggingface
ENV POCKET_TTS_CACHE=/root/.cache/pocket_tts

# Run our wrapper
CMD ["python", "main.py"]
