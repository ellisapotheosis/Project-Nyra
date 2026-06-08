#!/bin/bash
# PKI Bootstrap Script for Project Nyra Cluster
# Initializes SSH CA trust and issues certificates on cluster nodes
# Usage: bash pki-init.sh <machine-name>

set -euo pipefail

# Configuration
MACHINE_NAME="${1:?machine name required (orchestrator|worker-rtx5090|worker-rtx3090ti|worker-rtx3060)}"
INFISICAL_API="${INFISICAL_API_URL:-https://app.infisical.com}"
CERT_DIR="/etc/ssh/certs"
SSH_CONFIG_DIR="/etc/ssh/sshd_config.d"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Logging
log_info() {
    echo "[INFO] $1" >&2
}

log_success() {
    echo "[✓] $1" >&2
}

log_error() {
    echo "[ERROR] $1" >&2
    exit 1
}

# Validate environment
validate_env() {
    log_info "Validating environment..."

    [ -n "${INFISICAL_TOKEN:-}" ] || log_error "INFISICAL_TOKEN not set"

    # Verify Infisical is reachable
    if ! curl -s -f -H "Authorization: Bearer ${INFISICAL_TOKEN}" \
        "${INFISICAL_API}/api/v1/pki/ca/nyra-ssh-ca/certificate" >/dev/null 2>&1; then
        log_error "Cannot reach Infisical PKI at ${INFISICAL_API}"
    fi

    log_success "Environment validated"
}

# Fetch SSH CA public key from Infisical
fetch_ca_pubkey() {
    log_info "Fetching SSH CA public key from Infisical..."

    local ca_key
    ca_key=$(curl -s -f -H "Authorization: Bearer ${INFISICAL_TOKEN}" \
        "${INFISICAL_API}/api/v1/pki/ca/nyra-ssh-ca/public-key" | jq -r '.publicKey')

    if [ -z "$ca_key" ] || [ "$ca_key" = "null" ]; then
        log_error "Failed to fetch SSH CA public key"
    fi

    echo "$ca_key"
    log_success "CA public key fetched"
}

# Install CA trust on sshd
install_ca_trust() {
    local ca_pubkey="$1"

    log_info "Installing SSH CA public key to sshd..."

    if [ ! -d "$SSH_CONFIG_DIR" ]; then
        mkdir -p "$SSH_CONFIG_DIR"
    fi

    # Write CA public key
    echo "$ca_pubkey" > /etc/ssh/trusted-user-ca-keys.pem
    chmod 644 /etc/ssh/trusted-user-ca-keys.pem

    # Create sshd config for CA trust
    cat > "${SSH_CONFIG_DIR}/ca-trust.conf" <<'EOF'
# Infisical SSH CA Trust Configuration
# Issued by: pki-init.sh
# Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)

# Trust Infisical-issued SSH CA certificates
TrustedUserCAKeys /etc/ssh/trusted-user-ca-keys.pem

# Authentication settings
PubkeyAuthentication yes
PasswordAuthentication no
AuthenticationMethods publickey

# Certificate-specific permissions
PermitTTY yes
PermitOpen any
PermitUserEnvironment no

# Forwarding options
AllowTcpForwarding yes
PermitTunnel yes
X11Forwarding no
EOF

    # Validate sshd config
    if ! sshd -t -f "${SSH_CONFIG_DIR}/ca-trust.conf" 2>/dev/null; then
        log_error "sshd config validation failed"
    fi

    log_success "CA trust installed to sshd"
}

# Install CA key for client SSH
install_client_ca() {
    local ca_pubkey="$1"

    log_info "Installing SSH CA key for client SSH..."

    # For local users, create symlink in ssh config
    if [ -d "/root/.ssh" ]; then
        echo "$ca_pubkey" > /root/.ssh/trusted-user-ca-keys.pem
        chmod 644 /root/.ssh/trusted-user-ca-keys.pem
    fi

    log_success "Client CA key installed"
}

