#!/usr/bin/env python3
"""
Playwright E2E Runner - Executes real Playwright tests.
"""
import sys
import subprocess
import os
from pathlib import Path

def main():
    project_path = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    url = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:3000"
    
    print(f"\n[PLAYWRIGHT E2E] Target: {url}")
    
    # Define a URL base para o Playwright
    env = os.environ.copy()
    env["BASE_URL"] = url
    
    try:
        print(f"Running: npx playwright test")
        result = subprocess.run(
            ["npx", "playwright", "test"],
            cwd=str(project_path),
            capture_output=True,
            text=True,
            env=env
        )
        
        if result.returncode == 0:
            print("[OK] Playwright E2E tests passed.")
            sys.exit(0)
        else:
            print("[FAIL] Playwright E2E tests failed.")
            print(result.stdout)
            print(result.stderr)
            sys.exit(1)
            
    except Exception as e:
        print(f"[ERROR] Could not run Playwright: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
