import { ref } from 'vue'

/** Global toneart som styrer alle akkordene i presentasjonen (med mindre en komponent overstyrer med `k`). */
export const globalKey = ref('C')

/** Hva et klikk spiller: grunntonen som bass, grunntonen på piano (mellomtone) eller hele akkorden. Styres av knappene øverst til høyre. */
export const playMode = ref<'bass' | 'piano' | 'chord'>('bass')

/** Hvilken sang som er åpen med «Vis sang» (én om gangen). */
export const openSong = ref('')
