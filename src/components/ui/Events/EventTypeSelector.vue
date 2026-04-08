<template>
  <div class="flex flex-col items-center w-full overflow-hidden">
    <header class="mb-4 sm:mb-8 text-center px-4">
      <span class="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
        ¿Qué tipo de evento planeas?
      </span>
    </header>

    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 w-full max-w-6xl px-1">
      <button
        v-for="item in items"
        :key="item.id"
        @click="$emit('update:modelValue', item.type)"
        type="button"
        :class="[
          'group relative p-4 sm:p-8 rounded-[2rem] border-[3px] transition-all duration-300 ease-out flex flex-col items-center justify-center min-h-[140px] sm:min-h-[220px] w-full overflow-hidden hover:-translate-y-2 hover:shadow-lg',
          // INVERTIDO: Seleccionado -> Blanco | Normal -> Naranja
          modelValue === item.type
            ? 'bg-white border-primary text-primary shadow-xl -translate-y-2'
            : 'bg-primary border-primary text-white',
        ]"
      >
        <div class="relative flex flex-col items-center justify-center w-full">
          <span
            :class="[
              'font-display text-[22px] sm:text-2xl lg:text-3xl transition-all duration-300 text-center leading-[1.2] z-10 px-1',
              // Texto naranja si está seleccionado, blanco si no
              modelValue === item.type ? 'text-primary' : 'text-white',
            ]"
          >
            {{ item.type }}
          </span>
        </div>
      </button>

      <button
        v-for="brunch in brunchItem"
        :key="brunch.id"
        @click="handleBrunchClick(brunch)"
        type="button"
        :class="[
          'group relative p-4 sm:p-8 rounded-[2rem] border-[3px] transition-all duration-300 ease-out flex flex-col items-center justify-center min-h-[140px] sm:min-h-[220px] w-full overflow-hidden hover:-translate-y-2 hover:shadow-lg',
          // INVERTIDO: Seleccionado -> Blanco | Normal -> Naranja
          modelValue === brunch.title
            ? 'bg-white border-primary text-primary shadow-xl -translate-y-2'
            : 'bg-primary border-primary text-white',
        ]"
      >
        <span
          :class="[
            'font-display text-[22px] sm:text-2xl lg:text-3xl text-center leading-[1.2] px-1 transition-all duration-300',
            modelValue === brunch.title ? 'text-primary' : 'text-white',
          ]"
        >
          {{ brunch.title }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { portalService } from '@/services/linktree/portalService'
import type { EventType } from '@/types/Events/events-type'
import type { PortalItem } from '@/types/Linktree/PortalItem-interface'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  modelValue: string
  items: EventType[]
  showBrunch?: boolean
}>()

const router = useRouter()
const brunchItem = ref<PortalItem[]>([])

const emit = defineEmits(['update:modelValue'])

onMounted(async () => {
  if (props.showBrunch) {
    try {
      const links = await portalService.getPortalItems(false)
      brunchItem.value = links.filter((item) => item.use_form === true)
    } catch (error) {
      console.error('Error cargando brunch link: ', error)
    }
  }
})

const handleBrunchClick = (brunch: PortalItem) => {
  // 1. Primero marcamos el componente (se pone naranja)
  emit('update:modelValue', brunch.title)

  // 2. Esperamos un momento (300ms) para que el usuario vea el color naranja
  if (brunch.to) {
    setTimeout(() => {
      router.push(brunch.to!)
    }, 300) // 300 milisegundos es suficiente para el ojo humano
  }
}
</script>
