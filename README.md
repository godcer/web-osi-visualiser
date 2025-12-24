# OSI Visualizer with Cyber SOC UI

A premium, interactive visualization tool for the OSI model and Cyber SOC operations.

## Features
- **3D OSI Model**: Interactive exploded view of OSI layers.
- **Cyber SOC Dashboard**: Real-time visualization of mock security alerts and verify traffic.
- **Attack Simulation**: Visual simulation of DDoS attacks on OSI layers.
- **Protocol Helix**: Dynamic visualization of network protocols.

## Quick Start (Docker)

The easiest way to run the application is using Docker.

1.  **Install Docker Desktop** if you haven't already.
2.  Run the following command in the project root:
    ```bash
    docker-compose up --build
    ```
3.  Open [http://localhost:8000/frontend/index.html](http://localhost:8000/frontend/index.html) in your browser.

## Manual Setup (Alternative)

### Prerequisites
- Python 3.8+
- Modern Web Browser (Chrome/Edge recommended)

### Steps
1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix: `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
5. Open `frontend/index.html` in your browser.

## License
MIT
