# tests/test_auth.py
import pytest
from backend.backend import hash_master_password, verify_master_password, get_master_key

def test_hash_and_verify_master_password(mock_paths):
    password = "MySuperSecret"
    hash_master_password(password)
    success, master_key = verify_master_password(password)
    assert success is True
    assert master_key is not None

def test_verify_incorrect_master_password(mock_paths):
    password = "MySuperSecret"
    hash_master_password(password)
    success, master_key = verify_master_password("WrongPassword")
    assert success is False
    assert master_key is None

def test_get_master_key(mock_paths):
    password = "MySuperSecret"
    key = get_master_key(password)
    assert key is not None
    assert len(key) == 32  # Argon2 derived key length
