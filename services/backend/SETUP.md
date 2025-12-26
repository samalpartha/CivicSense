# Backend Setup Instructions

## Resolving Import Errors in IDE

The linter warning `Import "pydantic_settings" could not be resolved` appears because the package isn't installed in your IDE's Python environment.

### Solution 1: Use Virtual Environment (Recommended)

1. **Create virtual environment**:
   ```bash
   cd services/backend
   python3 -m venv venv
   ```

2. **Activate it**:
   ```bash
   source venv/bin/activate  # macOS/Linux
   # or
   venv\Scripts\activate     # Windows
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure IDE to use venv**:
   - **VS Code**: Select Python interpreter (Cmd+Shift+P → "Python: Select Interpreter" → choose `./venv/bin/python`)
   - **Cursor**: Same as VS Code
   - **PyCharm**: Settings → Project → Python Interpreter → Add → Existing Environment → select `venv/bin/python`

### Solution 2: Quick Deploy Script

Simply run:
```bash
./deploy.sh
```

This automatically:
- Creates virtual environment
- Installs all dependencies
- Starts the server

### Verification

After setup, verify the import works:
```bash
source venv/bin/activate
python -c "from pydantic_settings import BaseSettings; print('✓ Import successful')"
```

You should see: `✓ Import successful`

### Why This Happens

- `pydantic-settings` is listed in `requirements.txt` but not installed globally
- Python 3.12+ uses externally-managed environments (PEP 668)
- Virtual environments are the recommended approach
- The code is correct; it's just an IDE configuration issue

### Quick Fix for IDE

If you just want to silence the warning without full setup:
1. Install in user space: `pip install --user pydantic-settings`
2. Or use the virtual environment as described above (recommended)

The import **will work at runtime** once dependencies are installed via `deploy.sh` or `pip install -r requirements.txt`.

