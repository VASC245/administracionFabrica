<template>
  <div class="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8 mt-10">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Control de Entrega de Producto</h2>

    <!-- Fecha del despacho -->
    <div class="mb-6">
      <label class="block text-gray-700 text-sm font-medium mb-1">Fecha del despacho</label>
      <input
        type="date"
        v-model="fechaRegistro"
        class="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-400"
      />
    </div>

    <!-- Selección de carga -->
    <div class="mb-6">
      <label class="block text-sm font-semibold text-gray-700 mb-2">Seleccione Carga (Toneladas)</label>
      <select
        v-model="cargaSeleccionada"
        @change="iniciarNuevoDespacho"
        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
      >
        <option disabled value="">Seleccione...</option>
        <option value="24">24 Toneladas</option>
        <option value="20">20 Toneladas</option>
        <option value="15">15 Toneladas</option>
        <option value="10">10 Toneladas</option>
      </select>
    </div>

    <!-- Barra de progreso -->
    <div v-if="metaFundas > 0" class="mb-6">
      <p class="text-gray-700 mb-2">Progreso: {{ totalFundas }} / {{ metaFundas }} fundas</p>
      <div class="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <div
          class="bg-blue-600 h-6 text-center text-white text-sm font-semibold transition-all duration-500"
          :style="{ width: progreso + '%' }"
        >
          {{ progreso }}%
        </div>
      </div>
      <!-- Stock disponible -->
      <p class="mt-2 text-gray-800 font-semibold">
        Stock restante: <span :class="faltantes <= 0 ? 'text-green-600' : 'text-blue-600'">{{ faltantes }}</span> fundas
      </p>
    </div>

    <!-- Detalles -->
    <div v-if="metaFundas > 0" class="space-y-4">
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
          <input
            v-model.number="viajeTractor"
            type="number"
            class="w-32 border rounded-lg px-3 py-2 text-center"
            min="1"
          />
        </div>
        <button
          @click="agregarViaje('tractor')"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          + Agregar Tractor
        </button>
      </div>

      <!-- Viajes Coche -->
      <div class="flex items-center gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Viajes de Coche (15 fundas c/u)</label>
          <input
            v-model.number="viajeCoche"
            type="number"
            class="w-32 border rounded-lg px-3 py-2 text-center"
            min="1"
          />
        </div>
        <button
          @click="agregarViaje('coche')"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Agregar Coche
        </button>
      </div>

      <!-- Reiniciar -->
      <div>
        <button
          @click="resetFormulario"
          class="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition w-full mt-4"
        >
          Reiniciar
        </button>
      </div>
    </div>

    <!-- Historial -->
    <div v-if="despachos.length > 0" class="mt-8 overflow-x-auto">
      <h3 class="text-xl font-bold text-gray-700 mb-4">Historial de Despachos</h3>
      <table class="min-w-full border border-gray-300 rounded-lg text-sm">
        <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th class="px-4 py-3 border">Fecha</th>
            <th class="px-4 py-3 border">Toneladas</th>
            <th class="px-4 py-3 border">Meta Fundas</th>
            <th class="px-4 py-3 border">Fundas Entregadas</th>
            <th class="px-4 py-3 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in despachos" :key="d.id" class="odd:bg-white even:bg-gray-50">
            <td class="px-4 py-2 border">{{ d.fecha }}</td>
            <td class="px-4 py-2 border">{{ d.toneladas }}</td>
            <td class="px-4 py-2 border">{{ d.fundas_meta }}</td>
            <td class="px-4 py-2 border">{{ d.fundas_actual }}</td>
            <td class="px-4 py-2 border text-center">
              <button @click="eliminarDespacho(d.id)" class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">
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
        <button
          @click="cerrarModal"
          class="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition w-full"
        >
          Aceptar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// Estado
const fechaRegistro = ref(new Date().toISOString().split('T')[0])
const cargaSeleccionada = ref('')
const metaFundas = ref(0)
const totalFundas = ref(0)
const viajeTractor = ref(1)
const viajeCoche = ref(1)
const despachos = ref([])
const mostrarModal = ref(false)

const kgPorFunda = 15
const tractorPorViaje = 30
const cochePorViaje = 15

const progreso = computed(() =>
  metaFundas.value ? Math.min(((totalFundas.value / metaFundas.value) * 100).toFixed(0), 100) : 0
)
const faltantes = computed(() => Math.max(metaFundas.value - totalFundas.value, 0))

// ✅ Iniciar nuevo despacho
const iniciarNuevoDespacho = async () => {
  const toneladas = Number(cargaSeleccionada.value)
  const kilos = toneladas * 1000
  metaFundas.value = Math.floor(kilos / kgPorFunda)
  totalFundas.value = 0

  const { error } = await supabase.from('despachos').insert([{
    fecha: fechaRegistro.value,
    toneladas,
    fundas_meta: metaFundas.value,
    fundas_actual: 0
  }])

  if (error) {
    console.error("Error insertando despacho:", error)
    alert("Error al guardar despacho: " + error.message)
    return
  }

  await cargarDespachos()
}

// ✅ Agregar viaje
const agregarViaje = async (tipo) => {
  let cantidad = tipo === 'tractor' ? viajeTractor.value * tractorPorViaje : viajeCoche.value * cochePorViaje

  if (cantidad > faltantes.value) cantidad = faltantes.value
  totalFundas.value += cantidad

  const ultimoDespacho = despachos.value[0]
  if (ultimoDespacho) {
    const { error } = await supabase.from('despachos').update({
      fundas_actual: totalFundas.value
    }).eq('id', ultimoDespacho.id)

    if (error) {
      console.error("Error actualizando despacho:", error)
      alert("Error al actualizar despacho: " + error.message)
    }
  }

  if (totalFundas.value >= metaFundas.value) mostrarModal.value = true
  viajeTractor.value = 1
  viajeCoche.value = 1
}

// ✅ Cargar historial y actualizar estado actual
const cargarDespachos = async () => {
  const { data, error } = await supabase.from('despachos').select('*').order('id', { ascending: false })
  if (!error && data.length > 0) {
    despachos.value = data
    // Actualizar estado con el despacho más reciente
    metaFundas.value = data[0].fundas_meta
    totalFundas.value = data[0].fundas_actual
  }
}

// ✅ Eliminar
const eliminarDespacho = async (id) => {
  const { error } = await supabase.from('despachos').delete().eq('id', id)
  if (!error) await cargarDespachos()
}

const resetFormulario = () => {
  cargaSeleccionada.value = ''
  metaFundas.value = 0
  totalFundas.value = 0
  viajeTractor.value = 1
  viajeCoche.value = 1
}

const cerrarModal = () => mostrarModal.value = false

onMounted(cargarDespachos)
</script>
