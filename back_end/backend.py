from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException
from pydantic import BaseModel
import sqlite3

class LoginRequest(BaseModel):
    username: str
    password: str

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

login_database_conn = sqlite3.connect('./login_database.db')
score_database_conn = sqlite3.connect('./score_database.db')

login_database_cursor = login_database_conn.cursor()
score_database_cursor = score_database_conn.cursor()

login_database_cursor.execute('CREATE TABLE IF NOT EXISTS login_details (username TEXT NOT NULL, password TEXT NOT NULL)')
login_database_conn.commit()
login_database_conn.close()

score_database_cursor.execute('CREATE TABLE IF NOT EXISTS scores (username TEXT NOT NULL, score INTEGER NOT NULL)')
score_database_conn.commit()
score_database_conn.close()

@app.post('/api/login')
def handle_login(request: LoginRequest):
    username = request.username
    password = request.password
    login_database_conn = sqlite3.connect('./login_database.db')
    login_database_cursor = login_database_conn.cursor()
    login_database_cursor.execute('SELECT * FROM login_details WHERE username = ? AND password = ?', (username, password))
    result = login_database_cursor.fetchone()
    if result:
        login_database_conn.close()
        return {'success': True}
    else:
        login_database_cursor.execute('SELECT * FROM login_details WHERE username = ?', (username,))
        result = login_database_cursor.fetchone()
        if result:
            login_database_conn.close()
            raise HTTPException(401, 'Incorrect password')
        else:
            login_database_cursor.execute('INSERT INTO login_details VALUES (?, ?)', (username, password))
            login_database_conn.commit()
            login_database_conn.close()
            return {'success': True}

@app.get('/api/currentScore')
def get_current_score(username: str):
    score_database_conn = sqlite3.connect('./score_database.db')
    score_database_cursor = score_database_conn.cursor()
    score_database_cursor.execute('SELECT * FROM scores WHERE username = ?', (username,))
    result = score_database_cursor.fetchone()
    if result:
        score_database_conn.close()
        return {'score': result[1]}
    else:
        score_database_cursor.execute('INSERT INTO scores VALUES (?, ?)', (username, 0))
        score_database_conn.commit()
        score_database_conn.close()
        return {'score': 0}

@app.post('/api/submitScore')
def update_score(username: int, newscore: int):
    score_database_conn = sqlite3.connect('./score_database.db')
    score_database_cursor = score_database_conn.cursor()
    result = score_database_cursor.execute('SELECT * FROM scores WHERE username = ?', (username,))
    if result:
        score_database_cursor.execute('UPDATE scores SET score = ? WHERE username = ?', (newscore, username))
        score_database_conn.commit()
        return {'success': True}
    else:
        return {'success': False}