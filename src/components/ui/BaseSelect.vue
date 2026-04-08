<!-- src/components/ui/BaseSelect.vue -->
<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-[10px] font-black uppercase text-slate-500">
      {{ label }} <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <select
      :value="modelValue"
      @change="handleChange"
      class="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 transition"
      :class="selectClasses"
      :disabled="loading"
      :required="required"
    >
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <p v-if="error" class="text-sm text-red-600 mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Option {
  value: number | string
  label: string
}

interface Props {
  modelValue: number | string | null
  label?: string
  placeholder?: string
  required?: boolean
  error?: string
  loading?: boolean
  options: Option[]
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  placeholder: 'Selecciona una opción',
  required: false,
  error: undefined,
  loading: false,
  options: () => [],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string | null): void
}>()

const handleChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  // Si el valor es cadena vacía, emitimos null
  emit('update:modelValue', value === '' ? null : value)
}

const selectClasses = computed(() => {
  const base = 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  const errorClass = props.error ? 'border-red-500 ring-red-100' : ''
  const disabledClass = props.loading ? 'bg-gray-100 cursor-not-allowed' : ''
  return `${base} ${errorClass} ${disabledClass}`
})
</script>
