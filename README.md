# AI-Powered Placement Preparation Command Centre
### 15-Day MNC Accelerator for B.Tech CSE (AI & ML) — 2028 Batch
**Target Roles:** Software Development Engineer (SDE), Java Developer, Python Developer, AI/ML Engineer, Data Analyst, GET  
**Target Location:** Mumbai & Mumbai Metropolitan Region (MMR), India  
**Target Compensation:** 12+ LPA  

---

## 🚀 Overview

The **Placement Preparation Command Centre** is a full-stack web application built to take a B.Tech Computer Science (AI & ML) student from foundational knowledge to MNC interview readiness within an intensive 15-day regimen.

Unlike static study sheets or prototypes, this is a working production-grade platform with:
- **Persistent SQLite Database** for all tasks, timers, notes, mistakes, DSA problems, and mock interviews.
- **Interactive Live AI Voice Mock Interview Room** powered by Web Speech Synthesis & Recognition, turn-based dialogue, dynamic follow-ups, and post-interview evaluations.
- **Task-Level Stopwatch & Countdown Timers** that track actual study duration, persist across browser refreshes, and support auto carry-forward for incomplete tasks.
- **Complete DSA Tracker** preloaded with the required LeetCode problem suite (Arrays, Hashing, Two Pointers, Binary Search, Linked Lists, Monotonic Stack).
- **100 Curated Aptitude Practice Questions** across all 10 core placement categories with instant mathematical explanations.
- **Interactive Sandboxed SQL Playground & Core CS Lab** (DBMS, OS, Computer Networks, OOP, Java).
- **Project Deep-Dive Defense** for your two academic systems (*Academic Intervention System* & *Mental Health Risk Classification*).
- **25-Point Placement Resume Audit & Mumbai Job Tracker** for 2028 batch eligible openings.
- **Placement Readiness Scoring Algorithm** that calculates preparation level honestly without assuming mastery just because an item was checked.

---

## 📁 Folder Structure

```text
c:\Users\devas\Dropbox\new h new\
├── backend\
│   ├── __init__.py
│   ├── app.py                 # Flask REST API server & static SPA delivery
│   ├── database.py            # SQLite database schema, foreign keys & migrations
│   ├── ai_service.py          # LLM API integration (Gemini, OpenAI, Groq & fallback engine)
│   ├── seed_data.py           # 15-day syllabus, 100 aptitude Qs, DSA list, projects & jobs
│   └── config.py              # Environment variables and configuration loader
├── frontend\
│   ├── index.html             # Single-Page Application entry point (Tailwind CSS, React 18)
│   ├── app.jsx                # Modular React application containing all 14 feature views
│   └── styles.css             # Custom styles, glassmorphism, animations, audio waves
├── placement_command_centre.db # Persistent SQLite Database
├── run.py                     # One-click launch script
├── test_app.py                # 14-suite automated test verification runner
├── requirements.txt           # Python dependencies
├── .env.example               # Environment variables template
└── README.md                  # Complete documentation
```

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Tailwind CSS, Plus Jakarta Sans & JetBrains Mono typography, Web Speech API (`SpeechRecognition` & `SpeechSynthesis`), Audio Wave Visualizers.
- **Backend:** Python (Flask 3.1 REST APIs, Werkzeug, SQLite3 connection pooling).
- **Database:** SQLite (`placement_command_centre.db`) with relational integrity, foreign keys, and JSON serialization.
- **AI Integration:** Google Gemini API (`gemini-1.5-flash`), OpenAI API (`gpt-4o-mini`), Groq (`llama-3.3-70b`), plus a local technical evaluation engine when operating offline or without API keys.

---

## ⚡ Setup & Installation

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Modern Web Browser (Google Chrome, Microsoft Edge, Brave, or Opera recommended for Web Speech API mic support)

### Installation Commands

1. **Clone or navigate to the project directory:**
   ```powershell
   cd "c:\Users\devas\Dropbox\new h new"
   ```

