#!/bin/bash
# Cloudflare Tunnel and DNS Setup for Nyra Distributed Compute
# This script configures the complete cloudflared infrastructure

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

error() {
    echo -e "${RED}❌${NC} $1"
}

# Check required environment variables
check_environment() {
    log "Checking environment variables..."

    local required_vars=(
        "CLOUDFLARE_API_KEY"
        "CLOUDFLARE_EMAIL"
        "CLOUDFLARE_ZONE_ID"
    )

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Required environment variable $var is not set"
            echo "Please set all required variables:"
            echo "  export CLOUDFLARE_API_KEY='your_api_key'"
            echo "  export CLOUDFLARE_EMAIL='your_email'"
            echo "  export CLOUDFLARE_ZONE_ID='your_zone_id'"
            exit 1
        fi
    done

    success "Environment variables configured"
}

# Authenticate with Cloudflare
authenticate_cloudflare() {
    log "Authenticating with Cloudflare..."

    # Test API access
    local response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID" \
        -H "Authorization: Bearer $CLOUDFLARE_API_KEY" \
        -H "Content-Type: application/json")

    if echo "$response" | jq -r '.success' | grep -q true; then
        local zone_name=$(echo "$response" | jq -r '.result.name')
        success "Authenticated with Cloudflare (Zone: $zone_name)"
    else
        error "Failed to authenticate with Cloudflare"
        echo "$response" | jq -r '.errors[]?.message // "Unknown error"'
        exit 1
    fi
}

# Create cloudflared tunnel
create_tunnel() {
    log "Creating cloudflared tunnel..."

    # Check if tunnel already exists
    local tunnel_list=$(cloudflared tunnel list --output json 2>/dev/null || echo "[]")
    local existing_tunnel=$(echo "$tunnel_list" | jq -r '.[] | select(.name == "nyra-orchestrator") | .id')

    if [[ -n "$existing_tunnel" && "$existing_tunnel" != "null" ]]; then
        warning "Tunnel 'nyra-orchestrator' already exists (ID: $existing_tunnel)"
        export NYRA_ORCHESTRATOR_TUNNEL_ID="$existing_tunnel"
    else
        # Login to Cloudflare first
        cloudflared tunnel login

        # Create new tunnel
        log "Creating new tunnel 'nyra-orchestrator'..."
        local tunnel_output=$(cloudflared tunnel create nyra-orchestrator)
        export NYRA_ORCHESTRATOR_TUNNEL_ID=$(echo "$tunnel_output" | grep -o '[0-9a-f-]\{36\}' | head -1)

        if [[ -z "$NYRA_ORCHESTRATOR_TUNNEL_ID" ]]; then
            error "Failed to create tunnel or extract tunnel ID"
            exit 1
        fi

        success "Created tunnel: $NYRA_ORCHESTRATOR_TUNNEL_ID"
    fi

    # Save tunnel ID to environment file
    echo "export NYRA_ORCHESTRATOR_TUNNEL_ID='$NYRA_ORCHESTRATOR_TUNNEL_ID'" >> "$PROJECT_ROOT/.env.tunnel"
}

# Setup tunnel configuration
setup_tunnel_config() {
    log "Setting up tunnel configuration..."

    # Ensure tunnel ID is available
    if [[ -z "${NYRA_ORCHESTRATOR_TUNNEL_ID:-}" ]]; then
        error "Tunnel ID not available. Please run create_tunnel first."
        exit 1
    fi

    # Create credentials directory
    sudo mkdir -p /etc/cloudflared/credentials

    # Copy credentials file
    local creds_file="$HOME/.cloudflared/$NYRA_ORCHESTRATOR_TUNNEL_ID.json"
    if [[ -f "$creds_file" ]]; then
        sudo cp "$creds_file" "/etc/cloudflared/credentials/"
        success "Tunnel credentials configured"
    else
        error "Tunnel credentials file not found: $creds_file"
        exit 1
    fi

    # Generate orchestrator config with environment substitution
    local tunnel_template="$PROJECT_ROOT/config/tunnels/orchestrator.yml"
    if [[ ! -f "$tunnel_template" ]]; then
        warning "Tunnel template not found at $tunnel_template; trying fallback templates"
        local fallback_templates=(
            "$PROJECT_ROOT/infra/cloudflared/config.yml"
            "$PROJECT_ROOT/infra/compose/configs/cloudflared/config.yml"
        )
        for candidate in "${fallback_templates[@]}"; do
            if [[ -f "$candidate" ]]; then
                tunnel_template="$candidate"
                warning "Using fallback tunnel template: $tunnel_template"
                break
            fi
        done
    fi

    if [[ ! -f "$tunnel_template" ]]; then
        error "No tunnel config template found. Expected one of:"
        echo "  - $PROJECT_ROOT/config/tunnels/orchestrator.yml"
        echo "  - $PROJECT_ROOT/infra/cloudflared/config.yml"
        echo "  - $PROJECT_ROOT/infra/compose/configs/cloudflared/config.yml"
        exit 1
    fi

    envsubst < "$tunnel_template" | sudo tee /etc/cloudflared/config.yml > /dev/null

    success "Tunnel configuration applied"
}

