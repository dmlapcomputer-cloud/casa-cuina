<template>
  <div class="col-span-1 md:col-span-2 space-y-6">
    <div class="flex flex-col gap-1">
      <div class="flex items-center gap-4">
        <span class="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 whitespace-nowrap">
          Servicios Adicionales
        </span>
        <div class="h-[1px] w-full bg-stone-100"></div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div v-for="item in items" :key="item.id" class="relative group">
        <div :class="[
          'overflow-hidden rounded-2xl border-[2px] transition-all duration-700 bg-white',
          isItemActive(item) ? 'border-primary shadow-md' : 'border-stone-100 shadow-sm',
        ]">
          <div class="p-4 flex items-center justify-between cursor-pointer select-none gap-2"
            @click="handleMainClick(item)">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div @click.stop="toggleItem(item)" :class="[
                'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 shrink-0 shadow-sm cursor-pointer',
                isItemActive(item) ? 'bg-primary border-primary rotate-[360deg]' : 'bg-white border-stone-700',
              ]">
                <svg v-if="isItemActive(item)" class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div class="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 min-w-0">
                <span class="text-sm font-bold text-stone-900 uppercase tracking-tight truncate">
                  {{ item.name }}
                </span>
                <transition name="fade-slide">
                  <span v-if="getSelectedValue(item.id!) && !isExpanded(item.id!)"
                    class="inline-block text-[9px] md:text-[10px] font-black text-primary tracking-[0.1em] uppercase bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10 whitespace-nowrap self-start md:self-center">
                    {{ getSelectedValue(item.id!) }}
                  </span>
                </transition>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-auto">
              <span class="font-serif italic text-base md:text-lg text-stone-900 whitespace-nowrap">
                Bs. {{ Math.round(+item.price) }}
              </span>
              <button v-if="item.options?.length" @click.stop="toggleAccordion(item.id!)" type="button"
                class="p-1.5 rounded-full hover:bg-stone-50 transition-colors">
                <svg
                  :class="['w-5 h-5 transition-transform duration-500', isExpanded(item.id!) ? 'rotate-180 text-primary' : 'text-stone-300']"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          <!---aqui es donde se muetsra cuando el componete tiene item hijos --->
          <transition @enter="startTransition" @after-enter="endTransition" @before-leave="startTransition"
            @after-leave="endTransition">
            <div v-if="isExpanded(item.id!) && item.options?.length"
              class="overflow-hidden bg-stone-100/40 border-t border-stone-50">
              <div class="p-5">
                <div class="grid grid-cols-2 gap-x-4 gap-y-6">
                  <div v-for="opt in item.options" :key="opt.variant" class="flex flex-col">
                    <button @click="updateVariant(item.id!, opt.variant)" type="button" :class="[
                      'relative flex flex-col rounded-2xl overflow-hidden border-[3px] transition-all duration-500 group/opt bg-white mb-2',
                      getSelectedValue(item.id!) === opt.variant ? 'border-primary shadow-xl scale-[1.02]' : 'border-stone-200 hover:border-primary/50',
                    ]">
                      <div class="aspect-[3/4] w-full relative overflow-hidden">
                        <ItemVariantImage :src="opt.image" :alt="opt.variant" class="w-full h-full object-cover" />
                        <div v-if="getSelectedValue(item.id!) === opt.variant"
                          class="absolute inset-0 flex items-center justify-center animate-fade-in pointer-events-none">
                          <div class="bg-primary text-white p-2 md:p-3 rounded-full shadow-2xl scale-110 md:scale-125">
                            <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4"
                                d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>
                    <div class="text-center px-1">
                      <span
                        :class="['text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] transition-colors duration-300', getSelectedValue(item.id!) === opt.variant ? 'text-primary' : 'text-stone-500']">
                        {{ opt.variant }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!---Modal que sale cuando se habilita para dedicatoria-->
    <transition name="fade">
      <div v-if="showDedicatoriaModal"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
        <div
          class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-stone-bg animate-in fade-in zoom-in duration-300">
          <div class="p-8">
            <div class="flex flex-col items-center text-center mb-8">
              <span class="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Personalización</span>
              <h3 class="font-serif italic text-3xl text-stone-900">Dedicatoria</h3>
              <p class="text-stone-500 text-[11px] uppercase tracking-widest mt-2">Item: {{ pendingItem?.name }}</p>
            </div>

            <div class="mb-6">
              <BookingInput v-model="tempDedication" label="Mensaje especial" type="textarea"
                placeholder="Escribe aquí la dedicatoria..." :max-characters="30" class="w-full" />
            </div>

            <div class="flex gap-4 mt-8">
              <button @click="showDedicatoriaModal = false"
                class="flex-1 h-12 px-2 font-sans text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 border border-stone-100 rounded-xl hover:border-stone-800 hover:text-stone-800 transition-all duration-500">
                Cancelar
              </button>

              <button @click="confirmDedicatoria" :disabled="!tempDedication.trim()"
                class="flex-1 h-12 bg-primary text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Items } from '@/services/Events/itemServices'
import ItemVariantImage from '../ui/ItemVariantImage.vue'
import BookingInput from './BookingInput.vue';
const props = defineProps<{
  modelValue: Items[]
  items: Items[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Items[]): void
}>()

// --- ESTADOS ---
const openStates = ref<Record<number, boolean>>({})
const showDedicatoriaModal = ref(false)
const tempDedication = ref('')
const pendingItem = ref<Items | null>(null)
const pendingVariant = ref<string | null>(null)

// --- HELPERS ---
const isSelected = (id: number): boolean => props.modelValue.some((i) => i.id === id)
const isExpanded = (id: number): boolean => !!openStates.value[id]
const getSelectedValue = (id: number): string => props.modelValue.find((i) => i.id === id)?.selectedOption || ''

const isItemActive = (item: Items): boolean => {
  const hasVariant = !!getSelectedValue(item.id!)
  const isSimpleSelected = isSelected(item.id!) && (!item.options || item.options.length === 0)
  return hasVariant || isSimpleSelected
}

// --- LOGICA DE INTERACCIÓN ---
const handleMainClick = (item: Items) => {
  if (item.id === undefined) return
  if (item.options?.length) {
    toggleAccordion(item.id)
  } else {
    toggleItem(item)
  }
}

const toggleAccordion = (id: number) => {
  openStates.value[id] = !openStates.value[id]
}

const toggleItem = (item: Items) => {
  if (item.id === undefined) return

  // Interceptar para dedicatoria (has_dedication: "1")
  if (item.has_dedication === true && !isSelected(item.id)) {
    pendingItem.value = item
    pendingVariant.value = null
    tempDedication.value = ''
    showDedicatoriaModal.value = true
    return
  }

  applyToggle(item)
}

const updateVariant = (itemId: number, variant: string) => {
  const baseItem = props.items.find((i) => i.id === itemId)
  if (!baseItem) return

  // Interceptar para dedicatoria en variante
  if (baseItem.has_dedication === true && getSelectedValue(itemId) !== variant) {
    pendingItem.value = baseItem
    pendingVariant.value = variant
    tempDedication.value = ''
    showDedicatoriaModal.value = true
    return
  }

  applyVariant(itemId, variant)
}

// --- LOGICA DE DATOS (Manejo del modelValue) ---
const applyToggle = (item: Items, dedicationText?: string) => {
  const current = [...props.modelValue]
  const index = current.findIndex((i) => i.id === item.id)

  if (index > -1) {
    current.splice(index, 1)
    openStates.value[item.id!] = false
  } else {
    if (!item.options?.length) {
      current.push({ ...item, dedication: dedicationText || '' } as Items)
    } else {
      openStates.value[item.id!] = true
    }
  }
  emit('update:modelValue', current)
}

const applyVariant = (itemId: number, variant: string, dedicationText?: string) => {
  const baseItem = props.items.find((i) => i.id === itemId)
  const current = [...props.modelValue]
  const index = current.findIndex((i) => i.id === itemId)

  if (index > -1) {
    if (current[index]?.selectedOption === variant && !dedicationText) {
      current.splice(index, 1)
      setTimeout(() => { openStates.value[itemId] = false }, 300)
    } else {
      current[index] = {
        ...current[index], selectedOption: variant, dedication: dedicationText || current[index]?.has_dedication

      } as Items
      setTimeout(() => { openStates.value[itemId] = false }, 400)
    }
  } else {
    current.push({ ...baseItem, selectedOption: variant, dedication: dedicationText || '' } as Items)
    setTimeout(() => { openStates.value[itemId] = false }, 400)
  }
  emit('update:modelValue', current)
}

const confirmDedicatoria = () => {
  if (!pendingItem.value) return
  if (pendingVariant.value) {
    applyVariant(pendingItem.value.id!, pendingVariant.value, tempDedication.value)
  } else {
    applyToggle(pendingItem.value, tempDedication.value)
  }
  showDedicatoriaModal.value = false;
  pendingItem.value = null;
  tempDedication.value = '';
}

// Animaciones Acordeón
const startTransition = (el: Element) => { (el as HTMLElement).style.height = (el as HTMLElement).scrollHeight + 'px' }
const endTransition = (el: Element) => { (el as HTMLElement).style.height = '' }
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-slide-enter-active {
  transition: all 0.3s ease-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
