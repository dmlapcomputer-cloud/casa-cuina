<template>
  <div class="min-h-screen bg-[#F9F8F6] font-sans antialiased flex flex-col items-center p-4 py-8">
    <LoadingOverlay :active="isSubmitting" />
    <div class="fixed inset-0 z-0">
      <div class="h-full w-full bg-cover bg-center animate-ken-burns"
        :style="{ backgroundImage: `url('${backgroundUrl}')` }">
      </div>
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
    </div>
    <div
      class="w-full max-w-3xl bg-white backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(194,123,46,0.08)] flex flex-col border border-[#E5E1DA]">

      <header class="pt-8 pb-4 flex flex-col text-center shrink-0">
        <div class="w-full max-w-[280px] md:max-w-[320px] px-6 mx-auto">
          <img :src="logoUrl" alt="Logo" class="w-full h-auto object-contain brightness-0" />
        </div>
        <div class="mt-2">
          <h2 class="font-display text-[20px] md:text-[24px] uppercase tracking-[0.3em] text-stone-800 opacity-90">
            Buffet Brunch
          </h2>
        </div>
      </header>

      <div class="px-4 md:px-4 pb-8 flex-1 flex flex-col">
        <Transition mode="out-in" enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100"
          leave-to-class="opacity-0 -translate-y-4">
          <div v-if="!isFinished" key="form-view">
            <header class="mb-4 shrink-0 px-2">
              <div class="flex justify-between items-end px-1 mb-2">
                <h2 class="text-[16px] md:text-lg text-stone-900 uppercase tracking-[0.3em] font-bold">
                  {{ currentStepTitle }}
                </h2>
                <span class="font-serif font-bold italic text-lg text-primary">
                  {{ activeStep + 1 }}
                  <span class="text-stone-600 text-[12px] font-sans not-italic ml-1">/ 6</span>
                </span>
              </div>
              <div class="h-[5px] w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(194,123,46,0.3)]"
                  :style="{ width: ((activeStep + 1) / 6 * 100) + '%' }"></div>
              </div>
            </header>
            <Stepper v-model:value="activeStep">


              <div class="min-h-0 flex flex-col items-center">
                <StepPanels class="w-full">
                  <StepPanel :value="1" class="animate-content">
                    <EventTypeSelector v-model="form.event" :items="typeAcontecimiento"
                      @update:model-value="autoNext(2)" />
                  </StepPanel>
                  <StepPanel :value="2" class="animate-content mt-5">
                    <DateStepper v-model="(form.date as any)" @update:modelValue="autoNext(3)" inline
                      :only-saturdays="!isException" :show-saturday-label="false"
                      :closed-dates="[{ date: '2026-03-22', reason: 'Cerrado por Elecciones' }]" />
                  </StepPanel>
                  <StepPanel :value="3" class="animate-content mt-5">
                    <TimeStepper v-if="!isException" v-model="form.start_time" :selected-date="form.date || null"
                      :min-hour="9" :max-hour="12" @update:modelValue="autoNext(5)" />
                    <TimeRangePicker v-else :key="form.date" v-model:startTime="form.start_time"
                      v-model:endTime="form.end_time" :selected-date="form.date" :minHour="timeLimits.min"
                      :maxHour="timeLimits.max" :durationHours="stayDuration" />
                  </StepPanel>
                  <StepPanel :value="4" class="animate-content mt-5">
                    <GuestStepper :key="form.date" v-model="form.guests" :min="minGuest"
                      :max="settings?.max_capacity || 100" :step="stepValue" />
                  </StepPanel>
                  <StepPanel :value="5" class="animate-content mt-5">
                    <RequerimientSelector
                      v-model="form.needsEquiment"
                      @update:modelValue="handleEquipmentNavigation"
                    />
                  </StepPanel>
                  <StepPanel :value="6" class="animate-content mt-5">
                    <EquipmentGrid
                      :selected-screen="null"
                      v-model:equipmentQuantities="equipmentQuantities"
                      :api-items="equipamentItem"
                    />
                  </StepPanel>
                  <StepPanel :value="7" class="animate-content mt-5">
                    <div class="w-full max-w-2xl mx-auto">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                        <div class="col-span-1">
                          <BookingInput v-model="form.customer.name" label="Nombre Completo"
                            placeholder="Ej. Juan Pérez" required />
                        </div>
                        <div class="col-span-1">
                          <BookingInput v-model="form.customer.phone" label="Celular" placeholder="Ingrese su número" type="tel"
                            required default-country="BO" />
                        </div>
                        <div class="md:col-span-2 mt-4">
                          <BookingInput v-model="form.customer.note" label="Nota Especial (opcional)" type="textarea"
                            placeholder="¿Algún detalle adicional?" :max-characters="255" />
                        </div>
                      </div>
                    </div>
                  </StepPanel>
                </StepPanels>
              </div>
            </Stepper>

            <footer class="mt-8 flex items-center justify-between w-full border-t border-[#E5E1DA] pt-6">
              <div class="min-w-[100px]">
                <button v-if="activeStep === 1" @click="goBackToHome" class="back-link group">
                  <Icon icon="lucide:chevron-left" class="w-4 h-4 transition-transform group-hover:rotate-90" />
                  Volver
                </button>
                <button v-if="activeStep > 1" @click="handleBackStep" class="back-link">
                  <Icon icon="lucide:chevron-left" class="w-4 h-4" /> Volver
                </button>
              </div>

              <div class="flex justify-end">
                <button v-if="shouldShowNextButton" @click="activeStep++" :disabled="!isStepValid" class="btn-next">
                  <span class="text-label uppercase tracking-[0.2em] text-[10px] font-bold">
                    {{ actionButtonlabel }}
                  </span>
                  <Icon icon="lucide:arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button v-if="activeStep === 7" @click="handleConfirmBooking" class="btn-confirm">
                  {{ isSubmitting ? '' : 'Buffet Brunch' }}
                  <Icon v-if="isSubmitting" icon="lucide:loader-2" class="animate-spin w-4 h-4" />
                </button>
              </div>
            </footer>
          </div>

          <BrunchSuccessView v-else key="success-view" :response="lastResponse" @reset="resetStepper" />
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import Stepper from 'primevue/stepper'
import StepPanels from 'primevue/steppanels'
import StepPanel from 'primevue/steppanel'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'

