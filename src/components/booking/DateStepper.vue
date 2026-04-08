<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between pt-1">
      <div class="flex flex-col text-left">
        <span class="text-label text-primary uppercase tracking-widest">
          {{ currentMonthName }}
        </span>
      </div>

      <button @click="showFullCalendar = !showFullCalendar" type="button"
        class="group flex items-center gap-2 px-4 py-2 rounded-full border-2 border-stone-200 bg-white hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-sm active:scale-95">
        <Icon :icon="showFullCalendar ? 'lucide:x' : 'lucide:calendar'"
          class="w-4 h-4 text-stone-600 group-hover:text-primary" />
        <span class="text-[11px] font-black uppercase tracking-wider text-stone-600 group-hover:text-primary">
          {{ showFullCalendar ? 'Cerrar' : 'Ver más fechas' }}
        </span>
      </button>
    </div>

    <template v-if="!showFullCalendar">
      <!-- Skeleton mientras cargan festivos -->
      <div v-if="!holidaysLoaded" class="flex gap-3 py-8 px-4 overflow-hidden">
        <div v-for="n in 7" :key="n" class="flex-shrink-0 w-14 h-14 rounded-full bg-stone-100 animate-pulse" />
      </div>

      <!-- Días reales cuando ya cargaron -->
      <div v-else class="relative w-full overflow-visible scroll-container-wrapper pt-1">
        <div class="flex overflow-x-auto overflow-y-visible gap-3 py-8 snap-x scroll-smooth scrollbar-on-hover"
          :style="onlySaturdays ? 'padding-left: 1.5rem; padding-right: 1.5rem;' : 'padding-left: 1rem; padding-right: 1rem;'"
          ref="scrollContainer">

          <button v-for="d in timelineDays" :key="d.dateString"
            type="button"
            @mouseenter="(e) => handleMouseEnter(e, d.dateString!)"
            @mouseleave="activeTooltip = null"
            @click="!isDayDisabled(d.dateString!) && selectDate(d.dateString!)"
            :class="[
              'group flex-shrink-0 w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-150 snap-center border-2 outline-none relative',

              // Día inhabilitado (cerrado puntual o fuera de days_open_week)
              isDayDisabled(d.dateString!)
                ? 'bg-stone-100 border-stone-200 opacity-50 cursor-not-allowed pointer-events-auto'
                : (modelValue === d.dateString
                  ? 'bg-primary border-primary text-white shadow-lg -translate-y-1'
                  : 'bg-white shadow-sm'),

              // Sábados (solo si no está bloqueado)
              !isDayDisabled(d.dateString!) && isSaturday(d.dateString!) && modelValue !== d.dateString && props.showSaturdayLabel
                ? 'border-primary/40 bg-primary/5 hover:border-primary' : '',

              // Viernes (solo si no está bloqueado)
              !isDayDisabled(d.dateString!) && isFriday(d.dateString!) && modelValue !== d.dateString && props.showFridayLabel
                ? 'border-indigo-400/40 bg-indigo-50/50 hover:border-indigo-500' : '',

              // Festivo
              getHolidayInfo(d.dateString!) && modelValue !== d.dateString
                ? 'border-red-300 bg-red-50 text-red-700 hover:border-red-500' : '',

              // Borde por defecto (cuando no aplica ninguna condición especial)
              modelValue !== d.dateString &&
                !isDayDisabled(d.dateString!) &&
                (!isSaturday(d.dateString!) || !props.showSaturdayLabel) &&
                (!isFriday(d.dateString!) || !props.showFridayLabel) &&
                !getHolidayInfo(d.dateString!)
                ? 'border-stone-200 text-stone-800 hover:border-primary hover:bg-stone-50' : '',

              // Rings de selección
              getHolidayInfo(d.dateString!) && modelValue === d.dateString ? 'ring-2 ring-red-400 ring-offset-2' : '',
              isFriday(d.dateString!) && modelValue === d.dateString && props.showFridayLabel ? 'ring-2 ring-indigo-400 ring-offset-2' : '',
              isSaturday(d.dateString!) && modelValue === d.dateString && props.showSaturdayLabel ? 'ring-2 ring-primary ring-offset-2' : '',
            ]">

            <span class="text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors" :class="[
              isDayDisabled(d.dateString!) ? 'text-stone-400' :
              modelValue === d.dateString ? 'text-white/90' :
                (isSaturday(d.dateString!) && props.showSaturdayLabel) ? 'text-primary' :
                  (isFriday(d.dateString!) && props.showFridayLabel) ? 'text-indigo-600' : 'text-stone-400'
            ]">
              {{ d.weekday }}
            </span>

            <span class="number-display !text-lg !font-normal leading-none transition-colors" :class="[
              isDayDisabled(d.dateString!) ? 'text-stone-400' :
              modelValue === d.dateString ? 'text-white' :
                (isSaturday(d.dateString!) && props.showSaturdayLabel) ? 'text-primary font-semibold' :
                  (isFriday(d.dateString!) && props.showFridayLabel) ? 'text-indigo-900 font-semibold' : 'text-stone-900'
            ]">
              {{ d.dayNumber }}
            </span>

            <!-- Badge: Festivo -->
            <template v-if="getHolidayInfo(d.dateString!)">
              <div class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                <div :class="[
                  'relative flex items-center justify-center w-5 h-5 rounded-full border shadow-sm transition-colors duration-300',
                  modelValue === d.dateString ? 'bg-white border-white' : 'bg-white border-red-100'
                ]">
                  <Icon icon="lucide:party-popper" class="w-3 h-3 text-red-500" />
                </div>
              </div>
            </template>

            <!-- Badge: Viernes After Office -->
            <template v-if="isFriday(d.dateString!) && props.showFridayLabel && !getHolidayInfo(d.dateString!)">
              <div class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                <div :class="[
                  'relative flex items-center justify-center w-5 h-5 rounded-full border shadow-sm transition-colors duration-300',
                  modelValue === d.dateString ? 'bg-white border-white' : 'bg-indigo-600 border-indigo-100'
                ]">
                  <Icon icon="lucide:music" :class="modelValue === d.dateString ? 'text-indigo-600' : 'text-white'"
                    class="w-2.5 h-2.5" />
                </div>
              </div>
            </template>

            <!-- Badge: Sábado Brunch -->
            <template v-if="isSaturday(d.dateString!) && props.showSaturdayLabel && !getHolidayInfo(d.dateString!)">
              <div class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                <div :class="[
                  'relative flex items-center justify-center w-5 h-5 rounded-full border shadow-sm transition-colors duration-300',
                  modelValue === d.dateString ? 'bg-white border-white' : 'bg-primary border-stone-100'
                ]">
                  <Icon icon="lucide:utensils" :class="modelValue === d.dateString ? 'text-primary' : 'text-white'"
                    class="w-2.5 h-2.5" />
                </div>
              </div>
            </template>

          </button>

          <button @click="showFullCalendar = true" type="button" aria-label="Ver calendario completo"
            class="flex-shrink-0 w-14 h-14 rounded-full border-2 border-dashed border-stone-300 flex flex-col items-center justify-center bg-stone-50/50 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-300 group snap-center active:scale-90">
            <Icon icon="lucide:calendar-plus"
              class="w-5 h-5 text-stone-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
            <span class="text-[8px] font-black uppercase tracking-tighter text-stone-400 group-hover:text-primary">
              Ver más
            </span>
          </button>
          <div v-if="!onlySaturdays" class="flex-shrink-0 w-8"></div>
        </div>
      </div>
    </template>

    <Transition name="calendar-slide">
      <div v-if="showFullCalendar" class="w-full flex flex-col items-center py-1 gap-3">
        <div class="rounded-[2rem] w-full max-w-sm flex justify-center">
          <DatePicker v-model="calendarDate" inline :min-date="minDateCalculated" 
            :disabled-days="disabledDaysArray"
            :disabled-dates="closedDatesObjects"
            class="luxury-calendar-mini">

            <template #date="slotProps">
              <div @mouseenter="(e) => handleMouseEnterDatePicker(e, slotProps.date)"
                @mouseleave="activeTooltip = null"
                :class="[
                  'relative w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300',
                  
                  // Día deshabilitado (Cierre o inoperativo)
                  isDateObjDisabled(slotProps.date) 
                    ? 'bg-stone-50 text-stone-300 opacity-60 cursor-not-allowed' : '',

                  isDateHoliday(slotProps.date) && !isDateObjDisabled(slotProps.date)
                    ? 'bg-red-100 text-red-700 font-bold scale-110' : '',
                  
                  isDateSaturday(slotProps.date) && props.showSaturdayLabel && !isDateHoliday(slotProps.date) && !isDateObjDisabled(slotProps.date)
                    ? 'bg-primary/10 text-primary font-semibold' : '',
                  
                  isDateFriday(slotProps.date) && props.showFridayLabel && !isDateHoliday(slotProps.date) && !isDateObjDisabled(slotProps.date)
                    ? 'bg-indigo-50 text-indigo-600 font-semibold' : ''
                ]">
                {{ slotProps.date.day }}
                
                <!-- Indicador de cierre temporal (punto negro/stone) -->
                <div v-if="isDateObjClosed(slotProps.date)"
                  class="absolute -bottom-1 w-1 h-1 bg-stone-400 rounded-full" />

                <div v-if="isDateHoliday(slotProps.date)"
                  class="absolute -bottom-1 w-1.5 h-1.5 bg-red-500 rounded-full shadow-sm" />
                <div v-else-if="isDateSaturday(slotProps.date) && props.showSaturdayLabel && !isDateObjDisabled(slotProps.date)"
                  class="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />
              </div>
            </template>

          </DatePicker>
        </div>
      </div>
    </Transition>

    <Teleport to="body">
      <div v-if="activeTooltip"
        class="fixed z-[99999] px-3 py-1.5 bg-stone-900 text-white text-[10px] font-bold rounded shadow-2xl pointer-events-none transition-opacity duration-200 whitespace-nowrap"
        :style="{
          left: `${activeTooltip.rect.left + activeTooltip.rect.width / 2}px`,
          top: `${activeTooltip.rect.top - 8}px`,
          transform: 'translate(-50%, -100%)'
        }">
        {{ activeTooltip.name }}
        <div class="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-stone-900" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, type PropType } from 'vue'
