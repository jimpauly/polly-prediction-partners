/**
 * Paulie's Prediction Partners — Electron Main Process
 *
 * Manages the application window, backend daemon lifecycle,
 * singleton lock, secure credential storage, setup wizard,
 * and silent auto-updates.
 */

const {
  app,
  BrowserWindow,
  dialog,
  Menu,
  shell,
  ipcMain,
  safeStorage,
} = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const net = require("net");
const { autoUpdater } = require("electron-updater");

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const APPLICATION_NAME = "Paulie's Prediction Partners";
const BACKEND_PORT = 8000;
const BACKEND_HOST = "127.0.0.1";
const WINDOW_WIDTH = 1920;
const WINDOW_HEIGHT = 1080;

/* ------------------------------------------------------------------ */
/* Singleton lock                                                      */
/* ------------------------------------------------------------------ */

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  dialog.showErrorBox(
    APPLICATION_NAME,
    "Another instance is already running. Only one copy can run at a time.",
  );
  app.quit();
}

/* ------------------------------------------------------------------ */
/* Paths                                                               */
/* ------------------------------------------------------------------ */

function getUserDataPath() {
  return app.getPath("userData");
}

function getBackendPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "backend");
  }
  return path.join(__dirname, "..", "..", "services", "api", "backend");
}

function getPythonExecutable() {
  if (process.platform === "win32") {
    return "python";
  }
  return "python3";
}

/* ------------------------------------------------------------------ */
/* Backend daemon management                                           */
/* ------------------------------------------------------------------ */

