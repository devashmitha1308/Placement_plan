import os
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.database import init_db
from backend.seed_data import seed_database
from backend.app import app

# Automatically ensure database tables and syllabus are initialized
init_db()
seed_database()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Placement Command Centre running on http://{host}:{port}")
    app.run(host=host, port=port, debug=False)
