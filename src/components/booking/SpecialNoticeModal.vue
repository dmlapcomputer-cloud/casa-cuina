<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog as="div" @close="$emit('cancel')" class="relative z-[160]">
      <TransitionChild
        as="template"
        enter="duration-500 ease-out" enter-from="opacity-0" enter-to="opacity-100"
        leave="duration-300 ease-in" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-stone-900/60 backdrop-blur-[2px]" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
          enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100"
          leave="duration-300 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95"
        >
          <DialogPanel class="w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl border border-stone-100 text-center">
            <div class="mb-6">
              <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="lucide:info" class="w-8 h-8 text-primary" />
              </div>
              <span class="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-2 block">Aviso Importante</span>
              <DialogTitle as="h3" class="font-serif italic text-2xl text-stone-800">
                Condiciones del Salón
              </DialogTitle>
            </div>

            <div class="space-y-4 mb-8">
              <p class="text-stone-500 text-sm leading-relaxed">
                Esta experiencia tiene un costo de reserva de <span class="font-bold text-stone-800">Bs. 300</span> y requiere un mínimo de <span class="font-bold text-stone-800">24 horas</span> de anticipación.
              </p>
              <p class="text-stone-400 text-xs italic">
                ¿Desea proceder a ajustar su fecha y horario?
              </p>
            </div>

            <div class="flex flex-col gap-3">
              <button
                @click="$emit('confirm')"
                class="w-full py-4 bg-primary text-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Sí, continuar
              </button>
              <button
                @click="$emit('cancel')"
                class="w-full py-3 text-stone-400 hover:text-stone-600 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors"
              >
                No, volver
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import { Icon } from '@iconify/vue';

defineProps<{ isOpen: boolean }>();
defineEmits(['confirm', 'cancel']);
</script>
