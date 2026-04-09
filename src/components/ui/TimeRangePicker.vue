<template>
  <div class="flex justify-center w-full animate-in fade-in duration-500">
    <div class="grid grid-cols-2 gap-4 w-full max-w-sm">

      <div class="flex flex-col gap-2">
        <label class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
          Llegada
        </label>
        <Select
          v-model="localStartTime"
          :options="arrivalTimeOptions"
          placeholder="--:--"
          class="w-full custom-booking-select"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 ml-1">
          Cierre
        </label>
        <Select
          v-model="localEndTime"
          :options="departureTimeOptions"
          :disabled="!startTime"
          placeholder="--:--"
          class="w-full custom-booking-select"
        />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import Select from 'primevue/select'

const props = defineProps<{
  startTime: string | null | undefined
  endTime: string | null | undefined
  selectedDate: string | null | undefined,
  minHour?: number // <--- SÍ LO TIENES
  maxHour?: number // <--- SÍ LO TIENES
  durationHours?: number; // <--- SÍ LO TIENES
}>()

const emit = defineEmits(['update:startTime', 'update:endTime'])

// Sincronización reactiva con v-model de PrimeVue
const localStartTime = computed({
  get: () => props.startTime,
  set: (val) => handleArrivalSelection(val as string)
})

const localEndTime = computed({
  get: () => props.endTime,
  set: (val) => emit('update:endTime', val)
})

const masterTimeSchedule = computed(() => {
  const timeBlocks = []
  const start = props.minHour ?? 8;
  const end = props.maxHour ?? 23;
  for (let h = start; h <= end; h++) {
    for (const m of ['00', '30']) {
      const time = `${h.toString().padStart(2, '0')}:${m}`
      // Si llegamos a la hora final (end), solo incluimos el bloque :00
      if(h < end || (h === end && m === '00')){
        timeBlocks.push(time)
      }
    }
  }
  return timeBlocks
})

const arrivalTimeOptions = computed(() => {
  if (!props.selectedDate) return []
  const now = new Date()
  const [y=0, m=0, d] = props.selectedDate.split('-').map(Number)
  const resDate = new Date(y, m - 1, d)
  resDate.setHours(0,0,0,0)
  const today = new Date(); today.setHours(0,0,0,0)

  if (resDate.getTime() === today.getTime()) {
    const limit = (now.getHours() * 60) + now.getMinutes() + 15
    return masterTimeSchedule.value.filter(slot => {
      const [h=0, min=0] = slot.split(':').map(Number)
      return (h * 60 + min) >= limit
    })
  }
  return masterTimeSchedule.value
})

const departureTimeOptions = computed(() => {
  if (!props.startTime) return []
  const idx = masterTimeSchedule.value.indexOf(props.startTime)
  return masterTimeSchedule.value.slice(idx + 1)
})

const handleArrivalSelection = (val: string) => {
  emit('update:startTime', val)
  if(!val) return
  const idx = masterTimeSchedule.value.indexOf(val)
  if (idx >= 0) {
   const blocksToAdd = (props.durationHours ?? 3) * 2
    const suggestedIdx = Math.min(idx + blocksToAdd, masterTimeSchedule.value.length - 1)

    emit('update:endTime', masterTimeSchedule.value[suggestedIdx])
  }
}

watch(() => arrivalTimeOptions.value, (newOpts) => {
  if (newOpts.length > 0 && (!props.startTime || !newOpts.includes(props.startTime))) {
    handleArrivalSelection(newOpts[0] || '')
  }
}, { immediate: true })
</script>

<style>
/* --- ESTILOS GLOBALES --- */
/* Solo usa .DEFAULT si así está en tu tailwind.config.js */
.p-select-option.p-select-option-selected,
.p-select-option.p-select-option-selected.p-focus,
.p-select-option.p-highlight {
    background-color: theme('colors.primary.DEFAULT / 15%') !important;
    color: theme('colors.primary.DEFAULT') !important;
    font-weight: 700;
}

