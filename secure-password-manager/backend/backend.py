import sys
import json
import sqlite3
from Cryptodome.Cipher import AES
from Cryptodome.Protocol.KDF import PBKDF2
from Cryptodome.Hash import SHA256
import os
import base64
import hmac
import stat
import pyotp
import qrcode
from io import BytesIO
import logging

DB_FILE = 'passwords.db'
SALT_FILE = 'salt.bin'
MASTER_PASSWORD_FILE = 'master_password.bin'
TOTP_SECRET_FILE = 'totp_secret.bin'
MFA_ENABLED = False  # Set to False to disable MFA globally

# Configure logging
logging.basicConfig(
    filename='backend.log',
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
)

def hash_master_password(password):
    try:
        salt = os.urandom(16)
        iterations = 300_000
        password_hash = PBKDF2(password.encode(), salt, dkLen=32, count=iterations, hmac_hash_module=SHA256)
        with open(MASTER_PASSWORD_FILE, 'wb') as f:
            f.write(salt + iterations.to_bytes(4, 'big') + password_hash)
        os.chmod(MASTER_PASSWORD_FILE, stat.S_IRUSR | stat.S_IWUSR)
        logging.info('Master password hashed and stored')
    except Exception as e:
        logging.exception('Error hashing master password')

def verify_master_password(password):
    try:
        if not os.path.exists(MASTER_PASSWORD_FILE):
            return False, None

        with open(MASTER_PASSWORD_FILE, 'rb') as f:
            data = f.read()
        salt = data[:16]
        iterations = int.from_bytes(data[16:20], 'big')
        stored_password_hash = data[20:]
        password_hash = PBKDF2(password.encode(), salt, dkLen=32, count=iterations, hmac_hash_module=SHA256)

        if hmac.compare_digest(password_hash, stored_password_hash):
            master_key = get_master_key(password, iterations)
            return True, master_key
        else:
            return False, None
    except Exception as e:
        logging.exception('Error verifying master password')
        return False, None

def get_master_key(password, iterations=300_000):
    try:
        if os.path.exists(SALT_FILE):
            with open(SALT_FILE, 'rb') as f:
                salt = f.read()
        else:
            salt = os.urandom(16)
            with open(SALT_FILE, 'wb') as f:
                f.write(salt)
        master_key = PBKDF2(password.encode(), salt, dkLen=32, count=iterations, hmac_hash_module=SHA256)
        return master_key
    except Exception as e:
        logging.exception('Error generating master key')
        return None

def encrypt(master_key, plaintext):
    try:
        nonce = os.urandom(12)  # AES-GCM recommends a 12-byte nonce
        cipher = AES.new(master_key, AES.MODE_GCM, nonce=nonce)
        ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode())
        # Store nonce + tag + ciphertext
        return base64.b64encode(nonce + tag + ciphertext).decode()
    except (ValueError, KeyError) as e:
        # Log the error and return None
        print(f"Encryption failed: {e}", file=sys.stderr)
        return None
    
def decrypt(master_key, encrypted_data):
    try:
        encrypted_data = base64.b64decode(encrypted_data)
        nonce = encrypted_data[:12]        # First 12 bytes for nonce
        tag = encrypted_data[12:28]        # Next 16 bytes for tag
        ciphertext = encrypted_data[28:]   # Remaining bytes for ciphertext
        cipher = AES.new(master_key, AES.MODE_GCM, nonce=nonce)
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
        return plaintext.decode()
    except (ValueError, KeyError) as e:
        # Log the error and return None
        print(f"Decryption failed: {e}", file=sys.stderr)
        return None

def generate_totp_secret():
    return pyotp.random_base32()

def store_totp_secret(master_key, totp_secret):
    try:
        encrypted_secret = encrypt(master_key, totp_secret)
        with open(TOTP_SECRET_FILE, 'w') as f:
            f.write(encrypted_secret)
    except Exception as e:
        logging.exception('Error storing TOTP secret')

