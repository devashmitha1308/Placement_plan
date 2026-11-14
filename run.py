#!/usr/bin/env python3
"""
Placement Preparation Command Centre - 15-Day MNC Accelerator
Startup Runner Script
"""

import sys
import os
from pathlib import Path

# Ensure UTF-8 stdout encoding on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from backend.database import init_db
from backend.seed_data import seed_database
from backend.config import HOST, PORT
from backend.app import app

def main():
    print("==================================================================")
    print("🚀 STARTING PLACEMENT PREPARATION COMMAND CENTRE (15-DAY ACCELERATOR)")
    print("==================================================================")
    print("Degree: B.Tech Computer Science Engineering, AI & ML (2028 Batch)")
    print("Target: 12+ LPA • Mumbai / MMR Roles (SDE, AI/ML, Java, Python, Data)")
    print("------------------------------------------------------------------")
    
    # 1. Initialize and Seed SQLite Database
    print("📦 Checking & Initializing Persistent SQLite Database...")
    init_db()
    seed_database()
    print("✅ Database ready: placement_command_centre.db")

    # 2. Start Web Server
    active_port = int(os.environ.get("PORT", PORT))
    active_host = os.environ.get("HOST", HOST)
    print(f"🌐 Server launching on: http://{active_host}:{active_port}")
    print("🎙️ AI Live Voice Mock Interview Room: Ready (Web Speech API + LLM)")
    print("⏱️ Task Timers & Stopwatches: Ready (Persistent Sync)")
    print("💻 21 LeetCode DSA Problems & 100 Aptitude Questions: Ready")
    print("==================================================================")
    print(f"👉 OPEN IN YOUR BROWSER: http://{active_host}:{active_port}")
    print("==================================================================")

    app.run(host=active_host, port=active_port, debug=False)

if __name__ == "__main__":
    main()
