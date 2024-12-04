@echo off
REM Script to set up and run the Secure Password Manager

echo ========================================
echo Installing frontend dependencies...
echo ========================================
call npm install
echo After npm install...
IF %ERRORLEVEL% NEQ 0 (
    echo Error installing frontend dependencies.
    EXIT /B 1
)

echo ========================================
echo Setting up the Python backend...
echo ========================================
cd backend

echo Creating virtual environment...
call python -m venv venv
IF %ERRORLEVEL% NEQ 0 (
    echo Error creating virtual environment.
    EXIT /B 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat
IF %ERRORLEVEL% NEQ 0 (
    echo Error activating virtual environment.
    EXIT /B 1
)

echo Installing backend dependencies...
call pip install -r requirements.txt
IF %ERRORLEVEL% NEQ 0 (
    echo Error installing backend dependencies.
    call deactivate.bat
    EXIT /B 1
)

cd ..

echo ========================================
echo Starting the application...
echo ========================================
call npm run start
