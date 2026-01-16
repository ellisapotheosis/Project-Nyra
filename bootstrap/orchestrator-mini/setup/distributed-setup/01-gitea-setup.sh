#!/bin/bash
# Gitea Setup Script for Orchestrator PC
# Project Nyra - 4-PC Distributed Architecture

set -e

echo "🚀 Project Nyra - Gitea Setup"
echo "=============================="
echo ""

# Configuration
GITEA_VERSION="1.21.4"
GITEA_HOME="/var/lib/gitea"
GITEA_USER="git"
GITEA_PORT="3000"
SSH_PORT="2222"
DB_TYPE="sqlite3"  # Options: sqlite3, postgres, mysql

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root or with sudo"
    exit 1
fi

echo "📋 Configuration:"
echo "  - Gitea Version: ${GITEA_VERSION}"
echo "  - Install Path: ${GITEA_HOME}"
echo "  - HTTP Port: ${GITEA_PORT}"
echo "  - SSH Port: ${SSH_PORT}"
echo "  - Database: ${DB_TYPE}"
echo ""

read -p "Continue with installation? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled"
    exit 1
fi

# Step 1: Create git user
echo "👤 Creating git user..."
if id "${GITEA_USER}" &>/dev/null; then
    echo "  ✓ User ${GITEA_USER} already exists"
else
    useradd -m -d ${GITEA_HOME} -s /bin/bash ${GITEA_USER}
    echo "  ✓ User ${GITEA_USER} created"
fi

# Step 2: Download Gitea
echo "📥 Downloading Gitea ${GITEA_VERSION}..."
cd /tmp
ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
    GITEA_BINARY="gitea-${GITEA_VERSION}-linux-amd64"
elif [ "$ARCH" = "aarch64" ]; then
    GITEA_BINARY="gitea-${GITEA_VERSION}-linux-arm64"
else
    echo "❌ Unsupported architecture: ${ARCH}"
    exit 1
fi

wget -O gitea https://dl.gitea.io/gitea/${GITEA_VERSION}/${GITEA_BINARY}
chmod +x gitea
mv gitea /usr/local/bin/gitea
echo "  ✓ Gitea binary installed"

# Step 3: Create directory structure
echo "📁 Creating directory structure..."
mkdir -p ${GITEA_HOME}/{custom,data,log}
mkdir -p /etc/gitea
chown -R ${GITEA_USER}:${GITEA_USER} ${GITEA_HOME}
chmod 750 ${GITEA_HOME}
chown root:${GITEA_USER} /etc/gitea
chmod 770 /etc/gitea
echo "  ✓ Directories created"

# Step 4: Create systemd service
echo "⚙️  Creating systemd service..."
cat > /etc/systemd/system/gitea.service << 'EOF'
[Unit]
Description=Gitea (Git with a cup of tea)
After=syslog.target
After=network.target

[Service]
Type=simple
User=git
Group=git
WorkingDirectory=/var/lib/gitea/
ExecStart=/usr/local/bin/gitea web --config /etc/gitea/app.ini
Restart=always
Environment=USER=git HOME=/var/lib/gitea
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_BIND_SERVICE
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
echo "  ✓ Systemd service created"

# Step 5: Create initial configuration
echo "📝 Creating initial configuration..."
cat > /etc/gitea/app.ini << EOF
APP_NAME = Project Nyra Gitea
RUN_MODE = prod
RUN_USER = ${GITEA_USER}

[server]
PROTOCOL = http
DOMAIN = localhost
ROOT_URL = http://localhost:${GITEA_PORT}/
HTTP_PORT = ${GITEA_PORT}
DISABLE_SSH = false
SSH_PORT = ${SSH_PORT}
SSH_LISTEN_PORT = ${SSH_PORT}
LFS_START_SERVER = true
OFFLINE_MODE = false

[database]
DB_TYPE = ${DB_TYPE}
HOST = 127.0.0.1:3306
NAME = gitea
USER = gitea
PASSWD =
SSL_MODE = disable
PATH = ${GITEA_HOME}/data/gitea.db

[repository]
ROOT = ${GITEA_HOME}/data/gitea-repositories
DEFAULT_BRANCH = main

[security]
INSTALL_LOCK = false
SECRET_KEY =
INTERNAL_TOKEN =

[service]
DISABLE_REGISTRATION = false
REQUIRE_SIGNIN_VIEW = false
REGISTER_EMAIL_CONFIRM = false
ENABLE_NOTIFY_MAIL = false
DEFAULT_KEEP_EMAIL_PRIVATE = false

[mailer]
ENABLED = false

[log]
MODE = file
LEVEL = info
ROOT_PATH = ${GITEA_HOME}/log

[session]
PROVIDER = file
PROVIDER_CONFIG = ${GITEA_HOME}/data/sessions

[picture]
DISABLE_GRAVATAR = false
ENABLE_FEDERATED_AVATAR = false

[openid]
ENABLE_OPENID_SIGNIN = false
ENABLE_OPENID_SIGNUP = false

[webhook]
ALLOWED_HOST_LIST = *

[actions]
ENABLED = true
DEFAULT_ACTIONS_URL = https://github.com
EOF

chown root:${GITEA_USER} /etc/gitea/app.ini
chmod 640 /etc/gitea/app.ini
echo "  ✓ Configuration file created"

# Step 6: Start Gitea
echo "🎬 Starting Gitea..."
systemctl enable gitea
systemctl start gitea
sleep 5

if systemctl is-active --quiet gitea; then
    echo "  ✓ Gitea is running"
else
    echo "  ❌ Gitea failed to start. Check logs with: journalctl -u gitea -f"
    exit 1
fi

# Step 7: Configure firewall (if ufw is installed)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    ufw allow ${GITEA_PORT}/tcp comment 'Gitea HTTP'
    ufw allow ${SSH_PORT}/tcp comment 'Gitea SSH'
    echo "  ✓ Firewall rules added"
fi

echo ""
echo "✅ Gitea installation complete!"
echo ""
echo "📋 Next Steps:"
echo "  1. Open your browser to: http://localhost:${GITEA_PORT}"
echo "  2. Complete the initial setup wizard"
echo "  3. Create your admin account"
echo "  4. (Optional) Run Cloudflared setup: ./02-cloudflared-setup.sh"
echo ""
echo "🔧 Useful Commands:"
echo "  - Status: systemctl status gitea"
echo "  - Logs: journalctl -u gitea -f"
echo "  - Restart: systemctl restart gitea"
echo "  - Stop: systemctl stop gitea"
echo ""
echo "📖 Documentation: /c/Dev/Projects/Repos/Project-Nyra/bootstrap/docs/distributed-architecture.md"
