"""Check syntax of all Python files in the project."""
import ast
import os
import sys

base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'app')
files = ['main.py', 'diseases.py', 'inference.py', 'symptoms.py', 'gradcam.py', 'quality_check.py', 'model.py', 'preprocessing.py']

errors = []
for f in files:
    path = os.path.join(base_dir, f)
    try:
        with open(path, 'r', encoding='utf-8') as fh:
            content = fh.read()
        ast.parse(content)
        print(f"✅ {f}: syntax OK")
    except SyntaxError as e:
        print(f"❌ {f}: SYNTAX ERROR - {e}")
        errors.append((f, str(e)))
    except FileNotFoundError:
        print(f"⚠️  {f}: file not found")

if errors:
    print(f"\n❌ Found {len(errors)} syntax errors")
    sys.exit(1)
else:
    print("\n✅ All Python files pass syntax check!")
    sys.exit(0)