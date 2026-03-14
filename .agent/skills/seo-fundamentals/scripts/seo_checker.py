#!/usr/bin/env python3
"""
SEO Checker - Basic SEO audit
"""
import sys
import json
import re
from pathlib import Path

def find_html_files(project_path: Path) -> list:
    patterns = ['**/*.html', '**/*.tsx']
    skip_dirs = {'node_modules', '.next', 'dist', 'build', '.git'}
    files = []
    for pattern in patterns:
        for f in project_path.glob(pattern):
            if not any(skip in f.parts for skip in skip_dirs):
                files.append(f)
    return files[:50]

def check_seo(file_path: Path) -> list:
    issues = []
    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        if '<title>' not in content.lower(): issues.append("Missing <title> tag")
        if 'name="description"' not in content.lower(): issues.append("Missing meta description")
        if '<h1' not in content.lower(): issues.append("Missing <h1> tag")
    except Exception as e: issues.append(f"Error: {str(e)[:50]}")
    return issues

def main():
    project_path = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    print(f"\n[SEO CHECKER] Basic SEO Audit")
    files = find_html_files(project_path)
    all_issues = []
    for f in files:
        issues = check_seo(f)
        if issues: all_issues.append({"file": str(f.name), "issues": issues})
    if all_issues:
        for item in all_issues[:10]:
            print(f"\n{item['file']}:")
            for issue in item["issues"]: print(f"  - {issue}")
    else: print("No SEO issues found!")
    sys.exit(0)

if __name__ == "__main__": main()
