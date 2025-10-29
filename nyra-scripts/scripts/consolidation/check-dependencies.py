#!/usr/bin/env python3
"""
scripts/consolidation/check-dependencies.py
Checks all Node.js and Python module dependencies
"""

import os
import json
import subprocess
from pathlib import Path
from typing import Dict, List

def check_npm_modules() -> Dict[str, str]:
    """Check all npm package.json files"""
    print("📦 Checking NPM Modules")
    print("=" * 50)

    results = {}
    for package_json in Path('.').rglob('package.json'):
        if 'node_modules' in str(package_json):
            continue

        rel_path = package_json.parent
        print(f"\n📁 {rel_path}")

        try:
            # Check for package.json validity
            with open(package_json, 'r') as f:
                data = json.load(f)
                name = data.get('name', 'unknown')
                version = data.get('version', 'unknown')
                print(f"  📦 {name}@{version}")

            # Run npm audit
            result = subprocess.run(
                ['npm', 'audit', '--json'],
                cwd=rel_path,
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                audit_data = json.loads(result.stdout)
                vulnerabilities = audit_data.get('metadata', {}).get('vulnerabilities', {})
                total = sum(vulnerabilities.values())

                if total == 0:
                    print(f"  ✅ No vulnerabilities")
                    results[str(rel_path)] = "OK"
                else:
                    print(f"  ⚠️  {total} vulnerabilities found")
                    for severity, count in vulnerabilities.items():
                        if count > 0:
                            print(f"     • {severity}: {count}")
                    results[str(rel_path)] = f"{total} vulnerabilities"
            else:
                print(f"  ⚠️  Audit failed")
                results[str(rel_path)] = "Audit failed"

        except subprocess.TimeoutExpired:
            print(f"  ⏱️  Timeout")
            results[str(rel_path)] = "Timeout"
        except FileNotFoundError:
            print(f"  ❌ npm not found")
            results[str(rel_path)] = "npm not found"
        except Exception as e:
            print(f"  ❌ Error: {e}")
            results[str(rel_path)] = f"Error: {str(e)}"

    return results

def check_python_modules() -> Dict[str, str]:
    """Check all Python requirements.txt files"""
    print("\n\n🐍 Checking Python Modules")
    print("=" * 50)

    results = {}
    for req_file in Path('.').rglob('requirements.txt'):
        rel_path = req_file.parent
        print(f"\n📁 {rel_path}")

        try:
            # Count requirements
            with open(req_file, 'r') as f:
                reqs = [line.strip() for line in f if line.strip() and not line.startswith('#')]
                print(f"  📝 {len(reqs)} requirements")

            # Check pip
            result = subprocess.run(
                ['pip', 'check'],
                cwd=rel_path,
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0:
                print(f"  ✅ Dependencies OK")
                results[str(rel_path)] = "OK"
            else:
                print(f"  ⚠️  Issues found:")
                for line in result.stdout.split('\n')[:5]:
                    if line.strip():
                        print(f"     • {line}")
                results[str(rel_path)] = "Issues found"

        except subprocess.TimeoutExpired:
            print(f"  ⏱️  Timeout")
            results[str(rel_path)] = "Timeout"
        except FileNotFoundError:
            print(f"  ❌ pip not found")
            results[str(rel_path)] = "pip not found"
        except Exception as e:
            print(f"  ❌ Error: {e}")
            results[str(rel_path)] = f"Error: {str(e)}"

    return results

def generate_report(npm_results: Dict[str, str], python_results: Dict[str, str]):
    """Generate summary report"""
    print("\n\n📊 Dependency Check Summary")
    print("=" * 50)

    print(f"\n📦 NPM Modules: {len(npm_results)} checked")
    npm_ok = sum(1 for v in npm_results.values() if v == "OK")
    print(f"  ✅ {npm_ok} OK")
    print(f"  ⚠️  {len(npm_results) - npm_ok} with issues")

    print(f"\n🐍 Python Modules: {len(python_results)} checked")
    py_ok = sum(1 for v in python_results.values() if v == "OK")
    print(f"  ✅ {py_ok} OK")
    print(f"  ⚠️  {len(python_results) - py_ok} with issues")

    print("\n" + "=" * 50)
    print("✅ Dependency check complete!")
    print("\n📌 Recommended actions:")
    if npm_ok < len(npm_results):
        print("  • Run 'npm audit fix' in modules with vulnerabilities")
    if py_ok < len(python_results):
        print("  • Review and update Python dependencies")
    print("  • Consider using 'npm update' and 'pip install --upgrade'")

if __name__ == '__main__':
    npm_results = check_npm_modules()
    python_results = check_python_modules()
    generate_report(npm_results, python_results)
