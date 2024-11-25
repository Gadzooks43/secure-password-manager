// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let pythonProcess;
let commandQueue = [];

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

  // Load the index.html of the app.
  win.loadURL(`file://${path.join(__dirname, 'build/index.html')}`);

  // Optionally open the DevTools (uncomment to use)
  // win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object
    // win = null; // Uncomment if win is declared with let outside the function
  });
}

// Function to start the Python backend process
function startPythonProcess() {
  // Adjust the path to your Python script as necessary
  pythonProcess = spawn('python', [path.join(__dirname, 'backend', 'backend.py')]);

  pythonProcess.stdout.on('data', (data) => {
    const responses = data.toString().split('\n').filter(line => line.trim());
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
    // On macOS, re-create a window when the dock icon is clicked and no other windows are open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Terminate the Python process when the app is quitting
    if (pythonProcess) {
      pythonProcess.kill();
    }
    app.quit();
  }
});

// IPC handlers for communication between renderer and main process
ipcMain.handle('set-master-password', async (event, masterPassword) => {
  try {
    const response = await sendCommandToPython('set_master_password', { master_password: masterPassword });
    return response;
  } catch (error) {
    console.error('Error in set-master-password IPC handler:', error);
    throw error;
  }
});

ipcMain.handle('add-password', async (event, data) => {
  try {
    const response = await sendCommandToPython('add_password', data);
    return response;
  } catch (error) {
    console.error('Error in add-password IPC handler:', error);
    throw error;
  }
});

ipcMain.handle('get-passwords', async () => {
  try {
    const response = await sendCommandToPython('get_passwords', {});
    return response;
  } catch (error) {
    console.error('Error in get-passwords IPC handler:', error);
    throw error;
  }
});

// Handle unexpected errors
process.on('uncaughtException', (error) => {
  console.error('An uncaught error occurred:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
});
