<template>
  <div class="min-h-screen bg-stone-bg font-sans antialiased flex flex-col items-center p-4 py-8">
    <LoadingOverlay :active="isSubmitting" message="Confirmando tu reserva" />

    <div class="fixed inset-0 z-0">
      <div class="h-full w-full bg-cover bg-center animate-ken-burns"
        :style="{ backgroundImage: `url('${backgroundUrl}')` }"></div>
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
    </div>

    <div
      class="relative z-10 w-full max-w-3xl bg-white backdrop-blur rounded-2xl shadow-[0_10px_30px_rgba(194,123,46,0.08)] flex flex-col border border-stone-bg overflow-hidden">
      <div class="w-full flex justify-center pt-10 pb-4 px-8">
        <img :src="logoUrl" alt="Logo"
          class="w-full max-w-[180px] md:max-w-[240px] h-auto object-contain brightness-0" />
      </div>

      <header v-if="!isFinished" class="pt-2 px-4 pb-4 shrink-0 bg-white">
        <div class="mb-6 min-h-[32px] flex items-center justify-center text-center px-4">
          <h2 :class="[
            'font-display text-[15px] md:text-[20px] uppercase tracking-[0.25em] transition-all duration-700 ease-in-out',
            isSaturdaySelected || isFridaySelected || holidayName
              ? 'text-primary scale-105 font-bold'
              : 'text-stone-800 opacity-90',
          ]">
            {{ dynamicTitle }}
          </h2>
        </div>

        <div class="flex justify-between items-end mb-3 px-1">
          <div class="flex flex-col">
            <h3 class="text-[16px] md:text-lg text-stone-900 uppercase tracking-[0.3em] font-bold">
              {{ stepTitle }}
            </h3>
          </div>
          <div class="flex items-baseline">
            <span class="font-serif font-bold italic text-2xl text-primary">
              {{ activeStep }}
            </span>
            <span class="text-stone-400 text-[12px] font-sans not-italic ml-1">/ 6</span>
          </div>
        </div>

        <div class="h-[5px] w-full bg-stone-100 rounded-full overflow-hidden">
          <div class="h-full bg-primary transition-all duration-700 ease-in-out"
            :style="{ width: (activeStep / 6) * 100 + '%' }"></div>
        </div>
      </header>

      <div class="px-3 md:px-8 flex-1 flex flex-col py-6">
        <Transition mode="out-in" enter-active-class="transition duration-500 ease-out"
          enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-300 ease-in" leave-from-class="opacity-100"
          leave-to-class="opacity-0 -translate-y-4">
          <div v-if="!isFinished" key="booking-form">
            <div class="flex flex-col items-center">
              <div v-if="activeStep === 1" class="w-full animate-content">
                <GuestStepper v-model="guestsField" :min="1" :max="50" />
              </div>

              <div v-if="activeStep === 2" class="w-full animate-content">
                <DateStepper :model-value="dateField" @update:modelValue="
                  (val) => {
                    dateField = val
                    autoNext(3)
                  }
                " inline :show-saturday-label="true" :show-friday-label="true" :is-date-disabled-fn="isDateDisabled"
                  :closed-dates="specialClosures ?? []" :anticipation-hours="cakeAnticipationHours" />
              </div>

              <div v-if="activeStep === 3" class="w-full animate-content">
                <TimeStepper :model-value="timeField" @update:modelValue="handleTimeSelection"
                  :selected-date="dateField" :max-hour="isSaturdaySelected ? 12 : 23" :min-hour="8"
                  :special-hours="specialHours" :holiday-name="holidayName"
                  :anticipation-hours="cakeAnticipationHours" />
              </div>

              <div v-if="activeStep === 4" class="w-full animate-content">
                <TypeExperienceSelector v-model="isSpecialExperience" :experiences="experiencesList"
                  :selected-date="dateField" @next="handleExperienceStep" />
              </div>

              <div v-if="activeStep === 5 && specialMenu.length > 0" class="w-full animate-content">
                <div class="text-center mb-8">
                  <h3 class="font-serif italic text-2xl text-stone-800">
                    {{ holidayName ? `Menú Especial: ${holidayName}` : 'Menú Sugerido' }}
                  </h3>
                  <p class="text-stone-500 text-sm">
                    Selecciona las delicias que deseas para tu mesa
                  </p>
                </div>

                <div class="max-w-2xl mx-auto">
                  <ProductItem v-for="plato in specialMenu" :key="plato.id" :id="plato.id" :title="plato.name"
                    :description="plato.description" :price="Number(plato.price)"
                    @change="(data) => handleProductChange(data, plato.id)" />
                </div>
              </div>

              <div v-if="activeStep === 6" class="w-full animate-content">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6 w-full max-w-2xl mx-auto">
                  <div class="col-span-1">
                    <BookingInput v-model="nameField" label="Nombre Completo" placeholder="Ej. Juan Pérez" required
                      :max-characters="50" :error="nameError" />
                  </div>
                  <div class="col-span-1">
                    <BookingInput v-model="phoneField" label="Celular" placeholder="Ingrese su número" type="tel" required
                      :error="phoneError" default-country="BO" />
                  </div>
                  <div v-if="filteredItems.length > 0" class="md:col-span-2 mb-1">
                    <BookingItems v-model="extrasField" :items="filteredItems" />
                  </div>
                  <div v-if="!isBuffetTime" class="md:col-span-2 mb-1">
                    <BookingCakeSelector v-model="cakeField" />
                  </div>
                  <div class="md:col-span-2">
                    <BookingInput v-model="noteField" label="Nota Especial (opcional)" type="textarea"
                      placeholder="Alergias, cumpleaños..." class="w-full" :max-characters="255" />
                  </div>
                </div>
              </div>
            </div>

            <footer class="mt-8 flex items-center justify-between w-full border-t border-stone-100 pt-6">
              <div class="min-w-[80px]">
                <button @click="handleBackStep"
                  class="h-12 px-2 font-sans text-[11px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-800 flex items-center gap-2 transition-all active:scale-90 group">
                  <Icon icon="lucide:chevron-left" class="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  <span>Volver</span>
                </button>
              </div>

              <div class="flex justify-end flex-1 pl-4">
                <button v-if="activeStep === 1" @click="activeStep = 2" :disabled="!isStepValid"
                  class="btn-next active:scale-95">
                  Elegir Fecha
                  <Icon icon="lucide:arrow-right" class="w-4 h-4" />
                </button>

                <button v-if="activeStep === 5" @click="activeStep = 6" class="btn-next active:scale-95">
                  Siguiente
                  <Icon icon="lucide:arrow-right" class="w-4 h-4" />
                </button>

                <button v-if="activeStep === 6" @click="handleFinalConfirm" :disabled="isSubmitting"
                  class="btn-confirm active:scale-95">
                  <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                    <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </span>
                  <span v-else class="uppercase tracking-widest">
                    {{ confirmButtonText }}
                  </span>
                </button>
              </div>
            </footer>
          </div>

          <div v-else key="success-view">
            <SuccessView :reservation-data="lastResponse" @reset="resetStepper" :is-saturday="isBuffetTime"
              :is-after-office="isAfterTime" />
          </div>
        </Transition>
      </div>
    </div>
  </div>
  <SpecialRoomModal :is-open="showSpecialModal" :room="selectedSpecialRoom" :initial-date="dateField"
    :initial-time="timeField" :current-guests="guestsField" @close="handleModalClose" @confirm="handleModalConfirm" />
  <ConfirmModal :is-open="showCakeWarning" title="Tiempo insuficiente"
    :description="`Esta torta necesita ${cakeField?.min_prep_hours}h de preparación. Tu fecha actual no tiene suficiente tiempo.`"
    confirm-label="Cambiar fecha y hora" cancel-label="Quitar torta"
    @confirm="() => { dateField = ''; timeField = ''; activeStep = 2; showCakeWarning = false }"
    @cancel="() => { cakeField = null; showCakeWarning = false }" @dismiss="showCakeWarning = false" />

