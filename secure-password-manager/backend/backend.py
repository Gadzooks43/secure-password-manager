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
import traceback
import signal
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from argon2.low_level import hash_secret_raw, Type

DB_FILE = 'passwords.db'
SALT_FILE = 'salt.bin'
MASTER_PASSWORD_FILE = 'master_password.bin'
TOTP_SECRET_FILE = 'totp_secret.bin'
MFA_ENABLED = True  # Set to False to disable MFA globally

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr)
    ]
)

# Initialize Argon2 Password Hasher
ph = PasswordHasher(
    time_cost=2,
    memory_cost=102400,  # in kibibytes (100 MB)
    parallelism=8,
    hash_len=32,
    salt_len=16,
    type=Type.ID
)

def handle_exit_signals(signum, frame):
    logging.info(f"Received signal {signum}. Exiting backend process.")
    sys.exit(0)

def get_master_key(password):
    try:
        if os.path.exists(SALT_FILE):
            # Read the existing salt
            with open(SALT_FILE, 'rb') as f:
                salt = f.read()
            logging.debug('Salt loaded from existing salt file.')
        else:
            # Generate a new salt and store it
            salt = os.urandom(16)
            with open(SALT_FILE, 'wb') as f:
                f.write(salt)
            os.chmod(SALT_FILE, stat.S_IRUSR | stat.S_IWUSR)
            logging.debug('New salt generated and stored.')
        
        # Derive the master key using Argon2
        master_key = hash_secret_raw(
            secret=password.encode('utf-8'),
            salt=salt,
            time_cost=2,
            memory_cost=102400,  # in kibibytes (100 MB)
            parallelism=8,
            hash_len=32,
            type=Type.ID
        )
        logging.debug('Master key derived successfully.')
        return master_key
    except Exception as e:
        logging.error('Error generating master key:', exc_info=True)
        return None

def hash_master_password(password):
    try:
        # Hash the password using argon2-cffi
        password_hash = ph.hash(password)
        with open(MASTER_PASSWORD_FILE, 'w') as f:
            f.write(password_hash)

        os.chmod(MASTER_PASSWORD_FILE, stat.S_IRUSR | stat.S_IWUSR)
        logging.info('Master password hashed and stored successfully.')
    except Exception as e:
        logging.error('Error hashing master password:', exc_info=True)

def verify_master_password(password):
    try:
        if not os.path.exists(MASTER_PASSWORD_FILE):
            logging.warning('Master password file does not exist.')
            return False, None

        with open(MASTER_PASSWORD_FILE, 'r') as f:
            stored_password_hash = f.read()

        # Verify the password
        ph.verify(stored_password_hash, password)

        # If verification is successful, derive the master key
        master_key = get_master_key(password)
        logging.info('Master password verified successfully.')
        return True, master_key

    except VerifyMismatchError:
        logging.warning('Master password verification failed.')
        return False, None
    except Exception as e:
        logging.error('Error verifying master password:', exc_info=True)
        return False, None

def encrypt(master_key, plaintext):
    try:
        salt = os.urandom(16)  # Separate salt for encryption
        # Derive a unique key for encryption using PBKDF2 with SHA256
        aes_key = PBKDF2(master_key, salt, dkLen=32, count=100000, hmac_hash_module=SHA256)
        nonce = os.urandom(12)
        cipher = AES.new(aes_key, AES.MODE_GCM, nonce=nonce)
        ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode())
        encrypted_data = base64.b64encode(salt + nonce + tag + ciphertext).decode()
        logging.debug('Data encrypted successfully.')
        return encrypted_data
    except (ValueError, KeyError) as e:
        logging.error(f"Encryption failed: {e}", exc_info=True)
        return None

