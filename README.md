# Secure Password Manager

A secure and user-friendly password manager application that leverages strong encryption techniques and multi-factor authentication to enhance user security.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Windows](#windows)
  - [macOS](#macos)
  - [Linux](#linux)
- [Build Instructions](#build-instructions)
  - [Building the Installer](#building-the-installer)
- [Usage](#usage)
- [Application Features](#application-features)
- [Security Techniques](#security-techniques)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact](#contact)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)

---

## Prerequisites

Before setting up the project, ensure you have the following software installed on your system:

- **Node.js** (version **20.x** or higher)
- **npm** (comes with Node.js)
- **Python** (version **3.10** or higher)
- **pip** (Python package manager)
- **Git** (for version control)
- **Administrator Privileges** (for creating symbolic links on Windows)

**Note:** On Windows, enabling **Developer Mode** is recommended to allow the creation of symbolic links without requiring administrative privileges.

---

## Project Structure

```plaintext
secure-password-manager/
├── backend/
│   ├── backend.py
│   ├── requirements.txt
│   └── venv/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AddPassword.jsx
│   │   ├── Login.jsx
│   │   ├── MFAVerification.jsx
│   │   ├── Navbar.jsx
│   │   ├── PasswordGeneratorButton.jsx
│   │   ├── PasswordList.jsx
│   │   ├── Settings.jsx
│   │   └── (other component files)
│   ├── index.jsx
│   ├── App.jsx
│   └── theme.js
├── dist/
│   └── (build outputs)
├── .babelrc
├── .gitignore
├── package.json
├── package-lock.json
├── webpack.config.js
├── main.js
├── preload.js
├── README.md
├── setup_and_run.sh
└── setup_and_run.bat
```

---

## Setup Instructions

### Windows

1. **Clone the Repository**

   Open **Command Prompt** or **PowerShell** and clone the repository:

   ```bash
   git clone https://github.com/yourusername/secure-password-manager.git
   cd secure-password-manager
   ```

2. **Run the Setup Script**

   In the project root directory, run:

   ```bash
   setup_and_run.bat
   ```

   This script will:

   - Install frontend dependencies using `npm install`.
   - Navigate to the `backend` directory, create and activate a virtual environment, and install backend dependencies.
   - Start the application using `npm run start`.

3. **Enable Developer Mode (If Not Already Enabled)**

   To allow the creation of symbolic links without administrative privileges:

   - **Open Settings**: Press `Win + I`.
   - **Navigate to Developer Settings**:
     - Go to **Privacy & Security** > **For developers**.
   - **Enable Developer Mode**: Toggle the switch to **On** and confirm any prompts.
   - **Restart Your Computer** (if prompted).

4. **Run the Application Manually (Optional)**

   If the application doesn't start automatically, you can start it manually:

   ```bash
   npm run start
   ```

### macOS

1. **Clone the Repository**

   Open **Terminal** and clone the repository:

   ```bash
   git clone https://github.com/yourusername/secure-password-manager.git
   cd secure-password-manager
   ```

2. **Make the Setup Script Executable**

   ```bash
   chmod +x setup_and_run.sh
   ```

3. **Run the Setup Script**

   ```bash
   ./setup_and_run.sh
   ```

   This script will:

   - Install frontend dependencies using `npm install`.
   - Navigate to the `backend` directory, create and activate a virtual environment, and install backend dependencies.
   - Start the application using `npm run start`.

4. **Run the Application Manually (Optional)**

   If the application doesn't start automatically, you can start it manually:

   ```bash
   npm run start
   ```

### Linux

1. **Clone the Repository**

   Open **Terminal** and clone the repository:

   ```bash
   git clone https://github.com/yourusername/secure-password-manager.git
   cd secure-password-manager
   ```

2. **Make the Setup Script Executable**

   ```bash
   chmod +x setup_and_run.sh
   ```

3. **Run the Setup Script**

   ```bash
   ./setup_and_run.sh
   ```

   This script will:

   - Install frontend dependencies using `npm install`.
   - Navigate to the `backend` directory, create and activate a virtual environment, and install backend dependencies.
   - Start the application using `npm run start`.

4. **Run the Application Manually (Optional)**

   If the application doesn't start automatically, you can start it manually:

   ```bash
   npm run start
   ```

---

## Build Instructions

After setting up and testing your application in development mode, you can build a distributable installer for your application.

### Building the Installer

1. **Ensure Developer Mode is Enabled (Windows Only)**

   - As outlined in the [Prerequisites](#prerequisites) section, ensure Developer Mode is enabled to allow the creation of symbolic links.

2. **Run the Build Script**

   In the project root directory, execute:

   ```bash
   npm run build-win
   ```

   This script will:

   - Build the backend using `build_backend.py` with PyInstaller.
   - Build the frontend using webpack.
   - Package the application for Windows using Electron Builder.

3. **Locate the Installer**

   After a successful build, the installer (`Setup-1.0.0.exe`) will be available in the `dist` directory:

   ```plaintext
   secure-password-manager/
   ├── dist/
   │   ├── win-unpacked/
   │   └── Setup-1.0.0.exe
   └── (other directories and files)
   ```

4. **Run the Installer**

   Navigate to the `dist` directory and run the installer to install the application on your system.

---

## Usage

After running the setup or installer, the application should start automatically. If it doesn't, you can start it manually:

```bash
npm run start
```

**Features:**

- **Master Password Setup:** Upon first launch, set a master password to secure your password entries.
- **Add Passwords:** Add new password entries for different sites or services.
- **View Passwords:** Display stored passwords in a secure list.
- **Update Passwords:** Modify existing password entries.
- **Delete Passwords:** Remove unwanted password entries.
- **Multi-Factor Authentication (MFA):** Enhance security with MFA setup and verification.
- **Copy to Clipboard:** Copy passwords securely to the clipboard with automatic clearing after 15 seconds.
- **Encryption:** All passwords are encrypted using strong encryption algorithms (PyCryptodome).
- **User-Friendly Interface:** Intuitive UI built with React and Material-UI.

---

## Application Features

- **Master Password Setup:** Ensures that only authorized users can access stored passwords.
- **Add, View, Update, Delete Passwords:** Comprehensive CRUD operations for password management.
- **Multi-Factor Authentication (MFA):** Adds an extra layer of security during login.
- **Secure Encryption:** Utilizes PyCryptodome for robust encryption of sensitive data.
- **Clipboard Management:** Allows copying passwords to the clipboard with automatic clearance to prevent unauthorized access.
- **Cross-Platform Support:** Available on Windows, macOS, and Linux.
- **Responsive UI:** Built with React and Material-UI for a seamless user experience.
- **Logging:** Maintains logs for monitoring and troubleshooting purposes.

---

## Security Techniques

Ensuring the security and privacy of user data is paramount in the Secure Password Manager application. Below are the key security techniques employed to safeguard user information:

### 1. Master Password Setup

**Purpose:**
The master password serves as the primary credential that grants users access to their stored passwords. It ensures that only authorized individuals can access sensitive information within the application.

**Implementation:**
- **Hashing and Salting:** When a user sets a master password, it is not stored in plaintext. Instead, the application uses a strong hashing algorithm (e.g., SHA-256) combined with a unique salt to hash the password before storing it in the database.
- **Key Derivation Function (KDF):** To enhance security, a KDF like PBKDF2 or Argon2 is used to derive a cryptographic key from the master password. This key is then used for encrypting and decrypting user data.

**Benefits:**
- Protects against unauthorized access even if the database is compromised.
- Mitigates risks associated with weak or reused passwords by enforcing strong master password policies.

### 2. Robust Encryption with PyCryptodome

**Purpose:**
Encryption ensures that all sensitive data, including user passwords, are stored securely and remain unreadable without proper authorization.

**Implementation:**
- **Symmetric Encryption (AES-256):** The application utilizes the Advanced Encryption Standard (AES) with a 256-bit key length for encrypting user data. AES-256 is widely recognized for its strength and efficiency.
- **Encryption Keys:** Derived from the master password using a KDF, encryption keys are never stored or transmitted in plaintext. They are regenerated each time the user authenticates.
- **Encrypted Storage:** All password entries and sensitive information are encrypted before being stored in the SQLite database, ensuring data remains secure at rest.

**Benefits:**
- Ensures data confidentiality and integrity.
- Protects against data breaches and unauthorized data access.

### 3. Multi-Factor Authentication (MFA)

**Purpose:**
MFA adds an additional layer of security by requiring users to provide two or more verification factors to gain access, reducing the risk of unauthorized access.

**Implementation:**
- **Time-Based One-Time Passwords (TOTP):** The application integrates TOTP, compatible with authenticator apps like Google Authenticator or Authy. During setup, users scan a QR code to link their authenticator app.
- **Verification Process:** Upon login, after entering the master password, users are prompted to enter a TOTP generated by their authenticator app, ensuring that possession of the device is required for access.
  
**Benefits:**
- Enhances security by combining something the user knows (master password) with something the user has (authenticator device).
- Protects against phishing, keylogging, and other common attack vectors targeting single-factor authentication systems.

### 4. Secure Clipboard Management

**Purpose:**
Handling clipboard operations securely minimizes the risk of sensitive data being exposed inadvertently or maliciously.

**Implementation:**
- **Clipboard API Usage:** When a user copies a password to the clipboard, the application uses Electron's Clipboard API to handle the operation.
- **Automatic Clearing:** Implemented a timeout mechanism that automatically clears the clipboard after 15 seconds, reducing the window of opportunity for unauthorized access to copied data.
- **User Feedback:** Provides visual cues or notifications to inform users that the clipboard has been cleared, enhancing user awareness and security.

**Benefits:**
- Prevents sensitive information from lingering in the clipboard, mitigating risks from clipboard snooping or accidental pasting.
- Enhances user trust by proactively managing sensitive data exposure.

### 5. Secure Communication Between Frontend and Backend

**Purpose:**
Ensuring that the communication between the Electron frontend and the Python backend is secure prevents data interception and manipulation.

**Implementation:**
- **Inter-Process Communication (IPC):** Utilizes Electron's IPC modules (`ipcMain` and `ipcRenderer`) to facilitate communication between the frontend and backend.
- **Context Isolation:** Enabled `contextIsolation` and disabled `nodeIntegration` in the `BrowserWindow` configuration to prevent untrusted scripts from accessing Electron internals or Node.js APIs.
- **Input Validation:** All data exchanged between the frontend and backend is validated and sanitized to prevent injection attacks or malformed data processing.

**Benefits:**
- Protects against man-in-the-middle attacks and unauthorized data access.
- Maintains data integrity and application stability by ensuring only validated data is processed.

### 6. Encrypted Data Storage with SQLite

**Purpose:**
Storing user data securely within the application’s database ensures that even if the database is accessed maliciously, the data remains protected.

**Implementation:**
- **SQLite Database:** Chosen for its lightweight and efficient data management capabilities.
- **Data Encryption:** All sensitive fields within the SQLite database are encrypted using AES-256 before storage.
- **Secure Access:** Database access is restricted to the backend process, ensuring that frontend components cannot interact directly with the database.

**Benefits:**
- Combines the reliability of SQLite with the security of robust encryption.
- Ensures that user data is both accessible and protected within the application environment.

### 7. Code Signing and Packaging Security

**Purpose:**
Code signing verifies the authenticity and integrity of the application, assuring users that the software is trustworthy and has not been tampered with.

**Implementation:**
- **Electron Builder Integration:** Utilizes Electron Builder's code signing capabilities to sign the application binaries during the build process.
- **Certificates:** Employs valid code signing certificates (e.g., from DigiCert or similar authorities) to sign the application, ensuring compatibility with Windows SmartScreen and other security features.
- **Automated Signing:** Configured build scripts to handle the signing process automatically, reducing the risk of human error.

**Benefits:**
- Enhances user trust by verifying the application's source and integrity.
- Prevents malicious actors from distributing tampered versions of the application.

### 8. Adherence to Electron Security Best Practices

**Purpose:**
Following Electron’s security guidelines ensures that the application minimizes vulnerabilities and adheres to industry standards for desktop applications.

**Implementation:**
- **Context Isolation:** Enabled to ensure that the renderer process runs in a separate context from the main process, preventing untrusted scripts from accessing Electron APIs.
- **Node Integration Disabled:** Prevents the renderer process from having direct access to Node.js APIs, reducing the attack surface.
- **Content Security Policy (CSP):** Implemented strict CSP headers to control the sources from which resources can be loaded, mitigating XSS attacks.
- **Sanitization of Inputs:** All user inputs and data received from external sources are sanitized and validated before processing.

**Benefits:**
- Reduces the risk of common security vulnerabilities such as Cross-Site Scripting (XSS) and Remote Code Execution (RCE).
- Ensures a secure environment for both development and production builds.

### 9. Logging and Monitoring

**Purpose:**
Maintaining logs helps in monitoring application behavior, diagnosing issues, and detecting potential security breaches.

**Implementation:**
- **Comprehensive Logging:** The application logs significant events, errors, and exceptions to a `main.log` file.
- **Timestamping:** Each log entry includes a timestamp to facilitate tracking and analysis.
- **Error Handling:** Implements robust error handling to catch and log unexpected errors and promise rejections, aiding in proactive issue resolution.

**Benefits:**
- Facilitates troubleshooting and maintenance by providing detailed insights into application operations.
- Enhances security by allowing for the detection and analysis of suspicious activities or anomalies.

---

## Summary of Security Enhancements

By integrating these comprehensive security techniques, the Secure Password Manager application ensures that user data is protected through multiple layers of security. These measures collectively provide a robust defense against unauthorized access, data breaches, and other potential security threats, fostering a secure and trustworthy user experience.

---

## Development

### Running in Development Mode

For development, you might want to run the frontend and backend separately to utilize hot reloading and easier debugging.

#### Frontend

Start the webpack development server with hot module replacement:

```bash
npm run dev
```

This will launch the frontend at `http://localhost:3000` and automatically refresh on code changes.

#### Backend

1. **Navigate to the Backend Directory:**

   ```bash
   cd backend
   ```

2. **Activate the Virtual Environment:**

   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```

3. **Run the Backend Script:**

   ```bash
   python backend.py
   ```

   This will start the Python backend process, which communicates with the Electron frontend.

#### Running Both Frontend and Backend Together

Open two separate terminal instances:

1. **Terminal 1:** Start the frontend.
   ```bash
   npm run dev
   ```

2. **Terminal 2:** Start the backend.
   ```bash
   cd backend
   source venv/bin/activate  # For macOS/Linux
   venv\Scripts\activate     # For Windows
   python backend.py
   ```

3. **Run the Electron App:**

   In the project root directory:
   ```bash
   npm run start
   ```

   This will launch the Electron application, connecting to the running backend and frontend.

---

## Troubleshooting

### Common Issues

- **Command Not Found Errors:**
  - **Ensure** that `npm`, `python`, and `pip` are installed and added to your system's `PATH`.
  
- **Permission Denied Errors:**
  - **Run** the setup or build scripts with appropriate permissions.
  - **Adjust** the permissions of your directories and files as necessary.
  
- **Virtual Environment Activation Fails:**
  - **Double-check** the paths to the activation scripts.
  - On Windows, ensure you're using `call` to run batch scripts if needed.
  
- **Python Module Errors:**
  - **Ensure** all Python dependencies are installed by running `pip install -r requirements.txt` in the `backend` directory.

### Verifying Installations

- **Node.js and npm:**
  ```bash
  node -v
  npm -v
  ```
  
- **Python and pip:**
  ```bash
  python --version
  pip --version
  ```
  
  On macOS/Linux, you might need to use `python3` and `pip3`:
  ```bash
  python3 --version
  pip3 --version
  ```

### Clearing Cache and Reinstalling

If you encounter persistent issues, try clearing npm cache and reinstalling dependencies:

```bash
npm cache clean --force
rm -rf node_modules
npm install
```

*(On Windows, you can delete the `node_modules` folder manually or use PowerShell commands.)*

### Specific Issues Encountered

- **Symbolic Link Creation Errors on Windows:**
  - **Solution:** Ensure Developer Mode is enabled or run the build process as an administrator.

- **`ERR_REQUIRE_ESM` Error:**
  - **Solution:** Downgrade `electron-is-dev` to version `2.0.0` to maintain compatibility with CommonJS modules.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Contact

For any questions or feedback, please reach out to:

- **Name:** Isaac [Your Last Name]
- **Email:** your.email@example.com
- **GitHub:** [yourusername](https://github.com/yourusername)

---

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the Repository**
2. **Create a New Branch**
   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. **Commit Your Changes**
   ```bash
   git commit -m "Add your message"
   ```
4. **Push to the Branch**
   ```bash
   git push origin feature/YourFeatureName
   ```
5. **Open a Pull Request**

Please ensure your contributions adhere to the project's coding standards and include relevant tests.

---

## Acknowledgments

- **Electron:** For providing the platform to build cross-platform desktop apps.
- **React:** For the frontend UI library.
- **PyCryptodome:** For cryptographic functions in Python.
- **SQLite:** For lightweight database management.
- **Material-UI:** For the React UI components.
- **Electron Builder:** For packaging and distributing the Electron application.

---

## Additional Notes

- **Python Version Compatibility:**
  - Ensure you are using Python version `3.10` or higher for optimal compatibility with PyInstaller and other dependencies.

- **Virtual Environment Management:**
  - The backend uses a Python virtual environment located in `backend/venv`. Ensure it's activated when running backend scripts manually.

- **Environment Variables:**
  - The build process relies on the `BUILD_TARGET` environment variable. This is handled automatically by the build scripts.

- **Logging:**
  - The application maintains a `main.log` file for monitoring and troubleshooting. Ensure appropriate permissions are set to allow the application to write logs.

- **Security Considerations:**
  - Always keep your dependencies updated to mitigate potential security vulnerabilities.
  - Regularly review and audit the application's security features, especially encryption and authentication mechanisms.