2. **Install required packages:**
   ```powershell
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables (Optional for Cloud AI):**
   ```powershell
   copy .env.example .env
   ```
   Open `.env` in any text editor and supply your Google Gemini, OpenAI, or Groq API key:
   ```env
   ACTIVE_AI_PROVIDER=gemini
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   AI_MODEL=gemini-1.5-flash
   ```
   *(Note: You can also configure API keys directly in the application UI under "Settings & Backup")*

---

## 🏃 How to Run the Application

Execute the one-click startup runner:
```powershell
python run.py
```

Output:
```text
==================================================================
🚀 STARTING PLACEMENT PREPARATION COMMAND CENTRE (15-DAY ACCELERATOR)
==================================================================
Degree: B.Tech Computer Science Engineering, AI & ML (2028 Batch)
Target: 12+ LPA • Mumbai / MMR Roles (SDE, AI/ML, Java, Python, Data)
------------------------------------------------------------------
📦 Checking & Initializing Persistent SQLite Database...
✅ Database ready: placement_command_centre.db
🌐 Server launching on: http://127.0.0.1:8000
🎙️ AI Live Voice Mock Interview Room: Ready (Web Speech API + LLM)
⏱️ Task Timers & Stopwatches: Ready (Persistent Sync)
💻 21 LeetCode DSA Problems & 100 Aptitude Questions: Ready
==================================================================
👉 OPEN IN YOUR BROWSER: http://127.0.0.1:8000
==================================================================
```

Open `http://127.0.0.1:8000` in Google Chrome or Microsoft Edge.

---

## 🎙️ AI Live Voice Mock Interview Room Configuration

1. **Microphone Setup:**
   - When entering the **AI Interview Room** and clicking **"Speak into Mic"**, allow microphone permissions when prompted by your browser.
   - The app uses English (India) speech recognition (`en-IN`) tuned for Indian technical CSE pronunciations.
   - If speech recognition mishears any technical acronym (e.g., "O of N" or "SQL"), you can edit the transcript directly before clicking **"Submit Response"**.

2. **Configuring Gemini or OpenAI API Key:**
   - Navigate to the **"Settings & Backup"** tab in the sidebar.
   - Select your provider (**Google Gemini**, **OpenAI**, or **Groq**).
   - Paste your API key.
   - Click **"Save Configuration"** and test with **"Test AI Connection"**.
   - If no API key is entered, the application automatically uses the **System Technical Engine** (fallback mode), which asks contextual technical questions for all 15 days, challenges brief answers, and generates evaluation scorecards.

---

## 🧪 Testing Results

To verify all system features, run the automated test suite:
```powershell
python test_app.py
```

### Verification Matrix:
| Test Suite | Feature Covered | Result |
| :--- | :--- | :--- |
| **[1/14]** | SQLite Database Initialization & Schema Seeding | **PASSED** |
| **[2/14]** | Single-Page Application & Static Asset Delivery | **PASSED** |
| **[3/14]** | Placement Readiness Scoring & Dashboard Metrics | **PASSED** |
| **[4/14]** | 15-Day Planner & Scheduled Date Editing | **PASSED** |
| **[5/14]** | Task Creation, Stopwatch Timer & Persistence | **PASSED** |
| **[6/14]** | DSA Tracker (LeetCode Suite & Complexity Logging) | **PASSED** |
| **[7/14]** | Aptitude Interactive Quiz (100 Questions & Answers) | **PASSED** |
| **[8/14]** | Sandboxed In-Memory Interactive SQL Runner | **PASSED** |
| **[9/14]** | Academic Project Deep Dives & Architecture Defense | **PASSED** |
| **[10/14]** | Live AI Mock Interview Dynamic Question Generation | **PASSED** |
| **[11/14]** | Mock Interview Evaluation Reports & Error Memory | **PASSED** |
| **[12/14]** | 25-Point Resume Audit & Mumbai Verified Jobs | **PASSED** |
| **[13/14]** | Day 15 Readiness Assessment & Next 30-Day Plan | **PASSED** |
| **[14/14]** | Full Database JSON Export & Disaster Recovery | **PASSED** |

**Outcome:** 14 of 14 automated tests passed with 100% success.

---

## 🔒 Known Limitations & Production Notes

1. **Browser Voice Features:**
   - `webkitSpeechRecognition` requires a Chromium-based browser (Chrome, Edge, Brave, Opera) or Safari. In Firefox or environments where microphone access is denied, the application gracefully provides instant text-based fallback input.
2. **Honest Readiness Score:**
   - The placement readiness index intentionally penalizes unattempted domains. Merely checking a task complete without solving the corresponding DSA problem, logging confidence, or completing the day's mock interview will not result in a 100% score.
3. **MNC Job Listings:**
   - The verified job tracker contains genuine corporate recruiting channels for companies with engineering centres in Mumbai / Navi Mumbai / Pune (Morgan Stanley, Barclays, J.P. Morgan, Jio, Quantiphi, LTIMindtree, Fractal, Nomura). It does not fabricate fake recruiter contacts or deadlines.
