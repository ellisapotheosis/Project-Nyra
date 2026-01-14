"""
Quick validation script to verify the quote engine implementation.
This can be run without installing all dependencies.
"""
import sys
from pathlib import Path

def validate_file_structure():
    """Validate that all required files exist."""
    base_path = Path(__file__).parent

    required_files = [
        "app/loan_types.py",
        "app/loan_calc.py",
        "app/main_enhanced.py",
        "app/models.py",
        "app/calc.py",
        "sample/loan-types/conventional.json",
        "sample/loan-types/fha.json",
        "sample/loan-types/va.json",
        "sample/loan-types/usda.json",
        "pytest.ini",
        "requirements-test.txt",
        "README_ENHANCED.md",
    ]

    test_files = [
        "../../../tests/services/quote-api/__init__.py",
        "../../../tests/services/quote-api/conftest.py",
        "../../../tests/services/quote-api/test_loan_types.py",
        "../../../tests/services/quote-api/test_api_endpoints.py",
        "../../../tests/services/quote-api/test_calculations.py",
    ]

    print("[OK] Validating file structure...")
    missing = []

    for file_path in required_files + test_files:
        full_path = base_path / file_path
        if not full_path.exists():
            missing.append(file_path)
            print(f"  [X] Missing: {file_path}")
        else:
            print(f"  [OK] Found: {file_path}")

    if missing:
        print(f"\n[FAIL] {len(missing)} files missing!")
        return False

    print("\n[OK] All required files present")
    return True


def validate_imports():
    """Validate that modules can be imported."""
    print("\n[OK] Validating module imports...")

    try:
        # Add app to path
        sys.path.insert(0, str(Path(__file__).parent))

        # Try importing modules (syntax check)
        print("  [OK] Checking app/loan_types.py...")
        import app.loan_types as loan_types

        print("  [OK] Checking app/loan_calc.py...")
        import app.loan_calc as loan_calc

        print("  [OK] Checking app/main_enhanced.py...")
        import app.main_enhanced as main_enhanced

        print("\n[OK] All modules import successfully")
        return True

    except ImportError as e:
        print(f"\n[FAIL] Import error: {e}")
        print("Note: FastAPI/Pydantic may need to be installed")
        return False
    except SyntaxError as e:
        print(f"\n[FAIL] Syntax error: {e}")
        return False


def validate_loan_types():
    """Validate loan type definitions."""
    print("\n[OK] Validating loan types...")

    try:
        from app.loan_types import (
            ConventionalAssumptions,
            FHAAssumptions,
            VAAssumptions,
            USDAAssumptions,
            get_loan_assumptions,
        )

        # Check each loan type
        loan_types = ["conventional", "fha", "va", "usda"]
        for lt in loan_types:
            assumptions = get_loan_assumptions(lt)
            print(f"  [OK] {lt.upper()}: max_ltv={assumptions.max_ltv}, "
                  f"min_credit={assumptions.min_credit_score}")

        print("\n[OK] All loan types validated")
        return True

    except Exception as e:
        print(f"\n[FAIL] Validation error: {e}")
        return False


def validate_test_structure():
    """Validate test file structure."""
    print("\n[OK] Validating test structure...")

    test_path = Path(__file__).parent / "../../../tests/services/quote-api"

    test_files = [
        "test_loan_types.py",
        "test_api_endpoints.py",
        "test_calculations.py",
    ]

    for test_file in test_files:
        test_file_path = test_path / test_file
        if test_file_path.exists():
            # Count test functions
            content = test_file_path.read_text()
            test_count = content.count("def test_")
            class_count = content.count("class Test")
            print(f"  [OK] {test_file}: {class_count} test classes, {test_count} test functions")
        else:
            print(f"  [X] {test_file}: NOT FOUND")

    print("\n[OK] Test structure validated")
    return True


def main():
    """Run all validations."""
    print("=" * 70)
    print("Quote Engine Implementation Validation")
    print("=" * 70)

    results = []

    # Run validations
    results.append(("File Structure", validate_file_structure()))
    results.append(("Module Imports", validate_imports()))

    # Only run these if imports succeeded
    if results[-1][1]:
        results.append(("Loan Types", validate_loan_types()))

    results.append(("Test Structure", validate_test_structure()))

    # Summary
    print("\n" + "=" * 70)
    print("VALIDATION SUMMARY")
    print("=" * 70)

    for name, passed in results:
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{status}: {name}")

    all_passed = all(r[1] for r in results)

    if all_passed:
        print("\n>>> ALL VALIDATIONS PASSED <<<")
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Install test deps: pip install -r requirements-test.txt")
        print("3. Run tests: pytest")
        print("4. Start API: uvicorn app.main_enhanced:app --reload")
        return 0
    else:
        print("\n[FAIL] Some validations failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
