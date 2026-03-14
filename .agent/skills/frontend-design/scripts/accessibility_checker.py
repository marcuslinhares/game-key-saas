#!/usr/bin/env python3
"""
Accessibility Checker - WCAG compliance audit
"""
import sys
import json
import re
from pathlib import Path

def find_html_files(project_path: Path) -> list:
    patterns = ['**/*.html', '**/*.jsx', '**/*.tsx']
    skip_dirs = {'node_modules', '.next', 'dist', 'build', '.git'}
    files = []
    for pattern in patterns:
        for f in project_path.glob(pattern):
            if not any(skip in f.parts for skip in skip_dirs):
                files.append(f)
    return files[:50]

def check_accessibility(file_path: Path) -> list:
    issues = []
    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        inputs = re.findall(r'<input[^>]*>', content, re.IGNORECASE)
        for inp in inputs:
            if 'type="hidden"' not in inp.lower() and 'aria-label' not in inp.lower() and 'id=' not in inp.lower():
                issues.append("Input without label or aria-label")
                break
        if '<html' in content.lower() and 'lang=' not in content.lower():
            issues.append("Missing lang attribute on <html>")
    except Exception as e:
        issues.append(f"Error: {str(e)[:50]}")
    return issues

def main():
    project_path = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    print(f"\n[ACCESSIBILITY CHECKER] WCAG Compliance Audit")
    files = find_html_files(project_path)
    all_issues = []
    for f in files:
        issues = check_accessibility(f)
        if issues: all_issues.append({"file": str(f.name), "issues": issues})
    if all_issues:
        for item in all_issues[:10]:
            print(f"\n{item['file']}:")
            for issue in item["issues"]: print(f"  - {issue}")
    else: print("No accessibility issues found!")
    sys.exit(0)

if __name__ == "__main__": main()
