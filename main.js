const { app, BrowserWindow, globalShortcut, session, ipcMain } = require('electron');

let windows = new Map();
let activeWindowId = null;
let windowOrder = [];
let sharedWindow = null; // Uma única janela física para todas as abas

function showWindow(windowId) {
  console.log(`Switching to window: ${windowId}`);
  
  const windowData = windows.get(windowId);
  if (windowData && sharedWindow && !sharedWindow.isDestroyed()) {
    activeWindowId = windowId;
    
    // Carregar URL da aba selecionada na janela compartilhada
    sharedWindow.loadURL(windowData.url);
    sharedWindow.show();
    sharedWindow.focus();
    
    setTimeout(() => updateAllTabBars(), 500);
  }
}

function hideAllWindows() {
  if (sharedWindow && !sharedWindow.isDestroyed()) {
    sharedWindow.hide();
  }
}

function createNewTab() {
  console.log('Creating new tab');
  createWindow();
}

function updateAllTabBars() {
  const windowsData = Array.from(windows.entries()).map(([id, data]) => ({
    id,
    title: data.title || 'Claude AI',
    isActive: id === activeWindowId
  }));

  if (sharedWindow && !sharedWindow.isDestroyed()) {
    updateSingleTabBar(sharedWindow, windowsData);
  }
}

function updateSingleTabBar(window, windowsData) {
  const script = `
    (function() {
      try {
        console.log('Updating tab bar for window:', ${JSON.stringify(windowsData)});
        
        let tabBar = document.querySelector('.electron-tabs');
        if (!tabBar) {
          console.log('Creating new tab bar');
          tabBar = document.createElement('div');
          tabBar.className = 'electron-tabs';
          tabBar.style.cssText = \`
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 35px !important;
            background: #1a1a1a !important;
            display: flex !important;
            z-index: 9999 !important;
            border-bottom: 1px solid #333 !important;
          \`;
          document.body.prepend(tabBar);
        }
        
        tabBar.innerHTML = '';
        
        const windowsData = ${JSON.stringify(windowsData)};
        console.log('Windows data:', windowsData);
        
        if (!windowsData || windowsData.length === 0) {
          console.log('No windows data available');
          return 'No windows data';
        }
        
        windowsData.forEach(function(windowData, index) {
          console.log('Creating tab for:', windowData.title);
          
          const tab = document.createElement('div');
          tab.className = 'electron-tab' + (windowData.isActive ? ' active' : '');
          tab.style.cssText = \`
            background: \${windowData.isActive ? '#0066cc' : '#2a2a2a'} !important;
            color: \${windowData.isActive ? 'white' : '#ccc'} !important;
            padding: 8px 15px !important;
            border-right: 1px solid #444 !important;
            cursor: pointer !important;
            max-width: 120px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            font-size: 12px !important;
            display: flex !important;
            align-items: center !important;
            transition: background 0.2s !important;
          \`;
          
          const tabText = document.createElement('span');
          tabText.textContent = windowData.title || 'Claude AI';
          tab.appendChild(tabText);
          
          if (windowsData.length > 1) {
            const closeBtn = document.createElement('span');
            closeBtn.className = 'electron-tab-close';
            closeBtn.textContent = '×';
            closeBtn.style.cssText = \`
              margin-left: 8px !important;
              color: #999 !important;
              font-weight: bold !important;
              padding: 0 4px !important;
              border-radius: 3px !important;
            \`;
            closeBtn.onclick = function(e) {
              e.stopPropagation();
              console.log('Close clicked for:', windowData.id);
              if (typeof require !== 'undefined') {
                require('electron').ipcRenderer.send('close-tab', windowData.id);
              }
            };
            tab.appendChild(closeBtn);
          }
          
          tab.onclick = function() {
            console.log('Tab clicked:', windowData.id);
            if (typeof require !== 'undefined') {
              require('electron').ipcRenderer.send('switch-tab', windowData.id);
            }
          };
          
          tabBar.appendChild(tab);
        });
        
        const newTabBtn = document.createElement('div');
        newTabBtn.className = 'electron-new-tab';
        newTabBtn.textContent = '+';
        newTabBtn.style.cssText = \`
          background: #333 !important;
          color: #ccc !important;
          padding: 8px 12px !important;
          cursor: pointer !important;
          font-size: 16px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-width: 35px !important;
        \`;
        newTabBtn.onclick = function() {
          console.log('New tab clicked');
          if (typeof require !== 'undefined') {
            require('electron').ipcRenderer.send('new-tab');
          }
        };
        tabBar.appendChild(newTabBtn);
        
        console.log('Tab bar updated successfully with', windowsData.length, 'tabs');
        return 'Tab bar updated successfully';
      } catch (error) {
        console.error('Tab bar error:', error);
        return 'Error: ' + error.message;
      }
    })();
  `;

  window.webContents.executeJavaScript(script)
    .then(result => {
      console.log('Tab bar result:', result);
    })
    .catch(err => {
      console.log('Tab bar error:', err.message);
    });
}

