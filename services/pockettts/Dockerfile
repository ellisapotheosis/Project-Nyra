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

# Copy the official package files
COPY pyproject.toml uv.lock README.md ./
COPY pocket_tts ./pocket_tts

# Install the package and dependencies using uv
# --index-url is handled by the official pyproject.toml's [tool.uv.sources]
RUN uv pip install --system -e . 

# Now install the wrapper specific dependencies
RUN uv pip install --system \
    fastapi \
    uvicorn \
    scipy

# Copy our OpenAI wrapper
COPY main.py .

EXPOSE 8000

ENV HF_HOME=/root/.cache/huggingface
ENV POCKET_TTS_CACHE=/root/.cache/pocket_tts

# Run our wrapper
CMD ["python", "main.py"]
