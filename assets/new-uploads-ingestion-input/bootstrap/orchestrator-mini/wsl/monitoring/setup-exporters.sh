#!/bin/bash
set -euo pipefail

# Setup Prometheus exporters for Project-Nyra monitoring

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run with sudo"
    exit 1
fi

echo "=========================================="
echo "  Prometheus Exporters Setup"
echo "=========================================="
echo ""

# Install PostgreSQL Exporter
install_postgres_exporter() {
    log_info "Installing PostgreSQL Exporter..."

    local version="0.15.0"
    local url="https://github.com/prometheus-community/postgres_exporter/releases/download/v${version}/postgres_exporter-${version}.linux-amd64.tar.gz"

    wget -q "$url" -O /tmp/postgres_exporter.tar.gz
    tar xzf /tmp/postgres_exporter.tar.gz -C /tmp
    mv /tmp/postgres_exporter-${version}.linux-amd64/postgres_exporter /usr/local/bin/
    rm -rf /tmp/postgres_exporter*

    # Create systemd service
    cat > /etc/systemd/system/postgres_exporter.service <<'EOF'
[Unit]
Description=Prometheus PostgreSQL Exporter
After=network.target postgresql.service

[Service]
Type=simple
User=postgres
Environment="DATA_SOURCE_NAME=postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable"
ExecStart=/usr/local/bin/postgres_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable postgres_exporter
    systemctl start postgres_exporter

    log_success "PostgreSQL Exporter installed (port 9187)"
}

# Install Redis Exporter
install_redis_exporter() {
    log_info "Installing Redis Exporter..."

    local version="1.56.0"
    local url="https://github.com/oliver006/redis_exporter/releases/download/v${version}/redis_exporter-v${version}.linux-amd64.tar.gz"

    wget -q "$url" -O /tmp/redis_exporter.tar.gz
    tar xzf /tmp/redis_exporter.tar.gz -C /tmp
    mv /tmp/redis_exporter-v${version}.linux-amd64/redis_exporter /usr/local/bin/
    rm -rf /tmp/redis_exporter*

    # Create systemd service
    cat > /etc/systemd/system/redis_exporter.service <<'EOF'
[Unit]
Description=Prometheus Redis Exporter
After=network.target redis-server.service

[Service]
Type=simple
User=redis
Environment="REDIS_ADDR=localhost:6379"
Environment="REDIS_PASSWORD=redis123"
ExecStart=/usr/local/bin/redis_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable redis_exporter
    systemctl start redis_exporter

    log_success "Redis Exporter installed (port 9121)"
}

# Install Node Exporter (if not already installed)
install_node_exporter() {
    if command -v node_exporter >/dev/null 2>&1; then
        log_info "Node Exporter already installed"
        return
    fi

    log_info "Installing Node Exporter..."

    local version="1.7.0"
    local url="https://github.com/prometheus/node_exporter/releases/download/v${version}/node_exporter-${version}.linux-amd64.tar.gz"

    wget -q "$url" -O /tmp/node_exporter.tar.gz
    tar xzf /tmp/node_exporter.tar.gz -C /tmp
    mv /tmp/node_exporter-${version}.linux-amd64/node_exporter /usr/local/bin/
    rm -rf /tmp/node_exporter*

    # Create systemd service
    cat > /etc/systemd/system/node_exporter.service <<'EOF'
[Unit]
Description=Prometheus Node Exporter
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable node_exporter
    systemctl start node_exporter

    log_success "Node Exporter installed (port 9100)"
}

# Install Cadvisor for Docker monitoring
install_cadvisor() {
    log_info "Installing cAdvisor for Docker monitoring..."

    # Create docker-compose file
    mkdir -p /opt/cadvisor
    cat > /opt/cadvisor/docker-compose.yml <<'EOF'
version: "3.9"

services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    privileged: true
    devices:
      - /dev/kmsg
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    ports:
      - "8080:8080"
    restart: unless-stopped

EOF

    cd /opt/cadvisor
    docker compose up -d

    log_success "cAdvisor installed (port 8080)"
}

# Create Prometheus configuration
create_prometheus_config() {
    log_info "Creating Prometheus configuration..."

    mkdir -p /opt/nyra/monitoring/prometheus

    cat > /opt/nyra/monitoring/prometheus/prometheus.yml <<'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'orchestrator-mini'
    environment: 'production'

scrape_configs:
  # Prometheus itself
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node metrics
  - job_name: 'node'
    static_configs:
      - targets: ['host.docker.internal:9100']
        labels:
          instance: 'orchestrator-mini'

  # PostgreSQL
  - job_name: 'postgres'
    static_configs:
      - targets: ['host.docker.internal:9187']
        labels:
          instance: 'orchestrator-mini'

  # Redis
  - job_name: 'redis'
    static_configs:
      - targets: ['host.docker.internal:9121']
        labels:
          instance: 'orchestrator-mini'

  # Docker containers
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['host.docker.internal:8080']

  # Application metrics (add your app endpoints)
  - job_name: 'application'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: '/metrics'

EOF

    log_success "Prometheus configuration created"
}

# Create Grafana dashboards
create_grafana_dashboards() {
    log_info "Creating Grafana dashboard provisioning..."

    mkdir -p /opt/nyra/monitoring/grafana/{dashboards,provisioning/dashboards,provisioning/datasources}

    # Datasource configuration
    cat > /opt/nyra/monitoring/grafana/provisioning/datasources/prometheus.yml <<'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true

EOF

    # Dashboard provisioning
    cat > /opt/nyra/monitoring/grafana/provisioning/dashboards/default.yml <<'EOF'
apiVersion: 1

providers:
  - name: 'Default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards

EOF

    log_success "Grafana configuration created"
}

# Main installation
main() {
    install_node_exporter
    install_postgres_exporter
    install_redis_exporter
    install_cadvisor
    create_prometheus_config
    create_grafana_dashboards

    echo ""
    log_success "All exporters installed and configured!"
    echo ""
    log_info "Exporter endpoints:"
    log_info "  • Node Exporter: http://localhost:9100/metrics"
    log_info "  • PostgreSQL Exporter: http://localhost:9187/metrics"
    log_info "  • Redis Exporter: http://localhost:9121/metrics"
    log_info "  • cAdvisor: http://localhost:8080/metrics"
    echo ""
    log_info "Check status:"
    systemctl status node_exporter
    systemctl status postgres_exporter
    systemctl status redis_exporter
    docker ps | grep cadvisor
}

main "$@"
