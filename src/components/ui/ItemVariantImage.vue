<template>
  <div
    class="relative w-full overflow-hidden bg-stone-100 aspect-[3/4]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <img
      v-if="fullImageUrl && !error"
      :src="fullImageUrl"
      :alt="alt"
      @error="handleError"
      class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out"
      :class="isHovered ? 'scale-110' : 'scale-100'"
    />

    <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-300">
      <svg class="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>

    <button
      v-if="!error"
      @click.stop="isExpanded = true"
      type="button"
      :class="[
        'absolute bottom-2 right-2 z-20 p-2 rounded-lg bg-white/90 backdrop-blur-md text-stone-800 shadow-md transition-all duration-300 active:scale-90',
        'md:opacity-0 md:group-hover:opacity-100'
      ]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isExpanded"
          class="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-950/95 p-4 md:p-12"
          @click.stop="isExpanded = false"
        >
          <button class="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img
            :src="fullImageUrl || ''"
            class="max-w-full max-h-full rounded-lg shadow-2xl object-contain animate-zoom"
          >
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useItemUtils } from '@/composables/useItemUtils';
import { computed, ref } from 'vue';

const { getFullUrl } = useItemUtils();
const props = defineProps<{ src?: string | null; alt?: string; }>();
const error = ref(false);
const isHovered = ref(false);
const isExpanded = ref(false);
const fullImageUrl = computed(() => getFullUrl(props.src));
const handleError = () => { error.value = true; };
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-zoom { animation: zoom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes zoom { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

@media (max-width: 768px) {
  .md\:opacity-0 { opacity: 1 !important; }
}
</style>