import { Icon } from '@iconify/vue'
import DatePicker from 'primevue/datepicker'
import { HolydayService } from '@/services/Events/useBoliviaHolyDays'
import type { Holidays } from '@/types/Events/holyday-interface'
import { addBusinessHours } from '@/utils/useTimeUtil'
import { useSystemSettings } from '@/composables/useSystemSettings'

interface PrimeDate {
  day: number
  month: number
  year: number
}

const props = defineProps({
  modelValue: String,
  onlySaturdays: Boolean,
  showSaturdayLabel: {
    type: Boolean,
    default: true
  },
  showFridayLabel: {
    type: Boolean,
    default: false
  },
  anticipationHours: {
    type: Number,
    default: 0
  },
  // ✅ Restaurado: prop para bloquear lunes
  isDateDisabledFn: {
  type: Function as PropType<(dateStr: string) => boolean>,
  default: null
},
  // Fechas puntuales cerradas con motivo, ej: [{ date: '2026-03-23', reason: 'Elecciones 2026' }]
  closedDates: {
    type: Array as () => { date: string; reason: string }[],
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

// --- ESTADO ---
const today = new Date()
const showFullCalendar = ref(false)
const calendarDate = ref(props.modelValue ? new Date(props.modelValue + 'T12:00:00') : null)
const holidays = ref<Holidays[]>([])
const holidaysLoaded = ref(false)
const activeTooltip = ref<{ rect: DOMRect; name: string } | null>(null)

const { settings: injectedSettings, getScheduleForDate, specialClosures } = useSystemSettings();

// --- LÓGICA DE DÍAS ---
const timelineDays = computed(() => {
  const days = []
  let checked = 0
  const maxDays = props.onlySaturdays ? 12 : 21
  while (days.length < maxDays && checked < 90) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + checked)
    const dateString = d.toISOString().split('T')[0]!
    if ((!props.onlySaturdays || d.getDay() === 6) && isDateAvaible(dateString)) {
      days.push({
        dayNumber: d.getDate(),
        weekday: d.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase().replace('.', ''),
        dateString: dateString
      })
    }
    checked++
  }
  return days
})

// --- MÉTODOS ---

// ✅ Restaurado: tooltip con soporte para lunes bloqueado + fecha cerrada con motivo
const handleMouseEnter = (event: MouseEvent, dateString: string) => {
  const target = event.currentTarget as HTMLElement
  const holiday = getHolidayInfo(dateString)
  const isBlockedMonday = props.isDateDisabledFn?.(dateString) && isMonday(dateString)
  const closedInfo = getClosedDateInfo(dateString)

  if (!holiday && !isBlockedMonday && !closedInfo) return

  const parts: string[] = []
  if (holiday) parts.push(holiday.name)
  if (isBlockedMonday) parts.push('Sin atención')
  if (closedInfo) parts.push(closedInfo.reason)

  activeTooltip.value = { rect: target.getBoundingClientRect(), name: parts.join(' · ') }
}

// ✅ Restaurado: mismo manejo para el DatePicker con motivo de fecha cerrada
const handleMouseEnterDatePicker = (event: MouseEvent, dateObj: PrimeDate) => {
  const target = event.currentTarget as HTMLElement
  const holiday = getHolidayInfoFromSlot(dateObj)

  const m = String(dateObj.month + 1).padStart(2, '0')
  const d = String(dateObj.day).padStart(2, '0')
  const dateString = `${dateObj.year}-${m}-${d}`
  const isBlockedMonday = props.isDateDisabledFn?.(dateString) && isMonday(dateString)
  const closedInfo = getClosedDateInfo(dateString)

  if (!holiday && !isBlockedMonday && !closedInfo) return

  const parts: string[] = []
  if (holiday) parts.push(holiday.name)
  if (isBlockedMonday) parts.push('Sin atención')
  if (closedInfo) parts.push(closedInfo.reason)

  activeTooltip.value = { rect: target.getBoundingClientRect(), name: parts.join(' · ') }
}

// --- UTILIDADES DE FECHA ---
const getMMDD = (input: string | Date): string => {
  if (!input) return ''
  const d = typeof input === 'string'
    ? new Date(input.includes('T') ? input : `${input}T12:00:00`)
    : input
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const getHolidayInfo = (dateStr: string): Holidays | undefined => {
  if (!dateStr || !holidays.value.length) return undefined
  const parts = dateStr.split('-')
  return holidays.value.find((h: Holidays) => getMMDD(h.date) === `${parts[1]}-${parts[2]}`)
}

const isDateHoliday = (date: PrimeDate): boolean => {
  const searchStr = `${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  return holidays.value.some((h: Holidays) => getMMDD(h.date) === searchStr)
}

const getHolidayInfoFromSlot = (date: PrimeDate) => {
  const searchStr = `${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  return holidays.value.find((h: Holidays) => getMMDD(h.date) === searchStr)
}

const selectDate = (dateStr: string) => emit('update:modelValue', dateStr)

// ✅ Restaurado: isMonday
const isMonday = (dateStr: string): boolean => {
  if (!dateStr) return false
  return new Date(dateStr + 'T12:00:00').getDay() === 1
}

// Fecha puntual cerrada con motivo (ej: elecciones, feriado local, etc.)
const getClosedDateInfo = (dateStr: string): { date: string; reason: string } | undefined => {
  if (!dateStr) return undefined
  return props.closedDates.find(c => c.date === dateStr)
}

const isClosedDate = (dateStr: string): boolean => !!getClosedDateInfo(dateStr)

// Día inhabilitado: por cierre puntual O por función externa (days_open_week)
const isDayDisabled = (dateStr: string): boolean =>
  isClosedDate(dateStr) || (props.isDateDisabledFn?.(dateStr) ?? false)

const isSaturday = (dateStr: string): boolean => {
  if (!dateStr) return false
  return new Date(dateStr + 'T12:00:00').getDay() === 6
}

const isFriday = (dateStr: string): boolean => {
  if (!dateStr) return false
  return new Date(dateStr + 'T12:00:00').getDay() === 5
}

// Para el DatePicker
const isDateSaturday = (date: PrimeDate): boolean => new Date(date.year, date.month, date.day).getDay() === 6
const isDateFriday = (date: PrimeDate): boolean => new Date(date.year, date.month, date.day).getDay() === 5

// Helper para convertir PrimeDate a string YYYY-MM-DD
const primeDateToString = (date: PrimeDate): string => {
  const m = String(date.month + 1).padStart(2, '0')
  const d = String(date.day).padStart(2, '0')
  return `${date.year}-${m}-${d}`
}

const isDateObjDisabled = (date: PrimeDate): boolean => {
  return isDayDisabled(primeDateToString(date))
}

const isDateObjClosed = (date: PrimeDate): boolean => {
  return isClosedDate(primeDateToString(date))
}

// Convertir closedDates a objetos Date para el prop disabled-dates de PrimeVue
const closedDatesObjects = computed(() => {
  return props.closedDates.map(c => new Date(c.date + 'T12:00:00'))
})

// Lógica de anticipación
const isDateAvaible = (dateStr: string): boolean => {
  if (props.anticipationHours === 0) return true
  // Si aún no cargaron los settings, bloqueamos por seguridad
  if (!injectedSettings.value) return false;
  const ahora = new Date()
  const settings = injectedSettings.value;
  // Calculamos el momento exacto a partir del cual se puede reservar
  const disponibleDesde = addBusinessHours(
    ahora,
    props.anticipationHours,
    { start: settings.start_time, end: settings.end_time }, // Argumento 3
    getScheduleForDate,                                     // Argumento 4
    specialClosures.value.map(c => c.date)                  // Argumento 5
  );
  const fechaCandidata = new Date(`${dateStr}T23:00:00`)
  return fechaCandidata >= disponibleDesde
}

// ✅ disabledDaysArray ahora incluye días recurrentes bloqueados (sin contar cierres puntuales)
const disabledDaysArray = computed(() => {
  if (props.onlySaturdays) return [0, 1, 2, 3, 4, 5] // Habilita solo Sábado (6)

  if (!props.isDateDisabledFn) return []

  // Probamos cada día de la semana (0-6)
  const allDays = [0, 1, 2, 3, 4, 5, 6]
  return allDays.filter(dayNum => {
    // Buscamos un ejemplar de este día (ej: Martes) que NO tenga un cierre puntual
    // para determinar si la operatividad semanal lo bloquea o no.
    // Probamos hasta 4 semanas para estar seguros.
    for (let i = 2; i < 6; i++) { // Empezamos desde la semana 2 para saltar cierres inmediatos
      const d = new Date()
      const diff = (dayNum - d.getDay() + 7) % 7 + (i * 7)
      d.setDate(d.getDate() + diff)
      const dateStr = d.toISOString().split('T')[0]!
      
      if (!isClosedDate(dateStr)) {
        // Encontramos un día sin cierre puntual, su estado depende de isDateDisabledFn
        return props.isDateDisabledFn!(dateStr)
      }
    }
    // Si no hay días "limpios", recurrimos a la fecha más próxima
    const d = new Date()
    const diff = (dayNum - d.getDay() + 7) % 7
    d.setDate(d.getDate() + diff)
    return props.isDateDisabledFn!(d.toISOString().split('T')[0]!)
  })
})


const minDateCalculated = computed(() => {
  if (props.anticipationHours === 0) return today
 return addBusinessHours(
    new Date(),
    props.anticipationHours || 0,
    { start: injectedSettings.value?.start_time || '', end: injectedSettings.value?.end_time || '' },
    getScheduleForDate,
    specialClosures.value.map(c => c.date)
  );
})

const currentMonthName = computed(() => {
  const activeDate = props.modelValue ? new Date(props.modelValue + 'T12:00:00') : today
  return activeDate.toLocaleDateString('es-ES', { month: 'long' })
})

// --- WATCHERS & LIFECYCLE ---
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    const syncDate = new Date(newVal + 'T12:00:00')
    if (!calendarDate.value || calendarDate.value.getTime() !== syncDate.getTime()) {
      calendarDate.value = syncDate
    }
  }
}, { immediate: true })

