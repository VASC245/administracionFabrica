<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- CUADROS RESUMEN -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-600">Producción Total (fundas)</h3>
        <p class="text-2xl font-bold text-blue-600">{{ totalProduccionFundas }} fundas</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-600">Fundas Entregadas</h3>
        <p class="text-2xl font-bold text-green-600">{{ totalDespachosFundas }} fundas</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-600">Stock Actual (fundas)</h3>
        <p class="text-2xl font-bold text-yellow-600">{{ stockFundas }} fundas</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-600">Aserrín Ingresado</h3>
        <p class="text-2xl font-bold text-indigo-600">{{ totalAserrinPalas }} palas</p>
        <p class="text-xs text-gray-500">≈ {{ totalAserrinTon.toFixed(1) }} t</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-600">Aserrín Disponible</h3>
        <p class="text-xl font-bold text-emerald-600">
          {{ aserrinDisponibleTon.toFixed(1) }} t
        </p>
        <p class="text-sm text-gray-500">≈ {{ aserrinDisponiblePalas.toFixed(0) }} palas</p>
        <p class="text-xs text-gray-400 mt-1">Producción acumulada: {{ totalPelletTon.toFixed(1) }} t</p>
      </div>
    </div>

    <!-- FILTRO DE FECHA (inicio nunca antes de START_DATE) -->
    <div class="bg-white rounded-lg shadow p-6 mb-8 flex flex-wrap gap-4 items-end">
      <div>
        <label class="block text-gray-700 text-sm font-medium mb-1">Desde (mín. {{ START_DATE }})</label>
        <input v-model="fechaInicio" type="date" class="border rounded-lg px-3 py-2" />
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-medium mb-1">Hasta</label>
        <input v-model="fechaFin" type="date" class="border rounded-lg px-3 py-2" />
      </div>

      <!-- Valor fijo visible (no editable) -->
      <div>
        <label class="block text-gray-700 text-sm font-medium mb-1">t por pala (fijo)</label>
        <p class="border rounded-lg px-3 py-2 w-28 bg-gray-100 text-center">0.12</p>
        <p class="text-[11px] text-gray-500 mt-1 text-center">= 120 kg</p>
      </div>

      <button @click="cargarDatos" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
        Filtrar
      </button>
      <button @click="limpiar" class="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
        Limpiar
      </button>
      <span class="text-xs text-gray-500 ml-auto">
        * Aserrín disponible = aserrín (t) − <b>producción</b> (t) desde {{ START_DATE }}
      </span>
    </div>

    <!-- GRÁFICO OPERACIÓN FÁBRICA (Fundas) -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Gráfico Operación Fábrica (Fundas)</h2>
      <apexchart
        width="100%"
        height="400"
        type="line"
        :options="chartComparativoOptions"
        :series="comparativoSeries"
      />
    </div>

    <!-- GRÁFICO DE ASERRÍN: BARRAS + FILTRO POR PROVEEDOR -->
    <div class="bg-white rounded-lg shadow p-6 mt-8">
      <div class="flex flex-wrap items-end gap-4 mb-4">
        <div class="flex-1">
          <h2 class="text-xl font-semibold">Ingreso de Aserrín por Proveedor (Barras)</h2>
          <div class="text-sm text-gray-500">
            Total: <b>{{ totalAserrinPalas }}</b> palas ({{ totalAserrinTon.toFixed(1) }} t) • Disponible: <b>{{ aserrinDisponibleTon.toFixed(1) }} t</b>
          </div>
        </div>
        <div>
          <label class="block text-gray-700 text-sm font-medium mb-1">Filtrar proveedor(es)</label>
          <select
            v-model="selectedProviders"
            multiple
            class="border rounded-lg px-3 py-2 min-w-[220px] h-[90px]"
          >
            <option
              v-for="p in uniqueProviders"
              :key="p"
            >{{ p }}</option>
          </select>
          <div class="text-[11px] text-gray-500 mt-1">Vacío = todos</div>
        </div>
        <button
          @click="resetProviders"
          class="border px-3 py-2 rounded-lg hover:bg-gray-50"
        >
          Quitar filtro
        </button>
      </div>

      <apexchart
        width="100%"
        height="380"
        type="bar"
        :options="chartAserrinBarOptions"
        :series="aserrinBarSeries"
      />
    </div>

    <!-- GRÁFICO DEL HORNO + PROMEDIOS (informativo, no afecta aserrín) -->
    <div class="bg-white rounded-lg shadow p-6 mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Operación del Horno {{ rangoTexto }}</h2>
        <div class="text-sm text-gray-500" v-if="horasHorno.length">Registros: <b>{{ horasHorno.length }}</b></div>
      </div>

      <apexchart
        width="100%"
        height="450"
        type="line"
        :options="chartHornoOptions"
        :series="hornoSeries"
      />

      <div class="mt-6">
        <h2 class="text-lg font-semibold mb-4 text-center">Promedio del Horno ({{ rangoTexto }})</h2>
        <table class="w-full border text-sm">
          <thead class="bg-gray-100 text-center">
            <tr>
              <th class="border px-4 py-2">Métrica</th>
              <th class="border px-4 py-2">Promedio</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="border px-4 py-2">Jampa</td>             <td class="border px-4 py-2 text-center font-semibold">{{ promedioJampa }}</td></tr>
            <tr><td class="border px-4 py-2">Viruta</td>            <td class="border px-4 py-2 text-center font-semibold">{{ promedioViruta }}</td></tr>
            <tr><td class="border px-4 py-2">Pellet</td>            <td class="border px-4 py-2 text-center font-semibold">{{ promedioPellet }}</td></tr>
            <tr><td class="border px-4 py-2">T. Entrada (°C)</td>   <td class="border px-4 py-2 text-center font-semibold">{{ promedioEntrada }}°C</td></tr>
            <tr><td class="border px-4 py-2">T. Salida (°C)</td>    <td class="border px-4 py-2 text-center font-semibold">{{ promedioSalida }}°C</td></tr>
            <tr><td class="border px-4 py-2">Humedad (%)</td>       <td class="border px-4 py-2 text-center font-semibold">{{ promedioHumedad }}%</td></tr>
            <tr><td class="border px-4 py-2">Amperios</td>          <td class="border px-4 py-2 text-center font-semibold">{{ promedioAmperios }} A</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, shallowRef, computed, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { supabase } from '@/lib/supabase'

