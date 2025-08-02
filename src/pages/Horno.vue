<template>
  <div class="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-10">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Registro de Horno</h2>

    <!-- FILTRO DE FECHAS -->
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <div>
        <label class="block text-gray-700 text-sm font-medium mb-1">Desde:</label>
        <input type="date" v-model="fechaInicio" class="border border-gray-300 rounded-lg px-3 py-2" />
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-medium mb-1">Hasta:</label>
        <input type="date" v-model="fechaFin" class="border border-gray-300 rounded-lg px-3 py-2" />
      </div>
      <button @click="filtrarPorFechas" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
        Filtrar
      </button>
      <button @click="resetFiltro" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
        Limpiar
      </button>
    </div>

    <!-- FORMULARIO -->
    <form @submit.prevent="guardar" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <!-- Fecha -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
        <input v-model="nuevo.fecha" type="date"
          class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" readonly />
      </div>

      <!-- Hora -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Hora</label>
        <input v-model="nuevo.hora" type="time"
          class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" readonly />
      </div>

      <!-- Jampa -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Jampa</label>
        <input v-model.number="nuevo.jampa" type="number" placeholder="Jampa"
          class="w-full border rounded-lg px-3 py-2" />
      </div>

      <!-- Viruta -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Viruta</label>
        <input v-model.number="nuevo.viruta" type="number" placeholder="Viruta"
          class="w-full border rounded-lg px-3 py-2" />
      </div>

      <!-- Pellet -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Pellet</label>
        <input v-model.number="nuevo.pellet" type="number" placeholder="Pellet"
          class="w-full border rounded-lg px-3 py-2" />
      </div>

      <!-- Temperatura Entrada -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Temperatura Entrada (°C)</label>
        <input v-model.number="nuevo.temperatura_entrada" type="number" placeholder="Entrada °C"
          class="w-full border rounded-lg px-3 py-2" />
      </div>

      <!-- Temperatura Salida -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Temperatura Salida (°C)</label>
        <input v-model.number="nuevo.temperatura_salida" type="number" placeholder="Salida °C"
          class="w-full border rounded-lg px-3 py-2" />
      </div>

      <!-- Humedad -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Humedad (%)</label>
        <input v-model.number="nuevo.humedad" type="number" placeholder="Humedad %"
          class="w-full border rounded-lg px-3 py-2" />
      </div>

      <!-- Amperios -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Amperios (A)</label>
        <input v-model.number="nuevo.amperios" type="number" placeholder="Amperios"
          class="w-full border rounded-lg px-3 py-2" />
      </div>

      <!-- BOTÓN GUARDAR / ACTUALIZAR -->
      <div class="md:col-span-2 text-center mt-4">
        <button type="submit"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full">
          {{ editMode ? 'Actualizar Registro' : 'Guardar Registro' }}
        </button>
      </div>
    </form>

    <!-- TABLA -->
    <div v-if="registros.length > 0">
      <h3 class="text-xl font-bold text-gray-700 mb-4">Registros Guardados</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full border border-gray-300 rounded-lg text-sm">
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th class="px-4 py-3 border">Fecha</th>
              <th class="px-4 py-3 border">Hora</th>
              <th class="px-4 py-3 border">Jampa</th>
              <th class="px-4 py-3 border">Viruta</th>
              <th class="px-4 py-3 border">Pellet</th>
              <th class="px-4 py-3 border">T. Entrada</th>
              <th class="px-4 py-3 border">T. Salida</th>
              <th class="px-4 py-3 border">Humedad</th>
              <th class="px-4 py-3 border">Amperios</th>
              <th class="px-4 py-3 border text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="registro in registros" :key="registro.id" class="odd:bg-white even:bg-gray-50">
              <td class="px-4 py-2 border">{{ registro.fecha }}</td>
              <td class="px-4 py-2 border">{{ registro.hora }}</td>
              <td class="px-4 py-2 border">{{ registro.jampa }}</td>
              <td class="px-4 py-2 border">{{ registro.viruta }}</td>
              <td class="px-4 py-2 border">{{ registro.pellet }}</td>
              <td class="px-4 py-2 border">{{ registro.temperatura_entrada }}°C</td>
              <td class="px-4 py-2 border">{{ registro.temperatura_salida }}°C</td>
              <td class="px-4 py-2 border">{{ registro.humedad }}%</td>
              <td class="px-4 py-2 border">{{ registro.amperios }} A</td>
              <td class="px-4 py-2 border text-center space-x-2">
                <!-- BOTÓN EDITAR -->
                <button @click="editarRegistro(registro)"
                  class="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition">
                  Editar
                </button>
                <!-- BOTÓN ELIMINAR -->
                <button @click="eliminarRegistro(registro.id)"
                  class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="text-gray-500 text-center mt-6">No hay registros en este rango de fechas.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const registros = ref([])
const nuevo = ref(getDefaultRegistro())
const editMode = ref(false)
const idEditando = ref(null)

// Filtro
const fechaInicio = ref('')
const fechaFin = ref('')

// ✅ Función para generar fecha y hora actual
function getDefaultRegistro() {
  const now = new Date()
  const fecha = now.toISOString().split('T')[0]
  const hora = now.toTimeString().slice(0, 5)
  return {
    fecha,
    hora,
    jampa: null,
    viruta: null,
    pellet: null,
    temperatura_entrada: null,
    temperatura_salida: null,
    humedad: null,
    amperios: null
  }
}

// Cargar todos
const cargar = async () => {
  const { data, error } = await supabase.from('horno').select('*').order('fecha', { ascending: false })
  if (!error) registros.value = data || []
}

// Filtrar
const filtrarPorFechas = async () => {
  let query = supabase.from('horno').select('*').order('fecha', { ascending: false })
  if (fechaInicio.value && fechaFin.value) {
    query = query.gte('fecha', fechaInicio.value).lte('fecha', fechaFin.value)
  }
  const { data, error } = await query
  if (!error) registros.value = data || []
}

const resetFiltro = () => {
  fechaInicio.value = ''
  fechaFin.value = ''
  cargar()
}

// Guardar o actualizar
const guardar = async () => {
  if (editMode.value) {
    const { error } = await supabase.from('horno').update(nuevo.value).eq('id', idEditando.value)
    if (!error) {
      editMode.value = false
      idEditando.value = null
      nuevo.value = getDefaultRegistro()
      await cargar()
    }
  } else {
    const { error } = await supabase.from('horno').insert([nuevo.value])
    if (!error) {
      nuevo.value = getDefaultRegistro()
      await cargar()
    }
  }
}

// Editar registro
const editarRegistro = (registro) => {
  editMode.value = true
  idEditando.value = registro.id
  nuevo.value = { ...registro }
}

// Eliminar
const eliminarRegistro = async (id) => {
  const { error } = await supabase.from('horno').delete().eq('id', id)
  if (!error) await cargar()
}

onMounted(() => {
  nuevo.value = getDefaultRegistro()
  cargar()
})
</script>
