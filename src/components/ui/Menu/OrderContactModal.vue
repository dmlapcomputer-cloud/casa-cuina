<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog as="div" @close="emit('dismiss')" class="relative z-[210]">

      <TransitionChild
        as="template"
        enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
        leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-stone-900/50 backdrop-blur-[2px]" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-start sm:items-center justify-center p-4 pt-6">
        <TransitionChild
          as="template"
          enter="duration-400 cubic-bezier(0.16, 1, 0.3, 1)"
          enter-from="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:scale-95"
        >
          <DialogPanel class="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-100 my-auto max-h-[90vh] overflow-y-auto">

            <!-- Header -->
            <div class="px-8 pt-5 pb-2 text-center space-y-1">
              <DialogTitle class="font-serif italic text-2xl text-stone-900 leading-tight">
                Datos del pedido
              </DialogTitle>
              <p class="text-stone-400 text-[12px]">Ingresá tus datos para confirmar</p>
            </div>

            <!-- Resumen del producto -->
            <div class="mx-8 mt-4 bg-stone-50 rounded-2xl px-4 py-3 flex items-center justify-between border border-stone-100">
              <div class="flex flex-col min-w-0">
                <span class="text-[11px] font-bold text-stone-800 truncate">{{ productName }}</span>
                <span class="text-[10px] text-stone-400 mt-0.5">{{ portionLabel }}</span>
              </div>
              <span class="font-serif italic font-bold text-primary text-[15px] shrink-0 ml-3">
                {{ price }}
              </span>
            </div>

            <!-- Formulario -->
            <div class="px-8 pt-5 pb-2 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BookingInput
                  v-model="form.customer_name"
                  label="Nombre completo"
                  placeholder="Tu nombre"
                  :error="errors.customer_name"
                  required
                  :max-characters="50"
                  @update:modelValue="errors.customer_name = ''"
                />
                <BookingInput
                  v-model="form.customer_phone"
                  label="Celular"
                  placeholder="Ej: 70000000"
                  type="tel"
                  :error="errors.customer_phone"
                  required
                  @update:modelValue="errors.customer_phone = ''"
                />
              </div>
              <!-- Fecha requerida -->
              <div class="w-full space-y-1">
                <label class="text-[8px] font-black uppercase tracking-[0.4em] text-stone-400 block">
                  Fecha requerida <span class="text-primary">*</span>
                </label>
                <DateStepper
                  :model-value="form.required_date"
                  @update:modelValue="(val) => { form.required_date = val ?? ''; errors.required_date = '' }"
                  :block-mondays="true"
                  :anticipation-hours="anticipationHours ?? 0"
                />
                <p v-if="errors.required_date" class="text-[9px] text-red-500 font-bold uppercase tracking-tighter">
                  {{ errors.required_date }}
                </p>
              </div>
              <!-- Hora requerida -->
              <div class="w-full space-y-1">
                <label class="text-[8px] font-black uppercase tracking-[0.4em] text-stone-400 block">
                  Hora de entrega <span class="text-primary">*</span>
                </label>
                <div class="w-full">
                  <TimeStepper
                    :model-value="form.required_time"
                    :selected-date="form.required_date"
                    :anticipation-hours="anticipationHours"
                    :max-hour="23"
                    layout="horizontal"
                    @update:modelValue="(val) => { form.required_time = val ?? ''; errors.required_time = '' }"
                  />
                </div>
                <p v-if="errors.required_time" class="text-[9px] text-red-500 font-bold uppercase tracking-tighter">
                  {{ errors.required_time }}
                </p>
              </div>
            </div>

            <!-- Acciones -->
            <div class="px-6 pb-8 pt-3 flex flex-col sm:flex-row-reverse gap-3">
              <BaseButton
                label="Confirmar pedido"
                variant="confirm"
                block
                :loading="loading"
                loading-label="Guardando..."
                @click="handleSubmit"
              />
              <BaseButton
                label="Cancelar"
                variant="ghost"
                block
                @click="emit('dismiss')"
              />
            </div>

          </DialogPanel>
        </TransitionChild>
      </div>

    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import BookingInput from '@/components/booking/BookingInput.vue'
import DateStepper from '@/components/booking/DateStepper.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { OrderService } from '@/services/Menu/orderService'
import TimeStepper from '@/components/booking/TimeStepper.vue'
import { toast } from 'vue-sonner'

const props = defineProps<{
  isOpen: boolean
  productName: string
  portionLabel: string
  price: string
  productId: number
  menuType: string
  anticipationHours?: number
}>()

const emit = defineEmits<{
  (e: 'confirm', data: { name: string; phone: string }): void
  (e: 'dismiss'): void
}>()

const loading = ref(false)

const form = ref({ customer_name: '', customer_phone: '', required_date: '', required_time: '' })
const errors = ref({ customer_name: '', customer_phone: '', required_date: '', required_time: '' })

watch(() => props.isOpen, (val) => {
  if (val) {
    form.value = { customer_name: '', customer_phone: '', required_date: '', required_time: '' }
    errors.value = { customer_name: '', customer_phone: '', required_date: '', required_time: '' }
  }
})

const validate = () => {
  errors.value = { customer_name: '', customer_phone: '', required_date: '', required_time: '' }
  let valid = true
  if (!form.value.customer_name.trim()) {
    errors.value.customer_name = 'El nombre es requerido'
    valid = false
  }
  if (!form.value.customer_phone.trim() || form.value.customer_phone.length < 7) {
    errors.value.customer_phone = 'Ingresá un teléfono válido'
    valid = false
  }
  if (!form.value.required_date) {
    errors.value.required_date = 'La fecha es requerida'
    valid = false
  }
  if (!form.value.required_time) {
    errors.value.required_time = 'La hora es requerida'
    valid = false
  }
  return valid
}

const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const numericPrice = Number(props.price.replace(/[^0-9]/g, '')) || 0
    await OrderService.createOrder({
      customer_name: form.value.customer_name,
      customer_phone: `${form.value.customer_phone}`,
      menu_type: props.menuType,
      required_date: form.value.required_date,
      required_time: form.value.required_time,
      items: [{
        product_id: props.productId,
        price: numericPrice,
        quantity: 1,
        note: props.portionLabel
      }]
    })
    toast.success('¡Pedido registrado!', {
      description: `Tu pedido de ${props.productName} fue confirmado. Te contactaremos pronto.`
    })
    emit('confirm', { name: form.value.customer_name, phone: form.value.customer_phone })
  } catch {
    toast.error('No se pudo registrar el pedido', {
      description: 'Verificá tu conexión e intentá de nuevo.'
    })
  } finally {
    loading.value = false
  }
}
</script>

