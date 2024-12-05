#!/usr/bin/env bash
# Script to set up and run the Secure Password Manager

set -e  # Exit immediately if a command exits with a non-zero status

# Function to print error messages
function error_exit {
    echo "$1" >&2
    exit 1
}

echo "========================================"
echo "Installing frontend dependencies..."
echo "========================================"
npm install

echo "========================================"
echo "Setting up the Python backend..."
echo "========================================"
cd backend || error_exit "Backend directory not found."

echo "Creating virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
# shellcheck disable=SC1091
source venv/bin/activate

echo "Upgrading pip..."
pip install --upgrade pip

echo "Installing backend dependencies..."
pip install -r requirements.txt

echo "========================================"
echo "Returning to root directory..."
echo "========================================"
cd ..

echo "========================================"
echo "Starting the application..."
echo "========================================"
npm run start
