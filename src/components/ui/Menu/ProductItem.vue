<template>
  <div
    @click="handleCardClick"
    :class="[
      'group flex flex-col md:flex-row items-center justify-between p-4 transition-all duration-700 bg-white border-[2px] rounded-2xl mb-4 cursor-pointer select-none',
      quantity > 0
        ? 'border-primary shadow-md'
        : 'border-stone-100 hover:border-stone-300 shadow-sm'
    ]"
  >
    <div class="flex-1 pr-6 mb-4 md:mb-0 w-full text-left">
      <div class="flex items-baseline gap-3 mb-2">
        <div :class="[
          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 shrink-0 shadow-sm',
          quantity > 0 ? 'bg-primary border-primary rotate-[360deg]' : 'bg-white border-stone-200',
        ]">
          <svg v-if="quantity > 0" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h4 class="font-display text-[18px] md:text-[20px] font-bold text-stone-900 leading-tight">
          {{ title }}
        </h4>

        <div class="h-[1px] flex-grow border-b border-dotted border-stone-200 opacity-60"></div>

        <span class="font-serif italic font-bold text-primary text-lg md:text-xl whitespace-nowrap">
          Bs. {{ price }}
        </span>
      </div>

      <p class="pl-8 font-sans text-stone-500 text-[13px] md:text-sm leading-relaxed line-clamp-2 md:line-clamp-none">
        {{ description }}
      </p>
    </div>

    <div
      @click.stop
      :class="['shrink-0 transition-transform duration-300', quantity > 0 ? 'scale-105' : 'scale-100']"
    >
      <QuantitySelector
        v-model="quantity"
        @update:modelValue="handleUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import QuantitySelector from './QuantitySelector.vue';

export interface ProductChangeEvent {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface Props {
  id: number | string;
  title: string;
  description: string;
  price: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'change', data: ProductChangeEvent): void }>();

const quantity = ref<number>(0);

/**
 * Lógica de clic en la tarjeta:
 * Si es 0, lo subimos a 1. Si ya es > 0, lo bajamos a 0 (como un Toggle).
 */
const handleCardClick = () => {
  const nextVal = quantity.value === 0 ? 1 : 0;
  handleUpdate(nextVal);
};

/**
 * Procesa la actualización de cantidad y emite el evento tipado
 */
const handleUpdate = (newVal: number): void => {
  quantity.value = newVal;

  emit('change', {
    id: props.id,
    name: props.title,
    price: props.price,
    quantity: newVal,
    total: newVal * props.price
  });
};
</script>
