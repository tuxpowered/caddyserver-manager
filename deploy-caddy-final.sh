#!/bin/bash
# Deploy custom Caddy with layer4 module - stop service first

echo "🔄 Deploying custom Caddy binary with layer4 module..."

# Stop the service first
echo "🛑 Stopping caddymanager service..."
systemctl stop caddymanager

# Wait for processes to terminate
sleep 2

# Kill any remaining caddy processes
pkill -9 caddy 2>/dev/null || true
sleep 1

# Backup old caddy
cp /usr/bin/caddy /usr/bin/caddy.backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Deploy new caddy
echo "📦 Copying new Caddy binary..."
cp /home/project/CaddyServer-web-ui/caddy /usr/bin/caddy
chmod +x /usr/bin/caddy
setcap cap_net_bind_service=+ep /usr/bin/caddy

echo "✅ Caddy binary deployed"
echo "📋 Verifying layer4 module..."
/usr/bin/caddy list-modules | grep "^layer4$" && echo "✅ layer4 module found in /usr/bin/caddy!" || echo "❌ layer4 module missing"

echo "🔄 Starting caddymanager service..."
systemctl start caddymanager

echo "⏳ Waiting for service to start..."
sleep 8

echo "📊 Service status:"
systemctl status caddymanager --no-pager | head -n 15

echo ""
echo "📝 Recent logs (checking for successful sync):"
journalctl -u caddymanager --since "10 seconds ago" --no-pager | grep -E "SYNC|layer4|Successfully|Failed" | tail -n 15
