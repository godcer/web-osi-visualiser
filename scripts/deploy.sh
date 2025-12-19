#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv nginx git

# Clone repo (assuming it's pulled)
# cd /path/to/repo

# Setup Virtual Env
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install poetry
poetry config virtualenvs.create false
poetry install --no-dev

# Setup Systemd Service
sudo bash -c 'cat > /etc/systemd/system/osi-analyzer.service << EOL
[Unit]
Description=Web OSI Intelligence Analyzer
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/web-osi-intelligence-analyzer
Environment="PATH=/home/ubuntu/web-osi-intelligence-analyzer/venv/bin"
ExecStart=/home/ubuntu/web-osi-intelligence-analyzer/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOL'

# Start Service
sudo systemctl daemon-reload
sudo systemctl start osi-analyzer
sudo systemctl enable osi-analyzer

# Setup Nginx
sudo bash -c 'cat > /etc/nginx/sites-available/osi-analyzer << EOL
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOL'

sudo ln -s /etc/nginx/sites-available/osi-analyzer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "Deployment Complete!"
