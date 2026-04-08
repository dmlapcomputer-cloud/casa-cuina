<template>
  <div class="col-span-1 md:col-span-2 space-y-3">

    <!-- Label -->
    <div class="flex items-center gap-4">
      <span class="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 whitespace-nowrap">
        Torta
      </span>
      <div class="h-[1px] w-full bg-stone-100" />
    </div>

    <!-- Combo -->
    <div ref="comboRef">

      <!-- Trigger -->
      <button type="button" @click="toggleOpen" :class="[
        'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border-[2px] transition-all duration-500 bg-white text-left',
        isOpen ? 'border-primary shadow-md' : 'border-stone-100 shadow-sm hover:border-stone-200'
      ]">
        <!-- Sin selección -->
        <div v-if="!modelValue" class="flex items-center gap-3 min-w-0">
          <span class="text-2xl">🎂</span>
          <span class="font-sans text-sm font-bold text-stone-800">Elige tu torta...</span>
        </div>

        <!-- Con selección simple -->
        <div v-else class="flex items-center gap-3 min-w-0 flex-1">
          <div class="w-10 h-10 rounded-xl overflow-hidden shrink-0">
            <MenuItemImagen
              :images="([modelValue.image_url] as string[])"
              :alt="modelValue.name"
            />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-serif italic text-sm text-stone-900 truncate">{{ modelValue.name }}</span>
            <span class="font-sans text-[11px] text-primary font-bold tracking-wide">
              {{ modelValue.size }} · {{ modelValue.price }}
            </span>
          </div>
          <!-- Quitar selección -->
          <button type="button" @click.stop="emit('update:modelValue', null)"
            class="ml-auto p-1.5 rounded-full hover:bg-red-50 transition-colors shrink-0">
            <svg class="w-7 h-7 text-stone-300 hover:text-red-400" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Flecha -->
        <svg
          :class="['w-5 h-5 transition-transform duration-500 text-primary shrink-0', isOpen ? 'rotate-180 text-primary' : '']"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown -->
      <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
        <div v-if="isOpen"
          class="mt-2 w-full bg-white rounded-2xl border border-stone-100 shadow-xl overflow-hidden">
          <!-- Skeleton -->
          <div v-if="loading" class="p-4 space-y-3">
            <div v-for="i in 3" :key="i" class="h-16 rounded-xl bg-stone-100 animate-pulse" />
          </div>

          <!-- Lista de tortas -->
          <div v-else class="max-h-[480px] overflow-y-auto divide-y divide-stone-50">
            <div v-for="cake in cakes" :key="cake.id" class="p-4">

              <!-- Imagen + nombre -->
              <div class="flex flex-col sm:flex-row gap-3 mb-3">
                <!-- Imagen -->
                <div class="w-full sm:w-24 h-40 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-stone-50">
                  <MenuItemImagen
                    :images="([cake.image_url, ...(cake.images_json ?? [])] as string[])"
                    :alt="cake.name"
                  />
                </div>
                <div class="flex flex-col justify-center min-w-0">
                  <span class="font-serif italic text-sm text-stone-800 leading-snug">{{ cake.name }}</span>
                  <span v-if="cake.min_prep_hours" class="text-[10px] text-stone-400 font-sans mt-1">
                    ⏱ {{ cake.min_prep_hours }}h de anticipación
                  </span>
                </div>
              </div>

              <!-- Porciones — scroll horizontal en móvil, wrap en desktop -->
              <div class="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible scrollbar-none">
                <button v-for="(option, index) in getPriceOptions(cake)" :key="index" type="button"
                  @click="selectOption(cake, option)" :class="[
                    'flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-sans text-[11px] font-bold transition-all duration-300 shrink-0',
                    isOptionSelected(cake, option)
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-stone-200 text-stone-600 hover:border-primary/50 bg-white'
                  ]">
                  <div :class="[
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-500',
                    isOptionSelected(cake, option) ? 'bg-primary border-primary' : 'bg-white border-stone-300'
                  ]">
                    <svg v-if="isOptionSelected(cake, option)" class="w-2.5 h-2.5 text-white" fill="none"
                      viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {{ option.size }} · {{ option.price }}
                </button>
              </div>

            </div>
          </div>
        </div>
      </transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { MenuItemService } from '@/services/Menu/menuService'
import type { Product } from '@/types/Menu/Menu-interface'
import MenuItemImagen from '@/components/ui/Menu/MenuItemImagen.vue'

export interface CakeSelection {
  product_id: number
  name: string
  image_url: string
  size: string
  price: string,
  min_prep_hours : number;
}

const props = defineProps<{
  modelValue: CakeSelection | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: CakeSelection | null): void
}>()


const cakes = ref<Product[]>([])
const loading = ref(true)
const isOpen = ref(false)
const comboRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  try {
    const data = await MenuItemService.getItemMenu()
    cakes.value = data.filter(p => p.category_id == 18 || p.category?.name === 'Tortas')
  } finally {
    loading.value = false
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (e: MouseEvent) => {
  if (comboRef.value && !comboRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

const toggleOpen = () => { isOpen.value = !isOpen.value }

const getPriceOptions = (cake: Product) => {
  if (!cake.description) return []
  const div = document.createElement('div')
  div.innerHTML = cake.description
  return Array.from(div.querySelectorAll('li')).map(li => {
    const text = li.textContent || ''
    if (text.includes('Bs.')) {
      const parts = text.split(/Bs\./)
      return { size: parts[0]?.replace(':', '').trim() || '', price: `Bs. ${parts[1]?.trim()}` }
    }
    return { size: text, price: '' }
  })
}

const isOptionSelected = (cake: Product, option: { size: string; price: string }) =>
  props.modelValue?.product_id === cake.id && props.modelValue?.size === option.size

const selectOption = (cake: Product, option: { size: string; price: string }) => {
  if (isOptionSelected(cake, option)) {
    emit('update:modelValue', null)
    return
  }
  emit('update:modelValue', {
    product_id: cake.id,
    name: cake.name,
    image_url: cake.image_url,
    size: option.size,
    price: option.price,
    min_prep_hours: cake.min_prep_hours
  })
  isOpen.value = false
}
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
