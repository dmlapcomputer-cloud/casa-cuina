<template>
  <div class="w-full">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
      <div
        v-for="i in 6"
        :key="'sk-' + i"
        class="flex items-center md:items-stretch gap-4 md:gap-8 p-3 opacity-60"
      >
        <div class="w-[105px] h-[105px] md:w-[150px] md:h-[150px] mt-1 md:mt-0 shrink-0 bg-stone-200 animate-pulse rounded-[16px] md:rounded-[24px]"></div>

        <div class="flex-grow flex flex-col justify-center min-w-0">

          <div class="hidden md:flex items-baseline w-full">
            <div class="h-5 w-48 bg-stone-200 animate-pulse rounded"></div>
            <div class="flex-grow border-b border-stone-500 mx-4 opacity-20 mb-[7px]"></div>
            <div class="h-6 w-16 bg-stone-200 animate-pulse rounded"></div>
          </div>

          <div class="md:hidden block mb-2">
            <div class="h-4 w-3/4 bg-stone-200 animate-pulse rounded"></div>
          </div>

          <div class="mt-1 md:mt-2 space-y-2">
            <div class="h-3.5 w-full bg-stone-100 animate-pulse rounded"></div>
            <div class="h-3.5 w-[90%] bg-stone-100 animate-pulse rounded"></div>
            <div class="hidden md:block h-3.5 w-[60%] bg-stone-100 animate-pulse rounded"></div>
          </div>

          <div class="md:hidden flex items-center gap-3 mt-4">
            <div class="h-[1px] flex-grow bg-stone-200"></div>
            <div class="h-4 w-12 bg-stone-200 animate-pulse rounded"></div>
            <div class="h-[1px] flex-grow bg-stone-200"></div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animación personalizada por si Tailwind no la toma */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>
