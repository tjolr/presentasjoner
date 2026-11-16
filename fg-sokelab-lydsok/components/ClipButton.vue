<script setup lang="ts">
// «▶ Opptaket»: spill av klippet fra starten av presentasjonen, slik at analysen viser det.
import { clip, playing, toggleClip } from '../lib/recording'
</script>

<template>
  <button v-if="clip" class="pill g" @click="toggleClip">{{ playing ? '■ Stopp opptaket' : '▶ Opptaket' }}</button>
</template>
