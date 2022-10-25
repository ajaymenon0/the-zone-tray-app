const { app, BrowserWindow, Tray } = require('electron');
const positioner = require('electron-traywindow-positioner');
const path = require('path');

let tray = null;
let window = null;

function createWindow() {
  window = new BrowserWindow({
    width: 300,
    height: 500,
    show: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  window.loadFile('index.html');

  // window.webContents.openDevTools({ mode: 'detach' });
};

const createTray = () => {
  tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));
  tray.on('click', () => {
    toggleWindow();
  });
}

const showWindow = () => {
  positioner.position(window, tray.getBounds());
  window.show();
}

const toggleWindow = () => {
  if(window.isVisible()) return window.hide();
  return showWindow();
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if(BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('ready', () => {
  createWindow();
  createTray();
});