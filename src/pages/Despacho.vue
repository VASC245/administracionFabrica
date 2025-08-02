<template>
  <div class="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8 mt-10">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Control de Entrega de Producto</h2>

    <!-- Filtro por fechas -->
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
    </div>

    <!-- Formulario de carga -->
    <div class="mb-6">
      <label class="block text-sm font-semibold text-gray-700 mb-2">Seleccione Carga (Toneladas)</label>
      <select v-model="cargaSeleccionada" @change="actualizarMeta"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400">
        <option disabled value="">Seleccione...</option>
        <option value="24">24 Toneladas</option>
        <option value="20">20 Toneladas</option>
        <option value="15">15 Toneladas</option>
        <option value="10">10 Toneladas</option>
      </select>
    </div>

    <!-- Barra de progreso -->
    <div v-if="cargaSeleccionada" class="mb-6">
      <p class="text-gray-700 mb-2">Progreso: {{ totalFundas }} / {{ metaFundas }} fundas</p>
      <div class="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <div class="bg-blue-600 h-6 text-center text-white text-sm font-semibold transition-all duration-500"
          :style="{ width: progreso + '%' }">
          {{ progreso }}%
        </div>
      </div>
    </div>

    <!-- Formulario viajes -->
    <div v-if="cargaSeleccionada" class="space-y-4">
      <p class="text-gray-700 font-medium">
        Meta: <span class="text-blue-600 font-bold">{{ metaFundas }}</span> fundas
      </p>
      <p class="text-gray-700">
        Faltan:
        <span :class="faltantes <= 0 ? 'text-green-600 font-bold' : 'text-gray-800 font-bold'">{{ faltantes }}</span>
        fundas
      </p>

      <!-- Viajes Tractor -->
      <div class="flex items-center gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Viajes de Tractor (30 fundas c/u)</label>
          <input v-model.number="viajeTractor" type="number"
            class="w-32 border rounded-lg px-3 py-2 text-center" min="1" />
        </div>
        <button @click="agregarViajeTractor"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
          + Agregar Tractor
        </button>
      </div>

      <!-- Viajes Coche -->
      <div class="flex items-center gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Viajes de Coche (15 fundas c/u)</label>
          <input v-model.number="viajeCoche" type="number"
            class="w-32 border rounded-lg px-3 py-2 text-center" min="1" />
        </div>
        <button @click="agregarViajeCoche"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Agregar Coche
        </button>
      </div>

      <!-- Botón Reiniciar -->
      <div>
        <button @click="resetFormulario"
          class="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition w-full mt-4">
          Reiniciar
        </button>
      </div>
    </div>

    <!-- Tabla de viajes -->
    <div v-if="viajes.length > 0" class="mt-8 overflow-x-auto">
      <h3 class="text-xl font-bold text-gray-700 mb-4">Detalle de Viajes</h3>
      <table class="min-w-full border border-gray-300 rounded-lg text-sm">
        <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th class="px-4 py-3 border">#</th>
            <th class="px-4 py-3 border">Tipo</th>
            <th class="px-4 py-3 border">Cantidad de Viajes</th>
            <th class="px-4 py-3 border">Fundas Totales</th>
            <th class="px-4 py-3 border text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(viaje, index) in viajes" :key="viaje.id" class="odd:bg-white even:bg-gray-50">
            <td class="px-4 py-2 border">{{ index + 1 }}</td>
            <td class="px-4 py-2 border capitalize">{{ viaje.tipo }}</td>
            <td class="px-4 py-2 border">{{ viaje.cantidad_viajes }}</td>
            <td class="px-4 py-2 border">{{ viaje.fundas_calculadas }}</td>
            <td class="px-4 py-2 border text-center flex gap-2 justify-center">
              <button @click="eliminarViaje(viaje.id)"
                class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal completado -->
    <div v-if="mostrarModal"
      class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
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
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const cargaSeleccionada = ref('')
const metaFundas = ref(0)
const totalFundas = ref(0)

const viajeTractor = ref(1) // ✅ Siempre inicia en 1
const viajeCoche = ref(1) // ✅ Siempre inicia en 1

const viajes = ref([])
const mostrarModal = ref(false)

const fechaInicio = ref('')
const fechaFin = ref('')

// ✅ 15 kg por funda
const kgPorFunda = 15
const tractorPorViaje = 30
const cochePorViaje = 15

const progreso = computed(() =>
  metaFundas.value ? Math.min(((totalFundas.value / metaFundas.value) * 100).toFixed(0), 100) : 0
)
const faltantes = computed(() => Math.max(metaFundas.value - totalFundas.value, 0))

const actualizarMeta = () => {
  const toneladas = Number(cargaSeleccionada.value)
  const kilos = toneladas * 1000
  metaFundas.value = Math.floor(kilos / kgPorFunda) // ✅ cálculo corregido sin decimales
  totalFundas.value = viajes.value.reduce((a, v) => a + v.fundas_calculadas, 0)
}

const agregarViajeTractor = async () => {
  const totalViaje = viajeTractor.value * tractorPorViaje
  await supabase.from('viajes_despacho').insert([{
    tipo: 'tractor',
    cantidad_viajes: viajeTractor.value,
    fundas_calculadas: totalViaje
  }])
  await cargarViajes()
  viajeTractor.value = 1
  if (totalFundas.value >= metaFundas.value) mostrarModal.value = true
}

const agregarViajeCoche = async () => {
  const totalViaje = viajeCoche.value * cochePorViaje
  await supabase.from('viajes_despacho').insert([{
    tipo: 'coche',
    cantidad_viajes: viajeCoche.value,
    fundas_calculadas: totalViaje
  }])
  await cargarViajes()
  viajeCoche.value = 1
  if (totalFundas.value >= metaFundas.value) mostrarModal.value = true
}

const eliminarViaje = async (id) => {
  await supabase.from('viajes_despacho').delete().eq('id', id)
  await cargarViajes()
}

const resetFormulario = () => {
  cargaSeleccionada.value = ''
  metaFundas.value = 0
  totalFundas.value = 0
  viajeTractor.value = 1
  viajeCoche.value = 1
  viajes.value = []
}

const cerrarModal = () => mostrarModal.value = false

const cargarViajes = async () => {
  let query = supabase.from('viajes_despacho').select('*').order('id', { ascending: true })

  if (fechaInicio.value && fechaFin.value) {
    query = query.gte('created_at', fechaInicio.value).lte('created_at', fechaFin.value)
  }

  const { data, error } = await query
  if (error) return console.error('Error cargando viajes:', error)

  viajes.value = data
  totalFundas.value = viajes.value.reduce((a, v) => a + v.fundas_calculadas, 0)
}

const filtrarPorFechas = async () => await cargarViajes()

onMounted(cargarViajes)
</script>