function injectTabSystem(window, windowId) {
  window.webContents.insertCSS(`
    body { -webkit-app-region: drag; margin-top: 35px !important; }
    
    input, textarea, button, a, [contenteditable],
    div[role], section, article, nav, main,
    .electron-tabs * { 
      -webkit-app-region: no-drag !important; 
    }
    
    .electron-tabs {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 35px;
      background: #1a1a1a;
      display: flex;
      z-index: 9999;
      border-bottom: 1px solid #333;
    }
    .electron-tab {
      background: #2a2a2a;
      color: #ccc;
      padding: 8px 15px;
      border-right: 1px solid #444;
      cursor: pointer;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      display: flex;
      align-items: center;
      transition: background 0.2s;
    }
    .electron-tab.active { 
      background: #0066cc; 
      color: white;
    }
    .electron-tab:hover:not(.active) { background: #3a3a3a; }
    .electron-tab-close {
      margin-left: 8px;
      color: #999;
      font-weight: bold;
      padding: 0 4px;
      border-radius: 3px;
    }
    .electron-tab-close:hover { 
      color: #ff6b6b; 
      background: rgba(255,107,107,0.2);
    }
    .electron-new-tab {
      background: #333;
      color: #ccc;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 35px;
    }
    .electron-new-tab:hover { background: #444; }
  `);
  
  window.webContents.executeJavaScript(`
    (function() {
      let lastTitle = document.title;
      
      function checkTitle() {
        if (document.title !== lastTitle) {
          lastTitle = document.title;
          if (typeof require !== 'undefined') {
            require('electron').ipcRenderer.send('update-title', '${windowId}', document.title);
          }
        }
      }
      
      setInterval(checkTitle, 3000);
      checkTitle();
    })();
  `).catch(err => {
    console.log('Error injecting title monitor:', err.message);
  });
}

function closeTab(windowId) {
  if (windowOrder.length <= 1) {
    console.log('Cannot close last tab');
    return;
  }
  
  console.log(`Closing tab ${windowId}`);
  windows.delete(windowId);
  windowOrder = windowOrder.filter(id => id !== windowId);
  
  if (activeWindowId === windowId) {
    activeWindowId = windowOrder[0] || null;
    if (activeWindowId) {
      showWindow(activeWindowId);
    }
  } else {
    updateAllTabBars();
  }
}

function updateWindowTitle(windowId, title) {
  const windowData = windows.get(windowId);
  if (windowData) {
    windowData.title = title;
    updateAllTabBars();
  }
}

function createWindow(url = 'https://claude.ai') {
  const windowId = Date.now().toString();
  
  console.log(`Creating window: ${windowId}`);
  
  // Criar janela física apenas na primeira vez
  if (!sharedWindow) {
    const persistentSession = session.fromPartition('persist:claude-session');
    
    sharedWindow = new BrowserWindow({
      width: 450,
      height: 700,
      x: 100,
      y: 100,
      alwaysOnTop: true,
      frame: false,
      resizable: true,
      movable: true,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: false,
        session: persistentSession,
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    sharedWindow.webContents.on('dom-ready', () => {
      console.log('DOM ready for shared window');
      injectTabSystem(sharedWindow, activeWindowId);
      setTimeout(() => {
        console.log('Updating tabs after DOM ready');
        updateAllTabBars();
      }, 2000);
    });
    
    sharedWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'Escape') hideAllWindows();
      if (input.control && input.key === 't') createNewTab();
      if (input.control && input.key === 'w') closeTab(activeWindowId);
    });

    sharedWindow.on('closed', () => {
      console.log('Shared window closed');
      sharedWindow = null;
      windows.clear();
      windowOrder = [];
      activeWindowId = null;
    });
  }
  
  // Adicionar aba virtual
  windows.set(windowId, { 
    title: 'Claude AI', 
    url: url
  });
  windowOrder.push(windowId);
  
  // Ativar nova aba
  activeWindowId = windowId;
  
  if (sharedWindow) {
    sharedWindow.loadURL(url);
    sharedWindow.show();
    sharedWindow.focus();
  }
  
  return sharedWindow;
}

// IPC handlers
ipcMain.on('new-tab', createNewTab);
ipcMain.on('close-tab', (event, windowId) => closeTab(windowId));
ipcMain.on('switch-tab', (event, windowId) => showWindow(windowId));
ipcMain.on('update-title', (event, windowId, title) => updateWindowTitle(windowId, title));

app.whenReady().then(() => {
  createWindow();
  
  globalShortcut.register('Ctrl+Shift+C', () => {
    if (sharedWindow?.isVisible()) {
      hideAllWindows();
    } else if (sharedWindow && activeWindowId) {
      showWindow(activeWindowId);
    }
  });
  
  globalShortcut.register('Ctrl+T', createNewTab);
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Manter rodando
});