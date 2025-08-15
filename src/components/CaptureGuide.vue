<template>
  <div class="bg-white rounded-xl shadow p-4 space-y-4">
    <h2 class="text-lg font-semibold">Crear lote y parámetros</h2>

    <div class="grid md:grid-cols-3 gap-3">
      <div>
        <label class="text-sm text-gray-600">Nombre del lote</label>
        <input v-model="lote" class="w-full border rounded-lg px-3 py-2" placeholder="Montón 2025-08-14 N1"/>
      </div>
      <div>
        <label class="text-sm text-gray-600">Objetivo de fotos</label>
        <select v-model.number="objetivo" class="w-full border rounded-lg px-3 py-2">
          <option :value="90">90</option>
          <option :value="120">120</option>
        </select>
      </div>
      <div>
        <label class="text-sm text-gray-600">Densidad (kg/m³)</label>
        <input v-model.number="densidad" type="number" min="100" max="600" step="10"
               class="w-full border rounded-lg px-3 py-2" placeholder="300"/>
      </div>
    </div>

    <div>
      <label class="text-sm text-gray-600">Notas</label>
      <textarea v-model="notas" class="w-full border rounded-lg px-3 py-2" rows="2"
        placeholder="Condiciones, humedad estimada, operador..."></textarea>
    </div>

    <button @click="crearLote" :disabled="loading || !lote"
      class="px-4 py-2 rounded-lg text-white bg-emerald-600 hover:opacity-90 disabled:opacity-50">
      {{ loading ? 'Creando...' : 'Crear lote' }}
    </button>

    <p v-if="createdId" class="text-sm text-green-600">
      Lote creado: <b>{{ createdId }}</b>. Ya puedes iniciar la captura.
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const lote = ref('')
const objetivo = ref(90)
const densidad = ref(300)
const notas = ref('')
const loading = ref(false)
const createdId = ref('')

const emit = defineEmits(['lote-created'])

async function crearLote() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('mediciones_aserrin')
      .insert({
        lote_id: lote.value,
        estado: 'subido',
        densidad_kg_m3: densidad.value,
        notas: notas.value,
        fotos_count: 0
      })
      .select('id')
      .single()
    if (error) throw error
    createdId.value = data.id
    emit('lote-created', data.id)
  } catch (e) {
    alert('Error creando lote: ' + (e.message || e))
  } finally {
    loading.value = false
  }
}
</script>
