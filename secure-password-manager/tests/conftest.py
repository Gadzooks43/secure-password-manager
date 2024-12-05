# tests/conftest.py
import pytest
import os
import shutil

TEST_DB_FILE = 'test_passwords.db'
TEST_SALT_FILE = 'test_salt.bin'
TEST_MASTER_PASSWORD_FILE = 'test_master_password.bin'
TEST_TOTP_SECRET_FILE = 'test_totp_secret.bin'

@pytest.fixture(scope='function', autouse=True)
def cleanup_files():
    # Before each test, remove any test files if they exist
    for f in [TEST_DB_FILE, TEST_SALT_FILE, TEST_MASTER_PASSWORD_FILE, TEST_TOTP_SECRET_FILE]:
        if os.path.exists(f):
            os.remove(f)
    yield
    # After the test, ensure cleanup again
    for f in [TEST_DB_FILE, TEST_SALT_FILE, TEST_MASTER_PASSWORD_FILE, TEST_TOTP_SECRET_FILE]:
        if os.path.exists(f):
            os.remove(f)

@pytest.fixture
def mock_paths(monkeypatch):
    monkeypatch.setattr('backend.backend.DB_FILE', TEST_DB_FILE)
    monkeypatch.setattr('backend.backend.SALT_FILE', TEST_SALT_FILE)
    monkeypatch.setattr('backend.backend.MASTER_PASSWORD_FILE', TEST_MASTER_PASSWORD_FILE)
    monkeypatch.setattr('backend.backend.TOTP_SECRET_FILE', TEST_TOTP_SECRET_FILE)
    yield
