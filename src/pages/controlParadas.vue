<template>
  <div class="bg-white rounded-xl shadow p-6 space-y-6">
    <h2 class="text-2xl font-bold">Paradas Técnicas</h2>

    <form @submit.prevent="save" class="grid md:grid-cols-5 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium">Máquina</label>
        <select v-model="form.maquina_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring">
          <option value="">—</option>
          <option v-for="m in maq.items" :key="m.id" :value="m.id">{{ m.nombre }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium">Inicio</label>
        <input type="datetime-local" v-model="form.inicio" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required />
      </div>
      <div>
        <label class="block text-sm font-medium">Fin</label>
        <input type="datetime-local" v-model="form.fin" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required />
      </div>
      <div>
        <label class="block text-sm font-medium">Categoría</label>
        <select v-model="form.categoria" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring">
          <option>Mecánica</option>
          <option>Eléctrica</option>
          <option>Materia prima</option>
          <option>Operativa</option>
          <option>Seguridad</option>
          <option>Planificada</option>
        </select>
      </div>

      <div class="md:col-span-5">
        <label class="block text-sm font-medium">Motivo/Observaciones</label>
        <textarea v-model="form.motivo" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring"></textarea>
      </div>

      <div class="md:col-span-5">
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Registrar</button>
      </div>
    </form>

    <div>
      <h3 class="text-lg font-semibold mb-3">Paradas recientes</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-3 py-2 font-medium text-gray-600">Inicio</th>
              <th class="text-left px-3 py-2 font-medium text-gray-600">Fin</th>
              <th class="text-left px-3 py-2 font-medium text-gray-600">Duración (min)</th>
              <th class="text-left px-3 py-2 font-medium text-gray-600">Máquina</th>
              <th class="text-left px-3 py-2 font-medium text-gray-600">Cat.</th>
              <th class="text-left px-3 py-2 font-medium text-gray-600">Motivo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in paradas" :key="p.id" class="border-b">
              <td class="px-3 py-2">{{ p.inicio }}</td>
              <td class="px-3 py-2">{{ p.fin }}</td>
              <td class="px-3 py-2">{{ calcMin(p.inicio,p.fin) }}</td>
              <td class="px-3 py-2">{{ nombreMaquina(p.maquina_id) }}</td>
              <td class="px-3 py-2">{{ p.categoria }}</td>
              <td class="px-3 py-2">{{ p.motivo }}</td>
            </tr>
            <tr v-if="!paradas.length">
              <td class="px-3 py-2 text-center" colspan="6">Sin registros</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted, ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useMaquinasActive } from '@/stores/maquinasStore'

const maq = useMaquinasActive()
const paradas = ref([])

onMounted(async () => {
  await maq.listActive(); maq.subscribe()
  await load()
})
onUnmounted(() => maq.unsubscribe())

const form = reactive({ maquina_id: null, inicio: '', fin: '', motivo: '', categoria: 'Planificada' })

function calcMin(i,f){ if(!i||!f) return '—'; const ms = (new Date(f) - new Date(i)); return Math.max(0, Math.round(ms/60000)) }
function nombreMaquina(id){ return maq.items.find(m => m.id === id)?.nombre ?? '—' }

async function load() {
  const { data } = await supabase
    .from('paradas_tecnicas')
    .select('*')
    .order('inicio', { ascending: false })
    .limit(50)
  paradas.value = data || []
}

async function save() {
  const { error } = await supabase.from('paradas_tecnicas').insert([{ ...form }])
  if (!error) { await load(); form.motivo = '' }
}
</script>