def load_totp_secret(master_key):
    try:
        if not os.path.exists(TOTP_SECRET_FILE):
            return None
        with open(TOTP_SECRET_FILE, 'r') as f:
            encrypted_secret = f.read()
        totp_secret = decrypt(master_key, encrypted_secret)
        return totp_secret
    except Exception as e:
        logging.exception('Error loading TOTP secret')
        return None

def init_db():
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        # Create table if it doesn't exist
        c.execute('''
            CREATE TABLE IF NOT EXISTS passwords (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                site TEXT NOT NULL,
                username TEXT NOT NULL,
                password TEXT NOT NULL
            )
        ''')

        # Add new columns if they don't exist
        existing_columns = [row[1] for row in c.execute('PRAGMA table_info(passwords)')]

        if 'notes' not in existing_columns:
            c.execute('ALTER TABLE passwords ADD COLUMN notes TEXT')

        if 'category' not in existing_columns:
            c.execute('ALTER TABLE passwords ADD COLUMN category TEXT')

        conn.commit()
        conn.close()
    except Exception as e:
        logging.exception('Error initializing database')

def add_password(master_key, site, username, password, notes='', category=''):
    try:
        encrypted_password = encrypt(master_key, password)
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('INSERT INTO passwords (site, username, password, notes, category) VALUES (?, ?, ?, ?, ?)',
                (site, username, encrypted_password, notes, category))
        conn.commit()
        conn.close()
    except Exception as e:
        logging.exception('Error adding password')

def update_password(master_key, entry_id, site, username, password, notes, category):
    try:
        encrypted_password = encrypt(master_key, password)
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('''
            UPDATE passwords
            SET site = ?, username = ?, password = ?, notes = ?, category = ?
            WHERE id = ?
        ''', (site, username, encrypted_password, notes, category, entry_id))
        conn.commit()
        conn.close()
    except Exception as e:
        logging.exception('Error updating password')

def delete_password(entry_id):
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('DELETE FROM passwords WHERE id = ?', (entry_id,))
        conn.commit()
        conn.close()
    except Exception as e:
        logging.exception('Error deleting password')

def get_passwords(master_key):
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('SELECT id, site, username, password, notes, category FROM passwords')
        rows = c.fetchall()
        conn.close()

        result = []
        for row in rows:
            decrypted_password = decrypt(master_key, row[3])
            if decrypted_password is not None:
                result.append({
                    'id': row[0],
                    'site': row[1],
                    'username': row[2],
                    'password': decrypted_password,
                    'notes': row[4],
                    'category': row[5],
                })
            else:
                # Log or handle entries that couldn't be decrypted
                print(f"Failed to decrypt password for entry ID {row[0]}", file=sys.stderr)
        return result
    except Exception as e:
        logging.exception('Error getting passwords')