# Configure DNS records
setup_dns_records() {
    log "Setting up DNS records..."

    cd "$PROJECT_ROOT"

    # Run DNS manager setup
    if node src/infrastructure/cloudflared/dns-manager.js setup; then
        success "DNS records configured"
    else
        error "Failed to configure DNS records"
        exit 1
    fi
}

# Validate tunnel configuration
validate_tunnel_config() {
    log "Validating tunnel configuration..."

    # Check config file syntax
    if cloudflared tunnel --config /etc/cloudflared/config.yml validate; then
        success "Tunnel configuration is valid"
    else
        error "Tunnel configuration is invalid"
        exit 1
    fi
}

# Start tunnel service
start_tunnel_service() {
    log "Starting tunnel service..."

    # Install systemd service
    sudo cloudflared service install --config /etc/cloudflared/config.yml

    # Enable and start service
    sudo systemctl enable cloudflared
    sudo systemctl start cloudflared

    # Check service status
    sleep 5
    if sudo systemctl is-active --quiet cloudflared; then
        success "Tunnel service started successfully"
    else
        error "Failed to start tunnel service"
        sudo systemctl status cloudflared
        exit 1
    fi
}

# Setup tunnel monitoring
setup_tunnel_monitoring() {
    log "Setting up tunnel monitoring..."

    # Create tunnel health check script
    cat > "$PROJECT_ROOT/scripts/monitoring/tunnel-health.sh" <<'EOF'
#!/bin/bash
# Cloudflared Tunnel Health Check

check_tunnel_status() {
    if systemctl is-active --quiet cloudflared; then
        echo "✅ Cloudflared service is running"
        return 0
    else
        echo "❌ Cloudflared service is not running"
        return 1
    fi
}

check_tunnel_connectivity() {
    local test_urls=(
        "https://app.projectnyra.com"
        "https://orchestrator.projectnyra.com"
        "https://health.projectnyra.com"
        "https://api.projectnyra.com"
    )

    local failed=0
    for url in "${test_urls[@]}"; do
        if curl -sf "$url" > /dev/null 2>&1; then
            echo "✅ $url is reachable"
        else
            echo "❌ $url is not reachable"
            failed=1
        fi
    done

    return $failed
}

check_dns_resolution() {
    local domains=(
        "app.projectnyra.com"
        "orchestrator.projectnyra.com"
        "worker1.projectnyra.com"
        "worker2.projectnyra.com"
        "worker3.projectnyra.com"
        "api.projectnyra.com"
        "health.projectnyra.com"
    )

    local failed=0
    for domain in "${domains[@]}"; do
        if dig +short "$domain" > /dev/null 2>&1; then
            echo "✅ $domain resolves"
        else
            echo "❌ $domain does not resolve"
            failed=1
        fi
    done

    return $failed
}

echo "🔍 Cloudflared Tunnel Health Check - $(date)"
echo "=============================================="

check_tunnel_status || FAILED=1
check_dns_resolution || FAILED=1
check_tunnel_connectivity || FAILED=1

if [[ -z ${FAILED:-} ]]; then
    echo "🟢 Tunnel is healthy"
    exit 0
else
    echo "🔴 Tunnel has issues"
    exit 1
fi
EOF

    chmod +x "$PROJECT_ROOT/scripts/monitoring/tunnel-health.sh"

    # Setup cron job for tunnel monitoring
    (crontab -l 2>/dev/null; echo "*/5 * * * * $PROJECT_ROOT/scripts/monitoring/tunnel-health.sh >> /var/log/nyra-tunnel-health.log 2>&1") | crontab -

    success "Tunnel monitoring configured"
}

