<template>
  <div class="space-y-10">

    <!-- SECCIÓN PANTALLAS LED -->
    <div class="space-y-5">
      <div class="flex justify-between items-end border-l-2 border-primary pl-4">
        <div>
          <h3 class="font-display text-xl sm:text-2xl text-stone-900 leading-none">Pantallas LED</h3>
          <p class="text-[10px] uppercase tracking-widest text-stone-400 mt-1 font-black">Límite de capacidad: 12
            pantallas</p>
        </div>
        <span class="flex items-baseline gap-1">
          <span class="font-display text-2xl sm:text-3xl text-primary leading-none">{{ totalModule }}</span>
          <span class="text-stone-300 text-sm mx-1">/</span>
          <span class="text-[10px] font-black text-stone-400">12</span>
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <button v-for="(size, index) in screenSizes" :key="`${size.id}-${index}`"
          @click="canSelectScreen(size) ? toggleScreenSelection(size) : null" type="button" :class="[
            'group relative px-3 py-5 sm:px-4 sm:py-8 rounded-2xl sm:rounded-[2rem] transition-all duration-300 border-2 flex flex-col items-center justify-between overflow-hidden min-h-[180px] sm:min-h-[220px]',
            getScreenQty(size.id) > 0
              ? 'border-primary bg-white shadow-[0_20px_40px_-10px_rgba(var(--color-primary),0.15)]'
              : 'bg-stone-50 border-stone-50 text-stone-400 hover:border-stone-200 hover:bg-stone-100/50',
          ]">
          <div class="flex items-center justify-center w-full flex-1 min-w-0">
            <div class="relative p-5 sm:p-6 w-fit mx-auto">
              <div class="absolute top-0 left-5 right-5 sm:left-6 sm:right-6 flex flex-col items-center">
                <span class="text-[7px] font-black text-stone-400 tracking-widest uppercase mb-1">
                  {{ formatSize(size.name, 0) }}m
                </span>
                <div class="w-full h-[0.5px] bg-stone-300"></div>
              </div>

              <div class="absolute right-0 top-5 bottom-5 sm:top-6 sm:bottom-6 flex items-center">
                <div class="h-full w-[0.5px] bg-stone-300"></div>
                <span
                  class="text-[7px] font-black text-stone-400 [writing-mode:vertical-lr] tracking-widest uppercase ml-1">
                  {{ formatSize(size.name, 1) }}
                </span>
              </div>

              <div class="grid bg-stone-900 p-[1.5px] rounded-[1px] shadow-sm relative z-10 w-full"
                :style="{ gridTemplateColumns: `repeat(${size.cols}, 1fr)`, gap: '1.5px' }">
                <div v-for="n in size.cols * size.rows" :key="n" :class="[
                  'aspect-[2/3] transition-all duration-200 min-w-0',
                  size.cols >= 6 ? 'w-2 sm:w-3' : 'w-3 sm:w-4',
                  getScreenQty(size.id) > 0 ? 'bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.6)]' : 'bg-stone-800',
                ]"></div>
              </div>
            </div>
          </div>

          <div class="w-full flex flex-col items-center justify-center min-h-[44px] mt-2">
            <div v-if="getScreenQty(size.id) === 0" class="flex flex-col items-center">
              <span class="text-[11px] font-black text-stone-900 uppercase tracking-tight">{{ size.name }}</span>
              <span class="text-[9px] font-black text-stone-400 uppercase tracking-tighter mt-0.5">
                Ocupa {{ size.consumo }} {{ size.consumo > 1 ? 'pantallas' : 'pantalla' }}
              </span>
              <!-- Precio unitario cuando no está seleccionado -->
              <span v-if="getScreenUnitPrice(size.name) > 0"
                class="text-[10px] font-black text-primary mt-1">
                Bs. {{ getScreenUnitPrice(size.name).toLocaleString() }}
              </span>
            </div>
            <div v-else class="flex flex-col items-center gap-1.5">
              <!-- Precio total actualizado según cantidad -->
              <span class="text-[11px] font-black text-primary">
                Bs. {{ getScreenTotalPrice(size).toLocaleString() }}
              </span>
              <div class="flex items-center gap-2 sm:gap-3 bg-stone-900 p-1 rounded-full shadow-lg" @click.stop>
                <button @click="updateScreenQty(size, -1)"
                  class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white hover:bg-stone-800 active:scale-90">
                  <Icon icon="lucide:minus" class="w-3.5 h-3.5" />
                </button>
                <span class="text-sm sm:text-base font-sans font-black text-white w-5 text-center leading-none">
                  {{ getScreenQty(size.id) }}
                </span>
                <button @click="updateScreenQty(size, 1)" :disabled="totalModule + size.consumo > 12"
                  class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-white flex items-center justify-center hover:scale-110 disabled:opacity-20 active:scale-90">
                  <Icon icon="lucide:plus" class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
    <!-- FIN SECCIÓN PANTALLAS LED -->


    <!-- SECCIÓN EQUIPAMIENTO TÉCNICO -->
    <div class="space-y-5">
      <div class="border-l-2 border-stone-900 pl-4">
        <h3 class="font-display text-xl sm:text-2xl text-stone-900 uppercase tracking-widest font-black">Equipamiento
          Técnico</h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        <template v-for="item in apiItems" :key="item.id">

          <!--
            CASO 1: Item CON variants (ej: DJ, Violinista)
            El botón principal entra en UNA columna del grid como cualquier otro item.
            Visualmente se ve igual de ancho que los items simples.
          -->
          <div v-if="item.variants && item.variants.length > 0"
     @click="toggleCategory(item.id)"
     :class="[
            'cursor-pointer rounded-2xl border-2 px-4 py-3 flex flex-col justify-center transition-all duration-300 min-h-[70px]',
            isVariantSelected(item.id) || isCategoryOpen(item.id)
              ? 'border-primary bg-white shadow-sm'
              : 'bg-stone-50 border-stone-50 hover:border-stone-200',
          ]">
            <div class="flex items-center justify-between w-full gap-2">
              <div class="flex items-center gap-3 min-w-0">
                <!--
                  Checkbox visual: se pone con color primary cuando
                  el usuario ya seleccionó alguna variante de este item.
                  isVariantSelected(item.id) es el método nuevo que explico abajo.
                -->
                <div :class="[
                  'w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all',
                  isVariantSelected(item.id) ? 'bg-primary border-primary' : 'border-stone-300 bg-white'
                ]">
                  <Icon v-if="isVariantSelected(item.id)" icon="lucide:check" class="text-white text-[10px]"
                    stroke-width="4" />
                </div>
                <span class="text-[11px] font-bold uppercase tracking-tight text-stone-900 truncate">{{ item.name
                }}</span>
              </div>
              <!-- Flecha que rota cuando está abierto -->
              <Icon icon="lucide:chevron-down" :class="[
                'w-4 h-4 transition-transform duration-300 shrink-0',
                isCategoryOpen(item.id) ? 'rotate-180 text-primary' : 'text-stone-400'
              ]" />
            </div>
            <!--
              Subtítulo: muestra el nombre de la variante ya seleccionada
              (ej: "DJ Nikee") debajo del nombre del item.
              Solo aparece si ya hay una selección activa.
            -->
            <p v-if="getSelectedVariantLabel(item)" class="text-[9px] text-primary font-bold ml-8 mt-0.5 truncate">
              {{ getSelectedVariantLabel(item) }}
            </p>
          </div>

          <!--
            PANEL DE VARIANTES: se abre debajo ocupando col-span-2 (ancho completo)
            SOLO cuando el acordeón está abierto. Esto permite que el botón
            principal sea de 1 columna pero las cards de variantes tengan
            suficiente espacio para mostrarse bien con imagen + nombre + precio.
          -->
          <div v-if="item.variants && item.variants.length > 0 && isCategoryOpen(item.id)"
            class="col-span-full grid grid-cols-2 xs:grid-clos-3 md:grid-cols-4 gap-4 animate-in px-2 pb-4">
            <div v-for="variant in item.variants" :key="variant.id" @click="handleVariantSelection(item, variant)"
              :class="[
                'flex flex-col rounded-2xl border-2 transition-all duration-300 cursor-pointer bg-white overflow-hidden p-3 text-center relative group/variant',
                isVariantActive(variant.id)
                  ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                  : 'border-stone-100 hover:border-stone-200 hover:shadow-lg'
              ]">
              <div
                class="aspect-square w-full rounded-2xl overflow-hidden border border-stone-100 bg-stone-50 relative mb-2" @click.stop>
                <MenuItemImagen v-if="variant.image_path && variant.image_path.length > 0"
                  :images="variant.image_path"
                  :alt="'variant-' + variant.id" />
                <div v-if="isVariantActive(variant.id)"
                  class="absolute inset-0 bg-primary/5 flex items-center justify-center z-10 pointer-events-none transition-opacity">
                  <div class="bg-primary text-white p-1.5 rounded-full shadow-lg ring-4 ring-white animate-in zoom-in">
                    <Icon icon="lucide:check" class="text-[10px]" stroke-width="4" />
                  </div>
                </div>
              </div>
              <div class="pt-1 px-1">
                <h4
                  class="text-[11px] font-bold uppercase text-stone-800 leading-tight line-clamp-2 min-h-[2.2rem] flex items-center justify-center">
                  {{ variant.name }}
                </h4>
                <p v-if="variant.price" class="text-[12px] text-primary font-black mt-1">
                  Bs. {{ variant.price }}
                </p>
              </div>
            </div>
          </div>

          <!--
            CASO 2: Item SIN variants (ej: Decoración, Luces, Humo)
            Card simple de 1 columna con checkbox y controles +/-
          -->
          <div v-else-if="!item.variants || item.variants.length === 0" @click="toggleItem(item)" :class="[
            'group cursor-pointer rounded-2xl border-2 px-4 py-3 flex flex-col justify-center transition-all duration-300 min-h-[70px]',
            getQty(item.id) > 0 ? 'border-primary bg-white shadow-sm' : 'bg-stone-50 border-stone-50 hover:border-stone-200',
          ]">
            <div class="flex items-center justify-between w-full gap-2">
              <div class="flex items-center gap-3 min-w-0">
                <div :class="[
                  'w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all',
                  getQty(item.id) > 0 ? 'bg-primary border-primary' : 'border-stone-300 bg-white'
                ]">
                  <Icon v-if="getQty(item.id) > 0" icon="lucide:check" class="text-white text-[10px]"
                    stroke-width="4" />
                </div>
                <div class="flex flex-col text-left min-w-0">
                  <span :class="[
                    'text-[11px] font-bold uppercase tracking-tight truncate',
                    getQty(item.id) > 0 ? 'text-stone-900' : 'text-stone-400'
                  ]">{{ item.name }}</span>
                  <span v-if="item.price" class="text-primary font-bold text-[10px]">Bs. {{ item.price }}</span>
                </div>
              </div>

              <div v-if="getQty(item.id) > 0" @click.stop class="flex items-center gap-1 shrink-0">
                <!-- Si está incluido automáticamente, mostrar badge en vez de controles -->
                <div v-if="isAutoIncluded(item.id)"
                  class="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span class="text-[10px] font-black text-primary uppercase tracking-widest">Incluido</span>
                </div>
                <template v-else-if="parseInt(item.cantidad) > 1">
                  <button @click="changeQty(item.id, -1, item.cantidad)"
                    class="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 active:scale-90">-</button>
                  <span class="text-[10px] font-black text-stone-900 w-3 text-center">{{ getQty(item.id) }}</span>
                  <button @click="changeQty(item.id, 1, item.cantidad)"
                    class="w-7 h-7 rounded-full bg-stone-900 flex items-center justify-center text-white active:scale-90">+</button>
                </template>
                <div v-else
                  class="flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 border border-stone-200">
                  <span class="text-[10px] font-black text-stone-900">1</span>
                </div>
              </div>
            </div>
            <p v-if="item.service_description" class="text-[9px] text-stone-400 italic mt-1.5 ml-8 leading-tight">
              {{ item.service_description }}
            </p>
          </div>

        </template>
      </div>
    </div>
    <!-- FIN SECCIÓN EQUIPAMIENTO TÉCNICO -->

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

