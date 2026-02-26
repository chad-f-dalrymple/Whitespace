<script lang="ts">
export default { name: 'FileTree' }
</script>

<script setup lang="ts">
import { ref } from 'vue'
import type { TreeNode } from '../types'

const props = defineProps<{ node: TreeNode }>()
const emit = defineEmits<{ (e: 'file-selected', path: string): void }>()

const expanded = ref(props.node.type === 'directory')

function toggle(): void {
  expanded.value = !expanded.value
}

function select(): void {
  emit('file-selected', props.node.path)
}
</script>

<template>
  <div>
    <div
      class="tree-node"
      :class="node.type"
      @click="node.type === 'directory' ? toggle() : select()"
    >
      <span class="icon">{{ node.type === 'directory' ? (expanded ? '▾' : '▸') : '·' }}</span>
      {{ node.name }}
    </div>
    <div v-if="node.type === 'directory' && expanded" class="children">
      <FileTree
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        @file-selected="emit('file-selected', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-node {
  display: flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 13px;
  color: #ccc;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  border-radius: 3px;
}
.tree-node:hover {
  background: #2a2d2e;
}
.tree-node.directory {
  color: #e8e8e8;
  font-weight: 500;
}
.tree-node.file {
  color: #bbb;
}
.icon {
  width: 14px;
  flex-shrink: 0;
  color: #888;
  font-size: 11px;
  margin-right: 4px;
}
.children {
  padding-left: 12px;
}
</style>
