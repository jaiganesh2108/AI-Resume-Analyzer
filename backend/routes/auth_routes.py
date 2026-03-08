from fastapi import APIRouter, HTTPException
from database import users
from auth import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/signup")
def signup(user:dict):
    email = user.get("email")
    password = user.get("password")

    if not isinstance(email, str) or not isinstance(password, str) or not email.strip() or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    existing = users.find_one({"email": email})

    if existing:
        raise HTTPException(status_code=409, detail="User already exists")
    
    hashed = hash_password(password)
    users.insert_one({
        "email": email,
        "password": hashed
    })

    return {"message":"Signup successful"}


@router.post("/login")
def login(user: dict):
    email = user.get("email")
    password = user.get("password")

    if not isinstance(email, str) or not isinstance(password, str) or not email.strip() or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    existing = users.find_one({"email": email})
    if not existing or not verify_password(password, existing.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": email})
    return {"token": token}

