# tests/test_mfa.py
import pytest
from backend.backend import (
    get_master_key, 
    setup_mfa, 
    verify_mfa, 
    is_mfa_enabled, 
    disable_mfa, 
    load_totp_secret
)

def test_mfa_setup(mock_paths):
    master_key = get_master_key("MasterPass")
    resp = setup_mfa(master_key)
    assert resp.get('status') == 'MFA setup'
    assert 'qr_code' in resp

    # Check if MFA is enabled
    enabled_resp = is_mfa_enabled(master_key)
    assert enabled_resp.get('mfaEnabled') is True

    # Check that a TOTP secret was actually stored
    secret = load_totp_secret(master_key)
    assert secret is not None

def test_verify_mfa(mock_paths):
    master_key = get_master_key("MasterPass")
    setup_mfa(master_key)
    secret = load_totp_secret(master_key)

    # Generate a valid TOTP token
    import pyotp
    totp = pyotp.TOTP(secret)
    token = totp.now()

    verify_resp = verify_mfa(master_key, token)
    assert verify_resp.get('status') == 'MFA verified'

def test_invalid_mfa_token(mock_paths):
    master_key = get_master_key("MasterPass")
    setup_mfa(master_key)
    # Provide an invalid token
    verify_resp = verify_mfa(master_key, "000000")
    assert verify_resp.get('error') == 'Invalid MFA token'

def test_disable_mfa(mock_paths):
    master_key = get_master_key("MasterPass")
    setup_mfa(master_key)
    resp = disable_mfa(master_key)
    assert resp.get('status') == 'MFA disabled'

    enabled_resp = is_mfa_enabled(master_key)
    assert enabled_resp.get('mfaEnabled') is False
