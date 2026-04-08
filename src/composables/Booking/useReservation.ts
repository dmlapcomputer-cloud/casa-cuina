// En useReservation.ts
import { ref, computed, watch } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { bookingService } from '@/services/linktree/bookingService'
import type {
  BookingRequest,
  BookingResponse,
  RawBuffetResponse,
  RawAfterResponse,
  RawBookingResponse,
  MenuItemPayload,
  LocalMenuItem,
} from '@/types/Linktree/Booking-interfaceRequest'
import axios from 'axios'
import { toast } from 'vue-sonner'
import type { BrunchCreateRequest } from '@/types/Buffet/Brunch'
import { AcontecimientoService } from '@/services/Events/buffetBranchService'
import type { Items } from '@/services/Events/itemServices'
import type { IAfterOffice } from '@/types/after-office/after-office-intreface'
import { AfterOfficeService } from '@/services/After-office/afterOfficeService'
import type { FormValues } from '@/types/ReservationForm'
import type { UnifiedItemPayload } from '@/types/Item_reservation_buffet_after/UnifiedItemPayload'
import type { IExclusive_salon, CakeOrder } from '@/types/Linktree/Booking-interfaceRequest'
import type { IExperienceOption } from '@/types/TypeExperienceSelector-intreface'
import { useSystemSettings } from '../useSystemSettings'

