<template>
  <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-10">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Producción del dia</h2>
    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Fecha -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
        <input v-model="form.fecha" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
      </div>
      <!-- Fundas -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Fundas 15kg</label>
        <input v-model.number="form.fundas" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="Cantidad de Fundas" />
      </div>

      <!-- Botón Guardar -->
      <div class="text-center">
        <button type="submit" class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full">
          Guardar Registro
        </button>
      </div>
    </form>


    <div v-if="registros.length > 0" class="mt-10">
      <h3 class="text-xl font-bold text-gray-700 mb-4">Registros Guardados</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left border border-gray-300 rounded-lg overflow-hidden">
          <thead class="bg-gray-100 text-gray-700 uppercase text-sm">
            <tr>
              <th class="px-4 py-3 border">Fecha</th>
              <th class="px-4 py-3 border">Fundas (15kg)</th>
              <th class="px-4 py-3 border text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(registro, index) in registros" :key="index" class="odd:bg-white even:bg-gray-50 hover:bg-blue-50">
              <td class="px-4 py-2 border">{{ registro.fecha }}</td>
              <td class="px-4 py-2 border">{{ registro.fundas }}</td>
              <td class="px-4 py-2 border text-center">
                <button @click="eliminarRegistro(index)" class="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>


</template>

<script setup>
import { ref , reactive } from 'vue';


const form = reactive({
  fecha: '',
  fundas: null,
})


const registros = ref([])

// Guardar registro
const submitForm = () => {
  if (!form.fecha || form.fundas === null) {
    alert('Por favor complete todos los campos')
    return
  }

  //Agregar al registro de la lista
  registros.value.push({ ...form})

  //Limpiar formulario

  form.fecha = '',
  form.fundas = null

}

// Eliminar registro
const eliminarRegistro = (index) => {
  registros.value.splice(index, 1)
}

</script>
