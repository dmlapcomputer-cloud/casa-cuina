<template>
  <div
    class="px-2 md:px-3 py-1 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
    :class="numericTime <= 12 ? 'bg-primary/90 text-white' : 'bg-stone-800/80 text-white'"
  >
    {{ time }} ant.
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ time: string }>()

const numericTime = computed(() => {
  return parseInt(props.time) || 0
})
</script>