const apexchart = VueApexCharts

/* ====== Parámetros fijos ====== */
const START_DATE   = '2025-07-31'
const TON_POR_PALA = 0.12 // 120 kg
/* Si tu columna `horno.pellet` está en kg, cambia este factor a 0.001 */
const HORNO_PELLET_FACTOR = 1 // 1 => ya viene en toneladas; 0.001 => si viniera en kg

/* ===== Helpers ===== */
function todayLocalISO() {
  const now = new Date()
  const tzoffset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - tzoffset).toISOString().slice(0, 10)
}
function clampStartDate(dateStr) {
  if (!dateStr) return START_DATE
  return dateStr < START_DATE ? START_DATE : dateStr
}

/* ===== Filtros ===== */
const fechaInicio = ref('')
const fechaFin = ref('')

/* ===== KPIs (fundas) ===== */
const totalProduccionFundas = ref(0) // fundas
const totalDespachosFundas  = ref(0) // fundas
const stockFundas           = ref(0) // fundas

/* ===== Aserrín & producción pellets ===== */
const totalAserrinPalas = ref(0)                        // palas
const totalAserrinTon   = computed(() => totalAserrinPalas.value * TON_POR_PALA)
const totalPelletTon    = ref(0)                        // toneladas (PRODUCCIÓN)

/* ===== Aserrín disponible ===== */
const aserrinDisponibleTon = computed(() => {
  const disp = totalAserrinTon.value - totalPelletTon.value
  return disp > 0 ? disp : 0
})
const aserrinDisponiblePalas = computed(() =>
  TON_POR_PALA > 0 ? aserrinDisponibleTon.value / TON_POR_PALA : 0
)

/* ===== Gráficos (fundas) ===== */
const comparativoSeries = shallowRef([])
const chartComparativoOptions = shallowRef({
  chart: { toolbar: { show: true }, zoom: { enabled: true } },
  xaxis: { categories: [], title: { text: 'Fechas' }, labels: { rotate: -45 } },
  stroke: { curve: 'smooth' },
  colors: ['#2563eb', '#10b981', '#f59e0b'],
  dataLabels: { enabled: false },
  tooltip: { shared: true, intersect: false },
  legend: { position: 'top' }
})

/* ===== Datos crudos de aserrín para el gráfico de barras filtrable ===== */
const aserrinRowsAll = ref([]) // [{fecha, palas, proveedor}...]
const uniqueProviders = computed(() => {
  const set = new Set((aserrinRowsAll.value || []).map(r => r.proveedor || '—'))
  return Array.from(set).sort((a, b) => a.localeCompare(b))
})
const selectedProviders = ref([]) // múltiples; vacío => todos

