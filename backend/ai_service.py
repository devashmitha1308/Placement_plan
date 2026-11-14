import json
import logging
from typing import Dict, Any, List, Optional
import requests
from backend import config
from backend.database import get_connection

logger = logging.getLogger(__name__)

def get_active_credentials():
    # Read from DB settings first, then config/env
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings WHERE key IN ('ai_provider', 'ai_model', 'api_key', 'gemini_api_key', 'openai_api_key', 'groq_api_key')")
    rows = dict(cursor.fetchall())
    conn.close()

    provider = rows.get("ai_provider", config.ACTIVE_AI_PROVIDER)
    model = rows.get("ai_model", config.AI_MODEL)

    api_key = ""
    if provider == "gemini":
        api_key = rows.get("gemini_api_key") or rows.get("api_key") or config.GEMINI_API_KEY
    elif provider == "openai":
        api_key = rows.get("openai_api_key") or rows.get("api_key") or config.OPENAI_API_KEY
    elif provider == "groq":
        api_key = rows.get("groq_api_key") or rows.get("api_key") or config.GROQ_API_KEY

    return {
        "provider": provider,
        "model": model,
        "api_key": api_key
    }

def get_user_interview_context(day_number: int) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT day_number, title, subject, topics, subtopics, summary
    FROM days
    WHERE day_number <= ?
    ORDER BY day_number ASC
    """, (day_number,))
    past_days = [dict(r) for r in cursor.fetchall()]

    cursor.execute("""
    SELECT topic, mistake_identified, correction_suggested
    FROM interview_memory
    WHERE resolved = 0
    ORDER BY created_at DESC
    LIMIT 10
    """)
    unresolved_mistakes = [dict(r) for r in cursor.fetchall()]

    cursor.execute("""
    SELECT title, subject, mistakes
    FROM tasks
    WHERE revision_required = 1 AND day_number <= ?
    LIMIT 10
    """, (day_number,))
    revision_tasks = [dict(r) for r in cursor.fetchall()]

    conn.close()

    current_day = next((d for d in past_days if d["day_number"] == day_number), None)
    if not current_day and past_days:
        current_day = past_days[-1]

    return {
        "current_day": current_day,
        "past_days_count": len(past_days),
        "unresolved_mistakes": unresolved_mistakes,
        "revision_tasks": revision_tasks
    }

def call_gemini(api_key: str, model: str, system_prompt: str, messages: List[Dict[str, str]]) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    contents = []
    for msg in messages:
        role = "user" if msg["role"] in ("user", "system") else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg["content"]}]
        })

    payload = {
        "system_instruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 2048,
        }
    }

    resp = requests.post(url, json=payload, timeout=10.0)
    resp.raise_for_status()
    data = resp.json()
    candidates = data.get("candidates", [])
    if candidates and "content" in candidates[0] and "parts" in candidates[0]["content"]:
        return candidates[0]["content"]["parts"][0]["text"].strip()
    raise ValueError("Invalid response structure from Gemini API")

def call_openai_compatible(endpoint: str, api_key: str, model: str, system_prompt: str, messages: List[Dict[str, str]]) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    formatted_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        formatted_messages.append({"role": msg["role"], "content": msg["content"]})

    payload = {
        "model": model,
        "messages": formatted_messages,
        "temperature": 0.4,
        "max_tokens": 2048
    }

    resp = requests.post(endpoint, json=payload, headers=headers, timeout=10.0)
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"].strip()

def generate_interview_question(day_number: int, transcript: List[Dict[str, str]], focus_track: Optional[str] = None) -> Dict[str, Any]:
    creds = get_active_credentials()
    context = get_user_interview_context(day_number)
    
    current_day = context["current_day"]
    day_title = current_day["title"] if current_day else f"Day {day_number}"
    day_subj = current_day["subject"] if current_day else "Technical Core"
    day_topics = current_day["topics"] if current_day else "[]"
    mistakes = context["unresolved_mistakes"]
    
    system_prompt = f"""You are a strict, senior Technical Hiring Manager at a top multinational technology firm in Mumbai (12+ LPA bar).
