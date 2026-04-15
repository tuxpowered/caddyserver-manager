#!/bin/bash

# Caddyserver WebUI - Universal Installer
# Supports Ubuntu 22.04, 24.04, Debian, and other major distros.
# Lyarinet developer by @Lyarinet   1

set -e

PROJECT_ROOT=$(pwd)

echo "🚀 Starting Universal Caddyserver WebUI Installation..."

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION_ID=$VERSION_ID
else
    echo "❌ Cannot detect OS. Assuming Debian-based."
    OS="debian"
fi

echo "📦 Detected OS: $OS ($VERSION_ID)"

# 1. Update system
echo "🔄 Updating package lists..."
if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
    echo "🏗 Setting up Caddy repositories (User-specified)..."
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor --batch --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo chmod o+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    sudo chmod o+r /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update
    INSTALL_CMD="sudo apt-get install -y"

    # 2. Install basic dependencies and build tools
    echo "🛠 Installing system utilities and build tools..."
    # Remove old golang-go if it exists to prevent path conflicts
    sudo apt-get remove -y golang-go || true
    $INSTALL_CMD curl debian-keyring debian-archive-keyring apt-transport-https build-essential python3 g++ make git bc psmisc
elif [[ "$OS" == "fedora" || "$OS" == "rhel" || "$OS" == "centos" ]]; then
    sudo dnf check-update || true
    INSTALL_CMD="sudo dnf install -y"
elif [[ "$OS" == "arch" ]]; then
    sudo pacman -Sy
    INSTALL_CMD="sudo pacman -S --noconfirm"
elif [[ "$OS" == "alpine" ]]; then
    apk update
    INSTALL_CMD="apk add"
    # Enable community repo for some rc scripts
    sed -i 's|^#http://dl-cdn.alpinelinux.org/alpine/v3.23/community|http://dl-cdn.alpinelinux.org/alpine/v3.23/community|' /etc/apk/repositories
    echo "Installing system tools"
    $INSTALL_CMD curl xcaddy caddy-openrc sudo python3 make git psmisc g++
    # Adds the official caddy starup script
    rc-update add caddy
else
    echo "⚠️ Unknown OS. Defaulting to 'apt-get'. Installation might fail."
    INSTALL_CMD="sudo apt-get install -y"
fi



# Ensure project files exist (Auto-clone if run via curl | bash)
if [[ ! -f "entrypoint.sh" || ! -d "CaddyServer-backend" ]]; then
    INSTALL_DIR="/opt/Caddy-Manager"
    echo "📥 Project files not found locally. Cloning to $INSTALL_DIR..."
    sudo rm -rf "$INSTALL_DIR"
    sudo git clone https://github.com/lyarinet/caddyserver-manager.git "$INSTALL_DIR"
    sudo chown -R $(whoami):$(whoami) "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    PROJECT_ROOT=$(pwd)
fi

# 3. Install/Update Go (Ensure >= 1.22)
install_go() {
    if [[ $OS=="alpine" ]]; then
        echo "Skipping GO install, installed with xcaddy"
        return 0
    if

    echo "🟢 Installing/Updating Go to v1.22.5..."
    GO_VERSION="1.22.5"
    ARCH=$(uname -m)
    if [[ "$ARCH" == "x86_64" ]]; then
        GO_ARCH="amd64"
    elif [[ "$ARCH" == "aarch64" ]]; then
        GO_ARCH="arm64"
    else
        GO_ARCH="amd64" # Fallback
    fi
    
    curl -LO "https://go.dev/dl/go${GO_VERSION}.linux-${GO_ARCH}.tar.gz"
    sudo rm -rf /usr/local/go
    sudo tar -C /usr/local -xzf "go${GO_VERSION}.linux-${GO_ARCH}.tar.gz"
    rm "go${GO_VERSION}.linux-${GO_ARCH}.tar.gz"
    
    # Prepend to PATH for immediate use
    export PATH=/usr/local/go/bin:$PATH
    
    # Force system-wide priority by symlinking to /usr/bin/go
    sudo ln -sf /usr/local/go/bin/go /usr/bin/go
}

# Check version using full path if needed
CURRENT_GO_VERSION=$(/usr/local/go/bin/go version 2>/dev/null | grep -oP 'go\K[0-9]+\.[0-9]+' || echo "0.0")
if (( $(echo "$CURRENT_GO_VERSION < 1.22" | bc -l) )); then
    echo "⚠️ Go version ($CURRENT_GO_VERSION) is too old or not found. Installing..."
    install_go