import GuestStepper from '@/components/booking/GuestStepper.vue'
import DateStepper from '@/components/booking/DateStepper.vue'
import TimeStepper from '@/components/booking/TimeStepper.vue'
import BookingInput from '@/components/booking/BookingInput.vue'
import EventTypeSelector from '@/components/ui/Events/EventTypeSelector.vue'
import BrunchSuccessView from '@/components/layout/BrunchSuccessView.vue'
import RequerimientSelector from '@/components/ui/RequerimientSelector.vue'
import EquipmentGrid from '@/components/event/EquipmentGrid.vue'
import { EventServices } from '@/services/Events/eventService'
import type { EquipamentItem, ILedScreens, SelectedQty } from '@/types/Events/EquipamentItem'
import type { CheckListItem } from '@/types/Events/Event-Create'

import type { EventType } from '@/types/Events/events-type'
import { AcontecimientoService } from '@/services/Events/buffetBranchService'
import type { BrunchCreateRequest, BrunchResponse } from '@/types/Buffet/Brunch'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import TimeRangePicker from '@/components/ui/TimeRangePicker.vue'
import { useSystemSettings } from '@/composables/useSystemSettings'
import axios from 'axios'

const activeStep = ref(1)
const isSubmitting = ref(false)
const isFinished = ref(false)
const router = useRouter()
const typeAcontecimiento = ref<EventType[]>([])
const lastResponse = ref<BrunchResponse | null>(null)
const equipamentItem = ref<EquipamentItem[]>([])
const equipmentQuantities = ref<SelectedQty[]>([])
const EquipamientLeds = ref<ILedScreens[]>([])
const {
  settings,
  logoUrl,
  backgroundUrl,
  fetchSettings,
  getRuleByDate,
  minBookingAdvance
} = useSystemSettings();

const form = ref<BrunchForm>({
  guests: 0,
  date: '',
  start_time: '',
  end_time: '',
  event: '',
  customer: {
    name: '',
    phone: '',
    note: ''
  },
  needsEquiment: null
})

const autoNext = (next: number) => {
  setTimeout(() => { activeStep.value = next }, 700)
}


const isStepValid = computed(() => {
  if (activeStep.value === 1) return !!form.value.event;
  if (activeStep.value === 2) return !!form.value.date;
  if (activeStep.value === 3) return !!form.value.start_time;
  if (activeStep.value === 4) return !!form.value.guests;
  if (activeStep.value === 5) return form.value.needsEquiment !== null;
  if (activeStep.value === 6) return true; // equipamiento es opcional
  // ✅ CORREGIDO PASO 7:
  // Ahora aceptamos números internacionales (ej. +591700... o +34...)
  // Verificamos que tenga al menos el código de país (+ y 3 dígitos) y el nombre sea válido.
  if (activeStep.value === 7) {
    const isNameValid = form.value.customer.name.length > 2;
    // Validamos que el teléfono tenga un formato internacional básico (+ seguido de números)
    // 9 es una longitud segura mínima (ej. +591700...)
    const isPhoneValid = form.value.customer.phone.length >= 9 && form.value.customer.phone.startsWith('+');
    
    return isNameValid && isPhoneValid;
  }
  return false;
})

