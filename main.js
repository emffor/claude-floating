const { app, BrowserWindow, globalShortcut, session } = require('electron');

let mainWindow;

function createWindow() {
  // Criar sessão persistente
  const persistentSession = session.fromPartition('persist:claude-session');
  
  mainWindow = new BrowserWindow({
    width: 450,
    height: 700,
    alwaysOnTop: true,
    frame: false,
    resizable: true,
    movable: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      session: persistentSession,
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  mainWindow.loadURL('https://claude.ai');
  
  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.insertCSS(`
      body { -webkit-app-region: drag; }
      input, textarea, button, a, [contenteditable], .relative { -webkit-app-region: no-drag; }
    `);
  });
  
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      mainWindow.hide();
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  
  globalShortcut.register('Ctrl+Shift+C', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
  
  console.log('Claude flutuante ativo! Ctrl+Shift+C para abrir/fechar');
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Manter rodando
});