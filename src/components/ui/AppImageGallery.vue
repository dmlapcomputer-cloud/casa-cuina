<template>
  <div
    class="relative w-full h-full group/image overflow-hidden bg-stone-50 rounded-2xl border-2 transition-all duration-300"
    :class="selected ? 'border-primary shadow-lg scale-[0.98]' : 'border-transparent'"
  >
    <swiper
      :modules="[Pagination, Navigation]"
      :pagination="{ clickable: true, dynamicBullets: true }"
      :space-between="0"
      :navigation="false"
      class="w-full h-full"
    >
      <swiper-slide v-for="(img, index) in fullUrls" :key="index" class="relative">
        <div @click="$emit('select')" class="w-full h-full cursor-pointer">
          <img
            :src="img"
            :alt="alt"
            class="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
            loading="lazy"
          />
        </div>

        <button
          v-if="allowExpand"
          @click.stop="openGallery(index)"
          class="absolute bottom-3 left-3 z-20 p-2 rounded-xl bg-white/90 backdrop-blur-md text-stone-800 shadow-sm opacity-0 group-hover/image:opacity-100 transition-all hover:scale-110"
        >
          <Icon icon="lucide:maximize-2" class="w-4 h-4" />
        </button>
      </swiper-slide>
    </swiper>

    <div v-if="selected" class="absolute top-3 left-3 z-30 bg-primary text-white p-1 rounded-full shadow-xl animate-bounce-in">
      <Icon icon="lucide:check" class="w-4 h-4" />
    </div>

    <div v-if="fullUrls.length > 1"
         class="absolute top-3 right-3 z-10 bg-black/40 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-md border border-white/10 pointer-events-none">
      {{ fullUrls.length }} fotos
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Navigation } from 'swiper/modules';
import { useItemUtils } from '@/composables/useItemUtils';
import { Fancybox } from "@fancyapps/ui";
import { Icon } from '@iconify/vue';
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const props = defineProps<{
  images: string[];
  alt: string;
  selected?: boolean;
  allowExpand?: boolean;
}>();

defineEmits(['select']);
const { getFullUrl } = useItemUtils();

const fullUrls = computed(() => {
  return props.images.map(img => getFullUrl(img)).filter((url): url is string => !!url);
});

// Función para abrir Fancybox manualmente en una imagen específica
const openGallery = (index: number) => {
  const items = fullUrls.value.map(url => ({
    src: url,
    type: "image",
    caption: props.alt
  }));

  Fancybox.show(items, { startIndex: index });
};
</script>

<style scoped>
.animate-bounce-in {
  animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes bounceIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}
/* Estilos de Swiper personalizados para que se vea premium */
:root {
  --swiper-theme-color: #c27b2e; /* Tu color primary */
}
</style>
