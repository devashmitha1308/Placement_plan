// Placement Preparation Command Centre - Master React Application
const { useState, useEffect, useRef, useCallback } = React;

// API Base URL
const API_BASE = "";

// Helper fetch wrapper
async function apiCall(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${endpoint}`, options);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error (${res.status}): ${errorText}`);
  }
  return await res.json();
}

// Format seconds into HH:MM:SS or MM:SS
function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState(localStorage.getItem("placement_theme") || "dark");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [toast, setToast] = useState(null);

  // Active Task Timer State (Persisted in localStorage and synced with DB)
  const [activeTimerTask, setActiveTimerTask] = useState(() => {
    try {
      const saved = localStorage.getItem("active_timer_task");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [timerSeconds, setTimerSeconds] = useState(() => {
    return activeTimerTask ? activeTimerTask.actual_seconds || 0 : 0;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState("stopwatch"); // stopwatch or countdown
  const timerIntervalRef = useRef(null);

  // Toast notification helper
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Toggle Theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("placement_theme", newTheme);
  };

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    try {
      const data = await apiCall("/api/dashboard/stats");
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  // Global Timer Tick
  useEffect(() => {
    if (isTimerRunning && activeTimerTask) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          const next = timerMode === "countdown" ? Math.max(0, prev - 1) : prev + 1;
          return next;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, activeTimerTask, timerMode]);

  // Periodic Timer Sync with Backend (every 10s if running)
  useEffect(() => {
    if (!isTimerRunning || !activeTimerTask) return;
    const syncInterval = setInterval(async () => {
      try {
        await apiCall(`/api/tasks/${activeTimerTask.id}/timer`, "POST", { added_seconds: 10 });
        // Update local storage representation
        const updated = { ...activeTimerTask, actual_seconds: timerSeconds };
        setActiveTimerTask(updated);
        localStorage.setItem("active_timer_task", JSON.stringify(updated));
      } catch (err) {
        console.error("Timer sync error:", err);
      }
    }, 10000);
    return () => clearInterval(syncInterval);
  }, [isTimerRunning, activeTimerTask, timerSeconds]);

  // Start Timer for a Specific Task
  const handleStartTimer = (task, mode = "stopwatch") => {
    if (activeTimerTask && activeTimerTask.id === task.id) {
      setIsTimerRunning(true);
      return;
    }
    // Switch to new task
    setActiveTimerTask(task);
    setTimerMode(mode);
    setTimerSeconds(mode === "countdown" ? (task.planned_minutes * 60) : (task.actual_seconds || 0));
    setIsTimerRunning(true);
    localStorage.setItem("active_timer_task", JSON.stringify(task));
    showToast(`Timer started for: ${task.title}`);
  };

  const handlePauseTimer = async () => {
    setIsTimerRunning(false);
    if (activeTimerTask) {
      try {
        await apiCall(`/api/tasks/${activeTimerTask.id}`, "PUT", { actual_seconds: timerSeconds });
        showToast("Timer paused and time saved.");
        fetchStats();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleResetTimer = async () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    if (activeTimerTask) {
      await apiCall(`/api/tasks/${activeTimerTask.id}`, "PUT", { actual_seconds: 0 });
      showToast("Timer reset.");
      fetchStats();
    }
  };

  const handleCloseTimerBar = () => {
    handlePauseTimer();
    setActiveTimerTask(null);
    localStorage.removeItem("active_timer_task");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "planner", label: "15-Day Planner", icon: "🗓️" },
    { id: "tasks", label: "Daily Tasks & Timers", icon: "⏱️" },
    { id: "progress", label: "Progress Analytics", icon: "📈" },
    { id: "dsa", label: "DSA Practice Tracker", icon: "💻" },
    { id: "aptitude", label: "Aptitude (100 Qs)", icon: "📐" },
    { id: "core_cs", label: "Core CS & SQL Lab", icon: "🗄️" },
    { id: "ai_ml", label: "AI/ML Learning", icon: "🧠" },
    { id: "projects", label: "Project Prep Centre", icon: "🚀" },
    { id: "mock_interview", label: "Live AI Voice Room", icon: "🎙️", badge: "Live AI" },
    { id: "resume", label: "Resume Checklist", icon: "📄" },
    { id: "jobs", label: "Mumbai Job Tracker", icon: "💼" },
    { id: "communication", label: "Communication & HR", icon: "🗣️" },
    { id: "final_report", label: "Placement Report", icon: "🏆" },
    { id: "settings", label: "Settings & Backup", icon: "⚙️" },
  ];

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl bg-indigo-600 text-white font-medium text-sm animate-bounce">
          <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-72 flex-shrink-0 flex flex-col border-r ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"}`}>
        {/* Brand Header */}
        <div className="p-5 border-b border-inherit">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/25">
              ⚡
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight leading-tight">Placement Command</h1>
              <p className="text-xs text-indigo-400 font-semibold tracking-wide uppercase">15-Day MNC Accelerator</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-inherit/50 flex items-center justify-between text-xs text-slate-400">
            <span>B.Tech CSE (AI & ML)</span>
            <span className="font-semibold text-emerald-400">Target: 12+ LPA</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? isDark
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : isDark
                      ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Theme Quick Toggle */}
        <div className="p-4 border-t border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-xs text-white">
              2028
            </div>
            <div>
              <p className="text-xs font-semibold">Devashish</p>
              <p className="text-[10px] text-slate-400">Mumbai Candidate</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            title="Toggle Dark / Light Theme"
            className={`p-2 rounded-lg border text-sm transition ${
              isDark ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700" : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Sticky Bar */}
        <header className={`sticky top-0 z-30 px-8 py-3.5 border-b backdrop-blur flex items-center justify-between ${
          isDark ? "bg-slate-950/80 border-slate-800" : "bg-white/80 border-slate-200"
        }`}>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold capitalize">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
            {stats && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span>Placement Readiness:</span>
                <span className="font-bold text-sm">{stats.readiness_score}%</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("mock_interview")}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold shadow-md shadow-pink-500/20 hover:opacity-95 flex items-center gap-2"
            >
              <span>🎙️</span>
              <span>Launch Mock Interview</span>
            </button>
            <button
              onClick={fetchStats}
              title="Refresh Stats"
              className={`p-2 rounded-xl border text-xs font-medium transition ${
                isDark ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
              }`}
            >
              🔄
            </button>
          </div>
        </header>

        {/* Global Active Timer Floating Banner */}
        {activeTimerTask && (
          <div className={`px-8 py-2.5 border-b flex items-center justify-between text-xs ${
            isDark ? "bg-indigo-950/60 border-indigo-900/60 text-indigo-200" : "bg-indigo-50 border-indigo-200 text-indigo-900"
          }`}>
            <div className="flex items-center gap-3 truncate">
              <span className={`w-2.5 h-2.5 rounded-full ${isTimerRunning ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`}></span>
              <span className="font-semibold uppercase tracking-wider text-[10px] text-indigo-400">Active Task:</span>
              <span className="font-medium truncate max-w-md">{activeTimerTask.title}</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 font-semibold">{activeTimerTask.subject}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-mono text-base font-bold text-white bg-slate-900 px-3 py-1 rounded-lg border border-indigo-500/30">
                {formatTime(timerSeconds)}
              </div>
              <div className="flex items-center gap-1.5">
                {isTimerRunning ? (
                  <button onClick={handlePauseTimer} className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400">
                    Pause
                  </button>
                ) : (
                  <button onClick={() => setIsTimerRunning(true)} className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400">
                    Resume
                  </button>
                )}
                <button onClick={handleResetTimer} className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700">
                  Reset
                </button>
                <button onClick={handleCloseTimerBar} className="p-1 rounded text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Tab View Body */}
        <div className="flex-1 p-8">
          {activeTab === "dashboard" && <DashboardView stats={stats} loading={loadingStats} onNavigate={setActiveTab} isDark={isDark} />}
          {activeTab === "planner" && <PlannerView onStartTimer={handleStartTimer} onNavigate={setActiveTab} isDark={isDark} showToast={showToast} refreshStats={fetchStats} />}
          {activeTab === "tasks" && <TasksView onStartTimer={handleStartTimer} activeTimerId={activeTimerTask?.id} isDark={isDark} showToast={showToast} refreshStats={fetchStats} />}
          {activeTab === "progress" && <ProgressAnalyticsView stats={stats} isDark={isDark} />}
          {activeTab === "dsa" && <DSAView isDark={isDark} showToast={showToast} refreshStats={fetchStats} />}
          {activeTab === "aptitude" && <AptitudeView isDark={isDark} showToast={showToast} refreshStats={fetchStats} />}
          {activeTab === "core_cs" && <CoreCSView isDark={isDark} showToast={showToast} />}
          {activeTab === "ai_ml" && <AIMLLearningView isDark={isDark} onNavigate={setActiveTab} />}
          {activeTab === "projects" && <ProjectsView isDark={isDark} onNavigate={setActiveTab} showToast={showToast} />}
          {activeTab === "mock_interview" && <MockInterviewView isDark={isDark} showToast={showToast} refreshStats={fetchStats} />}
          {activeTab === "resume" && <ResumeView isDark={isDark} showToast={showToast} refreshStats={fetchStats} />}
          {activeTab === "jobs" && <JobsView isDark={isDark} showToast={showToast} />}
          {activeTab === "communication" && <CommunicationView isDark={isDark} showToast={showToast} />}
          {activeTab === "final_report" && <FinalReportView isDark={isDark} />}
          {activeTab === "settings" && <SettingsView isDark={isDark} showToast={showToast} refreshStats={fetchStats} />}
        </div>
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 1: DASHBOARD VIEW
// -------------------------------------------------------------
function DashboardView({ stats, loading, onNavigate, isDark }) {
  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Crunching your placement command centre data...</p>
      </div>
    );
  }

  const cardClass = `p-6 rounded-2xl border transition shadow-sm ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner: Profile & Objective */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur mb-4">
            <span>🎯</span>
            <span>Target: 12+ LPA • Mumbai / MMR • 2028 CSE (AI & ML)</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">
            Placement Readiness Index: <span className="text-emerald-400">{stats.readiness_score}%</span>
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed mb-6">
            Calibrated against MNC hiring benchmarks (Amazon, Morgan Stanley, J.P. Morgan, Barclays, Jio).
            Readiness incorporates verified DSA solve rates, aptitude accuracy, mock interview transcripts, and Core CS depth.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate("mock_interview")}
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-sm shadow hover:bg-indigo-50 transition"
            >
              🎙️ Take Today's AI Mock Interview
            </button>
            <button
              onClick={() => onNavigate("tasks")}
              className="px-5 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 border border-white/20 text-white font-semibold text-sm transition"
            >
              ⏱️ Today's Active Tasks
            </button>
            <button
              onClick={() => onNavigate("final_report")}
              className="px-5 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-400/30 text-purple-200 font-semibold text-sm transition"
            >
              🏆 View Day 15 Forecast
            </button>
          </div>
        </div>
        {/* Background glow circle */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: 15-Day Completion */}
        <div className={cardClass}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>15-DAY COMPLETION</span>
            <span className="text-indigo-400">🗓️</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold">{stats.days_completion_pct}%</span>
            <span className="text-xs text-slate-400">({stats.completed_days} of {stats.total_days} days)</span>
          </div>
          <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
            <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${stats.days_completion_pct}%` }}></div>
          </div>
        </div>

        {/* Card 2: Study Hours */}
        <div className={cardClass}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>STUDY HOURS (ACTUAL / PLANNED)</span>
            <span className="text-amber-400">⏱️</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold">{stats.study_hours.actual_hours}h</span>
            <span className="text-xs text-slate-400">/ {stats.study_hours.planned_hours}h planned</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {stats.study_hours.actual_hours >= stats.study_hours.planned_hours
              ? "🔥 On pace with daily target!"
              : "⚠️ Pace slightly behind target; catch up today."}
          </p>
        </div>

        {/* Card 3: DSA Problems */}
        <div className={cardClass}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>DSA PROBLEMS SOLVED</span>
            <span className="text-emerald-400">💻</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold">{stats.dsa_stats.solved}</span>
            <span className="text-xs text-slate-400">/ {stats.dsa_stats.total} total</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-emerald-400 font-medium">Easy: {stats.dsa_stats.by_difficulty?.Easy?.solved || 0}</span>
            <span className="text-amber-400 font-medium">Med: {stats.dsa_stats.by_difficulty?.Medium?.solved || 0}</span>
            <span className="text-rose-400 font-medium">Hard: {stats.dsa_stats.by_difficulty?.Hard?.solved || 0}</span>
          </div>
        </div>

        {/* Card 4: Aptitude Accuracy */}
        <div className={cardClass}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>APTITUDE ACCURACY</span>
            <span className="text-cyan-400">📐</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold">{stats.aptitude_stats.accuracy}%</span>
            <span className="text-xs text-slate-400">({stats.aptitude_stats.correct} / {stats.aptitude_stats.attempted})</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {stats.aptitude_stats.accuracy >= 75
              ? "✅ Meets top MNC screening cutoff (>=75%)"
              : "⚠️ Needs drill in weak categories"}
          </p>
        </div>
      </div>

      {/* Middle Row: Subject-Wise Progress & Mock Scores Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject Wise Progress */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">Subject-Wise Preparation Progress</h3>
            <button onClick={() => onNavigate("planner")} className="text-xs text-indigo-400 hover:underline">
              View Syllabus →
            </button>
          </div>
          <div className="space-y-3.5">
            {stats.subject_progress.map(s => (
              <div key={s.subject}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>{s.subject}</span>
                  <span className="text-slate-400">{s.completed}/{s.total} tasks ({s.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-700/20 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${s.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Mock Interview Scores History */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base">AI Mock Interview Scoreboard</h3>
              <p className="text-xs text-slate-400">Average: {stats.avg_mock_score} / 100</p>
            </div>
            <button onClick={() => onNavigate("mock_interview")} className="text-xs text-pink-400 font-semibold hover:underline">
              + New Session
            </button>
          </div>
          {stats.mock_scores && stats.mock_scores.length > 0 ? (
            <div className="space-y-2.5">
              {stats.mock_scores.slice(-5).map(m => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDark ? "bg-slate-800/40 border-slate-700/50" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold">{m.title}</p>
                    <p className="text-[10px] text-slate-400">Day {m.day_number} Session</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-extrabold ${m.overall_score >= 80 ? "text-emerald-400" : m.overall_score >= 65 ? "text-amber-400" : "text-rose-400"}`}>
                      {m.overall_score}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs border border-dashed rounded-xl border-slate-700/50">
              <p className="mb-2">No mock interview sessions recorded yet.</p>
              <button
                onClick={() => onNavigate("mock_interview")}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold"
              >
                Start Day 1 Mock Interview
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Weakest Topics & Upcoming Revisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weakest Topics (Dynamically Calculated) */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-rose-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>Identified Weak Areas & Interview Memory</span>
            </h3>
            <span className="text-xs text-slate-400">Strict Non-Sugarcoated</span>
          </div>
          <div className="space-y-3">
            {stats.weak_topics.interview_memory.length > 0 ? (
              stats.weak_topics.interview_memory.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  <p className="font-bold">{item.topic}</p>
                  <p className="text-slate-300 text-[11px] mt-0.5">{item.mistake_identified}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No unresolved interview errors logged yet. Keep testing!</p>
            )}

            {stats.weak_topics.aptitude.length > 0 && (
              <div className="pt-2 border-t border-inherit">
                <p className="text-xs font-semibold text-slate-300 mb-2">Aptitude Categories Below 60% Accuracy:</p>
                <div className="flex flex-wrap gap-2">
                  {stats.weak_topics.aptitude.map((a, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                      {a.category}: {a.accuracy}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Revision Tasks */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
              <span>🔄</span>
              <span>Upcoming Priority Revision Tasks</span>
            </h3>
            <button onClick={() => onNavigate("tasks")} className="text-xs text-indigo-400 hover:underline">
              Manage Tasks →
            </button>
          </div>
          <div className="space-y-2.5">
            {stats.upcoming_revisions && stats.upcoming_revisions.length > 0 ? (
              stats.upcoming_revisions.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isDark ? "bg-slate-800/40 border-slate-700/50" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div>
                    <span className="font-bold">{item.title}</span>
                    <span className="ml-2 text-[10px] text-slate-400">Day {item.day_number} • {item.subject}</span>
                    {item.mistakes && <p className="text-[11px] text-amber-400/90 mt-0.5">Mistake: {item.mistakes}</p>}
                  </div>
                  <button
                    onClick={() => onNavigate("tasks")}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/50"
                  >
                    Revise
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No tasks currently flagged for revision. Mark tasks with "Revision Required" when encountering tricky concepts!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 2: 15-DAY PLANNER VIEW (Dates Editable)
// -------------------------------------------------------------
function PlannerView({ onStartTimer, onNavigate, isDark, showToast, refreshStats }) {
  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [dayDetails, setDayDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingDate, setEditingDate] = useState(false);
  const [newDate, setNewDate] = useState("");

  const loadDays = async () => {
    try {
      const data = await apiCall("/api/days");
      setDays(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDayDetails = async (dayNum) => {
    try {
      setLoading(true);
      const data = await apiCall(`/api/days/${dayNum}`);
      setDayDetails(data);
      setNewDate(data.date_scheduled);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDays();
    loadDayDetails(selectedDay);
  }, [selectedDay]);

  const handleUpdateDate = async () => {
    try {
      await apiCall(`/api/days/${selectedDay}`, "PUT", { date_scheduled: newDate });
      showToast(`Updated scheduled date for Day ${selectedDay}`);
      setEditingDate(false);
      loadDays();
      loadDayDetails(selectedDay);
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleToggleTaskComplete = async (task) => {
    try {
      await apiCall(`/api/tasks/${task.id}`, "PUT", { completed: !task.completed });
      showToast(`Task marked ${!task.completed ? "complete" : "pending"}`);
      loadDayDetails(selectedDay);
      refreshStats();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const cardClass = `p-6 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 15 Days Horizontal Scroll Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {days.map(d => {
          const isSelected = d.day_number === selectedDay;
          return (
            <button
              key={d.day_number}
              onClick={() => setSelectedDay(d.day_number)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
                isSelected
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/30"
                  : d.completed
                    ? isDark ? "bg-emerald-950/40 border-emerald-800 text-emerald-400" : "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>Day {d.day_number}</span>
                {d.completed && <span>✓</span>}
              </div>
              <div className="text-[10px] opacity-75 font-normal truncate max-w-[100px]">{d.subject}</div>
            </button>
          );
        })}
      </div>

      {loading || !dayDetails ? (
        <div className="text-center py-12 text-slate-400">Loading syllabus for Day {selectedDay}...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Syllabus and Material (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className={cardClass}>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-inherit pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase">
                      {dayDetails.subject}
                    </span>
                    <h2 className="text-xl font-extrabold">{dayDetails.title}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{dayDetails.summary}</p>
                </div>

                {/* Editable Date widget */}
                <div className="flex items-center gap-2">
                  {editingDate ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={newDate}
                        onChange={e => setNewDate(e.target.value)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                          isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"
                        }`}
                      />
                      <button onClick={handleUpdateDate} className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                        Save
                      </button>
                      <button onClick={() => setEditingDate(false)} className="px-2.5 py-1.5 rounded-lg bg-slate-700 text-white text-xs">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">📅 Date:</span>
                      <span className="font-bold">{dayDetails.date_scheduled}</span>
                      <button onClick={() => setEditingDate(true)} className="text-indigo-400 hover:underline">
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Learning Objectives */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Learning Objectives</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dayDetails.learning_objectives?.map((obj, i) => (
                    <div key={i} className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                      isDark ? "bg-slate-800/40 border-slate-700/50 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}>
                      <span className="text-indigo-400 font-bold">#{i+1}</span>
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topics & Subtopics */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Key Topics & Subtopics</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {dayDetails.topics?.map((top, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                      {top}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dayDetails.subtopics?.map((sub, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[11px]">
                      • {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Study Material & Explanations */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Study Material & Technical Reference</h4>
                <div className={`p-4 rounded-xl border text-xs leading-relaxed whitespace-pre-line font-mono ${
                  isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-800"
                }`}>
                  {dayDetails.study_material}
                </div>
              </div>
            </div>

            {/* Practical Exercises */}
            <div className={cardClass}>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Practical Exercises & Drills</h4>
              <ul className="space-y-2 text-xs">
                {dayDetails.practical_exercises?.map((ex, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">⚡</span>
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Sidebar: Day's Tasks & Actions (1 col) */}
          <div className="space-y-6">
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Day {selectedDay} Tasks</h3>
                <span className="text-xs text-slate-400">
                  {dayDetails.tasks?.filter(t => t.completed).length} / {dayDetails.tasks?.length} Done
                </span>
              </div>

              <div className="space-y-3">
                {dayDetails.tasks?.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border text-xs transition ${
                      task.completed
                        ? isDark ? "bg-emerald-950/20 border-emerald-900/50 text-slate-400 line-through" : "bg-emerald-50 border-emerald-200 text-slate-500 line-through"
                        : isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={!!task.completed}
                          onChange={() => handleToggleTaskComplete(task)}
                          className="mt-0.5 rounded cursor-pointer"
                        />
                        <span className="font-semibold">{task.title}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-inherit/40">
                      <span>{task.planned_minutes} mins</span>
                      <button
                        onClick={() => onStartTimer(task)}
                        className="px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/60 font-semibold"
                      >
                        ⏱️ Start Timer
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-inherit space-y-2">
                <button
                  onClick={() => onNavigate("mock_interview")}
                  className="w-full py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-600/20"
                >
                  🎙️ Run Day {selectedDay} AI Mock Interview
                </button>
                <button
                  onClick={() => onNavigate("tasks")}
                  className="w-full py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs"
                >
                  Open in Task Manager
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 3: TASKS VIEW & TIMER TRACKER
// -------------------------------------------------------------
function TasksView({ onStartTimer, activeTimerId, isDark, showToast, refreshStats }) {
  const [tasks, setTasks] = useState([]);
  const [dayFilter, setDayFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("Java");
  const [newTaskMins, setNewTaskMins] = useState(45);
  const [newTaskDay, setNewTaskDay] = useState(1);

  const loadTasks = async () => {
    try {
      const data = await apiCall(dayFilter === "all" ? "/api/tasks" : `/api/tasks?day_number=${dayFilter}`);
      setTasks(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [dayFilter]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      await apiCall("/api/tasks", "POST", {
        day_number: parseInt(newTaskDay),
        title: newTaskTitle.trim(),
        subject: newTaskSubject,
        category: "theory",
        planned_minutes: parseInt(newTaskMins)
      });
      showToast("New task created successfully");
      setNewTaskTitle("");
      loadTasks();
      refreshStats();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleUpdateTaskField = async (taskId, fields) => {
    try {
      await apiCall(`/api/tasks/${taskId}`, "PUT", fields);
      loadTasks();
      refreshStats();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleCarryForward = async () => {
    try {
      const fromDay = prompt("Carry forward incomplete tasks FROM Day (1-15):", "1");
      if (!fromDay) return;
      const toDay = prompt("Carry forward incomplete tasks TO Day (1-15):", "2");
      if (!toDay) return;

      const res = await apiCall("/api/tasks/carry-forward", "POST", {
        from_day: parseInt(fromDay),
        to_day: parseInt(toDay)
      });
      showToast(`Carried forward ${res.carried_forward_count} tasks to Day ${toDay}!`);
      loadTasks();
      refreshStats();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
    return true;
  });

  const cardClass = `p-5 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={dayFilter}
            onChange={e => setDayFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
              isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-300"
            }`}
          >
            <option value="all">All 15 Days</option>
            {Array.from({ length: 15 }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>Day {d}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
              isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-300"
            }`}
          >
            <option value="all">All Categories</option>
            <option value="theory">Theory & Concepts</option>
            <option value="coding">Coding & DSA</option>
            <option value="aptitude">Aptitude</option>
            <option value="mock">AI Mock Interview</option>
            <option value="revision">Revision</option>
            <option value="communication">Communication</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCarryForward}
            className="px-3.5 py-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-600/30 hover:bg-amber-600/30 text-xs font-bold"
          >
            ⏩ Auto Carry-Forward Incomplete Tasks
          </button>
        </div>
      </div>

      {/* Add New Task Form */}
      <form onSubmit={handleCreateTask} className={`p-4 rounded-xl border flex flex-wrap items-center gap-3 text-xs ${
        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <span className="font-bold text-indigo-400">+ Add Task:</span>
        <input
          type="text"
          placeholder="Task title..."
          value={newTaskTitle}
          onChange={e => setNewTaskTitle(e.target.value)}
          className={`flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border ${
            isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"
          }`}
        />
        <select
          value={newTaskSubject}
          onChange={e => setNewTaskSubject(e.target.value)}
          className={`px-2 py-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"}`}
        >
          <option value="Java">Java</option>
          <option value="DSA">DSA</option>
          <option value="SQL">SQL</option>
          <option value="OS">Operating Systems</option>
          <option value="Networks">Networks</option>
          <option value="Python">Python</option>
          <option value="ML">Machine Learning</option>
          <option value="Projects">Projects</option>
          <option value="Aptitude">Aptitude</option>
          <option value="Communication">Communication</option>
        </select>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="5"
            max="240"
            value={newTaskMins}
            onChange={e => setNewTaskMins(e.target.value)}
            className={`w-16 px-2 py-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"}`}
          />
          <span className="text-slate-400">mins</span>
        </div>
        <select
          value={newTaskDay}
          onChange={e => setNewTaskDay(e.target.value)}
          className={`px-2 py-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"}`}
        >
          {Array.from({ length: 15 }, (_, i) => i + 1).map(d => (
            <option key={d} value={d}>Day {d}</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
          Create
        </button>
      </form>

      {/* Tasks Table / Cards */}
      <div className="space-y-4">
        {filteredTasks.map(task => {
          const isTimerActive = activeTimerId === task.id;
          return (
            <div
              key={task.id}
              className={`p-5 rounded-2xl border transition ${
                task.completed
                  ? isDark ? "bg-emerald-950/10 border-emerald-900/30" : "bg-emerald-50/50 border-emerald-200"
                  : isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!task.completed}
                    onChange={() => handleUpdateTaskField(task.id, { completed: !task.completed })}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                  <div>
                    <h4 className={`text-sm font-bold ${task.completed ? "line-through text-slate-500" : ""}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <span className="font-semibold text-indigo-400">Day {task.day_number}</span>
                      <span>•</span>
                      <span>{task.subject}</span>
                      <span>•</span>
                      <span className="capitalize">{task.category}</span>
                    </div>
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold">
                      {formatTime(task.actual_seconds)} / {task.planned_minutes}m
                    </p>
                    <p className="text-[10px] text-slate-400">Actual vs Planned</p>
                  </div>
                  <button
                    onClick={() => onStartTimer(task, "stopwatch")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isTimerActive
                        ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white"
                    }`}
                  >
                    <span>⏱️</span>
                    <span>{isTimerActive ? "Timing..." : "Start Timer"}</span>
                  </button>
                  <button
                    onClick={() => onStartTimer(task, "countdown")}
                    title="Start in countdown mode"
                    className="px-2 py-1.5 rounded-xl border border-slate-700 text-xs font-medium hover:bg-slate-800"
                  >
                    ⏳ Countdown
                  </button>
                </div>
              </div>

              {/* Task Metadata Row: Ratings, Mistakes, Revision Flag */}
              <div className="pt-3 border-t border-inherit/40 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                {/* Difficulty Rating */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Difficulty (1-5)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => handleUpdateTaskField(task.id, { difficulty_rating: star })}
                        className={`text-sm ${task.difficulty_rating >= star ? "text-amber-400" : "text-slate-600"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confidence Rating */}
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Confidence (1-5)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => handleUpdateTaskField(task.id, { confidence_rating: star })}
                        className={`text-sm ${task.confidence_rating >= star ? "text-emerald-400" : "text-slate-600"}`}
                      >
                        ●
                      </button>
                    ))}
                  </div>
                </div>

                {/* Revision Required Status */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id={`rev-${task.id}`}
                    checked={!!task.revision_required}
                    onChange={() => handleUpdateTaskField(task.id, { revision_required: !task.revision_required })}
                    className="cursor-pointer"
                  />
                  <label htmlFor={`rev-${task.id}`} className="font-semibold text-amber-400 cursor-pointer">
                    Revision Required
                  </label>
                </div>

                {/* Mistakes Logged */}
                <div>
                  <input
                    type="text"
                    placeholder="Log mistakes / traps here..."
                    defaultValue={task.mistakes || ""}
                    onBlur={e => handleUpdateTaskField(task.id, { mistakes: e.target.value })}
                    className={`w-full px-2.5 py-1 rounded-lg border text-xs ${
                      isDark ? "bg-slate-800 border-slate-700 text-rose-300" : "bg-slate-100 border-slate-300 text-rose-700"
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 4: PROGRESS ANALYTICS VIEW
// -------------------------------------------------------------
function ProgressAnalyticsView({ stats, isDark }) {
  if (!stats) return <div className="text-center py-12 text-slate-400">Loading analytics...</div>;

  const cardClass = `p-6 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h3 className="text-xl font-bold">Preparation Time & Topic Analytics</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cardClass}>
          <p className="text-xs text-slate-400 font-semibold mb-1">TOTAL STUDY TIME</p>
          <p className="text-3xl font-extrabold text-indigo-400">{stats.study_hours.actual_hours} Hours</p>
          <p className="text-xs text-slate-400 mt-2">Planned: {stats.study_hours.planned_hours} Hours</p>
        </div>

        <div className={cardClass}>
          <p className="text-xs text-slate-400 font-semibold mb-1">TASKS COMPLETION</p>
          <p className="text-3xl font-extrabold text-emerald-400">{stats.tasks_summary.completion_pct}%</p>
          <p className="text-xs text-slate-400 mt-2">{stats.tasks_summary.completed} of {stats.tasks_summary.total} tasks completed</p>
        </div>

        <div className={cardClass}>
          <p className="text-xs text-slate-400 font-semibold mb-1">15-DAY CALENDAR PACE</p>
          <p className="text-3xl font-extrabold text-purple-400">{stats.completed_days} / {stats.total_days}</p>
          <p className="text-xs text-slate-400 mt-2">Days fully cleared</p>
        </div>
      </div>

      {/* Subject-Wise Time & Task Breakdown Table */}
      <div className={cardClass}>
        <h4 className="font-bold text-sm mb-4">Subject-Wise Mastery Breakdown</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className={`border-b ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"}`}>
              <tr>
                <th className="py-2.5 px-4 font-bold">Subject</th>
                <th className="py-2.5 px-4 font-bold">Total Tasks</th>
                <th className="py-2.5 px-4 font-bold">Completed</th>
                <th className="py-2.5 px-4 font-bold">Completion Rate</th>
                <th className="py-2.5 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {stats.subject_progress.map(s => (
                <tr key={s.subject}>
                  <td className="py-3 px-4 font-semibold">{s.subject}</td>
                  <td className="py-3 px-4">{s.total}</td>
                  <td className="py-3 px-4">{s.completed}</td>
                  <td className="py-3 px-4 font-bold text-indigo-400">{s.percentage}%</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.percentage >= 80 ? "bg-emerald-500/20 text-emerald-400" : s.percentage >= 40 ? "bg-amber-500/20 text-amber-400" : "bg-slate-700 text-slate-300"
                    }`}>
                      {s.percentage >= 80 ? "Mastered" : s.percentage >= 40 ? "In Progress" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 5: DSA PRACTICE TRACKER (LeetCode list & custom)
// -------------------------------------------------------------
function DSAView({ isDark, showToast, refreshStats }) {
  const [problems, setProblems] = useState([]);
  const [diffFilter, setDiffFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [newTitle, setNewTitle] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newTopic, setNewTopic] = useState("Arrays");
  const [newDiff, setNewDiff] = useState("Easy");
  const [newUrl, setNewUrl] = useState("");

  const loadDSA = async () => {
    try {
      const data = await apiCall("/api/dsa");
      setProblems(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDSA();
  }, []);

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await apiCall("/api/dsa", "POST", {
        problem_number: parseInt(newNumber) || 0,
        title: newTitle.trim(),
        platform: "LeetCode",
        difficulty: newDiff,
        topic: newTopic,
        url: newUrl.trim()
      });
      showToast("DSA Problem added");
      setNewTitle("");
      setNewNumber("");
      setNewUrl("");
      loadDSA();
      refreshStats();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleUpdateStatus = async (probId, status) => {
    try {
      await apiCall(`/api/dsa/${probId}`, "PUT", { status });
      showToast(`Updated to: ${status}`);
      loadDSA();
      refreshStats();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleUpdateField = async (probId, field, val) => {
    try {
      await apiCall(`/api/dsa/${probId}`, "PUT", { [field]: val });
      loadDSA();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = problems.filter(p => {
    if (diffFilter !== "all" && p.difficulty !== diffFilter) return false;
    if (topicFilter !== "all" && p.topic !== topicFilter) return false;
    return true;
  });

  const cardClass = `p-5 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={diffFilter}
            onChange={e => setDiffFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
              isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-300"
            }`}
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={topicFilter}
            onChange={e => setTopicFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold ${
              isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-300"
            }`}
          >
            <option value="all">All Topics</option>
            <option value="Arrays">Arrays</option>
            <option value="Strings">Strings</option>
            <option value="Hashing">Hashing</option>
            <option value="Two Pointers">Two Pointers</option>
            <option value="Binary Search">Binary Search</option>
            <option value="Linked Lists">Linked Lists</option>
            <option value="Stacks">Stacks</option>
            <option value="Queues">Queues</option>
            <option value="Monotonic Stack">Monotonic Stack</option>
          </select>
        </div>

        <div className="text-xs font-bold text-slate-400">
          Showing {filtered.length} of {problems.length} problems
        </div>
      </div>

      {/* Add Custom Problem */}
      <form onSubmit={handleCreateProblem} className={`p-4 rounded-xl border flex flex-wrap items-center gap-3 text-xs ${
        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <span className="font-bold text-indigo-400">+ Add Problem:</span>
        <input
          type="number"
          placeholder="LC #"
          value={newNumber}
          onChange={e => setNewNumber(e.target.value)}
          className={`w-20 px-2.5 py-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"}`}
        />
        <input
          type="text"
          placeholder="Problem title..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className={`flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"}`}
        />
        <select
          value={newDiff}
          onChange={e => setNewDiff(e.target.value)}
          className={`px-2 py-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"}`}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select
          value={newTopic}
          onChange={e => setNewTopic(e.target.value)}
          className={`px-2 py-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"}`}
        >
          <option value="Arrays">Arrays</option>
          <option value="Strings">Strings</option>
          <option value="Hashing">Hashing</option>
          <option value="Two Pointers">Two Pointers</option>
          <option value="Binary Search">Binary Search</option>
          <option value="Linked Lists">Linked Lists</option>
          <option value="Stacks">Stacks</option>
          <option value="Trees">Trees</option>
          <option value="Dynamic Programming">DP</option>
        </select>
        <input
          type="text"
          placeholder="LeetCode URL..."
          value={newUrl}
          onChange={e => setNewUrl(e.target.value)}
          className={`w-48 px-2 py-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"}`}
        />
        <button type="submit" className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
          Add
        </button>
      </form>

      {/* DSA Problem Cards */}
      <div className="space-y-3">
        {filtered.map(p => (
          <div
            key={p.id}
            className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 text-xs ${
              p.status.startsWith("Solved")
                ? isDark ? "bg-emerald-950/15 border-emerald-900/40" : "bg-emerald-50/60 border-emerald-200"
                : isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                p.difficulty === "Easy" ? "bg-emerald-500/20 text-emerald-400" : p.difficulty === "Medium" ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
              }`}>
                {p.difficulty}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400">#{p.problem_number}</span>
                  <a
                    href={p.url || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(p.title)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold hover:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>{p.title}</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>Topic: {p.topic}</span>
                  <span>•</span>
                  <span>Day {p.day_assigned}</span>
                </div>
              </div>
            </div>

            {/* Status Selector & Complexity Details */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Time: O(N)"
                  defaultValue={p.time_complexity || ""}
                  onBlur={e => handleUpdateField(p.id, "time_complexity", e.target.value)}
                  className={`w-24 px-2 py-1 rounded border text-[11px] ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-300"}`}
                />
                <input
                  type="text"
                  placeholder="Space: O(1)"
                  defaultValue={p.space_complexity || ""}
                  onBlur={e => handleUpdateField(p.id, "space_complexity", e.target.value)}
                  className={`w-24 px-2 py-1 rounded border text-[11px] ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-300"}`}
                />
              </div>

              <select
                value={p.status}
                onChange={e => handleUpdateStatus(p.id, e.target.value)}
                className={`px-3 py-1 rounded-lg border font-bold text-xs ${
                  p.status === "Solved Independently" ? "bg-emerald-600 text-white" :
                  p.status === "Solved with Hints" ? "bg-amber-600 text-white" :
                  p.status === "Solution Viewed" ? "bg-purple-600 text-white" :
                  p.status === "Attempted" ? "bg-blue-600 text-white" :
                  isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-700"
                }`}
              >
                <option value="Todo">Todo</option>
                <option value="Attempted">Attempted</option>
                <option value="Solved Independently">Solved Independently</option>
                <option value="Solved with Hints">Solved with Hints</option>
                <option value="Solution Viewed">Solution Viewed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 6: APTITUDE TRACKER (100 Questions & Interactive Quiz)
// -------------------------------------------------------------
function AptitudeView({ isDark, showToast, refreshStats }) {
  const [questions, setQuestions] = useState([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [result, setResult] = useState(null);
  const [questionTimer, setQuestionTimer] = useState(0);

  const loadQuestions = async () => {
    try {
      const data = await apiCall(selectedCat === "all" ? "/api/aptitude" : `/api/aptitude?category=${encodeURIComponent(selectedCat)}`);
      setQuestions(data);
      if (data.length > 0 && !activeQuestion) {
        setActiveQuestion(data[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [selectedCat]);

  // Question Timer
  useEffect(() => {
    setQuestionTimer(0);
    setResult(null);
    setSelectedOption(null);
    const interval = setInterval(() => {
      setQuestionTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuestion]);

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !activeQuestion) return;
    try {
      const res = await apiCall(`/api/aptitude/${activeQuestion.id}/submit`, "POST", {
        user_answer: selectedOption,
        time_taken_seconds: questionTimer
      });
      setResult(res);
      showToast(res.is_correct ? "Correct Answer! 🎯" : "Incorrect. Review the explanation below.", res.is_correct ? "success" : "error");
      loadQuestions();
      refreshStats();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const categories = [
    "all", "Percentages", "Ratio and proportion", "Profit and loss", "Time and work",
    "Speed, time and distance", "Probability", "Permutations and combinations",
    "Number systems", "Logical reasoning", "Verbal ability"
  ];

  const cardClass = `p-6 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl border text-xs font-semibold capitalize transition ${
              selectedCat === cat
                ? "bg-indigo-600 text-white border-indigo-600 shadow"
                : isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {cat === "all" ? "All 100 Questions" : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Question Quiz Panel (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {activeQuestion ? (
            <div className={cardClass}>
              <div className="flex items-center justify-between border-b border-inherit pb-3 mb-4 text-xs text-slate-400">
                <span className="font-bold text-indigo-400">Question #{activeQuestion.id} • {activeQuestion.category}</span>
                <span className="font-mono text-amber-400">⏱️ {formatTime(questionTimer)}</span>
              </div>

              <h3 className="text-base font-bold mb-6 leading-relaxed">
                {activeQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {activeQuestion.options?.map((opt, idx) => {
                  const isChosen = selectedOption === idx;
                  let optStyle = isDark ? "bg-slate-800/60 border-slate-700 hover:border-indigo-500" : "bg-slate-50 border-slate-200 hover:border-indigo-400";
                  if (result) {
                    if (idx === result.correct_option) optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                    else if (isChosen && !result.is_correct) optStyle = "bg-rose-500/20 border-rose-500 text-rose-400";
                  } else if (isChosen) {
                    optStyle = "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={!!result}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full p-3.5 rounded-xl border text-xs text-left transition flex items-center justify-between ${optStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-inherit border flex items-center justify-center font-bold text-[11px]">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {result && idx === result.correct_option && <span className="text-emerald-400 font-bold">✓ Correct</span>}
                    </button>
                  );
                })}
              </div>

              {/* Actions & Result */}
              {!result ? (
                <button
                  disabled={selectedOption === null}
                  onClick={handleSubmitAnswer}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
                >
                  Submit Answer & Check Explanation
                </button>
              ) : (
                <div className="space-y-4 pt-4 border-t border-inherit">
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                    result.is_correct ? "bg-emerald-950/20 border-emerald-900 text-emerald-300" : "bg-rose-950/20 border-rose-900 text-rose-300"
                  }`}>
                    <p className="font-bold mb-1">{result.is_correct ? "Great Job! Correct." : "Incorrect Solution."}</p>
                    <p className="text-slate-300 font-mono mt-2 whitespace-pre-line">{result.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">Select a question to begin.</div>
          )}
        </div>

        {/* Right: Question Palette (1 col) */}
        <div className={cardClass}>
          <h4 className="font-bold text-sm mb-3">Question Palette ({questions.length})</h4>
          <div className="grid grid-cols-5 gap-2 max-h-[500px] overflow-y-auto pr-1">
            {questions.map((q, i) => {
              const isCurrent = activeQuestion?.id === q.id;
              let qClass = isDark ? "bg-slate-800 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-300 text-slate-700";
              if (q.attempted) {
                qClass = q.is_correct ? "bg-emerald-600 text-white font-bold" : "bg-rose-600 text-white font-bold";
              }
              if (isCurrent) {
                qClass += " ring-2 ring-indigo-500";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestion(q)}
                  className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition ${qClass}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 7: CORE CS & SQL PRACTICE
// -------------------------------------------------------------
function CoreCSView({ isDark, showToast }) {
  const [questions, setQuestions] = useState([]);
  const [subjFilter, setSubjFilter] = useState("all");
  const [sqlQuery, setSqlQuery] = useState("SELECT dept_name, AVG(salary) as avg_sal FROM employees e JOIN departments d ON e.dept_id = d.dept_id GROUP BY dept_name HAVING avg_sal > 1300000;");
  const [sqlResult, setSqlResult] = useState(null);
  const [runningSql, setRunningSql] = useState(false);

  const loadQuestions = async () => {
    try {
      const data = await apiCall(subjFilter === "all" ? "/api/core-cs" : `/api/core-cs?subject=${encodeURIComponent(subjFilter)}`);
      setQuestions(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [subjFilter]);

  const handleRunSQL = async () => {
    setRunningSql(true);
    try {
      const res = await apiCall("/api/sql/run", "POST", { query: sqlQuery });
      setSqlResult(res);
      if (res.success) {
        showToast(`Query executed! Returned ${res.row_count} rows.`);
      } else {
        showToast(`SQL Error: ${res.error}`, "error");
      }
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setRunningSql(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiCall(`/api/core-cs/${id}`, "PUT", { user_status: status });
      showToast(`Topic updated: ${status}`);
      loadQuestions();
    } catch (e) {
      console.error(e);
    }
  };

  const cardClass = `p-6 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Interactive SQL Playground Section */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <span>🗄️</span>
              <span>Interactive SQL Query Playground (Sandboxed Engine)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Available tables: <code>employees(emp_id, name, dept_id, salary, hire_date)</code> and <code>departments(dept_id, dept_name, location)</code>
            </p>
          </div>
          <button
            onClick={handleRunSQL}
            disabled={runningSql}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
          >
            {runningSql ? "Executing..." : "▶ Run SQL Query"}
          </button>
        </div>

        <textarea
          rows="3"
          value={sqlQuery}
          onChange={e => setSqlQuery(e.target.value)}
          className={`w-full p-3 rounded-xl border font-mono text-xs mb-4 ${
            isDark ? "bg-slate-950 border-slate-800 text-indigo-300" : "bg-slate-100 border-slate-300 text-indigo-900"
          }`}
        />

        {/* SQL Output Table */}
        {sqlResult && (
          <div className="mt-3">
            {sqlResult.success ? (
              <div className="overflow-x-auto border rounded-xl border-inherit">
                <table className="w-full text-xs text-left">
                  <thead className={`border-b ${isDark ? "bg-slate-800/80 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                    <tr>
                      {sqlResult.columns.map((col, idx) => (
                        <th key={idx} className="py-2 px-3 font-mono font-bold">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {sqlResult.rows.map((row, rIdx) => (
                      <tr key={rIdx} className={isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2 px-3 font-mono">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                Error: {sqlResult.error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Core CS Conceptual Topics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base">Core CS Conceptual Questions (OS, Networks, DBMS, OOP)</h3>
          <select
            value={subjFilter}
            onChange={e => setSubjFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-300"
            }`}
          >
            <option value="all">All Subjects</option>
            <option value="DBMS">DBMS</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Computer Networks">Computer Networks</option>
            <option value="OOP">OOP & Architecture</option>
            <option value="SQL">SQL</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {questions.map(q => (
            <div key={q.id} className={cardClass}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-bold">
                  {q.subject} • {q.topic}
                </span>
                <select
                  value={q.user_status}
                  onChange={e => handleUpdateStatus(q.id, e.target.value)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300"
                >
                  <option value="Unseen">Unseen</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Mastered">Mastered</option>
                  <option value="Needs Revision">Needs Revision</option>
                </select>
              </div>

              <h4 className="font-bold text-sm mb-2">{q.question}</h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line mb-3">{q.answer_explanation}</p>

              {q.code_snippet && (
                <pre className={`p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto ${
                  isDark ? "bg-slate-950 text-emerald-400" : "bg-slate-100 text-emerald-800"
                }`}>
                  {q.code_snippet}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 8: AI/ML LEARNING DEEP DIVE
// -------------------------------------------------------------
function AIMLLearningView({ isDark, onNavigate }) {
  const cardClass = `p-6 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  const mlTopics = [
    {
      title: "Logistic Regression & Sigmoid Mechanics",
      summary: "Derivation of the log-loss cost function and why MSE produces non-convex surfaces with sigmoid.",
      math: "P(Y=1|X) = 1 / (1 + e^(-z))\nLoss = - [ y*log(y_hat) + (1-y)*log(1-y_hat) ]",
      interviewTrap: "Interviewers frequently ask why we don't use MSE in Logistic Regression. Answer: MSE with sigmoid yields non-convex cost functions with local minima."
    },
    {
      title: "Decision Trees & Random Forest Ensemble",
      summary: "Gini Impurity vs Entropy; Bagging and random feature subspaces to decorrelate trees and reduce variance.",
      math: "Gini = 1 - sum(p_i^2)\nEntropy = - sum(p_i * log2(p_i))",
      interviewTrap: "Why does Random Forest reduce variance without increasing bias? Bootstrap aggregation averages out decorrelated high-variance individual trees."
    },
    {
      title: "Artificial Neural Networks & Backpropagation",
      summary: "Multi-layer Perceptron (MLP), forward pass, chain rule gradient propagation, and vanishing gradient solutions.",
      math: "z^[l] = W^[l] * a^[l-1] + b^[l]\na^[l] = g(z^[l])\ndW = (dLoss/dz) * (a^[l-1])^T",
      interviewTrap: "What is the dying ReLU problem? When neurons receive large negative updates and permanently output zero, killing gradient flow."
    },
    {
      title: "Precision, Recall, F1 & ROC-AUC Calibration",
      summary: "Trade-offs in imbalanced classifications; tuning thresholds for high-stakes screening.",
      math: "Precision = TP / (TP + FP)\nRecall = TP / (TP + FN)\nF1 = 2 * (P * R) / (P + R)",
      interviewTrap: "When is Recall critical? Medical diagnosis and early student academic failure (missing an at-risk case is disastrous)."
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">AI & Machine Learning Core Curriculum</h3>
          <p className="text-xs text-slate-400">Deep mathematical derivations and MNC interview traps for AI/ML roles</p>
        </div>
        <button
          onClick={() => onNavigate("mock_interview")}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
        >
          🎙️ Test ML Knowledge in AI Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mlTopics.map((topic, idx) => (
          <div key={idx} className={cardClass}>
            <h4 className="font-bold text-base text-indigo-400 mb-2">{topic.title}</h4>
            <p className="text-xs text-slate-300 mb-3">{topic.summary}</p>

            <div className={`p-3 rounded-xl font-mono text-xs mb-3 ${
              isDark ? "bg-slate-950 text-cyan-300" : "bg-slate-100 text-cyan-900"
            }`}>
              {topic.math}
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <span className="font-bold">⚠️ MNC Interview Trap: </span>
              <span>{topic.interviewTrap}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 9: PROJECT PREPARATION CENTRE
// -------------------------------------------------------------
function ProjectsView({ isDark, onNavigate, showToast }) {
  const [projects, setProjects] = useState([]);
  const [activeProj, setActiveProj] = useState(0);

  const loadProjects = async () => {
    try {
      const data = await apiCall("/api/projects");
      setProjects(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  if (projects.length === 0) return <div className="text-center py-12 text-slate-400">Loading projects...</div>;

  const proj = projects[activeProj];
  const cardClass = `p-6 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Project Switcher Tabs */}
      <div className="flex gap-4 border-b border-inherit pb-2">
        {projects.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setActiveProj(idx)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeProj === idx
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : isDark ? "bg-slate-900 border border-slate-800 text-slate-400" : "bg-white border border-slate-200 text-slate-600"
            }`}
          >
            Project {idx + 1}: {p.title.split("using")[0]}
          </button>
        ))}
      </div>

      {/* Project Deep Dive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={cardClass}>
            <div className="border-b border-inherit pb-4 mb-4">
              <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">PROJECT DEEP-DIVE DEFENSE</span>
              <h2 className="text-xl font-extrabold mt-1">{proj.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{proj.subtitle}</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1">Problem Statement</h4>
                <p className="text-slate-200 leading-relaxed">{proj.problem_statement}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1">Dataset & Preprocessing Pipeline</h4>
                <p className="text-slate-200 leading-relaxed mb-2">{proj.dataset_details}</p>
                <div className={`p-3 rounded-xl font-mono text-[11px] ${
                  isDark ? "bg-slate-950 text-slate-300" : "bg-slate-100 text-slate-800"
                }`}>
                  {proj.preprocessing_steps}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1">Algorithms & Justification</h4>
                <p className="text-slate-200 leading-relaxed mb-2">{proj.algorithms_used}</p>
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                  <span className="font-bold">Why Chosen: </span>
                  <span>{proj.model_selection_reasoning}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1">Evaluation Metrics & Verified Numbers</h4>
                <p className="text-emerald-400 font-bold text-sm mb-1">{proj.results_and_numbers}</p>
                <p className="text-slate-300">{proj.evaluation_metrics}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  <h5 className="font-bold uppercase tracking-wider text-[10px] mb-1">Real Limitations</h5>
                  <p>{proj.limitations}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                  <h5 className="font-bold uppercase tracking-wider text-[10px] mb-1">Future Enhancements</h5>
                  <p>{proj.future_improvements}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Viva Q&A & AI Simulation (1 col) */}
        <div className="space-y-6">
          <div className={cardClass}>
            <h3 className="font-bold text-sm mb-3">Sample Interview Defense Q&A</h3>
            <div className="space-y-3">
              {proj.sample_interview_qa?.map((qa, i) => (
                <div key={i} className={`p-3 rounded-xl border text-xs ${
                  isDark ? "bg-slate-800/40 border-slate-700/50" : "bg-slate-50 border-slate-200"
                }`}>
                  <p className="font-bold text-indigo-300 mb-1">Q: {qa.q}</p>
                  <p className="text-slate-300 text-[11px] leading-relaxed">A: {qa.a}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-inherit">
              <button
                onClick={() => onNavigate("mock_interview")}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md"
              >
                🎙️ Simulate Project Cross-Examination in AI Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 10: LIVE AI VOICE MOCK INTERVIEW ROOM (Critical Feature)
// -------------------------------------------------------------
function MockInterviewView({ isDark, showToast, refreshStats }) {
  const [dayNumber, setDayNumber] = useState(1);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userSpeechDraft, setUserSpeechDraft] = useState("");
  const [interviewerVoice, setInterviewerVoice] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [evaluationReport, setEvaluationReport] = useState(null);
  const [micSupported, setMicSupported] = useState(true);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN"; // English (India) for accurate technical terminology

    recognition.onresult = (event) => {
      let current = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setUserSpeechDraft(current);
    };

    recognition.onerror = (e) => {
      console.warn("Speech recognition notice:", e.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Speak text aloud using SpeechSynthesis
  const speakText = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("en-US") || v.name.includes("Google") || v.name.includes("Natural"));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const handleStartInterview = async () => {
    setInterviewStarted(true);
    setEvaluationReport(null);
    setTranscript([]);
    setUserSpeechDraft("");
    setLoadingAi(true);

    try {
      const res = await apiCall("/api/interview/ask", "POST", {
        day_number: parseInt(dayNumber),
        transcript: []
      });

      const firstMsg = {
        role: "interviewer",
        content: res.question,
        timestamp: new Date().toLocaleTimeString(),
        provider: res.provider_used
      };
      setTranscript([firstMsg]);
      speakText(res.question);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      showToast("Speech recognition not supported in this browser. Please type your response.", "error");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmitUserResponse = async () => {
    if (!userSpeechDraft.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = {
      role: "user",
      content: userSpeechDraft.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedTranscript = [...transcript, userMsg];
    setTranscript(updatedTranscript);
    setUserSpeechDraft("");
    setLoadingAi(true);

    try {
      const res = await apiCall("/api/interview/ask", "POST", {
        day_number: parseInt(dayNumber),
        transcript: updatedTranscript
      });

      const aiMsg = {
        role: "interviewer",
        content: res.question,
        timestamp: new Date().toLocaleTimeString(),
        provider: res.provider_used
      };
      setTranscript([...updatedTranscript, aiMsg]);
      speakText(res.question);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleRepeatQuestion = () => {
    const lastInterviewerMsg = [...transcript].reverse().find(m => m.role === "interviewer");
    if (lastInterviewerMsg) {
      speakText(lastInterviewerMsg.content);
    }
  };

  const handleEndAndEvaluate = async () => {
    if (synthRef.current) synthRef.current.cancel();
    if (isListening && recognitionRef.current) recognitionRef.current.stop();

    setLoadingAi(true);
    try {
      const report = await apiCall("/api/interview/evaluate", "POST", {
        day_number: parseInt(dayNumber),
        transcript: transcript
      });
      setEvaluationReport(report);
      setInterviewStarted(false);
      showToast("Mock Interview Evaluation Generated & Saved!");
      refreshStats();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoadingAi(false);
    }
  };

  const cardClass = `p-6 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Session Picker */}
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500 animate-ping"></span>
              <h2 className="text-xl font-extrabold tracking-tight">Interactive AI Voice Interview Room</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time voice synthesis and speech-to-text. Evaluates conceptual depth, Big O asymptotics, and challenges vague explanations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 font-semibold">Select Day Session:</label>
            <select
              disabled={interviewStarted}
              value={dayNumber}
              onChange={e => setDayNumber(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold ${
                isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"
              }`}
            >
              {Array.from({ length: 15 }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>Day {d} Interview</option>
              ))}
            </select>

            {!interviewStarted ? (
              <button
                onClick={handleStartInterview}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs shadow-lg shadow-pink-500/25 flex items-center gap-2"
              >
                <span>🎙️</span>
                <span>Begin Interview Session</span>
              </button>
            ) : (
              <button
                onClick={handleEndAndEvaluate}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
              >
                <span>⏹️</span>
                <span>End & Generate Evaluation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Interview Stage */}
      {interviewStarted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transcript / Dialogue Feed (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`${cardClass} max-h-[480px] overflow-y-auto space-y-4`}>
              {transcript.map((msg, idx) => {
                const isAi = msg.role === "interviewer";
                return (
                  <div key={idx} className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}>
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                      <span className="font-bold text-indigo-400">{isAi ? "Senior MNC Interviewer" : "You (Candidate)"}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className={`p-4 rounded-2xl text-xs max-w-xl leading-relaxed ${
                      isAi
                        ? isDark ? "bg-slate-800/90 border border-slate-700 text-white" : "bg-slate-100 border border-slate-200 text-slate-900"
                        : "bg-indigo-600 text-white"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {loadingAi && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs animate-pulse">
                  <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Interviewer is analyzing your response and calibrating next question...</span>
                </div>
              )}
            </div>

            {/* Candidate Voice Input & Transcript Editor */}
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Response</span>
                <span className="text-[11px] text-slate-400">Edit transcript if technical terms were misheard</span>
              </div>

              <textarea
                rows="3"
                placeholder={isListening ? "Listening to your voice... Speak your technical explanation clearly..." : "Type or speak your answer here..."}
                value={userSpeechDraft}
                onChange={e => setUserSpeechDraft(e.target.value)}
                className={`w-full p-3.5 rounded-xl border text-xs mb-3 ${
                  isDark ? "bg-slate-800/80 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleListening}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                      isListening
                        ? "bg-rose-600 text-white mic-recording shadow-lg shadow-rose-600/30"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    }`}
                  >
                    <span>{isListening ? "🔴" : "🎤"}</span>
                    <span>{isListening ? "Stop Microphone" : "Speak into Mic"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRepeatQuestion}
                    className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs text-slate-300"
                  >
                    🔁 Repeat Question
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!userSpeechDraft.trim() || loadingAi}
                  onClick={handleSubmitUserResponse}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/25"
                >
                  Submit Response & Next Question →
                </button>
              </div>
            </div>
          </div>

          {/* Interviewer Status & Audio Visualizer (1 col) */}
          <div className="space-y-6">
            <div className={cardClass}>
              <div className="text-center py-4">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl mb-3 shadow-xl ${
                  isAiSpeaking
                    ? "bg-gradient-to-tr from-pink-500 to-rose-500 text-white animate-bounce shadow-pink-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}>
                  🎙️
                </div>
                <h4 className="font-bold text-sm">MNC Technical Interviewer</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAiSpeaking ? "Speaking question aloud..." : isListening ? "Listening to you..." : "Awaiting your response"}
                </p>

                {/* Animated Audio Wave */}
                <div className="flex items-center justify-center gap-1.5 h-10 mt-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div
                      key={i}
                      className={`w-1 rounded-full bg-pink-500 transition-all ${
                        isAiSpeaking || isListening ? "audio-bar h-8" : "h-1 opacity-25"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-inherit/40 space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Questions Asked:</span>
                  <span className="font-bold text-white">{transcript.filter(m => m.role === "interviewer").length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Answers Given:</span>
                  <span className="font-bold text-white">{transcript.filter(m => m.role === "user").length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Salary Standard:</span>
                  <span className="font-bold text-emerald-400">12+ LPA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post-Interview Evaluation Report */}
      {evaluationReport && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border border-purple-500/30 text-white shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
                  OFFICIAL INTERVIEW PERFORMANCE EVALUATION
                </span>
                <h2 className="text-2xl font-extrabold mt-2">Day {dayNumber} Assessment Report</h2>
                <p className="text-xs text-indigo-200 mt-1">Calibrated by AI Interview Engine against MNC Technical Bar</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-4xl font-black text-emerald-400">{evaluationReport.overall_score}/100</div>
                  <div className="text-[11px] text-slate-300 uppercase tracking-widest font-semibold">Overall Score</div>
                </div>
              </div>
            </div>

            {/* Radar / Category Scores */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xl font-extrabold text-indigo-300">{evaluationReport.technical_accuracy_score}/20</p>
                <p className="text-[10px] uppercase font-semibold text-slate-300 mt-0.5">Tech Accuracy</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xl font-extrabold text-cyan-300">{evaluationReport.conceptual_understanding_score}/20</p>
                <p className="text-[10px] uppercase font-semibold text-slate-300 mt-0.5">Concepts</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xl font-extrabold text-emerald-300">{evaluationReport.problem_solving_score}/20</p>
                <p className="text-[10px] uppercase font-semibold text-slate-300 mt-0.5">Problem Solving</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-xl font-extrabold text-amber-300">{evaluationReport.communication_clarity_score}/20</p>
                <p className="text-[10px] uppercase font-semibold text-slate-300 mt-0.5">Communication</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center col-span-2 md:col-span-1">
                <p className="text-xl font-extrabold text-pink-300">{evaluationReport.answer_completeness_score}/20</p>
                <p className="text-[10px] uppercase font-semibold text-slate-300 mt-0.5">Completeness</p>
              </div>
            </div>

            {/* Detailed Strengths and Inaccuracies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <h4 className="font-bold text-emerald-400 uppercase tracking-wider mb-2">Points Answered Correctly</h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-200">
                  {evaluationReport.correct_points?.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
                <h4 className="font-bold text-rose-400 uppercase tracking-wider mb-2">Inaccuracies / Missing Details</h4>
                <ul className="space-y-1.5 list-disc list-inside text-slate-200">
                  {evaluationReport.incorrect_points?.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Improved Sample Answers */}
            {evaluationReport.improved_answers && evaluationReport.improved_answers.length > 0 && (
              <div className="mb-6 p-5 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <h4 className="font-bold text-indigo-300 uppercase tracking-wider mb-2">Recommended MNC Model Answer</h4>
                {evaluationReport.improved_answers.map((ans, i) => (
                  <div key={i} className="space-y-1">
                    <p className="font-bold text-white">Q: {ans.question}</p>
                    <p className="text-slate-300 font-mono text-[11px] leading-relaxed">{ans.better_answer}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Next Steps */}
            <div className="p-4 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-xs text-indigo-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-white uppercase text-[10px] block">Actionable Next Steps:</span>
                <span>{evaluationReport.next_steps}</span>
              </div>
              <button
                onClick={() => setEvaluationReport(null)}
                className="px-3 py-1.5 rounded-lg bg-white text-indigo-950 font-bold text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 11: RESUME CHECKLIST VIEW
// -------------------------------------------------------------
function ResumeView({ isDark, showToast, refreshStats }) {
  const [checklist, setChecklist] = useState([]);

  const loadChecklist = async () => {
    try {
      const data = await apiCall("/api/resume/checklist");
      setChecklist(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadChecklist();
  }, []);

  const handleToggleCheck = async (item) => {
    try {
      await apiCall(`/api/resume/checklist/${item.id}`, "PUT", {
        checked: !item.checked,
        notes: item.notes
      });
      showToast(`Updated resume check: ${item.item}`);
      loadChecklist();
      refreshStats();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const checkedCount = checklist.filter(c => c.checked).length;
  const pct = Math.round((checkedCount / Math.max(1, checklist.length)) * 100);

  const cardClass = `p-6 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">25-Point Placement Resume Quality Audit</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict ATS parsing checks and Google X-Y-Z bullet criteria for 12+ LPA MNC applications.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-indigo-400">{checkedCount} / {checklist.length}</span>
            <span className="text-xs text-slate-400">Verified ({pct}%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checklist.map(item => (
          <div
            key={item.id}
            onClick={() => handleToggleCheck(item)}
            className={`p-4 rounded-xl border cursor-pointer text-xs transition flex items-start gap-3 ${
              item.checked
                ? isDark ? "bg-emerald-950/20 border-emerald-900/40 text-slate-200" : "bg-emerald-50 border-emerald-200 text-slate-800"
                : isDark ? "bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-400" : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
            }`}
          >
            <input
              type="checkbox"
              checked={!!item.checked}
              onChange={() => {}}
              className="mt-1 w-4 h-4 text-emerald-500 rounded cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-bold text-sm text-slate-100">{item.item}</span>
                <span className="text-[10px] font-semibold text-indigo-400 uppercase">{item.category}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 12: MUMBAI JOB TRACKER (2028 batch verified)
// -------------------------------------------------------------
function JobsView({ isDark, showToast }) {
  const [jobs, setJobs] = useState([]);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newSalary, setNewSalary] = useState("12 - 16 LPA");
  const [newLocation, setNewLocation] = useState("Mumbai");

  const loadJobs = async () => {
    try {
      const data = await apiCall("/api/jobs");
      setJobs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!newCompany.trim()) return;
    try {
      await apiCall("/api/jobs", "POST", {
        company_name: newCompany.trim(),
        role: newRole.trim() || "Software Development Engineer",
        salary_range: newSalary,
        location: newLocation
      });
      showToast("Job application entry created");
      setNewCompany("");
      setNewRole("");
      loadJobs();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleUpdateStatus = async (jobId, status) => {
    try {
      await apiCall(`/api/jobs/${jobId}`, "PUT", { status });
      showToast(`Status updated to: ${status}`);
      loadJobs();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const cardClass = `p-6 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Mumbai & MMR Verified Placement Tracker</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Genuine corporate recruitment channels hiring 2028 batch CSE grads / interns in Mumbai, Navi Mumbai, and Powai.
            </p>
          </div>
        </div>
      </div>

      {/* Add Job Form */}
      <form onSubmit={handleCreateJob} className={`p-4 rounded-xl border flex flex-wrap items-center gap-3 text-xs ${
        isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <span className="font-bold text-indigo-400">+ Add Application:</span>
        <input
          type="text"
          placeholder="Company Name (e.g. Morgan Stanley)"
          value={newCompany}
          onChange={e => setNewCompany(e.target.value)}
          className={`flex-1 min-w-[150px] px-3 py-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"}`}
        />
        <input
          type="text"
          placeholder="Role (e.g. SDE Analyst)"
          value={newRole}
          onChange={e => setNewRole(e.target.value)}
          className={`flex-1 min-w-[150px] px-3 py-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"}`}
        />
        <input
          type="text"
          placeholder="Salary (e.g. 14 LPA)"
          value={newSalary}
          onChange={e => setNewSalary(e.target.value)}
          className={`w-32 px-3 py-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"}`}
        />
        <input
          type="text"
          placeholder="Location"
          value={newLocation}
          onChange={e => setNewLocation(e.target.value)}
          className={`w-32 px-3 py-1.5 rounded-lg border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300"}`}
        />
        <button type="submit" className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
          Add
        </button>
      </form>

      {/* Job Cards */}
      <div className="space-y-3">
        {jobs.map(j => (
          <div
            key={j.id}
            className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 text-xs ${
              isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">{j.company_name}</span>
                <span className="text-emerald-400 font-bold">{j.salary_range}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold">
                  Batch: {j.batch_eligible}
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-0.5">{j.role} • 📍 {j.location}</p>
              <p className="text-[11px] text-slate-400 mt-1">{j.eligibility_criteria}</p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={j.job_url || "#"}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-lg border border-slate-700 hover:bg-slate-800 text-[11px] text-slate-300"
              >
                Careers Portal ↗
              </a>
              <select
                value={j.status}
                onChange={e => handleUpdateStatus(j.id, e.target.value)}
                className={`px-3 py-1 rounded-lg font-bold text-xs ${
                  j.status === "Offer" ? "bg-emerald-600 text-white" :
                  j.status === "Rejected" ? "bg-rose-700 text-white" :
                  j.status.includes("Interview") ? "bg-purple-600 text-white" :
                  j.status === "Applied" ? "bg-blue-600 text-white" :
                  isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-700"
                }`}
              >
                <option value="Wishlist">Wishlist</option>
                <option value="Applied">Applied</option>
                <option value="Online Assessment">Online Assessment</option>
                <option value="Technical Interview 1">Technical Round 1</option>
                <option value="Technical Interview 2">Technical Round 2</option>
                <option value="HR Round">HR Round</option>
                <option value="Offer">Offer Received 🎉</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 13: COMMUNICATION & HR PRACTICE
// -------------------------------------------------------------
function CommunicationView({ isDark, showToast }) {
  const [items, setItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [transcriptText, setTranscriptText] = useState("");
  const [evalResult, setEvalResult] = useState(null);

  const loadItems = async () => {
    try {
      const data = await apiCall("/api/communication");
      setItems(data);
      if (data.length > 0 && !activeItem) {
        setActiveItem(data[0]);
        setTranscriptText(data[0].user_answer_transcript || "");
        setEvalResult(data[0].feedback_details);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async () => {
    if (!transcriptText.trim() || !activeItem) return;
    try {
      const res = await apiCall(`/api/communication/${activeItem.id}/submit`, "POST", {
        user_answer_transcript: transcriptText.trim()
      });
      setEvalResult(res.feedback);
      showToast(`Evaluation score: ${res.score}/100`);
      loadItems();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const cardClass = `p-6 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className={cardClass}>
        <h3 className="text-xl font-bold">HR Behavioral & Communication Clarity Practice</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Master the STAR method (Situation, Task, Action, Result) for behavioral questions and non-technical rounds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Questions List (1 col) */}
        <div className="space-y-2">
          {items.map(it => (
            <button
              key={it.id}
              onClick={() => {
                setActiveItem(it);
                setTranscriptText(it.user_answer_transcript || "");
                setEvalResult(it.feedback_details);
              }}
              className={`w-full p-4 rounded-xl border text-left text-xs transition ${
                activeItem?.id === it.id
                  ? "bg-indigo-600 text-white shadow"
                  : isDark ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="font-bold block mb-1">{it.category}</span>
              <span className="truncate block opacity-80">{it.question}</span>
            </button>
          ))}
        </div>

        {/* Right: Answer Editor & Feedback (2 cols) */}
        {activeItem && (
          <div className="lg:col-span-2 space-y-6">
            <div className={cardClass}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">{activeItem.category}</span>
              <h3 className="text-base font-bold my-2">{activeItem.question}</h3>
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 mb-4">
                <span className="font-bold">Recommended Framework: </span>
                <span>{activeItem.model_framework}</span>
              </div>

              <textarea
                rows="5"
                placeholder="Type or paste your spoken answer here to evaluate clarity, conciseness, and impact..."
                value={transcriptText}
                onChange={e => setTranscriptText(e.target.value)}
                className={`w-full p-3.5 rounded-xl border text-xs mb-3 ${
                  isDark ? "bg-slate-800/80 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              />

              <button
                onClick={handleSubmit}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                Submit Answer for AI Clarity Audit
              </button>
            </div>

            {/* Feedback Box */}
            {evalResult && evalResult.clarity_score && (
              <div className="p-6 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-inherit pb-2">
                  <span className="font-bold text-indigo-300">Clarity & Impact Audit</span>
                  <span className="font-bold text-emerald-400">Score: {evalResult.clarity_score} / 20</span>
                </div>
                <p className="text-slate-300"><span className="font-bold">Structure:</span> {evalResult.structure_rating}</p>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                  <span className="font-bold text-indigo-400">Model Tip: </span>
                  <span className="text-slate-200">{evalResult.model_tips}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 14: FINAL REPORT (Day 15 Full Placement Assessment)
// -------------------------------------------------------------
function FinalReportView({ isDark }) {
  const [report, setReport] = useState(null);

  const loadReport = async () => {
    try {
      const data = await apiCall("/api/final-report");
      setReport(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  if (!report) return <div className="text-center py-12 text-slate-400">Generating placement assessment...</div>;

  const cardClass = `p-6 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Executive Verdict Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 border border-purple-500/30 text-white shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              DAY 15 FINAL READINESS ASSESSMENT
            </span>
            <h2 className="text-3xl font-extrabold mt-2">{report.verdict}</h2>
            <p className="text-xs text-indigo-200 mt-1">Calibrated for 12+ LPA MNC Roles in Mumbai / MMR</p>
          </div>

          <div className="text-right">
            <span className="text-5xl font-black text-emerald-400">{report.readiness_score}%</span>
            <p className="text-[11px] text-slate-300 uppercase tracking-widest font-semibold mt-1">Mastery Index</p>
          </div>
        </div>

        {/* Aggregate Numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-xl font-extrabold text-indigo-300">{report.metrics.tasks_completed}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-300 mt-0.5">Tasks Cleared</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-xl font-extrabold text-cyan-300">{report.metrics.dsa_solved}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-300 mt-0.5">DSA Solved</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-xl font-extrabold text-amber-300">{report.metrics.aptitude_accuracy}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-300 mt-0.5">Aptitude Accuracy</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-xl font-extrabold text-pink-300">{report.metrics.mock_interview_avg}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-300 mt-0.5">Mock Interview Avg</p>
          </div>
        </div>
      </div>

      {/* Subject Radar Mastery */}
      <div className={cardClass}>
        <h3 className="font-bold text-base mb-4">Subject-Wise Mastery Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(report.subject_mastery).map(([subj, score]) => (
            <div key={subj} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span>{subj}</span>
                <span className={score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-rose-400"}>
                  {score}%
                </span>
              </div>
              <div className="w-full bg-slate-700/20 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500"}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended 30-Day Preparation Plan */}
      <div className={cardClass}>
        <h3 className="font-bold text-base text-indigo-400 mb-3">Recommended Next 30-Day Preparation Plan</h3>
        <div className="space-y-2.5 text-xs">
          {report.recommended_30_day_plan.map((step, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2 text-indigo-200">
              <span className="font-bold">✓</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// MODULE 15: SETTINGS & BACKUP VIEW
// -------------------------------------------------------------
function SettingsView({ isDark, showToast, refreshStats }) {
  const [provider, setProvider] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-1.5-flash");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const loadSettings = async () => {
    try {
      const data = await apiCall("/api/settings");
      if (data.ai_provider) setProvider(data.ai_provider);
      if (data.ai_model) setModel(data.ai_model);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveAIConfig = async () => {
    try {
      const payload = {
        ai_provider: provider,
        ai_model: model
      };
      if (apiKey.trim()) {
        payload.api_key = apiKey.trim();
        if (provider === "gemini") payload.gemini_api_key = apiKey.trim();
        if (provider === "openai") payload.openai_api_key = apiKey.trim();
        if (provider === "groq") payload.groq_api_key = apiKey.trim();
      }
      await apiCall("/api/settings", "POST", payload);
      showToast("AI Configuration saved to database!");
      loadSettings();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiCall("/api/settings/test-ai", "POST", {
        provider,
        api_key: apiKey.trim(),
        model
      });
      setTestResult(res);
      showToast(res.success ? "AI Connection Verified!" : res.message, res.success ? "success" : "error");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setTesting(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const data = await apiCall("/api/backup/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `placement_command_centre_backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      showToast("Full application backup exported as JSON!");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        await apiCall("/api/backup/import", "POST", json);
        showToast("Database restored from backup!");
        refreshStats();
      } catch (err) {
        showToast(`Import failed: ${err.message}`, "error");
      }
    };
    reader.readAsText(file);
  };

  const cardClass = `p-6 rounded-2xl border transition ${
    isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
  }`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* AI LLM Configuration */}
      <div className={cardClass}>
        <div className="border-b border-inherit pb-3 mb-4">
          <h3 className="font-bold text-base">AI Model & API Key Configuration</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Connect an LLM API (Google Gemini, OpenAI, Groq) for dynamic interview questioning and evaluation.
          </p>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">AI Provider</label>
            <select
              value={provider}
              onChange={e => {
                setProvider(e.target.value);
                if (e.target.value === "gemini") setModel("gemini-1.5-flash");
                if (e.target.value === "openai") setModel("gpt-4o-mini");
                if (e.target.value === "groq") setModel("llama-3.3-70b-versatile");
              }}
              className={`w-full p-2.5 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300"}`}
            >
              <option value="gemini">Google Gemini API (Recommended - Ultra-fast)</option>
              <option value="openai">OpenAI API (GPT-4o / GPT-4o-mini)</option>
              <option value="groq">Groq Cloud (Llama-3.3-70b - Low latency)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1">Model Name</label>
            <input
              type="text"
              value={model}
              onChange={e => setModel(e.target.value)}
              className={`w-full p-2.5 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300"}`}
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">API Key</label>
            <input
              type="password"
              placeholder="Enter your API key (Stored in backend SQLite/env, never exposed to client)..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className={`w-full p-2.5 rounded-xl border ${isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-300"}`}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSaveAIConfig}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
            >
              Save Configuration
            </button>
            <button
              disabled={testing || !apiKey}
              onClick={handleTestConnection}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold disabled:opacity-40"
            >
              {testing ? "Testing..." : "Test AI Connection"}
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl border ${testResult.success ? "bg-emerald-500/10 border-emerald-500 text-emerald-300" : "bg-rose-500/10 border-rose-500 text-rose-300"}`}>
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      {/* Backup & Restore */}
      <div className={cardClass}>
        <div className="border-b border-inherit pb-3 mb-4">
          <h3 className="font-bold text-base">Persistent Data Backup & Restore</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Export all tasks, timers, interviews, DSA solves, and notes to a JSON file.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <button
            onClick={handleExportBackup}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold flex items-center gap-2"
          >
            <span>💾</span>
            <span>Export Full Backup (JSON)</span>
          </button>

          <label className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold cursor-pointer flex items-center gap-2">
            <span>📂</span>
            <span>Import & Restore Backup</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}

// Render React App into DOM
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
