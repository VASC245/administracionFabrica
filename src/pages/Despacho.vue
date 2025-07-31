<template>
  <div class="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8 mt-10">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Control de Despacho</h2>

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
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Viajes de Tractor (30 fundas c/u)</label>
        <input v-model.number="viajeTractor" type="number" placeholder="Ej. 2 viajes"
          class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400" />
      </div>

      <!-- Viajes Coche -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Viajes de Coche (15 fundas c/u)</label>
        <input v-model.number="viajeCoche" type="number" placeholder="Ej. 3 viajes"
          class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400" />
      </div>

      <!-- Botones -->
      <div class="flex gap-4">
        <button @click="agregarViaje"
          class="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition w-full">
          Agregar Viajes
        </button>
        <button @click="resetFormulario"
          class="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition w-full">
          Reiniciar
        </button>
      </div>
    </div>

    <!-- Tabla de viajes -->
    <div v-if="viajes.length > 0" class="mt-8">
      <h3 class="text-xl font-bold text-gray-700 mb-4">Detalle de Viajes</h3>
      <table class="min-w-full border border-gray-300 rounded-lg text-sm">
        <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th class="px-4 py-3 border">#</th>
            <th class="px-4 py-3 border">Viajes Tractor</th>
            <th class="px-4 py-3 border">Viajes Coche</th>
            <th class="px-4 py-3 border">Fundas Totales</th>
            <th class="px-4 py-3 border text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(viaje, index) in viajes" :key="viaje.id" class="odd:bg-white even:bg-gray-50">
            <td class="px-4 py-2 border">{{ index + 1 }}</td>
            <td class="px-4 py-2 border">{{ viaje.tractor }} viajes</td>
            <td class="px-4 py-2 border">{{ viaje.coche }} viajes</td>
            <td class="px-4 py-2 border">{{ viaje.total }} fundas</td>
            <td class="px-4 py-2 border text-center flex gap-2 justify-center">
              <button @click="editarViaje(viaje)" class="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600">
                Editar
              </button>
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

const viajeTractor = ref(0)
const viajeCoche = ref(0)

const viajes = ref([])
const mostrarModal = ref(false)
const editando = ref(false)
const idEditando = ref(null)

const fechaInicio = ref('')
const fechaFin = ref('')

const fundasPorTonelada = 66
const tractorPorViaje = 30
const cochePorViaje = 15

const progreso = computed(() => metaFundas.value ? Math.min(((totalFundas.value / metaFundas.value) * 100).toFixed(0), 100) : 0)
const faltantes = computed(() => Math.max(metaFundas.value - totalFundas.value, 0))

const actualizarMeta = () => {
  metaFundas.value = cargaSeleccionada.value * fundasPorTonelada
  totalFundas.value = 0
  viajes.value = []
}

const agregarViaje = async () => {
  const totalViaje = (viajeTractor.value * tractorPorViaje) + (viajeCoche.value * cochePorViaje)
  if (totalViaje <= 0) {
    alert('Ingrese al menos un viaje.')
    return
  }

  if (editando.value) {
    await supabase.from('viajes_despacho').update({
      cantidad_viajes: viajeTractor.value + viajeCoche.value,
      fundas_calculadas: totalViaje
    }).eq('id', idEditando.value)
    editando.value = false
    idEditando.value = null
  } else {
    await supabase.from('viajes_despacho').insert([{
      tipo: viajeTractor.value > 0 ? 'tractor' : 'coche',
      cantidad_viajes: viajeTractor.value + viajeCoche.value,
      fundas_calculadas: totalViaje
    }])
  }

  await cargarViajes()
  viajeTractor.value = 0
  viajeCoche.value = 0
}

const editarViaje = (viaje) => {
  viajeTractor.value = viaje.tractor
  viajeCoche.value = viaje.coche
  editando.value = true
  idEditando.value = viaje.id
}

const eliminarViaje = async (id) => {
  if (confirm('¿Seguro que deseas eliminar este viaje?')) {
    await supabase.from('viajes_despacho').delete().eq('id', id)
    await cargarViajes()
  }
}

const resetFormulario = () => {
  cargaSeleccionada.value = ''
  metaFundas.value = 0
  totalFundas.value = 0
  viajeTractor.value = 0
  viajeCoche.value = 0
  viajes.value = []
}

const cerrarModal = () => mostrarModal.value = false

const cargarViajes = async () => {
  let query = supabase.from('viajes_despacho').select('*')
  if (fechaInicio.value && fechaFin.value) {
    query = query.gte('created_at', fechaInicio.value).lte('created_at', fechaFin.value)
  }
  const { data } = await query
  viajes.value = data.map(v => ({
    id: v.id,
    tractor: v.tipo === 'tractor' ? v.cantidad_viajes : 0,
    coche: v.tipo === 'coche' ? v.cantidad_viajes : 0,
    total: v.fundas_calculadas
  }))
  totalFundas.value = viajes.value.reduce((a, v) => a + v.total, 0)
}

const filtrarPorFechas = async () => {
  await cargarViajes()
}

onMounted(cargarViajes)
</script>
