<template>
  <div class="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
    <h2 class="text-2xl font-bold mb-6 text-gray-700">Registro de Leña</h2>

    <!-- Formulario -->
    <form @submit.prevent="guardarLena" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-semibold">Fecha</label>
        <input type="date" v-model="form.fecha" class="border rounded px-3 py-2 w-full" required />
      </div>
      <div>
        <label class="block text-gray-700 font-semibold">Metros Cúbicos</label>
        <input type="number" step="0.01" v-model="form.metros_cubicos" class="border rounded px-3 py-2 w-full" required />
      </div>
      <div>
        <label class="block text-gray-700 font-semibold">Proveedor</label>
        <input type="text" v-model="form.proveedor" class="border rounded px-3 py-2 w-full" required />
      </div>
      <button class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar' }}
      </button>
    </form>

    <!-- Lista -->
    <div class="mt-8">
      <h3 class="text-xl font-semibold mb-4">Historial</h3>
      <table class="w-full text-sm border border-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">Fecha</th>
            <th class="p-2 border">Metros³</th>
            <th class="p-2 border">Proveedor</th>
            <th class="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in lenaList" :key="item.id">
            <td class="p-2 border">{{ item.fecha }}</td>
            <td class="p-2 border">{{ item.metros_cubicos }}</td>
            <td class="p-2 border">{{ item.proveedor }}</td>
            <td class="p-2 border">
              <button @click="eliminarLena(item.id)" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const form = ref({ fecha: '', metros_cubicos: '', proveedor: '' })
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
    form.value = { fecha: '', metros_cubicos: '', proveedor: '' }
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
