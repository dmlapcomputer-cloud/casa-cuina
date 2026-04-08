<template>
  <div ref="containerRef" class="relative w-full h-full overflow-hidden bg-stone-50">
    <!-- Fallback cuando no hay imágenes -->
    <div v-if="fullUrls.length === 0"
      class="absolute inset-0 flex flex-col items-center justify-center gap-2">
       <img :src="faviconUrl" alt="Logo" class="w-12 h-12 object-contain" />
      <span class="text-[9px] font-bold uppercase tracking-widest text-stone-500">Sin foto</span>
    </div>

    <swiper v-else
      :modules="[Pagination, Navigation]"
      :pagination="{ clickable: true, dynamicBullets: true }"
      :space-between="15"
      :navigation="false"
      class="w-full h-full"
    >
      <swiper-slide v-for="(img, index) in fullUrls" :key="index">
        <div class="w-full h-full cursor-zoom-in">
          <img
          :src="img"
          :alt="alt"
          class="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
          loading="lazy"
          :data-fancybox="'gallery-' + alt"
          />
        </div>
      </swiper-slide>

      <!-- Ícono zoom hint -->
      <div class="absolute bottom-2 left-2 z-10 pointer-events-none bg-black/40 rounded-full p-1">
        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" stroke="white" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
      </div>
    </swiper>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Navigation } from 'swiper/modules';
import { useItemUtils } from '@/composables/useItemUtils';
// 1. IMPORTAR FANCYBOX
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

// Estilos de Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useSystemSettings } from '@/composables/useSystemSettings';

const containerRef = ref<HTMLElement | null>(null)
const props = defineProps<{ images: string[]; alt: string; }>();
const { getFullUrl } = useItemUtils();
const { faviconUrl } = useSystemSettings();

const fullUrls = computed(() => {
  return props.images.map(img => getFullUrl(img)).filter((url): url is string => !!url);
});

// 2. CONFIGURACIÓN DE FANCYBOX (MOUSE PANNING)
onMounted(() => {
  if(containerRef.value){
    Fancybox.bind(containerRef.value,"[data-fancybox]", {
      infinite: true,
      dragToClose:false,
      Images: {
        initialSize: "fit",
        Panzoom: {
          maxScale: 2.5,
          panMode: "mousemove",
          mouseMoveFriction: 0.12,
        },
      },
      Toolbar: {
        display: {
          right: ["close"],
        },
      },
      showClass: "f-fadeIn",
    } as unknown as Parameters<typeof Fancybox.bind>[1]);
    }
});
// 3. LIMPIEZA
onUnmounted(() => {
  if(containerRef.value){
    Fancybox.destroy();
  }
});

const triggerZoom = (galleryId : string) => {
  const firstItem = document.querySelector(`[data-fancybox="gallery-${galleryId}"]`) as HTMLElement;
  if (firstItem) firstItem.click();
}
defineExpose({ triggerZoom})
</script>

<style>
/* --- ESTILOS DE SWIPER (Tus estilos actuales) --- */
:root {
  --swiper-theme-color: #d4a373;
  --swiper-pagination-bullet-inactive-color: #fff;
  --swiper-pagination-bullet-inactive-opacity: 0.5;
  --swiper-pagination-bullet-size: 8px;
}

.swiper-pagination-bullet {
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
}

@media (max-width: 768px) {
  .swiper-button-next, .swiper-button-prev { display: none !important; }
}

.swiper-button-next, .swiper-button-prev {
  background: white;
  width: 28px !important;
  height: 28px !important;
  border-radius: 50%;
  color: #78716c !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  opacity: 0;
  transition: all 0.3s ease;
}

.swiper-button-next::after, .swiper-button-prev::after { font-size: 10px !important; font-weight: bold; }

.group\/image:hover .swiper-button-next,
.group\/image:hover .swiper-button-prev { opacity: 1; }

/* --- PERSONALIZACIÓN DE FANCYBOX (Opcional) --- */
.fancybox__container {
  --fancybox-bg: rgba(24, 24, 27, 0.98); /* Fondo casi negro estilo elegante */
  --fancybox-accent-color: #d4a373;
}

.fancybox__caption {
  font-family: serif;
  font-style: italic;
  font-size: 1.1rem;
  color: #f5f5f4;
}
.fancybox__nav { display: none !important; }
</style>