# Setup load balancer configuration
setup_load_balancer() {
    log "Setting up Cloudflare Load Balancer..."

    # Create load balancer configuration script
    cat > "$PROJECT_ROOT/scripts/setup/setup-load-balancer.js" <<'EOF'
const axios = require('axios');

class CloudflareLoadBalancer {
    constructor() {
        this.apiKey = process.env.CLOUDFLARE_API_KEY;
        this.zoneId = process.env.CLOUDFLARE_ZONE_ID;
        this.baseURL = 'https://api.cloudflare.com/client/v4';
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    async createOriginPool() {
        const poolConfig = {
            name: 'nyra-gpu-workers',
            description: 'Nyra GPU Compute Workers',
            enabled: true,
            minimum_origins: 1,
            notification_email: process.env.CLOUDFLARE_EMAIL,
            origins: [
                {
                    name: 'worker1',
                    address: 'worker1.projectnyra.com',
                    enabled: true,
                    weight: 0.7 // RTX 3060 - lower weight
                },
                {
                    name: 'worker2',
                    address: 'worker2.projectnyra.com',
                    enabled: true,
                    weight: 1.0 // RTX 5090 - highest weight
                },
                {
                    name: 'worker3',
                    address: 'worker3.projectnyra.com',
                    enabled: true,
                    weight: 0.9 // RTX 3090Ti - high weight
                }
            ]
        };

        try {
            const response = await axios.post(
                `${this.baseURL}/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/load_balancers/pools`,
                poolConfig,
                { headers: this.headers }
            );

            console.log('✅ Origin pool created:', response.data.result.id);
            return response.data.result.id;
        } catch (error) {
            console.error('❌ Failed to create origin pool:', error.response?.data || error.message);
            throw error;
        }
    }

    async createLoadBalancer(poolId) {
        const lbConfig = {
            name: 'api.projectnyra.com',
            fallback_pool: poolId,
            default_pools: [poolId],
            description: 'Nyra GPU Compute Load Balancer',
            ttl: 30,
            steering_policy: 'dynamic_latency',
            proxied: true,
            enabled: true
        };

        try {
            const response = await axios.post(
                `${this.baseURL}/zones/${this.zoneId}/load_balancers`,
                lbConfig,
                { headers: this.headers }
            );

            console.log('✅ Load balancer created:', response.data.result.id);
            return response.data.result.id;
        } catch (error) {
            console.error('❌ Failed to create load balancer:', error.response?.data || error.message);
            throw error;
        }
    }

    async setup() {
        console.log('🔄 Setting up Cloudflare Load Balancer...');

        const poolId = await this.createOriginPool();
        const lbId = await this.createLoadBalancer(poolId);

        console.log('✅ Load balancer setup completed');
        console.log(`   Pool ID: ${poolId}`);
        console.log(`   Load Balancer ID: ${lbId}`);

        return { poolId, lbId };
    }
}

if (require.main === module) {
    const lb = new CloudflareLoadBalancer();
    lb.setup().catch(console.error);
}

module.exports = CloudflareLoadBalancer;
EOF

    success "Load balancer configuration created"
}

# Display setup information
show_setup_info() {
    log "Cloudflare setup completed! Here's your configuration:"
    echo
    echo "🌩️  Cloudflare Tunnel:"
    echo "   - Tunnel ID: $NYRA_ORCHESTRATOR_TUNNEL_ID"
    echo "   - Tunnel Name: nyra-orchestrator"
    echo "   - Configuration: /etc/cloudflared/config.yml"
    echo
    echo "🌐 DNS Records:"
    echo "   - app.projectnyra.com → Tunnel"
    echo "   - orchestrator.projectnyra.com → Tunnel"
    echo "   - worker1.projectnyra.com → Tunnel (proxy)"
    echo "   - worker2.projectnyra.com → Tunnel (proxy)"
    echo "   - worker3.projectnyra.com → Tunnel (proxy)"
    echo "   - api.projectnyra.com → Load Balanced"
    echo "   - health.projectnyra.com → Tunnel"
    echo
    echo "🔍 Monitoring:"
    echo "   - Tunnel health checks every 5 minutes"
    echo "   - DNS resolution monitoring"
    echo "   - Service connectivity checks"
    echo
    echo "⚡ Next Steps:"
    echo "   1. Verify tunnel status: systemctl status cloudflared"
    echo "   2. Test DNS resolution: nslookup app.projectnyra.com"
    echo "   3. Check tunnel metrics: http://localhost:8888/metrics"
    echo "   4. Setup worker nodes with tunnel credentials"
    echo "   5. Configure load balancer (optional)"
    echo
    echo "🔗 Service URLs:"
    echo "   - Main Interface: https://app.projectnyra.com"
    echo "   - Orchestrator: https://orchestrator.projectnyra.com"
    echo "   - Health Dashboard: https://health.projectnyra.com"
    echo "   - API Gateway: https://api.projectnyra.com"
}

# Main setup function
main() {
    log "Starting Cloudflare tunnel and DNS setup..."

    check_environment
    authenticate_cloudflare
    create_tunnel
    setup_tunnel_config
    setup_dns_records
    validate_tunnel_config
    start_tunnel_service
    setup_tunnel_monitoring
    setup_load_balancer

    success "Cloudflare setup completed!"
    show_setup_info
}

# Run main function
main "$@"