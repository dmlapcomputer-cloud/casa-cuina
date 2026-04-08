<template>
  <div
    class="relative w-full overflow-hidden bg-stone-100 aspect-[3/4] group/img rounded-2xl no-tap-highlight outline-none select-none transition-all duration-300"
    :class="selected ? 'ring-2 ring-primary ring-inset shadow-md scale-[0.98]' : 'ring-0'"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div
      class="absolute inset-0 cursor-pointer outline-none"
      @click="$emit('select')"
    >
      <img
        :src="images[0]"
        class="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out pointer-events-none"
        :class="isHovered ? 'scale-110' : 'scale-100'"
      />

      <div v-if="selected" class="absolute top-2 left-2 z-20 bg-primary text-white p-0.5 rounded-full shadow-sm animate-check">
        <Icon icon="lucide:check" class="w-2.5 h-2.5 md:w-3.5 md:h-3.5" stroke-width="4" />
      </div>

      <div v-if="images.length > 1" class="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-white text-[8px] md:text-[10px] px-1.5 py-0.5 rounded-full z-10 border border-white/5">
        +{{ images.length - 1 }}
      </div>
    </div>

    <button
      v-if="allowExpand"
      @click.stop="isExpanded = true"
      class="absolute bottom-2 left-2 z-20 p-1.5 rounded-lg bg-white/80 backdrop-blur-md text-stone-800 shadow-sm md:opacity-0 md:group-hover/img:opacity-100 transition-all active:scale-90 outline-none"
    >
      <Icon icon="lucide:maximize-2" class="w-3 h-3 md:w-4 md:h-4" />
    </button>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isExpanded" class="fixed inset-0 z-[9999] bg-stone-950/98 backdrop-blur-xl flex flex-col" @click="isExpanded = false">

          <div class="fixed top-0 w-full flex justify-end p-6 z-[10005] pointer-events-none">
            <button
              @click.stop="isExpanded = false"
              class="p-3 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 transition-all active:scale-95 border-2 border-white/20 pointer-events-auto"
            >
              <Icon icon="lucide:x" class="w-6 h-6 md:w-8 md:h-8" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-6 pb-20 pt-24 lg:hidden" @click.stop>
            <div class="max-w-2xl mx-auto space-y-4">
              <img v-for="(img, index) in images" :key="'mob-'+index" :src="img" class="w-full rounded-xl shadow-lg" />
            </div>
          </div>

          <div class="hidden lg:flex flex-1 relative items-center justify-between px-8 overflow-hidden" @click.stop>
            <button v-if="images.length > 1" @click="prevImage" class="nav-btn group">
              <Icon icon="lucide:chevron-left" class="w-10 h-10 text-white/50 group-hover:text-white" />
            </button>

            <div class="flex-1 flex flex-col items-center justify-center relative h-full">
              <Transition :name="transitionName" mode="out-in">
                <img :key="currentIndex" :src="images[currentIndex]" class="max-w-full max-h-[82vh] object-contain shadow-2xl rounded-lg">
              </Transition>
              <div class="mt-8 flex gap-2">
                <div v-for="(_, i) in images" :key="'dot-'+i" @click="currentIndex = i"
                  class="h-1.5 rounded-full cursor-pointer transition-all duration-300"
                  :class="i === currentIndex ? 'bg-red-600 w-8' : 'bg-white/20 w-2 hover:bg-white/40'">
                </div>
              </div>
            </div>

            <button v-if="images.length > 1" @click="nextImage" class="nav-btn group">
              <Icon icon="lucide:chevron-right" class="w-10 h-10 text-white/50 group-hover:text-white" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';

const props = withDefaults(defineProps<{
  images: string[];
  allowExpand?: boolean;
  selected?: boolean;
}>(), {
  images: () => [],
  allowExpand: false,
  selected: false
});

defineEmits(['select']);

const currentIndex = ref(0);
const isHovered = ref(false);
const isExpanded = ref(false);
const transitionName = ref('slide-right');

const nextImage = () => {
  transitionName.value = 'slide-right';
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
};

const prevImage = () => {
  transitionName.value = 'slide-left';
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length;
};

watch(isExpanded, (val) => {
  if (typeof document !== 'undefined') document.body.style.overflow = val ? 'hidden' : '';
});
</script>

<style scoped>
/* Eliminar resaltados de sistema en móvil */
.no-tap-highlight {
  -webkit-tap-highlight-color: transparent !important;
  user-select: none;
}

/* Forzar suavizado de bordes en el recorte de imagen */
.rounded-2xl {
  mask-image: -webkit-radial-gradient(white, black);
  -webkit-backface-visibility: hidden;
}

div, button, img { outline: none !important; }

/* Animación del Check */
.animate-check {
  animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes popIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.nav-btn { @apply relative z-[10001] p-4 rounded-full transition-all active:scale-90 hover:bg-white/5; }

/* Transiciones de imagen */
.slide-right-enter-active, .slide-right-leave-active,
.slide-left-enter-active, .slide-left-leave-active { transition: all 0.1s ease-out; }
.slide-right-enter-from { transform: translateX(20px); opacity: 0; }
.slide-right-leave-to { transform: translateX(-20px); opacity: 0; }
.slide-left-enter-from { transform: translateX(-20px); opacity: 0; }
.slide-left-leave-to { transform: translateX(20px); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.overflow-y-auto::-webkit-scrollbar { display: none; }
</style>
