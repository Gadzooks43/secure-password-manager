#!/bin/bash
# Script to set up and run the Secure Password Manager

echo "========================================"
echo "Installing frontend dependencies..."
echo "========================================"
npm install
if [ $? -ne 0 ]; then
    echo "Error installing frontend dependencies."
    exit 1
fi

echo "========================================"
echo "Setting up the Python backend..."
echo "========================================"
cd backend

echo "Creating virtual environment..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "Error creating virtual environment."
    exit 1
fi

echo "Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "Error activating virtual environment."
    exit 1
fi

echo "Installing backend dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Error installing backend dependencies."
    deactivate
    exit 1
fi

echo "Deactivating virtual environment..."
deactivate

cd ..

echo "========================================"
echo "Starting the application..."
echo "========================================"
npm run start
