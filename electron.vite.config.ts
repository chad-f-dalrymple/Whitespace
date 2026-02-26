import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import monacoEditorPluginModule from 'vite-plugin-monaco-editor'
const monacoEditorPlugin = (monacoEditorPluginModule as any).default ?? monacoEditorPluginModule

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    publicDir: resolve('public'),
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue(),
      monacoEditorPlugin({})
    ]
  }
})
