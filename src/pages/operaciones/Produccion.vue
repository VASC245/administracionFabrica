<template>
  <div class="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-10">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <h2 class="text-3xl font-bold text-gray-800">Registro de Producción</h2>

      <!-- Resumen rápido -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
        <div class="p-3 rounded-xl border">
          <div class="text-xs text-gray-500">Fundas disponibles (total)</div>
          <div class="text-xl font-semibold">{{ totalFundas }}</div>
        </div>
        <div class="p-3 rounded-xl border">
          <div class="text-xs text-gray-500">Registros listados</div>
          <div class="text-xl font-semibold">{{ producciones.length }}</div>
        </div>
        <div class="p-3 rounded-xl border">
          <div class="text-xs text-gray-500">Hoy</div>
          <div class="text-xl font-semibold">{{ hoy }}</div>
        </div>
      </div>
    </div>

    <!-- FILTRO DE FECHAS -->
    <div class="flex flex-wrap items-center gap-4 my-6">
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
      <button
        @click="resetFiltro"
        class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
      >
        Limpiar
      </button>
    </div>

    <!-- FORMULARIO -->
    <form @submit.prevent="save" class="space-y-6 mb-8">
      <!-- Fecha -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
        <input
          v-model="form.fecha"
          type="date"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        />
      </div>

      <!-- Hora (auto) -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Hora (automática)</label>
        <input
          :value="horaAhora"
          type="time"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700"
          disabled
        />
        <p class="text-xs text-gray-500 mt-1">Se guarda la hora exacta al momento de registrar.</p>
      </div>

      <!-- Fundas -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Cantidad de Fundas</label>
        <input
          v-model.number="form.fundas"
          type="number"
          min="1"
          placeholder="Ingrese cantidad"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        />
        <p class="text-xs text-gray-500 mt-1">
          Disponibles en inventario: <span class="font-medium">{{ totalFundas }}</span>
        </p>
      </div>

      <!-- BOTÓN GUARDAR -->
      <div class="text-center">
        <button
          type="submit"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
          :disabled="saving"
        >
          {{ saving ? 'Guardando…' : 'Guardar Producción' }}
        </button>
      </div>
    </form>

    <!-- BOTÓN MOSTRAR/OCULTAR TABLA -->
    <div class="text-center mb-4">
      <button
        @click="mostrarTabla = !mostrarTabla"
        class="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
      >
        {{ mostrarTabla ? 'Ocultar Registros' : 'Mostrar Registros' }}
      </button>
    </div>

    <!-- TABLA -->
    <div v-if="mostrarTabla">
      <div class="overflow-x-auto">
        <table class="min-w-full border border-gray-300 rounded-lg text-sm">
          <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th class="px-4 py-3 border text-left">Fecha</th>
              <th class="px-4 py-3 border text-left">Hora</th>
              <th class="px-4 py-3 border text-left">Fundas</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in producciones"
              :key="r.id"
              class="odd:bg-white even:bg-gray-50"
            >
              <td class="px-4 py-2 border whitespace-nowrap">{{ r.fecha }}</td>
              <td class="px-4 py-2 border whitespace-nowrap">{{ r.hora ?? '—' }}</td>
              <td class="px-4 py-2 border">{{ r.fundas ?? 0 }}</td>
            </tr>
            <tr v-if="!producciones.length">
              <td colspan="3" class="px-4 py-6 text-center text-gray-500">
                No hay registros en este rango de fechas.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '@/lib/supabase'
import { searchFundas, adjustFundasAndLog } from '@/services/fundasService'

/* ========= Estado ========= */
const producciones = ref([])
const fundas = ref([])
const saving = ref(false)
const mostrarTabla = ref(true)

/* ========= Filtros ========= */
const fechaInicio = ref('')
const fechaFin = ref('')

/* ========= Hoy (local) ========= */
const hoy = new Date().toLocaleDateString()
const form = reactive({
  fecha: new Date().toISOString().slice(0,10),
  fundas: null
})

/* ========= Hora actual (local, en vivo) ========= */
const horaAhora = ref(getLocalTimeHHMM())
let timer = null
function getLocalTimeHHMM() {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

/* ========= Computados ========= */
const totalFundas = computed(() =>
  fundas.value.reduce((a,b)=> a + Number(b.stock || 0), 0)
)

/* ========= Carga inventario de fundas ========= */
async function loadFundas() {
  fundas.value = await searchFundas('') // mantiene tu lógica de servicio
}

/* ========= Carga de producciones ========= */
async function loadProducciones(limit = 200) {
  const { data, error } = await supabase
    .from('produccion_fundas')
    .select('id, fecha, hora, fundas')
    .order('fecha', { ascending: false })
    .order('hora', { ascending: false })
    .limit(limit)
  if (!error) producciones.value = data || []
}

/* ========= Filtrar por fechas ========= */
async function filtrarPorFechas() {
  let q = supabase.from('produccion_fundas')
    .select('id, fecha, hora, fundas')
    .order('fecha', { ascending: false })
    .order('hora', { ascending: false })
  if (fechaInicio.value) q = q.gte('fecha', fechaInicio.value)
  if (fechaFin.value)   q = q.lte('fecha', fechaFin.value)
  const { data, error } = await q
  if (!error) producciones.value = data || []
}

function resetFiltro() {
  fechaInicio.value = ''
  fechaFin.value = ''
  loadProducciones()
}

/* ========= Guardar producción (DESCUENTA INVENTARIO) ========= */
async function save() {
  const cantidad = Number(form.fundas)
  if (!cantidad || cantidad <= 0) return alert('Ingresa una cantidad válida')
  if (cantidad > totalFundas.value) {
    return alert(`No hay stock suficiente. Disponibles: ${totalFundas.value}`)
  }

  saving.value = true
  try {
    // 1) Insertar producción con hora automática local
    const payload = { fecha: form.fecha, hora: getLocalTimeHHMM() + ':00', fundas: cantidad }
    const { data: row, error } = await supabase
      .from('produccion_fundas')
      .insert([payload])
      .select()
      .single()
    if (error) { console.error(error); throw error }

    // 2) Descontar del inventario de fundas, dejando trazabilidad
    let restante = cantidad
    for (const f of fundas.value) {
      if (restante <= 0) break
      const quitar = Math.min(Number(f.stock) || 0, restante)
      if (quitar > 0) {
        await adjustFundasAndLog({
          funda_id: f.id,
          delta: -quitar,
          tipo: 'produccion',
          referencia: `prod-${row.id}`
        })
        restante -= quitar
      }
    }

    // 3) Recargar vistas
    await Promise.all([loadFundas(), (fechaInicio.value || fechaFin.value) ? filtrarPorFechas() : loadProducciones()])
    form.fundas = null
  } catch (e) {
    console.error(e)
    alert('Error al guardar producción')
  } finally {
    saving.value = false
  }
}

/* ========= Init / cleanup ========= */
onMounted(async () => {
  await Promise.all([loadFundas(), loadProducciones()])
  // actualizar reloj visible cada 15s
  timer = setInterval(() => (horaAhora.value = getLocalTimeHHMM()), 15000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
