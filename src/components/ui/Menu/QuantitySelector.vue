<template>
  <div class="flex items-center bg-stone-100 rounded-full p-1 shadow-inner border border-stone-200">
    <button
      @click="$emit('update:modelValue', modelValue - 1)"
      :disabled="modelValue <= 0"
      class="w-8 h-8 flex items-center justify-center rounded-full bg-white text-stone-800 shadow-sm hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
    >
      <Icon icon="lucide:minus" class="w-4 h-4" />
    </button>

    <span class="w-10 text-center font-serif italic font-bold text-stone-900 text-lg">
      {{ modelValue }}
    </span>

    <button
      @click="$emit('update:modelValue', modelValue + 1)"
      class="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary/90 transition-all active:scale-90"
    >
      <Icon icon="lucide:plus" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

defineProps<{
  modelValue: number
}>();

defineEmits(['update:modelValue']);
</script>