def decrypt(master_key, encrypted_data):
    try:
        data = base64.b64decode(encrypted_data)
        salt = data[:16]
        nonce = data[16:28]
        tag = data[28:44]
        ciphertext = data[44:]
        # Derive the AES key using the same method as encryption
        aes_key = PBKDF2(master_key, salt, dkLen=32, count=100000, hmac_hash_module=SHA256)
        cipher = AES.new(aes_key, AES.MODE_GCM, nonce=nonce)
        plaintext = cipher.decrypt_and_verify(ciphertext, tag).decode()
        logging.debug('Data decrypted successfully.')
        return plaintext
    except (ValueError, KeyError) as e:
        logging.error(f"Decryption failed: {e}", exc_info=True)
        return None

def generate_totp_secret():
    try:
        totp_secret = pyotp.random_base32()
        logging.info('TOTP secret generated successfully.')
        return totp_secret
    except Exception as e:
        logging.error('Error generating TOTP secret:', exc_info=True)
        return None

def store_totp_secret(master_key, totp_secret):
    try:
        encrypted_secret = encrypt(master_key, totp_secret)
        with open(TOTP_SECRET_FILE, 'w') as f:
            f.write(encrypted_secret)
        logging.info('TOTP secret encrypted and stored successfully.')
    except Exception as e:
        logging.error('Error storing TOTP secret:', exc_info=True)

