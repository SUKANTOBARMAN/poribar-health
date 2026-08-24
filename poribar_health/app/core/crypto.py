from cryptography.fernet import Fernet

from app.config import settings

_fernet = Fernet(settings.ENCRYPTION_KEY.encode())


def encrypt_field(plain_text: str) -> str:
    """NID-এর মতো sensitive field DB-তে সেভ করার আগে এনক্রিপ্ট করে (doc Security Notes)।"""
    return _fernet.encrypt(plain_text.encode()).decode()


def decrypt_field(cipher_text: str) -> str:
    """শুধু director/super_admin verification-এর সময় দরকার হলে ডিক্রিপ্ট করে দেখতে ব্যবহার হবে।"""
    return _fernet.decrypt(cipher_text.encode()).decode()