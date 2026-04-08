<template>
  <div class="time-scroll-wrapper w-full max-w-2xl mx-auto animate-in fade-in duration-200 px-1">
    <header class="text-center mb-6 px-4">
      <span class="text-label text-stone-400 uppercase block mb-3 text-[10px] tracking-[0.2em]">
        Seleccione el horario
      </span>
    </header>

    <div ref="scrollContainer" :class="[
      props.layout === 'grid'
        ? 'grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-y-6 gap-x-2 md:gap-x-4'
        : 'time-scroll-container flex overflow-x-auto gap-3 pt-4 pb-6 snap-x snap-mandatory px-4 scroll-smooth'
    ]">
      <div v-for="hora in timeSlots" :key="hora" :class="[
        'flex justify-center',
        props.layout === 'horizontal' ? 'flex-shrink-0 snap-center' : ''
      ]">
        <button type="button" @click="HandleSelect(hora)"
          :disabled="isPastTime(hora) || isHourBlocked(hora) || (props.anticipationHours > 0 && isTimeDisable(hora))"
          :class="[
            'group w-16 h-16 rounded-full border-[2px] flex flex-col items-center justify-center transition-all duration-200',
            getSlotClass(hora)
          ]">
          <span :class="[
            'font-black leading-none',
            isHighlightHour(hora) ? 'text-[11px] mb-0.5' : 'text-[12px]'
          ]">
            {{ hora }}
          </span>

          <template v-if="isHighlightHour(hora)">
            <span :class="[
              'mt-0.5 text-[9px] font-bold tracking-tight leading-[1] transition-colors duration-200 px-2 text-center whitespace-pre-line',
              modelValue === hora
                ? 'text-white/90'
                : getHighlightColor(hora)
            ]">
              {{ getHighlightLabel(hora) }}
            </span>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { addBusinessHours } from '@/utils/useTimeUtil';
import { useSystemSettings } from '@/composables/useSystemSettings';

const scrollContainer = ref<HTMLElement | null>(null);
const { settings, getScheduleForDate, specialClosures } = useSystemSettings()
interface Props {
  modelValue: string | null;
  selectedDate: string | null;
  minHour?: number;
  maxHour?: number;
  specialHours?: { start: string; end: string } | null;
  holidayName?: string;
  anticipationHours?: number;
  layout?: 'grid' | 'horizontal'
}

const props = withDefaults(defineProps<Props>(), {
  minHour: 8,
  maxHour: 22,
  anticipationHours: 0,
  layout: 'grid'
});

const emit = defineEmits(['update:modelValue']);

const isSaturday = computed((): boolean => {
  if (!props.selectedDate) return false;
  const [year = 0, month = 0, day = 0] = props.selectedDate.split('-').map(Number);
  return new Date(year, month - 1, day).getDay() === 6;
});

const isFriday = computed((): boolean => {
  if (!props.selectedDate) return false;
  const [year = 0, month = 0, day = 0] = props.selectedDate.split('-').map(Number);
  return new Date(year, month - 1, day).getDay() === 5;
});

// 1. Identifica si la hora está en un rango especial para pintarla
const isHighlightHour = (slot: string): boolean => {
  //guardamos los resultado en variables
  const isSpecial = props.specialHours?.start && props.specialHours.end && isSpecialRange(slot);
  // Prioridad: Rango Especial de Feriado/Evento manual
  if (!settings.value) return false;

  // Revisar si cae en el rango de After Office del backend
  const isAfter = isFriday.value && settings.value.after_schedule &&
    slot >= settings.value.after_schedule.start.slice(0, 5) &&
    slot <= settings.value.after_schedule.end.slice(0, 5);

  // Revisar si cae en el rango de Buffet Brunch del backend
  const isBuffet = isSaturday.value && settings.value.brunch_schedule &&
    slot >= settings.value.brunch_schedule.start.slice(0, 5) &&
    slot <= settings.value.brunch_schedule.end.slice(0, 5);

  // Si CUALQUIERA de las tres es cierta, iluminamos el botón
  return !!(isSpecial || isAfter || isBuffet);
};

const timeSlots = computed(() => {
  const slots: string[] = [];
  const start = props.minHour;
  // Forzamos a que siempre llegue a las 23 si es fin de semana para mostrar horas "Normales"
  const end = (isFriday.value || isSaturday.value) ? 23 : props.maxHour;

  for (let h = start; h <= end; h++) {
    const hourStr = h < 10 ? `0${h}` : `${h}`;

    // Agregamos la hora en punto (ej: 12:00)
    slots.push(`${hourStr}:00`);

    // Agregamos las :30 solo si no hemos pasado el límite final absoluto
    if (h < end) {
      slots.push(`${hourStr}:30`);
    }
  }
  return slots;
});



