<template>
  <div class="flex flex-col items-center justify-center py-6 md:py-10 px-4 text-center">
    <h3 class="text-lg md:text-xl font-display uppercase tracking-[0.2em] text-stone-800 mb-2">
      Seleccione su ubicación
    </h3>

    <p class="text-stone-500 text-[9px] md:text-[11px] uppercase tracking-widest max-w-xs md:max-w-sm mb-10">
      Explore nuestras áreas y elija el ambiente ideal para su reserva
    </p>

    <div class="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-3xl mx-auto">
      <div v-for="option in experiences" :key="option.id" class="flex flex-col items-center group">

        <div class="w-full aspect-square sm:aspect-[2/2] relative mb-3 overflow-hidden rounded-2xl">
          <AppImageGallery
            :images="getOptionImages(option)"
            :alt="option.name"
            :selected="modelValue === option"
            :allow-expand="true"
            @select="handleSelection(option)"
          />
        </div>

        <div :class="[
          'flex flex-col items-center leading-tight transition-colors duration-300',
          modelValue === option ? 'text-primary' : 'text-stone-600'
        ]">
          <span class="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
            {{ option.name }}
          </span>
          <span class="text-[9px] md:text-[9px] font-bold uppercase tracking-[0.1em] mt-1">
            {{ option.description }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppImageGallery from '../ui/AppImageGallery.vue'; // Ajusta la ruta
import type { IExperienceOption } from '@/types/TypeExperienceSelector-intreface';

const props = defineProps<{
  modelValue: IExperienceOption | null;
  selectedDate: string | null;
  experiences: IExperienceOption[]; // Usamos la prop que viene del servicio
}>();

const emit = defineEmits<{
  // CAMBIO: Ahora emite el objeto completo, no solo el ID
  (e: 'update:modelValue', option: IExperienceOption | null): void;
  (e: 'next', id: number): void; // El next lo puedes dejar como ID si prefieres
  (e: 'validation-failed', data: { option: IExperienceOption; errorType: string }): void;
}>();

// Función para preparar el array de imágenes para el componente
const getOptionImages = (option: IExperienceOption): string[] => {
  const imgs: string[] = [];
  if (option.main_image) imgs.push(option.main_image);
  if (option.gallery_images && option.gallery_images.length > 0) {
    imgs.push(...option.gallery_images);
  }
  return imgs;
};

// En TypeExperienceSelector.vue
const handleSelection = (option: IExperienceOption) => {
  // SI ES PREMIUM: Dejamos pasar siempre para que el modal maneje la lógica
  if (option.is_premium) {
    emit('update:modelValue', option);
    setTimeout(() => {
      emit('next', option.id);
    }, 400);
    return;
  }

  // VALIDACIÓN PARA EXPERIENCIAS NORMALES (No premium)
  if (option.min_lead_hours && parseInt(option.min_lead_hours) > 0) {
    const now = new Date();
    const selected = new Date(props.selectedDate + 'T12:00:00');
    const diffHours = (selected.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < parseInt(option.min_lead_hours)) {
      emit('validation-failed', { option, errorType: 'time' });
      return; // Este es el bloqueo que quitamos para los premium
    }
  }

  emit('update:modelValue', option);
  setTimeout(() => {
    emit('next', option.id);
  }, 400);
};
</script>

<style scoped>
/* Las animaciones ahora están dentro de AppImageGallery,
   pero puedes mantener fade-in si lo usas para otros elementos */
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1.25); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
</style>
