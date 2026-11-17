<script setup lang="ts">
// Stegene i query-by-humming. `active` styrer hvor mange som er tent; `os` viser OpenSearch-knaggen under.
withDefaults(defineProps<{ active?: number; os?: boolean }>(), { active: 99, os: false })

const steps = [
  { t: 'Lyd', s: 'mikrofon / fil', os: 'dokument' },
  { t: 'Tall', s: 'tone hvert 30. ms', os: 'ingest' },
  { t: 'Normaliser', s: 'trekk fra snitt', os: 'analyzer' },
  { t: 'Vinduer', s: '5 s, hopp 2 s', os: 'passages' },
  { t: 'Vektor', s: '64 tall', os: 'knn_vector' },
  { t: 'kNN', s: 'hent 20', os: 'HNSW, k: 20' },
  { t: 'DTW', s: 'rerank til 3', os: 'rescore' },
]
</script>

<template>
  <div class="pl">
    <template v-for="(st, i) in steps" :key="i">
      <div v-if="i > 0" class="link" :class="{ on: active > i }" />
      <div class="step" :class="{ on: active > i, now: active === i + 1 }">
        <div class="t">{{ st.t }}</div>
        <div class="s">{{ st.s }}</div>
        <div v-if="os" class="os">{{ st.os }}</div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.pl {
  display: flex;
  align-items: center;
  gap: 4px;
}
.step {
  width: 112px;
  padding: 14px 8px;
  border-radius: 14px;
  background: var(--sp-surface);
  text-align: center;
  opacity: 0.35;
  transform: scale(0.94);
  transition: opacity 0.4s, transform 0.45s cubic-bezier(0.3, 1.3, 0.5, 1), box-shadow 0.4s;
}
.step.on {
  opacity: 1;
  transform: scale(1);
}
.step.now {
  background: var(--sp-elev);
  transform: scale(1.07);
  box-shadow: 0 0 0 1px var(--sp-green), 0 10px 36px -8px rgba(127, 140, 213, 0.55);
}
.t {
  font-size: 19px;
  font-weight: 800;
}
.s {
  font-size: 12px;
  color: var(--sp-sub);
  margin-top: 4px;
}
.os {
  margin-top: 10px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--sp-blue);
  border-top: 1px solid var(--sp-elev2);
  padding-top: 8px;
}
.link {
  width: 14px;
  height: 3px;
  border-radius: 2px;
  background: var(--sp-elev2);
  transition: background 0.4s;
}
.link.on {
  background: var(--sp-green);
}
</style>
