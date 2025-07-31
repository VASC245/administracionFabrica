<template>
  <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-10">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Registro Ingreso de Aserrín</h2>

    <!-- FILTRO DE FECHAS -->
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <div>
        <label class="block text-gray-700 text-sm font-medium mb-1">Desde:</label>
        <input
          type="date"
          v-model="fechaInicio"
          class="border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-medium mb-1">Hasta:</label>
        <input
          type="date"
          v-model="fechaFin"
          class="border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>
      <button
        @click="filtrarPorFechas"
        class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
      >
        Filtrar
      </button>
      <button
        @click="resetFiltro"
        class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
      >
        Limpiar
      </button>
    </div>

    <!-- FORMULARIO -->
    <form @submit.prevent="guardar" class="space-y-6 mb-10">
      <!-- Fecha -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
        <input
          v-model="nuevo.fecha"
          type="date"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        />
      </div>

      <!-- Proveedor -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Proveedor</label>
        <input
          v-model="nuevo.proveedor"
          type="text"
          placeholder="Proveedor"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        />
      </div>

      <!-- Humedad -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Humedad</label>
        <input
          v-model="nuevo.humedad"
          type="text"
          placeholder="Ej: 15%"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <!-- Palas -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Palas</label>
        <input
          v-model.number="nuevo.palas"
          type="number"
          placeholder="Cantidad de palas"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <!-- BOTÓN GUARDAR / ACTUALIZAR -->
      <div class="text-center">
        <button
          type="submit"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
        >
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
              <th class="px-4 py-3 border">Proveedor</th>
              <th class="px-4 py-3 border">Humedad</th>
              <th class="px-4 py-3 border">Palas</th>
              <th class="px-4 py-3 border text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="registro in registros"
              :key="registro.id"
              class="odd:bg-white even:bg-gray-50"
            >
              <td class="px-4 py-2 border">{{ registro.fecha }}</td>
              <td class="px-4 py-2 border">{{ registro.proveedor }}</td>
              <td class="px-4 py-2 border">{{ registro.humedad }} %</td>
              <td class="px-4 py-2 border">{{ registro.palas }}</td>
              <td class="px-4 py-2 border text-center space-x-2">
                <!-- BOTÓN EDITAR -->
                <button
                  @click="editarRegistro(registro)"
                  class="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition"
                >
                  Editar
                </button>
                <!-- BOTÓN ELIMINAR -->
                <button
                  @click="eliminarRegistro(registro.id)"
                  class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="text-gray-500 text-center mt-6">
      No hay registros en este rango de fechas.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const registros = ref([])
const nuevo = ref({ fecha: '', proveedor: '', humedad: '', palas: null })
const editMode = ref(false)
const idEditando = ref(null)

// Filtro por fechas
const fechaInicio = ref('')
const fechaFin = ref('')

// Cargar todos los registros
const cargar = async () => {
  const { data, error } = await supabase
    .from('aserrin')
    .select('*')
    .order('fecha', { ascending: false })
  if (!error) registros.value = data || []
}

// Filtrar por fechas
const filtrarPorFechas = async () => {
  let query = supabase.from('aserrin').select('*').order('fecha', { ascending: false })

  if (fechaInicio.value && fechaFin.value) {
    query = query.gte('fecha', fechaInicio.value).lte('fecha', fechaFin.value)
  }

  const { data, error } = await query
  if (!error) registros.value = data || []
}

// Resetear filtro
const resetFiltro = () => {
  fechaInicio.value = ''
  fechaFin.value = ''
  cargar()
}

// Guardar o actualizar
const guardar = async () => {
  if (editMode.value) {
    const { error } = await supabase
      .from('aserrin')
      .update({
        fecha: nuevo.value.fecha,
        proveedor: nuevo.value.proveedor,
        humedad: nuevo.value.humedad,
        palas: nuevo.value.palas
      })
      .eq('id', idEditando.value)
    if (!error) {
      editMode.value = false
      idEditando.value = null
      nuevo.value = { fecha: '', proveedor: '', humedad: '', palas: null }
      await cargar()
    }
  } else {
    const { error } = await supabase.from('aserrin').insert([nuevo.value])
    if (!error) {
      nuevo.value = { fecha: '', proveedor: '', humedad: '', palas: null }
      await cargar()
    }
  }
}

// Editar registro
const editarRegistro = (registro) => {
  editMode.value = true
  idEditando.value = registro.id
  nuevo.value = {
    fecha: registro.fecha,
    proveedor: registro.proveedor,
    humedad: registro.humedad,
    palas: registro.palas
  }
}

// Eliminar registro
const eliminarRegistro = async (id) => {
  const { error } = await supabase.from('aserrin').delete().eq('id', id)
  if (!error) await cargar()
}

onMounted(cargar)
</script>

