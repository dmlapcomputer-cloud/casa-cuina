<template>
  <div class="w-full max-w-md mx-auto animate-in fade-in zoom-in duration-500 py-6">
    <div v-if="!props.reservationData" class="flex flex-col items-center py-12">
      <div class="w-8 h-8 border-4 border-stone-200 border-t-primary rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <div v-if="isWpSent" class="space-y-6">
        <div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100">

          <div v-if="!props.isSaturday && !props.isAfterOffice"
            class="py-3 px-6 flex justify-between items-center bg-stone-50/50 border-b border-stone-100">
            <span class="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold">
              Referencia Reserva
            </span>
            <span class="font-mono text-sm font-bold text-stone-800">
              {{ props.reservationData?.data?.codigo || '---' }}
            </span>
          </div>

          <div class="p-8 space-y-8">
            <div class="text-center space-y-1">
              <p :class="['text-[11px] uppercase tracking-[0.2em] font-bold', bookingContext.color]">
                {{ bookingContext.label }} Confirmada
              </p>
              <div :class="['h-px w-10 mx-auto my-2 opacity-50', props.isAfterOffice ? 'bg-indigo-600' : 'bg-primary']"></div>
            </div>

            <div class="grid grid-cols-3 gap-2 border-y border-dashed py-6 border-stone-200">
              <div class="text-center space-y-1">
                <p class="text-[8px] uppercase tracking-tighter text-stone-400 font-black">Fecha</p>
                <p class="text-[11px] font-bold text-stone-800 capitalize">
                  {{ formatDateShort(reservationData?.data.booking_date) }}
                </p>
              </div>
              <div class="text-center space-y-1 border-x border-stone-100">
                <p class="text-[8px] uppercase tracking-tighter text-stone-400 font-black">Horario</p>
                <p class="text-[11px] font-bold text-stone-800">
                 {{ reservationData?.data.booking_time?.substring(0, 5) || '--:--' }}
                </p>
              </div>
              <div class="text-center space-y-1">
                <p class="text-[8px] uppercase tracking-tighter text-stone-400 font-black">Personas</p>
                <p class="text-[11px] font-bold text-stone-800">
                  {{ reservationData?.data.guest_count || 0 }}
                </p>
              </div>
            </div>

            <p class="text-center text-[15px] text-stone-600 leading-relaxed italic">
              <template v-if="props.isSaturday">
                ¡Tu brunch está confirmado! Te esperamos el sábado para disfrutar de una experiencia única.
              </template>
              <template v-else-if="props.isAfterOffice">
                ¡Tu mesa de After Office está lista! Prepárate para el mejor ambiente y los mejores cócteles.
              </template>
              <template v-else>
                Hemos recibido tu reserva correctamente. Un agente se contactará si hay cambios. ¡Te esperamos!
              </template>
            </p>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center text-center space-y-6 px-4 py-8 bg-white rounded-3xl shadow-sm border border-stone-100">
        <Icon :icon="bookingContext.icon" class="text-4xl" :class="bookingContext.color" />
        <div class="space-y-3">
          <h2 class="font-serif italic text-3xl text-stone-900 leading-tight">¡Casi listo!</h2>
          <div class="h-px w-10 bg-primary mx-auto opacity-70"></div>

          <p class="text-[14px] md:text-[15px] text-stone-500 leading-relaxed italic px-4">
            Tu <span class="font-bold text-stone-800">{{ bookingContext.label.toLowerCase() }}</span>
            se guardó, pero hubo un inconveniente al notificar al local.
            <br><br>
            <b>¿Podrías enviarla manualmente por WhatsApp?</b>
          </p>
        </div>

        <a :href="whatsappLink" target="_blank"
          class="w-full inline-flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 rounded-full font-bold uppercase text-[11px] tracking-widest shadow-xl shadow-green-200/50 hover:scale-[1.02] transition-transform active:scale-95">
          <Icon icon="logos:whatsapp-icon" class="text-xl" />
          Enviar al encargado
        </a>
      </div>

      <div class="flex items-center justify-around gap-2 mt-8 px-2">
        <button @click="goToHome" class="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-primary transition-all flex items-center gap-1.5 group">
          <Icon icon="lucide:home" class="text-[11px]" />
          Inicio
        </button>

        <div class="w-1.5 h-1.5 bg-stone-200 rounded-full"></div>

        <button @click="emit('reset')" class="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-primary transition-all flex items-center gap-1.5 group">
          <Icon icon="lucide:rotate-ccw" class="text-[11px] group-hover:rotate-180 transition-transform duration-500" />
          Nueva Reserva
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { BookingResponse } from '@/types/Linktree/Booking-interfaceRequest'
import { useSystemSettings } from '@/composables/useSystemSettings'
import { useRouter } from 'vue-router';

const props = defineProps<{
  reservationData: BookingResponse | null,
  isSaturday: boolean,
  isAfterOffice: boolean
}>()

const router = useRouter();
const emit = defineEmits(['reset'])
const { settings, fetchSettings } = useSystemSettings()

// Normalización de la respuesta de envío
const isWpSent = computed(() => {
  const sent = props.reservationData?.send_wp;
  return sent === true;
});

const bookingContext = computed(() => {
  if (props.isSaturday) return { label: 'Brunch', icon: 'lucide:utensils', color: 'text-stone-800' };
  if (props.isAfterOffice) return { label: 'After Office', icon: 'lucide:glass-water', color: 'text-indigo-600' };
  return { label: 'Reserva', icon: 'lucide:calendar', color: 'text-stone-800' };
});

const whatsappLink = computed(() => {
  const notifyPhone = settings.value?.whatsapp_notify
  const d = props.reservationData?.data

  if (!d || !notifyPhone) return '#'

  let cleanPhone = notifyPhone.replace(/\D/g, '')
  if (!cleanPhone.startsWith('591')) cleanPhone = `591${cleanPhone}`

  const typeText = props.isSaturday ? "BRUNCH" : props.isAfterOffice ? "AFTER OFFICE" : "RESERVA";

  const message = encodeURIComponent(
    `*${typeText} - CONFIRMACIÓN*\n\n` +
    `📌 *Código:* ${d.codigo || 'N/A'}\n` +
    `👤 *Cliente:* ${d.customer_name}\n` +
    `📅 *Fecha:* ${formatDate(d.booking_date)}\n` +
    `⏰ *Hora:* ${d.booking_time?.substring(0, 5) || 'N/A'}\n` +
    `👥 *Personas:* ${d.guest_count}`
  );

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`;
});

onMounted(async () => {
  await fetchSettings()

})

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '---'
  try {
    const cleanDate = dateStr.split('T')[0] || ''
    const parts = cleanDate.split('-')
    if (parts.length !== 3) return dateStr
    const [year, month, day] = parts
    return `${day}/${month}/${year}`
  } catch (e) {
    console.error(e);
    return dateStr || ''
  }
}
const formatDateShort = (d: string | undefined): string => formatDate(d);

const goToHome = () => {
  if ('vibrate' in navigator) navigator.vibrate(20);
  emit('reset')
  router.push('/')
}
</script>
