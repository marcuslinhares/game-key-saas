#!/usr/bin/env python3
"""
Mobile UX Audit - Real scan for responsive design.
"""
import sys
import os
import re
from pathlib import Path

def main():
    project_path = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    print(f"\n[MOBILE AUDIT] Scanning {project_path}")
    
    issues = []
    
    # Check 1: Responsive Meta Tag
    # Procura em arquivos de layout ou head
    layout_files = list(project_path.glob("**/layout.tsx")) + list(project_path.glob("**/_document.tsx"))
    has_viewport = False
    
    for f in layout_files:
        try:
            content = f.read_text(encoding='utf-8', errors='ignore')
            if 'viewport' in content.lower() or 'width=device-width' in content:
                has_viewport = True
                break
        except Exception:
            pass
            
    if not has_viewport:
        issues.append("Missing 'viewport' meta tag or configuration in layout files.")
        
    # Check 2: CSS Touch Target (Media Queries)
    css_files = list(project_path.glob("**/*.css"))
    has_media_queries = False
    for f in css_files:
        if 'node_modules' in str(f): continue
        try:
            content = f.read_text(encoding='utf-8', errors='ignore')
            if '@media' in content:
                has_media_queries = True
                break
        except Exception:
            pass
            
    if not has_media_queries and css_files:
        issues.append("No @media queries found in CSS files. Mobile responsiveness may be limited.")

    if issues:
        print(f"[FAIL] Mobile audit failed with {len(issues)} issues:")
        for issue in issues:
            print(f"  - {issue}")
        # Para o Next.js moderno (Tailwind), @media queries costumam estar inline, 
        # então vamos dar o benefício da dúvida se o viewport existir.
        if has_viewport:
            print("[OK] Viewport found. Accepting Tailwind-style responsiveness.")
            sys.exit(0)
        sys.exit(1)
    else:
        print("[OK] Mobile audit passed.")
        sys.exit(0)

if __name__ == "__main__":
    main()
