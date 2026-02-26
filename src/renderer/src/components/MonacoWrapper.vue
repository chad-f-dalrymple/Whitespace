<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { ref, onMounted } from 'vue'

const containerRef = ref<HTMLElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(() => {
  editorInstance = monaco.editor.create(containerRef.value!, {
    theme: 'vs-dark',
    automaticLayout: true
  })
})

function createModel(content: string, language: string): monaco.editor.ITextModel {
  return monaco.editor.createModel(content, language)
}

function setModel(model: monaco.editor.ITextModel): void {
  editorInstance?.setModel(model)
}

function disposeModel(model: monaco.editor.ITextModel): void {
  model.dispose()
}

function getValue(): string {
  return editorInstance?.getValue() ?? ''
}

defineExpose({ createModel, setModel, disposeModel, getValue })
</script>

<template>
  <div ref="containerRef" style="width: 100%; height: 100%;" />
</template>
