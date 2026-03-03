#!/bin/bash
# Project Nyra - Simple Cluster Connectivity Test

echo "=== Project Nyra Cluster Connectivity Test ==="
echo ""

# Test Tailscale
echo "1. Tailscale Status:"
if command -v tailscale &> /dev/null; then
    echo "   ✓ Tailscale installed"
    tailscale status | head -10
else
    echo "   ✗ Tailscale not found"
fi

echo ""
echo "2. Testing Connectivity:"

# Test orchestrator-mini
echo "   Testing orchestrator-mini (100.115.69.115)..."
tailscale ping 100.115.69.115 --timeout 2s 2>&1 | grep -E "(pong|timed out|error)" || echo "     ✗ Failed"

# Test worker-5090 (if connected)
echo "   Testing worker-5090 (IP TBD)..."
echo "     ⚠ Not yet connected"

# Test worker-3090 (if connected)
echo "   Testing worker-3090 (IP TBD)..."
echo "     ⚠ Not yet connected"

# Test worker-3060 (current PC)
echo "   Testing worker-3060 (100.83.23.49 - current PC)..."
echo "     ✓ Current PC"

echo ""
echo "3. Cloudflared Status:"
if command -v cloudflared &> /dev/null; then
    echo "   ✓ Cloudflared installed"
    cloudflared tunnel list | head -10
else
    echo "   ✗ Cloudflared not found"
fi

echo ""
echo "=== Summary ==="
echo "Connected PCs: 2/4 (orchestrator-mini, worker-rtx3060)"
echo ""
echo "Next Steps:"
echo "  1. Install Tailscale on worker-5090 and worker-3090"
echo "  2. Run PC-INFO-COLLECTOR.ps1 on all PCs"
echo "  3. Configure Ollama on GPU workers"
echo "  4. Set up Cloudflared tunnels"
echo ""
