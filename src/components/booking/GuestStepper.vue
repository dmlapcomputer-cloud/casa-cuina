<template>
  <div class="flex flex-col items-center w-full max-w-[220px] mx-auto">
    <header class="mb- text-center">
      <p class="text-label text-stone-600 uppercase">
        Cantidad de personas
      </p>
    </header>

    <div class="relative flex items-center justify-center w-full h-20 overflow-hidden">

      <!-- Gradientes más estrechos -->
      <div class="absolute left-0 top-0 bottom-0 w-12 md:w-20 z-20 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none"></div>
      <div class="absolute right-0 top-0 bottom-0 w-12 md:w-20 z-20 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none"></div>

      <transition name="fade">
        <button
          v-if="!isEditing && modelValue > min"
          type="button"
          @mousedown="startAutoStep(decrement)"
          @mouseup="stopAutoStep"
          @mouseleave="stopAutoStep"
          class="absolute left-1 z-40 w-11 h-11 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-stone-500 text-stone-600 hover:text-stone-900 bg-white transition-all active:scale-90 shadow-sm"
        >
          <Icon icon="lucide:minus" class="w-4 h-4" />
        </button>
      </transition>

      <transition name="fade">
        <button
          v-if="!isEditing && modelValue < max"
          type="button"
          @mousedown="startAutoStep(increment)"
          @mouseup="stopAutoStep"
          @mouseleave="stopAutoStep"
          class="absolute right-1 z-40 w-10 h-10 flex items-center justify-center rounded-full bg-[#1e293b] text-white shadow-md transition-all active:scale-90 hover:bg-primary"
        >
          <Icon icon="lucide:plus" class="w-4 h-4" />
        </button>
      </transition>

      <div
        class="relative w-full h-full flex items-center justify-center"
        :class="isEditing ? 'cursor-text' : 'cursor-grab active:cursor-grabbing'"
        @mousedown="startDrag"
        @touchstart="startTouch"
        @touchmove="onTouchMove"
        @touchend="stopDrag"
      >
        <div
          class="flex items-center transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
          :style="{
            transform: isEditing
              ? 'translateX(0px)'
              : `translateX(calc(50% - ${activeIndex  * 60 + 30}px))`,
          }"
        >
          <div v-if="isEditing" class="w-[50px] flex justify-center">
            <input
              ref="inputRef"
              v-model="inputValue"
              type="number"
              inputmode="numeric"
              @blur="finishEdit"
              @keyup.enter="finishEdit"
              class="number-display w-24 text-center bg-transparent outline-none border-b-2 border-primary/30 no-spinner"
              :class="Number(inputValue) > max || Number(inputValue) < min ? 'text-red-500' : ''"
            />
          </div>

          <template v-else>
            <div
              v-for="val in availableNumbers"
              :key="val"
              @click="handleNumberClick(val)"
              class="w-[60px] shrink-0 flex items-center justify-center transition-all duration-500 select-none"
              :class="[val === modelValue ? 'opacity-100 scale-100' : 'opacity-10 scale-50']"
            >
              <span class="number-display leading-none">
                {{ val }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!---<div class="h-4 mt-2">
      <transition name="fade">
        <p v-if="isEditing && (Number(inputValue) > max)" class="text-[10px] text-red-400 font-bold uppercase tracking-wider">
          Máximo {{ max }} invitados
        </p>
      </transition>
    </div>-->
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, nextTick, onUnmounted, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    max?: number
    min?: number
    step?:number
  }>(),
  {
    max: 50,
    min: 1,
    step:1
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const isEditing = ref(false)
const inputValue = ref(props.modelValue)
const inputRef = ref<HTMLInputElement | null>(null)

const handleNumberClick = (n: number) => {
  if (n === props.modelValue) {
    isEditing.value = true
    inputValue.value = props.modelValue
    nextTick(() => inputRef.value?.focus())
  } else {
    emit('update:modelValue', n)
  }
}

const finishEdit = () => {
  // 1. Limpieza de entrada
  let val = Math.round(Number(inputValue.value));

  // Si el usuario borra todo y deja vacío, volvemos al min o al valor anterior
  if (!inputValue.value && inputValue.value !== 0) {
    val = props.modelValue;
  }

  // 2. Ajuste de límites
  if (val > props.max) val = props.max;
  if (val < props.min) val = props.min;

  // 3. Lógica de Step (Multiplos)
  const remainder = (val - props.min) % props.step;
  if (remainder !== 0) {
    val = remainder >= props.step / 2
      ? val + (props.step - remainder)
      : val - remainder;
  }

  emit('update:modelValue', val);
  isEditing.value = false;
};

// Lógica de Auto-Step
const interval = ref<number | undefined>(undefined)
const startAutoStep = (fn: () => void) => {
  if (isEditing.value) return
  fn()
  interval.value = window.setInterval(fn, 160)
}
const stopAutoStep = () => {
  if (interval.value) { clearInterval(interval.value); interval.value = undefined; }
}

const increment = () => {
  const next = props.modelValue + props.step
  if (next <= props.max) emit('update:modelValue', next)
}
const decrement = () => {
  const prev = props.modelValue - props.step
  if (prev >= props.min) emit('update:modelValue', prev)
}

// Lógica de Drag & Touch
let startX = 0
const DRAG_THRESHOLD = 40 // distancia mínima para considerar un cambio
const startDrag = (e: MouseEvent) => {
  if (isEditing.value) return
  startX = e.clientX
  window.addEventListener('mousemove', onDrag); window.addEventListener('mouseup', stopDrag)
}
const onDrag = (e: MouseEvent) => {
  const diff = e.clientX - startX;
  if (Math.abs(diff) > DRAG_THRESHOLD) {
    if (diff > 0) decrement()
    else increment()
    startX = e.clientX
  }
}
const startTouch = (e: TouchEvent) => {
  if (isEditing.value || !e.touches[0]) return
  startX = e.touches[0].clientX
}
const onTouchMove = (e: TouchEvent) => {
  if (isEditing.value || !e.touches[0]) return
  const currentX = e.touches[0].clientX
  const diff = currentX - startX
  if (Math.abs(diff) > DRAG_THRESHOLD) {
    if (diff > 0) decrement()
    else increment()
    startX = currentX
  }
}
const stopDrag = () => {
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag)
}
onUnmounted(() => { stopDrag(); stopAutoStep(); })

//generamos los numero de intervalos de 10
const availableNumbers = computed(() =>{
  const nums = []
  for(let i = props.min; i <= props.max; i+= props.step){
    nums.push(i)
  }
  return nums
})
//activcacion del carrusel
const activeIndex = computed(() => {
  const index = availableNumbers.value.indexOf(props.modelValue)
  return index >= 0 ? index : 0
})
</script>

<style scoped>

.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.no-spinner { -moz-appearance: textfield; appearance: textfield; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
