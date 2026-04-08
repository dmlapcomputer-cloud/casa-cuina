<template>
  <footer class="mt-auto pt-12 pb-8 flex flex-col items-center gap-8 animate-fade-in-up">
    <div class="flex gap-6">
      <template v-if="settings">
        <a v-if="settings.instagram_url"
          :href="settings.instagram_url"
          target="_blank"
          class="social-btn"
          title="Instagram"
        >
          <Icon icon="ri:instagram-line" class="text-xl" />
        </a>

        <a v-if="settings.facebook_url"
          :href="settings.facebook_url"
          target="_blank"
          class="social-btn"
          title="Facebook"
        >
          <Icon icon="ri:facebook-fill" class="text-xl" />
        </a>

        <a v-if="settings.twitter_url"
          :href="settings.twitter_url"
          target="_blank"
          class="social-btn"
          title="WhatsApp"
        >
          <Icon icon="ri:tiktok-line" class="text-xl" />
        </a>
      </template>

      <div v-else-if="isLoading" class="flex gap-6">
        <div v-for="i in 3" :key="i" class="h-12 w-12 rounded-full bg-white/5 animate-pulse"></div>
      </div>
    </div>

    <div class="flex flex-col items-center gap-4 text-center">
      <div class="flex items-center gap-4">
        <span class="h-px w-6 bg-primary/40"></span>
        <p class="text-system-label text-white/70 uppercase">
          {{ 'Equipetrol • Santa Cruz' }}
        </p>
        <span class="h-px w-6 bg-primary/60"></span>
      </div>

      <p class="text-system-label text-white/40 font-medium tracking-[0.2em]">
        © {{ new Date().getFullYear() }} {{ settings?.name || 'Casa Çuina' }}
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { useSystemSettings } from '@/composables/useSystemSettings';

const { settings, isLoading } = useSystemSettings();

</script>

<style scoped>
/* Encapsulamos el estilo de los botones para limpieza */
.social-btn {
  @apply flex h-12 w-12 items-center justify-center rounded-full border border-white/10
         bg-white/5 backdrop-blur-md text-white transition-all duration-300
         hover:bg-primary hover:border-primary hover:scale-110 active:scale-95 shadow-lg;
}

.animate-fade-in-up {
  animation: fadeInUp 1.2s ease-out 0.8s backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
