<template>
  <div
    class="flex-grow flex flex-col items-center justify-center py-10 md:py-16 text-center animate-in fade-in zoom-in duration-700">

    <div v-if="isWpSent" class="space-y-4 md:space-y-6 max-w-sm md:max-w-md">
      <h2
        class="text-2xl md:text-3xl lg:text-4xl font-serif italic font-black text-stone-900 tracking-tight leading-tight">
        ¡Todo listo, <br class="md:hidden"> {{ firstName }}!
      </h2>
      <div class="h-px w-10 md:w-16 bg-primary mx-auto opacity-70"></div>
      <div class="relative group">
        <div
          class="absolute -inset-0.5 to-stone-200 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000">
        </div>
        <div class="relativ py-4 px-8 rounded-xl">
          <p class="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1 font-bold">Código de Reserva</p>
          <span class="text-3xl font-mono font-bold text-stone-800 tracking-tighter">
            {{ response?.data?.code }}
          </span>
        </div>
      </div>
      <p class="text-[14px] md:text-[16px] text-stone-500 leading-relaxed italic px-4">
        Tu reserva de Brunch ha sido recibida. <br>
        <span class="text-stone-800 font-bold not-italic border-b border-primary/30">
          Revisa tu WhatsApp:
        </span>
        te enviamos los detalles para el pago de tus
        <span class="text-stone-800 font-bold not-italic">manillas de acceso</span>
        para que evites filas el día del evento.
      </p>
    </div>

    <div v-else class="space-y-4 md:space-y-6 max-w-sm md:max-w-md">
      <h2
        class="text-2xl md:text-3xl lg:text-4xl font-serif italic font-black text-stone-900 tracking-tight leading-tight">
        ¡Casi listo, {{ response?.data.name.split(' ')[0] }}!
      </h2>

      <div class="h-px w-10 md:w-16 bg-primary mx-auto opacity-70"></div>

      <p class="text-[13px] md:text-[15px] text-stone-500 leading-relaxed italic px-4">
        Tu reserva se guardó, pero tuvimos un problema técnico para avisar al encargado.
        <br><br>
        <span class="text-stone-800 font-bold not-italic">¿Podrías enviarla manualmente por WhatsApp?</span>
        Así coordinamos tu pago para entregarte las manillas sin filas.
      </p>

      <div class="pt-4">
        <a :href="whatsappLink" target="_blank"
          class="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-4 rounded-full font-bold uppercase text-[11px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-200/50">
          <Icon icon="logos:whatsapp-icon" class="text-xl" />
          Confirmar por WhatsApp
        </a>
      </div>
    </div>
    <div class="flex items-center justify-center gap-6 mt-10 px-4">
  <button @click="goToHome"
    class="py-2 px-3 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-primary transition-all flex items-center gap-2 group">
    <Icon icon="lucide:home" class="text-[12px]" />
    Inicio
  </button>

  <div class="w-1.5 h-1.5 bg-stone-100 rounded-full"></div>

  <button @click="emit('reset')"
    class="py-2 px-3 text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 hover:text-primary transition-all flex items-center gap-2 group">
    <Icon
      icon="lucide:rotate-ccw"
      class="text-[12px] group-hover:rotate-180 transition-transform duration-500"
    />
    Nueva Reserva
  </button>
</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import type { BrunchResponse } from "@/types/Buffet/Brunch"
import { useSystemSettings } from '@/composables/useSystemSettings';
import { useRouter } from 'vue-router';

const props = defineProps<{
  response: BrunchResponse | null
}>()
const router = useRouter()
const emit = defineEmits(['reset'])

const { settings, fetchSettings } = useSystemSettings()
const isWpSent = computed(() => props.response?.send_wp === true)
const firstName = computed(() => {
  const name = props.response?.data.name || 'Cliente';
  return name.split(' ')[0];
})

const whatsappLink = computed(() => {
  const notifyPhone = settings.value?.whatsapp_notify

  if (!props.response?.data || !notifyPhone) return '#'

  const d = props.response.data
  const message = encodeURIComponent(
    `*RESERVA DE BRUNCH - ENVÍO MANUAL*\n\n` +
    `👤 *Cliente:* ${d.name}\n` +
    `📞 *Teléfono:* ${d.phone}\n` +
    `👥 *Pax:* ${d.amount} personas\n` +
    `📅 *Fecha:* ${formatDate(d.date_branch)}\n` +
    `⏰ *Hora:* ${d.start_time?.slice(0, 5)}\n` +
    `✨ *Evento:* ${d.service_type}\n\n`
  )

  return `https://wa.me/${notifyPhone}?text=${message}`
})

onMounted(async () => {
  fetchSettings()
})

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'No especificada';

  try {
    // 1. Tomamos solo la parte de la fecha antes de la 'T'
    // Ejemplo: "2026-03-12T04:00:00.000000Z" -> "2026-03-12"
    const cleanDate = dateStr.toString().split('T')[0] || '';

    // 2. Ahora sí hacemos el split por el guion
    const [year = 0, month = 0, day = 0] = cleanDate.split('-').map(Number);

    const d = day.toString().padStart(2, '0');
    const m = month.toString().padStart(2, '0');
    const y = year;

    return `${d}/${m}/${y}`; // Resultado: 12/03/2026
  } catch (e) {
    console.error("Error al formatear fecha:", e);
    return dateStr;
  }
}
const goToHome = (() => {
  router.push('/')
  sessionStorage.removeItem('brunch_finished')
  sessionStorage.removeItem('brunch_res_data')
})
</script>
