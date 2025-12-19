FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (scapy needs libpcap, netifaces needs build tools)
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libpcap-dev \
    iputils-ping \
    traceroute \
    && rm -rf /var/lib/apt/lists/*

# Install poetry
RUN pip install poetry

# Copy project files
COPY pyproject.toml poetry.lock* ./

# Configure poetry to not create a virtualenv
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --no-dev --no-interaction --no-ansi

# Copy app code
COPY . .

# Expose port
EXPOSE 8000

# Run command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
