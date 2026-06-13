FROM python:3.12-slim

RUN pip install --no-cache-dir composio-core

EXPOSE 2700

CMD ["composio", "serve", "--host", "0.0.0.0", "--port", "2700", "--transport", "streamable-http"]