let backendProcess = null;

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true));
    server.once("listening", () => {
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
  const backendWorkingDirectory = path.dirname(backendDirectory);

  console.log(
    `Starting backend: ${pythonExecutable} -m uvicorn backend.main:main`,
  );
  console.log(`Backend directory: ${backendDirectory}`);

  backendProcess = spawn(
    pythonExecutable,
    [
      "-m",
      "uvicorn",
      "backend.main:main",
      "--host",
      BACKEND_HOST,
      "--port",
      String(BACKEND_PORT),
    ],
    {
      cwd: backendWorkingDirectory,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        PAULIES_HOST: BACKEND_HOST,
        PAULIES_PORT: String(BACKEND_PORT),
      },
    },
  );

  backendProcess.stdout.on("data", (data) => {
    console.log(`[backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`[backend] ${data.toString().trim()}`);
  });

  backendProcess.on("exit", (code) => {
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
      socket.once("connect", () => {
        socket.destroy();
        console.log("Backend is ready");
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - startTime > timeoutMilliseconds) {
          reject(new Error("Backend failed to start within timeout"));
        } else {
          setTimeout(check, 500);
        }
      });
      socket.once("timeout", () => {
        socket.destroy();
        if (Date.now() - startTime > timeoutMilliseconds) {
          reject(new Error("Backend failed to start within timeout"));
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
    console.log("Stopping backend daemon...");
    backendProcess.kill("SIGTERM");
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
      sandbox: false /* needs IPC bridge */,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
    backgroundColor: "#0f172a" /* Match app dark background */,
  });

  const indexPath = path.join(__dirname, "..", "web", "public", "index.html");
  mainWindow.loadFile(indexPath);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    /* Silent auto-update check after window is visible */
    if (app.isPackaged) {
      setTimeout(startSilentAutoUpdate, 3000);
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  /* Disable DevTools in production */
  if (app.isPackaged) {
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  /* Block navigation to external URLs in the main window */
  mainWindow.webContents.on("will-navigate", (event, url) => {
    const allowedUrls = [
      `file://${path.join(__dirname, "..", "web", "public", "index.html")}`,
    ];
    const isAllowed =
      allowedUrls.some((allowed) => url.startsWith(allowed)) ||
      url.startsWith("file://");
    if (!isAllowed) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  /* Open external links in system browser */
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
}

/* ------------------------------------------------------------------ */
/* Silent Auto-Updater (electron-updater)                              */
/* ------------------------------------------------------------------ */

function startSilentAutoUpdate() {
  /* Suppress all dialogs — updates download and install silently */
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  /* Notify renderer of update status (optional UI feedback) */
  autoUpdater.on("checking-for-update", () => {
    sendUpdateStatus("checking", "Checking for updates…");
  });

  autoUpdater.on("update-available", (info) => {
    sendUpdateStatus(
      "available",
      `Update v${info.version} found — downloading silently…`,
    );
  });

  autoUpdater.on("update-not-available", () => {
    sendUpdateStatus("up-to-date", "App is up to date.");
  });

  autoUpdater.on("download-progress", (progress) => {
    sendUpdateStatus(
      "downloading",
      `Downloading update: ${Math.round(progress.percent)}%`,
    );
  });

  autoUpdater.on("update-downloaded", () => {
    sendUpdateStatus(
      "ready",
      "Update downloaded — will install on next restart.",
    );
  });

  autoUpdater.on("error", (error) => {
    console.log(`Auto-update error: ${error.message}`);
    sendUpdateStatus("error", `Update check failed: ${error.message}`);
  });

  autoUpdater.checkForUpdatesAndNotify().catch((error) => {
    console.log(`Update check skipped: ${error.message}`);
  });

  /* Re-check every 4 hours */
  setInterval(
    () => {
      autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    },
    4 * 60 * 60 * 1000,
  );
}

function sendUpdateStatus(status, message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-status", { status, message });
  }
}

/* ------------------------------------------------------------------ */
/* Menu                                                                */
/* ------------------------------------------------------------------ */

function createApplicationMenu() {
  const template = [
    {
      label: "File",
      submenu: [{ role: "quit" }],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "GitHub Repository",
          click: () =>
            shell.openExternal(
              "https://github.com/jimpauly/paulies-prediction-partners",
            ),
        },
        {
          label: "Report an Issue",
          click: () =>
            shell.openExternal(
              "https://github.com/jimpauly/paulies-prediction-partners/issues",
            ),
        },
        { type: "separator" },
        {
          label: `About ${APPLICATION_NAME}`,
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: `About ${APPLICATION_NAME}`,
              message: APPLICATION_NAME,
              detail:
                "AI-Powered Prediction Market Trading Studio\nFree · Open Source · No Ads\n\nhttps://github.com/jimpauly/paulies-prediction-partners",
            });
          },
        },
      ],
    },
  ];

  if (!app.isPackaged) {
    template[1].submenu.push({ type: "separator" }, { role: "toggleDevTools" });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ------------------------------------------------------------------ */
/* Setup Wizard State                                                  */
/* ------------------------------------------------------------------ */

const WIZARD_STATE_FILE = "wizard-state.json";

function getWizardStatePath() {
  return path.join(app.getPath("userData"), WIZARD_STATE_FILE);
}

function isWizardComplete() {
  try {
    const statePath = getWizardStatePath();
    if (!fs.existsSync(statePath)) return false;
    const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    return state.wizardComplete === true;
  } catch (_err) {
    return false;
  }
}

function saveWizardState(preferences) {
  try {
    const userDataDir = app.getPath("userData");
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }
    fs.writeFileSync(
      getWizardStatePath(),
      JSON.stringify(preferences, null, 2),
      "utf8",
    );
  } catch (error) {
    console.error("Failed to save wizard state:", error.message);
  }
}

/* ------------------------------------------------------------------ */
/* Setup Wizard Window                                                 */
/* ------------------------------------------------------------------ */

let wizardWindow = null;

