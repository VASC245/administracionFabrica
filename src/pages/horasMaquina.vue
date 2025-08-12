<template>
  <div class="bg-white rounded-xl shadow p-6 space-y-6">
    <h2 class="text-2xl font-bold">Horas por Máquina</h2>

    <form @submit.prevent="save" class="grid md:grid-cols-4 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium">Máquina</label>
        <select v-model="form.maquina_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required>
          <option v-for="m in maq.items" :key="m.id" :value="m.id">{{ m.nombre }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium">Inicio (encendido)</label>
        <input type="datetime-local" v-model="form.inicioLocal" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required />
      </div>
      <div>
        <label class="block text-sm font-medium">Fin (apagado)</label>
        <input type="datetime-local" v-model="form.finLocal" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required />
      </div>

      <div class="md:col-span-4">
        <label class="block text-sm font-medium">Observaciones</label>
        <input v-model="form.observaciones" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" />
      </div>

      <div class="md:col-span-4 flex items-center gap-4">
        <div class="text-sm">
          <span class="font-medium">Horas calculadas:</span> {{ previewHoras }}
        </div>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Guardar</button>
      </div>
    </form>

    <div>
      <h3 class="text-lg font-semibold mb-3">Registros recientes</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-3 py-2">Fecha</th>
              <th class="text-left px-3 py-2">Máquina</th>
              <th class="text-left px-3 py-2">Inicio</th>
              <th class="text-left px-3 py-2">Fin</th>
              <th class="text-left px-3 py-2">Horas</th>
              <th class="text-left px-3 py-2">Obs</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in registros" :key="r.id" class="border-b">
              <td class="px-3 py-2">{{ r.fecha }}</td>
              <td class="px-3 py-2">{{ nombreMaquina(r.maquina_id) }}</td>
              <td class="px-3 py-2">{{ fmtDT(r.inicio) }}</td>
              <td class="px-3 py-2">{{ fmtDT(r.fin) }}</td>
              <td class="px-3 py-2">{{ Number(r.horas || 0).toFixed(2) }}</td>
              <td class="px-3 py-2">{{ r.observaciones }}</td>
            </tr>
            <tr v-if="!registros.length">
              <td class="px-3 py-2 text-center" colspan="6">Sin registros</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useMaquinasActive } from '@/stores/maquinasStore'

const maq = useMaquinasActive()
const registros = ref([])

onMounted(async () => {
  await maq.listActive(); maq.subscribe()
  await load()
})
onUnmounted(() => maq.unsubscribe())

const form = reactive({
  maquina_id: null,
  inicioLocal: '',
  finLocal: '',
  observaciones: ''
})

const previewHoras = computed(() => {
  if (!form.inicioLocal || !form.finLocal) return '—'
  const start = new Date(form.inicioLocal)
  const end = new Date(form.finLocal)
  const diff = (end - start) / 36e5 // ms a horas
  return diff > 0 ? diff.toFixed(2) : '—'
})

function nombreMaquina(id){ return maq.items.find(m => m.id === id)?.nombre ?? '—' }
function fmtDT(s){ return s ? new Date(s).toLocaleString() : '—' }

async function load() {
  const { data } = await supabase
    .from('horas_maquina')
    .select('*')
    .order('inicio', { ascending: false })
    .limit(50)
  registros.value = data || []
}

async function save() {
  const inicio = new Date(form.inicioLocal)
  const fin = new Date(form.finLocal)
  const horas = Math.max(0, (fin - inicio) / 36e5)
  if (!horas) return alert('Verifica inicio y fin')

  const payload = {
    maquina_id: form.maquina_id,
    inicio: inicio.toISOString(),
    fin: fin.toISOString(),
    horas,
    fecha: inicio.toISOString().slice(0,10),
    observaciones: form.observaciones || null
  }

  const { error } = await supabase.from('horas_maquina').insert([payload])
  if (error) { console.error(error); return alert('No se pudo guardar') }

  await load()
  form.inicioLocal = ''; form.finLocal = ''; form.observaciones = ''
}
</script>
