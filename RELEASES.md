# Release Notes v2.0.0

🚀 Caddy Manager v2.0.0 - Major Update

We are excited to announce version 2.0.0 of Caddy Manager, a powerful, high-performance web dashboard for managing Caddy Server with advanced orchestration capabilities.

## ✨ Key Highlights

### 🛡 Advanced Orchestration
- **Layer4 / Stream Support**: Full support for TCP/UDP port forwarding directly from the UI.
- **DNS Suite**: Integrated with 15+ DNS providers (Cloudflare, DigitalOcean, Route53, etc.) for seamless wildcard SSL certificates.
- **Site Management**: Easily add, edit, and delete domain configurations with real-time sync to Caddy.

### 🎨 Modern UI/UX
- **Adaptive Design**: Deep glassmorphism aesthetic with theme-aware components.
- **Processing Overlays**: New visual feedback for SSL renewals, downloads, and domain operations.
- **Real-time Terminal**: Web-based terminal access for direct server interaction.

### 🔒 Security & Performance
- **ACME Automation**: Automatic SSL management with custom policy logic.
- **IP Blocking**: Fine-grained access control for domains.
- **Optimized Backend**: Lightweight Node.js/SQLite architecture for maximum speed.

## 📦 What's New
- **GitHub Community Files**: Added `LICENSE` (ISC), `CONTRIBUTING.md`, and comprehensive Issue/PR templates.
- **Automated Workflows**: Implemented GitHub Actions for automatic releases and deployment.
- **Unified Installer**: A robust `install.sh` for one-click setup on Linux environments.
- **Local Packaging**: New `create-release.sh` utility to generate portable .tar.gz assets.

## 🛠 Installation
To install this release on a fresh Linux server:
```bash
curl -sSL https://raw.githubusercontent.com/lyarinet/Caddy-Manager/main/install.sh | bash
```

## 🔐 Default Credentials
- **Username**: admin
- **Password**: caddy123 (Please change your password immediately after login!)
- **URL**: localhost:3000

---
Full Changelog: https://github.com/lyarinet/Caddy-Manager/commits/v2.0.0
