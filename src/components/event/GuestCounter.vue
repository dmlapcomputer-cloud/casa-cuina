<template>
  <div class="flex flex-col lg:flex-row items-center justify-between w-full py-6 lg:py-2 gap-5 lg:gap-0">

    <label class="form-label-booking text-[10px] font-black text-stone-900 uppercase tracking-ultra-wide text-center lg:text-left leading-relaxed">
      Cantidad de Personas
    </label>

    <div class="flex items-center gap-6">
      <button
        @click="updateValue(Math.max(1, modelValue - 1))"
        type="button"
        class="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center bg-white text-stone-900 transition-all active:scale-90 shadow-sm hover:border-stone-400"
      >
        <Icon icon="lucide:minus" class="text-xs" />
      </button>

      <span class="text-4xl form-value-booking text-stone-900 min-w-[70px] text-center select-none">
        {{ modelValue }}
      </span>

      <button
        @click="updateValue(modelValue + 1)"
        type="button"
        class="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white shadow-lg transition-all active:scale-90 hover:bg-stone-800"
      >
        <Icon icon="lucide:plus" class="text-xs" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const updateValue = (val: number) => {
  emit('update:modelValue', val)
}
</script>

<style scoped>
.font-serif { font-family: 'Playfair Display', serif; }
</style>
