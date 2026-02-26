import type { TreeNode } from './types'

declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<{ content: string; filePath: string } | { error: string } | null>
      saveFile: (filePath: string, content: string) => Promise<boolean>
      saveAsFile: (content: string, defaultPath?: string) => Promise<string | null>
      openFolder: () => Promise<string | null>
      readDir: (dirPath: string) => Promise<TreeNode>
      readFile: (filePath: string) => Promise<{ content: string; filePath: string } | { error: string }>
      onMenuOpen: (cb: () => void) => void
      onMenuSave: (cb: () => void) => void
      onMenuSaveAs: (cb: () => void) => void
      onMenuOpenFolder: (cb: () => void) => void
    }
  }
}
