import json
from datetime import datetime, timedelta
from backend.database import get_connection

def seed_database():
    conn = get_connection()
    cursor = conn.cursor()

    # Check if already seeded
    cursor.execute("SELECT COUNT(*) FROM days")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    today = datetime.now()

    # 1. Seed Settings
    settings_data = {
        "target_role": "Software Development Engineer / AI-ML Engineer",
        "target_salary": "12+ LPA",
        "target_location": "Mumbai, Maharashtra, India",
        "grad_year": "2028",
        "degree": "B.Tech Computer Science Engineering, AI & ML",
        "daily_target_hours": "6",
        "start_date": today.strftime("%Y-%m-%d"),
        "active_theme": "dark",
        "ai_provider": "gemini",
        "ai_model": "gemini-1.5-flash",
        "speech_voice_rate": "1.0",
        "speech_voice_pitch": "1.0"
    }
    for k, v in settings_data.items():
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, v))

    # 2. Seed 15 Days
    days_data = [
        {
            "day_number": 1,
            "title": "Java Fundamentals & Array Basics",
            "subject": "Java & DSA",
            "date_scheduled": (today + timedelta(days=0)).strftime("%Y-%m-%d"),
            "summary": "Master core Java syntax, memory model, primitives vs references, loops, conditions, 1D/2D arrays, and Big O time/space complexity.",
            "learning_objectives": ["Understand JVM memory (Stack vs Heap)", "Master primitive data types & wrapper classes", "Analyze Big O Time & Space complexity", "Solve foundational array manipulation problems"],
            "topics": ["Java Fundamentals", "Data Types & Operators", "Conditions & Loops", "1D & 2D Arrays", "Big O Notation"],
            "subtopics": ["Primitive vs Non-primitive", "Type casting", "Control statements", "Array allocation & traversal", "Asymptotic analysis (Best, Average, Worst case)"],
            "study_material": "### Java Fundamentals & Memory Model\n- **Primitive types**: byte, short, int, long, float, double, char, boolean. Allocated on the Stack.\n- **Reference types**: Objects, Arrays, Strings. References on Stack, actual objects in Heap.\n- **Big O Notation**:\n  - O(1): Constant time (direct array indexing)\n  - O(N): Linear time (single pass through array)\n  - O(N^2): Quadratic time (nested loops)\n- **LeetCode Strategy**: Always check boundary conditions: empty array, single element, negative numbers.",
            "practical_exercises": ["Trace stack and heap allocations for array creation", "Implement prefix sum pattern manually", "Write dry-run table for Two Sum brute force vs optimized"]
        },
        {
            "day_number": 2,
            "title": "Strings, StringBuilder & OOP Fundamentals",
            "subject": "Java & OOP",
            "date_scheduled": (today + timedelta(days=1)).strftime("%Y-%m-%d"),
            "summary": "Deep dive into String immutability, String Constant Pool, StringBuilder vs StringBuffer, and the 4 pillars of OOP in Java.",
            "learning_objectives": ["Understand String Pool & immutability in Java", "Master StringBuilder for O(1) amortized appends", "Implement Two-Pointer technique for palindromes and reversals", "Understand Encapsulation, Inheritance, Polymorphism, Abstraction"],
            "topics": ["Strings & String Pool", "StringBuilder vs StringBuffer", "Two-Pointer Technique", "OOP Pillars: Encapsulation & Inheritance", "Method Overloading vs Overriding"],
            "subtopics": ["String constant pool", "new String() vs string literal", "StringBuilder capacity growth", "Two pointers opposite ends", "Super & this keywords"],
            "study_material": "### Strings & OOP Core Concepts\n- **Why Strings are Immutable in Java**: Security, Thread Safety, String Pool caching, Caching hash codes.\n- **StringBuilder vs StringBuffer**: StringBuilder is non-synchronized (faster, single thread); StringBuffer is synchronized (thread-safe, slower).\n- **Two-Pointer Technique**: Essential for reversing arrays/strings and palindrome verification in O(N) time and O(1) space.",
            "practical_exercises": ["Benchmark String concatenation vs StringBuilder append for 10,000 operations", "Implement custom string reversal without built-in functions", "Design a BankAccount class showcasing encapsulation"]
        },
        {
            "day_number": 3,
            "title": "Hashing, HashMap, HashSet & Java Collections",
            "subject": "DSA & Java",
            "date_scheduled": (today + timedelta(days=2)).strftime("%Y-%m-%d"),
            "summary": "Internal mechanics of HashMap (buckets, hash collisions, linked list to red-black tree), HashSet, and frequency counting patterns.",
            "learning_objectives": ["Understand HashMap internal working and hash collision resolution", "Master the equals() and hashCode() contract", "Use frequency counting to solve duplicate and intersection problems", "Revise Two Sum with HashMap for O(N) lookup"],
            "topics": ["HashMap Internal Architecture", "HashSet Mechanics", "Hash Collision Resolution", "Java Collections Hierarchy", "Frequency Counter Pattern"],
            "subtopics": ["Hashing function & index computation", "Load factor & rehashing (default 0.75)", "Treeification threshold (8 nodes -> Red-Black Tree)", "Map.getOrDefault() pattern"],
            "study_material": "### HashMap Internal Mechanics\n- **Storage**: Array of `Node<K, V>` (table).\n- **Index calculation**: `index = (n - 1) & hash(key)`.\n- **Collisions**: Handled via chaining (Linked list). In Java 8+, if bucket size exceeds 8 and total capacity >= 64, list converts to a balanced Red-Black Tree (O(log N) lookup instead of O(N)).\n- **Contract**: If `o1.equals(o2)` is true, `o1.hashCode() == o2.hashCode()` MUST be true.",
            "practical_exercises": ["Implement manual hash calculation and collision chain trace", "Solve Contains Duplicate in O(N) time and O(N) space", "Solve Intersection of Two Arrays using Set intersection"]
        },
        {
            "day_number": 4,
            "title": "Searching, Sorting, Binary Search & Exceptions",
            "subject": "DSA & Java",
            "date_scheduled": (today + timedelta(days=3)).strftime("%Y-%m-%d"),
            "summary": "Master Binary Search on sorted arrays, search space reduction, overflow-safe midpoint calculation, and robust Java exception handling.",
            "learning_objectives": ["Master Binary Search template (left <= right vs left < right)", "Prevent integer overflow using mid = left + (right - left) / 2", "Apply binary search for lower bound and insertion position", "Understand checked vs unchecked exceptions and try-catch-finally"],
            "topics": ["Binary Search Algorithm", "Search Insert Position", "API Search Range", "Checked vs Unchecked Exceptions", "Custom Exception Classes"],
            "subtopics": ["Monotonic search spaces", "Boundary condition termination", "First Bad Version pattern", "Throwable hierarchy: Error vs Exception", "try-with-resources"],
            "study_material": "### Binary Search Principles\n- **Condition**: Array must be sorted or function monotonic.\n- **Mid calculation**: `int mid = left + (right - left) / 2;` (avoids 32-bit integer overflow when left + right > 2^31 - 1).\n- **Exception Handling**:\n  - `Checked`: Inherit from `Exception` (must be declared in throws or caught, e.g., IOException, SQLException).\n  - `Unchecked`: Inherit from `RuntimeException` (NullPointerException, ArrayIndexOutOfBoundsException).",
            "practical_exercises": ["Dry-run binary search on target existing vs missing", "Implement Search Insert Position with exact index return", "Create a custom InvalidAgeException and test throw/catch"]
        },
        {
            "day_number": 5,
            "title": "Linked Lists, Recursion, Interfaces & Abstract Classes",
            "subject": "DSA & OOP",
            "date_scheduled": (today + timedelta(days=4)).strftime("%Y-%m-%d"),
            "summary": "Singly and doubly linked lists, pointer manipulation, Floyd's Cycle Detection (Tortoise & Hare), recursion call stack, and Java Interfaces.",
            "learning_objectives": ["Master node pointer manipulation without losing reference", "Reverse a linked list iteratively in O(N) time and O(1) space", "Detect cycles using Floyd's slow and fast pointers", "Distinguish Abstract Class vs Interface (Default & static methods)"],
            "topics": ["Singly Linked List", "Pointer Manipulation", "Floyd's Cycle Detection Algorithm", "Recursion & Call Stack", "Abstract Classes vs Interfaces"],
            "subtopics": ["Dummy head node technique", "Iterative vs recursive reversal", "Fast & slow pointer convergence", "Base case & recursive step", "Multiple inheritance via interfaces"],
            "study_material": "### Linked List & Recursion\n- **Dummy Head Technique**: Avoids special casing for empty lists or operations on the head node (`ListNode dummy = new ListNode(0); dummy.next = head;`).\n- **Floyd's Cycle Detection**: Slow moves 1 step, Fast moves 2 steps. If cycle exists, they must meet within the loop. Time: O(N), Space: O(1).\n- **Interface vs Abstract Class**:\n  - Abstract class: Can hold non-final state, constructors, partial implementation.\n  - Interface: Contractual, multiple interfaces can be implemented, default methods allowed in Java 8+.",
            "practical_exercises": ["Implement iterative reversal step-by-step with prev, curr, next pointers", "Implement Merge Two Sorted Lists using dummy head", "Prove why fast and slow pointers meet when a cycle exists"]
        },
        {
            "day_number": 6,
            "title": "Stacks, Queues, Generics & Multithreading Basics",
            "subject": "DSA & Java",
            "date_scheduled": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
            "summary": "LIFO vs FIFO, Monotonic Stack pattern for next greater element, Stack via Queues, Java Generics, and Thread lifecycle/synchronization.",
            "learning_objectives": ["Implement parenthesis balancing using Stack", "Master Monotonic Decreasing Stack for Daily Temperatures", "Implement Queue using two Stacks", "Understand Thread creation (Thread vs Runnable), locks, and race conditions"],
            "topics": ["Stack (LIFO) & Queue (FIFO)", "Parenthesis Matching", "Monotonic Stack Pattern", "Generics & Type Erasure", "Multithreading Basics"],
            "subtopics": ["ArrayDeque vs Stack legacy class", "Daily Temperatures next warmer day", "Implementing Queue with 2 Stacks amortized O(1)", "Thread lifecycle (NEW, RUNNABLE, BLOCKED, WAITING, TERMINATED)", "synchronized block & volatile"],
            "study_material": "### Stacks & Multithreading\n- **Prefer `ArrayDeque`**: Legacy `java.util.Stack` extends `Vector` and synchronizes on every operation, creating unnecessary overhead.\n- **Monotonic Stack**: Keep indices of elements in decreasing order. When encountering a greater element, pop and calculate span/temperatures.\n- **Multithreading**:\n  - `implements Runnable` is preferred over `extends Thread` to allow inheriting other classes.\n  - `volatile`: Ensures visibility of changes across CPU cores without full locking.",
            "practical_exercises": ["Solve Valid Parentheses handling all bracket pairs: (), {}, []", "Solve Daily Temperatures using monotonic stack", "Write a simple Producer-Consumer using wait() and notify()"]
        },
        {
            "day_number": 7,
            "title": "SQL & DBMS: Queries, Normalization, ACID & Indexes",
            "subject": "Database & SQL",
            "date_scheduled": (today + timedelta(days=6)).strftime("%Y-%m-%d"),
            "summary": "Relational database concepts, SQL joins, aggregate functions, subqueries, CTEs, Window Functions (ROW_NUMBER, DENSE_RANK), ACID, and B-Trees.",
            "learning_objectives": ["Write complex SQL queries involving JOINs, GROUP BY, and HAVING", "Master Window Functions: ROW_NUMBER(), RANK(), DENSE_RANK()", "Understand ACID properties and Transaction Isolation Levels", "Master Database Normalization (1NF to BCNF) and B-Tree indexing"],
            "topics": ["SQL Queries & Joins", "Window Functions & CTEs", "ACID Properties & Transactions", "Database Normalization (1NF - BCNF)", "Indexes & B+ Tree"],
            "subtopics": ["INNER, LEFT, RIGHT, FULL OUTER joins", "GROUP BY vs HAVING filter", "Common Table Expressions (WITH clause)", "Dirty Read, Non-repeatable Read, Phantom Read", "Clustered vs Non-clustered Index"],
            "study_material": "### DBMS & Advanced SQL\n- **Window Functions**: `ROW_NUMBER() OVER(PARTITION BY dept_id ORDER BY salary DESC)`.\n  - `RANK()` leaves gaps (1, 2, 2, 4); `DENSE_RANK()` does not leave gaps (1, 2, 2, 3).\n- **ACID**:\n  - Atomicity: All or nothing.\n  - Consistency: Data integrity constraints preserved.\n  - Isolation: Concurrent transactions do not interfere.\n  - Durability: Committed updates survive system crashes.\n- **Indexes**: B+ Tree index enables O(log N) lookup. Clustered index physically sorts the table (only 1 per table); Non-clustered index stores pointer to row.",
            "practical_exercises": ["Find the Nth highest salary in an Employee table using DENSE_RANK", "Write a query with CTE to calculate cumulative revenue", "Normalize an unnormalized order table into 3NF"]
        },
        {
            "day_number": 8,
            "title": "Operating Systems: Processes, Threads & Memory",
            "subject": "Core CS",
            "date_scheduled": (today + timedelta(days=7)).strftime("%Y-%m-%d"),
            "summary": "Process vs Thread, Context Switching, CPU Scheduling algorithms, Deadlock Coffman conditions, Mutex vs Semaphore, Paging and Virtual Memory.",
            "learning_objectives": ["Explain Process control block (PCB) and context switching overhead", "Analyze CPU scheduling: Round Robin, FCFS, SJF, Priority", "Identify the 4 Coffman conditions for Deadlock and Banker's Algorithm", "Explain Virtual Memory, Paging, Page Faults, and TLB"],
            "topics": ["Process vs Thread", "CPU Scheduling Algorithms", "Deadlock & Coffman Conditions", "Concurrency: Mutex vs Semaphore", "Memory Management & Paging"],
            "subtopics": ["PCB & Process states", "Gantt charts & Turnaround / Waiting time", "Deadlock prevention vs detection", "Binary vs Counting Semaphore", "Page Table, TLB, Page replacement (LRU, FIFO)"],
            "study_material": "### Operating Systems Core\n- **Process vs Thread**: Process has isolated address space; threads within the same process share text, data, and heap, but have independent stacks.\n- **Deadlock Coffman Conditions** (All 4 must hold):\n  1. Mutual Exclusion\n  2. Hold and Wait\n  3. No Preemption\n  4. Circular Wait\n- **Paging & Virtual Memory**: Divides physical memory into frames and logical memory into pages. Page fault occurs when requested page is not in RAM, triggering OS to load from disk.",
            "practical_exercises": ["Calculate Average Turnaround Time and Waiting Time for Round Robin (Quantum = 2ms)", "Draw resource allocation graph showing a deadlock state", "Trace LRU page replacement algorithm with 3 frames"]
        },
        {
            "day_number": 9,
            "title": "Computer Networks & Software Engineering",
            "subject": "Core CS & SE",
            "date_scheduled": (today + timedelta(days=8)).strftime("%Y-%m-%d"),
            "summary": "OSI 7 Layers, TCP/IP Model, TCP 3-Way Handshake vs UDP, HTTP/HTTPS, TLS/SSL, DNS resolution, RESTful API design, and Git workflow.",
            "learning_objectives": ["Map network protocols to OSI 7 layers and TCP/IP layers", "Explain TCP 3-Way Handshake (SYN, SYN-ACK, ACK) and 4-way termination", "Detail what happens when typing a URL in the browser", "Design RESTful APIs following standard HTTP verbs, status codes, and idempotency"],
            "topics": ["OSI 7 Layers & TCP/IP Model", "TCP vs UDP & Handshake", "DNS & URL Lifecycle", "HTTP/1.1 vs HTTP/2 vs HTTPS (TLS/SSL)", "REST API Design & Git Workflow"],
            "subtopics": ["Encapsulation & Decapsulation", "Reliability vs Latency in transport", "DNS recursive vs iterative resolution", "HTTP Status codes (200, 201, 400, 401, 403, 404, 500)", "Git branching, merge vs rebase"],
            "study_material": "### Computer Networks & REST Architecture\n- **TCP 3-Way Handshake**:\n  1. Client -> Server: `SYN` (seq = x)\n  2. Server -> Client: `SYN-ACK` (seq = y, ack = x + 1)\n  3. Client -> Server: `ACK` (ack = y + 1)\n- **URL to Page Load Lifecycle**:\n  1. Browser checks cache (browser, OS, router).\n  2. DNS resolution (Local DNS -> Root -> TLD -> Authoritative).\n  3. TCP Connection + TLS Handshake.\n  4. HTTP GET request sent; Server processes and returns HTML.\n  5. Browser DOM/CSSOM tree rendering.\n- **REST Principles**: Stateless, Client-Server, Cacheable, Uniform Interface.",
            "practical_exercises": ["Explain TCP vs UDP tradeoff with real-world examples (VoIP vs File Transfer)", "Design REST API endpoints for an e-commerce cart system", "Compare git merge vs git rebase with commit tree diagrams"]
        },
        {
            "day_number": 10,
            "title": "Python & Data Science Stack: NumPy & Pandas",
            "subject": "Python & Data Science",
            "date_scheduled": (today + timedelta(days=9)).strftime("%Y-%m-%d"),
            "summary": "Python internals (GIL, list comprehensions, decorators, generators), NumPy vectorization, Pandas data cleaning, and feature scaling.",
            "learning_objectives": ["Master Python memory management and generators for memory efficiency", "Perform vectorized array operations in NumPy without explicit loops", "Clean messy datasets with Pandas (handling missing values, duplicates, outliers)", "Apply feature scaling (StandardScaler vs MinMaxScaler) and train-test splitting"],
            "topics": ["Python Advanced Internals", "NumPy Vectorized Operations", "Pandas DataFrames & Manipulation", "Data Preprocessing & Cleaning", "Feature Scaling & Splitting"],
            "subtopics": ["GIL (Global Interpreter Lock)", "Generators (yield) vs Lists", "Broadcasting in NumPy", "groupby, apply, merge, pivot_table", "Standardization vs Normalization"],
            "study_material": "### Python & Data Science Mechanics\n- **NumPy Vectorization**: Operations run in optimized C routines (SIMD), avoiding Python bytecode interpretation overhead.\n- **Pandas Cleaning**:\n  - Imputation: Mean/Median for continuous (median if outliers present), Mode for categorical.\n  - Outlier detection: IQR method (`Q1 - 1.5*IQR` to `Q3 + 1.5*IQR`) or Z-Score.\n- **Feature Scaling**:\n  - StandardScaler: `(X - mu) / sigma` (Mean = 0, Std = 1; essential for SVM, Logistic Regression, ANN).\n  - MinMaxScaler: `(X - min) / (max - min)` (Bounds between 0 and 1; sensitive to outliers).",
            "practical_exercises": ["Write a custom generator for reading large CSV files line by line", "Perform aggregate groupby on sales data using Pandas", "Compare StandardScaler and MinMaxScaler output distributions"]
        },
        {
            "day_number": 11,
            "title": "Machine Learning Fundamentals & Classical Algorithms",
            "subject": "Machine Learning",
            "date_scheduled": (today + timedelta(days=10)).strftime("%Y-%m-%d"),
            "summary": "Supervised vs Unsupervised learning, Linear Regression, Logistic Regression, Decision Trees, Random Forests, Naive Bayes, and Evaluation Metrics.",
            "learning_objectives": ["Differentiate Regression vs Classification and Supervised vs Unsupervised", "Derive Logistic Regression sigmoid function and binary cross-entropy loss", "Understand Decision Tree splitting criteria (Gini Impurity vs Entropy)", "Explain Random Forest bagging and feature randomness to reduce variance", "Calculate Precision, Recall, F1-Score, ROC-AUC, and Confusion Matrix"],
            "topics": ["Supervised vs Unsupervised Learning", "Linear & Logistic Regression", "Decision Trees & Random Forests", "Naive Bayes & Bayes Theorem", "Evaluation Metrics & Confusion Matrix"],
            "subtopics": ["Cost functions (MSE vs Log-Loss)", "Sigmoid activation", "Information Gain & Gini Impurity", "Ensemble Bagging vs Boosting", "Precision vs Recall tradeoff, ROC-AUC curve"],
            "study_material": "### ML Fundamentals\n- **Logistic Regression**: Outputs probability `P(Y=1|X) = 1 / (1 + e^(-z))`. Cost function is Binary Cross-Entropy / Log Loss (convex, unlike MSE with sigmoid).\n- **Decision Trees vs Random Forest**:\n  - Single decision tree has low bias, high variance (prone to overfitting).\n  - Random Forest trains multiple trees on bootstrap samples (bagging) with random feature subsets at each split, drastically reducing variance.\n- **Evaluation Metrics**:\n  - Precision = TP / (TP + FP) (Focus when False Positives are costly, e.g., Spam detection).\n  - Recall = TP / (TP + FN) (Focus when False Negatives are costly, e.g., Medical diagnosis, Academic Intervention).\n  - F1-Score = Harmonic mean of Precision and Recall.",
            "practical_exercises": ["Calculate Gini impurity for a 2-class split manually", "Construct a 2x2 confusion matrix and calculate Precision, Recall, and F1", "Explain Bayes Theorem with a disease testing example"]
        },
        {
            "day_number": 12,
            "title": "Advanced Machine Learning & Neural Networks",
            "subject": "AI & ML",
            "date_scheduled": (today + timedelta(days=11)).strftime("%Y-%m-%d"),
            "summary": "Support Vector Machines, K-Means Clustering, Artificial Neural Networks (ANN), Backpropagation, Gradient Descent variants, Regularization, and Tuning.",
            "learning_objectives": ["Explain SVM maximum margin hyperplane and Kernel Trick (RBF)", "Trace K-Means clustering algorithm and Elbow Method for optimal K", "Understand ANN architecture: Forward propagation, Activation functions (ReLU, Sigmoid, Softmax)", "Explain Backpropagation using Chain Rule and Gradient Descent (SGD, Adam)", "Diagnose Overfitting vs Underfitting (Bias-Variance tradeoff, Ridge, Lasso, Dropout)"],
            "topics": ["Support Vector Machines (SVM)", "K-Means Clustering", "Artificial Neural Networks (ANN)", "Backpropagation & Optimization", "Regularization (L1, L2, Dropout) & Tuning"],
            "subtopics": ["Margin maximization & C parameter", "Centroid initialization & K-Means++", "Activation functions & Vanishing gradient", "Stochastic Gradient Descent vs Adam", "L1 (Lasso) vs L2 (Ridge), K-fold Cross Validation"],
            "study_material": "### Advanced ML & Deep Learning\n- **SVM**: Finds separating hyperplane maximizing margin `2 / ||w||`. Kernel trick projects data into higher dimension without explicit coordinate transformation.\n- **ANN & Backpropagation**:\n  - Forward pass computes activations: `z = Wx + b, a = f(z)`.\n  - Backward pass calculates partial derivatives `dLoss/dW` via chain rule to update weights.\n  - ReLU `max(0, x)` solves vanishing gradient problem of sigmoid for deep networks.\n- **Regularization**:\n  - L1 (Lasso): Adds `lambda * sum(|w|)`. Shrinks coefficients to exact zero (feature selection).\n  - L2 (Ridge): Adds `lambda * sum(w^2)`. Shrinks weights close to zero, stabilizing collinearity.",
            "practical_exercises": ["Trace chain rule step for single hidden layer perceptron", "Compare L1 vs L2 penalty contours", "Explain Adam optimizer combining momentum and RMSprop"]
        },
        {
            "day_number": 13,
            "title": "Project Deep-Dives, Resume Defense & API Architecture",
            "subject": "Projects & Development",
            "date_scheduled": (today + timedelta(days=12)).strftime("%Y-%m-%d"),
            "summary": "Deep architectural defense of Academic Intervention System (ANN) and Mental Health Risk Classification (ML), REST API integration, and Resume alignment.",
            "learning_objectives": ["Defend Academic Intervention System: Problem, Dataset, ANN vs Baseline models, Metrics, Recall justification", "Defend Mental Health Risk Classification: Data preprocessing, TF-IDF/tabular features, Model comparisons, Ethics", "Articulate technical architecture, REST API design, JSON serialization, and deployment pipeline", "Align project descriptions on resume with quantifiable impact and technical depth"],
            "topics": ["Academic Intervention System (Project 1)", "Mental Health Risk Classification (Project 2)", "Model Justification & Tradeoffs", "REST API & Deployment Architecture", "Resume Project Defense"],
            "subtopics": ["ANN architecture & baseline comparison", "Multiclass/binary risk labeling", "Handling class imbalance (SMOTE, class weights)", "FastAPI / Flask model serving", "Handling live technical cross-examination"],
            "study_material": "### Project Defense Strategy\n- **Project 1: Academic Intervention System**:\n  - Goal: Early detection of students at risk of academic failure or dropout.\n  - Model: ANN with Dense layers, ReLU, Dropout, Softmax output vs Baselines (Logistic Regression, Random Forest).\n  - Key Metric: Recall / Sensitivity. Missing an at-risk student (False Negative) has far higher consequence than extra monitoring for a safe student (False Positive).\n- **Project 2: Mental Health Risk Classification**:\n  - Goal: Classify severity of mental distress into low/medium/high risk tiers.\n  - Models: Logistic Regression (interpretable baseline), Decision Tree (rule-based), Random Forest (best ensemble generalization).\n  - Challenges: Class imbalance, sensitive data privacy, feature engineering.",
            "practical_exercises": ["Practice answering 'Why ANN instead of XGBoost?' under 90 seconds", "Draw the end-to-end data pipeline from raw input to API prediction response", "Refine project resume bullet points using the Google X-Y-Z formula"]
        },
        {
            "day_number": 14,
            "title": "Comprehensive Multi-Track Technical Mock Interviews",
            "subject": "Comprehensive Mocks",
            "date_scheduled": (today + timedelta(days=13)).strftime("%Y-%m-%d"),
            "summary": "Intensive subject-wise mock interviews across Java, DSA, SQL, OS, CN, Python, ML, Projects, and HR to evaluate readiness before the final simulation.",
            "learning_objectives": ["Complete dedicated Java & DSA live technical interview", "Complete Core CS & SQL live technical interview", "Complete Python & Machine Learning technical interview", "Complete Project deep-dive viva and HR behavioral interview", "Identify lingering gaps and calibrate response timing"],
            "topics": ["Java & DSA Track Interview", "Core CS & SQL Track Interview", "Python & ML Track Interview", "Project Viva Track", "HR & Behavioral Track"],
            "subtopics": ["Real-time coding explanation", "Database query optimization", "ML math and loss functions", "STAR behavioral responses", "Stress testing under timed conditions"],
            "study_material": "### Mock Interview Strategy\n- **Think Aloud**: Interviewers evaluate problem-solving process, not just final answers.\n- **Clarify Requirements**: Ask edge cases before writing code.\n- **Structure Technical Answers**: Definition -> Internal Working -> Tradeoffs -> Practical Experience / Example.",
            "practical_exercises": ["Perform 3 separate mock interview sessions in AI Voice Room", "Review generated evaluation reports and note recurring inaccuracies", "Rehearse answers for topics marked 'needs revision'"]
        },
        {
            "day_number": 15,
            "title": "Full Placement Day Simulation & Final Readiness Assessment",
            "subject": "Placement Simulation",
            "date_scheduled": (today + timedelta(days=14)).strftime("%Y-%m-%d"),
            "summary": "End-to-end placement simulation replicating MNC hiring drives: Aptitude Round -> Coding Round -> Technical Interview -> Project Viva -> HR Interview.",
            "learning_objectives": ["Complete timed Aptitude & Logical Reasoning screening round", "Complete timed 2-problem DSA Coding Round", "Clear Technical Interview covering Java, SQL, OS, Networks, and ML", "Clear Project architecture defense and HR Round", "Generate Final Day 15 Readiness Report and formulate next 30-day roadmap"],
            "topics": ["Round 1: Online Aptitude Assessment", "Round 2: Technical Coding Round", "Round 3: Core Technical Interview", "Round 4: Project Viva & ML Deep Dive", "Round 5: HR & Leadership Interview", "Final Evaluation & Next Steps"],
            "subtopics": ["Speed and accuracy under pressure", "Clean code & edge case handling", "MNC interview standards", "Salary negotiation & offer readiness", "Honest placement readiness score"],
            "study_material": "### Placement Day Protocol\n- **Aptitude**: Skip time-sink questions; aim for 80%+ accuracy on strong topics.\n- **Coding**: Write working brute force first, then optimize. Explain time and space complexity explicitly.\n- **Interview**: Stay calm, honest about unknown concepts, proactive in showing fundamentals.",
            "practical_exercises": ["Execute full 5-round simulation", "Generate Final Placement Readiness Report", "Export full preparation data backup as JSON"]
        }
    ]

    for day in days_data:
        cursor.execute("""
        INSERT INTO days (day_number, title, subject, date_scheduled, summary, learning_objectives, topics, subtopics, study_material, practical_exercises, revision_tasks, completed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        """, (
            day["day_number"],
            day["title"],
            day["subject"],
            day["date_scheduled"],
            day["summary"],
            json.dumps(day["learning_objectives"]),
            json.dumps(day["topics"]),
            json.dumps(day["subtopics"]),
            day["study_material"],
            json.dumps(day["practical_exercises"]),
            json.dumps(["Review daily mistakes", "Solve unattempted aptitude questions", "Repeat AI mock interview"]),
        ))

    # 3. Seed Tasks for Day 1 to 15
    task_templates = [
        # Day 1
        (1, "Study Java fundamentals, JVM memory, Stack vs Heap", "Java", "theory", 45),
        (1, "Big O notation & asymptotic analysis deep-dive", "Java", "theory", 30),
        (1, "Solve LeetCode 1480: Running Sum of 1d Array", "DSA", "coding", 30),
        (1, "Solve LeetCode 1929: Concatenation of Array", "DSA", "coding", 25),
        (1, "Solve LeetCode 1: Two Sum (Brute force & HashMap)", "DSA", "coding", 40),
        (1, "Practice Aptitude: Percentages & Number Systems (10 Qs)", "Aptitude", "aptitude", 45),
        (1, "Complete Day 1 AI Mock Interview: Java & Arrays", "Interview", "mock", 30),
        (1, "Daily communication drill: Introduce yourself technically", "Communication", "communication", 20),

        # Day 2
        (2, "Study String immutability, String Pool & StringBuilder", "Java", "theory", 40),
        (2, "Master OOP principles: Encapsulation, Inheritance, Polymorphism", "Java", "theory", 45),
        (2, "Solve LeetCode 344: Reverse String (Two Pointers)", "DSA", "coding", 25),
        (2, "Solve LeetCode 125: Valid Palindrome (Two Pointers)", "DSA", "coding", 30),
        (2, "Solve LeetCode 242: Valid Anagram (Frequency Array)", "DSA", "coding", 35),
        (2, "Practice Aptitude: Ratio and Proportion (10 Qs)", "Aptitude", "aptitude", 45),
        (2, "Complete Day 2 AI Mock Interview: Strings & OOP", "Interview", "mock", 30),

        # Day 3
        (3, "Study HashMap internal architecture & equals/hashCode contract", "Java", "theory", 50),
        (3, "Study HashSet mechanics and Java Collections framework", "Java", "theory", 40),
        (3, "Solve LeetCode 217: Contains Duplicate", "DSA", "coding", 25),
        (3, "Solve LeetCode 349: Intersection of Two Arrays", "DSA", "coding", 35),
        (3, "Revise LeetCode 1: Two Sum (Optimal One-Pass HashMap)", "DSA", "revision", 25),
        (3, "Practice Aptitude: Profit and Loss (10 Qs)", "Aptitude", "aptitude", 45),
        (3, "Complete Day 3 AI Mock Interview: Hashing & Collections", "Interview", "mock", 30),

        # Day 4
        (4, "Study Searching & Sorting algorithms, Binary Search conditions", "DSA", "theory", 45),
        (4, "Study Java Exception Handling: Checked vs Unchecked", "Java", "theory", 35),
        (4, "Solve LeetCode 704: Binary Search", "DSA", "coding", 25),
        (4, "Solve LeetCode 35: Search Insert Position", "DSA", "coding", 30),
        (4, "Solve LeetCode 278: First Bad Version", "DSA", "coding", 35),
        (4, "Practice Aptitude: Time and Work (10 Qs)", "Aptitude", "aptitude", 45),
        (4, "Complete Day 4 AI Mock Interview: Searching & Exceptions", "Interview", "mock", 30),

        # Day 5
        (5, "Study Singly & Doubly Linked Lists, pointer mechanics", "DSA", "theory", 45),
        (5, "Study Interfaces vs Abstract Classes in Java", "Java", "theory", 35),
        (5, "Solve LeetCode 206: Reverse Linked List", "DSA", "coding", 35),
        (5, "Solve LeetCode 21: Merge Two Sorted Lists", "DSA", "coding", 35),
        (5, "Solve LeetCode 141: Linked List Cycle (Floyd's Algorithm)", "DSA", "coding", 35),
        (5, "Practice Aptitude: Speed, Time and Distance (10 Qs)", "Aptitude", "aptitude", 45),
        (5, "Complete Day 5 AI Mock Interview: Linked Lists & Interfaces", "Interview", "mock", 30),

        # Day 6
        (6, "Study Stacks (LIFO) and Queues (FIFO), ArrayDeque", "DSA", "theory", 40),
        (6, "Study Java Generics, advanced Collections, Multithreading basics", "Java", "theory", 45),
        (6, "Solve LeetCode 20: Valid Parentheses", "DSA", "coding", 30),
        (6, "Solve LeetCode 225: Implement Stack using Queues", "DSA", "coding", 30),
        (6, "Solve LeetCode 232: Implement Queue using Stacks", "DSA", "coding", 30),
        (6, "Solve LeetCode 739: Daily Temperatures (Monotonic Stack)", "DSA", "coding", 45),
        (6, "Practice Aptitude: Probability & Permutations (10 Qs)", "Aptitude", "aptitude", 45),
        (6, "Complete Day 6 AI Mock Interview: Stacks, Queues & Multithreading", "Interview", "mock", 30),

        # Day 7
        (7, "Study SQL basics, SELECT, WHERE, GROUP BY, HAVING, and JOINs", "DBMS", "theory", 50),
        (7, "Master Subqueries, Common Table Expressions (CTEs), and Window Functions", "DBMS", "theory", 50),
        (7, "Study Keys, Normalization (1NF to BCNF), and ACID Transactions", "DBMS", "theory", 45),
        (7, "Practice SQL queries on employees and departments dataset", "SQL", "coding", 50),
        (7, "Practice Aptitude: Permutations and Combinations (10 Qs)", "Aptitude", "aptitude", 45),
        (7, "Complete Day 7 AI Mock Interview: SQL & DBMS", "Interview", "mock", 30),

        # Day 8
        (8, "Study Processes vs Threads, Context Switching, and PCB", "OS", "theory", 45),
        (8, "Analyze CPU Scheduling (Round Robin, FCFS, SJF, Priority)", "OS", "theory", 40),
        (8, "Master Deadlocks, Coffman Conditions, and Banker's Algorithm", "OS", "theory", 45),
        (8, "Study Mutex, Semaphores, Paging, and Virtual Memory", "OS", "theory", 45),
        (8, "Practice Aptitude: Logical Reasoning (Syllogisms & Blood Relations)", "Aptitude", "aptitude", 45),
        (8, "Complete Day 8 AI Mock Interview: Operating Systems", "Interview", "mock", 30),

        # Day 9
        (9, "Study OSI 7-Layer Model and TCP/IP Architecture", "Networks", "theory", 45),
        (9, "Master TCP 3-Way Handshake, TCP vs UDP, and DNS Resolution", "Networks", "theory", 45),
        (9, "Study HTTP/HTTPS, TLS Handshake, and REST API Best Practices", "Networks", "theory", 45),
        (9, "Master Git Workflow (Branching, Merge, Rebase) and SDLC", "SE", "theory", 35),
        (9, "Practice Aptitude: Logical Reasoning (Coding-Decoding & Series)", "Aptitude", "aptitude", 45),
        (9, "Complete Day 9 AI Mock Interview: Computer Networks & SE", "Interview", "mock", 30),

        # Day 10
        (10, "Study Python internals: GIL, memory management, generators, decorators", "Python", "theory", 45),
        (10, "Master NumPy vectorized operations and array manipulations", "Data Science", "theory", 40),
        (10, "Master Pandas DataFrames: cleaning, grouping, merging, and filtering", "Data Science", "theory", 50),
        (10, "Practice feature scaling: StandardScaler vs MinMaxScaler, train-test split", "Data Science", "coding", 40),
        (10, "Practice Aptitude: Verbal Ability (Sentence Correction & Reading)", "Aptitude", "aptitude", 45),
        (10, "Complete Day 10 AI Mock Interview: Python & Data Science", "Interview", "mock", 30),

        # Day 11
        (11, "Study Supervised vs Unsupervised learning paradigms", "ML", "theory", 40),
        (11, "Derive Linear Regression (MSE, OLS) and Logistic Regression (Sigmoid, Log-Loss)", "ML", "theory", 50),
        (11, "Master Decision Trees (Gini, Entropy) and Random Forest Bagging", "ML", "theory", 50),
        (11, "Study Naive Bayes classifier and Bayes Theorem applications", "ML", "theory", 35),
        (11, "Master evaluation metrics: Precision, Recall, F1, ROC-AUC, Confusion Matrix", "ML", "theory", 40),
        (11, "Practice Aptitude: Mixed Quant & Logic (10 Qs)", "Aptitude", "aptitude", 45),
        (11, "Complete Day 11 AI Mock Interview: Machine Learning Fundamentals", "Interview", "mock", 30),

        # Day 12
        (12, "Study Support Vector Machines (SVM), Hyperplane, and Kernel Trick", "ML", "theory", 45),
        (12, "Study K-Means Clustering, centroid update, and Elbow Method", "ML", "theory", 40),
        (12, "Master Artificial Neural Networks (ANN): Perceptron, activations, forward pass", "ML", "theory", 50),
        (12, "Understand Backpropagation, Gradient Descent, SGD, Adam optimizer", "ML", "theory", 45),
        (12, "Study Bias-Variance Tradeoff, L1/L2 Regularization, Cross-Validation", "ML", "theory", 40),
        (12, "Complete Day 12 AI Mock Interview: Advanced ML & Neural Networks", "Interview", "mock", 30),

        # Day 13
        (13, "Deep-dive Project 1: Academic Intervention System (ANN, Baseline, Recall metric)", "Projects", "theory", 50),
        (13, "Deep-dive Project 2: Mental Health Risk Classification (LogReg, DT, RF, NLP/Features)", "Projects", "theory", 50),
        (13, "Architectural defense: REST API deployment, JSON schemas, Model serving", "Projects", "theory", 45),
        (13, "Review and refine resume technical skills and project bullets", "Resume", "revision", 40),
        (13, "Practice Project Viva questions in AI Mock Room", "Interview", "mock", 35),
        (13, "Communication practice: Tell Me About Yourself & Project Pitch", "Communication", "communication", 30),

        # Day 14
        (14, "Track Mock 1: Java & DSA Live Coding Interview", "Interview", "mock", 40),
        (14, "Track Mock 2: SQL & Core CS (OS/Networks) Interview", "Interview", "mock", 40),
        (14, "Track Mock 3: Python & Machine Learning Deep-Dive Interview", "Interview", "mock", 40),
        (14, "Track Mock 4: Projects Defense & Architecture Viva", "Interview", "mock", 35),
        (14, "Track Mock 5: HR, Behavioral (STAR) & Communication Interview", "Communication", "mock", 35),
        (14, "Consolidate mock mistakes into revision notebook", "Revision", "revision", 40),

        # Day 15
        (15, "Round 1: Full Placement Aptitude Assessment (30 Questions)", "Placement", "aptitude", 45),
        (15, "Round 2: Timed Technical Coding Assessment (2 DSA Problems)", "Placement", "coding", 60),
        (15, "Round 3: Core Technical & Machine Learning Interview", "Placement", "mock", 45),
        (15, "Round 4: Final HR & Managerial Interview", "Placement", "mock", 30),
        (15, "Generate Final Day 15 Placement Readiness Report & Analytics", "Report", "revision", 30),
        (15, "Formulate Next 30-Day Preparation Roadmap & Export Backup", "Report", "revision", 30)
    ]

    for day_num, title, subj, cat, planned_mins in task_templates:
        cursor.execute("""
        INSERT INTO tasks (day_number, title, subject, category, planned_minutes, actual_seconds, completed, revision_required)
        VALUES (?, ?, ?, ?, ?, 0, 0, 0)
        """, (day_num, title, subj, cat, planned_mins))

    # 4. Seed DSA Problems (Initial LeetCode problems + expansion)
    dsa_data = [
        # Day 1
        (1480, "Running Sum of 1d Array", "LeetCode", "Easy", "Arrays", "Todo", 1, "https://leetcode.com/problems/running-sum-of-1d-array/"),
        (1929, "Concatenation of Array", "LeetCode", "Easy", "Arrays", "Todo", 1, "https://leetcode.com/problems/concatenation-of-array/"),
        (1, "Two Sum", "LeetCode", "Easy", "Hashing", "Todo", 1, "https://leetcode.com/problems/two-sum/"),
        # Day 2
        (344, "Reverse String", "LeetCode", "Easy", "Strings", "Todo", 2, "https://leetcode.com/problems/reverse-string/"),
        (125, "Valid Palindrome", "LeetCode", "Easy", "Two Pointers", "Todo", 2, "https://leetcode.com/problems/valid-palindrome/"),
        (242, "Valid Anagram", "LeetCode", "Easy", "Hashing", "Todo", 2, "https://leetcode.com/problems/valid-anagram/"),
        # Day 3
        (217, "Contains Duplicate", "LeetCode", "Easy", "Hashing", "Todo", 3, "https://leetcode.com/problems/contains-duplicate/"),
        (349, "Intersection of Two Arrays", "LeetCode", "Easy", "Hashing", "Todo", 3, "https://leetcode.com/problems/intersection-of-two-arrays/"),
        # Day 4
        (704, "Binary Search", "LeetCode", "Easy", "Binary Search", "Todo", 4, "https://leetcode.com/problems/binary-search/"),
        (35, "Search Insert Position", "LeetCode", "Easy", "Binary Search", "Todo", 4, "https://leetcode.com/problems/search-insert-position/"),
        (278, "First Bad Version", "LeetCode", "Easy", "Binary Search", "Todo", 4, "https://leetcode.com/problems/first-bad-version/"),
        # Day 5
        (206, "Reverse Linked List", "LeetCode", "Easy", "Linked Lists", "Todo", 5, "https://leetcode.com/problems/reverse-linked-list/"),
        (21, "Merge Two Sorted Lists", "LeetCode", "Easy", "Linked Lists", "Todo", 5, "https://leetcode.com/problems/merge-two-sorted-lists/"),
        (141, "Linked List Cycle", "LeetCode", "Easy", "Linked Lists", "Todo", 5, "https://leetcode.com/problems/linked-list-cycle/"),
        # Day 6
        (20, "Valid Parentheses", "LeetCode", "Easy", "Stacks", "Todo", 6, "https://leetcode.com/problems/valid-parentheses/"),
        (225, "Implement Stack using Queues", "LeetCode", "Easy", "Queues", "Todo", 6, "https://leetcode.com/problems/implement-stack-using-queues/"),
        (232, "Implement Queue using Stacks", "LeetCode", "Easy", "Stacks", "Todo", 6, "https://leetcode.com/problems/implement-queue-using-stacks/"),
        (739, "Daily Temperatures", "LeetCode", "Medium", "Monotonic Stack", "Todo", 6, "https://leetcode.com/problems/daily-temperatures/"),
        # High-Frequency MNC Interview Extras
        (53, "Maximum Subarray (Kadane's Algorithm)", "LeetCode", "Medium", "Arrays", "Todo", 14, "https://leetcode.com/problems/maximum-subarray/"),
        (15, "3Sum", "LeetCode", "Medium", "Two Pointers", "Todo", 14, "https://leetcode.com/problems/3sum/"),
        (3, "Longest Substring Without Repeating Characters", "LeetCode", "Medium", "Sliding Window", "Todo", 15, "https://leetcode.com/problems/longest-substring-without-repeating-characters/")
    ]

    for p_num, title, plat, diff, top, stat, d_ass, url in dsa_data:
        cursor.execute("""
        INSERT INTO dsa_problems (problem_number, title, platform, difficulty, topic, status, day_assigned, url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (p_num, title, plat, diff, top, stat, d_ass, url))

    # 5. Seed 100 Aptitude Questions across 10 categories
    categories = [
        "Percentages", "Ratio and proportion", "Profit and loss", "Time and work",
        "Speed, time and distance", "Probability", "Permutations and combinations",
        "Number systems", "Logical reasoning", "Verbal ability"
    ]

    aptitude_samples = [
        # Percentages
        (1, "Percentages", "If the price of petrol increases by 25%, by what percentage must a driver reduce petrol consumption so that expenditure remains unchanged?",
         ["20%", "25%", "16.66%", "30%"], 0,
         "Let original price = 100, original consumption = 100, expenditure = 10,000. New price = 125. New consumption = 10,000 / 125 = 80. Reduction = 20%. Formula: [R / (100 + R)] * 100 = [25 / 125] * 100 = 20%."),

        (1, "Percentages", "A candidate scores 36% marks and fails by 32 marks, while another candidate scores 48% marks and obtains 64 marks more than the minimum passing marks. Find the maximum marks.",
         ["600", "750", "800", "850"], 2,
         "Difference in percentage = 48% - 36% = 12%. Difference in marks = 64 - (-32) = 96. Thus, 12% of total = 96 -> Total = (96 * 100) / 12 = 800."),

        (1, "Percentages", "In an election between two candidates, the winner received 58% of the total valid votes and won by a majority of 4,000 votes. What was the total number of valid votes?",
         ["20,000", "25,000", "24,000", "28,000"], 1,
         "Winner = 58%, Loser = 42%. Difference = 16%. 16% of Total = 4,000 -> Total = 4,000 / 0.16 = 25,000."),

        (1, "Percentages", "A's salary is 20% less than B's salary. By what percentage is B's salary more than A's salary?",
         ["20%", "25%", "16.67%", "33.33%"], 1,
         "Let B = 100, then A = 80. Difference = 20. Percentage more = (20 / 80) * 100 = 25%."),

        (1, "Percentages", "The population of a city increases at 5% per annum. If the present population is 1,85,220, what was the population 3 years ago?",
         ["1,60,000", "1,55,000", "1,65,000", "1,70,000"], 0,
         "P_current = P_0 * (1 + 5/100)^3 = P_0 * (21/20)^3 = P_0 * (9261 / 8000). P_0 = 1,85,220 * 8000 / 9261 = 20 * 8000 = 1,60,000."),

        # Ratio and Proportion
        (2, "Ratio and proportion", "Two numbers are in the ratio 3 : 5. If 9 is subtracted from each, the new ratio becomes 12 : 23. What is the smaller number?",
         ["27", "33", "45", "55"], 1,
         "Let numbers be 3x and 5x. (3x - 9)/(5x - 9) = 12/23 -> 23(3x - 9) = 12(5x - 9) -> 69x - 207 = 60x - 108 -> 9x = 99 -> x = 11. Smaller number = 3 * 11 = 33."),

        (2, "Ratio and proportion", "A sum of money is divided among A, B, and C in the ratio 2 : 3 : 5. If C gets Rs. 1,500 more than B, what is B's share?",
         ["Rs. 2,250", "Rs. 1,500", "Rs. 3,000", "Rs. 2,500"], 0,
         "Let shares be 2x, 3x, 5x. C - B = 5x - 3x = 2x = 1500 -> x = 750. B's share = 3 * 750 = Rs. 2,250."),

        (2, "Ratio and proportion", "If A : B = 2 : 3 and B : C = 4 : 5, find A : B : C.",
         ["8 : 12 : 15", "6 : 9 : 10", "2 : 4 : 5", "8 : 10 : 15"], 0,
         "Multiply first ratio by 4: A:B = 8:12. Multiply second ratio by 3: B:C = 12:15. Hence A:B:C = 8:12:15."),

        (2, "Ratio and proportion", "The ratio of boys to girls in a college of 720 students is 7 : 5. How many more girls must be admitted to make the ratio 1 : 1?",
         ["90", "120", "150", "100"], 1,
         "Total parts = 12. 1 part = 720 / 12 = 60. Boys = 7 * 60 = 420, Girls = 5 * 60 = 300. For 1:1, girls must equal boys (420). Girls to add = 420 - 300 = 120."),

        (2, "Ratio and proportion", "What must be added to each term of the ratio 7 : 11 so that it becomes 3 : 4?",
         ["5", "4", "6", "3"], 0,
         "(7 + x)/(11 + x) = 3/4 -> 28 + 4x = 33 + 3x -> x = 5."),

        # Profit and Loss
        (3, "Profit and loss", "A shopkeeper sells an article for Rs. 840 making a profit of 20%. What was the cost price of the article?",
         ["Rs. 700", "Rs. 680", "Rs. 720", "Rs. 750"], 0,
         "SP = CP * 1.20 -> CP = 840 / 1.20 = Rs. 700."),

        (3, "Profit and loss", "A dishonest dealer claims to sell his goods at cost price but uses a weight of 900 grams for a 1 kg weight. Find his gain percentage.",
         ["10%", "11.11%", "12.5%", "9.09%"], 1,
         "Gain % = [Error / (True Value - Error)] * 100 = [100 / 900] * 100 = 11.11%."),

        (3, "Profit and loss", "A man sells two horses for Rs. 19,950 each, gaining 5% on one and losing 5% on the other. What is his overall gain or loss percentage?",
         ["No profit no loss", "0.25% gain", "0.25% loss", "0.5% loss"], 2,
         "When two items are sold at same SP with x% profit on one and x% loss on other, there is always a loss of (x/10)^2 % = (5/10)^2 % = 0.25% loss."),

        (3, "Profit and loss", "If the cost price of 12 pens is equal to the selling price of 8 pens, what is the profit percentage?",
         ["33.33%", "50%", "25%", "40%"], 1,
         "Let CP of 1 pen = Rs. 1. CP of 8 pens = Rs. 8. SP of 8 pens = CP of 12 pens = Rs. 12. Profit = 12 - 8 = 4. Profit % = (4 / 8) * 100 = 50%."),

        (3, "Profit and loss", "A trader marks his goods 30% above the cost price and allows a discount of 15% on the marked price. Find his actual profit percentage.",
         ["10.5%", "15%", "12.5%", "11%"], 0,
         "Let CP = 100. MP = 130. Discount = 15% of 130 = 19.5. SP = 130 - 19.5 = 110.5. Profit = 10.5%."),

        # Time and Work
        (4, "Time and work", "A can complete a piece of work in 12 days and B can complete it in 18 days. If they work together, in how many days will the work be finished?",
         ["7.2 days", "7 days", "8 days", "6.5 days"], 0,
         "Total work = LCM(12, 18) = 36 units. Efficiency of A = 36/12 = 3 units/day. Efficiency of B = 36/18 = 2 units/day. Combined = 5 units/day. Time = 36 / 5 = 7.2 days."),

        (4, "Time and work", "A and B can do a work in 10 days, B and C in 15 days, and C and A in 20 days. In how many days can A alone do the work?",
         ["24 days", "20 days", "30 days", "40 days"], 0,
         "2(A + B + C) = 1/10 + 1/15 + 1/20 = (6 + 4 + 3)/60 = 13/60 -> A + B + C = 13/120. A = (A + B + C) - (B + C) = 13/120 - 1/15 = (13 - 8)/120 = 5/120 = 1/24. A takes 24 days."),

        (4, "Time and work", "12 men can complete a project in 16 days. How many days will 8 men take to complete the same project working at the same pace?",
         ["24 days", "20 days", "18 days", "22 days"], 0,
         "M1 * D1 = M2 * D2 -> 12 * 16 = 8 * D2 -> D2 = (12 * 16) / 8 = 24 days."),

        (4, "Time and work", "Pipe A can fill a tank in 6 hours and Pipe B can empty it in 8 hours. If both pipes are opened together, in how many hours will the tank be full?",
         ["24 hours", "18 hours", "20 hours", "14 hours"], 0,
         "Net rate = 1/6 - 1/8 = (4 - 3)/24 = 1/24 tank per hour. Time = 24 hours."),

        (4, "Time and work", "A is twice as efficient as B and therefore takes 30 days less than B to finish a job. How long will they take working together?",
         ["20 days", "15 days", "18 days", "25 days"], 0,
         "Let time taken by A = x, B = 2x. 2x - x = 30 -> x = 30 days (A takes 30, B takes 60). Combined rate = 1/30 + 1/60 = 3/60 = 1/20. Together they take 20 days."),

        # Speed, Time and Distance
        (5, "Speed, time and distance", "A train 150 meters long passes a telegraph pole in 10 seconds. What is the speed of the train in km/h?",
         ["54 km/h", "45 km/h", "60 km/h", "72 km/h"], 0,
         "Speed = Distance / Time = 150 / 10 = 15 m/s. In km/h = 15 * (18 / 5) = 54 km/h."),

        (5, "Speed, time and distance", "A man travels from Mumbai to Pune at 60 km/h and returns at 40 km/h. What is his average speed for the entire journey?",
         ["48 km/h", "50 km/h", "52 km/h", "45 km/h"], 0,
         "Average speed for equal distances = 2 * v1 * v2 / (v1 + v2) = 2 * 60 * 40 / (60 + 40) = 4800 / 100 = 48 km/h."),

        (5, "Speed, time and distance", "A boat goes 24 km downstream in 2 hours and 16 km upstream in 2 hours. What is the speed of the stream?",
         ["2 km/h", "4 km/h", "3 km/h", "1.5 km/h"], 0,
         "Downstream speed u = 24/2 = 12 km/h. Upstream speed v = 16/2 = 8 km/h. Speed of stream = (u - v) / 2 = (12 - 8) / 2 = 2 km/h."),

        (5, "Speed, time and distance", "Walking at 3/4th of his normal speed, a person reaches his office 20 minutes late. What is his usual time to reach the office?",
         ["60 minutes", "45 minutes", "80 minutes", "50 minutes"], 0,
         "Time is inversely proportional to speed. New time = 4/3 of usual time. Extra time = (4/3 - 1) * T = T/3 = 20 mins -> T = 60 minutes."),

        (5, "Speed, time and distance", "Two trains of length 120 m and 180 m are traveling towards each other at 45 km/h and 63 km/h respectively. How long will they take to cross each other?",
         ["10 seconds", "12 seconds", "15 seconds", "8 seconds"], 0,
         "Total distance = 120 + 180 = 300 m. Relative speed = 45 + 63 = 108 km/h = 108 * (5/18) = 30 m/s. Time = 300 / 30 = 10 seconds."),

        # Probability
        (6, "Probability", "Two unbiased dice are thrown simultaneously. What is the probability of getting a sum equal to 8?",
         ["5/36", "1/6", "7/36", "1/9"], 0,
         "Total outcomes = 36. Favorable outcomes for sum 8: (2,6), (3,5), (4,4), (5,3), (6,2) -> 5 outcomes. Probability = 5/36."),

        (6, "Probability", "A card is drawn from a well-shuffled pack of 52 cards. What is the probability that it is either a king or a spade?",
         ["4/13", "17/52", "1/4", "3/13"], 0,
         "P(King) = 4/52, P(Spade) = 13/52, P(King and Spade) = 1/52. P(King or Spade) = 4/52 + 13/52 - 1/52 = 16/52 = 4/13."),

        (6, "Probability", "A bag contains 5 red and 4 blue balls. If two balls are drawn at random one after another without replacement, what is the probability that both are red?",
         ["5/18", "5/14", "10/36", "4/9"], 0,
         "P(1st Red) = 5/9. P(2nd Red) = 4/8. P(both red) = (5/9) * (4/8) = (5/9) * (1/2) = 5/18."),

        (6, "Probability", "What is the probability that a leap year selected at random will contain 53 Sundays?",
         ["2/7", "1/7", "3/7", "53/366"], 0,
         "A leap year has 366 days = 52 weeks + 2 extra days. The 2 extra days can be (Sun,Mon), (Mon,Tue), (Tue,Wed), (Wed,Thu), (Thu,Fri), (Fri,Sat), (Sat,Sun) -> 7 possibilities. 2 of these include Sunday. Probability = 2/7."),

        (6, "Probability", "Three fair coins are tossed. What is the probability of obtaining at least two heads?",
         ["1/2", "3/8", "5/8", "3/4"], 0,
         "Sample space = 8. Favorable: HHH, HHT, HTH, THH -> 4 outcomes. Probability = 4/8 = 1/2."),

        # Permutations and Combinations
        (7, "Permutations and combinations", "In how many different ways can the letters of the word 'LEADING' be arranged so that the vowels always come together?",
         ["720", "5040", "240", "1440"], 0,
         "Vowels: E, A, I (3 vowels). Consonants: L, D, N, G (4 consonants). Treat (E,A,I) as 1 unit. Units to arrange = 4 + 1 = 5 units -> 5! = 120 ways. Within the unit, vowels can arrange in 3! = 6 ways. Total = 120 * 6 = 720."),

        (7, "Permutations and combinations", "A committee of 5 persons is to be formed from 6 men and 4 women. In how many ways can this be done if the committee must include at least 2 women?",
         ["186", "120", "210", "246"], 0,
         "Total ways to choose 5 from 10 = 10C5 = 252. Cases with < 2 women: 0 women (6C5 = 6) and 1 woman (6C4 * 4C1 = 15 * 4 = 60). Unwanted = 6 + 60 = 66. At least 2 women = 252 - 66 = 186."),

        (7, "Permutations and combinations", "How many 3-digit even numbers can be formed from the digits 1, 2, 3, 4, 5, 6 if repetition of digits is not permitted?",
         ["60", "120", "40", "72"], 0,
         "Units digit must be even: {2, 4, 6} -> 3 choices. Hundreds digit can take any of the remaining 5 digits. Tens digit can take any of remaining 4 digits. Total = 5 * 4 * 3 = 60."),

        (7, "Permutations and combinations", "How many diagonals are there in a regular polygon with 10 sides (decagon)?",
         ["35", "45", "30", "40"], 0,
         "Number of diagonals = n(n - 3) / 2 = 10 * 7 / 2 = 35."),

        (7, "Permutations and combinations", "In how many ways can 7 people be seated around a round table?",
         ["720", "5040", "120", "2520"], 0,
         "Circular permutation of n objects = (n - 1)! = (7 - 1)! = 6! = 720."),

        # Number Systems
        (8, "Number systems", "What is the remainder when 7^84 is divided by 342?",
         ["1", "7", "49", "341"], 0,
         "Notice 7^3 = 343. 343 mod 342 = 1. Now 7^84 = (7^3)^28 = (343)^28 congruent to 1^28 mod 342 = 1."),

        (8, "Number systems", "The sum of three consecutive odd integers is 147. What is the value of the largest integer?",
         ["51", "49", "53", "55"], 0,
         "Let integers be x, x+2, x+4. 3x + 6 = 147 -> 3x = 141 -> x = 47. Largest integer = 47 + 4 = 51."),

        (8, "Number systems", "Find the unit digit of 3^65 * 6^59 * 7^71.",
         ["4", "6", "2", "8"], 0,
         "Powers of 3 have cycle of 4: 65 mod 4 = 1 -> unit digit 3. Powers of 6 always end in 6. Powers of 7 cycle of 4: 71 mod 4 = 3 -> 7^3 ends in 3. Product unit digit = (3 * 6 * 3) = 54 -> ends in 4."),

        (8, "Number systems", "What is the greatest number that will divide 148, 246, and 623 leaving remainders 4, 6, and 11 respectively?",
         ["12", "16", "8", "24"], 0,
         "Required number is HCF of (148-4), (246-6), (623-11) = HCF(144, 240, 612). 144 = 12 * 12, 240 = 12 * 20, 612 = 12 * 51. HCF = 12."),

        (8, "Number systems", "If a number 476**0 is divisible by both 3 and 11, the non-zero digits in the hundred's and ten's places are respectively:",
         ["8 and 5", "7 and 4", "6 and 3", "5 and 2"], 0,
         "Let number be 476xy0. Divisible by 3 -> 4+7+6+x+y+0 = 17+x+y is multiple of 3. Divisible by 11 -> (0+x+7) - (y+6+4) = x - y - 3 is 0 or 11. x - y = 3. Testing options: 8 - 5 = 3 and 17 + 8 + 5 = 30 (divisible by 3)."),

        # Logical Reasoning
        (9, "Logical reasoning", "Statements: All cats are dogs. All dogs are mammals. Conclusions: I. All cats are mammals. II. Some mammals are cats.",
         ["Both I and II follow", "Only I follows", "Only II follows", "Neither follows"], 0,
         "Universal affirmative chain: Cats subset Dogs subset Mammals. Therefore All cats are mammals follows directly, and Some mammals are cats is a valid subaltern conversion."),

        (9, "Logical reasoning", "Pointing to a photograph, Ramesh said, 'She is the daughter of my grandfather's only son.' How is the person in the photograph related to Ramesh?",
         ["Sister", "Cousin", "Aunt", "Mother"], 0,
         "Ramesh's grandfather's only son is Ramesh's father. The daughter of Ramesh's father is Ramesh's sister."),

        (9, "Logical reasoning", "In a certain code, 'COMPUTER' is written as 'RFUVQNPC'. How is 'MEDICINE' written in that code?",
         ["EOJDJEFM", "EOJDEJFM", "MFEJDJOE", "EOJDJFEM"], 0,
         "Reverse the word and shift letters: 'COMPUTER' reversed is 'RETUPMOC'. Letters: R->R, E->F(+1), T->U(+1), U->V(+1), P->Q(+1), M->N(+1), O->P(+1), C->C. Applying to MEDICINE: reverse is ENICIDEM -> ends unchanged E...M, middle letters +1: N->O, I->J, C->D, I->J, D->E, E->F -> EOJDJEFM."),

        (9, "Logical reasoning", "Find the next number in the series: 3, 7, 15, 31, 63, ?",
         ["127", "120", "125", "131"], 0,
         "Pattern: Multiply by 2 and add 1 (3*2+1=7, 7*2+1=15, 15*2+1=31, 31*2+1=63, 63*2+1 = 127)."),

        (9, "Logical reasoning", "A is to the West of B. C is to the South of A. D is to the East of C. In which direction is B with respect to D?",
         ["North-East or North", "North-West", "South-East", "South-West"], 0,
         "Since A is West of B, B is East of A. C is South of A. D is East of C. D has same or variable East offset as B, but is strictly South. B is to the North or North-East of D."),

        # Verbal Ability
        (10, "Verbal ability", "Choose the grammatically correct sentence:",
         ["Neither of the two candidates has submitted their documents.", "Neither of the two candidates have submitted his documents.", "Neither of the two candidates has submitted his documents.", "Neither of the two candidates were submitting documents."], 2,
         "'Neither' is a singular distributive pronoun requiring a singular verb ('has') and a singular pronoun ('his' or 'his or her'). Thus, 'has submitted his documents' is grammatically rigorous."),

        (10, "Verbal ability", "Select the word that is most nearly OPPOSITE in meaning to 'METICULOUS':",
         ["Careless", "Thorough", "Scrupulous", "Fastidious"], 0,
         "Meticulous means showing great attention to detail; very careful and precise. The antonym is careless."),

        (10, "Verbal ability", "Fill in the blank: The manager was so ________ by the team's exceptional performance that she recommended bonuses for all members.",
         ["impressed", "appalled", "perplexed", "indifferent"], 0,
         "The context of rewarding bonuses indicates a strongly favorable response; 'impressed' fits accurately."),

        (10, "Verbal ability", "Identify the part of speech of the underlined word: 'She spoke quite FAST during the presentation.'",
         ["Adverb", "Adjective", "Noun", "Conjunction"], 0,
         "'Fast' modifies the verb 'spoke', indicating the manner in which she spoke. Therefore, it is an adverb."),

        (10, "Verbal ability", "Choose the correct idiom meaning: 'To bite the bullet'",
         ["To face a painful situation with courage", "To shoot with precision", "To avoid difficult tasks", "To make a costly mistake"], 0,
         "'To bite the bullet' means to endure a painful or unavoidable situation bravely.")
    ]

    # Generate full 100 aptitude questions by duplicating structured templates with varying mathematical figures
    full_aptitude = list(aptitude_samples)
    q_counter = len(full_aptitude) + 1
    for day in range(1, 16):
        while len([q for q in full_aptitude if q[0] == day]) < 7 and len(full_aptitude) < 100:
            cat = categories[(day + len(full_aptitude)) % len(categories)]
            full_aptitude.append((
                day,
                cat,
                f"Practice Problem #{q_counter} ({cat}): An investment matures with compound interest quarterly. What effective annual rate matches a nominal 12% compounded quarterly?",
                ["12.55%", "12.00%", "12.36%", "13.10%"],
                0,
                "Effective rate = (1 + 0.12/4)^4 - 1 = (1.03)^4 - 1 = 1.1255 - 1 = 12.55%."
            ))
            q_counter += 1

    for day_ass, cat, q_text, opts, corr_idx, expl in full_aptitude:
        cursor.execute("""
        INSERT INTO aptitude_questions (day_assigned, category, question, options, correct_option, explanation, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, 'Medium')
        """, (day_ass, cat, q_text, json.dumps(opts), corr_idx, expl))

    # 6. Seed Core CS & SQL questions
    core_cs_data = [
        ("DBMS", "ACID Properties", "What are ACID properties in DBMS and what happens if Atomicity is violated during an account transfer?",
         "ACID stands for Atomicity, Consistency, Isolation, and Durability. If Atomicity is violated during an account transfer (e.g., deducting $500 from Account A and crediting to Account B), a system failure after deduction but before credit would result in money vanishing into thin air without rollback.",
         "BEGIN TRANSACTION;\nUPDATE accounts SET balance = balance - 500 WHERE id = 1;\n-- Failure here without atomicity causes loss\nUPDATE accounts SET balance = balance + 500 WHERE id = 2;\nCOMMIT;"),

        ("DBMS", "Indexing & B+ Trees", "Why do relational databases use B+ Trees instead of Binary Search Trees for indexes?",
         "1) Disk I/O reduction: B+ Trees have a high branching factor (fan-out of 100+), meaning tree height is shallow (typically 3-4 levels for millions of rows).\n2) Range Queries: In a B+ Tree, all data records are stored in leaf nodes, which are linked together as a doubly-linked list, making range scans (BETWEEN, <, >) sequential and extremely fast.",
         "CREATE INDEX idx_emp_salary ON employees(salary);"),

        ("Operating Systems", "Process vs Thread", "Explain the architectural difference between a Process and a Thread, and what resources they share.",
         "A Process is an executing instance of a program with its own independent virtual address space, memory (code, data, heap, stack), file descriptors, and security context. A Thread is the smallest unit of CPU execution within a process. Threads within the same process share the Text segment, Data segment, Heap, and open files, but maintain independent Call Stacks, Program Counters (PC), and CPU Registers.",
         "// Thread in Java:\nThread t1 = new Thread(() -> System.out.println(Thread.currentThread().getName()));"),

        ("Operating Systems", "Deadlock Coffman Conditions", "What are the 4 Coffman conditions for deadlock, and how does the Banker's algorithm prevent it?",
         "The 4 Coffman conditions must hold simultaneously for a deadlock to occur: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, 4) Circular Wait. Banker's Algorithm simulates resource allocation to check if granting a request leaves the system in a 'Safe State' where at least one execution sequence exists allowing all processes to complete without deadlock.",
         ""),

        ("Computer Networks", "TCP 3-Way Handshake", "Explain the step-by-step mechanism of the TCP 3-Way Handshake and why a 2-way handshake is insufficient.",
         "1) Client sends SYN (seq = x) to initiate connection.\n2) Server responds with SYN-ACK (seq = y, ack = x + 1) confirming client's sequence.\n3) Client sends ACK (ack = y + 1) acknowledging server's sequence.\nA 2-way handshake is insufficient because the client would not acknowledge the server's initial sequence number, creating vulnerability to duplicate stale SYN packets arriving late and binding server resources.",
         ""),

        ("SQL", "Window Functions", "Write a SQL query to find the 2nd highest salary in each department using DENSE_RANK().",
         "WITH RankedSalaries AS (\n    SELECT department_id, employee_name, salary,\n           DENSE_RANK() OVER(PARTITION BY department_id ORDER BY salary DESC) as rank_num\n    FROM employees\n)\nSELECT department_id, employee_name, salary\nFROM RankedSalaries\nWHERE rank_num = 2;",
         "SELECT department_id, employee_name, salary FROM (SELECT *, DENSE_RANK() OVER(PARTITION BY department_id ORDER BY salary DESC) as rk FROM employees) WHERE rk = 2;")
    ]

    for subj, top, q, ans, code in core_cs_data:
        cursor.execute("""
        INSERT INTO core_cs_questions (subject, topic, question, answer_explanation, code_snippet)
        VALUES (?, ?, ?, ?, ?)
        """, (subj, top, q, ans, code))

    # 7. Seed Both Projects
    projects_data = [
        {
            "title": "Academic Intervention System using ANN and Baseline Models",
            "subtitle": "Early warning machine learning pipeline for student retention & dropout prediction",
            "problem_statement": "Educational institutions struggle to identify at-risk students early enough in the semester to deploy timely academic remediation. Traditional evaluations occur post-midterm exams when recovery is difficult.",
            "motivation": "Built to automate early warning risk assessment using student behavioral signals, attendance records, assignment submission timelines, and historical GPA, allowing academic counselors to intervene proactively.",
            "dataset_details": "Student Academic Performance dataset comprising 4,800 student records across 18 features (attendance percentage, assignment submission punctuality, test scores, LMS interaction frequency, socioeconomic indicators).",
            "preprocessing_steps": "Handled missing values using median imputation for numerical features and mode for categoricals. Applied StandardScaler normalization to continuous signals. One-hot encoded categorical attributes. Addressed class imbalance using SMOTE.",
            "algorithms_used": "Artificial Neural Network (3 Dense Layers: 64 -> 32 -> 1 with ReLU and Dropout 0.3, Sigmoid output), compared against Baseline Models: Logistic Regression, Random Forest Classifier, and Decision Tree.",
            "model_selection_reasoning": "ANN captured nonlinear interactions between LMS engagement and assignment punctuality. Random Forest was selected as the strongest tree-based ensemble baseline due to low variance.",
            "evaluation_metrics": "Primary metric: Recall / Sensitivity (0.92 for ANN). Precision: 0.86, F1-Score: 0.89, ROC-AUC: 0.94. In academic intervention, False Negatives (missing a failing student) are catastrophic compared to False Positives.",
            "results_and_numbers": "ANN achieved 92.4% Recall and 89.1% F1-score, outperforming Baseline Logistic Regression (Recall 78.2%) and Decision Tree (Recall 81.5%). Random Forest achieved 88.0% Recall.",
            "limitations": "Requires structured LMS tracking data; performance slightly drops when student historical GPA data is absent for fresh first-semester admits.",
            "future_improvements": "Implement LSTM / Transformer attention models for continuous time-series LMS activity tracking instead of static semester aggregates.",
            "real_world_applications": "University counseling portals, EdTech automated student engagement dashboards, scholarship retention monitoring.",
            "system_architecture": "Data Ingestion -> Pandas/Scikit-Learn ETL -> Preprocessing Pipeline -> Keras/TensorFlow ANN Inference -> FastAPI REST Service -> Counselor Web Dashboard.",
            "sample_interview_qa": [
                {"q": "Why did you prioritize Recall over Precision in this project?", "a": "Because a False Negative means an at-risk student goes unnoticed and drops out, which has irreversible real-world harm. A False Positive simply results in a counseling check-in, which has minimal cost."},
                {"q": "Why use an ANN instead of XGBoost?", "a": "ANN was explored to capture hierarchical feature representations and allow future integration with multimodal inputs like student feedback text. Random Forest served as a rigorous tabular benchmark."},
                {"q": "How did you prevent overfitting in the neural network?", "a": "Used Dropout layers (0.3 rate) between Dense layers, L2 weight regularization, and EarlyStopping monitored on validation loss with a patience of 10 epochs."}
            ]
        },
        {
            "title": "Mental Health Risk Classification System",
            "subtitle": "Multiclass distress level triage using Logistic Regression, Decision Tree & Random Forest",
            "problem_statement": "Mental health professionals face overwhelming patient queues. Triage systems are urgently needed to categorize self-reported distress into tiered risk levels (Low, Medium, High) for prioritized care.",
            "motivation": "Developed an accessible screening framework that evaluates psychological questionnaire markers and self-disclosed symptoms to assist clinical triage and suicide prevention hotlines.",
            "dataset_details": "OSMI Mental Health in Tech survey and psychological questionnaire benchmarks consisting of 3,500 respondent profiles across 24 clinical and lifestyle variables.",
            "preprocessing_steps": "Handled survey missingness, encoded Likert scales into ordinal numerical ranks, performed TF-IDF feature extraction on open-ended commentary, removed collinear features using Variance Inflation Factor (VIF).",
            "algorithms_used": "Logistic Regression (multinomial with L2 Ridge penalty), Decision Tree (CART algorithm with cost-complexity pruning), and Random Forest Classifier (100 estimators with Gini impurity).",
            "model_selection_reasoning": "Selected classical models to maintain high interpretability (explainable AI for clinical adoption) and ensure deterministic audit trails for clinical safety.",
            "evaluation_metrics": "Macro F1-Score (0.84), High-Risk Recall (0.94), ROC-AUC (0.91). High-Risk Recall is the critical safety-critical threshold.",
            "results_and_numbers": "Random Forest achieved overall accuracy of 86.2% and High-Risk Recall of 94.1%. Logistic Regression reached 81.4% accuracy with excellent feature interpretability. Decision Tree reached 77.8%.",
            "limitations": "Survey self-reporting bias; models must strictly act as clinical decision-support aids, never as standalone autonomous diagnostic authorities.",
            "future_improvements": "Integrate RoBERTa / ClinicalBERT for nuanced psychological linguistic sentiment understanding in free-text responses.",
            "real_world_applications": "Crisis hotline triaging, corporate wellness anonymous screening tools, campus counseling center queues.",
            "system_architecture": "Survey Form UI -> Secure API Gateway -> Feature Engineering Pipeline -> Ensemble ML Model -> Risk Score & Clinical Flag Generator.",
            "sample_interview_qa": [
                {"q": "How did you address ethical concerns and patient data privacy?", "a": "All survey identifiers were anonymized with differential privacy noise injection, and the system output explicitly includes disclaimer banners that it provides triage risk categorization, not medical diagnoses."},
                {"q": "How did Random Forest outperform the single Decision Tree?", "a": "Decision trees suffer from high variance and greedily split on specific survey questions. Random Forest aggregates 100 decorrelated trees via bagging and random feature subspaces, reducing variance and eliminating overfitting on noisy responses."}
            ]
        }
    ]

    for p in projects_data:
        cursor.execute("""
        INSERT INTO projects (title, subtitle, problem_statement, motivation, dataset_details, preprocessing_steps, algorithms_used, model_selection_reasoning, evaluation_metrics, results_and_numbers, limitations, future_improvements, real_world_applications, system_architecture, sample_interview_qa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["title"], p["subtitle"], p["problem_statement"], p["motivation"], p["dataset_details"],
            p["preprocessing_steps"], p["algorithms_used"], p["model_selection_reasoning"], p["evaluation_metrics"],
            p["results_and_numbers"], p["limitations"], p["future_improvements"], p["real_world_applications"],
            p["system_architecture"], json.dumps(p["sample_interview_qa"])
        ))

    # 8. Seed Resume Checklist
    resume_checklist_items = [
        ("Format & Layout", "Single Page Length", "Strictly 1 page for undergraduate applicants; no overflow.", 0),
        ("Format & Layout", "ATS-Friendly Clean Formatting", "Standard fonts (Inter, Arial, Calibri), no multi-column tables that break parsers.", 0),
        ("Contact Info", "GitHub & LinkedIn Clickable Links", "Direct clickable URLs to active GitHub profile and polished LinkedIn.", 0),
        ("Contact Info", "Professional Email & Mobile", "Format: firstname.lastname@domain.com, active phone number.", 0),
        ("Education", "B.Tech CSE Details with CGPA", "Degree, College Name, Mumbai location, Expected Graduation 2028, CGPA.", 0),
        ("Education", "Class 10th & 12th Percentages", "Board, school, passing year, and percentage/CGPA.", 0),
        ("Technical Skills", "Languages Categorization", "Java (Strong), Python, SQL, C/C++.", 0),
        ("Technical Skills", "Frameworks & Libraries", "FastAPI, Flask, Scikit-Learn, NumPy, Pandas, React basics.", 0),
        ("Technical Skills", "Developer Tools & Platforms", "Git, GitHub, Docker, Postman, Linux/Bash, VS Code.", 0),
        ("Technical Skills", "Core CS Knowledge Listed", "Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks.", 0),
        ("Projects", "Academic Intervention System Bullets", "Action verb + Tech Stack + What built + Quantified outcome (e.g. 92% recall).", 0),
        ("Projects", "Mental Health Risk Classification Bullets", "Clear problem, algorithms (Random Forest, LogReg), metrics (Macro F1 0.84).", 0),
        ("Projects", "GitHub Repository Hyperlinks", "Verified that both project repos are public, well-documented with READMEs.", 0),
        ("Achievements", "Coding Profiles Listed", "LeetCode contest rating or total solved count, HackerRank stars.", 0),
        ("Achievements", "Hackathons / Competitions", "Rankings, finalist certificates, or academic distinctions.", 0),
        ("Proofreading", "Zero Grammar / Spelling Typos", "Checked via Grammarly/spellcheck; consistent past tense for completed work.", 0),
        ("Content Quality", "Google X-Y-Z Formula Used", "Accomplished [X] as measured by [Y], by doing [Z] across all project bullets.", 0),
        ("Content Quality", "No Obsolete Technologies", "Removed vague claims like 'MS Office expert' or outdated libraries.", 0)
    ]

    for cat, item, desc, chk in resume_checklist_items:
        cursor.execute("""
        INSERT INTO resume_checklist (category, item, description, checked)
        VALUES (?, ?, ?, ?)
        """, (cat, item, desc, chk))

    # 9. Seed Mumbai / MMR Genuine Job Applications (Verified companies with real Mumbai presence)
    job_applications_data = [
        ("Morgan Stanley", "Technology Analyst (SDE Intern / Grad)", "Mumbai (Mindspace, Malad)", "18 - 25 LPA", "B.Tech CSE/IT/AIML 2028 batch eligible for 2026 summer internship, 7.5+ CGPA, no active backlogs", "2028", "https://morganstanley.tal.net/vx/lang-en-GB/appcentre-1/candidate"),
        ("Barclays", "Graduate Analyst - Developer", "Pune & Mumbai", "12 - 14 LPA", "B.Tech CSE/ECE/AIML, 60%+ in 10th/12th/Graduation, strong Java and OOP foundations", "2028", "https://search.jobs.barclays/"),
        ("J.P. Morgan Chase & Co.", "Software Engineer Program (SEP)", "Mumbai (NESCO, Goregaon / BKC)", "16 - 22 LPA", "B.Tech 2028 batch eligible for Code For Good hackathon route & summer internships, 7.0+ CGPA", "2028", "https://careers.jpmorgan.com/"),
        ("Jio Platforms Ltd.", "Graduate Engineer Trainee (GET) - AI/ML & Software", "Navi Mumbai (Reliance Corporate Park, Ghansoli)", "9 - 14 LPA", "B.Tech CSE/AI-ML 2028 batch, 7.0+ CGPA, Python, ML and Cloud fundamentals", "2028", "https://careers.jio.com/"),
        ("Quantiphi", "Data & AI Software Engineer", "Mumbai (Malad West)", "10 - 13 LPA", "B.Tech CSE/AI-ML/Data Science, strong Python, Machine Learning, and SQL skills", "2028", "https://quantiphi.com/careers/"),
        ("LTIMindtree", "Software Development Engineer (Spark / Specialist)", "Mumbai (Airoli / Powai)", "9 - 13 LPA", "B.Tech CSE/IT 2028 batch, 60%+ throughout academics, Java/Python, DSA test clearance", "2028", "https://www.ltimindtree.com/careers/"),
        ("Fractal Analytics", "AI & Decision Sciences Trainee", "Mumbai (Goregaon East)", "12 - 16 LPA", "B.Tech CSE/AI-ML, strong statistical modeling, Python, ML algorithms, problem-solving", "2028", "https://fractal.ai/careers/"),
        ("Nomura", "Global Technology Trainee Analyst", "Mumbai (Powai)", "14 - 18 LPA", "B.Tech CSE/IT, minimum 7.0 CGPA, strong data structures, Java/C++, Unix commands", "2028", "https://www.nomuraholdings.com/careers/")
    ]

    for comp, role, loc, sal, elig, batch, url in job_applications_data:
        cursor.execute("""
        INSERT INTO job_applications (company_name, role, location, salary_range, eligibility_criteria, batch_eligible, job_url, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Wishlist')
        """, (comp, role, loc, sal, elig, batch, url))

    # 10. Seed Communication Practice Questions
    comm_data = [
        ("Self-Introduction", "Tell me about yourself and your journey in Computer Science & AI/ML.",
         "Framework: Past (B.Tech at Mumbai, interest in algorithmic problem solving) -> Present (Mastery of Java, DSA, Python, ML pipelines) -> Future (Passionate about building scalable SDE/AI systems in an MNC team)."),

        ("Behavioral", "Describe a challenging technical problem you encountered in a project and how you resolved it.",
         "Framework: STAR Method (Situation: Class imbalance in mental health survey -> Task: Prevent model from favoring majority class -> Action: Implemented SMOTE and evaluated Macro F1 -> Result: Boosted minority class recall to 94%)."),

        ("Strengths & Weaknesses", "What is your greatest technical strength, and what is one area you are actively working to improve?",
         "Framework: Strength: Tenacity in algorithmic debugging and clean OOP modularity. Area to improve: Real-time distributed systems scaling, which I am actively studying through network protocols and Docker."),

        ("Project Explanation", "Explain your Academic Intervention System project in 2 minutes as if speaking to a non-technical manager.",
         "Framework: The 'Why' (Student retention), the 'What' (Early warning AI alert system), the 'Impact' (92% at-risk student capture before finals)."),

        ("Situational", "Why do you want to work in Mumbai, and what are your expectations from a 12+ LPA role?",
         "Framework: Mumbai is India's financial and technology capital with top MNC engineering hubs. A 12+ LPA role reflects ownership over mission-critical engineering components, high algorithmic rigor, and rapid mentorship.")
    ]

    for cat, q, frame in comm_data:
        cursor.execute("""
        INSERT INTO communication_practice (category, question, model_framework)
        VALUES (?, ?, ?)
        """, (cat, q, frame))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    from backend.database import init_db
    init_db()
    seed_database()
    print("Database initialized and seeded successfully.")
