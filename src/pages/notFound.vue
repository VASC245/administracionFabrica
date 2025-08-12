<template>
  <div class="p-6 text-center text-gray-700">
    <h1 class="text-2xl font-bold mb-2">Página no encontrada</h1>
    <RouterLink :to="{ name: 'dashboard' }" class="text-blue-600 underline">Volver al inicio</RouterLink>
  </div>
</template>
<script setup>
import { RouterLink } from 'vue-router'
</script>
