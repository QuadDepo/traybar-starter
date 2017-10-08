const {app, BrowserWindow, ipcMain, Tray} = require('electron')
const path = require('path')

let tray = undefined
let window = undefined

app.dock.hide()

const createTray = () => {
  tray = new Tray(path.join('sunTemplate.png'))
  tray.on('right-click', toggleWindow)
  tray.on('double-click', toggleWindow)
  tray.on('click', function (event) {
    toggleWindow()

    // Show devtools when command clicked
    if (window.isVisible() && process.defaultApp && event.metaKey) {
      window.openDevTools({mode: 'detach'})
    }
  })
}

const createWindow = () => {
  window = new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false
    }
  })
  // load the local HTML file
  let url = require('url').format({
    protocol: 'file',
    slashes: true,
    pathname: require('path').join(__dirname, 'index.html')
  })
  // window.setAlwaysOnTop(true, "floating");
// window.setVisibleOnAllWorkspaces(true);
// window.setFullScreenable(false);
  window.loadURL(url)
  // Hide the window when it loses focus
window.on('blur', () => {
  if (!window.webContents.isDevToolsOpened()) {
    window.hide()
  }
})
window.on('hide', () => {
  tray.setHighlightMode('never')
})

}

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return {x: x, y: y}
}


app.on('ready', () => {
  createTray()
  createWindow()
})



const toggleWindow = () => {
  if (window.isVisible()) {
    window.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  const position = getWindowPosition()
  window.setPosition(position.x, position.y, false)
  window.show()
  window.focus()
}