</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import GuestStepper from '@/components/booking/GuestStepper.vue'
import DateStepper from '@/components/booking/DateStepper.vue'
import TimeStepper from '@/components/booking/TimeStepper.vue'
import BookingInput from '@/components/booking/BookingInput.vue'
import BookingItems from '@/components/booking/BookingItems.vue'
import SuccessView from '@/components/layout/SuccessView.vue'
import TypeExperienceSelector from '@/components/booking/TypeExperienceSelector.vue'
import ProductItem, { type ProductChangeEvent } from '@/components/ui/Menu/ProductItem.vue'
// Al principio de tus imports en el script
import SpecialRoomModal from '@/components/booking/SpecialRoomModal.vue'

import { useReservation } from '@/composables/Booking/useReservation'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSystemSettings } from '@/composables/useSystemSettings'
import { ItemService, type Items } from '@/services/Events/itemServices'
import { HolydayService } from '@/services/Events/useBoliviaHolyDays'
import type { Holidays, HolidayMenuItem } from '@/types/Events/holyday-interface'
import type { LocalMenuItem } from '@/types/Linktree/Booking-interfaceRequest'
import type { IExperienceOption } from '@/types/TypeExperienceSelector-intreface'
import { TypeExperienceSelectorService } from '@/services/typeExperienceSelectorService'
import BookingCakeSelector, { type CakeSelection } from '@/components/booking/BookingCakeSelector.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import { addBusinessHours } from '@/utils/useTimeUtil'

