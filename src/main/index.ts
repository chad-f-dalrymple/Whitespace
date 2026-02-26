import { app, BrowserWindow, shell, Menu, dialog, ipcMain } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'

interface TreeNode {
  name: string
  type: 'file' | 'directory'
  path: string
  children?: TreeNode[]
}

function buildTree(currentPath: string): TreeNode {
  const name = currentPath.split('/').pop() ?? currentPath
  const stat = statSync(currentPath)
  if (stat.isDirectory()) {
    const entries = readdirSync(currentPath).filter(e => !e.startsWith('.'))
    const children = entries
      .map(entry => {
        try { return buildTree(join(currentPath, entry)) }
        catch { return null }
      })
      .filter(Boolean) as TreeNode[]
    children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name)
      return a.type === 'directory' ? -1 : 1
    })
    return { name, type: 'directory', path: currentPath, children }
  }
  return { name, type: 'file', path: currentPath }
}

let mainWindow: BrowserWindow | null = null

function createMenu(): void {
  const isMac = process.platform === 'darwin'

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{ role: 'appMenu' as const }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow?.webContents.send('menu:openFile')
        },
        {
          label: 'Open Folder',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => mainWindow?.webContents.send('menu:openFolder')
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu:save')
        },
        {
          label: 'Save As',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow?.webContents.send('menu:saveAs')
        },
        { type: 'separator' },
        isMac ? { role: 'close' as const } : { role: 'quit' as const }
      ]
    },
    { role: 'editMenu' as const },
    { role: 'viewMenu' as const },
    { role: 'windowMenu' as const }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('closed', () => { mainWindow = null })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function registerIpcHandlers(): void {
  ipcMain.handle('dialog:openFile', async () => {
    if (!mainWindow) return { error: 'No window' }
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile']
    })
    if (canceled || filePaths.length === 0) return null
    const filePath = filePaths[0]
    try {
      const content = readFileSync(filePath, 'utf-8')
      return { content, filePath }
    } catch (err) {
      return { error: String(err) }
    }
  })

  ipcMain.handle('file:save', async (_event, filePath: string, content: string) => {
    writeFileSync(filePath, content, 'utf-8')
    return true
  })

  ipcMain.handle('file:saveAs', async (_event, content: string, defaultPath?: string) => {
    if (!mainWindow) return null
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultPath ?? 'untitled.txt'
    })
    if (canceled || !filePath) return null
    writeFileSync(filePath, content, 'utf-8')
    return filePath
  })

  ipcMain.handle('dialog:openFolder', async () => {
    if (!mainWindow) return null
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    if (canceled || filePaths.length === 0) return null
    return filePaths[0]
  })

  ipcMain.handle('fs:readDir', (_event, dirPath: string) => {
    return buildTree(dirPath)
  })

  ipcMain.handle('file:readFile', (_event, filePath: string) => {
    try {
      const content = readFileSync(filePath, 'utf-8')
      return { content, filePath }
    } catch (err) {
      return { error: String(err) }
    }
  })
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
