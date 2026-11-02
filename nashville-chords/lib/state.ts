import { ref } from 'vue'

/** Global toneart som styrer alle akkordene i presentasjonen (med mindre en komponent overstyrer med `k`). */
export const globalKey = ref('C')

/** Hva et klikk spiller: bare grunntonen (bass) eller hele akkorden. Styres av knappene øverst til høyre. */
export const playMode = ref<'bass' | 'chord'>('bass')
