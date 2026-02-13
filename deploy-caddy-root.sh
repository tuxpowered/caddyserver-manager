#!/bin/bash
# Deploy custom Caddy with layer4 module

echo "🔄 Deploying custom Caddy binary with layer4 module..."

# Backup old caddy
cp /usr/bin/caddy /usr/bin/caddy.backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# Deploy new caddy
cp "$(pwd)/caddy" /usr/bin/caddy
chmod +x /usr/bin/caddy
setcap cap_net_bind_service=+ep /usr/bin/caddy

echo "✅ Caddy binary deployed"
echo "📋 Verifying layer4 module..."
caddy list-modules | grep "^layer4$" && echo "✅ layer4 module found!" || echo "❌ layer4 module missing"

echo "🔄 Restarting caddymanager service..."
systemctl restart caddymanager

echo "⏳ Waiting for service to start..."
sleep 5

echo "📊 Service status:"
systemctl status caddymanager --no-pager | head -n 15

echo ""
echo "📝 Recent logs (checking for layer4 errors):"
journalctl -u caddymanager -n 30 --no-pager | grep -E "SYNC|layer4|Successfully" | tail -n 10
