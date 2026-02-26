<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as monaco from 'monaco-editor'
import MonacoWrapper from './components/MonacoWrapper.vue'
import FileTree from './components/FileTree.vue'
import TabBar from './components/TabBar.vue'
import type { Tab, TreeNode } from './types'

const editorRef = ref<InstanceType<typeof MonacoWrapper> | null>(null)
const tabs = ref<Tab[]>([])
const activeTabId = ref<number | null>(null)
const fileTree = ref<TreeNode | null>(null)
const models = new Map<number, monaco.editor.ITextModel>()
let nextId = 1

function extToLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    ts: 'typescript', tsx: 'typescript',
    js: 'javascript', jsx: 'javascript',
    vue: 'html', html: 'html', htm: 'html',
    css: 'css', scss: 'scss', less: 'less',
    json: 'json', md: 'markdown',
    py: 'python', rb: 'ruby', go: 'go',
    rs: 'rust', java: 'java', c: 'c', cpp: 'cpp',
    sh: 'shell', yaml: 'yaml', yml: 'yaml', sql: 'sql'
  }
  return map[ext] ?? 'plaintext'
}

function openFileAsTab(filePath: string, content: string, language: string): void {
  const existing = tabs.value.find(t => t.filePath === filePath)
  if (existing) {
    selectTab(existing.id)
    return
  }
  const id = nextId++
  const model = editorRef.value!.createModel(content, language)
  models.set(id, model)
  tabs.value.push({ id, filePath, label: filePath.split('/').pop() ?? filePath, language })
  selectTab(id)
}

function selectTab(id: number): void {
  const tab = tabs.value.find(t => t.id === id)
  if (!tab) return
  activeTabId.value = id
  const model = models.get(id)
  if (model) editorRef.value?.setModel(model)
  document.title = tab.label
}

function closeTab(id: number): void {
  const index = tabs.value.findIndex(t => t.id === id)
  if (index === -1) return
  const model = models.get(id)
  if (model) editorRef.value?.disposeModel(model)
  models.delete(id)
  tabs.value.splice(index, 1)
  if (activeTabId.value === id) {
    const next = tabs.value[index] ?? tabs.value[index - 1] ?? null
    if (next) {
      selectTab(next.id)
    } else {
      activeTabId.value = null
      document.title = 'Claude and View'
    }
  }
}

async function openFile(): Promise<void> {
  const result = await window.electronAPI.openFile()
  if (!result) return
  if ('error' in result) {
    alert(`Could not open file: ${result.error}`)
    return
  }
  openFileAsTab(result.filePath, result.content, extToLanguage(result.filePath))
}

async function openFolder(): Promise<void> {
  const folderPath = await window.electronAPI.openFolder()
  if (!folderPath) return
  fileTree.value = await window.electronAPI.readDir(folderPath)
  document.title = folderPath.split('/').pop() ?? folderPath
}

async function openFileFromTree(filePath: string): Promise<void> {
  const result = await window.electronAPI.readFile(filePath)
  if ('error' in result) return
  openFileAsTab(result.filePath, result.content, extToLanguage(result.filePath))
}

async function saveFile(): Promise<void> {
  const tab = tabs.value.find(t => t.id === activeTabId.value)
  if (!tab) return
  if (!tab.filePath) {
    await saveAsFile()
    return
  }
  const content = editorRef.value?.getValue() ?? ''
  await window.electronAPI.saveFile(tab.filePath, content)
}

async function saveAsFile(): Promise<void> {
  const tab = tabs.value.find(t => t.id === activeTabId.value)
  if (!tab) return
  const content = editorRef.value?.getValue() ?? ''
  const newPath = await window.electronAPI.saveAsFile(content, tab.filePath ?? 'untitled.txt')
  if (!newPath) return
  tab.filePath = newPath
  tab.label = newPath.split('/').pop() ?? newPath
  document.title = tab.label
}

onMounted(() => {
  window.electronAPI.onMenuOpen(openFile)
  window.electronAPI.onMenuSave(saveFile)
  window.electronAPI.onMenuSaveAs(saveAsFile)
  window.electronAPI.onMenuOpenFolder(openFolder)
})
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh;">
    <div style="padding: 4px 8px; background: #1e1e1e; border-bottom: 1px solid #333;">
      <button @click="openFile"
        style="background: #2d2d2d; color: #ccc; border: 1px solid #555; padding: 2px 10px; font-size: 12px; cursor: pointer; border-radius: 3px;">
        Open File
      </button>
      <button @click="openFolder"
        style="background: #2d2d2d; color: #ccc; border: 1px solid #555; padding: 2px 10px; font-size: 12px; cursor: pointer; border-radius: 3px;">
        Open Folder
      </button>
    </div>
    <TabBar :tabs="tabs" :active-id="activeTabId" @select="selectTab" @close="closeTab" />
    <div style="display: flex; flex: 1; overflow: hidden;">
      <div v-if="fileTree"
        style="width: 220px; overflow-y: auto; background: #252526; border-right: 1px solid #333; flex-shrink: 0; padding: 4px 0;">
        <FileTree :node="fileTree" @file-selected="openFileFromTree" />
      </div>
      <MonacoWrapper ref="editorRef" style="flex: 1;" />
    </div>
  </div>
</template>