export function useReservation() {
  const isSubmitting = ref(false)
  const activeStep = ref(1)
  const isFinished = ref(false)
  const isSpecialExperience = ref<IExperienceOption | null>(null)
  // Variable para guardar la respuesta de la API y mostrarla en SuccessView
  const lastResponse = ref<BookingResponse | null>(null)
  const exclusiveSalonData = ref<IExclusive_salon | null>(null)
  const cakeOrderData = ref<CakeOrder | null>(null)

  //  Configuración VeeValidate
  const { handleSubmit, setFieldValue } = useForm({
    validationSchema: yup.object({
      guests: yup.number().required().min(1).max(50),
      date: yup.string().required('La Fecha es obligatoria').nullable(),
      time: yup.string().required('La hora es obligatoria').nullable(),
      customer: yup.object({
        name: yup.string().required('El nombre es obligatorio').min(3, 'Mínimo 3 caracteres'),
        // Corregido
phone: yup.string()
  .required('El celular es obligatorio')
  // Validamos que empiece con + y tenga una longitud razonable (ej. entre 8 y 15 caracteres es estándar internacional)
  .matches(/^\+[1-9]\d{6,14}$/, 'Revise el código de país y el número ingresado'),
        note: yup.string().optional(),
      }),
      // En useReservation.ts (dentro del validationSchema)
      items: yup
        .array()
        .of(
          yup.object({
            id: yup.number().required(),
            name: yup.string().required(),
            price: yup.mixed().required(),
            selectedOption: yup.string().optional().nullable(),
          }),
        )
        .ensure()
        .default([]),
      menu_items: yup
        .array()
        .of(
          yup.object({
            name: yup.string().required(),
            quantity: yup.number().required().min(1),
            menu_holiday_id: yup.number().required(),
            // Quitamos 'price' si no lo vas a usar para validar,
            // así es menos probable que falle el submit.
          }),
        )
        .ensure()
        .default([]),
      cake_order: yup.array()
        .of(
          yup.object({
            menu_type: yup.string(),

          })
        )
    }),
    initialValues: {
      guests: 1,
      date: null as string | null,
      time: null as string | null,
      customer: { name: '', phone: '', note: '' },
      items: [] as Items[],
      menu_items: [],
    },
    validateOnMount: false,
  })

  // --- DEFINIR TODOS LOS FIELDS REACTIVOS ---
  const { value: guestsField } = useField<number>('guests')
  const { value: nameField, errorMessage: nameError } = useField<string>('customer.name')
  const { value: phoneField, errorMessage: phoneError } = useField<string>('customer.phone')
  const { value: noteField } = useField<string>('customer.note')
  const { value: dateField } = useField<string>('date')
  const { value: timeField } = useField<string>('time')
  const { value: extrasField } = useField<Items[]>('items')
  const { value: menuItemsField } = useField<MenuItemPayload[]>('menu_items')

  const { settings } = useSystemSettings();
  const generateReferenceCode = (fullName: string): string => {
    const initials =
      fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'XX'
    const randomNumbers = Math.floor(100 + Math.random() * 900)
    return `${initials}${randomNumbers}`
  }

  // 5. Envío profesional
  const onConfirm = handleSubmit(
    async (values) => {
      const formValues = values as FormValues
      isSubmitting.value = true

      const lugarSeleccionado = isSpecialExperience.value
        ? `${isSpecialExperience.value.name} - ${isSpecialExperience.value.description}`
        : null

      const esSabado = isSaturdaySelected.value
      const esViernes = isFridaySelected.value
      const horaSeleccionada = formValues.time || '00:00'

      // --- NUEVA VALIDACIÓN DINÁMICA BASADA EN SETTINGS ---
      let esHoraBuffet = false
      let esHoraAfter = false

      if (settings.value) {
        // Validación Buffet: Si es sábado y la hora está en el rango de brunch_schedule
        if (esSabado && settings.value.brunch_schedule) {
          const startB = settings.value.brunch_schedule.start.slice(0, 5)
          const endB = settings.value.brunch_schedule.end.slice(0, 5)
          esHoraBuffet = horaSeleccionada >= startB && horaSeleccionada <= endB
        }

        // Validación After: Si es viernes y la hora está en el rango de after_schedule
        // Esto ahora sí detectará si cambiaste el inicio a las 15:00
        if (esViernes && settings.value.after_schedule) {
          const startA = settings.value.after_schedule.start.slice(0, 5)
          const endA = settings.value.after_schedule.end.slice(0, 5)
          esHoraAfter = horaSeleccionada >= startA && horaSeleccionada <= endA
        }
      } else {
        // Fallback por si settings no cargó (mantenemos tu lógica antigua como respaldo)
        const [h = 0, m = 0] = horaSeleccionada.split(':').map(Number)
        const totalMinutes = h * 60 + m
        esHoraBuffet = totalMinutes >= 8 * 60 && totalMinutes <= 12 * 60
        esHoraAfter = totalMinutes >= 17 * 60 && totalMinutes <= 23 * 60
      }

      try {
        let responseData: BookingResponse

        if (exclusiveSalonData.value) {
          responseData = await handleStandardBooking(formValues, lugarSeleccionado)
        }
        else if (esHoraBuffet) { // Ya no preguntamos esSabado aquí porque se validó arriba
          responseData = await handleBuffetBooking(formValues, lugarSeleccionado)
        }
        else if (esHoraAfter) { // Ya no preguntamos esViernes aquí porque se validó arriba
          responseData = await handleAfterOfficeBooking(formValues, lugarSeleccionado)
        }
        else {
          // Reserva normal para cualquier otro caso
          responseData = await handleStandardBooking(formValues, lugarSeleccionado)
        }

        lastResponse.value = responseData
        isFinished.value = true
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status
          toast.error(status === 422 ? 'Datos no validos ' : 'Error de servidor')
        }
        throw error
      } finally {
        isSubmitting.value = false
      }
    },
    (validationErrors) => {
      console.error('❌ Validación falló, campos con error:', validationErrors.errors)
    },
  )

  // 8. Computadas y Watches
  const formattedDateShort = computed(() => {
    if (!dateField.value) return ''
    const date = new Date(dateField.value + 'T00:00:00')
    return date
      .toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
      .replace('.', '')
      .toUpperCase()
  })

  const isStepValid = computed(() => {
    if (activeStep.value === 1) return guestsField.value > 0
    if (activeStep.value === 2) return !!dateField.value
    if (activeStep.value === 3) return !!timeField.value
    if (activeStep.value === 4) return !!isSpecialExperience.value
    if (activeStep.value === 5) return true // Paso de platos, puede ser opcional
    if (activeStep.value === 6) {
      const isNameValid = nameField.value.length > 2
      
      // Lógica simple: El nuevo componente siempre empieza con '+' 
      // y debe tener al menos 8 caracteres de número real (ej. +591 + 7 digitos = min 11 chars)
      const isPhoneValid = phoneField.value.startsWith('+') && phoneField.value.length >= 11

      return isNameValid && isPhoneValid
    }
    return true
  })

  watch(dateField, (newDate) => {
    if (!newDate || !timeField.value) return
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    if (newDate === todayStr) {
      const [h = 0, m = 0] = timeField.value.split(':').map(Number)
      const currentTotalMinutes = now.getHours() * 60 + now.getMinutes()
      const selectedTotalMinutes = h * 60 + m
      if (selectedTotalMinutes <= currentTotalMinutes) {
        timeField.value = '' // Resetear tiempo si ya pasó hoy
      }
    }
  })

  const autoNext = (next: number) => {
    setTimeout(() => {
      activeStep.value = next
    }, 700)
  }

  const isSaturdaySelected = computed(() => {
    if (!dateField.value) return false
    const date = new Date(dateField.value + 'T12:00:00')
    return date.getDay() === 6
  })

  const isFridaySelected = computed(() => {
    if (!dateField.value) return false
    const date = new Date(dateField.value + 'T12:00:00')
    return date.getDay() === 5
  })

  // Indica si la hora actual califica como horario buffet (sáb 08:00–11:59)
  const isBuffetTime = computed(() => {
    if (!isSaturdaySelected.value || !timeField.value || !settings.value?.brunch_schedule) return false
    const horaSeleccionada = timeField.value // "HH:mm"
    const start = settings.value.brunch_schedule.start.slice(0, 5)
    const end = settings.value.brunch_schedule.end.slice(0, 5)
    return horaSeleccionada >= start && horaSeleccionada <= end
  })

  // Indica si la hora actual califica como horario after office (vie 17:00–23:00)
  const isAfterTime = computed(() => {
    if (!isFridaySelected.value || !timeField.value || !settings.value?.after_schedule) return false
    const horaSeleccionada = timeField.value // "HH:mm"
    const start = settings.value.after_schedule.start.slice(0, 5)
    const end = settings.value.after_schedule.end.slice(0, 5)
    return horaSeleccionada >= start && horaSeleccionada <= end
  })

  const normalizeResponse = (
    raw: BookingResponse | RawBuffetResponse | RawAfterResponse,
    type: 'buffet' | 'booking' | 'after',
  ): BookingResponse => {
    // CASE: RESERVA NORMAL
    if (type === 'booking') {
      const b = raw as unknown as RawBookingResponse
      return {
        message: b.message,
        send_wp: b.whatsapp_sent,
        data: {
          ...b.booking,
          booking_date: (b.booking.booking_date || '').split('T')[0] || '',
        },
      }
    }

    // CASE: BUFFET BRUNCH (Sábados)
    if (type === 'buffet') {
      const b = raw as RawBuffetResponse
      return {
        message: b.message,
        send_wp: b.send_wp,
        data: {
          id: b.data.id,
          codigo: b.code || b.data.code || 'BR-GEN',
          guest_count: b.data.amount,
          // Limpieza de ISO string a YYYY-MM-DD
          booking_date: (b.data.date_branch || '').split('T')[0] || '',
          booking_time: b.data.start_time,
          customer_name: b.data.name,
          phone_number: b.data.phone,
          notes: b.data.note,
          created_at: b.data.created_at,
        },
      }
    }

    // CASE: AFTER OFFICE (Viernes)
    const a = raw as RawAfterResponse

    // Manejo de la anomalía de los items (String -> Array)
    let finalItems: Items[] = []
    if (typeof a.data.items === 'string') {
      try {
        finalItems = JSON.parse(a.data.items) as Items[]
      } catch {
        finalItems = []
      }
    } else {
      finalItems = Array.isArray(a.data.items) ? a.data.items : []
    }

    return {
      message: a.message,
      send_wp: a.send_wp,
      data: {
        id: a.data.id,
        codigo: a.data.codigo,
        // Convertimos el string "5" a número para que coincida con la interfaz
        guest_count: Number(a.data.guest_count),
        // MAPEAMOS after_date -> booking_date para el SuccessView
        booking_date: String(a.data?.after_date || '').split('T')[0] || '',
        // MAPEAMOS after_time -> booking_time para el SuccessView
        booking_time: a.data.after_time,
        customer_name: a.data.customer_name,
        phone_number: a.data.phone_number,
        notes: a.data.notes,
        items: finalItems,
        created_at: a.data.created_at,
      },
    }
  }

  const handleBuffetBooking = async (
    formValues: FormValues,
    lugares: string | null,
  ): Promise<BookingResponse> => {
    const buffet: BrunchCreateRequest = {
      name: formValues.customer.name,
      phone: `${formValues.customer.phone}`,
      amount: formValues.guests,
      service_type: 'buffet',
      date_branch: formValues.date || '',
      start_time: formValues.time || '',
      price: 50,
      note: formValues.customer.note,
      items: mapItemsToPayload(formValues.items),
      form_origin: 'Buffet - Reserva',
      location_place: lugares?.toString() || '',
    }
    const result = await AcontecimientoService.storeBrunch(buffet)
    return normalizeResponse(result as unknown as RawBuffetResponse, 'buffet')
  }

  const handleAfterOfficeBooking = async (
    formValues: FormValues,
    lugares: string | null,
  ): Promise<BookingResponse> => {
    const after: IAfterOffice = {
      customer_name: formValues.customer.name,
      guest_count: formValues.guests.toString(),
      after_date: formValues.date || '',
      after_time: (formValues.time?.length === 5 ? `${formValues.time}:00` : formValues.time) || '',
      phone_number: `${formValues.customer.phone}`,
      notes: formValues.customer.note || '',
      status: 'confirmado',
      in_person: false,
      items: mapItemsToPayload(formValues.items),
      form_origin: 'After Office - Reserva',
      location_place: lugares?.toString() || '',
      cake_order: cakeOrderData.value ?? null,
    }

    const result = await AfterOfficeService.postAfter(after)
    return normalizeResponse(result, 'after')
  }

  const handleStandardBooking = async (formValues: FormValues, lugare: string | null) => {
    const locationText = lugare || ''
    const bookingData: BookingRequest = {
      codigo: generateReferenceCode(formValues.customer.name),
      guest_count: formValues.guests,
      booking_date: formValues.date || '',
      booking_time: formValues.time || '',
      customer_name: formValues.customer.name.trim(),
      phone_number: `${formValues.customer.phone.trim()}`,
      notes: formValues.customer.note || '',
      status: 'confirmado',
      in_person: false,
      // AQUÍ ESTÁ EL CAMBIO CLAVE:
      items: mapItemsToPayload(formValues.items),
      menu_items: ((formValues.menu_items as LocalMenuItem[]) || []).map((item) => ({
        menu_holiday_id: Number(item.menu_holiday_id),
        quantity: Number(item.quantity),
        // AQUÍ NO PASAMOS EL NAME. El servidor recibe un JSON limpio.
      })),
      form_origin: 'Reserva',
      location_place: locationText,
      exclusive_data: exclusiveSalonData.value ? exclusiveSalonData.value : undefined,
      cake_order: cakeOrderData.value ? cakeOrderData.value : undefined,
    }

    return normalizeResponse(
      (await bookingService.createBooking(bookingData)) as unknown as BookingResponse,
      'booking',
    )
  }

  //cretralizaremos el mapeo de los itema para no repetir codigo
  const mapItemsToPayload = (items: Items[]): UnifiedItemPayload[] => {
    return items.map((item) => ({
      name: item.selectedOption ? `${item.name} (${item.selectedOption})` : item.name,
      price: Number(item.price) || 0,
      dedication: item.dedication || '', // <--- Ahora sí pasará el filtro
    }))
  }

  // Función para guardar los datos cuando el modal confirme
  const setExclusiveData = (data: IExclusive_salon | null) => {
    exclusiveSalonData.value = data
  }

  const setCakeOrder = (data: CakeOrder | null) => {
    cakeOrderData.value = data
  }

  return {
    guestsField,
    nameField,
    nameError,
    phoneField,
    phoneError,
    noteField,
    dateField,
    timeField,
    extrasField,
    lastResponse, // 9. --- EXPORTAR ESTA VARIABLE ---
    onConfirm,
    activeStep,
    isSubmitting,
    isFinished,
    isStepValid,
    formattedDateShort,
    autoNext,
    setFieldValue, // Para reseteo completo en success view
    isSaturdaySelected,
    isFridaySelected,
    isBuffetTime,
    isAfterTime,
    isSpecialExperience,
    menuItemsField,
    exclusiveSalonData,
    setExclusiveData,
    setCakeOrder,
  }
}
