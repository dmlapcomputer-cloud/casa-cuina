<template>
  <div class="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#221c10]">

    <div class="absolute inset-0 z-0 h-full w-full">
      <div
        class="h-full w-full bg-cover bg-center bg-no-repeat transition-transform duration-[20s] ease-linear animate-ken-burns"
        :style="{ backgroundImage: `url(${backgroundUrl})` }"
      ></div>

      <div class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 mix-blend-multiply"></div>
      <div class="absolute inset-0 bg-[#3a2e1e]/30 mix-blend-overlay"></div>
      <div class="absolute inset-0 backdrop-blur-[4px]"></div>
    </div>

    <div class="relative z-10 flex w-full max-w-[420px] flex-col px-6 py-10 min-h-screen">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSystemSettings } from '@/composables/useSystemSettings';
import { onMounted } from 'vue';

const { backgroundUrl, fetchSettings } = useSystemSettings();

onMounted(() => {
  fetchSettings();
});
/**
 * PortalLayout
 * Maneja el ambiente visual de Casa Çuina.
 * Recibe la imagen de fondo como prop opcional.
 */
interface Props {
  backgroundImage?: string;
}

withDefaults(defineProps<Props>(), {
  // Aquí puedes poner la ruta de la imagen que descargues
  backgroundImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0PeaTjYX5dSeoUom2vUPbYBIS-ZOS7LwDwJzIZoErI_zL7zJqoxQyABB936z5fnoyBWAQMJRuutKi_yQxS9Bo4XJHVIUovvrg8Hc5r2a-4npr-r8-jEwPigTFL2mxa1rf3E7HtQXOEvf6KwKJtQkCRpOX-VohdQIezLI40bJID9R_THzuzat4bfR-OY4Us3g0Y1C3VIn8JJolql9dbn53muS_wHIoXQRJat-7CwQYrxA8awIrrWWEx3f7GpXyGYxlTLCxM_bSJsjE'

});
</script>

<style scoped>
/* Animación Ken Burns: Un zoom muy sutil y lento */
@keyframes kenburns {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.animate-ken-burns {
  animation: kenburns 30s infinite alternate ease-in-out;
}

/* Soporte para Safari (Backdrop-filter) */
.backdrop-blur {
  -webkit-backdrop-filter: blur(4px);
}
</style>
