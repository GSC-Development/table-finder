// main.js - Electron main process file

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

// Create the browser window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create a window when dock icon is clicked and no other windows open
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handle file operations
ipcMain.handle('save-data', async (event, data) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: 'table-finder-data.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });
    
    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return { success: true, filePath };
    }
    return { success: false, message: 'Save cancelled' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('open-data', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });
    
    if (filePaths && filePaths.length > 0) {
      const data = fs.readFileSync(filePaths[0], 'utf-8');
      return { success: true, data: JSON.parse(data) };
    }
    return { success: false, message: 'Open cancelled' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Handle importing CSV files
ipcMain.handle('import-csv', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'CSV Files', extensions: ['csv'] }
      ]
    });
    
    if (filePaths && filePaths.length > 0) {
      const csvData = fs.readFileSync(filePaths[0], 'utf-8');
      return { success: true, data: csvData };
    }
    return { success: false, message: 'Import cancelled' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Export data as CSV
ipcMain.handle('export-csv', async (event, csvData) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: 'table-finder-export.csv',
      filters: [
        { name: 'CSV Files', extensions: ['csv'] }
      ]
    });
    
    if (filePath) {
      fs.writeFileSync(filePath, csvData);
      return { success: true, filePath };
    }
    return { success: false, message: 'Export cancelled' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});