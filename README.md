# Casa Çuina - Sistema de Reservas y Eventos

Sistema de gestión de reservas y configuración de eventos para el restaurante Casa Çuina. Portal interactivo para clientes que permite realizar reservas y cotizar eventos especiales.

## 🌐 Características del Sistema

### Páginas Principales

| Ruta | Nombre | Descripción |
|------|--------|--------------|
| `/` | Portal | Página principal con enlaces dinámicos a servicios |
| `/reservation` | Reserva | Sistema de reservas con paso a paso (4 pasos) |
| `/cotizar-evento` | Configurador de Eventos | Herramienta para cotizar eventos especiales |
| `/buffet-branch` | Buffet Brunch | Sistema de reservas para brunch buffet |
| `/menu-catalog` | Catálogo de Menús | Visualización del menú del restaurante |

### Funcionalidades

- **Reservas en línea**: Los clientes pueden reservar mesa seleccionando número de guests, fecha, hora y datos de contacto.
- **Cotización de eventos**: Sistema de pasos para configurar eventos especiales con equipamiento.
- **Buffet Brunch**: Reservas especiales para brunch los sábados.
- **Portal dinámico**: Los enlaces del portal se cargan desde una API externa.
- **Validación de datos**: Validación de formularios con VeeValidate y Yup.
- **Notificaciones**: Sistema de toast notifications con vue-sonner.
- **Diseño responsivo**: Adaptado para móviles y escritorio.

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Vue 3** - Framework progresivo
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Vue Router** - Enrutamiento
- **Tailwind CSS** - Estilos
- **PrimeVue** - Componentes UI

### Dependencias principales
- `vue` ^3.5.26
- `vue-router` ^4.6.4
- `axios` ^1.13.4
- `vee-validate` ^4.15.1
- `yup` ^1.7.1
- `primevue` ^4.5.4
- `vue-sonner` ^2.0.9
- `tailwindcss` ^3.4.19

## 📁 Estructura del Proyecto

```
src/
├── assets/              # Recursos estáticos (imágenes, estilos)
├── components/          # Componentes Vue reutilizables
│   ├── booking/        # Componentes de reservas
│   ├── event/          # Componentes de eventos
│   ├── layout/         # Componentes de diseño
│   ├── sections/       # Secciones (header, footer)
│   └── ui/             # Componentes UI base
├── composables/        # Composables de Vue
├── config/             # Configuración del proyecto
├── router/             # Configuración de rutas
├── services/           # Servicios API
│   ├── api/           # Cliente axios
│   ├── Events/        # Servicios de eventos
│   └── linktree/      # Servicios del portal
├── types/             # Definiciones de TypeScript
├── utils/             # Utilidades
└── view/              # Vistas principales
```

## 🚀 Comandos de Desarrollo

### Instalación de dependencias
```
sh
npm install
```

### Desarrollo (servidor local)
```
sh
npm run dev
```

### Producción (build)
```sh
npm run build
```

### Previsualización del build
```
sh
npm run preview
```

### Verificación de tipos
```
sh
npm run type-check
```

### Linting
```
sh
npm run lint
```

### Formateo de código
```
sh
npm run format
```

## ⚙️ Configuración

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```
env
VITE_API_URL=https://tu-api.com/
```

### Configuración de API

El archivo `src/config/env.ts` gestiona la URL de la API:

```
typescript
export const ENV = {
  API_URL: import.meta.env.VITE_API_URL,
}
```

## 📱 Puntos de Acceso API

| Endpoint | Descripción |
|----------|-------------|
| `/custom-links` | Obtiene los elementos del portal |
| `/reservations` | Gestión de reservas |
| `/events` | Configuración de eventos |
| `/settings` | Configuración del sistema |

## 🎨 Personalización

### Logos e Imágenes
- Configurables desde el panel de administración
- Almacenados en `src/assets/img/`

### Colores
- Primary: `#C27B2E` (naranja/restaurante)
- Dark accent: `#1f293b` (gris oscuro)
- Fondos: `stone-50` a `stone-900`

## 📋 Requisitos del Sistema

- Node.js ^20.19.0 o >=22.12.0
- npm o yarn

## 🔧 Desarrollo Adicional

### Agregar nueva ruta
1. Editar `src/router/index.ts`
2. Agregar nuevo objeto en el array `routes`
3. Crear la vista en `src/view/`

### Agregar nuevo componente
1. Crear archivo en `src/components/`
2. Importar y usar en la vista correspondiente

## 📄 Licencia

Proyecto privado para Casa Çuina
