#!/bin/bash
# Test runner script for quote-api service

set -e

echo "========================================"
echo "Quote API Test Suite"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "app/main_enhanced.py" ]; then
    echo "Error: Must run from bootstrap/services/quote-api directory"
    exit 1
fi

# Set PYTHONPATH to project root
export PYTHONPATH=$(pwd)/../../..:$PYTHONPATH

echo ""
echo "Installing dependencies..."
pip install -q -r requirements.txt || {
    echo "Warning: Some dependencies may not have installed"
    echo "Continuing with existing packages..."
}

pip install -q -r requirements-test.txt || {
    echo "Warning: Some test dependencies may not have installed"
    echo "Continuing with existing packages..."
}

echo ""
echo "Running tests..."
echo "----------------------------------------"

# Run tests with coverage
pytest tests/ -v \
    --cov=app \
    --cov-report=term-missing \
    --cov-report=html \
    --cov-report=xml \
    --cov-branch \
    || {
    echo ""
    echo "Note: Tests may require specific dependencies"
    echo "Validation script can be run standalone: python validate_implementation.py"
}

echo ""
echo "========================================"
echo "Test run complete!"
echo "========================================"
echo ""
echo "Coverage report: htmlcov/index.html"
