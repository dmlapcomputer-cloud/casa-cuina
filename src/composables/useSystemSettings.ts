import { computed, ref, watch } from "vue";
import { SettingService } from "@/services/SettingsService";
import type { ScheduleCategory, SystemSettings } from "@/types/setting-type";
import { ENV } from "@/config/env";
import { useRoute } from "vue-router";

// Mantener las refs fuera permite que el estado sea global entre componentes
const settings = ref<SystemSettings | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

// Construimos la base de almacenamiento desde el ENV dinámico
const STORAGE_BASE = ENV.API_URL.replace(/\/api\/?$/, '/storage/');

export function useSystemSettings() {
  const route = useRoute();

  const fetchSettings = async (forceRefresh = false) => {
    if (settings.value && !forceRefresh) return;
    isLoading.value = true;
    error.value = null;

    try {
      const data = await SettingService.getSettings();
      if (data) {
        settings.value = data;
      } else {
        error.value = "No se encontró la configuración";
      }
    } catch (err) {
      error.value = "Error al conectar con el servidor: " + err;
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  };

  const getFullUrl = (path: string | null | undefined) => {
    if (!path) return '';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${STORAGE_BASE}${cleanPath}`;
  };

  // --- PROPIEDADES COMPUTADAS ---
  const logoUrl = computed(() => getFullUrl(settings.value?.logo));
  const faviconUrl = computed(() => getFullUrl(settings.value?.favicon));
  const backgroundUrl = computed(() => getFullUrl(settings.value?.background_form));
  const qrCodeUrl = computed(() => getFullUrl(settings.value?.qr_code));
  const minBookingAdvance = computed(() => settings.value?.min_booking_advance || 0);

  // --- LÓGICA DE REGLAS POR FECHA ---
  const getRuleByDate = (dateStr: string | null | undefined) => {
    // Si no hay fecha o los settings aún no cargan, retornamos null
    if (!dateStr || !settings.value || !settings.value.private_events_rules) {
      return null;
    }

    // Array manual para asegurar coincidencia exacta con el JSON ["Mon", "Tue", etc.]
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Forzamos T12:00:00 para evitar que la zona horaria mueva el día (Bolivia es UTC-4)
    const date = new Date(dateStr + 'T12:00:00');
    const dayName = days[date.getDay()];

    // Buscamos la regla en el array del JSON
    const rule = settings.value.private_events_rules.find(r =>
      r.days.includes(dayName || '')
    );

    /*if (rule) {
      console.log(`🎯 Regla aplicada para ${dateStr} (${dayName}):`, rule);
    } else {
      console.warn(`⚠️ No se encontró regla específica para ${dayName}, usando valores por defecto.`);
    }*/

    return rule || null;
  };

  // --- WATCHER DINÁMICO DE FAVICON ---
  watch(faviconUrl, (newUrl) => {
    if (newUrl) {
      const link: HTMLLinkElement | null = document.querySelector("#favicon") || document.createElement('link');
      link.id = 'favicon';
      link.rel = 'icon';
      link.href = newUrl;
      if (!document.querySelector("#favicon")) document.head.appendChild(link);
    }
  }, { immediate: true });

  // --- WATCHER DE TÍTULO (SEO) ---
  watch(
    [settings, () => route?.meta?.title],
    ([newSettings, routeTitle]) => {
      const brandName = newSettings?.name || 'Casa Çuina';
      document.title = routeTitle ? `${brandName} | ${routeTitle}` : brandName;
    },
    { immediate: true }
  );

  const getDayName = (dateStr: string) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateStr + 'T12:00:00'); // T12 evita errores de zona horaria
    return days[date.getDay()];
  };
  /*
  determina la categoria del dia sabado basado en el json de setting
  */
 const getDayScheduleType = (dateStr: string): ScheduleCategory => {
  if(!settings.value) return 'REGULAR';
  const dayName = getDayName(dateStr);
  if(settings.value.brunch_schedule?.day === dayName) return 'BRUNCH';
  if(settings.value.after_schedule?.day === dayName) return 'AFTER';

  return 'REGULAR';
 }

 //valida si la hora esta en el ranfo del dia (dinamico)
 const isTimeValid = (dateStr : string, timeStr: string): boolean => {
  if(!settings.value) return true;

  const category = getDayScheduleType(dateStr);
  let start, end ;
  if(category === 'BRUNCH' && settings.value.brunch_schedule){
    start = settings.value.brunch_schedule.start;
    end =  settings.value.brunch_schedule.end;
  }else if(category === 'AFTER' && settings.value.after_schedule){
    start = settings.value.after_schedule.start;
    end = settings.value.after_schedule.end;
  }else{
    start = settings.value.start_time;
    end = settings.value.end_time;
  }
   return timeStr >= start && timeStr <= end;
 }

 //VALIDA SI EL DIA ESTA CERRADO O NO OPERATIVO
// En useSystemSettings — agregar al return:
const specialClosures = computed(() => settings.value?.special_closures ?? [])

const isDateDisabled = (dateStr: string): boolean => {
  if(!settings.value) return false
  const isSpecialClose = settings.value.special_closures?.some(c => c.date === dateStr)
  if(isSpecialClose) return true
  const dayName = getDayName(dateStr)
  const isOperational = settings.value.days_open_week?.includes(dayName || '')
  return !isOperational  // si el día NO está en days_open_week → bloqueado
}

const getScheduleForDate = (date: Date): { start: string; end: string } | null => {
  if (!settings.value) return null;
  const dateStr = date.toISOString().split('T')[0];
  const dayName = getDayName(dateStr || '');

  // 1. Cierres especiales
  if (settings.value.special_closures?.some(c => c.date === dateStr)) return null;

  // 2. Días de la semana abiertos (Lunes suele estar fuera)
  if (settings.value.days_open_week?.includes(dayName || '')) {
    return {
      start: settings.value.start_time, // "08:00:00"
      end: settings.value.end_time     // "23:00:00"
    };
  }
  return null;
};


  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    logoUrl,
    faviconUrl,
    backgroundUrl,
    qrCodeUrl,
    getRuleByDate,
    minBookingAdvance,
    getDayScheduleType,
    isTimeValid,
    specialClosures,
    isDateDisabled,
    getScheduleForDate
  };
}