def main():
    init_db()
    master_key = None

    for line in sys.stdin:
        try:
            request = json.loads(line)
            command = request.get('command')
            data = request.get('data')
            logging.debug(f"Received command: {command}")

            if command == 'is_master_password_set':
                if os.path.exists(MASTER_PASSWORD_FILE):
                    response = {'isSet': True}
                else:
                    response = {'isSet': False}
                logging.debug(json.dumps(response))
                sys.stdout.flush()

            elif command == 'set_master_password':
                if os.path.exists(MASTER_PASSWORD_FILE):
                    # Verify existing master password
                    success, master_key = verify_master_password(data.get('master_password'))
                    if success:
                        response = {'status': 'Master password verified'}
                    else:
                        response = {'error': 'Incorrect master password'}
                else:
                    # Set new master password
                    hash_master_password(data.get('master_password'))
                    master_key = get_master_key(data.get('master_password'))
                    response = {'status': 'Master password set'}
                logging.debug(json.dumps(response))
                sys.stdout.flush()

            elif command == 'add_password':
                if master_key is None:
                    response = {'error': 'Master password not verified'}
                else:
                    site = data.get('site')
                    username = data.get('username')
                    password = data.get('password')
                    notes = data.get('notes', '')
                    category = data.get('category', '')
                    add_password(master_key, site, username, password, notes, category)
                    response = {'status': 'Password added'}
                logging.debug(json.dumps(response))
                sys.stdout.flush()

            elif command == 'update_password':
                if master_key is None:
                    response = {'error': 'Master password not verified'}
                else:
                    entry_id = data.get('id')
                    site = data.get('site')
                    username = data.get('username')
                    password = data.get('password')
                    notes = data.get('notes')
                    category = data.get('category')
                    update_password(master_key, entry_id, site, username, password, notes, category)
                    response = {'status': 'Password updated'}
                logging.debug(json.dumps(response))
                sys.stdout.flush()

            elif command == 'delete_password':
                if master_key is None:
                    response = {'error': 'Master password not verified'}
                else:
                    entry_id = data.get('id')
                    delete_password(entry_id)
                    response = {'status': 'Password deleted'}
                logging.debug(json.dumps(response))
                sys.stdout.flush()

            elif command == 'get_passwords':
                if master_key is None:
                    response = {'error': 'Master password not verified'}
                else:
                    passwords = get_passwords(master_key)
                    response = {'passwords': passwords}
                logging.debug(json.dumps(response))
                sys.stdout.flush()

            elif command == 'setup_mfa':
                if master_key is None:
                    response = {'error': 'Master password not verified'}
                elif not MFA_ENABLED:
                    response = {'error': 'MFA is disabled'}
                else:
                    totp_secret = generate_totp_secret()
                    store_totp_secret(master_key, totp_secret)
                    totp_uri = pyotp.totp.TOTP(totp_secret).provisioning_uri(name='Secure Password Manager', issuer_name='YourApp')
                    # Generate QR code
                    qr = qrcode.QRCode()
                    qr.add_data(totp_uri)
                    qr.make(fit=True)
                    img = qr.make_image(fill='black', back_color='white')
                    buffered = BytesIO()
                    img.save(buffered, format='PNG')
                    qr_code_base64 = base64.b64encode(buffered.getvalue()).decode()
                    response = {'status': 'MFA setup', 'qr_code': qr_code_base64}
                logging.debug(json.dumps(response))
                sys.stdout.flush()

            elif command == 'verify_mfa':
                if master_key is None:
                    response = {'error': 'Master password not verified'}
                elif not MFA_ENABLED:
                    response = {'status': 'MFA verified'}
                else:
                    totp_secret = load_totp_secret(master_key)
                    if totp_secret is None:
                        response = {'error': 'MFA not set up'}
                    else:
                        token = data.get('token')
                        totp = pyotp.TOTP(totp_secret)
                        if totp.verify(token):
                            response = {'status': 'MFA verified'}
                        else:
                            response = {'error': 'Invalid MFA token'}
                logging.debug(json.dumps(response))
                sys.stdout.flush()

            elif command == 'is_mfa_enabled':
                if master_key is None:
                    response = {'error': 'Master password not verified'}
                elif not MFA_ENABLED:
                    response = {'mfaEnabled': False}
                else:
                    if os.path.exists(TOTP_SECRET_FILE):
                        response = {'mfaEnabled': True}
                    else:
                        response = {'mfaEnabled': False}
                logging.debug(json.dumps(response))
                sys.stdout.flush()

            else:
                response = {'error': 'Unknown command'}
                logging.debug(json.dumps(response))
                sys.stdout.flush()

        except json.JSONDecodeError as e:
            logging.error(f"JSON decode error: {e}")
            response = {'error': 'Invalid JSON format'}
            logging.debug(json.dumps(response))
            sys.stdout.flush()
        except Exception as e:
            logging.exception("An unexpected error occurred")
            response = {'error': 'An internal error occurred'}
            logging.debug(json.dumps(response))
            sys.stdout.flush()

if __name__ == '__main__':
    main()
