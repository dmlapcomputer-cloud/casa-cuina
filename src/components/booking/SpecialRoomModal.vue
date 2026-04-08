<template>
  <TransitionRoot :show="isOpen" as="template" :unmount="true">
    <Dialog as="div" @close="handleDialogClose" class="relative z-[150]">
      <TransitionChild as="template" enter="duration-200 ease-out" enter-from="opacity-0" enter-to="opacity-100"
        leave="duration-150 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-stone-900/65" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-start sm:items-center justify-center p-3 sm:p-4">
          <TransitionChild as="template" enter="duration-250 cubic-bezier(0.16, 1, 0.3, 1)"
            enter-from="opacity-0 scale-95 translate-y-4" enter-to="opacity-100 scale-100 translate-y-0"
            leave="duration-150 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel v-if="room"
              class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-100 my-2 sm:my-0" style="will-change: transform;">

              <div class="relative pt-4 sm:pt-6 pb-3 sm:pb-4 px-5 sm:px-8 text-center border-b border-stone-50">
                <span class="text-[10px] text-primary font-bold uppercase tracking-[0.3em] mb-2 block">
                  {{ termsAccepted ? 'Configuración de Reserva' : 'Condiciones del Salón' }}
                </span>
                <DialogTitle as="h3" class="font-serif italic text-2xl sm:text-3xl text-stone-800 leading-tight">
                  {{ room.title }}
                </DialogTitle>

                <button @click="close"
                  class="absolute top-6 right-6 text-stone-300 hover:text-stone-500 transition-colors p-2">
                  <Icon icon="lucide:x" class="w-6 h-6" />
                </button>
              </div>

              <div class="p-4 sm:p-8 overflow-y-auto max-h-[calc(100dvh-140px)] sm:max-h-[70vh] custom-scrollbar">

                <div v-if="!termsAccepted" class="animate-content space-y-10 py-1">
                  <div class="text-center space-y-2">
                    <p class="text-stone-400 text-[10px] uppercase tracking-[0.2em]">Condiciones de exclusividad</p>
                  </div>

                  <div class="space-y-4 px-1">
                    <div class="flex items-center justify-between p-6 bg-stone-50/50 rounded-2xl border border-stone-100">
                      <div class="flex flex-col text-left">
                        <span class="text-[11px] uppercase font-bold text-stone-600 tracking-widest mb-1">Garantía de Exclusividad</span>
                        <p class="text-xs text-stone-500 leading-tight pr-4">Asegura la reserva total del salón para su grupo.</p>
                      </div>
                      <div class="text-right min-w-[100px]">
                        <span class="text-xl font-bold text-primary italic font-serif">Bs. {{ room.min_price }}</span>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div class="p-5 border border-stone-100 rounded-2xl text-left bg-white">
                        <span class="text-[11px] uppercase font-bold text-stone-400 tracking-widest block mb-2">Disponibilidad</span>
                        <span class="text-stone-800 font-medium text-sm">{{ room.duration || 3 }} Horas de uso privado</span>
                      </div>
                      <div class="p-5 border border-stone-100 rounded-2xl text-left bg-white">
                        <span class="text-[11px] uppercase font-bold text-stone-400 tracking-widest block mb-2">Planificación</span>
                        <span class="text-stone-800 font-medium text-sm">{{ room.anticipation || 24 }} Horas mínimas</span>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-4 pt-4 px-4 text-center">
                    <p class="text-stone-500 text-[16px] italic font-serif leading-relaxed">
                      "Deseamos que su estancia sea impecable. Al continuar, confirma su conformidad con estos detalles."
                    </p>

                    <div class="flex flex-col gap-3">
                      <button @click="termsAccepted = true"
                        class="w-full py-5 bg-stone-900 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.25em] shadow-xl shadow-stone-200 transition-all active:scale-[0.98] hover:bg-stone-800">
                        Confirmar
                      </button>
                      <button @click="close"
                        class="text-stone-400 text-[9px] font-bold uppercase tracking-widest hover:text-stone-600 transition-colors py-2">
                        Explorar otros ambientes
                      </button>
                    </div>
                  </div>
                </div>

                <!-- DateStepper y TimeStepper solo se montan cuando el usuario aceptó los términos -->
                <div v-else class="animate-content space-y-10">
                  <div class="grid grid-cols-2 gap-4 py-3 border-b border-stone-100">
                    <div class="text-center">
                      <span class="text-[9px] uppercase font-bold text-stone-400 tracking-widest block mb-1">Mínimo de Personas</span>
                      <span class="font-bold text-xl font-sans" :class="isValidGuests ? 'text-stone-800' : 'text-red-500'">
                        {{ room.min_guests }} <span class="text-xs font-medium">Asistentes</span>
                      </span>
                    </div>
                    <div class="text-center border-l border-stone-100">
                      <span class="text-[9px] uppercase font-bold text-stone-400 tracking-widest block mb-1">Duración</span>
                      <span class="font-bold text-xl font-sans text-stone-800">
                        {{ room.duration || 3 }} <span class="text-xs font-medium">Hrs</span>
                      </span>
                    </div>
                  </div>

                  <div class="space-y-5">
                    <p class="text-stone-400 text-[14px] text-center text-balance">Deslice para ajustar el número final de invitados</p>
                    <div class="max-w-[260px] mx-auto py-2">
                      <GuestStepper v-model="tempGuests" :min="1" :max="50" />
                    </div>
                    <p v-if="!isValidGuests"
                      class="text-center text-[10px] text-red-500 font-bold uppercase tracking-[0.15em] animate-pulse">
                      ⚠ Requiere mínimo {{ room.min_guests }} invitados
                    </p>
                  </div>

                  <div class="space-y-6">
                    <div class="text-center space-y-3">
                      <h4 class="font-serif italic text-xl text-stone-700">Fecha y Horario de preferencia</h4>
                      <div v-if="!isValidAnticipation"
                        class="inline-flex flex-col items-center gap-1 bg-amber-50/50 px-6 py-3 rounded-2xl border border-amber-100/50">
                        <div class="flex items-center gap-2">
                          <Icon icon="lucide:clock" class="w-3.5 h-3.5 text-amber-600" />
                          <span class="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Anticipación de {{ room.anticipation || 24 }}h requerida</span>
                        </div>
                        <span class="text-[11px] text-amber-600 font-medium">Próximo: {{ nextAvailableFormatted }}</span>
                      </div>
                    </div>

                    <div class="space-y-4">
                      <div class="bg-stone-50/40 p-1 rounded-2xl border border-stone-100/50">
                        <DateStepper :model-value="tempDate ?? undefined" :anticipation-hours="room.anticipation || 24"
                          @update:model-value="(val: any) => tempDate = val" :block-mondays="true"
                          :closed-dates="[{ date: '2026-03-22', reason: 'Cerrado por Elecciones' }]"
                          />
                      </div>
                      <div class="py-2 w-full overflow-x-auto">
                        <TimeStepper :model-value="tempTime" :room-id="room.id" :selected-date="tempDate"
                          :anticipation-hours="room.anticipation || 24"
                          @update:model-value="(val: any) => tempTime = val" layout="horizontal" />
                      </div>
                    </div>
                  </div>

                  <div class="pt-6 space-y-4">
                    <button @click="confirmChange" :disabled="!canConfirm"
                      class="btn-confirm w-full py-5 flex items-center justify-center gap-3 group">
                      <span>Confirmar</span>
                      <Icon icon="lucide:arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>

                    <button @click="termsAccepted = false"
                      class="w-full text-stone-400 hover:text-stone-600 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors py-2 flex items-center justify-center gap-2">
                      <Icon icon="lucide:chevron-left" class="w-3 h-3" />
                      Ver detalles de exclusividad
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { Icon } from '@iconify/vue';
import DateStepper from './DateStepper.vue';
import TimeStepper from './TimeStepper.vue';
import GuestStepper from './GuestStepper.vue';
import { useSystemSettings } from '@/composables/useSystemSettings';
import { addBusinessHours } from '@/utils/useTimeUtil';

