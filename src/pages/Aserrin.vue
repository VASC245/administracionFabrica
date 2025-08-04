<template>
  <div class="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8 mt-10">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Registro de Ingreso de Aserrín</h2>

    <!-- Mensaje de éxito -->
    <div v-if="mensaje" class="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 text-center font-semibold">
      {{ mensaje }}
    </div>

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
    <div class="space-y-6 mb-10">
      <!-- Proveedor -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Proveedor</label>
        <input
          v-model="proveedor"
          type="text"
          placeholder="Ingrese proveedor"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        />
      </div>

      <!-- Palas -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Número de Palas</label>
        <div class="flex items-center gap-4">
          <input
            disabled
            v-model.number="totalPalas"
            type="number"
            class="w-32 border rounded-lg px-3 py-2 text-center"
            min="1"
            @input="calcularPeso"
          />
          <button
            @click="agregarPala"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Agregar Pala
          </button>
        </div>
      </div>

      <!-- Peso calculado -->
      <p class="text-gray-700 font-semibold">Peso Total: {{ totalPeso }} kg</p>

      <!-- Botones Finalizar y Cancelar -->
      <div class="flex gap-4">
        <button
          @click="mostrarModal = true"
          class="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition w-full"
        >
          Finalizar Descarga
        </button>
        <button
          @click="cancelar"
          class="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition w-full"
        >
          Cancelar
        </button>
      </div>
    </div>

    <!-- MODAL PARA HUMEDAD -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
        <h3 class="text-xl font-bold text-gray-700 mb-4">Registrar Humedad</h3>
        <input
          v-model="humedad"
          type="text"
          placeholder="Ej: 15%"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
        />
        <div class="flex gap-4">
          <button
            @click="finalizarDescarga"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full"
          >
            Guardar
          </button>
          <button
            @click="mostrarModal = false"
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- BOTÓN MOSTRAR/OCULTAR TABLA -->
    <div class="text-center my-6">
      <button
        @click="mostrarTabla = !mostrarTabla"
        class="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
      >
        {{ mostrarTabla ? 'Ocultar Registros' : 'Mostrar Registros' }}
      </button>
    </div>

    <!-- TABLA -->
    <div v-if="mostrarTabla">
      <div v-if="registros.length > 0" class="mt-10">
        <h3 class="text-xl font-bold text-gray-700 mb-4">Registros Guardados</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-300 rounded-lg text-sm">
            <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th class="px-4 py-3 border">Fecha</th>
                <th class="px-4 py-3 border">Proveedor</th>
                <th class="px-4 py-3 border">Humedad</th>
                <th class="px-4 py-3 border">Palas</th>
                <th class="px-4 py-3 border">Peso (kg)</th>
                <th class="px-4 py-3 border text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="registro in registros" :key="registro.id" class="odd:bg-white even:bg-gray-50">
                <td class="px-4 py-2 border">{{ registro.fecha }}</td>
                <td class="px-4 py-2 border">{{ registro.proveedor }}</td>
                <td class="px-4 py-2 border">{{ registro.humedad || '-' }}</td>
                <td class="px-4 py-2 border">{{ registro.palas }}</td>
                <td class="px-4 py-2 border">{{ registro.peso_kg }}</td>
                <td class="px-4 py-2 border text-center space-x-2">
                  <button
                    @click="editarRegistro(registro)"
                    class="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition"
                  >
                    Editar
                  </button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const proveedor = ref('')
const totalPalas = ref(1)
const totalPeso = ref(170)
const humedad = ref('')
const mostrarModal = ref(false)
const mensaje = ref('')

const registros = ref([])
const editMode = ref(false)
const idEditando = ref(null)

const fechaInicio = ref('')
const fechaFin = ref('')

// ✅ Estado para mostrar/ocultar tabla
const mostrarTabla = ref(true)

// Calcular peso
const calcularPeso = () => {
  if (totalPalas.value < 1) totalPalas.value = 1
  totalPeso.value = totalPalas.value * 170
}

// Agregar pala
const agregarPala = () => {
  totalPalas.value += 1
  calcularPeso()
}

// Cancelar
const cancelar = () => {
  proveedor.value = ''
  totalPalas.value = 1
  calcularPeso()
  humedad.value = ''
  editMode.value = false
  idEditando.value = null
}

// Guardar en base de datos
const finalizarDescarga = async () => {
  if (!proveedor.value) {
    alert('Ingrese proveedor')
    return
  }

  const registro = {
    fecha: new Date().toISOString().split('T')[0],
    proveedor: proveedor.value,
    humedad: humedad.value || null,
    palas: totalPalas.value,
    peso_kg: totalPeso.value
  }

  let error
  if (editMode.value) {
    const res = await supabase.from('aserrin').update(registro).eq('id', idEditando.value)
    error = res.error
  } else {
    const res = await supabase.from('aserrin').insert([registro])
    error = res.error
  }

  if (error) {
    console.error('Error al guardar en Supabase:', error)
    alert('No se pudo guardar en la base de datos')
    return
  }

  mensaje.value = 'Registro guardado exitosamente ✅'
  setTimeout(() => (mensaje.value = ''), 3000)

  cancelar()
  mostrarModal.value = false
  await cargar()
}

// Cargar datos
const cargar = async () => {
  const { data, error } = await supabase.from('aserrin').select('*').order('fecha', { ascending: false })
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

const resetFiltro = () => {
  fechaInicio.value = ''
  fechaFin.value = ''
  cargar()
}

// Editar
const editarRegistro = (registro) => {
  proveedor.value = registro.proveedor
  totalPalas.value = registro.palas
  calcularPeso()
  humedad.value = registro.humedad
  editMode.value = true
  idEditando.value = registro.id
}

// Eliminar
const eliminarRegistro = async (id) => {
  await supabase.from('aserrin').delete().eq('id', id)
  await cargar()
}

onMounted(() => {
  calcularPeso()
  cargar()
})
</script>
