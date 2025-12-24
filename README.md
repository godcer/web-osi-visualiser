![OSI Visualizer Banner](assets/banner.png)

# OSI Visualizer with Cyber SOC UI

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.68%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A premium, interactive visualization tool designed to bridge the gap between abstract network concepts and real-time security operations. This project features a 3D exploded view of the OSI model integrated with a high-fidelity Cyber SOC dashboard.

## ✨ Features

- **🌐 3D OSI Model**: Interactive, exploded view of OSI layers allowing deep inspection of protocols at each level.
- **🛡️ Cyber SOC Dashboard**: Real-time visualization of simulated security alerts, network traffic, and threat intelligence.
- **⚔️ Attack Simulation**: Visual simulation of DDoS attacks affecting specific OSI layers with real-time feedback.
- **🧬 Protocol Helix**: Dynamic, 3D visualization of network protocols demonstrating encapsulation and decapsulation.
- **⚡ Reactive UI**: Glassmorphism-inspired interface with neon accents, smooth animations, and responsiveness.

## 📸 Visuals

*(Attack simulation visualization and 3D interactions)*

## 🚀 Quick Start (Docker)

The easiest way to get the application running is via Docker.

1.  **Prerequisites**: Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop) is installed.
2.  **Clone & Run**:
    ```bash
    git clone <repository-url>
    cd osi-visualizer
    docker-compose up --build
    ```
3.  **Access**: Open [http://localhost:8000/frontend/index.html](http://localhost:8000/frontend/index.html) in your browser.

## 🛠️ Manual Setup

If you prefer running locally without Docker:

### Prerequisites
- Python 3.8+
- Modern Web Browser (Chrome/Edge recommended)

### Installation Steps

1.  **Create Virtual Environment**:
    ```bash
    python -m venv venv
    ```

2.  **Activate Environment**:
    - **Windows**: `venv\Scripts\activate`
    - **Unix/MacOS**: `source venv/bin/activate`

3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Start Backend**:
    ```bash
    uvicorn app.main:app --reload
    ```

5.  **Launch Frontend**:
    Open `frontend/index.html` directly in your browser or serve it via a simple HTTP server.

## 💻 Tech Stack

- **Backend**: Python, FastAPI, Uvicorn
- **Frontend**: HTML5, CSS3 (Glassmorphism), JavaScript (ES6+)
- **Visualization**: Custom CSS 3D Transforms (No external 3D libraries used for core helix/OSI layers to ensure performance)
- **Containerization**: Docker, Docker Compose

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
