<template>
  <header class="mb-10 flex flex-col items-center text-center animate-fade-in">
    <div class="w-full max-w-[280px] md:max-w-[340px] px-6 mx-auto">
      <img v-if="logoUrl" :src="logoUrl" alt="Casa Çuina Logo"
      class="w-full h-auto object-contain"/>
      <div v-else-if="isLoading" class="w-full h-20 bg-white/5 animate-pulse rounded-lg"></div>
    </div>

    <!--<div class="mt-3 flex items-center gap-4">
      <span class="h-[0.5px] w-8 bg-white/30"></span>
      <p class="text-system-label text-white/90 uppercase">
        Santa Cruz • Bolivia
      </p>
      <span class="h-[0.5px] w-8 bg-white/30"></span>
    </div>-->
  </header>
</template>

<script setup lang="ts">
import { useSystemSettings } from '@/composables/useSystemSettings';
import { onMounted } from 'vue';
//src="https://restaurant-reservations.misadevflores.com/storage/logo/01KHEBXS5A1BC35GG3XHT43CGC.png"
const { logoUrl, isLoading, fetchSettings } = useSystemSettings()
onMounted(async () => {
  fetchSettings()
})
// No necesitamos props por ahora, ya que el logo y el nombre son estáticos
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 1.2s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fuente Serif para el logo Ç */
.font-serif {
  font-family: 'Noto Serif', serif;
}
</style>
