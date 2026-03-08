import os
import hashlib

import bcrypt
from jose import jwt

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-in-env")

def _raw_password_bytes(password):
    if not isinstance(password, str):
        raise TypeError("Password must be a string")
    return password.encode("utf-8")


def _normalized_password_bytes(password):
    # SHA-256 pre-hash avoids bcrypt's 72-byte input limit.
    return hashlib.sha256(_raw_password_bytes(password)).hexdigest().encode("ascii")

def hash_password(password):
    hashed = bcrypt.hashpw(_normalized_password_bytes(password), bcrypt.gensalt())
    return hashed.decode("utf-8")

def verify_password(password, hashed):
    if not isinstance(password, str):
        return False

    if not isinstance(hashed, str) or not hashed:
        return False

    hashed_bytes = hashed.encode("utf-8")
    raw = _raw_password_bytes(password)
    normalized = _normalized_password_bytes(password)

    # Fallback to raw password check to support previously stored bcrypt hashes.
    try:
        return bcrypt.checkpw(normalized, hashed_bytes) or bcrypt.checkpw(raw, hashed_bytes)
    except ValueError:
        return False

def create_access_token(data):
    return jwt.encode(data, SECRET_KEY, algorithm="HS256")