/* Si te sigue dando error, intenta sin el .DEFAULT pero verifica tu config */
/* Ejemplo alternativo: theme('colors.primary') si es un string directo */

.p-select-option:not(.p-select-option-selected):hover {
    background-color: theme('colors.stone.100') !important;
    color: theme('colors.stone.900') !important;
}

.p-select-overlay {
    border-radius: theme('borderRadius.xl') !important;
    border: 1px solid theme('colors.stone.200') !important;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
}
</style>

<style scoped>
/* --- ESTILOS LOCALES --- */
:deep(.custom-booking-select) {
  background-color: theme('colors.stone.50') !important;
  border: 1px solid theme('colors.stone.200') !important;
  border-radius: theme('borderRadius.xl') !important;
  transition: all 0.2s ease;
}

:deep(.custom-booking-select.p-focus) {
  /* Aquí también aplicamos el .DEFAULT */
  border-color: theme('colors.primary.DEFAULT') !important;
  box-shadow: 0 0 0 3px theme('colors.primary.DEFAULT / 15%') !important;
}

:deep(.p-select-label) {
  color: theme('colors.stone.900') !important;
  font-family: theme('fontFamily.sans');
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  padding: 0.6rem 0.75rem !important;
}

:deep(.p-select-dropdown) {
  color: theme('colors.stone.400') !important;
}

:deep(.custom-booking-select.p-disabled) {
  opacity: 0.5;
  background-color: theme('colors.stone.200') !important;
}
</style>

<style scoped>
/* --- ESTILOS LOCALES (Scoped) --- */
:deep(.custom-booking-select) {
  background-color: theme('colors.stone.50') !important;
  border: 1px solid theme('colors.stone.200') !important;
  border-radius: theme('borderRadius.xl') !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

:deep(.p-select-label) {
  color: theme('colors.stone.900') !important;
  font-family: theme('fontFamily.sans');
}

:deep(.p-select-dropdown) {
  color: theme('colors.stone.400') !important;
}
:deep(.custom-booking-select.p-focus){
  border-color: theme('colors.primary.DEFAULT',#C27B2E) !important;
  box-shadow: 0 0 0 4px theme('colors.primary.DEFAULT / 20%', rgba(194, 123, 46, 0.2)) !important;

  /* Opcional: un fondo ligeramente más blanco para resaltar */
  background-color: white !important;
}
/* 3. Hover (Para que reaccione antes de hacer click) */
:deep(.custom-booking-select:not(.p-disabled):hover) {
  border-color: theme('colors.primary.DEFAULT') !important;
}
/* Estilos internos adicionales para limpiar el diseño */
:deep(.p-select-label) {
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  color: theme('colors.stone.900') !important;
  padding: 0.6rem 0.75rem !important;
}

:deep(.p-select-dropdown) {
  color: theme('colors.stone.400') !important;
}
</style>

<style scoped>
/* --- ESTILOS LOCALES (Scoped) --- */

/* La caja del selector cuando está cerrada */
:deep(.custom-booking-select) {
  background: #eef0f5 !important; /* stone-50 */
  border: 1px solid #e7e5e4 !important; /* stone-200 */
  border-radius: 0.75rem !important; /* rounded-xl */
  transition: all 0.2s ease;
}

/* Borde y sombra al hacer click */
:deep(.custom-booking-select.p-focus) {
  border-color: #C27B2E !important;
  box-shadow: 0 0 0 3px rgba(194, 123, 46, 0.15) !important;
}

/* Texto dentro del selector */
:deep(.p-select-label) {
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  color: #1c1917 !important; /* stone-900 */
  padding: 0.6rem 0.75rem !important;
}

/* Icono de la flecha */
:deep(.p-select-dropdown) {
  color: #a8a29e !important; /* stone-400 */
}

/* Deshabilitado */
:deep(.custom-booking-select.p-disabled) {
  opacity: 0.5;
  background: #f5f5f4 !important;
}
</style>
