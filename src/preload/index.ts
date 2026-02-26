import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (filePath: string, content: string) => ipcRenderer.invoke('file:save', filePath, content),
  saveAsFile: (content: string, defaultPath?: string) => ipcRenderer.invoke('file:saveAs', content, defaultPath),
  openFolder: () => ipcRenderer.invoke('dialog:openFolder'),
  readDir: (dirPath: string) => ipcRenderer.invoke('fs:readDir', dirPath),
  readFile: (filePath: string) => ipcRenderer.invoke('file:readFile', filePath),
  onMenuOpen: (cb: () => void) => ipcRenderer.on('menu:openFile', cb),
  onMenuSave: (cb: () => void) => ipcRenderer.on('menu:save', cb),
  onMenuSaveAs: (cb: () => void) => ipcRenderer.on('menu:saveAs', cb),
  onMenuOpenFolder: (cb: () => void) => ipcRenderer.on('menu:openFolder', cb)
})