import type { EquipamentItem, SelectedQty, EventVariant } from '@/types/Events/EquipamentItem'
import MenuItemImagen from '../ui/Menu/MenuItemImagen.vue'
import type { ILedScreens, ScreenSize } from '@/types/Events/EquipamentItem'
import { EventServices } from '@/services/Events/eventService'

const ledScrensRaw = ref<ILedScreens[]>([])

const props = defineProps<{
  equipmentQuantities: SelectedQty[]
  apiItems: EquipamentItem[]
  autoIncludeIds?: number[]
}>()

const emit = defineEmits(['update:equipmentQuantities'])

const isAutoIncluded = (id: number): boolean => props.autoIncludeIds?.includes(id) ?? false

// --- ESTADO LOCAL ACORDEONES ---
const openCategories = ref<Record<number, boolean>>({})
const toggleCategory = (id: number) => { openCategories.value[id] = !openCategories.value[id] }
const isCategoryOpen = (id: number) => !!openCategories.value[id]

// --- DATOS PANTALLAS ---
const screenSizes = computed<ScreenSize[]>(() => {
  if (!ledScrensRaw.value.length) return []
  return ledScrensRaw.value.map(led => {
    // FIX: split() devuelve string[] siempre, filtrar undefined
    const parts = led.measure.split(' x ')
    const wStr = parts[0] || '0'
    const hStr = parts[1] || '0'

    const w = parseFloat(wStr)
    const h = parseFloat(hStr)

    return {
      id: led.id,
      name: led.name,
      consumo: parseInt(led.led_capacity || '1'),
      cols: Math.max(1, Math.round(w * 2)),
      rows: Math.max(1, Math.round(h * 1))
    }
  })
})


