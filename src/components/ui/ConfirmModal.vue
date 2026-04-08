<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog as="div" @close="emit('dismiss')" class="relative z-[200]">

      <TransitionChild
        as="template"
        enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
        leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-stone-900/50 backdrop-blur-[2px]" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-end sm:items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="duration-400 cubic-bezier(0.16, 1, 0.3, 1)"
          enter-from="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:scale-95"
        >
          <DialogPanel class="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100">


            <div class="px-8 pt-6 pb-4 text-center space-y-2">
              <DialogTitle class="font-serif italic text-2xl text-stone-900 leading-tight">
                {{ title }}
              </DialogTitle>
              <p v-if="description" class="text-stone-500 text-[13px] leading-relaxed">
                {{ description }}
              </p>
            </div>

            <!-- Slot para contenido extra -->
            <div v-if="$slots.default" class="px-8 pb-4">
              <slot />
            </div>

            <!-- Acciones -->
            <div class="px-6 pb-8 pt-2 flex flex-col gap-3">
              <BaseButton
                :label="confirmLabel"
                variant="confirm"
                block
                @click="emit('confirm')"
              />
              <BaseButton
                :label="cancelLabel"
                variant="ghost"
                block
                @click="emit('cancel')"
              />
            </div>

          </DialogPanel>
        </TransitionChild>
      </div>

    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import BaseButton from '@/components/ui/BaseButton.vue'

withDefaults(defineProps<{
  isOpen: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
}>(), {
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'dismiss'): void
}>()
</script>
