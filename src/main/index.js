'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import './utils/getRecommend'
import './utils/getImgAlbum'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    // frame: false,
    width: 1000,
    // titleBarStyle: 'hidden', // 主要用mac, 头部是否保留关闭按钮
    center: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    // 设置保存路径,使Electron不提示保存对话框。
    // item.setSavePath('/tmp/save.pdf')

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused')
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`)
        }
      }
    })
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully')
      } else {
        console.log(`Download failed: ${state}`)
      }
    })
  })
}

ipcMain.on('download', (evt, downloadUrl) => {
  // let url = downloadUrl
  // downloadUrl = url.downloadUrl;
  // saveUrl = url.saveUrl;
  mainWindow.webContents.downloadURL(downloadUrl)
})

// const createMenu = () => {
//   const template = [{
//     label: 'hello',
//     submenu: [
//       { label: 'world' }
//     ]
//   }]
//   const menu = Menu.buildFromTemplate(template)
//   Menu.setApplicationMenu(menu)
// }

// createMenu()

// const menu = new Menu()
// menu.append(new MenuItem({ label: 'Cut', accelerator: 'CmdOrCtrl+X' }))
// menu.append(new MenuItem({ type: 'separator' })) // 分割线
// menu.append(new MenuItem({ label: 'Helper', type: 'checkbox', checked: true }))

app.on('ready', () => {
  createWindow()
  // createMenu()
  // Menu.setApplicationMenu(null)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
