# CaddyServer Backend

The robust Node.js + Express middleware powering the Caddy Manager. It handles data persistence, orchestration of the Caddy Admin API, and WebSocket streams.

## 🛠 Features

- **SQLite3 Integration**: Persistent storage for domains, streams, and application settings.
- **Caddy Orchestration**: Real-time sync with Caddy's Admin API (native JSON config).
- **WebSocket Terminal**: Powered by `node-pty` for direct server access.
- **Security Suite**: Logic for HSTS, Force SSL, and HTTP/2 enforcement.

## 📦 API Documentation

### Domains

#### `GET /api/domains`
Retrieve all configured domains.

#### `POST /api/domains`
Create a new domain configuration.

**Payload:**
{
  "host": "example.com",
  "upstream": "localhost:8080, localhost:8081",
  "ssl": true,
  "force_ssl": true,
  "http2_enabled": true,
  "hsts_enabled": true,
  "hsts_subdomains": false,
  "template": "proxy",
  "upstream_proto": "https",
  "lb_policy": "round_robin",
  "health_check_enabled": true,
  "header_rules": [
    { "op": "set", "name": "X-Frame-Options", "value": "DENY" }
  ],
  "file_browse_enabled": true
}
```

#### `PUT /api/domains/:id`
Update an existing domain. Accepts the same payload as `POST`.

### System

#### `POST /api/load`
Manually trigger a full Caddy configuration reload from the database.

## 🗄️ Database Schema

### `domains` Table
| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | INTEGER | PK | Auto-increment ID |
| `host` | TEXT | | Domain name |
| `upstream` | TEXT | | Target (IP:Port, Path, or comma-separated list) |
| `ssl` | INTEGER | 1 | Enable/Disable Auto-HTTPS |
| `force_ssl` | INTEGER | 1 | Enforce HTTPS redirection |
| `http2_enabled` | INTEGER | 1 | Enable HTTP/2 support |
| `hsts_enabled` | INTEGER | 0 | Enable Strict-Transport-Security |
| `hsts_subdomains`| INTEGER | 0 | Include subdomains in HSTS |
| `template` | TEXT | 'proxy' | Site blueprint (proxy, static, spa, php) |
| `upstream_proto`| TEXT | 'http' | Upstream protocol (http, https) |
| `lb_policy` | TEXT | 'random' | LB selection policy |
| `health_check_enabled` | INTEGER | 0 | Enable active health monitoring |
| `header_rules` | TEXT | '[]' | JSON array of header transformation rules |
| `file_browse_enabled` | INTEGER | 1 | Enable directory browsing UI |
| `dns_provider` | TEXT | | DNS Provider for Challenges |

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server (Port 4000)
npm start
```

## 🔒 Security Implementation

The backend automatically injects security headers based on the database flags:
- **HSTS**: Adds `Strict-Transport-Security` header with `max-age=31536000; preload`.
- **Force SSL**: Caddy automatically handles HTTP->HTTPS redirects when SSL is enabled, but the `force_ssl` flag explicitly validates this behavior in the sync logic.
