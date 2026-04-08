<template>
  <div class="w-full flex flex-col h-full overflow-hidden relative">

    <LoadingOverlay
      :active="isSubmitting"
      message=""
    />

    <Transition
      mode="out-in"
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-300 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="!isFinished" key="stepper-form" class="flex flex-col h-full">
        <header class="mb-4 shrink-0">
          <div class="flex justify-between items-end px-1">
            <h2 class="text-[16px] md:text-lg text-stone-900 uppercase tracking-[0.3em] font-bold">
              {{ stepTitle }}
            </h2>
            <span class="font-serif font-bold italic text-lg text-primary">
              {{ activeStep }}
              <span class="text-stone-600 text-[12px] font-sans not-italic ml-1">/ 7</span>
            </span>
          </div>
          <div class="h-[5px] w-full bg-stone-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary transition-all duration-700 ease-in-out"
              :style="{ width: (activeStep / 7 * 100) + '%' }"
            ></div>
          </div>
        </header>

        <div class="flex-grow py-2 md:py-4 overflow-y-auto custom-scrollbar">
          <div v-if="activeStep === 1" class="animate-in fade-in slide-in-from-right-4">
            <EventTypeSelector v-model="form.eventType" :items="eventType" :show-brunch="true" @update:model-value="autoNext(2)" />
          </div>

          <div v-if="activeStep === 2" class="animate-in fade-in slide-in-from-right-4 py-10">
            <GuestStepper
              v-model="form.guests"
              :min="Number(selectedEventType?.starting_quantity || 1)"
              :max="Number(selectedEventType?.ending_quantity || 100)"
              :step="10"
              :key="form.eventType"
            />
          </div>

          <div v-if="activeStep === 3" class="animate-in fade-in slide-in-from-right-4">
            <DateStepper v-model="form.date"
              :show-saturday-label="false"
              :show-friday-label="false"
              :closed-dates="[{ date: '2026-03-22', reason: 'Cerrado por Elecciones' }]"
              @update:model-value="autoNext(4)" />
          </div>

          <div v-if="activeStep === 4" class="animate-in fade-in slide-in-from-right-4 py-6">
            <TimeRangePicker
              :key="form.date"
              v-model:startTime="form.startTime"
              v-model:endTime="form.endTime"
              :selected-date="form.date || ''"
            />
          </div>

          <div v-if="activeStep === 5" class="py-4 animate-in fade-in slide-in-from-right-4">
            <RequerimientSelector
              v-model="form.needsEquipment"
              @update:modelValue="handleAutomaticNavigation"
            />
          </div>

          <div v-if="activeStep === 6" class="py-4 animate-in fade-in slide-in-from-right-4">
            <EquipmentGrid
              v-model:selectedScreen="form.selectedScreen"
              v-model:equipmentQuantities="form.equipmentQuantities"
              :api-items="equipamentItem"
            />
          </div>

          <div v-if="activeStep === 7" class="py-4 animate-in fade-in slide-in-from-right-4">
            <ContactStep
              v-model:name="form.name"
              v-model:phone="form.phone"
              v-model:note="form.note"
              :name-error="nameError"
              :phone-error="phoneError"
            />
          </div>
        </div>

        <footer class="mt-auto pt-6 border-t border-stone-100 flex justify-between items-center shrink-0 bg-white/80 backdrop-blur-sm">
          <div class="min-w-[100px]">
            <button v-if="activeStep === 1" @click="goBackToHome" class="back-link group">
              <Icon icon="lucide:chevron-left" class="w-4 h-4 transition-transform group-hover:rotate-90" />
              Volver
            </button>
            <button v-if="activeStep > 1 && !isSubmitting" @click="handleBack" class="back-link">
              <Icon icon="lucide:chevron-left" class="w-4 h-4" />
              Volver
            </button>
          </div>

          <div class="flex justify-end">
            <button
              v-if="activeStep !== 1 && activeStep!==3 && activeStep !==5"
              @click="handleStepAction"
              :disabled="!isStepValid || isSubmitting"
              :class="[activeStep === 7 ? 'btn-confirm' : 'btn-next']"
            >
              <template v-if="isSubmitting">
                <span>Procesando...</span>
              </template>
              <template v-else>
                <span>{{ activeStep === 7 ? 'Cotizar' : 'Siguiente' }}</span>
                <Icon v-if="activeStep < 7" icon="lucide:arrow-right" class="w-4 h-4 ml-2" />
              </template>
            </button>
          </div>
        </footer>
      </div>

      <EventoCotizacionView
        v-else
        key="success-view"
        :name="form.name"
        :event-data="lastEventResponse"
        @reset="resetStepper"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Icon } from '@iconify/vue'

// Import de componentes
import DateStepper from '../booking/DateStepper.vue'
import TimeRangePicker from '../ui/TimeRangePicker.vue'
import EventTypeSelector from '../ui/Events/EventTypeSelector.vue'
import EquipmentGrid from './EquipmentGrid.vue'
import ContactStep from './ContactStep.vue'
import GuestStepper from '../booking/GuestStepper.vue'
import EventoCotizacionView from '../layout/EventoCotizacionView.vue'
import RequerimientSelector from '../ui/RequerimientSelector.vue'
import LoadingOverlay from '../ui/LoadingOverlay.vue'
// Servicios y Composable
import { EventServices } from '@/services/Events/eventService'
import { useEventStepper } from '@/composables/Events/useEventStepper'
import type { EventBookingResponse } from '@/types/Events/Event-Create'