interface SpecialRoom {
  id: number;
  title: string;
  min_price: number;
  min_guests: number;
  duration?: number;
  anticipation?: number;
}

const props = defineProps<{
  isOpen: boolean;
  room: SpecialRoom | null;
  initialDate: string | null;
  initialTime: string | null;
  currentGuests: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', data: { date: string, time: string, guests: number }): void;
}>();

const { settings: injectedSettings, specialClosures, getScheduleForDate} = useSystemSettings();

const tempDate = ref<string | null>(props.initialDate);
const tempTime = ref<string | null>(props.initialTime);
const tempGuests = ref(props.currentGuests);
const termsAccepted = ref(false);

// Resetear estados al abrir el modal
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    termsAccepted.value = false;
    tempGuests.value = props.currentGuests;
    tempDate.value = props.initialDate;

    const hoursNeeded = props.room?.anticipation || 24;
    const now = new Date();
    const minDate = new Date();
    minDate.setHours(now.getHours() + hoursNeeded);
    const datePart = minDate.toISOString().split('T')[0] || '';

    if (props.initialDate && props.initialTime) {
      const selected = new Date(`${props.initialDate}T${props.initialTime}`);
      const diffHours = (selected.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours >= hoursNeeded) {
        tempTime.value = props.initialTime;
      } else {
        tempTime.value = null;
        if (props.initialDate < datePart) tempDate.value = datePart;
      }
    } else {
      tempTime.value = null;
    }
  }
});

