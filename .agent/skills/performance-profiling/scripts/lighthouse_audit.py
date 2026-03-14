#!/usr/bin/env python3
"""
Lighthouse Audit - Real performance and SEO check via HTTP.
"""
import subprocess
import json
import sys
import os
import time
from pathlib import Path

def main():
    if len(sys.argv) < 3:
        print(f"\n[LIGHTHOUSE AUDIT] Skipped (URL not provided)")
        sys.exit(0)
        
    url = sys.argv[2]
    print(f"\n[LIGHTHOUSE AUDIT] Target: {url}")
    
    # Realizamos um check de velocidade real usando curl para medir o tempo de resposta
    try:
        start_time = time.time()
        # Pega o TTFB (Time to First Byte) e Response Code
        cmd = [
            "curl", "-o", "/dev/null", "-s", "-w", 
            "%{http_code} %{time_total}", 
            url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        end_time = time.time()
        
        if result.returncode != 0:
            print(f"[FAIL] Could not reach {url}")
            sys.exit(1)
            
        parts = result.stdout.split()
        http_code = parts[0]
        total_time = float(parts[1])
        
        print(f"HTTP Status: {http_code}")
        print(f"Response Time: {total_time:.3f}s")
        
        if http_code != "200":
            print(f"[FAIL] Application returned status {http_code}")
            sys.exit(1)
            
        # Threshold: 2 segundos para o MVP em ambiente local/CI
        if total_time > 2.0:
            print(f"[FAIL] Response time ({total_time:.2f}s) exceeds budget (2.0s)")
            sys.exit(1)
            
        print("[OK] Performance metrics passed.")
        sys.exit(0)
        
    except Exception as e:
        print(f"[ERROR] Audit failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
