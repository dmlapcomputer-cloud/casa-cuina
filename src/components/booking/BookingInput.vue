<template>
  <div class="w-full space-y-2 group">
    <label v-if="!loading" :for="inputId" class="text-label uppercase px-1 transition-colors duration-300"
      :class="labelColorClass">
      {{ label }} <span v-if="required" class="text-primary ml-1">*</span>
    </label>

    <div class="relative">
      <div v-if="type === 'tel'" 
           class="flex w-full h-[44px] rounded-xl border-2 transition-all duration-300 relative"
           :class="statusColorClass">
        
        <div class="relative shrink-0 w-[100px] border-r border-stone-200" v-click-outside="closeDropdown">
          <button 
            type="button"
            @click="toggleDropdown"
            :disabled="disabled"
            class="flex items-center justify-between w-full h-full px-3 bg-stone-50 rounded-l-[9px] hover:bg-stone-100 transition-colors disabled:opacity-50"
          >
            <span class="text-[11px] font-bold text-stone-600">
              {{ selectedCountry?.flag }} {{ selectedCountryCode }}
            </span>
            <Icon icon="lucide:chevron-down" class="w-3 h-3 text-stone-400 transition-transform" :class="{'rotate-180': isDropdownOpen}" />
          </button>

          <transition name="fade-pop">
            <div v-if="isDropdownOpen" 
                 class="absolute top-full left-0 mt-2 w-[250px] bg-white border border-stone-200 rounded-xl shadow-2xl z-[100] overflow-hidden">
              
              <div class="p-2 border-b border-stone-100 bg-stone-50">
                <div class="relative">
                  <Icon icon="lucide:search" class="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400" />
                  <input 
                    v-model="searchQuery"
                    type="text"
                    placeholder="Buscar país..."
                    class="w-full pl-7 pr-2 py-1.5 text-[11px] bg-white border border-stone-200 rounded-md outline-none focus:border-primary"
                    @click.stop
                  />
                </div>
              </div>

              <div class="max-h-[220px] overflow-y-auto scrollbar-custom">
                <div v-if="!searchQuery" @click="selectCountry('BO')" 
                     class="p-2.5 hover:bg-primary/5 cursor-pointer border-b border-stone-50 flex items-center justify-between group/item">
                  <span class="text-xs font-bold text-stone-700">🇧🇴 Bolivia</span>
                  <span class="text-[10px] font-black text-primary">+591</span>
                </div>

                <div v-for="c in filteredCountries" :key="c.code" 
                     @click="selectCountry(c.code)"
                     class="p-2.5 hover:bg-stone-50 cursor-pointer flex items-center justify-between transition-colors border-b border-stone-50 last:border-0">
                  <div class="flex items-center gap-2">
                    <span class="text-sm">{{ c.flag }}</span>
                    <span class="text-xs text-stone-600">{{ c.name }}</span>
                  </div>
                  <span class="text-[10px] text-stone-400 font-medium">+{{ c.dialCode }}</span>
                </div>

                <div v-if="filteredCountries.length === 0" class="p-4 text-center text-[10px] text-stone-400 uppercase italic">
                  No se encontraron resultados
                </div>
              </div>
            </div>
          </transition>
        </div>

        <input 
          :id="inputId" 
          ref="phoneInputRef" 
          type="tel" 
          :value="nationalNumber" 
          @input="handlePhoneInput"
          @focus="handleFocus" 
          @blur="handleBlur" 
          autocomplete="tel" 
          inputmode="tel" 
          v-bind="$attrs"
          :placeholder="placeholder" 
          :disabled="disabled" 
          class="w-full h-full px-4 outline-none bg-transparent text-stone-800 placeholder:text-stone-300 placeholder:italic text-sm font-sans font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed" />
      </div>

      <component v-else :is="type === 'textarea' ? 'textarea' : 'input'" :id="inputId"
        :type="type !== 'textarea' ? type : undefined" :value="modelValue" @input="handleInput" @focus="handleFocus"
        @blur="handleBlur" v-bind="$attrs" :placeholder="placeholder"
        :disabled="disabled" :class="[
          'w-full transition-all duration-500 ease-out border-2',
          'text-stone-800 placeholder:text-stone-300 placeholder:italic',
          'text-sm font-sans font-medium tracking-wide outline-none ring-0',
          type === 'textarea' ? 'min-h-[80px] max-h-[150px] px-5 py-3 rounded-2xl resize-none' : 'h-[44px] px-5 rounded-xl',
          statusColorClass
        ]" />
    </div>

    <div class="px-1 flex justify-between items-start gap-4">
      <div class="flex-1">
        <transition name="fade-slide" mode="out-in">
          <p v-if="error" class="text-label text-red-700 flex items-center gap-1.5 text-[10px]">
            {{ error }}
          </p>
          <p v-else-if="type === 'tel' && nationalNumber && !isComplete"
            class="text-[9px] text-red-500 font-bold uppercase tracking-tighter">
            Número incompleto o inválido
          </p>
          <p v-else-if="type === 'tel' && autoDetectedCountry" 
             class="text-[9px] text-green-600 font-bold uppercase tracking-tighter flex items-center gap-1">
            <Icon icon="lucide:check-circle" class="w-3 h-3" />
            Código {{ autoDetectedCountry }} detectado
          </p>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode, AsYouType } from 'libphonenumber-js'
