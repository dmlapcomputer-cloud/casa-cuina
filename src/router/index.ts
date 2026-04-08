
import { createRouter, createWebHistory } from 'vue-router'
import PortalView from '@/view/PortalView.vue'
import { useSystemSettings } from '@/composables/useSystemSettings'

const routes = [
  {
    path: '/',
    name: 'portal',
    component: PortalView,
  },
  {
    path: "/reservation",
    name: "Reservation",
    component: () => import('@/view/ReservationView.vue'),
    meta: { title : 'Reserva'}
  },
  {
    path: '/cotizar-evento',
    name: 'event-configurator',
    component: () => import('@/view/EventConfiguratorView.vue'),
    meta: { title : 'Cotizar evento' }
  },
  {
    path: '/buffet-branch',
    name: 'buffet de branch',
    component: () => import('@/view/BuffetBrunchView.vue'),
    meta: { title : 'Buffet de brunch' }
  },
  {
    path: '/menu-catalog',
    name: 'menu-catalog',
    component: () => import('@/view/MenuCatalog.vue'),
    meta: { title : 'Catálogo de menús' }
  },
  {
    path:'/menu-comida',
    name: 'menu-comida',
    component: () => import('@/view/MenuCatalogComida.vue'),
    meta: { title: 'Catálog de comida'}
  }
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

//GUARDIA DE NAVEGACION
router.beforeEach(async (to, from, next) => {
  const { settings, fetchSettings } = useSystemSettings();
  
  // 1. PRIMERO cargamos los datos
  await fetchSettings();
  
  // 2. DESPUÉS obtenemos el valor actualizado
  const isMaintenance = settings.value?.maintenance_mode;
  
  // 3. Lógica de redirección (Asegúrate de tener una ruta llamada 'maintenance' si la vas a usar)
  // Nota: Si no tienes una ruta 'maintenance', el v-if de App.vue igual bloqueará todo.
  if (isMaintenance && to.name !== 'maintenance') {
    // Si decides no usar una ruta específica, puedes simplemente dejar que pase 
    // porque el v-if de App.vue es el que manda.
    next(); 
  } else if (!isMaintenance && to.name === 'maintenance') {
    next({ name: 'portal' });
  } else {
    next();
  }
});
export default router