const isHourBlocked = (slot: string): boolean => {
  const [hora = 0, minute = 0] = slot.split(':').map(Number);
  // El local cierra a las 23:00 los viernes/sábados
  const endLimit = (isFriday.value || isSaturday.value) ? 23 : props.maxHour;

  if (hora > endLimit) return true;
  if (hora === endLimit && minute > 0) return true; // Bloquea 23:30 si el límite es 23:00
  if (hora < props.minHour) return true;
  return false;
};

const isPastTime = (slot: string): boolean => {
  if (!props.selectedDate) return false;
  const now = new Date();
  const [y = 0, m = 0, d = 0] = props.selectedDate.split('-').map(Number);
  const dateSelected = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (dateSelected < today) return true;
  if (dateSelected > today) return false;
  const [slotH = 0, slotM = 0] = slot.split(':').map(Number);
  return (slotH * 60 + slotM) <= (now.getHours() * 60 + now.getMinutes());
};

const HandleSelect = (time: string) => {
  const isActicipationInvalid = props.anticipationHours > 0 && isTimeDisable(time)

  if (!isPastTime(time) && !isHourBlocked(time) && !isActicipationInvalid) {
    emit('update:modelValue', time)

    nextTick(() => {
      if (!scrollContainer.value) return
      const buttons = scrollContainer.value.querySelectorAll('button')

      // CORRECCIÓN AQUÍ: timeSlots es una computed, usa .value
      const slots = timeSlots.value
      const idx = slots.indexOf(time)

      if (idx !== -1 && buttons[idx]) {
        buttons[idx]!.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      }
    })
  }
};

watch(() => props.selectedDate, () => {
  if (props.modelValue && (isPastTime(props.modelValue) || isHourBlocked(props.modelValue))) {
    emit('update:modelValue', null);
  }
});

const getSlotClass = (hora: string) => {
  const isSelected = props.modelValue === hora;
  const isPast = isPastTime(hora);
  const isBlocked = isHourBlocked(hora);
  const isSpecial = isSpecialRange(hora);
  const isHighlight = isHighlightHour(hora);
  const isAnticipationInvalid = props.anticipationHours > 0 && isTimeDisable(hora);

  if (isPast || isBlocked || isAnticipationInvalid) return 'bg-stone-50 text-stone-300 opacity-50';

  if (isSelected) {
    return 'bg-primary border-primary text-white shadow-lg scale-110 z-10';
  }

  // 1. PRIORIDAD: EVENTOS SEMANALES RECURRENTES (AFTER / BUFFET)
  if (settings.value) {
    if (isFriday.value && settings.value.after_schedule) {
      const start = settings.value.after_schedule.start.slice(0, 5);
      const end = settings.value.after_schedule.end.slice(0, 5);
      if (hora >= start && hora <= end) {
        return 'bg-[#222f3c] border-[#3b82f6] text-white hover:bg-primary hover:border-primary hover:text-white';
      }
    }
    if (isSaturday.value && settings.value.brunch_schedule) {
      const start = settings.value.brunch_schedule.start.slice(0, 5);
      const end = settings.value.brunch_schedule.end.slice(0, 5);
      if (hora >= start && hora <= end) {
        return 'bg-[#e0c07b] border-[#d4a34d] text-[#451a03] hover:bg-primary hover:border-primary hover:text-white';
      }
    }
  }

  // 2. PRIORIDAD SECUNDARIA: MENÚ ESPECIAL DE FERIADO/EVENTO (VERDE)
  if (isSpecial) {
    return 'bg-[#F0FDF4] border-[#10B981] text-[#065F46] hover:bg-primary hover:border-primary hover:text-white';
  }

  // 3. FERIADO GENÉRICO (Solo si no hubo label especial anterior)
  if (props.holidayName && isHighlight) {
    return 'bg-[#FEF3C7] border-[#F59E0B] text-[#92400E] hover:bg-primary hover:border-primary hover:text-white';
  }

  return 'bg-white border-stone-200 text-stone-500 hover:border-primary hover:text-primary';
};
const isSpecialRange = (time: string): boolean => {
  if (!props.specialHours?.start || !props.specialHours?.end) return false;

  // Comparamos strings (ej: "12:00" >= "12:00:00")
  // Nota: Si el servicio trae segundos, hacemos un slice(0,5)
  const start = props.specialHours.start.slice(0, 5);
  const end = props.specialHours.end.slice(0, 5);
  return time >= start && time <= end;
};
// 2. Obtener la etiqueta (texto debajo de la hora)
const getHighlightLabel = (hora: string): string => {
  if (!settings.value) return '';

  // 1. PRIORIDAD: Buffet (Sábados)
  if (isSaturday.value && settings.value.brunch_schedule) {
    const start = settings.value.brunch_schedule.start.slice(0, 5);
    const end = settings.value.brunch_schedule.end.slice(0, 5);
    if (hora >= start && hora <= end) return 'Buffet\nBrunch';
  }

  // 2. PRIORIDAD: After Office (Viernes)
  if (isFriday.value && settings.value.after_schedule) {
    const start = settings.value.after_schedule.start.slice(0, 5);
    const end = settings.value.after_schedule.end.slice(0, 5);
    if (hora >= start && hora <= end) return 'After\nOffice';
  }

  // 3. PRIORIDAD SECUNDARIA: Menú Especial
  if (isSpecialRange(hora)) return 'Menú\nEspecial';

  // 4. Feriado genérico
  if (props.holidayName) {
    const [h = 0] = hora.split(':').map(Number);
    if (h >= 18) return 'Cena\nEspecial';
  }

  return '';
};

