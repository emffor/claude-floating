const {
  app,
  BrowserWindow,
  globalShortcut,
  session,
  ipcMain,
} = require('electron')

let windows = new Map()
let activeWindowId = null
let windowOrder = []
// let sharedBounds = { x: 100, y: 100, width: 450, height: 700 };
let sharedBounds = { x: 1650, y: 800, width: 800, height: 800 }

function showWindow(windowId) {
  console.log(`Switching to window: ${windowId}`)

  windows.forEach(({ window }, id) => {
    if (id !== windowId && window && !window.isDestroyed()) {
      window.hide()
    }
  })

  const windowData = windows.get(windowId)
  if (windowData && !windowData.window.isDestroyed()) {
    activeWindowId = windowId

    windowData.window.setBounds(sharedBounds)
    windowData.window.show()
    windowData.window.focus()

    setTimeout(() => updateAllTabBars(), 200)
  }
}

function hideAllWindows() {
  windows.forEach(({ window }) => {
    if (window && !window.isDestroyed()) {
      window.hide()
    }
  })
}

function createNewTab() {
  console.log('Creating new tab')

  if (activeWindowId) {
    const currentWindow = windows.get(activeWindowId)
    if (currentWindow && !currentWindow.window.isDestroyed()) {
      const currentBounds = currentWindow.window.getBounds()
      sharedBounds = {
        x: currentBounds.x,
        y: currentBounds.y,
        width: currentBounds.width,
        height: currentBounds.height,
      }
      console.log(
        'Force updating shared bounds from active window:',
        sharedBounds,
      )
    }
  }

  createWindow()
}

function updateAllTabBars() {
  const windowsData = Array.from(windows.entries()).map(([id, data]) => ({
    id,
    title: data.title || 'Claude AI',
    isActive: id === activeWindowId,
  }))
  windows.forEach(({ window }, windowId) => {
    if (window && !window.isDestroyed()) {
      updateSingleTabBar(window, windowsData)
    }
  })
}

function updateSingleTabBar(window, windowsData) {
  const script = `
   (function() {
     try {
       let tabBar = document.querySelector('.electron-tabs');
       if (!tabBar) {
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
       
       windowsData.forEach(function(windowData) {
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
             if (typeof require !== 'undefined') {
               require('electron').ipcRenderer.send('close-tab', windowData.id);
             }
           };
           tab.appendChild(closeBtn);
         }
         
         tab.onclick = function() {
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
         if (typeof require !== 'undefined') {
           require('electron').ipcRenderer.send('new-tab');
         }
       };
       tabBar.appendChild(newTabBtn);
       
       return 'Tab bar updated successfully';
     } catch (error) {
       return 'Error: ' + error.message;
     }
   })();
 `
  window.webContents.executeJavaScript(script).catch(() => {})
}

function injectTabSystem(window, windowId) {
  window.webContents.insertCSS(`
   html, body { 
     margin: 0 !important;
     padding: 0 !important;
     overflow: hidden !important;
     height: 100vh !important;
     -webkit-app-region: drag; 
   }
   
   body { 
     margin-top: 35px !important;
     height: calc(100vh - 35px) !important;
   }
   
   input, textarea, button, a, [contenteditable],
   div[role], section, article, nav, main,
   .electron-tabs * { 
     -webkit-app-region: no-drag !important; 
   }
   
   main, #__next, [data-testid="main-content"] {
     height: 100% !important;
     overflow-y: auto !important;
     overflow-x: hidden !important;
   }
 `)

  window.webContents
    .executeJavaScript(
      `
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
 `,
    )
    .catch(() => {})
}

function closeTab(windowId) {
  if (windowOrder.length <= 1) {
    console.log('Cannot close last tab')
    return
  }

  const windowData = windows.get(windowId)
  if (windowData) {
    console.log(`Closing window ${windowId}`)
    windowData.window.close()
  }
}

function updateWindowTitle(windowId, title) {
  const windowData = windows.get(windowId)
  if (windowData) {
    windowData.title = title
    updateAllTabBars()
  }
}

function createWindow(url = 'https://claude.ai/new') {
  const windowId = Date.now().toString()
  const persistentSession = session.fromPartition('persist:claude-session')

  console.log(`Creating window: ${windowId}`)

  const window = new BrowserWindow({
    width: sharedBounds.width,
    height: sharedBounds.height,
    x: sharedBounds.x,
    y: sharedBounds.y,
    alwaysOnTop: true,
    frame: false,
    resizable: true,
    movable: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      sandbox: false,
      session: persistentSession,
      userAgent:
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  })

  windows.set(windowId, { window, title: 'Claude AI', url })
  windowOrder.push(windowId)

  if (activeWindowId) {
    const currentWindow = windows.get(activeWindowId)
    if (currentWindow && !currentWindow.window.isDestroyed()) {
      currentWindow.window.hide()
    }
  }

  activeWindowId = windowId
  window.show()
  window.focus()
  window.loadURL(url)

  window.on('moved', () => {
    sharedBounds = window.getBounds()
    console.log('Window moved, updating shared bounds:', sharedBounds)
  })

  window.on('resized', () => {
    sharedBounds = window.getBounds()
    console.log('Window resized, updating shared bounds:', sharedBounds)
  })

  window.on('resize', () => {
    sharedBounds = window.getBounds()
    console.log('Window resize event, updating shared bounds:', sharedBounds)
  })

  window.on('blur', () => {
    sharedBounds = window.getBounds()
    console.log('Window blur, saving bounds:', sharedBounds)
  })

  window.webContents.on('dom-ready', () => {
    injectTabSystem(window, windowId)
    setTimeout(() => updateAllTabBars(), 1000)
  })

  window.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') hideAllWindows()
    if (input.control && input.key === 't') createNewTab()
    if (input.control && input.key === 'w') closeTab(windowId)
  })

  window.on('closed', () => {
    console.log(`Window ${windowId} closed`)
    windows.delete(windowId)
    windowOrder = windowOrder.filter((id) => id !== windowId)

    if (activeWindowId === windowId) {
      activeWindowId = windowOrder[0] || null
      if (activeWindowId) {
        showWindow(activeWindowId)
      }
    } else {
      updateAllTabBars()
    }
  })

  return window
}

ipcMain.on('new-tab', createNewTab)
ipcMain.on('close-tab', (event, windowId) => closeTab(windowId))
ipcMain.on('switch-tab', (event, windowId) => showWindow(windowId))
ipcMain.on('update-title', (event, windowId, title) =>
  updateWindowTitle(windowId, title),
)

app.whenReady().then(() => {
  const shouldStartHidden = process.argv.includes('--hidden')

  if (!shouldStartHidden) {
    createWindow()
  }

  globalShortcut.register('Alt+Right', () => {
    if (windows.size === 0) {
      createWindow()
    } else {
      const activeWindow = windows.get(activeWindowId)
      if (activeWindow?.window.isVisible()) {
        hideAllWindows()
      } else if (activeWindowId) {
        showWindow(activeWindowId)
      }
    }
  })

  globalShortcut.register('Alt+Space', () => {
    if (windows.size === 0) {
      createWindow()
    } else {
      const activeWindow = windows.get(activeWindowId)
      if (activeWindow?.window.isVisible()) {
        hideAllWindows()
      } else if (activeWindowId) {
        showWindow(activeWindowId)
      }
    }
  })

  globalShortcut.register('Ctrl+T', createNewTab)
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {})
