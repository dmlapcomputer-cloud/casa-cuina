<template>
  <Transition name="fade">
    <div v-if="active" class="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-auto">
      <div class="absolute inset-0 bg-white/10"></div>

      <div class="relative z-10 flex flex-col items-center">
        <ProgressSpinner
        style="width: 50px; height: 50px"
        strokeWidth="8"
        fill="transparent"
        animationDuration=".5s"
        />
        <p class="mt-4 text-stone-600 font-sans text-xs uppercase tracking-widest animate-pulse">
          {{ message }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';

defineProps<{
  active: boolean;
  message?: string;
}>();
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
