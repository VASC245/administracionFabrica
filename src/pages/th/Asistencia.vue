<template>
  <div class="max-w-6xl mx-auto bg-white shadow-xl rounded-xl p-8 mt-10">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Control Semanal de Asistencia</h2>

    <!-- Filtro por fecha -->
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
      <button
        @click="resetHoy"
        class="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
        title="Volver a mostrar solo hoy"
      >
        Hoy
      </button>
    </div>

    <!-- Info Jornada (automática) -->
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
      <h3 class="text-lg font-semibold text-gray-800 mb-1">Jornada automática</h3>
      <p class="text-sm text-gray-600">
        Se registra <b>Inicio</b> a las <b>06:30</b> y <b>Fin</b> a las <b>18:30</b> (hora local).
      </p>

      <div v-if="jornadaHoy.length" class="mt-3">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Marcaciones de hoy</h4>
        <ul class="list-disc pl-6 text-sm text-gray-700">
          <li v-for="j in jornadaHoy" :key="j.id">
            <span class="font-medium capitalize">{{ j.tipo }}</span> — {{ j.fecha }} {{ j.hora }}
          </li>
        </ul>
      </div>
      <p v-else class="text-sm text-gray-500 mt-2">Sin marcaciones registradas hoy.</p>
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
        {{ editMode ? 'Editar asistencia para' : 'Asistencia para' }} {{ diaSeleccionado }} ({{ hoyISO() }})
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
      <p class="text-xs text-gray-500 mt-2">
        {{ usandoFiltro ? 'Mostrando rango seleccionado' : 'Mostrando solo registros de HOY' }}
      </p>
    </div>

    <!-- Tabla de registros -->
    <div v-if="mostrarTabla">
      <div v-for="(asistencias, dia) in registrosPorDia" :key="dia" class="mb-6">
        <div class="flex justify-between items-center mb-3">
          <h4 class="text-lg font-bold text-gray-800">Registros para {{ dia }}</h4>
          <div class="flex gap-2">
            <button
              @click="pedirClave('edit', dia)"
              class="bg-yellow-500 text-white px-4 py-1 rounded-lg hover:bg-yellow-600 transition"
            >
              Editar
            </button>
            <button
              @click="pedirClave('delete', dia)"
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
            <tr v-for="empleado in empleados" :key="empleado" class="odd:bg-white even:bg-gray-50">
              <td class="px-4 py-2 border">{{ empleado }}</td>
              <td class="px-4 py-2 border">
                <span :class="asistencias.presentes.includes(empleado) ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                  {{ asistencias.presentes.includes(empleado) ? 'Presente' : 'Ausente' }}
                </span>
              </td>
              <td class="px-4 py-2 border">
                {{ asistencias.presentes.includes(empleado) ? asistencias.hora : '-' }}
              </td>
            </tr>
          </tbody>
        </table>
        <p class="text-xs text-gray-500 mt-2">Fecha: {{ asistencias.fecha }}</p>
      </div>
    </div>

    <!-- MODAL CLAVE -->
    <div v-if="showPwd" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" @keydown.esc="closePwd">
      <div class="bg-white w-full max-w-sm rounded-xl shadow p-6 space-y-4">
        <h3 class="text-lg font-semibold">Acceso restringido</h3>
        <p class="text-sm text-gray-600">Ingresa la contraseña para continuar.</p>

        <div class="space-y-2">
          <label class="block text-sm font-medium">Contraseña</label>
          <div class="flex">
            <input
              :type="pwdVisible ? 'text' : 'password'"
              v-model="pwd"
              class="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring"
              placeholder="••••••••"
              @keyup.enter="confirmPwd"
              autofocus
            />
            <button type="button" class="border border-l-0 rounded-r-lg px-3 py-2" @click="pwdVisible = !pwdVisible">
              {{ pwdVisible ? 'Ocultar' : 'Ver' }}
            </button>
          </div>
          <p v-if="pwdError" class="text-sm text-red-600">{{ pwdError }}</p>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button class="px-3 py-2 rounded-lg border" @click="closePwd">Cancelar</button>
          <button class="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700" @click="confirmPwd">Continuar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '@/lib/supabase'

/* ========= Datos base ========= */
const empleados = ['Igor Butenko','Gabriel Rosales','Jorge Luis Vasco','Alex Vasco','Marco Villaroel','Marcos Meneses']
const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

