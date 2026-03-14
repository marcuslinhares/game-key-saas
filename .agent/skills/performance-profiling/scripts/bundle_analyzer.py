#!/usr/bin/env python3
"""
Bundle Analyzer - Real size check for Next.js build.
"""
import sys
import os
from pathlib import Path

def get_dir_size(path: Path):
    total = 0
    try:
        for entry in os.scandir(path):
            if entry.is_file():
                total += entry.stat().size
            elif entry.is_dir():
                total += get_dir_size(Path(entry.path))
    except Exception:
        pass
    return total

def main():
    project_path = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    print(f"\n[BUNDLE ANALYZER] Project: {project_path}")
    
    next_static = project_path / ".next" / "static"
    
    if not next_static.exists():
        print("[FAIL] .next/static not found. Did you run 'npm run build'?")
        sys.exit(1)
        
    size_bytes = get_dir_size(next_static)
    size_mb = size_bytes / (1024 * 1024)
    
    print(f"Total static bundle size: {size_mb:.2f} MB")
    
    # Budget: Max 50MB para este projeto (ajustável)
    budget_mb = 50.0
    
    if size_mb > budget_mb:
        print(f"[FAIL] Bundle size ({size_mb:.2f}MB) exceeds budget ({budget_mb}MB)")
        sys.exit(1)
    else:
        print(f"[OK] Bundle size within budget.")
        sys.exit(0)

if __name__ == "__main__":
    main()
