FROM python:3.12-slim

WORKDIR /app

# Install PostgreSQL client library (libpq5) - CRITICAL for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 && rm -rf /var/lib/apt/lists/*

# Set library path
ENV LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu:$LD_LIBRARY_PATH

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Cache breaker for source code updates
RUN echo "force_rebuild_src_v1" > /dev/null

# Copy source code
COPY src /app/src

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV APP_VERSION=0.1.0

EXPOSE 8000

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
