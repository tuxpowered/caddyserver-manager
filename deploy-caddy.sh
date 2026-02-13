#!/bin/bash
# Deploy custom Caddy with layer4 module

echo "🔄 Deploying custom Caddy binary with layer4 module..."

# Backup old caddy
sudo cp /usr/bin/caddy /usr/bin/caddy.backup-$(date +%Y%m%d-%H%M%S)

# Deploy new caddy
sudo cp "$(pwd)/caddy" /usr/bin/caddy
sudo chmod +x /usr/bin/caddy
sudo setcap cap_net_bind_service=+ep /usr/bin/caddy

echo "✅ Caddy binary deployed"
echo "📋 Verifying layer4 module..."
caddy list-modules | grep "^layer4$" && echo "✅ layer4 module found!" || echo "❌ layer4 module missing"

echo "🔄 Restarting caddymanager service..."
sudo systemctl restart caddymanager

echo "⏳ Waiting for service to start..."
sleep 5

echo "📊 Service status:"
sudo systemctl status caddymanager --no-pager | head -n 15

echo ""
echo "📝 Recent logs:"
sudo journalctl -u caddymanager -n 20 --no-pager | tail -n 15
