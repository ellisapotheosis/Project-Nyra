#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Gitea Actions CI/CD Setup${NC}"
echo -e "${GREEN}================================${NC}"

# Load environment variables
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Check if runner token is set
if [ -z "$RUNNER_TOKEN" ] || [ "$RUNNER_TOKEN" = "your_runner_token_here" ]; then
    echo -e "${RED}Error: RUNNER_TOKEN not configured${NC}"
    echo -e "Please generate a runner token:"
    echo -e "1. Login to https://${GITEA_DOMAIN}"
    echo -e "2. Go to Site Administration -> Actions -> Runners"
    echo -e "3. Click 'Create New Runner'"
    echo -e "4. Copy the registration token and add to .env"
    exit 1
fi

# Restart runner container to register
echo -e "${YELLOW}Restarting runner container...${NC}"
docker-compose restart gitea-runner

# Wait for runner to register
echo -e "${YELLOW}Waiting for runner to register...${NC}"
sleep 10

# Check runner status
echo -e "${YELLOW}Checking runner status...${NC}"
RUNNER_STATUS=$(docker exec gitea-runner act_runner status 2>&1 || true)
echo "$RUNNER_STATUS"

# Create workflow conversion script
echo -e "${YELLOW}Creating workflow conversion script...${NC}"
cat > convert-workflows.sh <<'EOF'
#!/bin/bash
# Convert GitHub Actions workflows to Gitea Actions

SOURCE_DIR="${1:-.github/workflows}"
TARGET_DIR="${2:-.gitea/workflows}"

if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory $SOURCE_DIR not found"
    exit 1
fi

mkdir -p "$TARGET_DIR"

for workflow in "$SOURCE_DIR"/*.yml "$SOURCE_DIR"/*.yaml; do
    if [ -f "$workflow" ]; then
        filename=$(basename "$workflow")
        echo "Converting: $filename"

        # Copy and modify workflow
        sed -e 's/github\./gitea\./g' \
            -e 's/GITHUB_/GITEA_/g' \
            -e 's/github\.com/gitea\.orchestrator-mini\.local/g' \
            "$workflow" > "$TARGET_DIR/$filename"

        echo "  -> Created $TARGET_DIR/$filename"
    fi
done

echo "Workflow conversion complete!"
EOF
chmod +x convert-workflows.sh

# Create sample Gitea Actions workflow
echo -e "${YELLOW}Creating sample workflow...${NC}"
mkdir -p sample-workflows

cat > sample-workflows/ci.yml <<'EOF'
name: CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/

  docker:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Gitea Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ gitea.server_url }}
          username: ${{ gitea.actor }}
          password: ${{ secrets.GITEA_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ gitea.server_url }}/${{ gitea.repository }}:latest
            ${{ gitea.server_url }}/${{ gitea.repository }}:${{ gitea.sha }}
EOF

cat > sample-workflows/deploy.yml <<'EOF'
name: Deploy to Production

on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /app
            git pull
            docker-compose down
            docker-compose up -d
            docker-compose logs -f

      - name: Health check
        run: |
          sleep 10
          curl -f https://app.orchestrator-mini.local/health || exit 1

      - name: Notify success
        run: echo "Deployment successful!"
EOF

# Create GitHub Actions compatibility guide
cat > GITHUB_ACTIONS_COMPATIBILITY.md <<'EOF'
# GitHub Actions to Gitea Actions Migration Guide

## Key Differences

1. **Context Variables**
   - GitHub: `${{ github.* }}`
   - Gitea: `${{ gitea.* }}`

2. **Environment Variables**
   - GitHub: `GITHUB_*`
   - Gitea: `GITEA_*`

3. **Container Registry**
   - GitHub: `ghcr.io`
   - Gitea: `gitea.orchestrator-mini.local`

## Supported Actions

Most GitHub Actions are compatible with Gitea Actions:
- actions/checkout@v3
- actions/setup-node@v3
- actions/upload-artifact@v3
- docker/build-push-action@v4
- docker/login-action@v2

## Conversion Process

1. Copy workflows from `.github/workflows/` to `.gitea/workflows/`
2. Replace `github` context with `gitea` context
3. Update registry URLs
4. Test locally with act: `act -P ubuntu-latest=catthehacker/ubuntu:act-latest`

## Common Patterns

### Basic CI
```yaml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
```

### Docker Build
```yaml
jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: gitea.orchestrator-mini.local/repo:latest
```

### Matrix Testing
```yaml
jobs:
  test:
    strategy:
      matrix:
        node: [16, 18, 20]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}
      - run: npm test
```
EOF

# Print setup information
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Gitea Actions Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e ""
echo -e "Sample workflows created in: sample-workflows/"
echo -e "Conversion script: ./convert-workflows.sh"
echo -e "Compatibility guide: GITHUB_ACTIONS_COMPATIBILITY.md"
echo -e ""
echo -e "Next steps:"
echo -e "1. Check runner status in Gitea UI"
echo -e "2. Convert GitHub Actions workflows:"
echo -e "   ./convert-workflows.sh /path/to/repo/.github/workflows /path/to/repo/.gitea/workflows"
echo -e "3. Commit and push workflows to trigger CI"
echo -e "4. Monitor workflow runs in Gitea UI"
echo -e ""
echo -e "Runner logs:"
docker-compose logs gitea-runner | tail -20

echo -e "${GREEN}================================${NC}"