// --- LÓGICA PANTALLAS ---
const formatSize = (name: string, index: number) => name.split('x')[index]?.trim() || '0'

// Obtiene el precio unitario desde ledScrensRaw (ya no usa apiItems)
const getScreenUnitPrice = (sizeName: string): number => {
  const led = ledScrensRaw.value.find(l => l.name === sizeName || l.measure === sizeName)
  return led?.price ?? 0
}

// Calcula el precio total de una pantalla según cantidad seleccionada
const getScreenTotalPrice = (size: ScreenSize): number => {
  const qty = getScreenQty(size.id)
  if (!qty) return 0
  return getScreenUnitPrice(size.name) * qty
}

const totalModule = computed(() => {
  return props.equipmentQuantities.reduce((acc, curr) => {
    const size = screenSizes.value.find((s) => `Pantalla ${s.name}` === curr.name)
    return acc + (size ? size.consumo * curr.quantity : 0)
  }, 0)
})
const screenQuantities = computed(() => {
  const qtyMap = new Map()
  props.equipmentQuantities.forEach(e => {
    const size = screenSizes.value.find(s => `Pantalla ${s.name}` === e.name)
    if (size) qtyMap.set(size.id, e.quantity)
  })
  return qtyMap
})
const getScreenQty = (id: number) => screenQuantities.value.get(id) || 0

