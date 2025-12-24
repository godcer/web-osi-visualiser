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

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Expose port
EXPOSE 8000

# Run command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