const router = useRouter()
const availableItems = ref<Items[]>([])

// --- ESTADOS DÍA ESPECIAL ---
const holidays = ref<Holidays[]>([])
const holidayName = ref<string>('')
const specialHours = ref<{ start: string; end: string }>({ start: '', end: '' })
const specialMenu = ref<HolidayMenuItem[]>([])
const currentHolidayId = ref<number | null>(null) // Nueva ref para el ID
const showCakeWarning = ref(false)
//para escojer los salones
const showSpecialModal = ref(false);
const isConfirmingModal = ref(false); // Flag para bloquear @close de HeadlessUI durante confirm
const selectedSpecialRoom = ref<{
  id: number;
  title: string;
  min_price: number;
  min_guests: number;
  duration?: number;      // Nueva prop
  anticipation?: number;  // Nueva prop
} | null>(null);
//
const experiencesList = ref<IExperienceOption[]>([])
//const showNoticeModal = ref(false); // Nuevo modal de aviso
//const selectedExperienceData = ref<any>(null);
//tempora para el selector de trotas
const cakeField = ref<CakeSelection | null>(null)
const cakeAnticipationHours = computed(() => cakeField.value?.min_prep_hours ?? 0)


const {
  guestsField,
  nameField,
  nameError,
  phoneField,
  phoneError,
  noteField,
  dateField,
  timeField,
  extrasField,
  onConfirm,
  activeStep,
  isSubmitting,
  isStepValid,
  autoNext,
  setFieldValue,
  lastResponse,
  isFinished,
  isSaturdaySelected,
  isFridaySelected,
  isSpecialExperience,
  menuItemsField,
  setExclusiveData,
  isBuffetTime,
  isAfterTime,

  setCakeOrder,
} = useReservation()

const { logoUrl, fetchSettings, backgroundUrl, specialClosures, isDateDisabled, settings, getScheduleForDate } = useSystemSettings()

onMounted(async () => {
  const wasFinished = sessionStorage.getItem('res_finished')
  const savedData = sessionStorage.getItem('res_data')
  if (wasFinished === 'true' && savedData) {
    lastResponse.value = JSON.parse(savedData)
    isFinished.value = true
  }
  fetchSettings()
  fetchItemService()

  // Cargamos los feriados al iniciar
  const list = await HolydayService.getBolivisHolydays()
  holidays.value = list

  const loations = await TypeExperienceSelectorService.getItemsList();
  experiencesList.value = loations

  //obtenemos los daros de la torta seleccionado de menu
  const cakeFormMenu = history.state.cake
  if (cakeFormMenu) {
    cakeField.value = cakeFormMenu
  }
})

const fetchItemService = async () => {
  const data = await ItemService.getItemServicios()
  availableItems.value = data.filter((item) => item.status === true)
}

// Sincroniza cakeField con el composable para incluirlo en el payload
watch(cakeField, (val) => {
  if (val) {
    if (val.min_prep_hours && dateField.value && timeField.value) {
      // CORRECCIÓN: Pasamos los 5 argumentos necesarios
      const disponibleDesde = addBusinessHours(
        new Date(), 
        val.min_prep_hours,
        { start: settings.value?.start_time || '', end: settings.value?.end_time || '' },
        getScheduleForDate,
        specialClosures.value.map(c => c.date)
      );
      const fechaReserva = new Date(`${dateField.value}T${timeField.value}:00`)
      if (fechaReserva < disponibleDesde) {
        showCakeWarning.value = true;
      }
    }
    setCakeOrder({
      menu_type: 'Tortas',
      items: [{ product_id: val.product_id, quantity: 1 }],
    })
  } else {
    setCakeOrder(null)
  }
})

