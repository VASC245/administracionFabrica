<template>
  <div class="bg-white rounded-xl shadow p-6 space-y-6">
    <h2 class="text-2xl font-bold">Plan de Producción</h2>

    <form @submit.prevent="emitSave" class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium">Fecha</label>
        <input type="date" v-model="form.fecha" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required />
      </div>

      <div>
        <label class="block text-sm font-medium">Turno</label>
        <select v-model="form.turno" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required>
          <option value="Mañana">Mañana</option>
          <option value="Tarde">Tarde</option>
          <option value="Noche">Noche</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium">Máquinas involucradas</label>
        <select v-model="form.maquinas" multiple class="w-full border border-gray-300 rounded-lg px-3 py-2 h-28 focus:outline-none focus:ring">
          <option v-for="m in maquinasCatalogo" :key="m.id" :value="m.nombre">{{ m.nombre }}</option>
        </select>
        <p class="text-xs text-gray-500 mt-1">Ctrl/Cmd + click para varias</p>
      </div>

      <div>
        <label class="block text-sm font-medium">Meta (t)</label>
        <input type="number" step="0.01" v-model.number="form.meta_ton" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required />
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium">Observaciones</label>
        <textarea v-model="form.observaciones" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring"></textarea>
      </div>

      <div class="md:col-span-2 flex items-center gap-3">
        <input type="file" @change="handleFile" />
        <span class="text-xs text-gray-500">Adjuntar plan (opcional)</span>
      </div>

      <div class="md:col-span-2 flex gap-3">
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" type="submit">Guardar plan</button>
        <button class="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200" type="button" @click="reset">Limpiar</button>
      </div>
    </form>

    <div>
      <h3 class="text-lg font-semibold mb-3">Planes recientes</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-3 py-2 font-medium text-gray-600">Fecha</th>
              <th class="text-left px-3 py-2 font-medium text-gray-600">Turno</th>
              <th class="text-left px-3 py-2 font-medium text-gray-600">Meta (t)</th>
              <th class="text-left px-3 py-2 font-medium text-gray-600">Máquinas</th>
              <th class="text-left px-3 py-2 font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in planes" :key="p.id" class="border-b">
              <td class="px-3 py-2">{{ p.fecha }}</td>
              <td class="px-3 py-2">{{ p.turno }}</td>
              <td class="px-3 py-2">{{ p.meta_ton }}</td>
              <td class="px-3 py-2">{{ p.maquinas?.join(', ') }}</td>
              <td class="px-3 py-2">
                <button class="underline hover:no-underline mr-2" @click="$emit('edit', p)">Editar</button>
                <button class="underline hover:no-underline text-red-600" @click="$emit('delete', p.id)">Eliminar</button>
              </td>
            </tr>
            <tr v-if="!planes.length">
              <td class="px-3 py-2 text-center" colspan="5">Sin registros</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive } from 'vue'
const props = defineProps({
  planes: { type: Array, default: () => [] },
  maquinasCatalogo: { type: Array, default: () => [] }
})
const emit = defineEmits(['save', 'edit', 'delete'])

const form = reactive({
  fecha: '',
  turno: 'Mañana',
  maquinas: [],
  meta_ton: null,
  observaciones: '',
  file: null
})

function handleFile(e){ form.file = e.target.files?.[0] ?? null }
function reset(){ form.fecha=''; form.turno='Mañana'; form.maquinas=[]; form.meta_ton=null; form.observaciones=''; form.file=null }
function emitSave(){ emit('save', { ...form }) }
</script>