function resetProviders() {
  selectedProviders.value = []
}

/* ===== Gráfico Aserrín (Barras por proveedor por fecha) ===== */
const aserrinBarSeries = shallowRef([])
const chartAserrinBarOptions = shallowRef({
  chart: {
    stacked: true,
    stackType: 'normal',
    toolbar: { show: true }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '60%',
      borderRadius: 4
    }
  },
  dataLabels: { enabled: false },
  xaxis: { categories: [], title: { text: 'Fecha' } },
  yaxis: { title: { text: 'Palas' } },
  legend: { position: 'top' },
  tooltip: { shared: true, intersect: false },
  colors: ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#84cc16', '#f97316']
})

/* ===== Horno (informativo) ===== */
const hornoSeries = shallowRef([])
const chartHornoOptions = shallowRef({
  chart: { toolbar: { show: true }, zoom: { enabled: true } },
  stroke: { curve: 'smooth', width: 2 },
  colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
  xaxis: { categories: [], title: { text: 'Hora' } },
  tooltip: { shared: true, intersect: false }
})
const horasHorno = ref([])
const rangoTexto = computed(() => (fechaInicio.value || fechaFin.value) ? '(rango)' : `(desde ${START_DATE})`)

/* Promedios horno */
const promedioEntrada  = ref(0)
const promedioSalida   = ref(0)
const promedioHumedad  = ref(0)
const promedioAmperios = ref(0)
const promedioJampa    = ref(0)
const promedioViruta   = ref(0)
const promedioPellet   = ref(0)
const safeAvg = (arr) => {
  if (!arr || !arr.length) return 0
  const s = arr.reduce((a, n) => a + (Number(n) || 0), 0)
  return +(s / arr.length).toFixed(1)
}

