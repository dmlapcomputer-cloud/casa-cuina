<template>
  <Toaster
    position="top-center"
    :richColors="true"
    :closeButton="true"
    :toastOptions="{
      style: {
        borderRadius: '16px',
        padding: '12px 16px',
        fontSize: '14px',
        fontFamily: 'inherit'
      },
    }"
  />
</template>

<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
</script>
