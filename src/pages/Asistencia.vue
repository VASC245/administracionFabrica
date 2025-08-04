<template>
  <div class="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-8 mt-10">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Control Semanal de Asistencia</h2>

    <!-- Filtro por fecha -->
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
    </div>

    <!-- Botones de días -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
      <button
        v-for="(dia, index) in diasSemana"
        :key="index"
        @click="seleccionarDia(dia)"
        class="bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
      >
        {{ dia }}
      </button>
    </div>

    <!-- Formulario -->
    <div v-if="diaSeleccionado" class="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-700">
        {{ editMode ? 'Editar asistencia para' : 'Asistencia para' }} {{ diaSeleccionado }} ({{ fechaDelDia }})
      </h3>

      <!-- Lista de empleados -->
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-2">Selecciona empleados presentes:</label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <label v-for="empleado in empleados" :key="empleado" class="flex items-center gap-2">
            <input
              type="checkbox"
              :value="empleado"
              v-model="empleadosPresentes"
              class="w-5 h-5 text-blue-600 focus:ring-blue-500"
            />
            {{ empleado }}
          </label>
        </div>
      </div>

      <!-- Botones extra -->
      <div class="flex gap-4 mb-4">
        <button
          @click="marcarTodosPresentes"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Marcar Todos
        </button>
        <button
          @click="desmarcarTodos"
          class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Desmarcar Todos
        </button>
      </div>

      <!-- Guardar / Cancelar -->
      <div class="flex justify-between items-center mt-4">
        <span class="text-gray-700 font-medium">Hora actual: {{ horaActual }}</span>
        <div class="flex gap-4">
          <button
            @click="guardarAsistencia"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {{ editMode ? 'Actualizar' : 'Guardar' }}
          </button>
          <button
            @click="cancelarSeleccion"
            class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- BOTÓN MOSTRAR/OCULTAR TABLA -->
    <div class="text-center mb-6">
      <button
        @click="mostrarTabla = !mostrarTabla"
        class="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
      >
        {{ mostrarTabla ? 'Ocultar Registros' : 'Mostrar Registros' }}
      </button>
    </div>

    <!-- Tabla de registros -->
    <div v-if="mostrarTabla">
      <div
        v-for="(asistencias, dia) in registrosPorDia"
        :key="dia"
        class="mb-6"
      >
        <div class="flex justify-between items-center mb-3">
          <h4 class="text-lg font-bold text-gray-800">Registros para {{ dia }}</h4>
          <div class="flex gap-2">
            <button
              @click="editarDia(dia)"
              class="bg-yellow-500 text-white px-4 py-1 rounded-lg hover:bg-yellow-600 transition"
            >
              Editar
            </button>
            <button
              @click="eliminarDia(dia)"
              class="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition"
            >
              Eliminar
            </button>
          </div>
        </div>
        <table class="min-w-full border border-gray-300 rounded-lg">
          <thead class="bg-gray-100 text-gray-700 uppercase text-sm">
            <tr>
              <th class="px-4 py-3 border">Empleado</th>
              <th class="px-4 py-3 border">Estado</th>
              <th class="px-4 py-3 border">Hora</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="empleado in empleados"
              :key="empleado"
              class="odd:bg-white even:bg-gray-50"
            >
              <td class="px-4 py-2 border">{{ empleado }}</td>
              <td class="px-4 py-2 border">
                <span
                  :class="asistencias.presentes.includes(empleado) ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'"
                >
                  {{ asistencias.presentes.includes(empleado) ? 'Presente' : 'Ausente' }}
                </span>
              </td>
              <td class="px-4 py-2 border">
                {{ asistencias.presentes.includes(empleado) ? asistencias.hora : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// Empleados y días
const empleados = ['Igor','Gabriel','Jorge Luis','Alex','Chavo','Marco Meneses']
const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// Estado
const diaSeleccionado = ref(null)
const empleadosPresentes = ref([])
const registrosPorDia = reactive({})
const fechaDelDia = ref('')
const horaActual = ref('')
const editMode = ref(false)
const diaEnEdicion = ref(null)

// Filtro por fechas
const fechaInicio = ref('')
const fechaFin = ref('')
const mostrarTabla = ref(true) // ✅ Nuevo estado para mostrar/ocultar tabla

// Actualizar hora
const actualizarHora = () => {
  const now = new Date()
  horaActual.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

// Cargar registros desde Supabase
const cargarRegistros = async (filtro = false) => {
  let query = supabase.from('asistencia').select('*')

  if (filtro && fechaInicio.value && fechaFin.value) {
    query = query.gte('fecha', fechaInicio.value).lte('fecha', fechaFin.value)
  }

  const { data, error } = await query
  if (!error && data) {
    Object.keys(registrosPorDia).forEach((k) => delete registrosPorDia[k])
    data.forEach((r) => {
      registrosPorDia[r.dia] = {
        presentes: r.empleados_presentes,
        hora: r.hora
      }
    })
  }
}

const filtrarPorFechas = () => {
  cargarRegistros(true)
}

onMounted(() => {
  actualizarHora()
  setInterval(actualizarHora, 60000)
  cargarRegistros()
})

// Seleccionar día
const seleccionarDia = (dia) => {
  diaSeleccionado.value = dia
  empleadosPresentes.value = []
  fechaDelDia.value = new Date().toISOString().split('T')[0]
  editMode.value = false
  diaEnEdicion.value = null
}

// Guardar asistencia
const guardarAsistencia = async () => {
  const registro = {
    dia: diaSeleccionado.value,
    fecha: fechaDelDia.value,
    empleados_presentes: empleadosPresentes.value,
    hora: horaActual.value
  }

  if (editMode.value) {
    await supabase.from('asistencia').update(registro).eq('dia', diaEnEdicion.value)
  } else {
    await supabase.from('asistencia').insert([registro])
  }

  registrosPorDia[diaSeleccionado.value] = {
    presentes: [...empleadosPresentes.value],
    hora: horaActual.value
  }

  diaSeleccionado.value = null
  empleadosPresentes.value = []
  editMode.value = false
}

// Editar registro
const editarDia = (dia) => {
  diaSeleccionado.value = dia
  empleadosPresentes.value = [...registrosPorDia[dia].presentes]
  fechaDelDia.value = new Date().toISOString().split('T')[0]
  editMode.value = true
  diaEnEdicion.value = dia
}

// Eliminar registro
const eliminarDia = async (dia) => {
  if (confirm(`¿Seguro que deseas eliminar el registro de ${dia}?`)) {
    await supabase.from('asistencia').delete().eq('dia', dia)
    delete registrosPorDia[dia]
  }
}

// Cancelar
const cancelarSeleccion = () => {
  diaSeleccionado.value = null
  empleadosPresentes.value = []
  editMode.value = false
}

// Marcar todos
const marcarTodosPresentes = () => empleadosPresentes.value = [...empleados]

// Desmarcar
const desmarcarTodos = () => empleadosPresentes.value = []
</script>