const handleConfirmBooking = async () => {
  if (!isStepValid.value || isSubmitting.value) return
  isSubmitting.value = true
  try {
    const payload: BrunchCreateRequest = {
      name: form.value.customer.name,
      phone: `${form.value.customer.phone}`,
      amount: form.value.guests,
      service_type: form.value.event,
      date_branch: form.value.date,
      start_time: form.value.start_time?.length === 5 ? `${form.value.start_time}:00` : form.value.start_time,
      end_time: form.value.end_time?.length === 5 ? `${form.value.end_time}:00` : form.value.end_time,
      price: 50.00,
      note: form.value.customer.note,
      check_list: form.value.needsEquiment ? buildCheckList() : [],
    }

    const response = await AcontecimientoService.storeBrunch(payload)
    lastResponse.value = response
    sessionStorage.setItem('brunch_finished', 'true')
    const persistenData = {
      ...response.data,
      saved_send_wp: response.send_wp
    }
    sessionStorage.setItem('brunch_res_data', JSON.stringify(persistenData))
    isFinished.value = true
  } catch (error) {
    let errorMessage = "No se pudo guardar la reserva. Revisa tu conexión."

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 422) {
        errorMessage = "Los datos son inválidos o este horario ya no tiene cupos disponibles."
      } else if (error.response?.status === 500) {
        errorMessage = "Hubo un error en el servidor del Buffet. Por favor, intenta confirmar nuevamente."
      }
    }

    toast.error("Error en la reserva de Buffet Brunch", {
      description: errorMessage,
      duration: 5000
    })
  } finally {
    isSubmitting.value = false
  }
}

const resetStepper = () => {
  sessionStorage.removeItem('brunch_finished')
  sessionStorage.removeItem('brunch_res_data')
  isFinished.value = false
  activeStep.value = 1
  form.value = {
    guests: 0,
    date: undefined,
    start_time: '',
    end_time: '',
    event: '',
    customer: { name: '', phone: '', note: '' },
    needsEquiment: null as boolean | null
  }
}

interface BrunchForm {
  guests: number;
  date: string | undefined;
  start_time: string;
  end_time?: string | undefined;
  event: string;
  customer: {
    name: string;
    phone: string;
    note: string;
  },
  needsEquiment: boolean | null
}

onMounted(async () => {
  await fetchSettings()
  const wasFinished = sessionStorage.getItem('brunch_finished')
  const saveRes = sessionStorage.getItem('brunch_res_data')
  if (wasFinished === 'true' && saveRes) {
    try {
      const parseData = JSON.parse(saveRes);
      lastResponse.value = {
        message: parseData.message,
        code: parseData.code,
        send_wp: parseData.saved_send_wp,
        data: parseData
      }
      isFinished.value = true
    } catch (e) {
      console.error("Error parseando datos guardados", e)
    }
  }
  try {
    typeAcontecimiento.value = await AcontecimientoService.getTypeAcontecimiento()
  } catch (error) {
    console.error("error cargadno datos ", error)
  }
  try{
    EquipamientLeds.value = await EventServices.getLed_Screens();
  }catch(error){
    console.error("Error cargar d eled" , error);
  }

  // Cargar items de equipamiento
  try {
    equipamentItem.value = await EventServices.getEquipmentCheck()
  } catch (error) {
    console.error("error cargando equipamiento", error)
  }
})

const goBackToHome = () => {
  router.back();
}

const selectedEventType = computed(() => {
  return typeAcontecimiento.value.find(
    e => e.type === form.value.event
  )
})

const isException = computed(() => {
  return selectedEventType.value?.exception_status === true
})

const stepValue = computed(() => {
  return isException.value ? 10 : 10
})

/*watch(() => form.value.event, () => {
  if (selectedEventType.value) {
    const minVal = Number(selectedEventType.value.starting_quantity) || 1;
    form.value.guests = minVal;
  }
})*/

const currentStepTitle = computed(() => {
  switch (activeStep.value) {
    case 1: return 'Paso 2'
    case 2: return 'Paso 3'
    case 3: return 'Paso 4'
    case 4: return 'Paso 5'
    case 5: return 'Paso 6'
    case 6: return 'Paso 7'
    default: return 'Reserva'
  }
})
const actionButtonlabel = computed(() => {
  switch (activeStep.value) {
    case 1: return 'Siguiente'
    case 4: return 'Siguiente'
    case 6: return 'Siguiente'
    default: return 'Siguiente'
  }
})

const shouldShowNextButton = computed(() => {
  // En el paso 1 (Experiencia) y 2 (Fecha) no mostramos botón porque es autoNext
  if (activeStep.value === 1 || activeStep.value === 2) return false;

  // En el paso 3 (Horas), mostramos botón si es TimeRangePicker (Exception)
  if (activeStep.value === 3) {
    return isException.value ? (!!form.value.start_time && !!form.value.end_time) : false;
  }

  // En el paso 4 (Invitados) siempre mostramos "Siguiente"
  if (activeStep.value === 4) return true;
  if (activeStep.value === 6) return true; // Equipamiento opcional

  return false;
});

