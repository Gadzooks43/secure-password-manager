# Secure Password Manager

A secure and user-friendly password manager application that leverages strong encryption techniques and multi-factor authentication to enhance user security.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Windows](#windows)
  - [macOS](#macos)
  - [Linux](#linux)
- [Usage](#usage)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact](#contact)
- [Additional Notes](#additional-notes)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)

---

## Prerequisites

Before setting up the project, ensure you have the following software installed on your system:

- Node.js (version 14.x or higher)
- npm (comes with Node.js)
- Python (version 3.6 or higher)
- pip (Python package manager)
- Git (for version control)

---

## Project Structure

```plaintext
secure-password-manager/
├── backend/
│   ├── backend.py
│   ├── requirements.txt
│   └── (other backend files)
├── public/
│   └── index.html
├── src/
│   ├── index.jsx
│   └── App.jsx
├── .babelrc
├── .gitignore
├── package.json
├── package-lock.json
├── webpack.config.js
├── main.js
├── preload.js
├── README.md
└── setup_and_run.sh / setup_and_run.bat
```
---

## Setup Instructions

### Windows
Clone the Repository

Open Command Prompt or PowerShell and clone the repository:

```bash
git clone https://github.com/yourusername/secure-password-manager.git
cd secure-password-manager
```
Run the Setup Script

In the project root directory, run:

```bash
setup_and_run.bat
```
This script will:
- Install frontend dependencies using npm install.
- Navigate to the backend directory, create and activate a virtual environment, and install backend dependencies.
- Start the application using npm run start.

Usage
- After running the setup script, the application should start automatically. If it doesn't, you can start it manually:

```bash
npm run start
```

### macOS
Clone the Repository

Open Terminal and clone the repository:

```bash
git clone https://github.com/yourusername/secure-password-manager.git
cd secure-password-manager
```
Make the Setup Script Executable

```bash
chmod +x setup_and_run.sh
```
Run the Setup Script

```bash
./setup_and_run.sh
```
This script will:
- Install frontend dependencies using npm install.
- Navigate to the backend directory, create and activate a virtual environment, and install backend dependencies.
- Start the application using npm run start.

Usage
- After running the setup script, the application should start automatically. If it doesn't, you can start it manually:

```bash
npm run start
```

### Linux
Clone the Repository

Open Terminal and clone the repository:

```bash
git clone https://github.com/yourusername/secure-password-manager.git
cd secure-password-manager
```
Make the Setup Script Executable

```bash
chmod +x setup_and_run.sh
```
Run the Setup Script

```bash
./setup_and_run.sh
```
This script will:
- Install frontend dependencies using npm install.
- Navigate to the backend directory, create and activate a virtual environment, and install backend dependencies.
- Start the application using npm run start.

Usage
- After running the setup script, the application should start automatically. If it doesn't, you can start it manually:

```bash
npm run start
```


## Application Features
- Master Password Setup: Upon first launch, you will be prompted to set a master password.
- Add Passwords: You can add new password entries for different sites.
- View Passwords: Stored passwords are displayed in a list.
= Security: Passwords are encrypted using strong encryption algorithms.
## Development

### Running in Development Mode
For development, you might want to run the frontend and backend separately.

#### Frontend
```bash
npm run dev
```

This will start the webpack development server with hot module replacement.

#### Backend
Navigate to the backend directory, activate the virtual environment, and run the backend script:

```bash
cd backend
source venv/bin/activate  # For macOS/Linux
venv\Scripts\activate     # For Windows
python backend.py
```

## Troubleshooting
Common Issues

- Command Not Found Errors:
    - Ensure that npm, python, and pip are installed and added to your system's PATH.

- Permission Denied Errors:
    - Run the script with appropriate permissions or adjust the permissions of your directories and files.

- Virtual Environment Activation Fails:
    - Double-check the paths to the activation scripts.
    - On Windows, ensure you're using call to run batch scripts.

Python Module Errors:
- Ensure all Python dependencies are installed by running pip install -r requirements.txt in the backend directory.

Verifying Installations
Node.js and npm:

```bash
node -v
npm -v
Python and pip:
```

```bash
python --version
pip --version
On macOS/Linux, you might need to use python3 and pip3:
```
```bash
python3 --version
pip3 --version
Clearing Cache and Reinstalling
If you encounter persistent issues, try clearing npm cache and reinstalling dependencies:
```
```bash
npm cache clean --force
rm -rf node_modules
npm install
```
## License
This project is licensed under the MIT License.

## Acknowledgments
Electron: For providing the platform to build cross-platform desktop apps.

React: For the frontend UI library.

PyCryptodome: For cryptographic functions in Python.

SQLite: For lightweight database management.