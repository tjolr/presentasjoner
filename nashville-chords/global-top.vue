<script setup lang="ts">
import { KEYS, parseKey } from './lib/theory'
import { globalKey, playMode } from './lib/state'
</script>

<template>
  <div class="gt">
    <div class="seg" role="group" aria-label="Hva klikk spiller">
      <button :class="{ sel: playMode === 'bass' }" @click="playMode = 'bass'">Bass</button>
      <button :class="{ sel: playMode === 'chord' }" @click="playMode = 'chord'">Akkord</button>
    </div>
    <label class="key">
      <select v-model="globalKey" aria-label="Toneart">
        <option v-for="k in KEYS" :key="k" :value="k">{{ parseKey(k).display }}</option>
      </select>
    </label>
  </div>
</template>

<style scoped>
.gt {
  position: fixed;
  top: 14px;
  right: 16px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--sp-sub);
}
.seg {
  display: inline-flex;
  background: var(--sp-surface);
  border-radius: 999px;
  padding: 3px;
}
.seg button {
  border: none;
  background: transparent;
  color: var(--sp-sub);
  font: inherit;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.seg button.sel {
  background: var(--sp-green);
  color: #000;
}
.key {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
select {
  appearance: none;
  background: var(--sp-surface)
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23b3b3b3' stroke-width='1.6'/%3E%3C/svg%3E")
    no-repeat right 12px center;
  color: var(--sp-text);
  font: inherit;
  font-weight: 700;
  border: 1px solid var(--sp-elev2);
  border-radius: 999px;
  padding: 5px 30px 5px 14px;
  cursor: pointer;
}
select:hover {
  border-color: var(--sp-sub);
}
</style>
