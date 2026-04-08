<template>
  <div class="flex flex-col items-center justify-center py-10 px-4 text-center">

    <h3 class="text-xl font-display uppercase tracking-[0.3em] text-stone-800 mb-2">
      ¿Desea equipar su evento?
    </h3>

    <p class="text-stone-400 text-[11px] uppercase tracking-widest max-w-xs mb-12">
      Mobiliario, Sonido & Decoración Profesional
    </p>

    <div class="flex justify-center items-center gap-6 w-full">

      <!-- Botón SÍ -->
      <button @click="$emit('update:modelValue', true)" :class="[
        'flex items-center justify-center w-[150px] h-[54px] rounded-[22px] border-2 transition-all duration-300 font-bold uppercase tracking-[0.2em] text-sm',
        modelValue === true
          ? 'bg-primary text-white border-primary shadow-[0_15px_30px_-5px_rgba(145,113,73,0.35)]'
          : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-white'
      ]">
        Sí
      </button>

      <!-- Botón NO -->
      <button @click="$emit('update:modelValue', false)" :class="[
        'flex items-center justify-center w-[150px] h-[54px] rounded-[22px] border-2 transition-all duration-300 font-bold uppercase tracking-[0.2em] text-sm',
        modelValue === false
          ? 'bg-dark-accent text-white border-dark-accent shadow-[0_15px_30px_-5px_rgba(68,64,60,0.35)]'
          : 'bg-transparent text-dark-accent border-dark-accent hover:bg-dark-accent hover:text-white'
      ]">
        No
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: boolean | null }>()
defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<style scoped></style>
