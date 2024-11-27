const { app, BrowserWindow, ipcMain, clipboard, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const isDev = require('electron-is-dev');

let pythonProcess;
let commandQueue = [];
let clipboardTimeout;

const logFile = path.join(app.getPath('userData'), 'main.log'); // Log file in userData directory

/**
 * Logs messages with timestamps to the main.log file.
 * @param {string} message - The message to log.
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
}

/**
 * Creates the main application window.
 */
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

  if (isDev) {
    win.loadURL('http://localhost:3000');
    // Optionally open the DevTools
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  win.on('closed', () => {
    log('Main window closed');
  });
}

/**
 * Starts the Python backend process with retry logic.
 * @param {number} retryCount - Current retry attempt.
 */
function startPythonProcess(retryCount = 0) {
  const maxRetries = 3;
  let backendExecutable = '';

  // Determine the backend executable based on the platform
  if (process.platform === 'win32') {
    backendExecutable = 'backend.exe';
  } else if (process.platform === 'darwin') {
    backendExecutable = 'backend'; // Assuming macOS backend
  } else if (process.platform === 'linux') {
    backendExecutable = 'backend'; // Assuming Linux backend
  } else {
    log(`Unsupported platform: ${process.platform}`);
    dialog.showErrorBox('Unsupported Platform', `Your platform (${process.platform}) is not supported.`);
    return;
  }

  // Determine the path to the backend executable
  const backendPath = isDev
    ? path.join(__dirname, 'backend', 'dist', process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'mac' : 'linux', backendExecutable)
    : path.join(process.resourcesPath, 'backend', backendExecutable);

  log(`Attempting to start backend executable at: ${backendPath}`);

  // Check if the backend executable exists
  if (!fs.existsSync(backendPath)) {
    log(`Backend executable not found at: ${backendPath}`);
    dialog.showErrorBox('Backend Not Found', `The backend executable was not found at: ${backendPath}\nPlease ensure it is built correctly.`);
    return;
  }

  // Spawn the backend process
  pythonProcess = spawn(backendPath, [], {
    cwd: path.dirname(backendPath),
    detached: true,
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true, // Hide the console window on Windows
  });

  // Handle stdout data from the backend
  pythonProcess.stdout.on('data', (data) => {
    const messages = data.toString().split('\n').filter(line => line.trim());
    messages.forEach(message => {
      try {
        const parsedResponse = JSON.parse(message);
        if (commandQueue.length > 0) {
          const { resolve } = commandQueue.shift();
          resolve(parsedResponse);
        } else {
          log('Received response but commandQueue is empty');
        }
      } catch (err) {
        log(`Error parsing Python response: ${err}`);
        console.error('Error parsing Python response:', err);
      }
    });
  });

  // Handle stderr data from the backend
  pythonProcess.stderr.on('data', (data) => {
    const errorMessage = data.toString();
    log(`Python stderr: ${errorMessage}`);
    console.error(`Python stderr: ${errorMessage}`);
  });

  // Handle errors when starting the backend process
  pythonProcess.on('error', (err) => {
    log(`Failed to start Python process: ${err}`);
    console.error('Failed to start Python process:', err);
    dialog.showErrorBox('Backend Error', `Failed to start the backend process:\n${err.message}`);
    if (retryCount < maxRetries) {
      log(`Retrying to start backend process (${retryCount + 1}/${maxRetries})`);
      setTimeout(() => startPythonProcess(retryCount + 1), 3000); // Retry after 3 seconds
    } else {
      log('Max retries reached. Could not start backend process.');
      dialog.showErrorBox('Backend Error', 'Could not start the backend process after multiple attempts. The application will now exit.');
      app.quit();
    }
  });

  // Handle backend process exit
  pythonProcess.on('close', (code) => {
    log(`Python process exited with code ${code}`);
    console.warn(`Python process exited with code ${code}`);
    dialog.showErrorBox('Backend Crashed', `The backend process has exited unexpectedly with code ${code}. The application will now exit.`);
    app.quit();
  });

  // Handle backend process exit with signal
  pythonProcess.on('exit', (code, signal) => {
    log(`Python process exited with code ${code}, signal ${signal}`);
    console.warn(`Python process exited with code ${code}, signal ${signal}`);
    if (code !== 0) {
      dialog.showErrorBox('Backend Crashed', `The backend process exited with code ${code}. The application will now exit.`);
      app.quit();
    }
  });

  log('Python backend process started');
}

/**
 * Sends commands to the Python backend process.
 * @param {string} command - The command to send.
 * @param {object} data - The data associated with the command.
 * @returns {Promise<object>} - The response from the backend.
 */
function sendCommandToPython(command, data) {
  return new Promise((resolve, reject) => {
    if (!pythonProcess || pythonProcess.killed) {
      const errorMsg = 'Python process is not running';
      log(`sendCommandToPython error: ${errorMsg}`);
      return reject(new Error(errorMsg));
    }

    const message = JSON.stringify({ command, data }) + '\n';
    commandQueue.push({ resolve, reject });

    pythonProcess.stdin.write(message, (err) => {
      if (err) {
        log(`Failed to write to Python process stdin: ${err}`);
        reject(err);
      } else {
        log(`Sent command to Python backend: ${command}`);
      }
    });
  });
}

/**
 * Handles the creation of the application window and starts the backend process.
 */
app.whenReady().then(() => {
  log('Electron app is ready');
  createWindow();
  startPythonProcess();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      log('Re-created main window on activate');
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  log('All windows closed');
  if (process.platform !== 'darwin') {
    if (pythonProcess) {
      log('Killing Python backend process');
      pythonProcess.kill();
    }
    app.quit();
  }
});

/**
 * Handles cleanup before the application quits.
 */
app.on('before-quit', () => {
  log('Application is quitting');
  clipboard.clear();
  if (pythonProcess) {
    log('Terminating Python backend process');
    pythonProcess.kill();
  }
});

// IPC handlers with enhanced logging and error handling

ipcMain.handle('set-master-password', async (event, masterPassword) => {
  try {
    log('IPC: set-master-password invoked');
    const response = await sendCommandToPython('set_master_password', { master_password: masterPassword });
    log(`IPC: set-master-password response: ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    log(`Error in set-master-password IPC handler: ${error}`);
    console.error('Error in set-master-password IPC handler:', error);
    dialog.showErrorBox('Error', `Failed to set master password: ${error.message}`);
    throw error;
  }
});

ipcMain.handle('add-password', async (event, data) => {
  try {
    log('IPC: add-password invoked');
    const response = await sendCommandToPython('add_password', data);
    log(`IPC: add-password response: ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    log(`Error in add-password IPC handler: ${error}`);
    console.error('Error in add-password IPC handler:', error);
    dialog.showErrorBox('Error', `Failed to add password: ${error.message}`);
    throw error;
  }
});

ipcMain.handle('update-password', async (event, data) => {
  try {
    log('IPC: update-password invoked');
    const response = await sendCommandToPython('update_password', data);
    log(`IPC: update-password response: ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    log(`Error in update-password IPC handler: ${error}`);
    console.error('Error in update-password IPC handler:', error);
    dialog.showErrorBox('Error', `Failed to update password: ${error.message}`);
    throw error;
  }
});

ipcMain.handle('delete-password', async (event, data) => {
  try {
    log('IPC: delete-password invoked');
    const response = await sendCommandToPython('delete_password', data);
    log(`IPC: delete-password response: ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    log(`Error in delete-password IPC handler: ${error}`);
    console.error('Error in delete-password IPC handler:', error);
    dialog.showErrorBox('Error', `Failed to delete password: ${error.message}`);
    throw error;
  }
});

ipcMain.handle('get-passwords', async () => {
  try {
    log('IPC: get-passwords invoked');
    const response = await sendCommandToPython('get_passwords', {});
    log(`IPC: get-passwords response: ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    log(`Error in get-passwords IPC handler: ${error}`);
    console.error('Error in get-passwords IPC handler:', error);
    dialog.showErrorBox('Error', `Failed to retrieve passwords: ${error.message}`);
    throw error;
  }
});

ipcMain.handle('is-master-password-set', async () => {
  try {
    log('IPC: is-master-password-set invoked');
    const response = await sendCommandToPython('is_master_password_set', {});
    log(`IPC: is-master-password-set response: ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    log(`Error in is-master-password-set IPC handler: ${error}`);
    console.error('Error in is-master-password-set IPC handler:', error);
    dialog.showErrorBox('Error', `Failed to check master password status: ${error.message}`);
    throw error;
  }
});

ipcMain.handle('setup-mfa', async () => {
  try {
    log('IPC: setup-mfa invoked');
    const response = await sendCommandToPython('setup_mfa', {});
    log(`IPC: setup-mfa response: ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    log(`Error in setup-mfa IPC handler: ${error}`);
    console.error('Error in setup-mfa IPC handler:', error);
    dialog.showErrorBox('Error', `Failed to set up MFA: ${error.message}`);
    throw error;
  }
});

ipcMain.handle('verify-mfa', async (event, token) => {
  try {
    log('IPC: verify-mfa invoked');
    const response = await sendCommandToPython('verify_mfa', { token });
    log(`IPC: verify-mfa response: ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    log(`Error in verify-mfa IPC handler: ${error}`);
    console.error('Error in verify-mfa IPC handler:', error);
    dialog.showErrorBox('Error', `Failed to verify MFA: ${error.message}`);
    throw error;
  }
});

ipcMain.handle('is-mfa-enabled', async () => {
  try {
    log('IPC: is-mfa-enabled invoked');
    const response = await sendCommandToPython('is_mfa_enabled', {});
    log(`IPC: is-mfa-enabled response: ${JSON.stringify(response)}`);
    return response;
  } catch (error) {
    log(`Error in is-mfa-enabled IPC handler: ${error}`);
    console.error('Error in is-mfa-enabled IPC handler:', error);
    dialog.showErrorBox('Error', `Failed to check MFA status: ${error.message}`);
    throw error;
  }
});

ipcMain.handle('copy-to-clipboard', async (event, text) => {
  try {
    log('IPC: copy-to-clipboard invoked');
    clipboard.writeText(text);

    // Clear any existing timeout
    if (clipboardTimeout) {
      clearTimeout(clipboardTimeout);
    }

    // Set a timeout to clear the clipboard after 15 seconds
    clipboardTimeout = setTimeout(() => {
      clipboard.clear();
      clipboardTimeout = null;
      log('Clipboard cleared after 15 seconds');
    }, 15000); // 15000 milliseconds = 15 seconds

    log('Copied text to clipboard and set timeout to clear');
    return { status: 'success' };
  } catch (error) {
    log(`Error copying to clipboard: ${error}`);
    console.error('Error copying to clipboard:', error);
    dialog.showErrorBox('Error', `Failed to copy to clipboard: ${error.message}`);
    return { status: 'error', message: error.message };
  }
});

/**
 * Handles uncaught exceptions and unhandled promise rejections.
 */
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error}`);
  console.error('An uncaught error occurred:', error);
  dialog.showErrorBox('Uncaught Exception', `An unexpected error occurred:\n${error.message}`);
  app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled promise rejection: ${reason}`);
  console.error('Unhandled promise rejection:', reason);
  dialog.showErrorBox('Unhandled Rejection', `An unexpected promise rejection occurred:\n${reason}`);
  app.quit();
});
