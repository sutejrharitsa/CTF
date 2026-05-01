import sqlite3
from contextlib import contextmanager

DB_NAME = "ctf.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Contest state
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS contest (
        id INTEGER PRIMARY KEY,
        is_active BOOLEAN NOT NULL DEFAULT 0,
        end_time DATETIME
    )
    ''')
    
    # Initialize contest state if empty
    cursor.execute('SELECT COUNT(*) FROM contest')
    if cursor.fetchone()[0] == 0:
        cursor.execute('INSERT INTO contest (id, is_active) VALUES (1, 0)')
        
    # Users (Students)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    ''')
    
    # Challenges (Questions)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS challenge (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        points INTEGER NOT NULL,
        flag TEXT NOT NULL,
        trim_spaces BOOLEAN NOT NULL DEFAULT 0,
        ignore_case BOOLEAN NOT NULL DEFAULT 0,
        file_path TEXT
    )
    ''')
    
    # Submissions
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS submission (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        challenge_id INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_correct BOOLEAN NOT NULL,
        FOREIGN KEY(user_id) REFERENCES user(id),
        FOREIGN KEY(challenge_id) REFERENCES challenge(id)
    )
    ''')
    
    conn.commit()
    conn.close()

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
