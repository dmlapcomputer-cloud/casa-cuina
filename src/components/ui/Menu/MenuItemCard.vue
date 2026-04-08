<template>
  <div class="group flex flex-row md:flex-col bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-stone-100 transition-all duration-500 h-full">

    <div class="relative w-32 h-auto md:w-full md:aspect-[4/3] overflow-hidden bg-stone-50 shrink-0">
      <div v-if="deliveryTime" class="absolute top-2 left-2 md:top-3 z-30">
        <DeliveryBadge :time="deliveryTime" />
      </div>
      <MenuItemImagen
        :images="[item.image_url, ...(item.images_json || [])]"
        :alt="item.name"
      />
    </div>

    <div class="p-3 md:p-5 flex flex-col flex-grow min-w-0">
      <h4 class="font-serif text-[15px] md:text-[22px] italic text-stone-800 leading-tight mb-1 md:mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2">
        {{ item.name }}
      </h4>

      <p
        class="font-sans text-stone-500 text-[11px] md:text-[14px] leading-relaxed mb-3 md:mb-5 flex-grow"
        v-html="cleanDescription(item.description)"
      ></p>

      <PriceSizeSelector
        v-if="priceOptions.length"
        :options="priceOptions"
        v-model="seleccionado"
      />

      <WhatsAppButton
        v-if="priceOptions.length"
        class="mt-2 md:mt-4"
        :label="seleccionado !== null ? 'Realizar Pedido' : ''"
        placeholder="Selecciona un tamaño"
        :disabled="seleccionado === null"
        @click="showDecisionModal = true"
      />
    </div>
  </div>

  <!-- Modal de decisión: reservar o pagar directo -->
  <OrderDecisionModal
    :is-open="showDecisionModal"
    :product-name="item.name"
    :portion-label="selectedOption?.size ?? ''"
    :price="selectedOption?.price ?? ''"
    @reserve="handleReserve"
    @pay="openContactModal"
    @dismiss="showDecisionModal = false"
  />

  <!-- Modal de contacto para pago directo -->
  <OrderContactModal
    :is-open="showContactModal"
    :product-name="item.name"
    :portion-label="selectedOption?.size ?? ''"
    :price="selectedOption?.price ?? ''"
    :product-id="item.id"
    :menu-type="item.category?.name ?? 'Tortas'"
    :anticipation-hours="item.min_prep_hours ?? 0"
    @confirm="handleDirectPay"
    @dismiss="showContactModal = false"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Product } from '@/types/Menu/Menu-interface'
import MenuItemImagen from './MenuItemImagen.vue'
import DeliveryBadge from './DeliveryBadge.vue'
import PriceSizeSelector from './PriceSizeSelector.vue'
import WhatsAppButton from './WhatsAppButton.vue'
import OrderDecisionModal from './OrderDecisionModal.vue'
import OrderContactModal from './OrderContactModal.vue'
import { useSystemSettings } from '@/composables/useSystemSettings'

const { qrCodeUrl } = useSystemSettings()
const router = useRouter()

const props = defineProps<{ item: Product }>()

const seleccionado = ref<number | null>(null)
const showDecisionModal = ref(false)
const showContactModal = ref(false)

const openContactModal = () => {
  showDecisionModal.value = false
  showContactModal.value = true
}

const selectedOption = computed(() =>
  seleccionado.value !== null ? priceOptions.value[seleccionado.value] : null
)

const waNumber = computed(() => {
  const raw ='59162153126'
  const clean = raw.replace(/\D/g, '')
  return clean.startsWith('591') ? clean : `591${clean}`
})

// Opción 1: ir al flujo de reserva con el producto pre-cargado como nota
const handleReserve = () => {
  showDecisionModal.value = false
  router.push({ path: '/reservation', state: {
    cake: {
      product_id: props.item.id,
      name: props.item.name,
      image_url : props.item.image_url,
      size: selectedOption.value?.size,
      price: selectedOption.value?.price,
      min_prep_hours: props.item.min_prep_hours
    }
  } })
}

// Opción 2: pago directo — recibe nombre y teléfono del modal de contacto
const handleDirectPay = (contact: { name: string; phone: string }) => {
  showContactModal.value = false
  const option = selectedOption.value
  seleccionado.value = null
  if (!option) return

  const qrLine = qrCodeUrl.value
    ? `\n\n🔳 *QR de pago:*\n${qrCodeUrl.value}`
    : ''

  const msg = encodeURIComponent(
    `Hola! Soy *${contact.name}* y quiero realizar el pago de:\n\n` +
    `🎂 *${props.item.name}*\n` +
    `📦 *Porción:* ${option.size}\n` +
    `💰 *Total:* ${option.price}\n` +
    `📞 *Tel:* ${contact.phone}` +
    qrLine
  )
  window.open(`https://wa.me/${waNumber.value}?text=${msg}`, '_blank')
}

const cleanDescription = (html: string) => {
  if (!html) return ''
  return html.split('<ul>')[0]?.replace(/<[^>]*>?/gm, '').trim() || ''
}

const priceOptions = computed(() => {
  if (!props.item.description) return []
  const div = document.createElement('div')
  div.innerHTML = props.item.description
  const listItems = div.querySelectorAll('li')
  return Array.from(listItems).map(li => {
    const text = li.textContent || ''
    if (text.includes('Bs.')) {
      const parts = text.split(/Bs\./)
      return { size: parts[0]?.replace(':', '').trim() || '', price: `Bs. ${parts[1]?.trim()}` }
    }
    return { size: text, price: '' }
  })
})

const deliveryTime = computed((): string | null => {
  const hours = props.item.min_prep_hours
  if (!hours) return null
  return hours >= 24 ? `${hours}h` : `${hours}h`
})

</script>
