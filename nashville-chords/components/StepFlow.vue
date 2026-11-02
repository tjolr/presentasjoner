<script setup lang="ts">
// Tre steg: Syng → Hør → Spill. `active` (0-3) styrer hvor mange som er tent.
defineProps<{ active: number }>()

const steps = [
  { n: 1, title: 'Syng', text: 'Syng tallene og intervallene' },
  { n: 2, title: 'Hør', text: 'Kjenn igjen tallene uten å se noter' },
  { n: 3, title: 'Spill', text: 'Finn dem på instrumentet' },
]
</script>

<template>
  <div class="flow">
    <template v-for="(s, i) in steps" :key="s.n">
      <div v-if="i > 0" class="link" :class="{ on: active > i }" />
      <div class="step" :class="{ on: active > i, now: active === i + 1 }">
        <div class="badge">{{ s.n }}</div>
        <div class="title">{{ s.title }}</div>
        <div class="text">{{ s.text }}</div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.flow {
  display: flex;
  align-items: center;
  gap: 8px;
}
.step {
  width: 230px;
  padding: 26px 20px;
  border-radius: 16px;
  background: var(--sp-surface);
  text-align: center;
  opacity: 0.35;
  transform: scale(0.95);
  transition:
    opacity 0.4s,
    transform 0.45s cubic-bezier(0.3, 1.3, 0.5, 1),
    box-shadow 0.4s,
    background 0.3s;
}
.step.on {
  opacity: 1;
  transform: scale(1);
}
.step.now {
  background: var(--sp-elev);
  transform: scale(1.06);
  box-shadow:
    0 0 0 1px var(--sp-green),
    0 10px 36px -8px rgba(30, 215, 96, 0.55);
}
.badge {
  width: 38px;
  height: 38px;
  margin: 0 auto 12px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--sp-elev2);
  font-weight: 800;
  transition:
    background 0.3s,
    color 0.3s;
}
.step.on .badge {
  background: var(--sp-green);
  color: #000;
}
.title {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.text {
  margin-top: 6px;
  font-size: 16px;
  color: var(--sp-sub);
}
.link {
  width: 40px;
  height: 3px;
  border-radius: 2px;
  background: var(--sp-elev2);
  transition: background 0.4s;
}
.link.on {
  background: var(--sp-green);
}
</style>