const canSelectScreen = (size: ScreenSize) => (getScreenQty(size.id) > 0 || totalModule.value + size.consumo <= 12)

const toggleScreenSelection = (size: ScreenSize) => {
  const fullName = `Pantalla ${size.name}`
  const isSelected = props.equipmentQuantities.some(e => e.name === fullName)
  if (isSelected) {
    emit('update:equipmentQuantities', props.equipmentQuantities.filter(e => e.name !== fullName))
  } else {
    updateScreenQty(size, 1)
  }
}

const updateScreenQty = (size: ScreenSize, delta: number) => {
  // Creamos una copia profunda del array para no mutar las props directamente
  const list: SelectedQty[] = props.equipmentQuantities.map(i => ({ ...i }))
  const fullName = `Pantalla ${size.name}`
  const index = list.findIndex(e => e.name === fullName)

  if (index !== -1) {
    const item = list[index]
    if (item) {
      const next = item.quantity + delta

      if (next <= 0) {
        // Si la cantidad llega a 0, eliminamos la pantalla de la lista
        emit('update:equipmentQuantities', list.filter(e => e.name !== fullName))
      } else {
        // Validamos que no exceda el límite de 12 módulos al incrementar
        // delta < 0 significa que está restando, por lo que no hace falta validar el máximo
        if (delta < 0 || totalModule.value + size.consumo <= 12) {
          item.quantity = next
          emit('update:equipmentQuantities', list)
        }
      }
    }
  } else if (delta > 0 && totalModule.value + size.consumo <= 12) {
    // Si la pantalla no existía en la lista y hay espacio, la añadimos por primera vez
    // Se utiliza un ID negativo basado en 9000 para diferenciarlo de los items de la API
    list.push({
      id: -(size.id + 9000),
      name: fullName,
      quantity: 1,
      price: getScreenUnitPrice(size.name)
    })

    // Al emitir aquí, solo se envía la pantalla nueva.
    // No hay ninguna lógica que busque o añada el ID 2 (Sonido).
    emit('update:equipmentQuantities', list)
  }
}

