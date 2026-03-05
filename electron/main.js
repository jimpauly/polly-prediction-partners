/**
 * Paulie's Prediction Partners — Electron Main Process
 *
 * Manages the application window, backend daemon lifecycle,
 * singleton lock, and secure credential storage.
 */

const { app, BrowserWindow, dialog, Menu, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const APPLICATION_NAME = "Paulie's Prediction Partners";
const BACKEND_PORT = 8000;
const BACKEND_HOST = '127.0.0.1';
const WINDOW_WIDTH = 1920;
const WINDOW_HEIGHT = 1080;

/* ------------------------------------------------------------------ */
/* Singleton lock                                                      */
/* ------------------------------------------------------------------ */

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  dialog.showErrorBox(
    APPLICATION_NAME,
    'Another instance is already running. Only one copy can run at a time.'
  );
  app.quit();
}

/* ------------------------------------------------------------------ */
/* Paths                                                               */
/* ------------------------------------------------------------------ */

function getUserDataPath() {
  return app.getPath('userData');
}

function getBackendPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'backend');
  }
  return path.join(__dirname, '..', 'copilot-opus', 'backend');
}

function getPythonExecutable() {
  if (process.platform === 'win32') {
    return 'python';
  }
  return 'python3';
}

/* ------------------------------------------------------------------ */
/* Backend daemon management                                           */
/* ------------------------------------------------------------------ */

let backendProcess = null;

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port, BACKEND_HOST);
  });
}

async function startBackendDaemon() {
  const portInUse = await isPortInUse(BACKEND_PORT);
  if (portInUse) {
    console.log(`Backend already running on ${BACKEND_HOST}:${BACKEND_PORT}`);
    return;
  }

  const backendDirectory = getBackendPath();
  const pythonExecutable = getPythonExecutable();
  const parentDirectory = path.dirname(backendDirectory);

  console.log(`Starting backend: ${pythonExecutable} -m uvicorn backend.main:main`);
  console.log(`Backend directory: ${backendDirectory}`);

  backendProcess = spawn(pythonExecutable, [
    '-m', 'uvicorn',
    'backend.main:main',
    '--host', BACKEND_HOST,
    '--port', String(BACKEND_PORT),
  ], {
    cwd: parentDirectory,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PAULIES_HOST: BACKEND_HOST,
      PAULIES_PORT: String(BACKEND_PORT),
    },
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[backend] ${data.toString().trim()}`);
  });

  backendProcess.on('exit', (code) => {
    console.log(`Backend exited with code ${code}`);
    backendProcess = null;
  });

  await waitForBackend(15000);
}

function waitForBackend(timeoutMilliseconds) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      const socket = new net.Socket();
      socket.setTimeout(500);
      socket.once('connect', () => {
        socket.destroy();
        console.log('Backend is ready');
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - startTime > timeoutMilliseconds) {
          reject(new Error('Backend failed to start within timeout'));
        } else {
          setTimeout(check, 500);
        }
      });
      socket.once('timeout', () => {
        socket.destroy();
        if (Date.now() - startTime > timeoutMilliseconds) {
          reject(new Error('Backend failed to start within timeout'));
        } else {
          setTimeout(check, 500);
        }
      });
      socket.connect(BACKEND_PORT, BACKEND_HOST);
    }
    check();
  });
}

function stopBackendDaemon() {
  if (backendProcess) {
    console.log('Stopping backend daemon...');
    backendProcess.kill('SIGTERM');
    backendProcess = null;
  }
}

/* ------------------------------------------------------------------ */
/* Window                                                              */
/* ------------------------------------------------------------------ */

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: 1280,
    minHeight: 720,
    title: APPLICATION_NAME,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    show: false,
  });

  const indexPath = path.join(__dirname, '..', 'copilot-opus', 'index.html');
  mainWindow.loadFile(indexPath);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  /* Disable DevTools in production */
  if (app.isPackaged) {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  /* Open external links in system browser */
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

/* ------------------------------------------------------------------ */
/* Menu                                                                */
/* ------------------------------------------------------------------ */

function createApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'GitHub Repository',
          click: () => shell.openExternal('https://github.com/jimpauly/paulies-prediction-partners'),
        },
        {
          label: 'Report an Issue',
          click: () => shell.openExternal('https://github.com/jimpauly/paulies-prediction-partners/issues'),
        },
        { type: 'separator' },
        {
          label: `About ${APPLICATION_NAME}`,
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: `About ${APPLICATION_NAME}`,
              message: APPLICATION_NAME,
              detail: 'AI-Powered Prediction Market Trading Studio\nFree · Open Source · No Ads\n\nhttps://github.com/jimpauly/paulies-prediction-partners',
            });
          },
        },
      ],
    },
  ];

  if (!app.isPackaged) {
    template[1].submenu.push(
      { type: 'separator' },
      { role: 'toggleDevTools' }
    );
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ------------------------------------------------------------------ */
/* App lifecycle                                                       */
/* ------------------------------------------------------------------ */

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  createApplicationMenu();

  try {
    await startBackendDaemon();
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    dialog.showErrorBox(
      APPLICATION_NAME,
      `Could not start the trading backend.\n\nMake sure Python 3.12+ is installed and the backend dependencies are available.\n\nError: ${error.message}`
    );
  }

  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopBackendDaemon();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('before-quit', () => {
  stopBackendDaemon();
});