const nextAvailableFormatted = computed(() => {
  return minAllowedDate.value.toLocaleTimeString('es-BO', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const isValidAnticipation = computed(() => {
  if (!tempDate.value || !tempTime.value) return false;
  
  // Creamos la fecha que el usuario eligió en el Stepper
  const seleccionado = new Date(`${tempDate.value}T${tempTime.value}`);
  
  // Es válido SOLO si es igual o posterior al mínimo permitido
  return seleccionado >= minAllowedDate.value;
});

const isValidGuests = computed(() => {
  return tempGuests.value >= (props.room?.min_guests || 0);
});

const canConfirm = computed(() =>
  isValidAnticipation.value &&
  isValidGuests.value &&
  !!tempTime.value &&
  termsAccepted.value
);

const close = () => { emit('close'); };

// HeadlessUI dispara @close al hacer clic fuera o Escape.
// Solo permitimos cerrar si el usuario NO aceptó los términos todavía
// (en el paso de configuración el cierre es intencional solo via botones).
const handleDialogClose = () => {
  if (!termsAccepted.value) {
    close();
  }
};

const confirmChange = () => {
  if (canConfirm.value && tempDate.value && tempTime.value && tempGuests.value >= 0 ) {
    emit('confirm', {
      date: tempDate.value,
      time: tempTime.value,
      guests: tempGuests.value
    });
  }
};

// 1. Calculamos el momento exacto permitido (saltando noches y feriados)
const minAllowedDate = computed(() => {
  // 1. Si no hay sala o settings, retornamos fecha actual (Guarda)
  if (!props.room || !injectedSettings.value) return new Date();

  // 2. Forzamos a TS a tratar esto como un objeto válido (Casting)
  const settings = injectedSettings.value;
  
  // 3. Extraemos las horas como número y los horarios como string
  const horasAnticipo = Number(props.room.anticipation || 33);
  
  // 4. Usamos valores por defecto directos para que nunca sean undefined/null
  const openTimeStr: string = settings.start_time || "08:00:00";
  const closeTimeStr: string = settings.end_time || "23:00:00";

  return addBusinessHours(
    new Date(),
    horasAnticipo,
    { 
      start: openTimeStr, 
      end: closeTimeStr 
    },
    getScheduleForDate,
    specialClosures.value.map(c => c.date)
  );
});


</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 10px; }
.animate-content { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
