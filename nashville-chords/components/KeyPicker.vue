<script setup lang="ts">
import { computed } from 'vue'
import { KEYS, parseKey } from '../lib/theory'
import { globalKey } from '../lib/state'

const props = withDefaults(defineProps<{ keys?: string[] }>(), {})
const list = computed(() => props.keys ?? KEYS)
const idx = computed(() => Math.max(0, list.value.indexOf(globalKey.value)))
</script>

<template>
  <div class="picker" :style="{ '--n': list.length, '--idx': idx }">
    <span class="thumb" />
    <button
      v-for="k in list"
      :key="k"
      :class="{ sel: k === globalKey }"
      @click="globalKey = k"
    >
      {{ parseKey(k).display }}
    </button>
  </div>
</template>

<style scoped>
.picker {
  position: relative;
  display: inline-grid;
  grid-template-columns: repeat(var(--n), 1fr);
  background: var(--sp-surface);
  border-radius: 999px;
  padding: 4px;
}
.thumb {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc((100% - 8px) / var(--n));
  border-radius: 999px;
  background: var(--sp-green);
  box-shadow: 0 4px 18px -4px rgba(30, 215, 96, 0.7);
  transform: translateX(calc(var(--idx) * 100%));
  transition: transform 0.4s cubic-bezier(0.3, 1.25, 0.5, 1);
}
button {
  position: relative;
  z-index: 1;
  min-width: 52px;
  padding: 10px 6px;
  border: none;
  background: transparent;
  color: var(--sp-sub);
  font: inherit;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.25s;
}
button:hover {
  color: var(--sp-text);
}
button.sel {
  color: #000;
}
</style>