import type { CountryCode } from 'libphonenumber-js'

// --- DIRECTIVA CLICK OUTSIDE ---
const vClickOutside = {
  mounted(el: any, binding: any) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el: any) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

interface Props {
  modelValue: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'tel' | 'email' | 'password';
  required?: boolean;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
  defaultCountry?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  defaultCountry: 'BO',
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

// --- ESTADO ---
const isFocused = ref(false)
const isDropdownOpen = ref(false)
const searchQuery = ref('')
const autoDetectedCountry = ref<string | null>(null)
const selectedCountryCode = ref<CountryCode>(props.defaultCountry as CountryCode)
const nationalNumber = ref('')
const inputId = `field-${Math.random().toString(36).slice(2, 7)}`

// --- LÓGICA DE PAÍSES ---
const allCountriesList = computed(() => {
  return getCountries().map(code => ({
    code,
    dialCode: getCountryCallingCode(code),
    flag: code.toUpperCase().split('').map(char => String.fromCodePoint(127397 + char.charCodeAt(0))).join(''),
    name: new Intl.DisplayNames(['es'], { type: 'region' }).of(code) || code
  }))
})

const filteredCountries = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return allCountriesList.value
    .filter(c => c.name.toLowerCase().includes(query) || c.dialCode.includes(query) || c.code.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const selectedCountry = computed(() => allCountriesList.value.find(c => c.code === selectedCountryCode.value))

// --- MÉTODOS ---
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) searchQuery.value = ''
}

const closeDropdown = () => isDropdownOpen.value = false

const selectCountry = (code: CountryCode) => {
  selectedCountryCode.value = code
  isDropdownOpen.value = false
  formatAndEmit()
}

const handlePhoneInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  
  // Detección por "+"
  if (val.startsWith('+')) {
    const parsed = parsePhoneNumberFromString(val)
    if (parsed?.country) {
      selectedCountryCode.value = parsed.country as CountryCode
      autoDetectedCountry.value = parsed.country
      setTimeout(() => autoDetectedCountry.value = null, 3000)
    }
  }

  const formatter = new AsYouType(selectedCountryCode.value)
  nationalNumber.value = formatter.input(val)
  formatAndEmit()
}

const formatAndEmit = () => {
  const parsed = parsePhoneNumberFromString(nationalNumber.value, selectedCountryCode.value)
  if (parsed?.isValid()) {
    emit('update:modelValue', parsed.format('E.164'))
  } else {
    emit('update:modelValue', nationalNumber.value.replace(/[^\d+]/g, ''))
  }
}

// Watchers e Init
watch(() => props.modelValue, (newVal) => {
  if (props.type === 'tel' && newVal?.startsWith('+') && !isFocused.value) {
    const parsed = parsePhoneNumberFromString(newVal)
    if (parsed) {
      selectedCountryCode.value = parsed.country as CountryCode
      nationalNumber.value = parsed.formatNational()
    }
  }
}, { immediate: true })

const isComplete = computed(() => parsePhoneNumberFromString(nationalNumber.value, selectedCountryCode.value)?.isValid())

// Estilos
const statusColorClass = computed(() => {
  if (props.error) return 'border-red-500 bg-red-50'
  return isFocused.value ? 'border-primary bg-white shadow-lg shadow-primary/5' : 'border-stone-200 bg-white hover:border-stone-300'
})

const labelColorClass = computed(() => props.error ? 'text-red-700' : isFocused.value ? 'text-primary' : 'text-stone-700')

const handleInput = (e: any) => emit('update:modelValue', e.target.value)
const handleFocus = (e: any) => { isFocused.value = true; emit('focus', e) }
const handleBlur = (e: any) => { 
  isFocused.value = false
  emit('blur', e)
}
const onlyNumbers = (e: KeyboardEvent) => {
  // 1. Permitir teclas de control (Backspace, Delete, Tab, flechas)
  const keysAllowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'];
  
  if (keysAllowed.includes(e.key)) return;

  // 2. Bloquear cualquier cosa que no sea un número del 0 al 9
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
};
</script>

<style scoped>
.fade-pop-enter-active, .fade-pop-leave-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-pop-enter-from, .fade-pop-leave-to { opacity: 0; transform: scale(0.95) translateY(-10px); }

.fade-slide-enter-active { transition: all 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateX(-10px); }

.scrollbar-custom::-webkit-scrollbar { width: 4px; }
.scrollbar-custom::-webkit-scrollbar-track { background: transparent; }
.scrollbar-custom::-webkit-scrollbar-thumb { background: #e7e5e4; border-radius: 10px; }
.scrollbar-custom::-webkit-scrollbar-thumb:hover { background: #d6d3d1; }
</style>