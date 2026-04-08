import { ref, computed, watch } from 'vue'
import { EventServices } from '@/services/Events/eventService'
import type { EventBookingResponse, EventCreateRequest } from '@/types/Events/Event-Create'
import type { EventType } from '@/types/Events/events-type'
import type { EquipamentItem, SelectedQty } from '@/types/Events/EquipamentItem'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { toast } from 'vue-sonner'
import * as yup from 'yup'
import { useForm, useField } from 'vee-validate'

/**
 * Composable para la gestión lógica del Stepper de Eventos.
 * Maneja validaciones, persistencia en sesión, navegación y envío a API.
 */
export function useEventStepper() {
  const router = useRouter()

  // --- ESTADOS DE CONTROL ---
  const activeStep = ref(1)
  const isSubmitting = ref(false)
  const isFinished = ref(false)

  // --- DATOS DE LA API ---
  const eventType = ref<EventType[]>([])
  const equipamentItem = ref<EquipamentItem[]>([])
  const lastApiResponse = ref<EventBookingResponse | null>(null)

  /**
   * 1. ESQUEMA DE VALIDACIÓN (YUP)
   * Define las reglas para los campos de contacto.
   */
  const validationSchema = yup.object({
    name: yup.string()
      .required('El nombre es obligatorio')
      .min(3, 'Mínimo 3 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo debe contener letras'),
    phone: yup.string()
      .required('El celular es obligatorio')
        // Validamos que empiece con + y tenga una longitud razonable (ej. entre 8 y 15 caracteres es estándar internacional)
      .matches(/^\+[1-9]\d{6,14}$/, 'Revise el código de país y el número ingresado'),
  })

  /**
   * 2. CONFIGURACIÓN DE VEE-VALIDATE
   * Inicializa el motor de formularios con valores por defecto.
   */
  const { handleSubmit, setFieldValue } = useForm({
    validationSchema,
    initialValues: {
      date: undefined as string | undefined,
      guests: 1,
      startTime: '',
      endTime: '',
      eventType: '',
      selectedScreen: null as number | null,
      equipmentQuantities: [] as SelectedQty[],
      name: '',
      phone: '',
      note: '',
      needsEquipment: null as boolean | null,
    }
  })

  // Campos reactivos vinculados a VeeValidate para validación en tiempo real
  const { value: nameField, errorMessage: nameError } = useField<string>('name');
  const { value: phoneField, errorMessage: phoneError } = useField<string>('phone');

  /**
   * 3. OBJETO DE FORMULARIO CENTRALIZADO
   * Mantiene el estado de todos los pasos. Usa getters/setters para sincronizar
   * el nombre y celular con el motor de validación.
   */
  const form = ref({
    date: undefined as string | undefined,
    guests: 1,
    startTime: '',
    endTime: '',
    eventType: '',
    selectedScreen: null as number | null,
    equipmentQuantities: [] as SelectedQty[],
    note: '',
    needsEquipment: null as boolean | null,

    get name() { return nameField.value },
    set name(val) { nameField.value = val },
    get phone() { return phoneField.value },
    set phone(val) { phoneField.value = val },
  })

  // --- MÉTODOS DE PERSISTENCIA ---

  /**
   * Carga los datos guardados en sessionStorage para evitar pérdida al recargar.
   */
  const loadPersistedData = () => {
    const savedForm = sessionStorage.getItem('cuina_event_form')
    const savedStep = sessionStorage.getItem('cuina_event_step')
    const savedFinished = sessionStorage.getItem('cuina_is_finished')

    if (savedForm) {
      const parsed = JSON.parse(savedForm)
      // Asignamos valores al form y también notificamos a VeeValidate
      Object.assign(form.value, parsed)
      setFieldValue('name', parsed.name || '')
      setFieldValue('phone', parsed.phone || '')
    }
    if (savedStep) activeStep.value = parseInt(savedStep)
    if (savedFinished === 'true') isFinished.value = true
  }

  /**
   * Activa los observadores para guardar automáticamente los cambios en sesión.
   */
  const persistData = () => {
    watch(form, (newForm) => {
      sessionStorage.setItem('cuina_event_form', JSON.stringify(newForm))
    }, { deep: true })

    watch(activeStep, (newStep) => {
      sessionStorage.setItem('cuina_event_step', newStep.toString())
    })
  }

  // Resetea las horas si cambia la fecha (evita discrepancias horarias)
  watch(() => form.value.date, () => {
    form.value.startTime = ''
    form.value.endTime = ''
  })

  /**
   * 4. LÓGICA DE NAVEGACIÓN (VALIDACIÓN POR PASO)
   * Determina si el botón "Siguiente" o "Confirmar" debe estar habilitado.
   */
  const isStepValid = computed(() => {
    const f = form.value
    switch (activeStep.value) {
      case 1: return !!f.eventType
      case 2: return f.guests > 0
      case 3: return !!f.date
      case 4: return !!f.startTime && !!f.endTime
      case 5: return f.needsEquipment !== null
      case 6: return true // Equipamiento opcional
      case 7: 
        const isNameValid = f.name.length >= 3
        
        // VALIDACIÓN TELÉFONO MEJORADA:
        // 1. El campo no debe estar vacío.
        // 2. No debe tener mensaje de error de Yup (phoneError).
        // 3. El regex de Yup (que permite E.164) debe pasar.
        // Nota: Ya no usamos 'length === 8' porque ahora acepta +591700...
        const isPhoneValid = f.phone.length > 0 && !phoneError.value

        return isNameValid && isPhoneValid
      default: return false
    }
  })

  /**
    * Procesa y envía la cotización al servidor.
    * Fusionamos 'values' (validados por VeeValidate) con 'form.value' (resto del estado).
    */
  const handleConfirm = handleSubmit(async (values) => {
    isSubmitting.value = true
    lastApiResponse.value = null

    try {
      // CAMBIADO: antes era un objeto Record<string,number> con prefijo "Pantalla" en todos.
      // Ahora es un array con { name, quantity, price } para cada ítem.
      // Si el ítem tiene variant_id, se usa el nombre y precio de la variante seleccionada.
      const consolidatedEquipment = form.value.equipmentQuantities
        .map((item: SelectedQty) => {
          const found = equipamentItem.value.find(i => i.id === item.id)

          let name = item.name ?? found?.name ?? ''
          // Usar el precio que ya viene en SelectedQty (guardado al seleccionar en EquipmentGrid)
          // Si no tiene precio, buscar en equipamentItem como fallback
          let price: string | null = item.price?.toString() ?? found?.price?.toString() ?? null

          // Si tiene variante seleccionada, usar nombre y precio de esa variante
          if (item.variant_id && found?.variants) {
            const variant = found.variants.find(v => v.id === item.variant_id)
            if (variant) {
              name = `${found.name}: ${variant.name}`
              price = item.price?.toString() ?? variant.price ?? null
            }
          }

          // Si es una pantalla LED, el precio ya viene en item.price desde ledScrensRaw
          // No necesitamos buscar en equipamentItem
          return { name, quantity: item.quantity, price }
        })
        .filter(i => !!i.name) // quitar ítems sin nombre

      // Si hay pantallas seleccionadas, marcar "Sistemas de Sonido" como incluido (sin costo)
      const resultado = consolidatedEquipment.map(i => {
        return {
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        }
      })

      // IMPORTANTE: Aquí unimos lo validado con el estado general
      const payload: EventCreateRequest = {
        name: values.name,
        phone: `${values.phone}`,
        amount: 0,
        // Usamos form.value para lo que no está en el esquema de Yup
        event: form.value.eventType,
        date: form.value.date || '',
        check_list: resultado,
        amount_guests: form.value.guests,
        start_time: form.value.startTime ? `${form.value.startTime}:00` : '',
        end_time: form.value.endTime ? `${form.value.endTime}:00` : '',
        note: form.value.note,
      }

      const response = await EventServices.storeEvent(payload)
      lastApiResponse.value = response
      isFinished.value = true
      sessionStorage.setItem('cuina_is_finished', 'true')
      return response
    } catch (error) {
      handleError(error)
      return null
    } finally {
      isSubmitting.value = false
    }
  })

  /**
   * Gestión centralizada de errores de red o servidor.
   */
  const handleError = (error: unknown) => {
    let msg = 'Error inesperado al enviar la cotización.'
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 422) msg = 'Datos inválidos o fecha no disponible.'
      if (error.response?.status === 500) msg = 'Error en el servidor. Intente más tarde.'
    }
    toast.error('Error en Eventos', { description: msg })
  }

  /**
   * Limpia el formulario y la sesión, regresando al inicio.
   */
  const resetStepper = () => {
    sessionStorage.clear()
    isFinished.value = false
    activeStep.value = 1
    lastApiResponse.value = null

    // Limpiar todo el form
    form.value.date = undefined
    form.value.guests = 1
    form.value.startTime = ''
    form.value.endTime = ''
    form.value.eventType = ''
    form.value.selectedScreen = null
    form.value.equipmentQuantities = []
    form.value.note = ''
    form.value.needsEquipment = null

    // Limpieza de campos en VeeValidate
    setFieldValue('name', '')
    setFieldValue('phone', '')
    setFieldValue('eventType', '')
    setFieldValue('date', undefined)

    router.replace('/cotizar-evento')
  }
  const autoNext = (step: number) => {
    setTimeout(() => {
      activeStep.value = step
    }, 300);
  }
  return {
    // Estado y Datos
    form,
    activeStep,
    isSubmitting,
    isFinished,
    isStepValid,
    eventType,
    equipamentItem,
    lastApiResponse,

    // Errores de validación
    nameError,
    phoneError,

    // Métodos
    handleConfirm,
    loadPersistedData,
    persistData,
    resetStepper,
    autoNext
  }
}
