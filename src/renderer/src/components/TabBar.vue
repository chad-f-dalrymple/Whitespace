<script setup lang="ts">
import type { Tab } from '../types'

defineProps<{ tabs: Tab[]; activeId: number | null }>()
defineEmits<{
  (e: 'select', id: number): void
  (e: 'close', id: number): void
}>()
</script>

<template>
  <div class="tab-bar">
    <div
      v-for="tab in tabs"
      :key="tab.id"
      class="tab"
      :class="{ active: tab.id === activeId }"
      @click="$emit('select', tab.id)"
    >
      <span class="tab-label">{{ tab.label }}</span>
      <span class="tab-close" @click.stop="$emit('close', tab.id)">×</span>
    </div>
  </div>
</template>

<style scoped>
.tab-bar {
  display: flex;
  background: #252526;
  border-bottom: 1px solid #333;
  overflow-x: auto;
  flex-shrink: 0;
}
.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 35px;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  white-space: nowrap;
  border-right: 1px solid #333;
  flex-shrink: 0;
}
.tab:hover {
  background: #2d2d2d;
  color: #ccc;
}
.tab.active {
  background: #1e1e1e;
  color: #fff;
  border-top: 1px solid #007acc;
}
.tab-close {
  font-size: 16px;
  line-height: 1;
  color: #666;
  border-radius: 3px;
  padding: 0 2px;
}
.tab-close:hover {
  color: #fff;
  background: #555;
}
</style>
