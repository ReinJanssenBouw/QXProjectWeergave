const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('updater', {
  /**
   * Registreer een callback voor statusberichten van main.js.
   * Wordt aangeroepen met een object: { type, version?, percent?, message? }
   */
  onStatus: (callback) => {
    // Verwijder eventuele eerdere listener om duplicaten te voorkomen
    ipcRenderer.removeAllListeners('update-status');
    ipcRenderer.on('update-status', (_event, data) => callback(data));
  }
});
