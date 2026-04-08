<template>
  <div class="w-full max-w-3xl mx-auto">
    <!-- Contenedor Flex para los inputs superiores -->
    <div class="flex flex-col md:flex-row gap-0 md:gap-6">
      <BookingInput
        v-model="localName"
        label="Nombre Completo"
        placeholder="Ej. Juan Pérez"
        class="flex-1"
        required
        :error="nameError"
        onlyLetters
      />

      <BookingInput
        v-model="localPhone"
        label="Celular"
        placeholder="Ingrese su número"
        class="flex-1"
        type="tel"
        required
        :error="phoneError"
      />
    </div>

    <!-- El textarea ocupa el ancho total por defecto -->
    <BookingInput
      v-model="localNote"
      label="Nota Especial u Observación"
      type="textarea"
      placeholder="Cuéntanos si necesitas algo específico para el montaje..."
      :max-characters="255"

    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BookingInput from '@/components/booking/BookingInput.vue'

const props = defineProps<{
  name: string
  phone: string
  note: string,
  nameError?:string,
  phoneError?: string
}>()

const emit = defineEmits<{
  (e: 'update:name', value: string): void
  (e: 'update:phone', value: string): void
  (e: 'update:note', value: string): void
}>()

const localName = computed({
  get: () => props.name,
  set: (val: string) => emit('update:name', val)
})

const localPhone = computed({
  get: () => props.phone,
  set: (val: string) => emit('update:phone', val)
})

const localNote = computed({
  get: () => props.note,
  set: (val: string) => emit('update:note', val)
})
</script>
