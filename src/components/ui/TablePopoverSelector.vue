<template>
  <div class="relative w-full font-display">
    <label class="text-[10px] font-black uppercase text-slate-500 ml-1 mb-1.5 block">
      Selección de Mesas (Capacidad requerida: {{ requiredCapacity }})
    </label>

    <div
      @click="isOpen = !isOpen"
      class="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl flex flex-wrap gap-2 items-center cursor-pointer hover:border-slate-200 transition-all"
    >
      <span v-if="selectedTables.length === 0" class="text-slate-400 text-sm">
        Haz clic para elegir tus mesas...
      </span>

      <div
        v-for="table in selectedTablesData"
        :key="table.id"
        class="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2 animate-in zoom-in"
      >
        <span>Mesa {{ table.id }} ({{ table.maxCapacity }} pers.)</span>
        <button @click.stop="removeTable(table.id)" class="hover:text-blue-200">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <!--<span class="material-symbols-outlined ml-auto text-slate-400">apps</span>-->
    </div>

    <div
      v-if="isOpen"
      class="absolute z-50 mt-2 w-full bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-blue-5 rounded-[2rem] p-6 animate-in fade-in slide-in-from-top-2"
    >
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-sm font-bold text-slate-800">Mapa del Restaurante</h4>
        <div class="text-right">
          <p
            class="text-[10px] font-bold"
            :class="currentTotalCapacity >= requiredCapacity ? 'text-green-600' : 'text-orange-500'"
          >
            Capacidad: {{ currentTotalCapacity }} / {{ requiredCapacity }}
          </p>
        </div>
      </div>

      <div v-for="area in areas" :key="area.name" class="mb-6 last:mb-0">
        <p
          class="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b pb-1"
        >
          {{ area.name }}
        </p>

        <div class="grid grid-cols-4 gap-3">
          <button
            v-for="table in area.tables"
            :key="table.id"
            type="button"
            @click="toggleTable(table)"
            :disabled="table.isOccupied"
            class="h-12 rounded-xl border-2 flex flex-col items-center justify-center transition-all"
            :class="[
              table.isOccupied
                ? 'bg-red-500 border-red-700 text-white opacity-100 cursor-not-allowed'
                : selectedTables.includes(table.id)
                  ? 'bg-primary border-primary text-white shadow-lg'
                  : 'bg-slate-50 border-slate-200 text-slate-600',
            ]"
          >
            <span class="text-[10px] font-bold">#{{ table.id }}</span>
            <span class="text-[8px] font-black">{{
              table.isOccupied ? 'OCUPADA' : table.maxCapacity + 'p'
            }}</span>
          </button>
        </div>
      </div>

      <button
        @click="isOpen = false"
        class="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest"
      >
        Listo
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { googleSheetsService } from '@/services/googleSheetsService'

interface Table {
  id: number
  maxCapacity: number
  isOccupied: boolean
}

interface Area {
  name: string
  tables: Table[]
}

const props = defineProps<{
  requiredCapacity: number // El 'form.people' que viene del padre
  modelValue: number[] // Array de IDs de mesas seleccionadas
  selectedDate: string
  selectedTime: string
  selectedEndTime: string
}>()
const emit = defineEmits(['update:modelValue', 'update:area-name', 'update:area-detail'])
const isOpen = ref(false)
const isLoading = ref(false)

// Convertimos áreas en una 'ref' para poder modificar el 'isOccupied' dinámicamente
const areas = ref<Area[]>([
  {
    name: 'Salón',
    tables: [
      { id: 1, maxCapacity: 4, isOccupied: false },
      { id: 2, maxCapacity: 4, isOccupied: false },
      { id: 3, maxCapacity: 2, isOccupied: false },
      { id: 4, maxCapacity: 2, isOccupied: false },
    ],
  },
  {
    name: 'Terraza',
    tables: [
      { id: 10, maxCapacity: 4, isOccupied: false },
      { id: 11, maxCapacity: 4, isOccupied: false },
    ],
  },
  {
    name: 'Interior',
    tables: [
      { id: 12, maxCapacity: 4, isOccupied: false },
      { id: 13, maxCapacity: 4, isOccupied: false },
    ],
  },
  {
    name: 'Jardín',
    tables: [
      { id: 14, maxCapacity: 4, isOccupied: false },
      { id: 15, maxCapacity: 4, isOccupied: false },
    ],
  },
])

const selectedTables = computed(() => props.modelValue)

// Obtener los datos completos de las mesas seleccionadas para los Tags
const selectedTablesData = computed(() => {
  const allTables = areas.value.flatMap((a) => a.tables)
  return allTables.filter((t) => selectedTables.value.includes(t.id))
})

// Calcular capacidad actual sumada
const currentTotalCapacity = computed(() => {
  return selectedTablesData.value.reduce((sum, t) => sum + t.maxCapacity, 0)
})

const toggleTable = (table: Table) => {
  if (table.isOccupied) return

  const newSelection = [...selectedTables.value]
  const index = newSelection.indexOf(table.id)

  if (index > -1) {
    newSelection.splice(index, 1)
  } else {
    newSelection.push(table.id)
  }
  emit('update:modelValue', newSelection)

  // Emitir detalles de área
  const dynamicGroups = areas.value
    .map((area) => ({
      name: area.name,
      tables: area.tables.filter((t) => newSelection.includes(t.id)).map((t) => t.id),
    }))
    .filter((group) => group.tables.length > 0)

  emit('update:area-detail', dynamicGroups)
  emit('update:area-name', dynamicGroups.map((g) => g.name).join(', '))
}

const removeTable = (id: number) => {
  const newSelection = selectedTables.value.filter((tId) => tId !== id)
  emit('update:modelValue', newSelection)
}

// --- LÓGICA DE ACTUALIZACIÓN DE DISPONIBILIDAD ---

// --- Dentro del script setup de TablePopoverSelector.vue ---

const refreshAvailability = async () => {
  // Verificamos que existan las props antes de continuar
  if (!props.selectedDate || !props.selectedTime) return;

  isLoading.value = true;
  try {
    const occupiedIds = await googleSheetsService.isTableOccupied(
      props.selectedDate,
      props.selectedTime,
      props.selectedEndTime
    );

    // Actualizamos el estado de las mesas de forma inmutable para asegurar reactividad
    areas.value = areas.value.map((area) => ({
      ...area,
      tables: area.tables.map((table) => {
        const isNowOccupied = occupiedIds.includes(table.id);

        // Si la mesa que el usuario tenía marcada ahora está ocupada, la removemos
        if (isNowOccupied && selectedTables.value.includes(table.id)) {
          removeTable(table.id);
        }

        return {
          ...table,
          isOccupied: isNowOccupied,
        };
      }),
    }));

  } catch (err) {
    // Manejo de error sin usar 'any'
    const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
    console.error('Error al refrescar disponibilidad de mesas:', errorMessage);
  } finally {
    isLoading.value = false;
  }
};
// Observar cambios en fecha y hora para refrescar el mapa
watch(
  [() => props.selectedDate, () => props.selectedTime],
  () => {
    refreshAvailability()
  },
  { immediate: true },
)
</script>
