FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1001 app && chown -R app:app /app
USER app

# For Celery beat
ENV C_FORCE_ROOT=1
ENV PORT=8080
EXPOSE 8080

# Run the health check server and celery beat
CMD python healthcheck_beat.py