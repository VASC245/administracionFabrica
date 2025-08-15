<template>
  <div class="max-w-4xl mx-auto p-4 space-y-6">
    <CaptureGuide @lote-created="loteId = $event"/>
    <CaptureCamera v-if="loteId" :lote-id="loteId" :objetivo="objetivo"/>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CaptureGuide from '@/components/CaptureGuide.vue'
import CaptureCamera from '@/components/CaptureCamera.vue'

const loteId = ref('')
const objetivo = ref(90) // puedes pasarlo desde la guía si prefieres
</script>
