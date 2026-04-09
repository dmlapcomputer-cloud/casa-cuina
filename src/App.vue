<template>
  <div v-if="settings?.maintenance_mode" class="maintenance-overlay">
    <div class="maintenance-content">
      <img 
        v-if="settings?.logo" 
        :src="logoUrl" 
        alt="Logo Casa Çuina" 
        class="maintenance-logo" 
      />
      
      <div class="space-y-4 px-4">
        <h1 class="font-display text-2xl md:text-3xl text-stone-800 tracking-tight">
          Estamos en mantenimiento
        </h1>
        <p class="text-stone-500 max-w-md mx-auto text-sm md:text-base leading-relaxed">
          {{ settings?.maintenance_message || 'Estamos realizando mejoras en nuestro sistema para brindarte una mejor experiencia. Por favor, vuelve más tarde.' }}
        </p>
      </div>

      <div class="flex flex-col items-center gap-6 pt-6">
        <a 
          :href="whatsappUrl" 
          target="_blank"
          class="flex items-center gap-3 px-8 py-3 bg-[#25D366] text-white rounded-full font-bold shadow-xl hover:bg-[#20ba5a] transition-all hover:scale-105 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.089-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
          </svg>
          Consultar por WhatsApp
        </a>

        <span class="px-4 py-2 bg-stone-200/50 text-stone-500 rounded-full text-[10px] font-black uppercase tracking-widest">
          Modo Mantenimiento Activo
        </span>
      </div>
    </div>
  </div>

  <template v-else>
    <RouterView :key="String(settings?.maintenance_mode)"></RouterView>
    <ToastProvider
      position="top-center"
      richColors
      :expand="true"
      :duration="5000"
      theme="light"
    ></ToastProvider>
  </template>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import 'vue-sonner/style.css'
import ToastProvider from './components/ui/ToastProvider.vue'
import { useSystemSettings } from './composables/useSystemSettings';
import { computed, onMounted, onUnmounted } from 'vue';

// Extraemos los elementos del composable
const { settings, fetchSettings, logoUrl } = useSystemSettings();

// Tipado estricto para evitar 'any'
let interval: ReturnType<typeof setInterval> | null = null;

/**
 * URL de WhatsApp dinámica basada en los settings del servidor
 */
const whatsappUrl = computed(() => {
  const rawPhone = settings.value?.whatsapp_notify || '';
  const cleanPhone = rawPhone.replace(/\D/g, ''); // Limpieza de caracteres no numéricos
  const message = settings.value?.whatsapp_message || 'Hola Casa Çuina, tengo una consulta sobre una reserva.';
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
});

/**
 * Función encargada de actualizar los settings de forma segura
 */
const updateStatus = async () => {
  try {
    await fetchSettings();
  } catch (error) {
    console.error("Error actualizando el estado del sistema:", error);
  }
};

onMounted(async () => {
  // Carga inicial inmediata
  await updateStatus();

  // POLLING AGRESIVO (3 segundos):
  // Si tú cambias el mantenimiento a TRUE en el admin, esta función lo detectará
  // en máximo 3 segundos. Al actualizarse 'settings.value', el v-if de arriba 
  // eliminará automáticamente el <RouterView> de la pantalla.
  interval = setInterval(async () => {
    await updateStatus();
  }, 3000);
});

// Limpieza para evitar fugas de memoria
onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>

<style scoped>
/* Pantalla completa fija para bloquear interacción */
.maintenance-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: #f5f5f4; /* stone-50 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.maintenance-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.maintenance-logo {
  height: 90px;
  width: auto;
  object-fit: contain;
  margin: 0 auto;
}

body {
  font-family: 'Inter', sans-serif;
}

@media (max-width: 640px) {
  [data-sonner-toaster] {
    --mobile-offset: 20px;
  }
  .maintenance-logo {
    height: 70px;
  }
}
</style>