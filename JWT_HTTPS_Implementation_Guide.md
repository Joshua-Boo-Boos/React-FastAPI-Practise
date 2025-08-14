# JWT Token Implementation & HTTPS Setup Guide

## Overview
This guide explains how to implement JWT (JSON Web Tokens) for authentication and HTTPS for secure communication in your FastAPI/React application.

## Part 1: JWT Token Implementation

### 1. Backend Changes (FastAPI)

#### Required Dependencies
```bash
pip install python-jose[cryptography] passlib[bcrypt] python-multipart
```

#### JWT Configuration (add to backend.py)
```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# JWT Configuration
SECRET_KEY = "your-secret-key-here"  # Use environment variable in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

#### Protected Route Example
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

@app.post("/api/protected-endpoint")
def protected_route(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    username = verify_token(token)
    return {"message": f"Hello {username}, you have access!"}
```

### 2. Frontend Changes (React)

#### JWT Storage & Management
```javascript
// Add to your existing code
const [token, setToken] = useState(localStorage.getItem('token'));

const loginWithJWT = async () => {
    const hashedUsername = SHA512(inputUsername + username_salt_for_hashes).toString();
    const hashedPassword = SHA512(inputPassword + password_salt_for_hashes).toString();
    
    const response = await fetch('http://127.0.0.1:8000/api/login-jwt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username: hashedUsername, password: hashedPassword})
    });
    
    const data = await response.json();
    if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setLoggedIn(true);
    }
};

// Add token to API calls
const getCurrentScore = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://127.0.0.1:8000/api/currentScore?username=${username}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    // ... rest of implementation
};
```

## Part 2: HTTPS Setup

### Certificate Generation (Development)
```bash
# Generate self-signed certificate for development
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

### Backend HTTPS Configuration
```python
import uvicorn

# Add to bottom of backend.py
if __name__ == "__main__":
    uvicorn.run(
        "backend:app",
        host="0.0.0.0",
        port=8000,
        ssl_keyfile="key.pem",
        ssl_certfile="cert.pem"
    )
```

### Frontend HTTPS Configuration
```javascript
// Update API URLs to use HTTPS
const API_BASE_URL = "https://localhost:8000";
```

## Part 3: HTTPS Architecture Explanation

### **Why HTTPS is needed on BOTH frontend and backend:**

#### **Backend (Required)**
- **Encrypts API communications** between client and server
- **Protects sensitive data** (passwords, tokens, scores)
- **Prevents man-in-the-middle attacks**
- **Required for JWT tokens** (tokens are sensitive credentials)

#### **Frontend (Required)**
- **Prevents mixed content warnings** (HTTPS page loading HTTP resources)
- **Enables secure cookies** (cookies only sent over HTTPS)
- **Allows service workers** (require HTTPS in production)
- **Enables modern web APIs** (many require HTTPS)

### **Architecture Flow:**
```
Client (HTTPS) ←→ Reverse Proxy (HTTPS) ←→ Backend (HTTPS)
     ↓              ↓                    ↓
Browser        Nginx/Apache          FastAPI
(React App)    (SSL Termination)     (Application)
```

### **Production Setup:**
```bash
# Production with reverse proxy (nginx)
# /etc/nginx/sites-available/your-app
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Part 4: Security Best Practices

### **Token Security**
- Store tokens in **httpOnly cookies** (not localStorage) for production
- Implement **token refresh** mechanism
- Set **appropriate expiration times**

### **HTTPS Security Headers**
```python
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

# Add security headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Restrict to HTTPS
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### **Environment Variables**
```bash
# .env file
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Implementation Checklist

### **Phase 1: JWT Implementation**
- [ ] Install required dependencies
- [ ] Add JWT configuration to backend.py
- [ ] Create login endpoint with token generation
- [ ] Add token verification middleware
- [ ] Update frontend to handle tokens
- [ ] Test token-based authentication

### **Phase 2: HTTPS Setup**
- [ ] Generate SSL certificates
- [ ] Configure FastAPI for HTTPS
- [ ] Update frontend URLs to HTTPS
- [ ] Test HTTPS communication
- [ ] Configure production reverse proxy

### **Phase 3: Security Hardening**
- [ ] Implement token refresh mechanism
- [ ] Add security headers
- [ ] Configure CORS properly
- [ ] Set up environment variables
- [ ] Test security measures

## Testing Commands

### **JWT Testing**
```bash
# Test login endpoint
curl -X POST https://localhost:8000/api/login-jwt \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Test protected endpoint
curl -X GET https://localhost:8000/api/protected \
  -H "Authorization: Bearer your-jwt-token"
```

### **HTTPS Testing**
```bash
# Test HTTPS connection
curl -k https://localhost:8000/docs
```

This guide provides the complete roadmap for implementing JWT authentication and HTTPS without modifying your existing code structure.
</result>
</attempt_completion>
