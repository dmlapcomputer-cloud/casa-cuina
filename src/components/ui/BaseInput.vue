<template>
  <div class="w-full space-y-1 group relative pb-4">
    <label
      v-if="label"
      :for="inputId"
      class="block text-[8px] font-black uppercase tracking-[0.4em] text-stone-400 group-focus-within:text-stone-900 transition-all duration-500 mb-1"
    >
      {{ label }}
    </label>

    <div class="relative">
      <component
        :is="type === 'textarea' ? 'textarea' : 'input'"
        :id="inputId"
        :type="type !== 'textarea' ? type : undefined"
        :value="modelValue"
        @input="handleInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
        v-bind="$attrs"
        :placeholder="placeholder"
        :class="[
          'w-full bg-transparent border-b border-stone-200 py-3 text-stone-900 text-base transition-all duration-700 font-light',
          'placeholder:text-stone-200 placeholder:font-light placeholder:italic placeholder:text-sm',
          'focus:border-stone-200 outline-none ring-0',
          type === 'textarea' ? 'min-h-[100px] resize-none' : '',
          error ? 'border-red-300' : isTelIncomplete ? 'border-orange-400' : ''
        ]"
      />

      <div
  class="absolute bottom-0 left-0 h-[1.5px] transition-all duration-700 ease-out"
  :class="isTelIncomplete ? 'bg-orange-400' : 'bg-stone-900'"
  :style="{ width: isFocused ? '100%' : '0%' }"
></div>

      <div class="absolute right-0 bottom-3 flex items-center gap-2 pointer-events-none">
        <Transition name="fade">
          <Icon v-if="isValid && !error" icon="lucide:check" class="text-stone-300 w-4 h-4" />
        </Transition>
        <Transition name="fade">
          <Icon v-if="error" icon="lucide:info" class="text-red-400 w-4 h-4" />
        </Transition>
      </div>
    </div>

    <Transition name="slide-up">
      <p v-if="error" class="text-[9px] text-red-500 font-bold uppercase tracking-tighter mt-2 ml-1">
        {{ error }}
      </p>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';

const isFocused = ref(false);

interface Props {
  modelValue: string | number;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'tel' | 'email' | 'date';
  required?: boolean;
  error?: string;
  onlyNumbers?: boolean;
  maxCharacters?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
});

const emit = defineEmits(['update:modelValue']);

// Generador de ID único
const inputId = `input-${Math.random().toString(36).substring(2, 9)}`;

// Lógica de validación visual para el check
const isValid = computed(() => {
  const val = props.modelValue?.toString() || '';
  if (val.length === 0) return false;

  if (props.type === 'tel') {
    const required = props.maxCharacters ?? 10;
    return val.length >= required;
  }

  if (props.onlyNumbers) return val.length >= 8;
  return val.length >= 3;
});
const isTelIncomplete = computed(() => {
  if (props.type !== 'tel') return false;
  const val = props.modelValue?.toString() || '';
  const required = props.maxCharacters ?? 10;
  return val.length > 0 && val.length < required;
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value;

  if (props.type === 'tel') {
  value = value.replace(/\D/g, '');
  }

  if (props.maxCharacters && value.length > props.maxCharacters) {
    value = value.slice(0, props.maxCharacters);
  }

  target.value = value;
  emit('update:modelValue', value);
};
</script>

<style scoped>
/* Animaciones suaves */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

/* Evitar el color amarillo de autofill en Chrome */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px #F9F8F6 inset;
  transition: background-color 5000s ease-in-out 0s;
}
</style>