// 3. Obtener el color de la etiqueta (según prioridad de evento)
const getHighlightColor = (hora: string): string => {
  if (!settings.value) return 'text-[#451a03]/70';

  // 1. PRIORIDAD: Buffet (Sábados) - Marrón/Dorado
  if (isSaturday.value && settings.value.brunch_schedule) {
    const start = settings.value.brunch_schedule.start.slice(0, 5);
    const end = settings.value.brunch_schedule.end.slice(0, 5);
    if (hora >= start && hora <= end) return 'text-[#451a03]/80';
  }

  // 2. PRIORIDAD: After Office (Viernes) - Blanco (sobre fondo azul oscuro)
  if (isFriday.value && settings.value.after_schedule) {
    const start = settings.value.after_schedule.start.slice(0, 5);
    const end = settings.value.after_schedule.end.slice(0, 5);
    if (hora >= start && hora <= end) return 'text-white';
  }

  // 3. PRIORIDAD SECUNDARIA: Menú Especial - Verde oscuro
  if (isSpecialRange(hora)) return 'text-[#065F46]';

  // 4. Feriado genérico
  return 'text-[#92400E]';
};
//bloqueamos las horas para que cuadno queiren seleccionar sala privada de reserva solo estan habilitados las horas disponibles despues de las
//24 horas
const isTimeDisable = (timeSlot: string) => {
  if (!props.selectedDate) return true
  const ahora = new Date()
  const disponibleDesde = addBusinessHours(ahora, props.anticipationHours || 0, {start: settings.value?.start_time || '', end: settings.value?.end_time || ''},
    getScheduleForDate, specialClosures.value.map(c => c.date)
  )
  const fechaReserva = new Date(`${props.selectedDate}T${timeSlot}:00`)
  return fechaReserva < disponibleDesde
}

const scrollToFirstAvailable = async () => {
  await nextTick();
  if (!scrollContainer.value) return;

  const firstAvailable = scrollContainer.value.querySelector('button:not(:disabled)') as HTMLElement;
  if (firstAvailable) {
    firstAvailable.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    })
  }
}
watch(() => props.selectedDate, () => {
  scrollToFirstAvailable();
})
onMounted(() => {
  scrollToFirstAvailable();
})
</script>
<style scoped>
.time-scroll-container {
  -webkit-overflow-scrolling: touch;
  padding-bottom: 20px;
  margin-bottom: -10px;
  scrollbar-width: thin;
  scrollbar-color: #d6d3d1 transparent;
}

.time-scroll-container::-webkit-scrollbar {
  height: 5px;
  display: block;
}

.time-scroll-container::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 10px;
  margin: 0 20px;
}

.time-scroll-container::-webkit-scrollbar-thumb {
  background: #d6d3d1;
  border-radius: 10px;
}

.time-scroll-wrapper:hover .time-scroll-container::-webkit-scrollbar-thumb {
  background: #a8a29e;
}

.time-scroll-wrapper:hover .time-scroll-container {
  scrollbar-color: #a8a29e transparent;
}
</style>
