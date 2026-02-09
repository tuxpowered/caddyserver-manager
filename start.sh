#!/bin/bash

# Check if service is installed
if ! systemctl status caddymanager > /dev/null 2>&1 && ! systemctl is-enabled caddymanager > /dev/null 2>&1; then
    echo "❌ Error: caddymanager.service is not installed or not recognized by systemd."
    echo "Please run: sudo ./install.sh"
    exit 1
fi

# Check if service is active
if systemctl is-active --quiet caddymanager; then
    echo " Caddy Manager is ALREADY running."
    echo " Showing Status..."
    sudo systemctl status caddymanager --no-pager
else
    echo " Starting Caddy Manager Service..."
    
    # Start the service
    sudo systemctl start caddymanager
    
    # Check if it started successfully
    if systemctl is-active --quiet caddymanager; then
        echo " Service Started Successfully!"
        echo " Terminal is free! The server is running in the background."
        echo " View logs: sudo journalctl -u caddymanager -f"
    else
        echo "❌ Failed to start service. Checking logs..."
        sudo journalctl -u caddymanager -n 20 --no-pager
    fi
fi