// Desestructuración del Composable
const {
  form,
  activeStep,
  isSubmitting,
  isFinished,
  isStepValid,
  eventType,
  equipamentItem,
  handleConfirm,
  //loadPersistedData,
  //persistData,
  resetStepper,
  nameError,
  phoneError,
  lastApiResponse,
  autoNext
} = useEventStepper()

const router = useRouter()
const lastEventResponse = ref<EventBookingResponse | null>(null)

/**
 * Títulos dinámicos según el paso activo.
 */
const stepTitle = computed(() => {
  const titles = [
    '',
    'Paso 1',
    'Paso 2',
    'Paso 3',
    'Paso 4',
    'Paso 5',
    'Paso 6',
    'Paso 7'
  ]
  return titles[activeStep.value]
});

/**
 * Carga inicial de datos de la API y persistencia.
 */
onMounted(async () => {
  //loadPersistedData() //si descomentas esto cuando des click en el boton del celualr atras se va guardar los datos en sessionstorage por eso lo comente para que no haga eso
  //persistData()

  try {
    const [types, equipament] = await Promise.all([
      EventServices.getEventTypes(),
      EventServices.getEquipmentCheck(),
    ])
    eventType.value = types
    equipamentItem.value = equipament
  } catch (error) {
    console.error('Error cargando datos iniciales', error)
    toast.error('Error al cargar opciones de eventos')
  }
})

/**
 * Maneja la acción del botón principal (Siguiente o Confirmar).
 */
const handleStepAction = async () => {
  if (activeStep.value < 7) {
    activeStep.value++;
  } else {
    await onConfirmClick();
  }
}

/**
 * Lógica de retroceso. Considera el salto del paso 6 si no se requería equipo.
 */
const handleBack = () => {
  if (activeStep.value === 7 && form.value.needsEquipment === false) {
    activeStep.value = 5;
    form.value.needsEquipment = null;
  } else if (activeStep.value > 1) {
    activeStep.value--;
    // Solo limpia eventType si regresamos al paso 1
    if (activeStep.value === 1) {
      form.value.eventType = ''
    }

    if (activeStep.value === 5) {
      form.value.needsEquipment = null;
    }
  }
}

/**
 * Acción final: Envía la cotización validando con VeeValidate.
 */
const onConfirmClick = async () => {
  // Limpieza preventiva si el usuario retrocedió y cambió de opinión
  if (!form.value.needsEquipment) {
    form.value.selectedScreen = null
    form.value.equipmentQuantities = []
  }

  // Ejecución del guardado (envuelto en handleSubmit internamente)
  await handleConfirm()

  // Verificación de respuesta exitosa
  if (lastApiResponse.value) {
    lastEventResponse.value = lastApiResponse.value
  } else {
    // Solo mostramos error general si la validación de Yup pasó (para no saturar)
    if (!nameError.value && !phoneError.value) {
      toast.error('No se pudo guardar la cotización. Intente nuevamente.')
    }
  }
}

/**
 * Regresa al home y limpia el estado.
 */
const goBackToHome = () => {
  resetStepper()
  router.push('/')
}

/**
 * Navegación automática para el selector de Requerimientos (Paso 5).
 */
const handleAutomaticNavigation = (value: boolean | null) => {
  if (value === true) {
    activeStep.value = 6 // Ir a la grilla de equipos
  } else if (value === false) {
    activeStep.value = 7 // Ir directo a contacto
  }
}

/**
 * Sincroniza la cantidad inicial de invitados según el tipo de evento.
 */
watch(() => form.value.eventType, (newEvent) => {
  const details = eventType.value.find(item => item.type === newEvent);
  if (details) {
    form.value.guests = Number(details.starting_quantity) || 1;
  }
});

/**
 * Obtiene el objeto del tipo de evento seleccionado.
 */
const selectedEventType = computed(() => {
  if (!eventType.value || !form.value.eventType) return null;
  return eventType.value.find(item => item.type === form.value.eventType)
})

// Calcula el total de módulos de pantalla seleccionados
// para determinar si el sonido debe incluirse automáticamente
/*const totalModulosPantallas = computed(() => {
  const screenSizes = [
    { name: '0.5 x 1 m', consumo: 1 },
    { name: '1 x 2 m',   consumo: 4 },
    { name: '1 x 1 m',   consumo: 2 },
    { name: '2 x 1 m',   consumo: 4 },
    { name: '2 x 2 m',   consumo: 8 },
    { name: '3 x 2 m',   consumo: 12 },
  ]
  return form.value.equipmentQuantities.reduce((acc, curr) => {
    const size = screenSizes.find(s => `Pantalla ${s.name}` === curr.name)
    return acc + (size ? size.consumo * curr.quantity : 0)
  }, 0)
})*/

// Agrega/quita Sistemas de Sonido automáticamente según pantallas seleccionadas
/*watch(totalModulosPantallas, (total) => {
  const SONIDO_ID = 2
  const yaTiene = form.value.equipmentQuantities.some(e => e.id === SONIDO_ID)
  if (total >= 1 && !yaTiene) {
    form.value.equipmentQuantities = [
      ...form.value.equipmentQuantities, { id: SONIDO_ID, quantity: 1 }
    ]
  } else if (total < 1 && yaTiene) {
    form.value.equipmentQuantities = form.value.equipmentQuantities.filter(e => e.id !== SONIDO_ID)
  }
})*/
</script>

<style scoped>
/* Scrollbar personalizado para el contenedor de pasos */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
</style>
