const {app, BrowserWindow, ipcMain, Tray} = require('electron')
const dialog = require('electron').dialog
const path = require('path')
const AutoLaunch = require('auto-launch')

var appPath = app.getPath('exe').split('.app/Content')[0] + '.app';
var bitdockAutoLauncher = new AutoLaunch({
    name: 'Bitdock',
    path: appPath
});

bitdockAutoLauncher.enable();

bitdockAutoLauncher.isEnabled()
.then(function(isEnabled){
    if(isEnabled){
        return;
    }
    bitdockAutoLauncher.enable();
})
.catch(function(err){
});

const assetsDirectory = path.join(__dirname, 'assets')

let tray = undefined
let window = undefined

// Don't show the app in the doc
app.dock.hide()

app.on('ready', () => {
  createTray()
  createWindow()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit()
})

const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'bitcoin.png'))
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

const getWindowPosition = () => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  return {x: x, y: y}
}

const createWindow = () => {
  window = new BrowserWindow({
    width: 300,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      // Prevents renderer process code from not running when window is
      // hidden
      backgroundThrottling: false
    }
  })
  window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

  // Hide the window when it loses focus
  window.on('blur', () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide()
    }
  })
}

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

ipcMain.on('show-window', () => {
  showWindow()
})

ipcMain.on('bitcoin-updated', (event, bitcoin, currency) => {
  // Update icon and title in tray
  switch(currency) {
    case 'USD':
      tray.setTitle(`$${Math.round(bitcoin.bpi.USD.rate_float)}`)
      break;
    case 'GBP':
      tray.setTitle(`£${Math.round(bitcoin.bpi.GBP.rate_float)}`)
      break;
    case 'EUR':
      tray.setTitle(`€${Math.round(bitcoin.bpi.EUR.rate_float)}`)
      break;

    default:
      tray.setTitle(`$${Math.round(bitcoin.bpi.USD.rate_float)}`)
  }

  tray.setImage(path.join(assetsDirectory, 'bitcoin.png'))

})

ipcMain.on('open-error-dialog', function (event, i) {
  dialog.showErrorBox('Tab', i)
})
