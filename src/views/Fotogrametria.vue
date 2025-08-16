<template>
  <div class="max-w-4xl mx-auto p-4 space-y-6">
    <h1 class="text-2xl font-bold">Fotogrametría — Captura guiada</h1>
    <CaptureGuide @lote-created="onLoteCreated" />
    <div v-if="loteId" class="mt-4">
      <CaptureCamera :lote-id="loteId" :objetivo="objetivo" />
    </div>
    <p v-else class="text-sm text-gray-500">Crea un lote para habilitar la cámara y comenzar la captura.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CaptureGuide from '@/components/CaptureGuide.vue'
import CaptureCamera from '@/components/CaptureCamera.vue'

const loteId = ref('')
const objetivo = ref(90)
const onLoteCreated = (id) => { loteId.value = id }
</script>