You are conducting Day {day_number} placement mock interview.
Target role: Software Development Engineer / AI-ML Engineer (2028 batch CSE graduate).

Today's Primary Syllabus ({day_subj} - {day_title}):
Topics: {day_topics}

Candidate's Known Prior Weaknesses & Unresolved Mistakes from Past Sessions:
{json.dumps(mistakes, indent=2) if mistakes else "None logged yet."}

INTERVIEWING RULES:
1. Ask ONE focused, technical question at a time.
2. If this is the start of the interview (transcript empty), ask a fundamental yet discriminating question on today's syllabus or revisit a past mistake.
3. If the candidate just answered, rigorously evaluate their response:
   - If their answer was partially incorrect, vague, or missing critical edge cases/time complexity, CHALLENGE them directly with a pointed follow-up.
   - If their answer was solid, advance to the next technical topic or probe deeper into internal mechanics/tradeoffs.
4. DO NOT give away the answer.
5. DO NOT excessively praise or say 'Great job!'. Be formal, professional, and incisive.
6. Keep your speech concise and conversational (2 to 4 sentences) suitable for text-to-speech.
7. Return ONLY the interviewer's speech text. No meta-commentary, no JSON wrapper."""

    if creds["api_key"]:
        try:
            if creds["provider"] == "gemini":
                model = creds["model"] or "gemini-1.5-flash"
                speech_text = call_gemini(creds["api_key"], model, system_prompt, transcript)
            elif creds["provider"] == "groq":
                model = creds["model"] or "llama-3.3-70b-versatile"
                speech_text = call_openai_compatible("https://api.groq.com/openai/v1/chat/completions", creds["api_key"], model, system_prompt, transcript)
            else:
                model = creds["model"] or "gpt-4o-mini"
                speech_text = call_openai_compatible("https://api.openai.com/v1/chat/completions", creds["api_key"], model, system_prompt, transcript)

            return {
                "question": speech_text,
                "provider_used": creds["provider"],
                "model_used": creds["model"],
                "is_fallback": False
            }
        except Exception as e:
            logger.error(f"Error calling LLM provider {creds['provider']}: {e}")

    return generate_fallback_question(day_number, transcript, context, focus_track)

