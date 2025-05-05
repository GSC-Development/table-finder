// preload.js - Exposes APIs from the main process to the renderer process

const { contextBridge, ipcRenderer } = require('electron');

// Expose API to renderer process
contextBridge.exposeInMainWorld('api', {
  // File operations
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  openData: () => ipcRenderer.invoke('open-data'),
  importCsv: () => ipcRenderer.invoke('import-csv'),
  exportCsv: (csvData) => ipcRenderer.invoke('export-csv', csvData)
});

// Log a message when preload script is loaded
console.log('Preload script has been loaded'); 