/* ========= Helpers fecha/hora (local) ========= */
const tzNow = () => new Date(Date.now() - (new Date().getTimezoneOffset() * 60000))
const hoyISO = () => tzNow().toISOString().split('T')[0]
const hhmm = () => {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2,'0')
  const mm = String(d.getMinutes()).padStart(2,'0')
  return `${hh}:${mm}`
}

/* Umbrales de jornada (local) */
const INICIO_HH = 6,  INICIO_MM = 30
const FIN_HH    = 18, FIN_MM    = 30

/* ========= Estado UI ========= */
const diaSeleccionado = ref(null)
const empleadosPresentes = ref([])
const registrosPorDia = reactive({}) // { [dia]: { id, presentes, hora, fecha } }
const horaActual = ref(hhmm())
const editMode = ref(false)
const registroIdEnEdicion = ref(null)

const fechaInicio = ref('')
const fechaFin = ref('')
const mostrarTabla = ref(true)
const usandoFiltro = ref(false)

/* Jornada de hoy (para mostrar) */
const jornadaHoy = ref([])

/* ========= Timers ========= */
let clockTimer = null
let jornadaTimer = null

/* ========= PASSWORD MODAL ========= */
const ACCESS_PWD = 'ASISTENCIA2512'
const showPwd = ref(false)
const pwd = ref('')
const pwdVisible = ref(false)
const pwdError = ref('')
const pendingAction = ref(null) // { type: 'edit'|'delete', dia: string }

/* ========= Carga asistencia ========= */
const cargarRegistros = async (filtro = false) => {
  let q = supabase.from('asistencia').select('*').order('fecha',{ascending:true})

  if (filtro && fechaInicio.value && fechaFin.value) {
    usandoFiltro.value = true
    q = q.gte('fecha', fechaInicio.value).lte('fecha', fechaFin.value)
  } else {
    usandoFiltro.value = false
    q = q.eq('fecha', hoyISO())
  }

  const { data, error } = await q
  if (error) { console.error('[asistencia] load error:', error); return }

  Object.keys(registrosPorDia).forEach(k => delete registrosPorDia[k])
  for (const r of (data || [])) {
    registrosPorDia[r.dia] = {
      id: r.id,
      presentes: Array.isArray(r.empleados_presentes) ? r.empleados_presentes : [],
      hora: r.hora,
      fecha: r.fecha
    }
  }

  await cargarJornadaHoy()
}

/* ========= Carga jornada de HOY ========= */
const cargarJornadaHoy = async () => {
  const { data, error } = await supabase
    .from('asistencia_jornada')
    .select('id, fecha, hora, tipo')
    .eq('fecha', hoyISO())
    .order('hora', { ascending: true })

  if (!error) jornadaHoy.value = data || []
  else {
    if (error.code !== '42P01') console.warn('[asistencia_jornada] load error:', error)
    jornadaHoy.value = []
  }
}

/* ========= Upsert de jornada ========= */
const upsertJornada = async (tipo, fecha, hora) => {
  const { data: ex } = await supabase
    .from('asistencia_jornada')
    .select('id')
    .eq('fecha', fecha)
    .eq('tipo', tipo)
    .maybeSingle()

  if (ex?.id) return ex.id

  const { data, error } = await supabase
    .from('asistencia_jornada')
    .insert([{ tipo, fecha, hora }])
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      const { data: again } = await supabase
        .from('asistencia_jornada')
        .select('id')
        .eq('fecha', fecha)
        .eq('tipo', tipo)
        .maybeSingle()
      return again?.id ?? null
    }
    console.error('[jornada] insert error:', error)
    return null
  }
  return data?.id ?? null
}

/* ========= Lógica automática de jornada ========= */
const ensureJornadaToday = async () => {
  const fecha = hoyISO()
  const now = new Date()
  const minsNow = now.getHours() * 60 + now.getMinutes()
  const minsInicio = INICIO_HH * 60 + INICIO_MM
  const minsFin    = FIN_HH    * 60 + FIN_MM

  if (minsNow >= minsInicio) {
    await upsertJornada('inicio', fecha, `${String(INICIO_HH).padStart(2,'0')}:${String(INICIO_MM).padStart(2,'0')}`)
  }
  if (minsNow >= minsFin) {
    await upsertJornada('fin', fecha, `${String(FIN_HH).padStart(2,'0')}:${String(FIN_MM).padStart(2,'0')}`)
  }
  await cargarJornadaHoy()
}

