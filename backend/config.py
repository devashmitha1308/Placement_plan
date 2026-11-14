import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

# Simple .env loader without external dependencies
if ENV_PATH.exists():
    with open(ENV_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip("'\""))

DATABASE_PATH = os.environ.get("DATABASE_PATH", str(BASE_DIR / "placement_command_centre.db"))
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8000"))

# AI Configuration
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
ACTIVE_AI_PROVIDER = os.environ.get("ACTIVE_AI_PROVIDER", "gemini" if GEMINI_API_KEY else ("openai" if OPENAI_API_KEY else "system"))
AI_MODEL = os.environ.get("AI_MODEL", "gemini-1.5-flash")
