<template>
  <div class="group flex flex-col">
    <div class="flex items-start gap-4 p-2 md:p-4 transition-all duration-500 rounded-[20px]">

      <div class="shrink-0 w-[88px] h-[88px] md:w-[130px] md:h-[130px] relative overflow-hidden rounded-[16px] md:rounded-[20px] shadow-sm group-hover:shadow-md transition-all duration-500 bg-stone-100">
        <MenuItemImagen
        v-if="item.image_url"
        :images="[item.image_url, ...(item.images_json)]"
        :alt="item.name"
        />
        <div v-else class="w-full h-full flex flex-col items-center justify-center bg-stone-200 gap-1">
          <img :src="faviconUrl" alt="Logo" class="w-9 h-9 object-contain" />
          <span class="text-[9px] font-sans uppercase tracking-widest text-stone-600">Sin foto</span>
        </div>
      </div>

      <div class="flex-grow flex flex-col min-w-0 pt-0.5 md:pt-2">

        <div class="hidden md:flex items-baseline w-full mb-2">
          <h4 class="font-serif text-[24px] italic text-stone-800 leading-none truncate tracking-wide">
            {{ item.name }}
          </h4>
          <div class="dotted-leader"></div>
          <div class="flex items-baseline gap-1 whitespace-nowrap">
            <span v-if="item.category_id == 18" class="font-serif text-[12px] italic text-stone-400 mr-1">Desde</span>
            <span class="font-serif text-[21px] italic font-bold text-primary leading-none">{{ item.price }}</span>
            <span class="font-serif text-[12px] font-bold uppercase tracking-widest text-primary/70">Bs</span>
          </div>
        </div>

        <h4 class="md:hidden font-serif text-[20px] italic text-stone-800 leading-snug mb-1">
          {{ item.name }}
        </h4>

        <div
          class="font-sans text-[12.5px] md:text-[14px] text-stone-500 leading-relaxed html-description line-clamp-2"
          v-html="item.description"
        ></div>

        <div class="md:hidden flex items-center gap-2 mt-2">
          <div class="h-[1px] w-6 bg-primary/20"></div>
          <span v-if="item.category_id == 18" class="font-serif text-[10px] italic text-stone-400">Desde</span>
          <span class="font-serif text-[15px] font-bold text-primary leading-none">{{ item.price }}</span>
          <span class="font-sans text-[9px] font-bold uppercase tracking-widest text-primary/60">Bs</span>
        </div>

      </div>
    </div>

    <div class="h-[1px] w-[90%] mx-auto bg-gradient-to-r from-transparent via-stone-300 to-transparent opacity-60"></div>
  </div>
</template>

<script setup lang="ts">
import { useSystemSettings } from '@/composables/useSystemSettings';
import type { Product } from '@/types/Menu/Menu-interface';
import MenuItemImagen from './MenuItemImagen.vue';

defineProps<{ item: Product }>();
const { faviconUrl } = useSystemSettings()
</script>

<style scoped>
.dotted-leader {
  flex-grow: 1;
  background-image: radial-gradient(circle, #a8a29e 1px, transparent 1px);
  background-size: 7px 100%;
  background-position: 0 90%;
  background-repeat: repeat-x;
  height: 1.2rem;
  margin: 0 1rem;
  opacity: 0.25;
  align-self: stretch;
}

/* ESTILOS PARA EL HTML DE LA API */
.html-description :deep(p) {
  margin-bottom: 4px;
}

.html-description :deep(ul) {
  list-style: none; /* Quita los puntos de la lista */
  padding: 0;
  margin: 4px 0;
}

.html-description :deep(li) {
  margin-bottom: 2px;
}

.html-description :deep(strong) {
  color: #44403c; /* stone-800 */
  font-weight: 600;
}
</style>
