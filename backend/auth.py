import os

from passlib.context import CryptContext
from jose import jwt

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-in-env")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password):
    return pwd_context.hash(password)

def verify_password(password, hashed):
    return pwd_context.verify(password, hashed) 

def create_access_token(data):
    return jwt.encode(data, SECRET_KEY, algorithm="HS256")