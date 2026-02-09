#!/bin/bash

# Define service path
SERVICE_FILE="/etc/systemd/system/caddymanager.service"
PROJECT_ROOT=$(pwd)
USER_NAME=$(whoami)

echo " Installing Caddy Manager Service..."
echo " Project Root: $PROJECT_ROOT"
echo "wm User: $USER_NAME"

# Create the service file
sudo bash -c "cat > $SERVICE_FILE" <<EOL
[Unit]
Description=Caddy Manager Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_ROOT
ExecStart=$PROJECT_ROOT/entrypoint.sh
Restart=always
RestartSec=5
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=development

[Install]
WantedBy=multi-user.target
EOL

# Reload Systemd
echo "yp Reloading System Daemon..."
sudo systemctl daemon-reload

# Enable Service on Boot
echo " Enabling Service on Boot..."
sudo systemctl enable caddymanager

# Start Service
echo " Starting Service..."
sudo systemctl start caddymanager

echo " Caddy Manager installed as a service!"
echo " You can now use './start.sh' to manage the service or 'sudo systemctl status caddymanager'"
