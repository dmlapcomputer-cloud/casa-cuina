<template>
  <PortalLayout>
    <PortalHeader />

    <main class="flex flex-col gap-4">
      <div
        class="my-2 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
      ></div>

      <template v-if="loading">
        <PortalCardSkeleton v-for="i in 5" :key="'skeleton-' + i" />
      </template>

      <template v-else>
        <transition-group name="cascade" appear>
          <PortalCard
            v-for="(item, index) in activePortalItems"
            :key="item.id"
            v-bind="item"
            :style="{ '--delay': index }"
          />
        </transition-group>
      </template>
    </main>

    <PortalFooter />
  </PortalLayout>
</template>

<script setup lang="ts">
import PortalLayout from '@/components/layout/PortalLayout.vue'
import PortalHeader from '@/components/sections/PortalHeader.vue'
import PortalFooter from '@/components/sections/PortalFooter.vue'
import PortalCard from '@/components/ui/PortalCard.vue'
import PortalCardSkeleton from '@/components/ui/PortalCardSkeleton.vue'
import type { PortalItem } from '@/types/Linktree/PortalItem-interface'
import { computed, onMounted, ref } from 'vue'
import { portalService } from '@/services/linktree/portalService'
const portalItems = ref<PortalItem[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    portalItems.value = await portalService.getPortalItems(false)
  } catch (e) {
    console.error('Error en el carga ', e)
  } finally {
    loading.value = false
  }
})

const activePortalItems = computed(() => {
  return portalItems.value.filter(item => item.use_list === true);
});
</script>

<style scoped>
/* Transición suave entre páginas */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
