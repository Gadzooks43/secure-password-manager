# tests/test_crypto.py
import pytest
from backend.backend import get_master_key, encrypt, decrypt

def test_encrypt_decrypt_roundtrip(mock_paths):
    master_key = get_master_key("MySuperSecret")
    plaintext = "SensitiveData123"
    encrypted = encrypt(master_key, plaintext)
    assert encrypted is not None

    decrypted = decrypt(master_key, encrypted)
    assert decrypted == plaintext

def test_decrypt_with_wrong_key(mock_paths):
    master_key = get_master_key("MySuperSecret")
    other_key = get_master_key("AnotherSecret")
    plaintext = "SensitiveData123"
    encrypted = encrypt(master_key, plaintext)

    decrypted = decrypt(other_key, encrypted)
    # Decryption should fail or return None
    assert decrypted is None
