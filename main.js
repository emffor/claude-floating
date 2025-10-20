const {
  app,
  BrowserWindow,
  globalShortcut,
  session,
  ipcMain,
} = require('electron')

// Mapa de serviços de IA
const AI_SERVICES = {
  chatgpt: 'https://chat.openai.com/',
  claude: 'https://claude.ai/new',
  perplexity: 'https://www.perplexity.ai/',
}

let windows = new Map()
let activeWindowId = null
let windowOrder = []
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

function createNewTab(service = 'chatgpt') {
  console.log('Creating new tab with service:', service)

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

  const url = AI_SERVICES[service] || AI_SERVICES.chatgpt
  createWindow(url)
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
           z-index: 999999 !important;
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
       
       // Container para botão + e menu
       const newTabContainer = document.createElement('div');
       newTabContainer.style.cssText = \`
         position: relative !important;
         display: flex !important;
       \`;
       
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
         transition: background 0.2s !important;
       \`;
       newTabBtn.onmouseenter = function() {
         newTabBtn.style.background = '#444 !important';
       };
       newTabBtn.onmouseleave = function() {
         newTabBtn.style.background = '#333 !important';
       };
       
       // Menu de seleção
       const menu = document.createElement('div');
       menu.className = 'electron-service-menu';
       menu.style.cssText = \`
         display: none !important;
         position: absolute !important;
         top: 35px !important;
         right: 0 !important;
         background: #2a2a2a !important;
         border: 1px solid #444 !important;
         border-radius: 4px !important;
         overflow: hidden !important;
         z-index: 999999 !important;
         box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
       \`;
       
       const services = [
         { name: 'ChatGPT', key: 'chatgpt' },
         { name: 'Claude', key: 'claude' },
         { name: 'Perplexity', key: 'perplexity' }
       ];
       
       services.forEach(function(service) {
         const item = document.createElement('div');
         item.textContent = service.name;
         item.style.cssText = \`
           padding: 10px 20px !important;
           color: #ccc !important;
           cursor: pointer !important;
           white-space: nowrap !important;
           font-size: 12px !important;
           transition: all 0.2s !important;
         \`;
         item.onmouseenter = function() {
           item.style.background = '#0066cc !important';
           item.style.color = 'white !important';
         };
         item.onmouseleave = function() {
           item.style.background = 'transparent !important';
           item.style.color = '#ccc !important';
         };
         item.onclick = function(e) {
           e.stopPropagation();
           if (typeof require !== 'undefined') {
             require('electron').ipcRenderer.send('new-tab', service.key);
           }
           menu.style.display = 'none';
         };
         menu.appendChild(item);
       });
       
       newTabBtn.onclick = function(e) {
         e.stopPropagation();
         const isVisible = menu.style.display === 'block';
         menu.style.display = isVisible ? 'none' : 'block';
       };
       
       // Fecha menu ao clicar fora
       document.addEventListener('click', function(e) {
         if (!newTabContainer.contains(e.target)) {
           menu.style.display = 'none';
         }
       });
       
       newTabContainer.appendChild(newTabBtn);
       newTabContainer.appendChild(menu);
       tabBar.appendChild(newTabContainer);
       
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
   }
   
   body { 
     -webkit-app-region: no-drag !important;
     height: 100vh !important;
     width: 100% !important;
     display: block !important;
     padding-top: 35px !important;
     box-sizing: border-box !important;
   }
   
   .electron-tabs {
     position: fixed !important;
     top: 0 !important;
     left: 0 !important;
     right: 0 !important;
     height: 35px !important;
     z-index: 999999 !important;
     -webkit-app-region: drag !important;
     background: #1a1a1a !important;
     display: flex !important;
     border-bottom: 1px solid #333 !important;
   }
   
   .electron-tabs * {
     -webkit-app-region: no-drag !important;
   }
   
   * {
     -webkit-app-region: no-drag !important;
   }
 `)

  window.webContents
    .executeJavaScript(
      `
   (function() {
     // Title tracking apenas
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
     
     return 'Layout adjusted';
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

function createWindow(url = 'https://chat.openai.com/') {
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

  windows.set(windowId, {
    window,
    title: 'AI Assistant',
    url,
  })
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

ipcMain.on('new-tab', (event, service) => createNewTab(service))
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
