#!/bin/bash
# Final cleanup and verification

echo "🧹 Cleaning up all Caddy processes..."
pkill -9 caddy 2>/dev/null || true
sleep 2

echo "🔄 Starting caddymanager service..."
systemctl restart caddymanager

echo "⏳ Waiting for service to fully start..."
sleep 10

echo ""
echo "✅ VERIFICATION RESULTS:"
echo "======================="

echo ""
echo "1️⃣ Caddy Binary Version:"
/usr/bin/caddy version

echo ""
echo "2️⃣ Layer4 Module Status:"
/usr/bin/caddy list-modules | grep "^layer4$" && echo "   ✅ Layer4 module is present!" || echo "   ❌ Layer4 module missing"

echo ""
echo "3️⃣ Service Status:"
systemctl is-active caddymanager && echo "   ✅ Service is running" || echo "   ❌ Service is not running"

echo ""
echo "4️⃣ Recent Logs (last 20 lines):"
journalctl -u caddymanager -n 20 --no-pager | tail -n 15

echo ""
echo "5️⃣ Configuration Sync Status:"
journalctl -u caddymanager --since "30 seconds ago" --no-pager | grep -E "SYNC.*Successfully|SYNC.*Failed" | tail -n 3
