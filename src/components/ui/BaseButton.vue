<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[variantClass, block ? 'w-full' : '']"
  >
    <div v-if="loading" class="spinner" />
    <slot>
      <span :class="{ 'opacity-80': loading }">
        {{ loading ? loadingLabel : label }}
      </span>
    </slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label?: string
  loadingLabel?: string
  loading?: boolean
  disabled?: boolean
  block?: boolean
  type?: 'button' | 'submit' | 'reset'
  variant?: 'confirm' | 'next' | 'ghost'
}>(), {
  loadingLabel: 'Procesando...',
  type: 'button',
  variant: 'confirm',
  block: false,
})

const variantClass = computed(() => ({
  confirm: 'btn-confirm',
  next:    'btn-next',
  ghost:   'text-stone-400 hover:text-stone-600 font-bold text-[10px] uppercase tracking-widest transition-colors py-2 flex items-center justify-center',
}[props.variant]))
</script>

<style scoped>
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
