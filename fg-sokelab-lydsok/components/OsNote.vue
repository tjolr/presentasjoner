<script setup lang="ts">
// Liten boks nederst på steg-slidene: hva steget tilsvarer i OpenSearch.
defineProps<{ term: string }>()
</script>

<template>
  <div class="osn">
    <div class="head">OpenSearch: <code class="term">{{ term }}</code></div>
    <div class="txt"><slot /></div>
  </div>
</template>

<style scoped>
.osn {
  position: absolute;
  left: 3.5rem;
  right: 3.5rem;
  bottom: 1.4rem;
  padding: 8px 14px;
  border: 1px solid var(--click);
  border-radius: var(--radius-xl, 12px);
  background: var(--surface-card);
  font-size: 0.95rem;
  line-height: 1.35;
}
.head {
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-high);
  margin-bottom: 2px;
}
.term {
  font-family: var(--font-mono);
  color: var(--click-bright);
  background: none;
  padding: 0;
}
.txt {
  color: var(--text-mid);
}
</style>