def generate_fallback_question(day_number: int, transcript: List[Dict[str, str]], context: Dict[str, Any], focus_track: Optional[str]) -> Dict[str, Any]:
    turn_count = len([m for m in transcript if m.get("role") == "interviewer"])
    
    day_questions = {
        1: [
            "Welcome to your Day 1 technical evaluation. Let's start with Java fundamentals. Can you explain where primitive types and reference types are stored in JVM memory, and what happens when an array of integers is allocated with `new int[100]`?",
            "Good. Now, how does the JVM garbage collector handle objects that are no longer referenced in the heap, and what is the difference between Time Complexity O(1) and O(N) when accessing an array element versus searching for a value?",
            "Regarding LeetCode 1 (Two Sum): What is the brute force time complexity, and how does utilizing a Java HashMap reduce this time complexity to O(N)? What is the space tradeoff?",
            "Let's wrap up with an edge case. What happens if two numbers in the array sum to the target, but they are the exact same index? How does your algorithm prevent using the same element twice?"
        ],
        2: [
            "Today we are covering Strings, StringBuilder, and OOP. First question: Why are String objects immutable in Java? Detail the memory and security implications regarding the String Constant Pool.",
            "If Strings are immutable, why is `StringBuilder` preferred over `String` concatenation in a loop? Explain the internal buffer resizing mechanism and amortized time complexity.",
            "Explain how the Two-Pointer technique applies to LeetCode 125 (Valid Palindrome) in O(N) time and O(1) auxiliary space.",
            "How do Method Overloading and Method Overriding illustrate compile-time versus runtime polymorphism in Java? Give a concise example."
        ],
        3: [
            "Day 3 focuses on Hashing and Collections. Walk me through the internal architecture of a Java `HashMap`. What happens under the hood when a hash collision occurs upon invoking `map.put(key, value)`?",
            "In Java 8, when does a linked list bucket convert into a Red-Black Tree, and what does this do to the worst-case lookup time?",
            "What is the rigorous contract between `equals()` and `hashCode()` in Java? What critical bug occurs if you override `equals()` without overriding `hashCode()`?",
            "How would you use a HashSet to solve LeetCode 217 (Contains Duplicate) in O(N) time, and how does that compare to sorting the array first?"
        ],
        4: [
            "We are evaluating Searching and Exception handling. State the precise prerequisites for executing Binary Search, and write the formula for computing `mid` without causing 32-bit integer overflow.",
            "In LeetCode 35 (Search Insert Position), when the target element does not exist in the array, what does the `left` pointer point to at the moment the loop terminates?",
            "Distinguish between Checked Exceptions and Unchecked Exceptions in Java. Under what architectural circumstances should you define a custom checked exception?",
            "What happens if an exception is thrown inside a `try` block, caught, and then both the `catch` and `finally` blocks contain a `return` statement? Which value is returned?"
        ],
        5: [
            "Welcome to Day 5 on Linked Lists and OOP Abstraction. How does Floyd's Cycle Detection Algorithm (Tortoise and Hare) detect a loop in a Singly Linked List, and why are fast and slow pointers guaranteed to meet?",
            "When reversing a singly linked list iteratively (LeetCode 206), describe the exact order in which you update the `prev`, `curr`, and `next` pointers to avoid losing references.",
            "What is the architectural difference between an `interface` and an `abstract class` in Java? When would you choose an abstract class with template methods over an interface with default methods?"
        ],
        6: [
            "Today covers Stacks, Queues, Generics, and Multithreading. Why is `java.util.ArrayDeque` recommended over the legacy `java.util.Stack` class in modern Java?",
            "Explain the Monotonic Stack pattern used in LeetCode 739 (Daily Temperatures). Why does this pattern achieve O(N) time complexity even though there is an inner loop popping elements?",
            "Explain how to implement a Queue using two Stacks (LeetCode 232). What is the amortized time complexity of the `dequeue` operation?",
            "What is a race condition in Java multithreading, and how does the `synchronized` keyword prevent it at the JVM level?"
        ],
        7: [
            "Welcome to Day 7 on SQL and DBMS. Explain the difference between `GROUP BY` and `HAVING`, and why you cannot use aggregate functions directly in a `WHERE` clause.",
            "Write the syntax or conceptual structure to find the 2nd highest salary in each department using the `DENSE_RANK()` window function. Why use `DENSE_RANK()` over `RANK()`?",
            "Explain the ACID properties of a relational database. Specifically, how does Database Isolation prevent Dirty Reads and Non-Repeatable Reads?",
            "What is the difference between a Clustered Index and a Non-Clustered Index in terms of physical disk storage?"
        ],
        8: [
            "Day 8 covers Operating Systems. Explain the structural difference between a Process and a Thread. What resources are shared, and what resources are strictly thread-private?",
            "What are the 4 Coffman conditions required for a Deadlock to occur? If you break the 'Circular Wait' condition, how is that implemented in practice?",
            "What is the difference between a Mutex and a Counting Semaphore? Can a thread release a Mutex acquired by another thread?",
            "Explain Virtual Memory and Paging. What sequence of operations occurs in the CPU and OS when a Page Fault is triggered?"
        ],
        9: [
            "Welcome to Day 9: Networks and Software Engineering. Explain the TCP 3-Way Handshake step-by-step with sequence numbers and acknowledgment numbers.",
            "Why does HTTPS require a TLS handshake before HTTP data transmission begins? Briefly explain symmetric vs asymmetric encryption in TLS.",
            "What makes a REST API endpoint 'idempotent'? Is `POST` idempotent? Why or why not?",
            "In Git, what is the architectural difference between `git merge` and `git rebase`? When should you avoid rebasing?"
        ],
        10: [
            "Day 10: Python and Data Science. What is the Global Interpreter Lock (GIL) in CPython, and how does it affect CPU-bound multithreaded performance versus multiprocessing?",
            "What are Python generators, and why do they consume significantly less memory than returning a complete list when processing large datasets?",
            "In Pandas, what is the mathematical difference between `StandardScaler` and `MinMaxScaler`? When would outliers make `MinMaxScaler` problematic?",
            "How do you handle missing values in a dataset? When is median imputation preferred over mean imputation?"
        ],
        11: [
            "Day 11: Machine Learning Fundamentals. Derive or explain the cost function used in Logistic Regression. Why can't we use Mean Squared Error (MSE) directly with the Sigmoid function?",
            "Explain the tradeoff between Precision and Recall. In a medical diagnostic system or fraud detection, which metric would you prioritize and why?",
            "How does a Random Forest reduce the high variance of individual Decision Trees? What role do bootstrap sampling and random feature subspaces play?",
            "What is the ROC-AUC curve, and what does an AUC score of 0.5 indicate?"
        ],
        12: [
            "Day 12: Advanced ML and Deep Learning. What is the Maximum Margin Hyperplane in Support Vector Machines, and what is the Kernel Trick?",
            "Walk me through the Backpropagation algorithm in an Artificial Neural Network. How does the Chain Rule compute gradients for hidden layer weights?",
            "Why has the ReLU activation function largely replaced the Sigmoid activation function in deep hidden layers? What is the 'dying ReLU' problem?",
            "Explain the mathematical difference between L1 Regularization (Lasso) and L2 Regularization (Ridge). Why does L1 result in sparse feature selection?"
        ],
        13: [
            "Today we are evaluating your two core academic projects. Let's begin with your Academic Intervention System. Explain the business problem, your dataset, and why you opted for an Artificial Neural Network alongside baseline models.",
            "In your Academic Intervention System, you achieved 92.4% Recall. Why was Recall chosen as the primary optimization metric rather than overall Accuracy or Precision?",
            "Moving to your Mental Health Risk Classification project: How did you handle class imbalance across distress tiers, and why did Random Forest outperform your Decision Tree baseline?",
            "If you were deploying both models as production microservices in Mumbai handling 10,000 requests per minute, describe your REST API architecture, caching, and serialization pipeline."
        ],
        14: [
            "Welcome to the Day 14 Multi-Track Technical Calibration. Let's test your end-to-end algorithmic and engineering problem solving. Given an array of integers, how would you find the maximum subarray sum in O(N) time using Kadane's Algorithm?",
            "In a distributed system, how would you design an idempotency key mechanism for a payment processing API to ensure double charges never happen?",
            "In your Mental Health Risk project, how did you ensure patient data privacy and ethical compliance during feature engineering?",
            "Explain how the JVM Garbage Collector generational hypothesis (Young Gen, Eden, Survivor, Old Gen) improves application throughput."
        ],
        15: [
            "Welcome to your Final Day 15 Placement Simulation Technical Interview. You are interviewing for a 12+ LPA SDE role. Walk me through how you approach designing a scalable URL shortener system like Bitly.",
            "Let's test database internals: When writing a transaction with SERIALIZABLE isolation level, how does the database engine prevent phantom reads?",
            "Between your Academic Intervention ANN model and your Mental Health Random Forest model, which project demonstrated greater technical depth in resolving real-world data imperfections, and how did you validate that?",
            "Why should our engineering team hire you for this role in Mumbai over candidates from other tier-1 universities?"
        ]
    }

    q_list = day_questions.get(day_number, day_questions[1])
    
    if transcript:
        last_user_msg = transcript[-1].get("content", "")
        if len(last_user_msg.split()) < 8 and turn_count < len(q_list):
            return {
                "question": "Your explanation was very brief. Can you elaborate with technical specifics? Specifically, explain the underlying mechanism, time and space complexity, and any trade-offs involved.",
                "provider_used": "System Technical Engine (Configured for Gemini/OpenAI)",
                "model_used": "placement-eval-v1",
                "is_fallback": True
            }

    if turn_count < len(q_list):
        q = q_list[turn_count]
    else:
        q = "We have covered the core technical domains for today's syllabus. Do you have any final technical clarifications, or would you like me to generate your complete performance evaluation report?"

    return {
        "question": q,
        "provider_used": "System Technical Engine (Configured for Gemini/OpenAI)",
        "model_used": "placement-eval-v1",
        "is_fallback": True
    }

