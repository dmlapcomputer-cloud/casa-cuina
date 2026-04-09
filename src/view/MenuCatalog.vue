<template>
  <div class="min-h-screen bg-stone-bg transition-colors duration-500">
    <header class="relative pt-6 pb-10">
      <div class="flex flex-col items-center">
        <div class="mb-6 group cursor-pointer" @click="$router.push('/')">
          <img
            :src="logoUrl"
            alt="Casa Çuina"
            class="h-16 md:h-24 w-auto brightness-0 opacity-90 object-contain transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div class="space-y-2 text-center">
          <div class="flex items-center justify-center gap-4">
            <div class="h-[1px] w-8 bg-stone-300"></div>
            <div class="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
            <div class="h-[1px] w-8 bg-stone-300"></div>
          </div>
        </div>
      </div>
    </header>

    <div class="sticky top-0 z-50 w-full bg-stone-bg/95 backdrop-blur-md border-b border-stone-200/40 py-2 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-10 lg:px-8">
        <div class="flex items-center gap-3">
          <!-- Botón volver -->
          <button
            @click="$router.push('/')"
            class="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors group shrink-0"
          >
            <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="hidden sm:block text-[11px] font-black uppercase tracking-widest">Volver</span>
          </button>

          <!-- Separador -->
          <div class="h-5 w-[1px] bg-stone-200 shrink-0"></div>

          <!-- Controles de menú -->
          <div class="flex-1 min-w-0">
            <MenuControls
              v-model:searchQuery="searchQuery"
              v-model:activeCategory="activeCategory"
              :categories="dymanicCategories"
            />
          </div>
        </div>
      </div>
    </div>

    <main class="max-w-7xl mx-auto px-4 sm:px-10 lg:px-8 pb-32">
      <header class="mb-12 mt-10 text-center">
        <h2 class="font-serif text-[32px] md:text-[42px] italic text-primary animate-slide-up capitalize">
          {{ activeCategory }}
        </h2>
      </header>

      <div v-if="loading">
        <MenuSkeleton />
      </div>

      <div
        v-else-if="filteredItems.length > 0"
        :class="[
          'grid gap-6 md:gap-10',
          activeCategory === 'Tortas'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
             : 'grid-cols-1 lg:grid-cols-2'
        ]"
      >
        <template v-if="activeCategory === 'Tortas'">
          <MenuItemCard
            v-for="(item, index) in filteredItems"
            :key="item.id"
            :item="item"
            :selection="globalSelection?.productId === item.id ? globalSelection.portionIndex : null"
            @update:selection="(portionIdx) => handleGlobalSelection(item.id, portionIdx)"
            class="animate-slide-up hover:-translate-y-1 transition-transform duration-300"
            :style="{ animationDelay: `${index * 0.08}s` }"
          />
        </template>

        <template v-else>
          <MenuItemRow
            v-for="(item, index) in filteredItems"
            :key="item.id"
            :item="item"
            class="animate-slide-up"
            :style="{ animationDelay: `${index * 0.1}s` }"
          />
        </template>
      </div>

      <div v-else class="text-center py-24 animate-fade-in">
        <p class="text-stone-400 font-serif text-2xl italic">No encontramos lo que buscas...</p>
        <button
          @click="resetFilters"
          class="mt-6 font-sans text-label text-primary border-b border-primary/40 pb-1 hover:text-primary-dark transition-colors"
        >
          Ver todas las tortas
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MenuControls from '../components/ui/Menu/MenuControls.vue'
import MenuItemRow from '../components/ui/Menu/MenuItemRow.vue'
import MenuItemCard from '../components/ui/Menu/MenuItemCard.vue' // Importado
import MenuSkeleton from '@/components/ui/Menu/MenuSkeleton.vue'
import { useSystemSettings } from '@/composables/useSystemSettings'
import { MenuItemService } from '@/services/Menu/menuService'
import type { Product } from '@/types/Menu/Menu-interface'

const searchQuery = ref('')
const activeCategory = ref('Tortas') // Empezamos directo en Tortas
const loading = ref(true)
const menuItems = ref<Product[]>([])

// --- NUEVA LÓGICA DE SELECCIÓN GLOBAL ---
// Guarda qué producto está seleccionado y qué porción específica
const globalSelection = ref<{ productId: number; portionIndex: number } | null>(null)

const handleGlobalSelection = (productId: number, portionIndex: number | null) => {
  if (portionIndex === null) {
    globalSelection.value = null
  } else {
    globalSelection.value = { productId, portionIndex }
  }
}


// FILTRADO
const filteredItems = computed(() => {
  if (!Array.isArray(menuItems.value)) return [];
  const query = normalizeText(searchQuery.value);

  return menuItems.value.filter((item) => {
    // Filtro estricto por Categoría 18 (Tortas)
    const isTorta = item.category_id == 18 || (item.category && item.category.name === 'Tortas');
    if (!isTorta) return false;
    const name = normalizeText(item.name || '');
    const description = normalizeText(item.description || '');
    return name.includes(query) || description.includes(query);
  });
})

const normalizeText = (text: string) => {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const resetFilters = () => {
  searchQuery.value = ''
  activeCategory.value = 'Tortas'
}

const dymanicCategories = computed(() => ['Tortas'])

const { logoUrl, fetchSettings } = useSystemSettings()

onMounted(async () => {
  fetchSettings()
  try {
    const data = await MenuItemService.getItemMenu();
    // Como tu API devuelve { data: [...] }, asegúrate que el service devuelva el array
    menuItems.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error cargando el menu", error);
    menuItems.value = [];
  } finally {
    loading.value = false;
  }
})
</script>
