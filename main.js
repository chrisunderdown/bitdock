const {app, BrowserWindow, ipcMain, Tray, dialog, shell} = require('electron')
const path = require('path')
const AutoLaunch = require('auto-launch')
const semver = require('semver')



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

ipcMain.on('crypto-updated', (event, crypto, currency, coin) => {
  // Update icon and title in tray
  if ( coin === 'XRP') {
    switch(currency) {
      case 'USD':
        tray.setTitle(`${coin} $${crypto.USD.toFixed(2)}`)
        break;
      case 'GBP':
        tray.setTitle(`${coin} £${crypto.GBP.toFixed(2)}`)
        break;
      case 'EUR':
        tray.setTitle(`${coin} €${crypto.EUR.toFixed(2)}`)
        break;

      case 'AUD':
        tray.setTitle(`${coin} $${crypto.AUD.toFixed(2)}`)
        break;

      default:
        tray.setTitle(`${coin} $${crypto.USD.toFixed(2)}`)
    }
  }

  else {
    switch(currency) {
      case 'USD':
        tray.setTitle(`${coin} $${Math.round(crypto.USD)}`)
        break;
      case 'GBP':
        tray.setTitle(`${coin} £${Math.round(crypto.GBP)}`)
        break;
      case 'EUR':
        tray.setTitle(`${coin} €${Math.round(crypto.EUR)}`)
        break;
      case 'AUD':
        tray.setTitle(`${coin} $${Math.round(crypto.AUD)}`)
        break;
      default:
        tray.setTitle(`${coin} $${Math.round(crypto.USD)}`)
    }
  }


  tray.setImage(path.join(assetsDirectory, 'bitcoin.png'))

})

ipcMain.on('check-version', (event, version) => {
  const current = app.getVersion()
  const latest = version

  if(semver.lt(current, latest)) {
    event.sender.send('show-update')
  }

})
