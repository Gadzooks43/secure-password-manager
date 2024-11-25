import sys
import json
import sqlite3
from Cryptodome.Cipher import AES
from Cryptodome.Protocol.KDF import PBKDF2
import os
import base64

DB_FILE = 'passwords.db'
SALT_FILE = 'salt.bin'
MASTER_KEY_FILE = 'master.key'

def get_master_key(password):
    if os.path.exists(SALT_FILE):
        with open(SALT_FILE, 'rb') as f:
            salt = f.read()
    else:
        salt = os.urandom(16)
        with open(SALT_FILE, 'wb') as f:
            f.write(salt)
    key = PBKDF2(password, salt, dkLen=32)
    return key

def encrypt(master_key, plaintext):
    cipher = AES.new(master_key, AES.MODE_EAX)
    nonce = cipher.nonce
    ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode())
    return base64.b64encode(nonce + tag + ciphertext).decode()

def decrypt(master_key, encrypted_data):
    encrypted_data = base64.b64decode(encrypted_data)
    nonce = encrypted_data[:16]
    tag = encrypted_data[16:32]
    ciphertext = encrypted_data[32:]
    cipher = AES.new(master_key, AES.MODE_EAX, nonce=nonce)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)
    return plaintext.decode()

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS passwords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site TEXT NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def add_password(master_key, site, username, password):
    encrypted_password = encrypt(master_key, password)
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('INSERT INTO passwords (site, username, password) VALUES (?, ?, ?)',
              (site, username, encrypted_password))
    conn.commit()
    conn.close()

def get_passwords(master_key):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('SELECT id, site, username, password FROM passwords')
    rows = c.fetchall()
    conn.close()

    result = []
    for row in rows:
        decrypted_password = decrypt(master_key, row[3])
        result.append({
            'id': row[0],
            'site': row[1],
            'username': row[2],
            'password': decrypted_password
        })
    return result

def main():
    init_db()
    master_password = None
    master_key = None

    for line in sys.stdin:
        request = json.loads(line)
        command = request.get('command')
        data = request.get('data')

        if command == 'set_master_password':
            master_password = data.get('master_password')
            master_key = get_master_key(master_password)
            response = {'status': 'Master password set'}
            print(json.dumps(response))
            sys.stdout.flush()
        elif command == 'add_password':
            if master_key is None:
                response = {'error': 'Master password not set'}
            else:
                site = data.get('site')
                username = data.get('username')
                password = data.get('password')
                add_password(master_key, site, username, password)
                response = {'status': 'Password added'}
            print(json.dumps(response))
            sys.stdout.flush()
        elif command == 'get_passwords':
            if master_key is None:
                response = {'error': 'Master password not set'}
            else:
                passwords = get_passwords(master_key)
                response = {'passwords': passwords}
            print(json.dumps(response))
            sys.stdout.flush()
        else:
            response = {'error': 'Unknown command'}
            print(json.dumps(response))
            sys.stdout.flush()

if __name__ == '__main__':
    main()
