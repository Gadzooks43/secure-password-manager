const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let pythonProcess;
let commandQueue = [];
let clipboardTimeout;

const logFile = 'main.log';

function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `${timestamp} - ${message}\n`);
}

// Function to create the main application window
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Important for security
      contextIsolation: true, // Important for security
    },
  });

  win.loadURL(`file://${path.join(__dirname, 'build/index.html')}`);

  // Optionally open the DevTools
  // win.webContents.openDevTools();
}

// Function to start the Python backend process
function startPythonProcess() {
  const isDev = process.env.NODE_ENV === 'development';

  let pythonExecutable = 'python';
  let scriptPath = path.join(__dirname, 'backend', 'backend.py');

  pythonProcess = spawn(pythonExecutable, [scriptPath]);

  pythonProcess.stdout.on('data', (data) => {
    const responses = data.toString().split('\n').filter((line) => line.trim());
    responses.forEach((response) => {
      try {
        const parsedResponse = JSON.parse(response);
        const { resolve } = commandQueue.shift();
        resolve(parsedResponse);
      } catch (err) {
        console.error('Error parsing Python response:', err);
      }
    });
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });
}

// Function to send commands to the Python backend
function sendCommandToPython(command, data) {
  return new Promise((resolve, reject) => {
    const message = JSON.stringify({ command, data }) + '\n';
    commandQueue.push({ resolve, reject });

    if (pythonProcess && pythonProcess.stdin.writable) {
      pythonProcess.stdin.write(message);
    } else {
      reject(new Error('Python process is not running'));
    }
  });
}

// Event handler for when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  startPythonProcess();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (pythonProcess) {
      pythonProcess.kill();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  clipboard.clear();
});


// IPC handlers
ipcMain.handle('set-master-password', async (event, masterPassword) => {
  try {
    const response = await sendCommandToPython('set_master_password', { master_password: masterPassword });
    return response;
  } catch (error) {
    log(`Error in set-master-password IPC handler: ${error}`);
    console.error('Error in set-master-password IPC handler:', error);
    throw error;
  }
});

ipcMain.handle('add-password', async (event, data) => {
  try {
    const response = await sendCommandToPython('add_password', data);
    return response;
  } catch (error) {
    log(`Error in add-password IPC handler: ${error}`);
    console.error('Error in add-password IPC handler:', error);
    throw error;
  }
});

ipcMain.handle('update-password', async (event, data) => {
  try {
    const response = await sendCommandToPython('update_password', data);
    return response;
  } catch (error) {
    log(`Error in update-password IPC handler: ${error}`);
    console.error('Error in update-password IPC handler:', error);
    throw error;
  }
});

ipcMain.handle('delete-password', async (event, data) => {
  try {
    const response = await sendCommandToPython('delete_password', data);
    return response;
  } catch (error) {
    log(`Error in delete-password IPC handler: ${error}`);
    console.error('Error in delete-password IPC handler:', error);
    throw error;
  }
});

ipcMain.handle('get-passwords', async () => {
  try {
    const response = await sendCommandToPython('get_passwords', {});
    return response;
  } catch (error) {
    log(`Error in get-passwords IPC handler: ${error}`);
    console.error('Error in get-passwords IPC handler:', error);
    throw error;
  }
});

ipcMain.handle('is-master-password-set', async () => {
  try {
    const response = await sendCommandToPython('is_master_password_set', {});
    return response;
  } catch (error) {
    log(`Error in is-master-password-set IPC handler: ${error}`);
    console.error('Error in is-master-password-set IPC handler:', error);
    throw error;
  }
});

ipcMain.handle('setup-mfa', async () => {
  try {
    const response = await sendCommandToPython('setup_mfa', {});
    return response;
  } catch (error) {
    log(`Error in setup-mfa IPC handler: ${error}`);
    console.error('Error in setup-mfa IPC handler:', error);
    throw error;
  }
});

ipcMain.handle('verify-mfa', async (event, token) => {
  try {
    const response = await sendCommandToPython('verify_mfa', { token });
    return response;
  } catch (error) {
    log(`Error in verify-mfa IPC handler: ${error}`);
    console.error('Error in verify-mfa IPC handler:', error);
    throw error;
  }
});

ipcMain.handle('is-mfa-enabled', async () => {
  try {
    const response = await sendCommandToPython('is_mfa_enabled', {});
    return response;
  } catch (error) {
    log(`Error in is-mfa-enabled IPC handler: ${error}`);
    console.error('Error in is-mfa-enabled IPC handler:', error);
    throw error;
  }
});

ipcMain.handle('copy-to-clipboard', async (event, text) => {
  try {
    clipboard.writeText(text);

    // Clear any existing timeout
    if (clipboardTimeout) {
      clearTimeout(clipboardTimeout);
    }

    // Set a timeout to clear the clipboard after 15 seconds
    clipboardTimeout = setTimeout(() => {
      clipboard.clear();
      clipboardTimeout = null;
    }, 15000); // 15000 milliseconds = 15 seconds

    return { status: 'success' };
  } catch (error) {
    log(`Error copying to clipboard: ${error}`);
    console.error('Error copying to clipboard:', error);
    return { status: 'error', message: error.message };
  }
});

// Handle unexpected errors
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error}`);
  console.error('An uncaught error occurred:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled promise rejection: ${reason}`);
  console.error('Unhandled promise rejection:', reason);
});