watch(() => form.value.date, async (newDate) => {
  if (newDate && settings.value) {
    // 1. Limpiamos selecciones previas
    form.value.start_time = '';
    form.value.end_time = '';
    await nextTick();
    // 3. Forzamos el mínimo de invitados
    form.value.guests = minGuest.value;
  }
}, { immediate: false });

const handleEquipmentNavigation = (value: boolean | null) => {
  if (value === true) activeStep.value = 6
  else if (value === false) {
    // No quiere equipamiento — limpiar por si acaso y saltar al 7
    equipmentQuantities.value = []
    activeStep.value = 7
  }
}

const handleBackStep = () => {
  if (activeStep.value === 2) {
    form.value.event = ''
  }

  // Desde paso 7: si no eligió equipamiento volver al 5, si eligió volver al 6
  if (activeStep.value === 7) {
    activeStep.value = form.value.needsEquiment === true ? 6 : 5
    return
  }

  // Desde paso 6 (equipamiento): resetear selección y volver al 5
  if (activeStep.value === 6) {
    equipmentQuantities.value = []
    form.value.needsEquiment = null
    activeStep.value = 5
    return
  }

  activeStep.value--
}
//Ragla activa basada en la fecha del formulario
const activeRule = computed(() => {
  // Al mencionar settings.value, Vue re-ejecutará esto en cuanto la API responda
  if (!settings.value || !form.value.date) return null;
  return getRuleByDate(form.value.date);
});

//Limites de horas para el TimeRangePicker
const timeLimits = computed(() => {
  const rule = activeRule.value;
  return {
    min: rule ? parseInt((rule.start.split(':')[0]) || '') : 9,
    max: rule ? parseInt((rule.end.split(':')[0]) || '') : 17
  };
});
//minimo de personas dinamicas
const minGuest = computed(() => activeRule.value?.min_people || 50)

// Obtenemos las horas de estadía desde el server, si no existe usamos 3 por defecto
const stayDuration = computed(() => minBookingAdvance.value || 3);

// La lógica de sugerencia de hora final ahora se maneja internamente en TimeRangePicker
// a través del prop durationHours, evitando duplicidad y conflictos de sincronización.

// Total de módulos de pantalla para activar sonido automático
/*const totalModulosPantallas = computed(() => {
  const screenSizes = [
    { name: '0.5 x 1 m', consumo: 1 }, { name: '1 x 2 m', consumo: 4 },
    { name: '1 x 1 m', consumo: 2 },   { name: '2 x 1 m', consumo: 4 },
    { name: '2 x 2 m', consumo: 8 },   { name: '3 x 2 m', consumo: 12 },
  ]
  return equipmentQuantities.value.reduce((acc, curr) => {
    const size = screenSizes.find(s => `Pantalla ${s.name}` === curr.name)
    return acc + (size ? size.consumo * curr.quantity : 0)
  }, 0)
})*/

// Agrega/quita Sistemas de Sonido automáticamente según pantallas
/*watch(totalModulosPantallas, (total) => {
  const SONIDO_ID = 2
  const yaTiene = equipmentQuantities.value.some(e => e.id === SONIDO_ID)
  if (total >= 1 && !yaTiene) {
    equipmentQuantities.value = [...equipmentQuantities.value, { id: SONIDO_ID, quantity: 1 }]
  } else if (total < 1 && yaTiene) {
    equipmentQuantities.value = equipmentQuantities.value.filter(e => e.id !== SONIDO_ID)
  }
})
*/
// Construye el check_list igual que en useEventStepper
const buildCheckList = (): CheckListItem[] => {
  return equipmentQuantities.value
    .map(item => {
      const found = equipamentItem.value.find(i => i.id === item.id)
      let name = item.name ?? found?.name ?? ''
      let price: string | null = item.price?.toString() ?? found?.price?.toString() ?? null

      if (item.variant_id && found?.variants) {
        const variant = found.variants.find(v => v.id === item.variant_id)
        if (variant) {
          name = `${found.name}: ${variant.name}`
          price = item.price?.toString() ?? variant.price ?? null
        }
      }

      return { name, quantity: item.quantity, price }
    })
    .filter(i => !!i.name)
}

</script>

<style scoped>
.animate-content {
  animation: slideIn 0.4s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.p-steppanels) {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

:deep(.p-steppanel),
:deep(.p-steppanel-content),
:deep(.p-steppanels),
:deep(.p-stepper),
.animate-content,
:deep(.group.flex-shrink-0) {
  overflow: visible !important;
}
</style>