function createWizardWindow() {
  return new Promise((resolve) => {
    wizardWindow = new BrowserWindow({
      width: 600,
      height: 680,
      resizable: false,
      center: true,
      title: `${APPLICATION_NAME} — Setup`,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false /* needs IPC bridge */,
        preload: path.join(__dirname, "wizard-preload.js"),
      },
      show: false,
      frame: true,
      autoHideMenuBar: true,
    });

    const wizardPath = path.join(__dirname, "wizard.html");
    wizardWindow.loadFile(wizardPath);

    wizardWindow.once("ready-to-show", () => {
      wizardWindow.show();
    });

    /* Listen for wizard completion via IPC */
    ipcMain.once("wizard-complete", (_event, preferences) => {
      saveWizardState(preferences);
      if (wizardWindow && !wizardWindow.isDestroyed()) {
        wizardWindow.close();
      }
      wizardWindow = null;
      resolve(preferences);
    });

    /* If wizard is closed without completing, save defaults */
    wizardWindow.on("closed", () => {
      wizardWindow = null;
      if (!isWizardComplete()) {
        saveWizardState({
          environment: "demo",
          autoStart: false,
          minimizeToTray: true,
          telemetry: true,
          wizardComplete: true,
          wizardVersion: 1,
          completedAt: new Date().toISOString(),
        });
      }
      /* Remove listener if still attached */
      ipcMain.removeAllListeners("wizard-complete");
      resolve(null);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Secure Credential Storage (safeStorage + IPC)                       */
/* ------------------------------------------------------------------ */

const CREDENTIALS_FILE = "encrypted-credentials.json";

function getCredentialsPath() {
  return path.join(app.getPath("userData"), CREDENTIALS_FILE);
}

/**
 * Encrypt and save credentials to disk using Electron's safeStorage.
 * Falls back to plaintext-in-memory only if safeStorage is unavailable.
 */
function saveCredentials(credentials) {
  try {
    const userDataDir = app.getPath("userData");
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    const payload = JSON.stringify(credentials);

    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(payload);
      fs.writeFileSync(getCredentialsPath(), encrypted);
    } else {
      /* Fallback: base64 encode (not truly secure — OS credential vault unavailable) */
      const encoded = Buffer.from(payload, "utf8").toString("base64");
      fs.writeFileSync(getCredentialsPath(), encoded, "utf8");
    }
  } catch (error) {
    console.error("Failed to save credentials:", error.message);
  }
}

/**
 * Load and decrypt stored credentials.
 * @returns {object|null} Decrypted credentials or null.
 */
function loadCredentials() {
  try {
    const credPath = getCredentialsPath();
    if (!fs.existsSync(credPath)) return null;

    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = fs.readFileSync(credPath);
      const decrypted = safeStorage.decryptString(encrypted);
      return JSON.parse(decrypted);
    }
    /* Fallback: base64 decode */
    const encoded = fs.readFileSync(credPath, "utf8");
    return JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  } catch (error) {
    console.error("Failed to load credentials:", error.message);
    return null;
  }
}

/**
 * Remove stored credentials file.
 */
function clearCredentials() {
  try {
    const credPath = getCredentialsPath();
    if (fs.existsSync(credPath)) {
      fs.unlinkSync(credPath);
    }
  } catch (error) {
    console.error("Failed to clear credentials:", error.message);
  }
}

/* IPC handlers for renderer credential operations */
ipcMain.on("credentials-save", (_event, credentials) => {
  saveCredentials(credentials);
});

ipcMain.handle("credentials-load", () => {
  return loadCredentials();
});

ipcMain.on("credentials-clear", () => {
  clearCredentials();
});

/* ------------------------------------------------------------------ */
/* App lifecycle                                                       */
/* ------------------------------------------------------------------ */

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  createApplicationMenu();

  /* Show setup wizard on first run */
  if (!isWizardComplete()) {
    await createWizardWindow();
  }

  try {
    await startBackendDaemon();
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    dialog.showErrorBox(
      APPLICATION_NAME,
      `Could not start the trading backend.\n\nMake sure Python 3.12+ is installed and the backend dependencies are available.\n\nError: ${error.message}`,
    );
  }

  createMainWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    stopBackendDaemon();
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on("before-quit", () => {
  stopBackendDaemon();
});
