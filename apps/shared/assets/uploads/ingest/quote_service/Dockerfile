FROM python:3.11-slim
LABEL maintainer="Project Apotheosis"

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .

# Expose default port
EXPOSE 5000

# Run the service
CMD ["python", "app.py"]