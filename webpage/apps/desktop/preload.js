/**
 * Paulie's Prediction Partners — Main Window Preload Script
 *
 * Exposes a minimal contextBridge API so the renderer can
 * save and load encrypted credentials via the main process,
 * and receive auto-update status notifications.
 */

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronBridge", {
  /**
   * Save API credentials (encrypted via safeStorage in main process).
   * @param {object} credentials - { mode, apiKeyId, privateKeyPem }
   */
  saveCredentials(credentials) {
    ipcRenderer.send("credentials-save", credentials);
  },

  /**
   * Load previously saved credentials.
   * @returns {Promise<object|null>} Decrypted credentials or null.
   */
  loadCredentials() {
    return ipcRenderer.invoke("credentials-load");
  },

  /**
   * Clear stored credentials.
   */
  clearCredentials() {
    ipcRenderer.send("credentials-clear");
  },

  /**
   * Listen for auto-update status events from main process.
   * @param {function} callback - Receives { status, message } objects.
   */
  onUpdateStatus(callback) {
    ipcRenderer.on("update-status", (_event, data) => callback(data));
  },
});
