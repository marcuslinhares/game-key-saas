#!/usr/bin/env python3
"""
Schema Validator - Database schema validation
Validates Prisma schemas and checks for common issues.
"""
import sys
import json
import re
from pathlib import Path
from datetime import datetime

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except:
    pass

def find_schema_files(project_path: Path) -> list:
    """Find database schema files."""
    schemas = []
    prisma_files = list(project_path.glob('**/prisma/schema.prisma'))
    schemas.extend([('prisma', f) for f in prisma_files])
    drizzle_files = list(project_path.glob('**/drizzle/*.ts'))
    drizzle_files.extend(project_path.glob('**/schema/*.ts'))
    for f in drizzle_files:
        if 'schema' in f.name.lower() or 'table' in f.name.lower():
            schemas.append(('drizzle', f))
    return schemas[:10]

def validate_prisma_schema(file_path: Path) -> list:
    """Validate Prisma schema file."""
    issues = []
    try:
        content = file_path.read_text(encoding='utf-8', errors='ignore')
        models = re.findall(r'model\s+(\w+)\s*{([^}]+)}', content, re.DOTALL)
        for model_name, model_body in models:
            if not model_name[0].isupper():
                issues.append(f"Model '{model_name}' should be PascalCase")
            if '@id' not in model_body and 'id' not in model_body.lower():
                issues.append(f"Model '{model_name}' might be missing @id field")
            if 'createdAt' not in model_body and 'created_at' not in model_body:
                issues.append(f"Model '{model_name}' missing createdAt field (recommended)")
            foreign_keys = re.findall(r'(\w+Id)\s+\w+', model_body)
            for fk in foreign_keys:
                if f'@@index([{fk}])' not in content and f'@@index(["{fk}"])' not in content:
                    issues.append(f"Consider adding @@index([{fk}]) for performance in {model_name}")
    except Exception as e:
        issues.append(f"Error reading schema: {str(e)[:50]}")
    return issues

def main():
    project_path = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    print(f"\n[SCHEMA VALIDATOR] Database Schema Validation")
    schemas = find_schema_files(project_path)
    if not schemas:
        print("No schema files found.")
        sys.exit(0)
    all_issues = []
    for schema_type, file_path in schemas:
        if schema_type == 'prisma':
            issues = validate_prisma_schema(file_path)
            if issues:
                all_issues.append({"file": str(file_path.name), "issues": issues})
    if all_issues:
        for item in all_issues:
            print(f"\n{item['file']}:")
            for issue in item["issues"]:
                print(f"  - {issue}")
    else:
        print("No schema issues found!")
    sys.exit(0)

if __name__ == "__main__":
    main()
