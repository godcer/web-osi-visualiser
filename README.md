# OSI Visualizer with Cyber SOC UI

A premium, interactive visualization tool for the OSI model and Cyber SOC operations.

## Features
- **3D OSI Model**: Interactive exploded view of OSI layers.
- **Cyber SOC Dashboard**: Real-time visualization of mock security alerts and verify traffic.
- **Attack Simulation**: Visual simulation of DDoS attacks on OSI layers.
- **Protocol Helix**: Dynamic visualization of network protocols.

## Setup

### Prerequisites
- Python 3.8+
- Modern Web Browser (Chrome/Edge recommended)

### Backend Setup
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
   *(Note: If requirements.txt is missing, install dependencies from pyproject.toml)*

### Running the Application
1. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
2. Open the frontend:
   - Navigate to the `frontend` directory and open `index.html` in your browser.
   - OR assume the backend serves the static files (check configuration).

## License
MIT
