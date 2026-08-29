#!/bin/bash
# Oracle-VPS SSH Configuration Fix
# Resolves port 22 timeout / sshd not listening issue

set -e

ORACLE_IP="${ORACLE_IP:-100.64.0.31}"
ORACLE_USER="${ORACLE_USER:-ubuntu}"

echo "=== Oracle-VPS SSH Fix ==="
echo "Target: $ORACLE_IP"
echo

# Step 1: Check if we can reach oracle-vps at all
echo "[1/5] Testing basic connectivity..."
if ! ping -c 1 -W 2 $ORACLE_IP &>/dev/null; then
  echo "❌ Cannot ping $ORACLE_IP"
  echo "   Possible causes:"
  echo "   - Oracle-VPS is down"
  echo "   - Network unreachable"
  echo "   - Tailscale not connected"
  exit 1
fi
echo "✅ Ping successful"

# Step 2: Check if port 22 is open (from remote)
echo "[2/5] Checking SSH port 22..."
if timeout 5 bash -c "echo > /dev/tcp/$ORACLE_IP/22" 2>/dev/null; then
  echo "✅ Port 22 is listening"
  SSH_WORKING=1
else
  echo "⚠️  Port 22 not responding (sshd may not be running)"
  SSH_WORKING=0
fi

# Step 3: If SSH not working, try to fix via Portainer
if [ $SSH_WORKING -eq 0 ]; then
  echo "[3/5] Attempting sshd restart via docker exec..."
  echo "      (Requires Portainer access or direct docker access)"

  # Try direct docker exec if available
  if command -v docker &>/dev/null && docker context ls 2>/dev/null | grep -q oracle; then
    echo "     Using docker context: oracle"
    docker --context oracle exec $(docker --context oracle ps -q -f label=service=sshd 2>/dev/null || echo "error") \
      sudo systemctl restart ssh 2>/dev/null || {
      echo "⚠️  Docker exec failed. Trying manual steps..."
    }
  else
    echo "⚠️  Docker CLI not available for oracle context"
    echo "    Manual fix required on oracle-vps:"
    cat << 'EOF'

    Run these commands on oracle-vps (console/serial):
    ---
    sudo systemctl status ssh
    sudo systemctl restart ssh
    sudo ss -tlnp | grep sshd
    ---

    Then re-run this script.
EOF
    exit 1
  fi
fi

# Step 4: Add SSH keys to authorized_keys
echo "[4/5] Adding SSH public key to authorized_keys..."

# Get local public key
if [ ! -f ~/.ssh/id_ed25519.pub ]; then
  echo "❌ No SSH key found at ~/.ssh/id_ed25519.pub"
  echo "   Generate one with: ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519"
  exit 1
fi

LOCAL_KEY=$(cat ~/.ssh/id_ed25519.pub)

# Copy key to oracle-vps (requires either direct SSH or docker copy)
if [ $SSH_WORKING -eq 1 ]; then
  echo "$LOCAL_KEY" | ssh -o ConnectTimeout=5 $ORACLE_USER@$ORACLE_IP \
    "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys" \
    && echo "✅ Key added" || {
    echo "❌ SSH key copy failed"
    exit 1
  }
else
  echo "⚠️  SSH not yet working, cannot add key"
  echo "    After SSH is fixed, add this key manually:"
  echo "    $LOCAL_KEY"
fi

# Step 5: Test connection
echo "[5/5] Testing SSH connection..."
if timeout 10 ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $ORACLE_USER@$ORACLE_IP \
  "docker ps -q | wc -l" >/dev/null 2>&1; then
  echo "✅ SSH connection successful"
  echo
  echo "=== SUCCESS ==="
  echo "Oracle-VPS is now reachable via SSH"
  echo
  ssh $ORACLE_USER@$ORACLE_IP "uname -a && docker ps --format 'table {{.Names}}\t{{.Status}}' | head -5"
  exit 0
else
  echo "❌ SSH connection still failing"
  echo
  echo "Troubleshooting steps:"
  echo "1. Verify sshd is running on oracle-vps: systemctl status ssh"
  echo "2. Check sshd config: grep -E '^Port|^PermitRootLogin' /etc/ssh/sshd_config"
  echo "3. Check firewall: sudo iptables -L | grep 22"
  echo "4. Review logs: sudo journalctl -u ssh -n 20"
  exit 1
fi