# Issue SSH certificate for machine
issue_certificate() {
    log_info "Requesting SSH certificate from Infisical CA..."

    local cert_response
    cert_response=$(curl -s -f -X POST \
        -H "Authorization: Bearer ${INFISICAL_TOKEN}" \
        -H "Content-Type: application/json" \
        "${INFISICAL_API}/api/v1/pki/ca/nyra-ssh-ca/issue" \
        -d "{
            \"machine\": \"${MACHINE_NAME}\",
            \"ttl\": \"8h\",
            \"principals\": [\"deploy\", \"root\", \"orchestrator\"]
        }" 2>/dev/null)

    if [ -z "$cert_response" ]; then
        log_error "No response from Infisical when issuing certificate"
    fi

    local ssh_cert
    ssh_cert=$(echo "$cert_response" | jq -r '.certificate // .ssh_cert // empty')

    if [ -z "$ssh_cert" ] || [ "$ssh_cert" = "null" ]; then
        echo "Response: $cert_response" >&2
        log_error "Failed to issue SSH certificate. Check Infisical CA status."
    fi

    echo "$ssh_cert"
    log_success "Certificate issued"
}

# Install SSH certificate
install_certificate() {
    local ssh_cert="$1"

    log_info "Installing SSH certificate..."

    mkdir -p "$CERT_DIR"

    # Detect key name from machine
    local key_file="${CERT_DIR}/id_ed25519-cert.pub"

    echo "$ssh_cert" > "$key_file"
    chmod 644 "$key_file"

    # Verify certificate
    if ! ssh-keygen -L -f "$key_file" >/dev/null 2>&1; then
        log_error "Certificate validation failed"
    fi

    # Extract certificate details
    local principals validity
    principals=$(ssh-keygen -L -f "$key_file" 2>/dev/null | grep "Principals:" | awk '{$1=""; print $0}')
    validity=$(ssh-keygen -L -f "$key_file" 2>/dev/null | grep "Valid:" | awk '{$1=""; print $0}')

    log_success "Certificate installed: $key_file"
    log_info "  Principals:$principals"
    log_info "  Validity:$validity"
}

# Configure SSH client (for inter-node communication)
configure_ssh_client() {
    log_info "Configuring SSH client for inter-node communication..."

    mkdir -p /root/.ssh

    cat >> /root/.ssh/config <<'EOF'
# Infisical SSH CA configuration
Host *.trex-fiordland.ts.net
    User deploy
    IdentityFile /etc/ssh/certs/id_ed25519-cert.pub
    StrictHostKeyChecking accept-new
    UserKnownHostsFile /etc/ssh/known_hosts
    IdentitiesOnly yes
    PreferredAuthentications publickey
EOF

    chmod 600 /root/.ssh/config
    log_success "SSH client configured"
}

# Verify setup
verify_setup() {
    log_info "Verifying PKI setup..."

    # Check sshd trust
    if grep -q "TrustedUserCAKeys" "${SSH_CONFIG_DIR}/ca-trust.conf"; then
        log_success "sshd CA trust configured"
    else
        log_error "sshd CA trust not found"
    fi

    # Check certificate
    if [ -f "${CERT_DIR}/id_ed25519-cert.pub" ]; then
        log_success "SSH certificate installed"
        ssh-keygen -L -f "${CERT_DIR}/id_ed25519-cert.pub" | head -5 >&2
    else
        log_error "SSH certificate not found"
    fi

    # Check SSH config
    if [ -f /root/.ssh/config ] && grep -q "trex-fiordland.ts.net" /root/.ssh/config; then
        log_success "SSH client configured"
    fi

    log_success "PKI setup verified"
}

# Main execution
main() {
    log_info "=== PKI Bootstrap for $MACHINE_NAME ==="
    log_info "Infisical API: $INFISICAL_API"
    log_info "Certificate Directory: $CERT_DIR"
    log_info ""

    validate_env

    local ca_pubkey
    ca_pubkey=$(fetch_ca_pubkey)

    install_ca_trust "$ca_pubkey"
    install_client_ca "$ca_pubkey"

    local ssh_cert
    ssh_cert=$(issue_certificate)

    install_certificate "$ssh_cert"
    configure_ssh_client

    verify_setup

    log_info ""
    log_success "✅ PKI bootstrap complete for $MACHINE_NAME"
    log_info ""
    log_info "Next steps:"
    log_info "  1. Test SSH: ssh deploy@worker-rtx5090.trex-fiordland.ts.net"
    log_info "  2. Verify certificate: ssh-keygen -L -f ${CERT_DIR}/id_ed25519-cert.pub"
    log_info "  3. Check audit logs in the Infisical cloud web UI."
}

main "$@"
