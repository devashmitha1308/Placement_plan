import sqlite3
import json
import os
from pathlib import Path
from backend.config import DATABASE_PATH

def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # Settings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
    """)

    # Days table (1 to 15)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS days (
        day_number INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        date_scheduled TEXT NOT NULL,
        summary TEXT,
        learning_objectives TEXT, -- JSON
        topics TEXT,              -- JSON
        subtopics TEXT,           -- JSON
        study_material TEXT,
        practical_exercises TEXT, -- JSON
        revision_tasks TEXT,       -- JSON
        completed BOOLEAN DEFAULT 0
    );
    """)

    # Tasks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        category TEXT NOT NULL, -- theory, coding, aptitude, mock, revision, communication
        planned_minutes INTEGER DEFAULT 45,
        actual_seconds INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        difficulty_rating INTEGER, -- 1-5
        confidence_rating INTEGER, -- 1-5
        mistakes TEXT DEFAULT '',
        revision_required BOOLEAN DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (day_number) REFERENCES days(day_number) ON DELETE CASCADE
    );
    """)

    # DSA Problems
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS dsa_problems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        problem_number INTEGER,
        title TEXT NOT NULL,
        platform TEXT DEFAULT 'LeetCode',
        difficulty TEXT NOT NULL, -- Easy, Medium, Hard
        topic TEXT NOT NULL,
        status TEXT DEFAULT 'Todo', -- Todo, Attempted, Solved Independently, Solved with Hints, Solution Viewed
        day_assigned INTEGER DEFAULT 1,
        time_taken_minutes INTEGER DEFAULT 0,
        time_complexity TEXT DEFAULT '',
        space_complexity TEXT DEFAULT '',
        mistakes TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        revision_date TEXT DEFAULT '',
        url TEXT DEFAULT ''
    );
    """)

    # Aptitude Questions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS aptitude_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_assigned INTEGER NOT NULL,
        category TEXT NOT NULL,
        question TEXT NOT NULL,
        options TEXT NOT NULL, -- JSON array
        correct_option INTEGER NOT NULL, -- 0-3
        explanation TEXT NOT NULL,
        difficulty TEXT DEFAULT 'Medium',
        attempted BOOLEAN DEFAULT 0,
        user_answer INTEGER,
        is_correct BOOLEAN,
        time_taken_seconds INTEGER DEFAULT 0
    );
    """)

    # Core CS & SQL
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS core_cs_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL, -- DBMS, OS, Computer Networks, OOP, Java, SQL
        topic TEXT NOT NULL,
        question TEXT NOT NULL,
        answer_explanation TEXT NOT NULL,
        code_snippet TEXT DEFAULT '',
        difficulty TEXT DEFAULT 'Medium',
        user_status TEXT DEFAULT 'Unseen', -- Unseen, Reviewing, Mastered, Needs Revision
        user_notes TEXT DEFAULT ''
    );
    """)

    # Projects
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL,
        problem_statement TEXT NOT NULL,
        motivation TEXT NOT NULL,
        dataset_details TEXT NOT NULL,
        preprocessing_steps TEXT NOT NULL,
        algorithms_used TEXT NOT NULL,
        model_selection_reasoning TEXT NOT NULL,
        evaluation_metrics TEXT NOT NULL,
        results_and_numbers TEXT NOT NULL,
        limitations TEXT NOT NULL,
        future_improvements TEXT NOT NULL,
        real_world_applications TEXT NOT NULL,
        system_architecture TEXT NOT NULL,
        sample_interview_qa TEXT NOT NULL -- JSON
    );
    """)

    # Mock Interviews
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mock_interviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        focus_areas TEXT NOT NULL, -- JSON
        transcript TEXT NOT NULL,  -- JSON
        total_questions INTEGER DEFAULT 0,
        overall_score INTEGER DEFAULT 0,
        technical_accuracy_score INTEGER DEFAULT 0,
        conceptual_understanding_score INTEGER DEFAULT 0,
        problem_solving_score INTEGER DEFAULT 0,
        communication_clarity_score INTEGER DEFAULT 0,
        answer_completeness_score INTEGER DEFAULT 0,
        correct_points TEXT DEFAULT '[]', -- JSON
        incorrect_points TEXT DEFAULT '[]', -- JSON
        topics_needing_revision TEXT DEFAULT '[]', -- JSON
        improved_answers TEXT DEFAULT '[]', -- JSON
        next_steps TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Interview Memory
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS interview_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_session_id INTEGER,
        topic TEXT NOT NULL,
        mistake_identified TEXT NOT NULL,
        correction_suggested TEXT NOT NULL,
        resolved BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Resume Checklist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resume_checklist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        item TEXT NOT NULL,
        description TEXT NOT NULL,
        checked BOOLEAN DEFAULT 0,
        notes TEXT DEFAULT ''
    );
    """)

    # Resume Versions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS resume_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version_name TEXT NOT NULL,
        target_role TEXT NOT NULL,
        file_name TEXT DEFAULT '',
        ats_score_estimate INTEGER DEFAULT 80,
        key_highlights TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Job Applications
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS job_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        role TEXT NOT NULL,
        location TEXT NOT NULL,
        salary_range TEXT NOT NULL,
        eligibility_criteria TEXT NOT NULL,
        batch_eligible TEXT DEFAULT '2028',
        job_url TEXT DEFAULT '',
        status TEXT DEFAULT 'Wishlist',
        deadline TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        applied_date TEXT DEFAULT ''
    );
    """)

    # Communication & HR
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS communication_practice (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        question TEXT NOT NULL,
        model_framework TEXT NOT NULL,
        user_answer_transcript TEXT DEFAULT '',
        feedback_score INTEGER DEFAULT 0,
        feedback_details TEXT DEFAULT '{}',
        audio_recorded BOOLEAN DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()

def dict_from_row(row):
    if row is None:
        return None
    return dict(row)

def rows_to_dict_list(rows):
    return [dict(r) for r in rows]