/* ====== Carga principal ====== */
async function cargarDatos() {
  const start = clampStartDate(fechaInicio.value || START_DATE)
  const end   = fechaFin.value || todayLocalISO()

  // 1) Fundas (no afectan aserrín)
  const qProdFundas = supabase.from('produccion_fundas').select('*').gte('fecha', start).lte('fecha', end)
  const qDespFundas = supabase.from('despachos').select('fecha, fundas_actual').gte('fecha', start).lte('fecha', end)

  // 2) Aserrín (palas + proveedor)
  const qAserrin    = supabase.from('aserrin').select('fecha, palas, proveedor').gte('fecha', start).lte('fecha', end)

  // 3) Producción de PELLETS (TONELADAS) — usamos produccion_fundas.toneladas si existe; fallback horno.pellet
  const qProdPellet = supabase.from('produccion_fundas').select('fecha, toneladas').gte('fecha', start).lte('fecha', end)
  const qHorno      = supabase.from('horno')
    .select('fecha, hora, pellet, temperatura_entrada, temperatura_salida, humedad, amperios, jampa, viruta')
    .gte('fecha', start).lte('fecha', end)
    .order('fecha', { ascending: true }).order('hora', { ascending: true })

  const [
    { data: prodFundas = [], error: e1 },
    { data: despFundas = [], error: e2 },
    { data: aserrinRows = [], error: e3 },
    prodPelletRes,
    { data: hornoRows = [], error: e5 }
  ] = await Promise.all([qProdFundas, qDespFundas, qAserrin, qProdPellet, qHorno])

  if (e1) console.warn('[produccion_fundas] error:', e1)
  if (e2) console.warn('[despachos (fundas)] error:', e2)
  if (e3) console.warn('[aserrin] error:', e3)
  if (e5) console.warn('[horno] error:', e5)

  // KPIs de fundas
  totalProduccionFundas.value = prodFundas.reduce((a, p) => a + (p.fundas || 0), 0)
  totalDespachosFundas.value  = despFundas.reduce((a, d) => a + (d.fundas_actual || 0), 0)
  stockFundas.value           = totalProduccionFundas.value - totalDespachosFundas.value

  // Aserrín (palas)
  totalAserrinPalas.value = aserrinRows.reduce((a, r) => a + (r.palas || 0), 0)
  aserrinRowsAll.value    = aserrinRows || []

  // === Producción de pellets (TONELADAS) ===
  let produccionTon = 0
  if (!prodPelletRes.error && Array.isArray(prodPelletRes.data)) {
    produccionTon = prodPelletRes.data.reduce((a, r) => a + (Number(r.toneladas) || 0), 0)
  } else {
    produccionTon = hornoRows.reduce((a, r) => a + (Number(r.pellet) || 0), 0) * HORNO_PELLET_FACTOR
  }
  totalPelletTon.value = produccionTon

  // ===== Gráficos (fundas) =====
  const fechasFundas = [...new Set([...prodFundas.map(p => p.fecha), ...despFundas.map(d => d.fecha)])].sort()
  const prodPorFecha = fechasFundas.map(f => prodFundas.filter(p => p.fecha === f)
    .reduce((a, p) => a + (p.fundas || 0), 0))
  const despPorFecha = fechasFundas.map(f => despFundas.filter(d => d.fecha === f)
    .reduce((a, d) => a + (d.fundas_actual || 0), 0))
  let acc = 0
  const stockPorFecha = fechasFundas.map((_, i) => (acc += (prodPorFecha[i] || 0) - (despPorFecha[i] || 0)))
  chartComparativoOptions.value = {
    ...chartComparativoOptions.value,
    xaxis: { ...chartComparativoOptions.value.xaxis, categories: fechasFundas }
  }
  comparativoSeries.value = [
    { name: 'Producción (fundas)', data: prodPorFecha },
    { name: 'Entregadas (fundas)', data: despPorFecha },
    { name: 'Stock Acum (fundas)', data: stockPorFecha }
  ]

  // ===== Gráfico Aserrín (BARRAS apiladas por proveedor y filtrables) =====
  recomputeAserrinBar()

  // ===== Horno (informativo) =====
  const x = hornoRows.map(r => `${r.fecha ?? ''} ${r.hora ?? ''}`.trim())
  horasHorno.value = x
  const serieEntrada = hornoRows.map(r => r.temperatura_entrada ?? null)
  const serieSalida  = hornoRows.map(r => r.temperatura_salida  ?? null)
  const serieHum     = hornoRows.map(r => r.humedad             ?? null)
  const serieAmp     = hornoRows.map(r => r.amperios            ?? null)
  hornoSeries.value = [
    { name: 'Temp Entrada', data: serieEntrada },
    { name: 'Temp Salida',  data: serieSalida  },
    { name: 'Humedad',      data: serieHum     },
    { name: 'Amperios',     data: serieAmp     }
  ]
  promedioEntrada.value  = safeAvg(serieEntrada)
  promedioSalida.value   = safeAvg(serieSalida)
  promedioHumedad.value  = safeAvg(serieHum)
  promedioAmperios.value = safeAvg(serieAmp)
  promedioJampa.value    = safeAvg(hornoRows.map(r => r.jampa))
  promedioViruta.value   = safeAvg(hornoRows.map(r => r.viruta))
  promedioPellet.value   = safeAvg(hornoRows.map(r => r.pellet))
}

/* ——— Construcción del bar chart filtrado por proveedor ——— */
function recomputeAserrinBar() {
  const rows = aserrinRowsAll.value || []
  if (!rows.length) {
    chartAserrinBarOptions.value = { ...chartAserrinBarOptions.value, xaxis: { ...chartAserrinBarOptions.value.xaxis, categories: [] } }
    aserrinBarSeries.value = []
    return
  }

  // Proveedores seleccionados (vacío => todos)
  const sel = (selectedProviders.value || []).length ? selectedProviders.value : uniqueProviders.value
  // Fechas presentes (para los seleccionados)
  const fechas = Array.from(new Set(
    rows.filter(r => sel.includes((r.proveedor || '—'))).map(r => r.fecha)
  )).sort()

  // Serie por proveedor seleccionado
  const series = sel.map(prov => {
    const data = fechas.map(f =>
      rows.filter(r => (r.proveedor || '—') === prov && r.fecha === f)
          .reduce((a, r) => a + (r.palas || 0), 0)
    )
    return { name: prov, data }
  })

  chartAserrinBarOptions.value = {
    ...chartAserrinBarOptions.value,
    xaxis: { ...chartAserrinBarOptions.value.xaxis, categories: fechas }
  }
  aserrinBarSeries.value = series
}

/* Recomputar barras cuando cambie la selección de proveedores */
watch(selectedProviders, () => {
  recomputeAserrinBar()
})

function limpiar() {
  fechaInicio.value = ''
  fechaFin.value = ''
  cargarDatos()
}

onMounted(() => {
  // por defecto: desde START_DATE a hoy
  cargarDatos()
})
</script>