// Watcher unificado para la fecha
watch(dateField, async (newVal, oldVal) => {
  // 1. Limpieza básica al cambiar la fecha
  if (oldVal !== undefined && newVal !== oldVal) {
    timeField.value = ''
    // No resetear la experiencia si el cambio de fecha viene desde el modal de salón premium
    if (!showSpecialModal.value && !isConfirmingModal.value) {
      isSpecialExperience.value = null
    }
    menuItemsField.value = []
  }

  // 2. Si no hay fecha, reseteamos todo y salimos
  if (!newVal) {
    specialHours.value = { start: '', end: '' }
    specialMenu.value = []
    holidayName.value = ''
    currentHolidayId.value = null // <-- Resetear ID
    return
  }

  const getMMDD = (d: Date | string) => {
    const date = typeof d === 'string' ? new Date(d + 'T12:00:00') : d
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const holiday = holidays.value.find((h) => getMMDD(h.date) === getMMDD(newVal))

  if (holiday && holiday.special_day) {
    //holidayName.value = holiday.name

    // --- CAMBIO CLAVE: GUARDAMOS EL ID DEL FERIADO ENCONTRADO ---
    //currentHolidayId.value = holiday.id

    const res = await HolydayService.getSpecialMenu(holiday.id)

    if (res && res.menu_holiday) {
      // Usamos Number() porque a veces el ID viene como string y otras como número
      const validPlatos = res?.menu_holiday.filter(
        (plato) => plato.holiday_id !== null && Number(plato.holiday_id) === holiday.id
      );
      if (res && validPlatos.length > 0) {
        specialMenu.value = validPlatos;
        specialHours.value = {
          start: res.holiday.start_time,
          end: res.holiday.end_time,
        };
        holidayName.value = holiday.name;
        currentHolidayId.value = holiday.id;
      }
    }
  } else {
    // Si no es feriado, limpiamos todo
    specialHours.value = { start: '', end: '' }
    specialMenu.value = []
    holidayName.value = ''
    currentHolidayId.value = null // <-- Limpiar ID
  }
})

const confirmExperience = (id: IExperienceOption) => {
  //Usamos el parámetro para guardar la experiencia seleccionada
  isSpecialExperience.value = id

  // Buscamos el feriado actual
  //const currentHoliday = holidays.value.find(h => h.id === currentHolidayId.value)

  // Lógica de navegación
  const isTimeInSpecialRange = specialHours.value.start && specialHours.value.end &&
    timeField.value >= specialHours.value.start.slice(0, 5) &&
    timeField.value <= specialHours.value.end.slice(0, 5);

  // PRIORIDAD: Si es horario de Buffet o After Office, saltamos el menú de feriado (Paso 5)
  if (specialMenu.value.length > 0 && isTimeInSpecialRange && !isBuffetTime.value && !isAfterTime.value) {
    activeStep.value = 5
  } else {
    activeStep.value = 6
  }
}

const handleExperienceStep = (id: number) => { // Ahora recibe number
  const selectedOption = experiencesList.value.find(opt => opt.id === id);
  if (!selectedOption) return;

  if (selectedOption.is_premium) {
    selectedSpecialRoom.value = {
      id: selectedOption.id,
      title: selectedOption.name,
      min_price: Number(selectedOption.booking_charge), // Dinámico: 300
      min_guests: Number(selectedOption.min_people),    // Dinámico: 2
      duration: (Number(selectedOption.duration_minutes) || 180) / 60,   // Dinámico: 3 horas
      anticipation: Number(selectedOption.min_lead_hours) || 24 // Dinámico: 24h
    };
    showSpecialModal.value = true;
  } else {
    setExclusiveData(null)
    confirmExperience(selectedOption);
  }
};
// Cierre normal del modal (X o "Explorar otros ambientes")
const handleModalClose = () => {
  if (!isConfirmingModal.value) {
    showSpecialModal.value = false;
  }
};

const handleModalConfirm = async (newData: { date: string, time: string, guests: number }) => {
  isConfirmingModal.value = true;

  const experienceToConfirm = isSpecialExperience.value;

  // 1. Primero fecha y guests (el watcher de dateField reseteará timeField)
  dateField.value = newData.date;
  guestsField.value = newData.guests;

  // 2. Esperamos que el watcher de dateField termine de ejecutarse
  await nextTick();

  // 3. Ahora seteamos la hora (después del watcher, no antes)
  timeField.value = newData.time;

  // 4. Guardamos los datos del salón exclusivo
  if (selectedSpecialRoom.value) {
    setExclusiveData({
      booking_location_id: selectedSpecialRoom.value.id,
      amount_paid: selectedSpecialRoom.value.min_price
    });
  }

  // 5. Cerramos el modal
  showSpecialModal.value = false;

  // 6. Esperamos que HeadlessUI termine su transición de salida antes de navegar
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 350));

  // 7. Navegamos al paso correcto
  if (experienceToConfirm !== null && experienceToConfirm !== undefined) {
    confirmExperience(experienceToConfirm);
  }

  isConfirmingModal.value = false;
};
const handleTimeSelection = (val: string) => {
  if (!val) return
  timeField.value = val
  autoNext(4)
}

