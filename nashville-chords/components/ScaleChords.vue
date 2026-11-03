<script setup lang="ts">
import { DIATONIC, parseChord } from '../lib/theory'

withDefaults(
  defineProps<{
    k?: string
    show?: 'both' | 'number' | 'letter'
    /** Fremhev bare dur- eller moll-akkordene */
    highlight?: 'all' | 'major' | 'minor'
    neutral?: boolean
    tint?: boolean
  }>(),
  { show: 'both', highlight: 'all' },
)

const quality = (t: string) => parseChord(t, 'C').quality
</script>

<template>
  <div class="row">
    <Chord
      v-for="(t, i) in DIATONIC"
      :key="t"
      :degree="t"
      :k="k"
      :show="show"
      :index="i"
      size="md"
      :neutral="neutral"
      :tint="tint"
      white
      :dim="highlight !== 'all' && quality(t) !== highlight"
    />
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: 12px;
}
</style>
