import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config'
import { definePreset } from '@primevue/themes';

const MyPreset = definePreset(Aura, {
  components: {
    checkbox: {
      checkedBackground: '#1e293b',
      checkedBorderColor: '#1e293b',
      checkedHoverBackground: '#0f172a',
      checkedHoverBorderColor: '#0f172a',
      iconCheckedColor: '#ffffff',
      iconCheckedHoverColor: '#ffffff',
      focusRingShadow: '0 0 0 2px rgba(30, 41, 59, 0.35)',
    }
  }
});

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  locale: {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    today: 'Hoy',
    clear: 'Limpiar',
  },
  theme: {
    preset: MyPreset,
    options: {
      darkModeSelector: '.my-app-dark',
      cssLayer: false
    }
  }
})

app.mount('#app')
