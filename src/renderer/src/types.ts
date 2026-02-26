export interface TreeNode {
  name: string
  type: 'file' | 'directory'
  path: string
  children?: TreeNode[]
}

export interface Tab {
  id: number
  filePath: string | null
  label: string
  language: string
}