else
    echo "✅ Go version ($CURRENT_GO_VERSION) is sufficient."
    export PATH=/usr/local/go/bin:$PATH
    sudo ln -sf /usr/local/go/bin/go /usr/bin/go
fi

# 4. Install Node.js (Latest LTS)
if ! command -v node &> /dev/null; then
    echo "🟢 Installing Node.js..."
    if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ "$OS" == "alpine" ]]; then
        $INSTALL_CMD nodejs npm
    else
        echo "⚠️ Please install Node.js manually for your distribution ($OS)."
    fi
else
    echo "✅ Node.js already installed ($(node -v))"
fi

# 5. Install Caddy Server (Custom Build with Layer4)
echo "🌐 Setting up Caddy Server with Layer4 support..."

# Ensure xcaddy is available
if ! command -v xcaddy &> /dev/null; then
    echo "   - Installing xcaddy..."
    if [[ "$OS" == "ubuntu" || "$OS" == "debian" ]]; then
        sudo rm -f /usr/share/keyrings/caddy-xcaddy-archive-keyring.gpg
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/xcaddy/gpg.key' | sudo gpg --dearmor --batch --yes -o /usr/share/keyrings/caddy-xcaddy-archive-keyring.gpg
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/xcaddy/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-xcaddy.list
        sudo apt-get update
        sudo apt-get install xcaddy -y
    else
        export PATH=$PATH:/usr/local/go/bin
        go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
        export PATH=$PATH:$(go env GOPATH)/bin
    fi
fi

# Build Caddy with Layer4 and all required DNS modules
echo "🏗 Building Caddy with Layer4 and 15+ DNS modules..."
# Explicitly pass PATH to ensure xcaddy finds the correct go binary
if [[ $OS=="alpine" ]]; then
    # Alpine uses RAM disk for /tmp, this sets the tmp build folder to the current folder.
    # this is needed to avoid the 'no disk space error'
    export TMPDIR=$PWD ; export GOCACHE=$PWD/.cache
fi
    
PATH=/usr/local/go/bin:$PATH xcaddy build v2.11.2 \
    --with github.com/mholt/caddy-l4 \
    --with github.com/caddy-dns/cloudns \
    --with github.com/caddy-dns/cloudflare \
    --with github.com/caddy-dns/duckdns \
    --with github.com/caddy-dns/gandi \
    --with github.com/caddy-dns/route53 \
    --with github.com/caddy-dns/digitalocean \
    --with github.com/caddy-dns/googleclouddns \
    --with github.com/caddy-dns/azure \
    --with github.com/caddy-dns/namecheap \
    --with github.com/caddy-dns/vultr \
    --with github.com/caddy-dns/ovh \
    --with github.com/caddy-dns/hetzner \
    --with github.com/caddy-dns/porkbun \
    --with github.com/caddy-dns/godaddy \
    --with github.com/caddy-dns/acmedns \
    --output ./caddy_custom
if [[ $OS=="alpine" ]]; then
    # Moved here becuse we are using the systems caddy-openrc config
    chmod +x ./caddy_custom
    mv ./caddy_custom /usr/sbin/caddy
else
    sudo chmod +x ./caddy_custom
    sudo mv ./caddy_custom /usr/bin/caddy
    sudo setcap cap_net_bind_service=+ep /usr/bin/caddy
fi
echo "✅ Custom Caddy (v2.11.2 with Layer4 & DNS Suite) installed to /usr/bin/caddy"

# 6. Install Project Dependencies
echo "🏗 Installing Project Dependencies..."

echo "--- Backend ---"
cd "$PROJECT_ROOT/CaddyServer-backend"
# Ensure we have a clean state for native modules
rm -rf node_modules/node-pty/build
rm -rf node_modules/sqlite3/build
npm install --include=dev
echo "   - Rebuilding native modules (node-pty, sqlite3)..."
sudo npm rebuild node-pty sqlite3 --build-from-source --unsafe-perm

echo "--- Frontend ---"
cd "$PROJECT_ROOT/CaddyServer-frontend"
npm install --include=dev

echo "--- Project Root ---"
cd "$PROJECT_ROOT"

# 7. Set Permissions and Install Service
echo "🔐 Setting executable permissions..."
chmod +x start.sh
chmod +x install-service.sh
chmod +x entrypoint.sh

echo "⚙️ Installing system service..."
sudo ./install-service.sh

echo ""
echo "✨ UNIVERSAL INSTALLATION COMPLETE!"
echo "------------------------------------------------"
echo "The service 'caddymanager' has been installed and started."
echo "To manage the service, run: ./start.sh"
echo "To view logs, run: sudo journalctl -u caddymanager -f"
echo "------------------------------------------------"
