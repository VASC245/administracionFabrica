<template>
  <div class="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8 mt-10">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Formulario de Carga</h2>

    <!-- Selección de carga -->
    <div class="mb-6">
      <label class="block text-sm font-semibold text-gray-700 mb-2">Cantidad de Carga</label>
      <select v-model="cargaSeleccionada" @change="actualizarMeta"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none">
        <option disabled value="">Seleccione la carga</option>
        <option value="24">24 Toneladas</option>
        <option value="20">20 Toneladas</option>
        <option value="15">15 Toneladas</option>
        <option value="10">10 Toneladas</option>
      </select>
    </div>

    <!-- Barra de progreso -->
    <div v-if="cargaSeleccionada" class="mb-6">
      <p class="text-gray-700 mb-2">Progreso de carga:</p>
      <div class="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <div
          class="bg-blue-600 h-6 text-center text-white text-sm font-semibold transition-all duration-500"
          :style="{ width: progreso + '%' }"
        >
          {{ progreso }}%
        </div>
      </div>
    </div>

    <!-- Info -->
    <div v-if="cargaSeleccionada" class="mb-6">
      <p class="text-gray-700 font-medium">
        Meta: <span class="text-blue-600 font-bold">{{ metaFundas }}</span> fundas
      </p>
      <p class="text-gray-700 font-medium">
        Total actual: <span :class="totalFundas >= metaFundas ? 'text-green-600 font-bold' : 'text-gray-800 font-bold'">{{ totalFundas }}</span> fundas
      </p>
      <p v-if="totalFundas < metaFundas" class="text-yellow-600 font-semibold">
        Faltan: {{ metaFundas - totalFundas }} fundas
      </p>
      <p v-else class="text-green-600 font-bold">¡Carga completa!</p>
    </div>

    <!-- Inputs -->
    <div v-if="cargaSeleccionada" class="space-y-4">
      <!-- Viajes Tractor -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Viajes de Tractor (30 fundas por viaje)</label>
        <input v-model.number="viajeTractor" type="number" placeholder="Ej. 2 viajes"
          class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
      </div>

      <!-- Viajes Coche -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Viajes de Coche (15 fundas por viaje)</label>
        <input v-model.number="viajeCoche" type="number" placeholder="Ej. 3 viajes"
          class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
      </div>

      <!-- Botones -->
      <div class="flex gap-4">
        <button @click="agregarViaje" :disabled="totalFundas >= metaFundas"
          :class="totalFundas >= metaFundas ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'"
          class="text-white px-6 py-3 rounded-lg font-semibold transition w-full">
          Agregar Viajes
        </button>
        <button @click="resetFormulario"
          class="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition w-full">
          Reiniciar
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div v-if="viajes.length > 0" class="mt-8">
      <h3 class="text-xl font-bold text-gray-700 mb-4">Viajes Realizados</h3>
      <table class="min-w-full border border-gray-300 rounded-lg">
        <thead class="bg-gray-100 text-gray-700 uppercase text-sm">
          <tr>
            <th class="px-4 py-3 border">#</th>
            <th class="px-4 py-3 border">Viajes Tractor</th>
            <th class="px-4 py-3 border">Viajes Coche</th>
            <th class="px-4 py-3 border">Fundas Totales</th>
            <th class="px-4 py-3 border text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(viaje, index) in viajes" :key="index" class="odd:bg-white even:bg-gray-50">
            <td class="px-4 py-2 border">{{ index + 1 }}</td>
            <td class="px-4 py-2 border">{{ viaje.tractor }} viajes</td>
            <td class="px-4 py-2 border">{{ viaje.coche }} viajes</td>
            <td class="px-4 py-2 border">{{ viaje.total }} fundas</td>
            <td class="px-4 py-2 border text-center">
              <button @click="eliminarViaje(index)"
                class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="mostrarModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
        <h2 class="text-2xl font-bold text-green-600 mb-4">¡Carga Completada!</h2>
        <p class="text-gray-700 mb-6">Se alcanzaron las <strong>{{ metaFundas }}</strong> fundas.</p>
        <button @click="cerrarModal"
          class="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition w-full">
          Aceptar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const cargaSeleccionada = ref('')
const metaFundas = ref(0)
const totalFundas = ref(0)

const viajeTractor = ref(0)
const viajeCoche = ref(0)

const viajes = ref([])
const mostrarModal = ref(false)

const fundasPorTonelada = 66
const tractorPorViaje = 30
const cochePorViaje = 15

const progreso = computed(() => {
  if (!metaFundas.value) return 0
  return Math.min(((totalFundas.value / metaFundas.value) * 100).toFixed(0), 100)
})

const actualizarMeta = () => {
  metaFundas.value = cargaSeleccionada.value * fundasPorTonelada
  totalFundas.value = 0
  viajes.value = []
}

const agregarViaje = () => {
  if (viajeTractor.value < 0 || viajeCoche.value < 0) {
    alert('Ingrese valores positivos.')
    return
  }

  const totalFundasViaje = (viajeTractor.value * tractorPorViaje) + (viajeCoche.value * cochePorViaje)

  if (totalFundasViaje <= 0) {
    alert('Debe ingresar al menos un viaje.')
    return
  }

  totalFundas.value += totalFundasViaje

  viajes.value.push({
    tractor: viajeTractor.value,
    coche: viajeCoche.value,
    total: totalFundasViaje
  })

  viajeTractor.value = 0
  viajeCoche.value = 0

  if (totalFundas.value >= metaFundas.value) {
    mostrarModal.value = true
  }
}

const eliminarViaje = (index) => {
  totalFundas.value -= viajes.value[index].total
  viajes.value.splice(index, 1)
}

const resetFormulario = () => {
  cargaSeleccionada.value = ''
  metaFundas.value = 0
  totalFundas.value = 0
  viajeTractor.value = 0
  viajeCoche.value = 0
  viajes.value = []
}

const cerrarModal = () => {
  mostrarModal.value = false
}
</script>