const handleFinalConfirm = () => {
  if ('vibrate' in navigator) navigator.vibrate(40)
  onConfirm()
}

const resetStepper = () => {
  sessionStorage.removeItem('res_finished')
  sessionStorage.removeItem('res_data')
  isFinished.value = false
  lastResponse.value = null
  activeStep.value = 1
  setFieldValue('guests', 1)
  setFieldValue('date', null)
  setFieldValue('time', null)
  setFieldValue('customer', { name: '', phone: '', note: '' })
  setFieldValue('items', [])
  isSpecialExperience.value = null
  setExclusiveData(null)
  cakeField.value = null
  setCakeOrder(null)
}

const confirmButtonText = computed(() => {
  if (isSubmitting.value) return 'Procesando...'
  if (!isSpecialExperience.value) return 'Confirmar Reserva'
  if (isBuffetTime.value) return 'Reservar Buffet Brunch'
  if (isAfterTime.value) return 'Reservar After Office'
  return 'Confirmar Reserva'
})

const dynamicTitle = computed(() => {
  if (activeStep.value < 3) return 'Reserva'
  if (holidayName.value) return `Reserva` // Prioridad título festivo
  if (isSaturdaySelected.value) return 'Reserva'
  if (isFridaySelected.value) return 'Reserva'
  return 'Reserva'
})

const stepTitle = computed(() => {
  return `Paso ${activeStep.value}`
})

const ITEMS_CATEGORIES = { RESERVA: 'reserva', AFTER: 'after_office', BUFFET: 'buffet' }

const filteredItems = computed(() => {
  if (!availableItems.value.length) return []
  return availableItems.value.filter((items) => items.category === ITEMS_CATEGORIES.RESERVA)
})

const handleBackStep = () => {
  if (activeStep.value === 6) {
    isSpecialExperience.value = null
    setExclusiveData(null)
    extrasField.value = []
    const isTimeInSpecialRange = specialHours.value.start && specialHours.value.end &&
      timeField.value >= specialHours.value.start.slice(0, 5) &&
      timeField.value <= specialHours.value.end.slice(0, 5);

    // Si no hubo menú especial, la hora no está en el rango, o es horario de Buffet/After, vuelve al paso 4 directamente
    if (specialMenu.value.length === 0 || !isTimeInSpecialRange || isBuffetTime.value || isAfterTime.value) {
      activeStep.value = 4
      return
    }
  }

  if (activeStep.value > 1) {
    activeStep.value--
  } else {
    router.push('/')
  }
}

/**
 * Maneja la selección de platos del menú especial/festivo
 * Se dispara cada vez que el usuario cambia la cantidad en un ProductItem
 */
const handleProductChange = (data: ProductChangeEvent, productId: number) => {
  // Buscamos en el array tratando los elementos como LocalMenuItem
  const index = (menuItemsField.value as LocalMenuItem[]).findIndex(
    (item) => item.menu_holiday_id === productId,
  )

  if (data.quantity > 0) {
    const newMenuItem: LocalMenuItem = {
      name: data.name, // Ahora TS no se queja porque LocalMenuItem lo permite
      menu_holiday_id: productId,
      quantity: data.quantity,
    }

    if (index > -1) {
      menuItemsField.value[index] = newMenuItem
    } else {
      menuItemsField.value.push(newMenuItem)
    }
  } else {
    if (index > -1) menuItemsField.value.splice(index, 1)
  }
}
</script>