/* ========= Filtros ========= */
const filtrarPorFechas = () => {
  if (!fechaInicio.value || !fechaFin.value) return
  cargarRegistros(true)
}
const resetHoy = () => {
  fechaInicio.value = ''
  fechaFin.value = ''
  cargarRegistros(false)
}

/* ========= Selección / CRUD asistencia (solo HOY) ========= */
const seleccionarDia = (dia) => {
  diaSeleccionado.value = dia
  empleadosPresentes.value = []
  editMode.value = false
  registroIdEnEdicion.value = null

  const existente = registrosPorDia[dia]
  if (existente && existente.fecha === hoyISO()) {
    empleadosPresentes.value = [...existente.presentes]
    editMode.value = true
    registroIdEnEdicion.value = existente.id || null
  }
}

const guardarAsistencia = async () => {
  const payload = {
    dia: diaSeleccionado.value,
    fecha: hoyISO(),
    empleados_presentes: empleadosPresentes.value,
    hora: hhmm()
  }

  let id = registroIdEnEdicion.value
  if (!id) {
    const { data: existing } = await supabase
      .from('asistencia')
      .select('id')
      .eq('fecha', payload.fecha)
      .eq('dia', payload.dia)
      .maybeSingle()
    if (existing) id = existing.id
  }

  if (id) {
    await supabase.from('asistencia').update(payload).eq('id', id)
  } else {
    const { data: inserted, error } = await supabase
      .from('asistencia')
      .insert([payload])
      .select('id')
      .single()
    if (!error && inserted) id = inserted.id
  }

  registrosPorDia[payload.dia] = {
    id,
    presentes: [...payload.empleados_presentes],
    hora: payload.hora,
    fecha: payload.fecha
  }

  diaSeleccionado.value = null
  empleadosPresentes.value = []
  editMode.value = false
  registroIdEnEdicion.value = null
}

/* === Editar / Eliminar con clave === */
const pedirClave = (type, dia) => {
  pendingAction.value = { type, dia }
  pwd.value = ''
  pwdVisible.value = false
  pwdError.value = ''
  showPwd.value = true
}
const closePwd = () => {
  showPwd.value = false
  pendingAction.value = null
  pwd.value = ''
  pwdError.value = ''
}
const confirmPwd = () => {
  if (pwd.value !== ACCESS_PWD) {
    pwdError.value = 'Contraseña incorrecta'
    return
  }
  const act = pendingAction.value
  closePwd()
  if (!act) return
  if (act.type === 'edit') {
    editarDia(act.dia, true)
  } else if (act.type === 'delete') {
    eliminarDia(act.dia, true)
  }
}

const editarDia = (dia, bypassPwd = false) => {
  if (!bypassPwd) return pedirClave('edit', dia)

  const reg = registrosPorDia[dia]
  if (!reg || reg.fecha !== hoyISO()) {
    return alert('Solo puedes editar el registro de HOY.')
  }
  diaSeleccionado.value = dia
  empleadosPresentes.value = [...reg.presentes]
  editMode.value = true
  registroIdEnEdicion.value = reg.id || null
}

const eliminarDia = async (dia, bypassPwd = false) => {
  if (!bypassPwd) return pedirClave('delete', dia)

  const reg = registrosPorDia[dia]
  if (!reg || reg.fecha !== hoyISO()) {
    return alert('Solo puedes eliminar el registro de HOY.')
  }
  if (confirm(`¿Seguro que deseas eliminar el registro de hoy para ${dia}?`)) {
    if (reg.id) {
      await supabase.from('asistencia').delete().eq('id', reg.id)
    } else {
      await supabase.from('asistencia').delete().eq('dia', dia).eq('fecha', hoyISO())
    }
    delete registrosPorDia[dia]
  }
}

/* ========= Init / Cleanup ========= */
onMounted(async () => {
  await cargarRegistros()
  await ensureJornadaToday()

  clockTimer = setInterval(() => (horaActual.value = hhmm()), 60000)
  jornadaTimer = setInterval(ensureJornadaToday, 60000)
})

onBeforeUnmount(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (jornadaTimer) clearInterval(jornadaTimer)
})
</script>