def load_totp_secret(master_key):
    try:
        if not os.path.exists(TOTP_SECRET_FILE):
            logging.warning('TOTP secret file does not exist.')
            return None
        with open(TOTP_SECRET_FILE, 'r') as f:
            encrypted_secret = f.read()
        totp_secret = decrypt(master_key, encrypted_secret)
        if totp_secret:
            logging.info('TOTP secret loaded and decrypted successfully.')
        else:
            logging.warning('Failed to decrypt TOTP secret.')
        return totp_secret
    except Exception as e:
        logging.error('Error loading TOTP secret:', exc_info=True)
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
                password TEXT NOT NULL,
                notes TEXT,
                category TEXT
            )
        ''')

        # Add new columns if they don't exist
        existing_columns = [row[1] for row in c.execute('PRAGMA table_info(passwords)')]

        if 'notes' not in existing_columns:
            c.execute('ALTER TABLE passwords ADD COLUMN notes TEXT')
            logging.info('Added "notes" column to "passwords" table.')

        if 'category' not in existing_columns:
            c.execute('ALTER TABLE passwords ADD COLUMN category TEXT')
            logging.info('Added "category" column to "passwords" table.')

        conn.commit()
        conn.close()
        logging.info('Database initialized successfully.')
    except Exception as e:
        logging.error('Error initializing database:', exc_info=True)

def add_password(master_key, site, username, password, notes='', category=''):
    try:
        encrypted_password = encrypt(master_key, password)
        if encrypted_password is None:
            raise ValueError('Password encryption failed.')
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('INSERT INTO passwords (site, username, password, notes, category) VALUES (?, ?, ?, ?, ?)',
                  (site, username, encrypted_password, notes, category))
        conn.commit()
        conn.close()
        logging.info(f'Password for site "{site}" added successfully.')
    except Exception as e:
        logging.error('Error adding password:', exc_info=True)

def update_password(master_key, entry_id, site, username, password, notes, category):
    try:
        encrypted_password = encrypt(master_key, password)
        if encrypted_password is None:
            raise ValueError('Password encryption failed.')
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('''
            UPDATE passwords
            SET site = ?, username = ?, password = ?, notes = ?, category = ?
            WHERE id = ?
        ''', (site, username, encrypted_password, notes, category, entry_id))
        conn.commit()
        conn.close()
        logging.info(f'Password for entry ID "{entry_id}" updated successfully.')
    except Exception as e:
        logging.error('Error updating password:', exc_info=True)

def delete_password(entry_id):
    try:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('DELETE FROM passwords WHERE id = ?', (entry_id,))
        conn.commit()
        conn.close()
        logging.info(f'Password for entry ID "{entry_id}" deleted successfully.')
    except Exception as e:
        logging.error('Error deleting password:', exc_info=True)

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
                logging.warning(f"Failed to decrypt password for entry ID {row[0]}")
        logging.info('Retrieved all passwords successfully.')
        return result
    except Exception as e:
        logging.error('Error retrieving passwords:', exc_info=True)
        return []

def setup_mfa(master_key):
    try:
        if not MFA_ENABLED:
            logging.warning('MFA is disabled globally.')
            return {'error': 'MFA is disabled'}
        totp_secret = generate_totp_secret()
        if totp_secret is None:
            raise ValueError('Failed to generate TOTP secret.')
        store_totp_secret(master_key, totp_secret)
        totp_uri = pyotp.totp.TOTP(totp_secret).provisioning_uri(name='Secure Password Manager', issuer_name='SecurePasswordManager')
        # Generate QR code
        qr = qrcode.QRCode()
        qr.add_data(totp_uri)
        qr.make(fit=True)
        img = qr.make_image(fill='black', back_color='white')
        buffered = BytesIO()
        img.save(buffered, format='PNG')
        qr_code_base64 = base64.b64encode(buffered.getvalue()).decode()
        logging.info('MFA setup completed successfully.')
        return {'status': 'MFA setup', 'qr_code': qr_code_base64}
    except Exception as e:
        logging.error('Error setting up MFA:', exc_info=True)
        return {'error': 'Failed to set up MFA'}

def verify_mfa(master_key, token):
    try:
        if not MFA_ENABLED:
            logging.info('MFA is disabled globally. Verification bypassed.')
            return {'status': 'MFA verified'}
        totp_secret = load_totp_secret(master_key)
        if totp_secret is None:
            logging.warning('MFA is enabled but TOTP secret is not set up.')
            return {'error': 'MFA not set up'}
        totp = pyotp.TOTP(totp_secret)
        if totp.verify(token):
            logging.info('MFA token verified successfully.')
            return {'status': 'MFA verified'}
        else:
            logging.warning('Invalid MFA token provided.')
            return {'error': 'Invalid MFA token'}
    except Exception as e:
        logging.error('Error verifying MFA:', exc_info=True)
        return {'error': 'Failed to verify MFA'}

def is_mfa_enabled(master_key):
    try:
        if not MFA_ENABLED:
            logging.info('MFA is disabled globally.')
            return {'mfaEnabled': False}
        if os.path.exists(TOTP_SECRET_FILE):
            logging.info('MFA is enabled and TOTP secret is set up.')
            return {'mfaEnabled': True}
        else:
            logging.info('MFA is enabled but TOTP secret is not set up.')
            return {'mfaEnabled': False}
    except Exception as e:
        logging.error('Error checking if MFA is enabled:', exc_info=True)
        return {'error': 'Failed to check MFA status'}
    
def disable_mfa(master_key):
    try:
        # Remove the TOTP secret file
        if os.path.exists(TOTP_SECRET_FILE):
            os.remove(TOTP_SECRET_FILE)
            logging.info('MFA has been disabled and TOTP secret removed.')
            return {"status": "MFA disabled"}
        else:
            logging.warning('Attempted to disable MFA, but TOTP secret file does not exist.')
            return {"error": "MFA is not enabled."}
    except Exception as e:
        logging.error('Error disabling MFA:', exc_info=True)
        return {"error": "Failed to disable MFA."}

def main():
    init_db()
    master_key = None

    for line in sys.stdin:
        try:
            request = json.loads(line)
            command = request.get('command')
            data = request.get('data')
            logging.debug(f"Received command: {command}")

            if command == 'shutdown':
                logging.info('Shutdown command received. Exiting backend process.')
                print(json.dumps({"status": "shutdown"}))
                sys.stdout.flush()
                break  # Exit the loop to end the process

            elif command == 'disable_mfa':
                if master_key is None:
                    response = {"error": "Master password not verified"}
                else:
                    response = disable_mfa(master_key)
                print(json.dumps(response))
                sys.stdout.flush()
                logging.debug(f"Response: {response}")

            elif command == 'is_master_password_set':
                if os.path.exists(MASTER_PASSWORD_FILE):
                    response = {"isSet": True}
                else:
                    response = {"isSet": False}
                print(json.dumps(response))  # Send JSON to stdout
                sys.stdout.flush()
                logging.debug(f"Response: {response}")

            elif command == 'set_master_password':
                if os.path.exists(MASTER_PASSWORD_FILE):
                    # Verify existing master password
                    success, master_key = verify_master_password(data.get('master_password'))
                    if success:
                        response = {"status": "Master password verified"}
                    else:
                        response = {"error": "Incorrect master password"}
                else:
                    # Set new master password
                    hash_master_password(data.get('master_password'))
                    master_key = get_master_key(data.get('master_password'))
                    response = {"status": "Master password set"}
                print(json.dumps(response))  # Send JSON to stdout
                sys.stdout.flush()
                logging.debug(f"Response: {response}")

            elif command == 'add_password':
                if master_key is None:
                    response = {"error": "Master password not verified"}
                else:
                    site = data.get('site')
                    username = data.get('username')
                    password = data.get('password')
                    notes = data.get('notes', '')
                    category = data.get('category', '')
                    add_password(master_key, site, username, password, notes, category)
                    response = {"status": "Password added"}
                print(json.dumps(response))  # Send JSON to stdout
                sys.stdout.flush()
                logging.debug(f"Response: {response}")

            elif command == 'update_password':
                if master_key is None:
                    response = {"error": "Master password not verified"}
                else:
                    entry_id = data.get('id')
                    site = data.get('site')
                    username = data.get('username')
                    password = data.get('password')
                    notes = data.get('notes')
                    category = data.get('category')
                    update_password(master_key, entry_id, site, username, password, notes, category)
                    response = {"status": "Password updated"}
                print(json.dumps(response))  # Send JSON to stdout
                sys.stdout.flush()
                logging.debug(f"Response: {response}")

            elif command == 'delete_password':
                if master_key is None:
                    response = {"error": "Master password not verified"}
                else:
                    entry_id = data.get('id')
                    delete_password(entry_id)
                    response = {"status": "Password deleted"}
                print(json.dumps(response))  # Send JSON to stdout
                sys.stdout.flush()
                logging.debug(f"Response: {response}")

            elif command == 'get_passwords':
                if master_key is None:
                    response = {"error": "Master password not verified"}
                else:
                    passwords = get_passwords(master_key)
                    response = {"passwords": passwords}
                print(json.dumps(response))  # Send JSON to stdout
                sys.stdout.flush()
                logging.debug(f"Response: {response}")

            elif command == 'setup_mfa':
                if master_key is None:
                    response = {"error": "Master password not verified"}
                else:
                    response = setup_mfa(master_key)
                print(json.dumps(response))  # Send JSON to stdout
                sys.stdout.flush()
                logging.debug(f"Response: {response}")

            elif command == 'verify_mfa':
                if master_key is None:
                    response = {"error": "Master password not verified"}
                else:
                    token = data.get('token')
                    response = verify_mfa(master_key, token)
                print(json.dumps(response))  # Send JSON to stdout
                sys.stdout.flush()
                logging.debug(f"Response: {response}")

            elif command == 'is_mfa_enabled':
                if master_key is None:
                    response = {"error": "Master password not verified"}
                else:
                    response = is_mfa_enabled(master_key)
                print(json.dumps(response))  # Send JSON to stdout
                sys.stdout.flush()
                logging.debug(f"Response: {response}")

            else:
                response = {"error": "Unknown command"}
                logging.warning(f"Unknown command received: {command}")
                print(json.dumps(response))  # Send JSON to stdout
                sys.stdout.flush()
                logging.debug(f"Response: {response}")

        except json.JSONDecodeError as e:
            logging.error(f"JSON decode error: {e}", exc_info=True)
            response = {"error": "Invalid JSON format"}
            print(json.dumps(response))  # Send error to stdout
            sys.stdout.flush()
        except Exception as e:
            logging.error("An unexpected error occurred:", exc_info=True)
            response = {"error": "An internal error occurred"}
            print(json.dumps(response))  # Send error to stdout
            sys.stdout.flush()

if __name__ == '__main__':
    signal.signal(signal.SIGINT, handle_exit_signals)
    signal.signal(signal.SIGTERM, handle_exit_signals)
    main()
