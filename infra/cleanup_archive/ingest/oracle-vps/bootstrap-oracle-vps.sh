#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root (sudo bash bootstrap-oracle-vps.sh)"
  exit 1
fi

install_docker_ubuntu() {
  apt-get update
  apt-get install -y ca-certificates curl gnupg ufw
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
}

install_docker_oracle_linux() {
  dnf install -y dnf-plugins-core
  dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
  dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin firewalld
  systemctl enable --now firewalld
}

if command -v apt-get >/dev/null 2>&1; then
  install_docker_ubuntu
elif command -v dnf >/dev/null 2>&1; then
  install_docker_oracle_linux
else
  echo "Unsupported distro. Install Docker Engine + Compose plugin manually."
  exit 1
fi

systemctl enable --now docker

if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
fi

echo "Bootstrap complete. Next: docker compose -f docker-compose.oracle-vps.yml up -d"
