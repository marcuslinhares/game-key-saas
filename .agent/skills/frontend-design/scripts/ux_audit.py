#!/usr/bin/env python3
"""
UX Audit Script - Full Frontend Design Coverage
Analyzes code for compliance with psychology laws and design principles.
"""
import sys
import os
import re
import json
from pathlib import Path

class UXAuditor:
    def __init__(self):
        self.issues = []
        self.warnings = []
        self.passed_count = 0
        self.files_checked = 0
    
    def audit_file(self, filepath: str) -> None:
        try:
            with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read()
        except: return
        self.files_checked += 1
        filename = os.path.basename(filepath)
        has_long_text = bool(re.search(r'<p|<div.*class=.*text|article|<span.*text', content, re.IGNORECASE))
        has_form = bool(re.search(r'<form|<input|password|credit|card|payment', content, re.IGNORECASE))
        nav_items = len(re.findall(r'<NavLink|<Link|<a\s+href|nav-item', content, re.IGNORECASE))
        if nav_items > 7: self.issues.append(f"[Hick's Law] {filename}: {nav_items} nav items (Max 7)")
        if re.search(r'height:\s*([0-3]\d)px', content): self.warnings.append(f"[Fitts' Law] {filename}: Small targets (< 44px)")
        if 'button' in content.lower() and not re.search(r'primary|bg-primary|variant=["\']primary', content, re.IGNORECASE):
            self.warnings.append(f"[Von Restorff] {filename}: No primary CTA")
        purple_hexes = ['#8B5CF6', '#A855F7', '#9333EA', '#7C3AED', '#6D28D9']
        for purple in purple_hexes:
            if purple.lower() in content.lower():
                self.issues.append(f"[Color] {filename}: PURPLE DETECTED. Banned by Maestro rules. Use Teal/Cyan/Emerald.")
                break
        if re.search(r'<img(?![^>]*alt=)[^>]*>', content): self.issues.append(f"[Accessibility] {filename}: Missing img alt text")

    def audit_directory(self, directory: str) -> None:
        extensions = {'.tsx', '.jsx', '.html', '.css'}
        skip = {'node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'e2e', 'playwright-report'}
        for root, dirs, files in os.walk(directory):
            # Modifica dirs in-place para que o walk não entre neles
            dirs[:] = [d for d in dirs if d not in skip and not d.startswith('.')]
            
            # Filtra também o root para garantir que não estamos dentro de um skip
            if any(f"/{s}/" in root or root.endswith(f"/{s}") or root == f"./{s}" for s in skip):
                continue
                
            for file in files:
                if Path(file).suffix in extensions:
                    self.audit_file(os.path.join(root, file))

    def get_report(self):
        return {"files_checked": self.files_checked, "issues": self.issues, "warnings": self.warnings, "compliant": len(self.issues) == 0}

def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "."
    auditor = UXAuditor()
    if os.path.isfile(path): auditor.audit_file(path)
    else: auditor.audit_directory(path)
    report = auditor.get_report()
    print(f"\n[UX AUDIT] {report['files_checked']} files checked")
    if report['issues']:
        print(f"[!] ISSUES ({len(report['issues'])}):")
        for i in report['issues'][:10]: print(f"  - {i}")
    sys.exit(0 if report['compliant'] else 1)

if __name__ == "__main__": main()
