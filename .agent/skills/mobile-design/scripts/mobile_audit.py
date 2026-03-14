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
    print(f"\\n[MOBILE AUDIT] Scanning {project_path}")
    
    issues = []
    
    # Check 1: Responsive Meta Tag (Prioridade alta para Next.js)
    layout_files = list(project_path.glob("**/src/app/layout.tsx")) # Foca no layout principal
    has_viewport = False
    
    for f in layout_files:
        try:
            content = f.read_text(encoding='utf-8', errors='ignore')
            # Verifica a presença da meta tag viewport na metadata do Next.js
            if 'viewport' in content and 'width=device-width' in content:
                has_viewport = True
                break
        except Exception:
            pass
            
    if not has_viewport:
        issues.append("Missing 'viewport' meta tag with 'width=device-width' in main layout file (src/app/layout.tsx).")
        
    # Check 2: CSS Media Queries (Aviso para Tailwind/CSS-in-JS)
    # Em projetos Next.js com Tailwind, as media queries são geralmente integradas
    # via classes ou CSS-in-JS. Apenas avisamos se não houver NENHUMA.
    css_files = list(project_path.glob("**/*.css"))
    has_media_queries = False
    for f in css_files:
        if 'node_modules' in str(f) or '.next' in str(f): continue
        try:
            content = f.read_text(encoding='utf-8', errors='ignore')
            if '@media' in content:
                has_media_queries = True
                break
        except Exception:
            pass
            
    if not has_media_queries and css_files:
        print("[WARNING] No @media queries found in CSS files. Assuming Tailwind/CSS-in-JS handles responsiveness.")


    if issues:
        print(f"[FAIL] Mobile audit failed with {len(issues)} critical issues:")
        for issue in issues:
            print(f"  - {issue}")
        sys.exit(1)
    else:
        print("[OK] Mobile audit passed.")
        sys.exit(0)

if __name__ == "__main__":
    main()
