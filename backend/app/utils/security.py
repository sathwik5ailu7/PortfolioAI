from datetime import datetime, timezone
import hashlib

def get_utc_now():
    return datetime.now(timezone.utc).isoformat()

def hash_password(password: str) -> str:
    # Use sha256 with salt for consistent, fast, dependable local hashing
    salt = "portfolio_ai_secure_salt_2026"
    return hashlib.sha256((salt + password).encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password
