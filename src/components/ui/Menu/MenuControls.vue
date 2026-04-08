<template>
  <nav class="w-full relative flex items-center justify-between h-16 md:h-20 gap-4">
    
    <!-- CATEGORÍAS CON SCROLL -->
    <div 
      ref="scrollWrapper" 
      class="categories-scroll-wrapper flex-1 min-w-0 overflow-x-auto scrollbar-hide relative group/scroll"
      @scroll="checkScroll"
    >
      <div class="flex gap-6 md:gap-10 items-center h-16 px-1 lg:px-2 transition-all duration-300">
        <button
          v-for="cat in categories"
          :key="cat"
          :ref="el => { if (el) categoryRefs[cat] = el as HTMLElement }"
          @click="selectCategory(cat)"
          class="relative py-2 font-sans text-[13px] md:text-[14px] uppercase tracking-[0.25em] font-bold transition-all duration-300 whitespace-nowrap outline-none"
          :class="activeCategory === cat
            ? 'text-primary scale-105'
            : 'text-stone-400 hover:text-stone-700 hover:scale-105'"
        >
          {{ cat }}
          <!-- Indicador animado -->
          <div 
            class="absolute -bottom-1 left-0 w-full h-[3px] rounded-full transition-all duration-500 ease-out origin-left shadow-sm"
            :class="activeCategory === cat 
              ? 'bg-gradient-to-r from-primary to-primary-light scale-x-100 opacity-100' 
              : 'bg-transparent scale-x-0 opacity-0'"
          ></div>
        </button>
      </div>

    </div>

    <!-- BÚSQUEDA -->
    <div 
      class="flex-shrink-0 flex items-center justify-end transition-all duration-500 ease-in-out" 
      :class="[
        isDesktop
          ? (isFocused ? 'w-64 lg:w-80' : 'w-48 lg:w-64')
          : (isSearchOpen ? 'absolute inset-0 bg-stone-bg/98 backdrop-blur-xl z-[60] px-4' : 'w-10')
      ]"
    >
      <!-- Botón Gatillo (Mobile/Tablet) -->
      <button 
        v-if="!isSearchOpen && !isDesktop" 
        @click="toggleSearch"
        class="p-2.5 rounded-full bg-stone-100 hover:bg-primary/10 text-stone-500 hover:text-primary transition-all duration-300"
      >
        <Icon icon="lucide:search" width="20" />
      </button>

      <!-- Input de Búsqueda -->
      <div 
        v-if="isSearchOpen || isDesktop" 
        class="relative w-full flex items-center animate-in fade-in zoom-in-95 duration-200"
      >
        <Icon 
          icon="lucide:search" 
          class="absolute left-4 transition-all duration-300"
          :class="isFocused ? 'text-primary scale-110' : 'text-stone-400'"
          :width="isFocused ? 18 : 16" 
        />
        
        <input
          ref="searchInput"
          type="text"
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @keyup.esc="isDesktop ? null : toggleSearch()"
          placeholder="Buscar un plato..."
          class="w-full font-sans bg-white/40 border rounded-full py-2.5 pl-11 pr-10 text-sm outline-none transition-all duration-300 placeholder:text-stone-400"
          :class="isFocused ? 'border-primary/60 bg-white' : 'border-stone-200 hover:border-stone-300'"
        />

        <!-- Botón Cerrar (Mobile) o Limpiar (General) -->
        <button 
          v-if="isSearchOpen || searchQuery"
          @click="isSearchOpen ? toggleSearch() : $emit('update:searchQuery', '')" 
          class="absolute right-3 p-1.5 rounded-full hover:bg-stone-50 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <Icon :icon="isSearchOpen && !searchQuery ? 'lucide:x' : (searchQuery ? 'lucide:delete' : 'lucide:search')" width="16" />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps<{
  categories: string[];
  activeCategory: string;
  searchQuery: string;
}>();

const emit = defineEmits(['update:activeCategory', 'update:searchQuery']);

const isSearchOpen = ref(false);
const isDesktop = ref(false);
const isFocused = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const scrollWrapper = ref<HTMLElement | null>(null);
const categoryRefs = ref<Record<string, HTMLElement>>({});
const hasMoreScroll = ref(false);

// Auto-scroll al tab activo
const scrollToActive = (cat: string) => {
  nextTick(() => {
    const el = categoryRefs.value[cat];
    const wrapper = scrollWrapper.value;
    if (!el || !wrapper) return;
    const elLeft = el.offsetLeft;
    const elWidth = el.offsetWidth;
    const wrapperWidth = wrapper.offsetWidth;
    const scrollTo = elLeft - wrapperWidth / 2 + elWidth / 2;
    wrapper.scrollTo({ left: scrollTo, behavior: 'smooth' });
  });
};

const selectCategory = (cat: string) => {
  emit('update:activeCategory', cat);
  scrollToActive(cat);
};

// Indicador de scroll
const checkScroll = () => {
  const wrapper = scrollWrapper.value;
  if (!wrapper) return;
  hasMoreScroll.value = wrapper.scrollLeft + wrapper.clientWidth < wrapper.scrollWidth - 10;
};

const toggleSearch = () => {
  if (isDesktop.value) return;
  isSearchOpen.value = !isSearchOpen.value;
  if (isSearchOpen.value) {
    setTimeout(() => searchInput.value?.focus(), 150);
  } else {
    emit('update:searchQuery', '');
  }
};

const checkScreen = () => {
  isDesktop.value = window.innerWidth >= 1024;
  if (isDesktop.value) isSearchOpen.value = false;
  checkScroll();
};

// Atajo de teclado "/"
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === '/' && isDesktop.value && !isFocused.value) {
    e.preventDefault();
    searchInput.value?.focus();
  }
};

watch(() => props.activeCategory, (cat) => {
  scrollToActive(cat);
});

onMounted(() => {
  checkScreen();
  window.addEventListener('resize', checkScreen);
  window.addEventListener('keydown', handleKeydown);
  nextTick(() => checkScroll());
});

onUnmounted(() => {
  window.removeEventListener('resize', checkScreen);
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.categories-scroll-wrapper {
  -ms-overflow-style: none;
  scrollbar-width: none;
  mask-image: linear-gradient(to right, black 0%, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 0%, black 90%, transparent 100%);
}

.categories-scroll-wrapper::-webkit-scrollbar {
  display: none;
}

@media (min-width: 1024px) {
  .categories-scroll-wrapper {
    mask-image: none !important;
    -webkit-mask-image: none !important;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Glassmorphism utility if not globally available */
.bg-stone-bg\/98 {
  background-color: rgba(var(--stone-bg-rgb), 0.98);
}
</style>
