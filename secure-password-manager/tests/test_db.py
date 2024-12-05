# tests/test_db.py
import pytest
import os
from backend.backend import init_db, add_password, get_passwords, update_password, delete_password, get_master_key

def test_init_db(mock_paths):
    init_db()
    assert os.path.exists('test_passwords.db')  # DB created

def test_add_and_retrieve_password(mock_paths):
    init_db()
    master_key = get_master_key("MasterPass")
    add_password(master_key, "example.com", "user", "pass123", notes="my notes", category="email")

    passwords = get_passwords(master_key)
    assert len(passwords) == 1
    p = passwords[0]
    assert p['site'] == "example.com"
    assert p['username'] == "user"
    assert p['password'] == "pass123"
    assert p['notes'] == "my notes"
    assert p['category'] == "email"

def test_update_password(mock_paths):
    init_db()
    master_key = get_master_key("MasterPass")
    add_password(master_key, "example.com", "user", "pass123")
    passwords = get_passwords(master_key)
    entry_id = passwords[0]['id']

    update_password(master_key, entry_id, "example.com", "user2", "newpass", "updated notes", "work")
    passwords = get_passwords(master_key)
    p = passwords[0]
    assert p['username'] == "user2"
    assert p['password'] == "newpass"
    assert p['notes'] == "updated notes"
    assert p['category'] == "work"

def test_delete_password(mock_paths):
    init_db()
    master_key = get_master_key("MasterPass")
    add_password(master_key, "example.com", "user", "pass123")
    passwords = get_passwords(master_key)
    entry_id = passwords[0]['id']

    delete_password(entry_id)
    passwords = get_passwords(master_key)
    assert len(passwords) == 0