watch(calendarDate, (newVal) => {
  if (newVal instanceof Date) {
    const dateStr = newVal.toISOString().split('T')[0]
    if (dateStr !== props.modelValue) emit('update:modelValue', dateStr)
  }
})

onMounted(async () => {
  try {
    holidays.value = await HolydayService.getBolivisHolydays()
  } finally {
    holidaysLoaded.value = true
  }
})
</script>

<style scoped>
.scrollbar-on-hover::-webkit-scrollbar {
  height: 4px;
}

.scrollbar-on-hover::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-on-hover::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 10px;
}

.scroll-container-wrapper:hover .scrollbar-on-hover::-webkit-scrollbar-thumb {
  background: #d6d3d1;
}

.calendar-slide-enter-active,
.calendar-slide-leave-active {
  transition: all 0.4s ease;
}

.calendar-slide-enter-from,
.calendar-slide-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

:deep(.luxury-calendar-mini) {
  --p-datepicker-header-background: transparent;
  --p-datepicker-background: transparent;
  --p-datepicker-date-selected-background: #1c1917 !important;
  --p-datepicker-date-selected-color: #ffffff !important;
}

:deep(.p-datepicker-date) {
  width: 2.2rem !important;
  height: 2.2rem !important;
  border-radius: 50% !important;
}
</style>
