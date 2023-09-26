const { app, BrowserWindow, globalShortcut } = require('electron');

let mainWindow; 

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
	  contextIsolation: false
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
	globalShortcut.register('CmdOrCtrl+Shift+X', () => {
		console.log('Shortcut Pressed'); 
		//console.log('mainWindow:', mainWindow);
		mainWindow.webContents.send('toggle-recording');
	});
});
