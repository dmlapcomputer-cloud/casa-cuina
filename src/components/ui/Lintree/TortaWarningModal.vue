<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="show" class="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-stone-900/80 backdrop-blur-md">
        <div class="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-white/20">
          <div class="flex justify-center mb-6 text-primary text-5xl">
            <Icon icon="lucide:clock-alert" />
          </div>

          <h3 class="font-display text-2xl text-center text-stone-900 mb-4">Aviso de Pedido</h3>

          <div class="space-y-4 text-stone-600 text-center mb-8 leading-relaxed">
            <p>
              Estos son <strong>pedidos especiales</strong>, por lo cual se deben realizar con la siguiente anticipación mínima:
            </p>

            <div class="bg-stone-50 rounded-2xl p-4 space-y-3">
              <div class="flex flex-col">
                <span class="text-stone-900 font-bold">12 horas mínima:</span>
                <span class="text-sm">Torta de Brigadeiro y Zanahoria</span>
              </div>
              <div class="h-px bg-stone-200 w-1/2 mx-auto"></div>
              <div class="flex flex-col">
                <span class="text-stone-900 font-bold">24 horas mínima:</span>
                <span class="text-sm">Tortas de Cheesecake</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-3">
            <button
              @click="$emit('confirm')"
              class="w-full py-4 bg-stone-900 text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-stone-200"
            >
              Estoy de acuerdo
            </button>

            <button
              @click="$emit('close')"
              class="w-full py-4 bg-stone-100 text-stone-500 rounded-2xl font-medium active:scale-95 transition-all"
            >
              No estoy de acuerdo
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineProps<{
  show: boolean
}>()

defineEmits(['confirm', 'close'])
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
