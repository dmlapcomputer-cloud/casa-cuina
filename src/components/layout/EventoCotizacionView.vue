<template>
  <div
    class="flex-grow flex flex-col items-center justify-center py-10 md:py-16 px-6 text-center animate-in fade-in zoom-in duration-700">

    <div v-if="isWpSent" class="space-y-4 md:space-y-6 max-w-sm md:max-w-md">

      <h2
        class="text-2xl md:text-3xl lg:text-4xl font-serif italic font-black text-stone-900 tracking-tight leading-tight">
        ¡Todo listo, <br class="md:hidden"> {{ name }}!
      </h2>

      <div class="h-px w-10 md:w-16 bg-primary mx-auto opacity-70"></div>

      <p class="text-[16px] md:text-[16px] lg:text-[16px] text-stone-500 leading-relaxed italic px-4">
        Hemos recibido tu solicitud correctamente. En unos minutos, un agente de
        <span class="text-stone-800 font-bold not-italic border-b border-primary/30">Casa Cuina</span>
        te contactará para confirmar los detalles.
      </p>
    </div>

    <div v-else class="space-y-4 md:space-y-6 max-w-sm md:max-w-md">

      <h2
        class="text-2xl md:text-3xl lg:text-4xl font-serif italic font-black text-stone-900 tracking-tight leading-tight">
        ¡Casi listo, {{ name }}!
      </h2>
      <div class="h-px w-10 md:w-16 bg-primary mx-auto opacity-70"></div>
      <p class="text-[13px] md:text-[15px] text-stone-500 leading-relaxed italic px-4">
        Tu cotización se guardó, pero tuvimos un problema técnico para avisar al encargado.
        <br>
        <span class="text-stone-800 font-bold not-italic">¿Podrías enviarla manualmente por WhatsApp?</span>
      </p>

      <div class="pt-4">
        <a :href="whatsappLink" target="_blank"
          class="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-4 rounded-full font-bold uppercase text-[11px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-200/50">
          <Icon icon="logos:whatsapp-icon" class="text-xl" />
          Enviar al encargado
        </a>
      </div>
    </div>

    <div class="flex items-center justify-between gap-2 mt-8 px-6 w-full max-w-sm mx-auto">
      <button @click="goToHome"
        class="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-primary transition-all flex items-center gap-1.5 group">
        <Icon icon="lucide:home" class="text-[11px]"></Icon>
        Inicio
      </button>
      <div class="w-1.5 h-1.5 bg-stone-200 rounded-full"></div>
      <button @click="emit('reset')"
        class="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] text-stone-400 hover:text-primary transition-all flex items-center gap-2 group">
        <Icon icon="lucide:rotate-ccw"
          class="text-[10px] md:text-[12px] group-hover:rotate-180 transition-transform duration-500" />
        Nueva Cotización
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSystemSettings } from '@/composables/useSystemSettings';
import router from '@/router';
import { SettingService } from '@/services/SettingsService';
import type { EventBookingResponse } from '@/types/Events/Event-Create';
import { Icon } from '@iconify/vue'
import { computed, onMounted, ref } from 'vue';
const { settings } = useSystemSettings()
const props = defineProps<{
  name: string,
  eventData: EventBookingResponse | null
}>()

const emit = defineEmits<{
  (e: 'reset'): void
}>()

const isWpSent = computed(() => props.eventData?.send_wp === true)
const notifyPhone = ref<string | undefined>('');
const whatsappLink = computed(() => {
  if (!props.eventData?.data || !notifyPhone.value) return '#'

  const d = props.eventData.data
  // Convertimos el objeto de check_list en una lista de texto
  const checklistText = d.check_list
    ? Object.keys(d.check_list).map(key => `• ${key}`).join('\n')
    : 'Sin equipos adicionales'

  const message = encodeURIComponent(
    `*SOLICITUD DE EVENTO - ENVÍO MANUAL*\n\n` +
    `👤 *Cliente:* ${d.name}\n` +
    `📞 *Teléfono:* ${d.phone}\n` +
    `🎈 *Evento:* ${d.event}\n` +
    `📅 *Fecha:* ${d.date}\n` +
    `⏰ *Horario Inicio:* ${d.start_time}\n` +
    `⏰ *Hora Fin:* ${d.end_time}\n` +
    `👥 *Cantidad Invitados:*  ${d.amount_guests}\n\n` +
    `📋 *Lista de equipos o raider:*\n${checklistText}`
  )

  return `https://wa.me/${notifyPhone.value}?text=${message}`
})

onMounted(async () => {
  if (!settings.value) {
    const data = await SettingService.getSettings();
    if (data) {
      settings.value = data;
    }
  }
})

const goToHome = () => {
  if ('vibrate' in navigator) navigator.vibrate(20);
  emit('reset')
  router.push('/')
}
</script>
