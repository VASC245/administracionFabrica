<template>
  <div class="bg-white rounded-xl shadow p-6 space-y-6">
    <h2 class="text-2xl font-bold">Calidad de Pellet</h2>

    <form @submit.prevent="emitSave" class="grid md:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium">Fecha</label>
        <input type="datetime-local" v-model="form.fecha" class="input" required />
      </div>
      <div>
        <label class="block text-sm font-medium">Lote</label>
        <input v-model="form.lote" class="input" required />
      </div>
      <div>
        <label class="block text-sm font-medium">Humedad (%)</label>
        <input type="number" step="0.01" v-model.number="form.humedad" class="input" required />
      </div>
      <div>
        <label class="block text-sm font-medium">Densidad (kg/m³)</label>
        <input type="number" step="1" v-model.number="form.densidad" class="input" />
      </div>
      <div>
        <label class="block text-sm font-medium">Durabilidad (%)</label>
        <input type="number" step="0.01" v-model.number="form.durabilidad" class="input" />
      </div>
      <div>
        <label class="block text-sm font-medium">Finos (%)</label>
        <input type="number" step="0.01" v-model.number="form.finos" class="input" />
      </div>
      <div>
        <label class="block text-sm font-medium">Diámetro (mm)</label>
        <input type="number" step="0.1" v-model.number="form.diametro" class="input" />
      </div>
      <div class="md:col-span-4">
        <label class="block text-sm font-medium">Observaciones</label>
        <textarea v-model="form.observaciones" rows="2" class="input"></textarea>
      </div>

      <div class="md:col-span-4">
        <button class="btn-primary">Guardar</button>
      </div>
    </form>

    <div>
      <h3 class="text-lg font-semibold mb-3">Resultados</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="th">Fecha</th><th class="th">Lote</th><th class="th">Hum (%)</th><th class="th">Durab (%)</th><th class="th">Finos (%)</th><th class="th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in resultados" :key="r.id" class="border-b">
              <td class="td">{{ r.fecha }}</td>
              <td class="td">{{ r.lote }}</td>
              <td class="td">{{ r.humedad }}</td>
              <td class="td">{{ r.durabilidad ?? '—' }}</td>
              <td class="td">{{ r.finos ?? '—' }}</td>
              <td class="td">
                <button class="link" @click="$emit('edit', r)">Editar</button>
                <button class="link text-red-600" @click="$emit('delete', r.id)">Eliminar</button>
              </td>
            </tr>
            <tr v-if="!resultados.length">
              <td class="td text-center" colspan="6">Sin registros</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive } from 'vue'
const props = defineProps({ resultados: { type: Array, default: () => [] } })
const emit = defineEmits(['save','edit','delete'])
const form = reactive({ fecha:'', lote:'', humedad:null, densidad:null, durabilidad:null, finos:null, diametro:null, observaciones:'' })
function emitSave(){ emit('save', { ...form }) }
</script>

<style scoped>
.input{ @apply w-full border border-gray-300 rounded-lg px-3 py-2; }
.btn-primary{ @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700; }
.th{ @apply text-left px-3 py-2 font-medium text-gray-600; }
.td{ @apply px-3 py-2; }
.link{ @apply underline hover:no-underline mr-2; }
</style>
