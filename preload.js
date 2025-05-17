// File: preload.js

const { contextBridge, ipcRenderer } = require('electron');

// Expose API to renderer process
contextBridge.exposeInMainWorld('api', {
  // File operations
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  openData: () => ipcRenderer.invoke('open-data'),
  importCsv: () => ipcRenderer.invoke('import-csv'),
  exportCsv: (csvData) => ipcRenderer.invoke('export-csv', csvData),
  
  // NEW CODE: App data persistence
  saveAppData: (data) => ipcRenderer.invoke('save-app-data', data),
  loadAppData: () => ipcRenderer.invoke('load-app-data')
});

// Log a message when preload script is loaded
console.log('Preload script has been loaded');