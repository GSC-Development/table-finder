// File: main.js

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Set application name (will appear in the menu)
app.name = 'SeatPlan';

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;
let currentFilePath = null; // Track currently open file

// Define the path for persistent storage
const getUserDataPath = () => {
  return path.join(app.getPath('userData'), 'seatplan-data.json');
};

// Create the browser window
function createWindow(fileToOpen = null) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'SeatPlan',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // If a file was passed, open it once the app is ready
  if (fileToOpen) {
    mainWindow.webContents.on('did-finish-load', () => {
      openSavedFile(fileToOpen);
    });
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Create the application menu
  createMenu();
}

// Create custom application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Ask to save current data before creating new
            if (mainWindow) {
              mainWindow.webContents.send('app:new-file');
            }
          }
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            openFile();
          }
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            if (currentFilePath) {
              saveCurrentFile();
            } else {
              saveFileAs();
            }
          }
        },
        {
          label: 'Save As...',
          accelerator: 'Shift+CmdOrCtrl+S',
          click: () => {
            saveFileAs();
          }
        },
        { type: 'separator' },
        {
          label: 'Close',
          accelerator: process.platform === 'darwin' ? 'Cmd+W' : 'Ctrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(process.platform === 'darwin' ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [
          { role: 'close' }
        ])
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://github.com/yourusername/seatplan');
          }
        }
      ]
    }
  ];
  
  // Add special menu items for macOS
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }
  
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Function to open a file
async function openFile() {
  try {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'SeatPlan Files', extensions: ['seatplan'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (canceled || !filePaths || filePaths.length === 0) {
      return; // User canceled
    }
    
    const filePath = filePaths[0];
    
    // Verify the path exists and is a file before attempting to open
    try {
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        dialog.showErrorBox('Error', 'Cannot open a directory. Please select a .seatplan file.');
        return;
      }
      
      openSavedFile(filePath);
    } catch (error) {
      console.error('Error checking selected file:', error);
      dialog.showErrorBox('Error', `Could not open file: ${error.message}`);
    }
  } catch (error) {
    console.error('Failed to open file:', error);
    dialog.showErrorBox('Error', `Failed to open file: ${error.message}`);
  }
}

// Function to open a saved file
function openSavedFile(filePath) {
  try {
    if (!filePath) {
      console.log('No file path provided to openSavedFile');
      return;
    }
    
    // Check if path exists and is a file
    if (!fs.existsSync(filePath)) {
      dialog.showErrorBox('Error', `File does not exist: ${filePath}`);
      return;
    }
    
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      dialog.showErrorBox('Error', `Cannot open directory. Please select a .seatplan file.`);
      return;
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(data);
    
    // Send the data to the renderer process
    mainWindow.webContents.send('app:file-opened', parsedData);
    
    // Update current file path
    currentFilePath = filePath;
    
    // Update window title
    const fileName = path.basename(filePath);
    mainWindow.setTitle(`${fileName} - SeatPlan`);
    
  } catch (error) {
    console.error('Failed to open saved file:', error);
    dialog.showErrorBox('Error', `Failed to open file: ${error.message}`);
  }
}

// Function to save the current file
function saveCurrentFile() {
  if (!currentFilePath) {
    saveFileAs();
    return;
  }
  
  mainWindow.webContents.send('app:save-file', currentFilePath);
}

// Function to save file as
async function saveFileAs() {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Save Event',
      defaultPath: currentFilePath || path.join(app.getPath('desktop'), 'my-event.seatplan'),
      filters: [
        { name: 'SeatPlan Files', extensions: ['seatplan'] }
      ],
      properties: ['createDirectory', 'showOverwriteConfirmation']
    });
    
    if (canceled || !filePath) return;
    
    // Send save request to renderer
    mainWindow.webContents.send('app:save-file-as', filePath);
    
    // Update current file path
    currentFilePath = filePath;
    
    // Update window title
    const fileName = path.basename(filePath);
    mainWindow.setTitle(`${fileName} - SeatPlan`);
    
  } catch (error) {
    console.error('Failed to save file:', error);
    dialog.showErrorBox('Error', `Failed to save file: ${error.message}`);
  }
}

// Create window when Electron has finished initialization
app.whenReady().then(() => {
  // Handle file opening from command line (macOS)
  let fileToOpen = null;
  
  // Only try to open a file if there are more than 2 args and it exists and is a file
  if (process.argv.length > 1) {
    const potentialFilePath = process.argv[1];
    try {
      if (fs.existsSync(potentialFilePath) && fs.statSync(potentialFilePath).isFile()) {
        fileToOpen = potentialFilePath;
      }
    } catch (error) {
      console.log(`Error checking file path: ${error.message}`);
    }
  }
  
  createWindow(fileToOpen);

  app.on('activate', () => {
    // On macOS, re-create a window when dock icon is clicked and no other windows open
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Register file types the app can open
app.on('will-finish-launching', () => {
  // Handle macOS file open events
  app.on('open-file', (event, filePath) => {
    event.preventDefault();
    
    // Verify that the path exists and is a file
    try {
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        console.log(`Invalid file path in 'open-file' event: ${filePath}`);
        return;
      }
    } catch (error) {
      console.log(`Error checking file path in 'open-file' event: ${error.message}`);
      return;
    }
    
    if (app.isReady()) {
      // App is already running, open the file
      if (mainWindow) {
        openSavedFile(filePath);
      } else {
        createWindow(filePath);
      }
    } else {
      // App is not ready yet, remember the file to open later
      process.argv.push(filePath);
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handle saving file contents from renderer
ipcMain.handle('save-file-contents', async (event, filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true, filePath };
  } catch (error) {
    console.error('Error saving file:', error);
    return { success: false, message: error.message };
  }
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

// NEW CODE: Handle persistent data storage
ipcMain.handle('save-app-data', async (event, data) => {
  try {
    const filePath = getUserDataPath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('load-app-data', async () => {
  try {
    const filePath = getUserDataPath();
    
    // Check if the file exists before trying to read it
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return { success: true, data: JSON.parse(data) };
    } else {
      return { success: false, message: 'No saved data found', noFile: true };
    }
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

// Show save dialog
ipcMain.handle('show-save-dialog', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(options);
    return result;
  } catch (error) {
    return { canceled: true, error: error.message };
  }
});

// Write file
ipcMain.handle('write-file', async (event, filePath, data) => {
  try {
    fs.writeFileSync(filePath, data);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Show open dialog
ipcMain.handle('show-open-dialog', async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(options);
    return result;
  } catch (error) {
    return { canceled: true, error: error.message };
  }
});

// Read file
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return data;
  } catch (error) {
    throw error;
  }
});