// --- LÓGICA EQUIPAMIENTO ---
const getQty = (id: number) => props.equipmentQuantities.find(e => e.id === id)?.quantity || 0
const isVariantActive = (vId: number) => props.equipmentQuantities.some(q => q.variant_id === vId)

/*
  isVariantSelected(itemId):
  Pregunta: "¿el usuario ya eligió alguna variante de este item?"

  Se usa para dos cosas visuales en el botón principal:
  1. Poner el checkbox en color primary (marcado como seleccionado)
  2. Mantener el borde primary del botón incluso cuando el acordeón está cerrado

  Busca en equipmentQuantities si existe algún registro que tenga
  el id del item Y además tenga un variant_id asignado.
  Si existe → el item tiene una variante elegida → retorna true.
*/
const isVariantSelected = (itemId: number): boolean =>
  props.equipmentQuantities.some(q => q.id === itemId && q.variant_id !== undefined)

const getSelectedVariantLabel = (item: EquipamentItem) => {
  const sel = props.equipmentQuantities.find(q => q.id === item.id)
  return (sel && sel.name && sel.name.includes(': ')) ? sel.name.split(': ')[1] : null
}

const toggleItem = (item: EquipamentItem) => {
  if (isAutoIncluded(item.id)) return  // no permitir deseleccionar items auto-incluidos
  const list = [...props.equipmentQuantities]
  const index = list.findIndex(e => e.id === item.id)
  if (index !== -1) emit('update:equipmentQuantities', list.filter(e => e.id !== item.id))
  else {
    list.push({ id: item.id, quantity: 1, name: item.name, price: item.price })
    emit('update:equipmentQuantities', list)
  }
}

const changeQty = (id: number, delta: number, maxStr: string) => {
  const list = props.equipmentQuantities.map(i => ({ ...i }))
  const index = list.findIndex(e => e.id === id)
  const max = parseInt(maxStr)
  if (index !== -1 && list[index]) {
    const next = list[index]!.quantity + delta
    if (next > 0 && next <= max) {
      list[index]!.quantity = next
      emit('update:equipmentQuantities', list)
    } else if (next <= 0) {
      emit('update:equipmentQuantities', list.filter(e => e.id !== id))
    }
  }
}
const handleVariantSelection = (parent: EquipamentItem, variant: EventVariant) => {
  let list = [...props.equipmentQuantities]

  if (list.some(q => q.variant_id === variant.id)) {
    list = list.filter(q => q.variant_id !== variant.id)
  } else {
    list = list.filter(q => q.id !== parent.id)
    list.push({
      id: parent.id,
      variant_id: variant.id,
      quantity: 1,
      name: `${parent.name}: ${variant.name}`,
      price: variant.price
    })
    openCategories.value[parent.id] = false
  }
  emit('update:equipmentQuantities', list)
}

//cargar datos de las pantallas
onMounted(async() => {
  try{
    ledScrensRaw.value = await EventServices.getLed_Screens()
  }catch(error){
    console.error("Error al cargar las pantallas", error);
  }
})
</script>

<style scoped>
.group\/variant {
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.group\/variant:active {
  transform: scale(0.97);
  transition: transform 0.1s ease;
}

.animate-in {
  animation: slideUp 0.4s ease-out forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 400px) {
  .grid-cols-3 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