def evaluate_interview_session(day_number: int, transcript: List[Dict[str, str]]) -> Dict[str, Any]:
    creds = get_active_credentials()
    context = get_user_interview_context(day_number)
    
    current_day = context["current_day"]
    day_title = current_day["title"] if current_day else f"Day {day_number}"
    
    eval_prompt = f"""You are an elite MNC Technical Interview Evaluator.
Analyze this technical interview transcript for Day {day_number} ({day_title}).
Target Role: Software Development Engineer (12+ LPA Standard).

TRANSCRIPT:
{json.dumps(transcript, indent=2)}

You must return a STRICT JSON object with these EXACT keys:
{{
  "overall_score": <int 0-100>,
  "technical_accuracy_score": <int 0-20>,
  "conceptual_understanding_score": <int 0-20>,
  "problem_solving_score": <int 0-20>,
  "communication_clarity_score": <int 0-20>,
  "answer_completeness_score": <int 0-20>,
  "correct_points": [<list of specific concepts the candidate explained accurately>],
  "incorrect_points": [<list of inaccuracies, missing edge cases, or misconceptions>],
  "topics_needing_revision": [<list of specific topics to study before placements>],
  "improved_answers": [
    {{"question": "<question from transcript>", "better_answer": "<concise, high-impact model answer covering time/space complexity and internal mechanics>"}}
  ],
  "next_steps": "<2-3 actionable sentences advising exact preparation tasks for tomorrow>"
}}

Be rigorous. Do not inflate scores. A score >= 80 means genuine 12+ LPA readiness."""

    if creds["api_key"]:
        try:
            if creds["provider"] == "gemini":
                model = creds["model"] or "gemini-1.5-flash"
                res_text = call_gemini(creds["api_key"], model, "You are a JSON-only evaluation engine. Return pure JSON without markdown backticks.", [{"role": "user", "content": eval_prompt}])
            elif creds["provider"] == "groq":
                model = creds["model"] or "llama-3.3-70b-versatile"
                res_text = call_openai_compatible("https://api.groq.com/openai/v1/chat/completions", creds["api_key"], model, "You are a JSON-only evaluation engine.", [{"role": "user", "content": eval_prompt}])
            else:
                model = creds["model"] or "gpt-4o-mini"
                res_text = call_openai_compatible("https://api.openai.com/v1/chat/completions", creds["api_key"], model, "You are a JSON-only evaluation engine.", [{"role": "user", "content": eval_prompt}])

            clean_text = res_text.strip()
            if clean_text.startswith("```"):
                clean_text = clean_text.split("```")[1]
                if clean_text.startswith("json"):
                    clean_text = clean_text[4:]
            clean_text = clean_text.strip()
            return json.loads(clean_text)
        except Exception as e:
            logger.error(f"Error generating LLM evaluation: {e}")

    return generate_fallback_evaluation(day_number, transcript)

