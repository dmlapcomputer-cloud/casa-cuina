<template>
  <div class="pt-2 md:pt-3 border-t border-stone-50">
    <p class="hidden md:block text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-2">
      Elige tu porción
    </p>
    <div class="flex flex-wrap gap-1 md:gap-1.5">
      <PriceChip
        v-for="(option, index) in options.slice(0, 3)"
        :key="index"
        :size="option.size"
        :price="option.price"
        :selected="modelValue === index"
        @click="emit('update:modelValue', modelValue === index ? null : index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import PriceChip from './PriceChip.vue'

defineProps<{
  options: { size: string; price: string }[]
  modelValue: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()
</script>
