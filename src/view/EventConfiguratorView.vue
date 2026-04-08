<template>
  <div class="min-h-screen bg-[#F9F8F6] font-sans antialiased flex flex-col items-center p-4 py-8">

    <div class="fixed inset-0 z-0">
      <div class="h-full w-full bg-cover bg-center animate-ken-burns"
        :style="{ backgroundImage: `url('${backgroundUrl}')` }">
      </div>
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
    </div>

    <main
      class="w-full max-w-3xl bg-white backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(194,123,46,0.08)] flex flex-col border border-[#E5E1DA]">

      <header class="pt-8 pb-4 flex flex-col text-center shrink-0">
        <div class="w-full max-w-[280px] md:max-w-[320px] px-6 mx-auto">
          <img :src="logoUrl" alt="Logo Casa Çuina" class="ow-full h-auto object-contain brightness-0" />
        </div>
        <div class="mt-2">
          <h2 class="font-display text-[20px] md:text-[24px] uppercase tracking-[0.3em] text-stone-800 opacity-90">
            Eventos
          </h2>
        </div>
      </header>

      <div class="px-8 md:px-8 pb-6 flex-1 overflow-y-auto custom-scrollbar">
        <EventStepper />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import EventStepper from '@/components/event/EventStepper.vue';
import { useSystemSettings } from '@/composables/useSystemSettings';
import { onMounted } from 'vue';
const { logoUrl, fetchSettings, backgroundUrl } = useSystemSettings();

onMounted(() => {
  fetchSettings()
})
</script>

<style scoped>
@keyframes kenburns {
  0% {
    transform: scale(1) translate(0, 0);
  }

  100% {
    transform: scale(1.15) translate(-1%, -1%);
  }
}

.animate-ken-burns {
  animation: kenburns 40s infinite alternate ease-in-out;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(28, 25, 23, 0.1);
  border-radius: 10px;
}
</style>
