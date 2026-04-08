<template>
  <button
    type="button"
    @click="emit('click')"
    :disabled="disabled"
    class="w-full flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-xl font-sans font-bold text-[11px] md:text-[13px] transition-all duration-200"
    :class="disabled
      ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
      : 'bg-[#25D366] text-white shadow-md shadow-green-200 hover:bg-[#1ebe5d] cursor-pointer'"
  >
    <span>{{ disabled ? placeholder : label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  placeholder?: string
  disabled: boolean
}>()

const emit = defineEmits<{ (e: 'click'): void }>()
</script>
