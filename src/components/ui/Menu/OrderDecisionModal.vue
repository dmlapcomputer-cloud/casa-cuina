<template>
  <ConfirmModal
    :is-open="isOpen"
    title="¿Cómo deseas continuar?"
    description="Puedes reservar una mesa o ir directamente al pago."
    confirm-label="Incluir en una Reserva"
    cancel-label="Solo pagar ahora"
    icon="lucide:shopping-bag"
    variant="default"
    @confirm="emit('reserve')"
    @cancel="emit('pay')"
    @dismiss="emit('dismiss')"
  >
    <!-- Detalle del producto seleccionado -->
    <div class="bg-stone-50 rounded-2xl px-4 py-3 flex items-center justify-between border border-stone-100">
      <div class="flex flex-col min-w-0">
        <span class="text-[11px] font-bold text-stone-800 truncate">{{ productName }}</span>
        <span class="text-[10px] text-stone-400 mt-0.5">{{ portionLabel }}</span>
      </div>
      <span class="font-serif italic font-bold text-primary text-[15px] shrink-0 ml-3">
        {{ price }}
      </span>
    </div>
  </ConfirmModal>
</template>

<script setup lang="ts">
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

defineProps<{
  isOpen: boolean
  productName: string
  portionLabel: string
  price: string
}>()

const emit = defineEmits<{
  (e: 'reserve'): void
  (e: 'pay'): void
  (e: 'dismiss'): void
}>()
</script>
