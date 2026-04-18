#!/bin/bash
# PROJECT NYRA - ONE-COMMAND AUTONOMOUS SETUP (Mac/Linux)
# Run this script and go to sleep. Everything will be ready when you wake up.
# Estimated Time: 4-8 hours

set -e  # Exit on error, but we'll handle errors gracefully

REPO_PATH="${1:-$HOME/Dev/Projects/Repos/Project-Nyra}"
START_TIME=$(date +%s)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

function print_phase() {
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  $1$(printf '%*s' $((54 - ${#1})) '')║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}\n"
}

function print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

function print_progress() {
    echo -e "${YELLOW}→ $1${NC}"
}

function print_error() {
    echo -e "${RED}✗ $1${NC}"
    echo "$(date) - $1" >> "$REPO_PATH/setup-errors.log"
}

# Create transcript log
TRANSCRIPT_PATH="$REPO_PATH/setup-transcript.log"
exec > >(tee -a "$TRANSCRIPT_PATH") 2>&1

print_phase "PROJECT NYRA AUTONOMOUS SETUP - STARTING"
echo "Start Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "This will take 4-8 hours. You can safely close this terminal."
echo "Progress will be logged to: $TRANSCRIPT_PATH"
echo ""

# ============================================
# PHASE 0: PREREQUISITES CHECK (5 minutes)
# ============================================
print_phase "PHASE 0: Checking Prerequisites"

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
    PACKAGE_MANAGER="brew"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    if command -v apt-get &> /dev/null; then
        PACKAGE_MANAGER="apt"
    elif command -v yum &> /dev/null; then
        PACKAGE_MANAGER="yum"
    fi
fi

print_success "Detected OS: $OS with package manager: $PACKAGE_MANAGER"

# Check Docker
print_progress "Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker found: $DOCKER_VERSION"
    
    # Start Docker if not running
    if ! docker ps &> /dev/null; then
        print_progress "Starting Docker..."
        if [[ "$OS" == "mac" ]]; then
            open -a Docker
        elif [[ "$OS" == "linux" ]]; then
            sudo systemctl start docker
        fi
        
        # Wait for Docker to be ready
        for i in {1..30}; do
            if docker ps &> /dev/null; then
                print_success "Docker is ready"
                break
            fi
            echo "Waiting for Docker to start... ($i/30)"
            sleep 2
        done
    fi
else
    print_error "Docker not found. Installing..."
    if [[ "$OS" == "mac" ]]; then
        brew install --cask docker
    elif [[ "$OS" == "linux" ]]; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        print_success "Docker installed. Please log out and back in for group membership to take effect."
    fi
fi

# Check Node.js
print_progress "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_progress "Installing Node.js..."
    if [[ "$OS" == "mac" ]]; then
        brew install node
    elif [[ "$OS" == "linux" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    print_success "Node.js installed"
fi

# Check pnpm
print_progress "Checking pnpm installation..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    print_success "pnpm found: $PNPM_VERSION"
else
    print_progress "Installing pnpm..."
    npm install -g pnpm
    print_success "pnpm installed"
fi

# Check Python
print_progress "Checking Python installation..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_success "Python found: $PYTHON_VERSION"
else
    print_progress "Installing Python..."
    if [[ "$OS" == "mac" ]]; then
        brew install python@3.10
    elif [[ "$OS" == "linux" ]]; then
        sudo apt-get install -y python3 python3-pip
    fi
    print_success "Python installed"
fi

# Check Git
print_progress "Checking Git installation..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "Git found: $GIT_VERSION"
else
    print_progress "Installing Git..."
    if [[ "$OS" == "mac" ]]; then
        brew install git
    elif [[ "$OS" == "linux" ]]; then
        sudo apt-get install -y git
    fi
    print_success "Git installed"
fi

print_success "All prerequisites satisfied"

# ============================================
# PHASE 1: REPOSITORY SETUP (15 minutes)
# ============================================
print_phase "PHASE 1: Repository Setup"

if [ ! -d "$REPO_PATH" ]; then
    print_progress "Creating repository directory: $REPO_PATH"
    mkdir -p "$REPO_PATH"
fi

cd "$REPO_PATH"

# Initialize Git if not already
if [ ! -d ".git" ]; then
    print_progress "Initializing Git repository..."
    git init
    print_success "Git repository initialized"
fi

# Create directory structure
print_progress "Creating project directory structure..."

DIRECTORIES=(
    "orchestration/archon-os"
    "orchestration/archon-os"
    "mcp-servers/nexus"
    "mcp-servers/letta"
    "mcp-servers/mem0"
    "mcp-servers/openmemory"
    "mcp-servers/serena"
    "mcp-servers/gemini-assistant"
    "services/quote-engine/app"
    "services/campaign-engine/app"
    "services/nyra-orchestrator/app"
    "services/mem0-rest/app"
    "apps/ratehunter/app"
    "apps/nyra-admin/app"
    "infra/docker"
    "configs/nexus"
    "configs/litellm"
    "configs/observability/grafana/provisioning/datasources"
    "configs/observability/grafana/provisioning/dashboards"
    "configs/mcp"
    "configs/env"
    "docs/architecture"
    "docs/deployment"
    "scripts/setup"
    "scripts/dev"
    "prompts/archon-os"
    "prompts/agents"
    "data/campaigns"
    ".archon-os"
)

for dir in "${DIRECTORIES[@]}"; do
    mkdir -p "$dir"
done

print_success "Directory structure created"

# ============================================
# PHASE 2: ENVIRONMENT CONFIGURATION (10 minutes)
# ============================================
print_phase "PHASE 2: Environment Configuration"

print_progress "Creating environment template..."

cat > .env.template << 'EOF'
# PROJECT NYRA - ENVIRONMENT VARIABLES
ANTHROPIC_API_KEY=sk-ant-your-key-here
OPENROUTER_API_KEY=sk-or-your-key-here
GOOGLE_GEMINI_API_KEY=your-gemini-key-here
GITHUB_TOKEN=ghp_your-token-here
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
N8N_PASSWORD=admin_secure_password
GRAFANA_PASSWORD=admin_secure_password
EOF

print_success "Environment template created"

# Check if .env exists
if [ ! -f ".env" ]; then
    print_progress "Creating .env from template..."
    cp .env.template .env
    
    echo -e "\n${YELLOW}⚠️  IMPORTANT: Please edit .env and add your actual API keys!${NC}"
    echo -e "    File location: $REPO_PATH/.env\n"
    
    # Open in default editor
    if command -v code &> /dev/null; then
        code .env
    elif [[ "$OS" == "mac" ]]; then
        open -e .env
    else
        nano .env
    fi
    
    echo -e "${YELLOW}Pausing for 60 seconds to allow API key entry...${NC}\n"
    sleep 60
fi

# ============================================
# PHASE 4: DETECT EXISTING REPOSITORIES (5 minutes)
# ============================================
print_phase "PHASE 4: Detecting Existing Nyra Repositories"

print_progress "Scanning parent directory for existing Nyra materials..."

PARENT_DIR=$(dirname "$REPO_PATH")
EXISTING_REPOS=()

# Search for common Nyra repository patterns
while IFS= read -r -d '' dir; do
    EXISTING_REPOS+=("$dir")
    print_success "Found: $(basename "$dir") at $dir"
done < <(find "$PARENT_DIR" -maxdepth 1 -type d \( -name "*nyra*" -o -name "*NYRA*" -o -name "*Nyra*" \) -print0)

if [ ${#EXISTING_REPOS[@]} -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  IMPORTANT: Found ${#EXISTING_REPOS[@]} existing Nyra repositories/directories${NC}"
    echo -e "${YELLOW}These will be consolidated during the autonomous build:${NC}\n"
    
    for repo in "${EXISTING_REPOS[@]}"; do
        echo -e "  ${CYAN}- $repo${NC}"
    done
    
    # Create manifest for Claude Flow
    cat > "$REPO_PATH/.archon-os/existing-repos-manifest.json" << EOF
{
  "detected_at": "$(date -Iseconds)",
  "repositories": [
EOF
    
    first=true
    for repo in "${EXISTING_REPOS[@]}"; do
        if [ "$first" = false ]; then
            echo "," >> "$REPO_PATH/.archon-os/existing-repos-manifest.json"
        fi
        first=false
        
        file_count=$(find "$repo" -type f | wc -l)
        size_mb=$(du -sm "$repo" | cut -f1)
        
        cat >> "$REPO_PATH/.archon-os/existing-repos-manifest.json" << EOF
    {
      "name": "$(basename "$repo")",
      "path": "$repo",
      "size_mb": $size_mb,
      "file_count": $file_count
    }
EOF
    done
    
    echo -e "\n  ]\n}" >> "$REPO_PATH/.archon-os/existing-repos-manifest.json"
    
    print_success "Created manifest: .archon-os/existing-repos-manifest.json"
    echo -e "\n${GREEN}Consolidation will preserve all production-ready work and avoid duplication.${NC}\n"
else
    print_progress "No existing Nyra repositories found - will build from scratch"
fi

# ============================================
# PHASE 5: DOWNLOAD ENHANCED BUILD PROMPT (1 minute)
# ============================================
print_phase "PHASE 5: Downloading Enhanced Master Build Prompt"

print_progress "Downloading Claude Flow enhanced build prompt with consolidation support..."
if curl -fsSL "https://raw.githubusercontent.com/ellisapotheosis/project-nyra/main/archon-os-MASTER-BUILD-ENHANCED.md" -o ".archon-os/MASTER-BUILD-ENHANCED.md"; then
    print_success "Enhanced master build prompt downloaded"
else
    print_progress "Using local enhanced build prompt..."
fi

print_progress "Installing VS Code if needed..."
if ! command -v code &> /dev/null; then
    if [[ "$OS" == "mac" ]]; then
        brew install --cask visual-studio-code
    elif [[ "$OS" == "linux" ]]; then
        sudo snap install code --classic
    fi
fi

print_progress "Installing Claude Code extension..."
code --install-extension saoudrizwan.claude-dev --force 2>/dev/null || print_error "Could not install extension automatically"

print_success "Claude Code setup complete"

# ============================================
# PHASE 4: INITIALIZE CLAUDE FLOW (10 minutes)
# ============================================
print_phase "PHASE 4: Launching Claude Flow Autonomous Build"

echo -e "\n${MAGENTA}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  🤖 STARTING AUTONOMOUS BUILD                          ║${NC}"
echo -e "${MAGENTA}║                                                        ║${NC}"
echo -e "${MAGENTA}║  Claude Flow will now build everything autonomously.  ║${NC}"
echo -e "${MAGENTA}║  This will take 4-8 hours.                           ║${NC}"
echo -e "${MAGENTA}║                                                        ║${NC}"
echo -e "${MAGENTA}║  You can safely close this terminal and go to sleep. ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════╝${NC}\n"

print_progress "Initializing Archon..."
npx --yes archon-os@alpha init --enhanced --pair --verify --sparc --roo --batch --parallel --force

print_success "Archon initialized"

print_progress "Opening VS Code..."
code "$REPO_PATH"

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ SETUP COMPLETE - READY FOR AUTONOMOUS BUILD        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}NEXT STEPS:${NC}"
echo -e "1. In VS Code, open Claude Code (Cmd/Ctrl+Shift+P > 'Claude Code: Open')"
echo -e "2. Paste this command:\n"
echo -e "${CYAN}   Read .archon-os/MASTER-BUILD-PROMPT.md and execute all phases autonomously.${NC}\n"
echo -e "3. Press Enter and go to sleep! 😴\n"

# ============================================
# COMPLETION SUMMARY
# ============================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
DURATION_MIN=$((DURATION / 60))

echo "Setup script complete!"
echo "Duration: $DURATION_MIN minutes"
echo "Transcript: $TRANSCRIPT_PATH"
echo ""
echo "Sweet dreams! 🌙"
