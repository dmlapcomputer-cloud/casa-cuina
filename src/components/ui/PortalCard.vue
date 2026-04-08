<template>
  <div class="w-full flex flex-col gap-3">
    <component
      :is="hasChildren ? 'button' : (type ? 'a' : 'router-link')"
      :to="(!type && !hasChildren) ? to : undefined"
      :href="(type && !hasChildren) ? href : undefined"
      :target="type && !hasChildren ? '_blank' : undefined"
      @click="handleAction"
      class="group relative flex w-full items-center justify-between rounded-3xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-xl overflow-hidden cursor-pointer"
      :class="[
        variant === 'black' ? 'glass-dark p-4 bg-[#1C1917]/80 border border-white/10' : 'glass-light px-4 py-4 bg-white/40 border border-white/60',
        isOpen ? 'ring-2 ring-primary/30' : ''
      ]"
    >
      <div class="flex items-center gap-5">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300"
          :class="variant === 'black' ? 'border-primary/30 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'border-primary/20 bg-white/90 text-primary shadow-primary/5'">
          <Icon :icon="icon" class="text-2xl" />
        </div>
        <div class="flex flex-col text-left">
          <span class="font-display text-xl transition-colors duration-300" :class="variant === 'black' ? 'text-white' : 'text-stone-900'">{{ title }}</span>
          <span v-if="subtitle" class="text-label opacity-60 mt-0.5 lowercase first-letter:uppercase text-stone-500">{{ subtitle }}</span>
        </div>
      </div>

      <div class="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 text-stone-400 group-hover:text-primary">
        <Icon
          :icon="hasChildren ? (isOpen ? 'lucide:chevron-up' : 'lucide:chevron-down') : (type ? 'lucide:arrow-up-right' : 'lucide:chevron-right')"
          class="text-2xl transition-transform duration-500"
        />
      </div>
    </component>

    <transition name="expand">
  <div v-if="hasChildren && isOpen" class="flex flex-col gap-2 px-2 pb-2">
    <div v-for="child in children" :key="child.id">

      <button
        v-if="child.title === 'Menú de Tortas'"
        @click="handleTortaClick(child.url)"
        class="flex items-center justify-between w-full p-4 rounded-[1.5rem] bg-stone-100/90 border border-stone-200/60 backdrop-blur-md transition-all duration-300 group/child shadow-sm
               hover:scale-[1.02] hover:shadow-md
               active:scale-[0.98] active:bg-primary active:text-white active:border-primary"
      >
        <div class="flex items-center gap-4">
          <Icon :icon="child.icon" class="text-lg text-primary group-active/child:text-white" />
          <span class="font-display text-lg text-stone-800 group-active/child:text-white">{{ child.title }}</span>
        </div>
        <Icon icon="lucide:chevron-right" class="text-stone-400 group-active/child:text-white" />
      </button>

      <component
        v-else
        :is="child.is_external ? 'a' : 'router-link'"
        :to="!child.is_external ? child.url : undefined"
        :href="child.is_external ? child.url : undefined"
        :target="(child.is_external || child.title === 'Menú General') ? '_blank' : undefined"
        class="flex items-center justify-between w-full p-4 rounded-[1.5rem] bg-stone-100/90 border border-stone-200/60 backdrop-blur-md transition-all duration-300 group/child shadow-sm
               hover:scale-[1.02] hover:shadow-md
               active:scale-[0.98] active:bg-primary active:text-white active:border-primary"
      >
        <div class="flex items-center gap-4">
          <Icon :icon="child.icon" class="text-lg text-primary group-active/child:text-white" />
          <span class="font-display text-lg text-stone-800 group-active/child:text-white">{{ child.title }}</span>
        </div>
        <Icon
          :icon="(child.is_external || child.title === 'Menú General') ? 'lucide:arrow-up-right' : 'lucide:chevron-right'"
          class="text-stone-400 group-active/child:text-white"
        />
      </component>

    </div>
  </div>
</transition>

    <TortaWarningModal
      :show="showModal"
      @confirm="onConfirmTorta"
      @close="showModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { PortalItem } from '@/types/Linktree/PortalItem-interface'
import TortaWarningModal from './Lintree/TortaWarningModal.vue'

const props = withDefaults(defineProps<PortalItem>(), {
  variant: 'light',
  type: false,
  children: () => []
})

const router = useRouter()
const isOpen = ref(false)
const showModal = ref(false)
const pendingUrl = ref('')

const hasChildren = computed(() => props.use_list && props.children && props.children.length > 0)

// Lógica para interceptar el clic de Tortas
const handleTortaClick = (url: string) => {
  pendingUrl.value = url
  showModal.value = true
}

// Confirmar navegación tras el aviso
const onConfirmTorta = () => {
  showModal.value = false
  if (pendingUrl.value) {
    router.push(pendingUrl.value)
  }
}

// Control de apertura del acordeón
const handleAction = (e: Event) => {
  if (hasChildren.value) {
    e.preventDefault()
    isOpen.value = !isOpen.value
  }
}
</script>

<style scoped>
.glass-dark { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
.glass-light { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }

/* Animación Expand */
.expand-enter-active, .expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>
