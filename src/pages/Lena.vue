<template>
  <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
    <!-- Título -->
    <h2 class="text-3xl font-bold mb-6 text-gray-800 text-center">Registro de Leña</h2>

    <!-- Formulario -->
    <form @submit.prevent="guardarLena" class="space-y-6 mb-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Fecha -->
        <div>
          <label class="block text-gray-700 font-semibold mb-1">Fecha</label>
          <input
            type="date"
            v-model="form.fecha"
            class="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>

        <!-- Proveedor -->
        <div>
          <label class="block text-gray-700 font-semibold mb-1">Proveedor</label>
          <input
            type="text"
            v-model="form.proveedor"
            placeholder="Nombre del proveedor"
            class="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>

        <!-- Metros cúbicos -->
        <div>
          <label class="block text-gray-700 font-semibold mb-1">Metros Cúbicos</label>
          <input
            type="number"
            step="0.01"
            v-model="form.metros_cubicos"
            placeholder="Ej: 2.5"
            class="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none"
            required
          />
        </div>
      </div>

      <!-- Botón Guardar -->
      <div>
        <button
          type="submit"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
          :disabled="loading"
        >
          {{ loading ? 'Guardando...' : 'Guardar Registro' }}
        </button>
      </div>
    </form>

    <!-- Lista Historial -->
    <div>
      <h3 class="text-xl font-semibold mb-4 text-gray-700">Historial</h3>
      <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table class="min-w-full bg-white">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Fecha</th>
              <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Proveedor</th>
              <th class="px-4 py-2 text-left text-sm font-semibold text-gray-700">Metros³</th>
              <th class="px-4 py-2 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in lenaList"
              :key="item.id"
              class="hover:bg-gray-50 border-t border-gray-200"
            >
              <td class="px-4 py-2 text-sm">{{ item.fecha }}</td>
              <td class="px-4 py-2 text-sm">{{ item.proveedor }}</td>
              <td class="px-4 py-2 text-sm">{{ item.metros_cubicos }} m³</td>
              <td class="px-4 py-2 text-center">
                <button
                  @click="eliminarLena(item.id)"
                  class="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Eliminar
                </button>
              </td>
            </tr>
            <tr v-if="lenaList.length === 0">
              <td colspan="4" class="text-center py-4 text-gray-500">No hay registros aún.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// ✅ Función para obtener fecha actual en formato YYYY-MM-DD
const obtenerFechaHoy = () => {
  const hoy = new Date()
  return hoy.toISOString().split('T')[0]
}

const form = ref({ fecha: obtenerFechaHoy(), proveedor: '', metros_cubicos: '' })
const lenaList = ref([])
const loading = ref(false)

const cargarLena = async () => {
  const { data, error } = await supabase.from('lena').select('*').order('fecha', { ascending: false })
  if (!error) lenaList.value = data
}

const guardarLena = async () => {
  loading.value = true
  const { error } = await supabase.from('lena').insert([form.value])
  if (!error) {
    await cargarLena()
    form.value = { fecha: obtenerFechaHoy(), proveedor: '', metros_cubicos: '' }
  } else {
    console.error(error)
  }
  loading.value = false
}

const eliminarLena = async (id) => {
  const { error } = await supabase.from('lena').delete().eq('id', id)
  if (!error) await cargarLena()
}

onMounted(cargarLena)
</script>
