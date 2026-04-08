<template>
  <button
    type="button"
    @click="emit('click')"
    class="flex items-center justify-center gap-1 px-2 py-1.5 md:px-3 md:py-2 rounded-xl md:rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer"
    :class="selected
      ? 'border-primary bg-primary/10'
      : 'border-stone-200 bg-stone-50 hover:border-primary/50'"
  >
    <!-- En mobile: tamaño corto "10/15" en vez de "10/15 PERS." -->
    <span class="text-[9px] font-bold uppercase tracking-tight leading-none"
      :class="selected ? 'text-primary' : 'text-stone-500'">
      {{ shortSize }}
    </span>
    <span class="text-[9px] md:text-[11px] font-bold leading-none"
      :class="selected ? 'text-primary' : 'text-stone-700'">
      {{ price }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  size: string
  price: string
  selected: boolean
}>()

const emit = defineEmits<{ (e: 'click'): void }>()

// "10/15 Personas" → "10/15" en mobile para ahorrar espacio
const shortSize = computed(() =>
  props.size.replace(/\s*(personas?|pers\.?)/i, '').trim()
)
</script>