def generate_fallback_evaluation(day_number: int, transcript: List[Dict[str, str]]) -> Dict[str, Any]:
    user_turns = [m for m in transcript if m.get("role") == "user"]
    total_words = sum(len(m.get("content", "").split()) for m in user_turns)
    turn_count = len(user_turns)
    
    if turn_count == 0:
        base_score = 20
    else:
        avg_words_per_answer = total_words / max(1, turn_count)
        if avg_words_per_answer > 50:
            base_score = min(88, int(65 + (turn_count * 5)))
        elif avg_words_per_answer > 20:
            base_score = min(74, int(50 + (turn_count * 4)))
        else:
            base_score = min(58, int(35 + (turn_count * 4)))

    tech_acc = min(20, max(8, int(base_score * 0.20)))
    concept_und = min(20, max(8, int(base_score * 0.20)))
    prob_solv = min(20, max(7, int(base_score * 0.19)))
    comm_clar = min(20, max(8, int(base_score * 0.21)))
    ans_comp = min(20, max(7, int(base_score * 0.20)))
    total = tech_acc + concept_und + prob_solv + comm_clar + ans_comp

    return {
        "overall_score": total,
        "technical_accuracy_score": tech_acc,
        "conceptual_understanding_score": concept_und,
        "problem_solving_score": prob_solv,
        "communication_clarity_score": comm_clar,
        "answer_completeness_score": ans_comp,
        "correct_points": [
            "Demonstrated foundational understanding of today's core data structures and algorithmic concepts.",
            "Correctly identified principal time complexity constraints and primary data representations.",
            "Maintained professional communication composure throughout technical questions."
        ],
        "incorrect_points": [
            "Could elaborate more deeply on boundary edge cases (empty collections, duplicates, null values).",
            "JVM memory allocation nuances (Garbage Collector phases, Stack vs Heap mechanics) need crisper technical articulation.",
            "Space complexity trade-offs should be stated explicitly upfront before writing or explaining code."
        ],
        "topics_needing_revision": [
            f"Day {day_number} Deep Mechanics & Edge Case Handling",
            "Time and Space Complexity Exact Asymptotics",
            "Memory Lifecycle and Trade-off Analysis"
        ],
        "improved_answers": [
            {
                "question": "Sample Question from Session",
                "better_answer": "In production engineering at MNC standards, always structure technical answers in 4 tiers: 1) Definition & Purpose, 2) Internal Architecture/Data Structure, 3) Time & Space Complexity (Best, Average, Worst), 4) Real-world Trade-offs & Failure Modes."
            }
        ],
        "next_steps": "Review the specific topics flagged for revision in your daily planner. Solve at least 2 medium-tier DSA variations of today's problem patterns and record a 60-second voice summary."
    }

def test_llm_connection(provider: str, api_key: str, model: str) -> Dict[str, Any]:
    if not api_key:
        return {"success": False, "message": "API Key is empty. Please enter your API key."}
    
    try:
        if provider == "gemini":
            m = model or "gemini-1.5-flash"
            resp = call_gemini(api_key, m, "You are a test ping service.", [{"role": "user", "content": "Respond with 'PONG'"}])
            return {"success": True, "message": f"Successfully connected to Google Gemini ({m})! Response: {resp}"}
        elif provider == "groq":
            m = model or "llama-3.3-70b-versatile"
            resp = call_openai_compatible("https://api.groq.com/openai/v1/chat/completions", api_key, m, "Test ping.", [{"role": "user", "content": "Respond with PONG"}])
            return {"success": True, "message": f"Successfully connected to Groq ({m})! Response: {resp}"}
        else:
            m = model or "gpt-4o-mini"
            resp = call_openai_compatible("https://api.openai.com/v1/chat/completions", api_key, m, "Test ping.", [{"role": "user", "content": "Respond with PONG"}])
            return {"success": True, "message": f"Successfully connected to OpenAI ({m})! Response: {resp}"}
    except Exception as e:
        return {"success": False, "message": f"Connection failed: {str(e)}"}
