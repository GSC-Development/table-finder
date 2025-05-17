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
  loadAppData: () => ipcRenderer.invoke('load-app-data'),
  
  // NEW CODE: File dialog and file operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // NEW CODE: Save/Open file operations
  saveFileContents: (filePath, data) => ipcRenderer.invoke('save-file-contents', filePath, data)
});

// Listen for menu events from main process
ipcRenderer.on('app:new-file', () => {
  document.dispatchEvent(new CustomEvent('app-new-file'));
});

ipcRenderer.on('app:save-file', (event, filePath) => {
  document.dispatchEvent(new CustomEvent('app-save-file', { detail: filePath }));
});

ipcRenderer.on('app:save-file-as', (event, filePath) => {
  document.dispatchEvent(new CustomEvent('app-save-file-as', { detail: filePath }));
});

ipcRenderer.on('app:file-opened', (event, data) => {
  document.dispatchEvent(new CustomEvent('app-file-opened', { detail: data }));
});

// Log a message when preload script is loaded
console.log('Preload script has been loaded');