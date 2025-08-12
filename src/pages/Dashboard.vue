<template>
  <div class="max-w-7xl mx-auto p-6">
    <!-- CUADROS RESUMEN -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-600">Producción Total</h3>
        <p class="text-2xl font-bold text-blue-600">{{ totalProduccion }} fundas</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-600">Fundas Entregadas</h3>
        <p class="text-2xl font-bold text-green-600">{{ totalDespachos }} fundas</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-600">Stock Actual</h3>
        <p class="text-2xl font-bold text-yellow-600">{{ stockActual }} fundas</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6 text-center">
        <h3 class="text-lg font-semibold text-gray-600">Ingreso Aserrín</h3>
        <p class="text-2xl font-bold text-indigo-600">{{ totalAserrin }} palas</p>
      </div>
    </div>

    <!-- FILTRO DE FECHA -->
    <div class="bg-white rounded-lg shadow p-6 mb-8 flex flex-wrap gap-4 items-center">
      <div>
        <label class="block text-gray-700 text-sm font-medium mb-1">Desde:</label>
        <input v-model="fechaInicio" type="date" class="border rounded-lg px-3 py-2" />
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-medium mb-1">Hasta:</label>
        <input v-model="fechaFin" type="date" class="border rounded-lg px-3 py-2" />
      </div>
      <button @click="cargarDatos" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
        Filtrar
      </button>
      <button @click="limpiar" class="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
        Limpiar
      </button>
    </div>

    <!-- GRÁFICO OPERACIÓN FÁBRICA -->
    <div class="bg-white rounded-lg shadow p-6 mt-8">
      <h2 class="text-xl font-semibold mb-4">Gráfico Operación Fábrica</h2>
      <apexchart
        width="100%"
        height="400"
        type="line"
        :options="chartComparativoOptions"
        :series="comparativoSeries"
      />
    </div>

    <!-- GRÁFICO DE ASERRÍN -->
    <div class="bg-white rounded-lg shadow p-6 mt-8">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-xl font-semibold">Ingreso de Aserrín (Palas por Proveedor)</h2>
        <div class="text-sm text-gray-500">Total: <b>{{ totalAserrin }}</b> palas</div>
      </div>
      <apexchart
        width="100%"
        height="350"
        type="line"
        :options="chartAserrinOptions"
        :series="aserrinSeries"
      />
    </div>

    <!-- GRÁFICO DEL HORNO + PROMEDIOS -->
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

      <!-- Tabla Promedios -->
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
import { ref, onMounted, shallowRef, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { supabase } from '@/lib/supabase'

const apexchart = VueApexCharts

/* ===== Helpers de fecha local ===== */
function getLocalDate() {
  const now = new Date()
  const tzoffset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - tzoffset).toISOString().slice(0, 10)
}

/* ===== Filtros ===== */
const fechaInicio = ref('')
const fechaFin = ref('')

/* ===== KPIs ===== */
const totalProduccion = ref(0)
const totalDespachos  = ref(0)
const stockActual     = ref(0)
const totalAserrin    = ref(0)

/* ===== Comparativo ===== */
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

/* ===== Aserrín ===== */
const aserrinSeries = shallowRef([])
const chartAserrinOptions = shallowRef({
  chart: {
    toolbar: {
      show: true,
      tools: { download: true, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true }
    },
    zoom: { enabled: true, type: 'x', autoScaleYaxis: true }
  },
  xaxis: { categories: [], title: { text: 'Fecha' } },
  stroke: { curve: 'smooth' },
  colors: ['#6366f1'],
  tooltip: {
    custom: ({ series, seriesIndex, dataPointIndex, w }) => {
      const proveedor = (w?.config?.series?.[seriesIndex]?.meta?.[dataPointIndex]) || '—'
      const palas = series?.[seriesIndex]?.[dataPointIndex] ?? 0
      return `<div class="p-2"><b>${palas} palas</b><br>Proveedor: ${proveedor}</div>`
    }
  }
})

/* ===== Horno ===== */
const hornoSeries = shallowRef([])
const chartHornoOptions = shallowRef({
  chart: { toolbar: { show: true }, zoom: { enabled: true } },
  stroke: { curve: 'smooth', width: 2 },
  colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
  xaxis: { categories: [], title: { text: 'Hora' } },
  tooltip: { shared: true, intersect: false }
})
const horasHorno = ref([])
const rangoTexto = computed(() => (fechaInicio.value || fechaFin.value) ? '(rango)' : '(hoy)')

/* Promedios del horno */
const promedioEntrada  = ref(0)
const promedioSalida   = ref(0)
const promedioHumedad  = ref(0)
const promedioAmperios = ref(0)
const promedioJampa    = ref(0)
const promedioViruta   = ref(0)
const promedioPellet   = ref(0)

function safeAvg(arr) {
  if (!arr || arr.length === 0) return 0
  const num = arr.reduce((a, n) => a + (Number(n) || 0), 0)
  return +(num / arr.length).toFixed(1)
}

/* ===== Carga de datos ===== */
async function cargarDatos() {
  // Producción / Despachos / Aserrín
  let qProd = supabase.from('produccion_fundas').select('*')
  let qDesp = supabase.from('despachos').select('*')
  let qAser = supabase.from('aserrin').select('*')

  if (fechaInicio.value && fechaFin.value) {
    qProd = qProd.gte('fecha', fechaInicio.value).lte('fecha', fechaFin.value)
    qDesp = qDesp.gte('fecha', fechaInicio.value).lte('fecha', fechaFin.value)
    qAser = qAser.gte('fecha', fechaInicio.value).lte('fecha', fechaFin.value)
  }

  const [{ data: produccion = [] }, { data: despachos = [] }, { data: aserrin = [] }] =
    await Promise.all([qProd, qDesp, qAser])

  // KPIs
  totalProduccion.value = produccion.reduce((a, p) => a + (p.fundas || 0), 0)
  totalDespachos.value  = despachos.reduce((a, d) => a + (d.fundas_actual || 0), 0)
  stockActual.value     = totalProduccion.value - totalDespachos.value
  totalAserrin.value    = aserrin.reduce((a, r) => a + (r.palas || 0), 0)

  // Gráfico comparativo
  const fechas = [...new Set([...produccion.map(p => p.fecha), ...despachos.map(d => d.fecha)])].sort()
  const prodPorFecha = fechas.map(f => produccion.filter(p => p.fecha === f).reduce((a, p) => a + (p.fundas || 0), 0))
  const despPorFecha = fechas.map(f => despachos.filter(d => d.fecha === f).reduce((a, d) => a + (d.fundas_actual || 0), 0))
  let stockAcc = 0
  const stockPorFecha = fechas.map((_, i) => (stockAcc += (prodPorFecha[i] || 0) - (despPorFecha[i] || 0)))

  chartComparativoOptions.value = {
    ...chartComparativoOptions.value,
    xaxis: { ...chartComparativoOptions.value.xaxis, categories: fechas }
  }
  comparativoSeries.value = [
    { name: 'Producción', data: prodPorFecha },
    { name: 'Entregadas', data: despPorFecha },
    { name: 'Stock Acumulado', data: stockPorFecha }
  ]

  // Gráfico Aserrín
  const fechasA = [...new Set(aserrin.map(a => a.fecha))].sort()
  const palasPorFecha = fechasA.map(f => aserrin.filter(a => a.fecha === f).reduce((a, r) => a + (r.palas || 0), 0))
  const proveedores = fechasA.map(f => aserrin.filter(a => a.fecha === f).map(r => r.proveedor).join(', ') || '—')

  chartAserrinOptions.value = {
    ...chartAserrinOptions.value,
    xaxis: { ...chartAserrinOptions.value.xaxis, categories: fechasA }
  }
  aserrinSeries.value = [{ name: 'Palas', data: palasPorFecha, meta: proveedores }]

  // Horno
  await loadHorno()
}

async function loadHorno() {
  let q = supabase.from('horno').select('*')
  if (fechaInicio.value && fechaFin.value) {
    q = q.gte('fecha', fechaInicio.value).lte('fecha', fechaFin.value)
  } else {
    q = q.eq('fecha', getLocalDate())
  }

  const { data: rows = [], error } = await q.order('fecha', { ascending: true }).order('hora', { ascending: true })
  if (error) {
    console.error('[horno] error:', error)
    hornoSeries.value = []
    horasHorno.value = []
    promedioEntrada.value = promedioSalida.value = promedioHumedad.value = promedioAmperios.value = 0
    promedioJampa.value = promedioViruta.value = promedioPellet.value = 0
    return
  }

  const x = rows.map(r => {
    const h = r.hora ?? ''
    const f = r.fecha ?? ''
    if (fechaInicio.value && fechaFin.value) return `${f} ${h}`
    return h || f || ''
  })
  horasHorno.value = x

  const serieEntrada = rows.map(r => r.temperatura_entrada ?? null)
  const serieSalida  = rows.map(r => r.temperatura_salida  ?? null)
  const serieHum     = rows.map(r => r.humedad             ?? null)
  const serieAmp     = rows.map(r => r.amperios            ?? null)

  chartHornoOptions.value = {
    ...chartHornoOptions.value,
    xaxis: { ...chartHornoOptions.value.xaxis, categories: x }
  }
  hornoSeries.value = [
    { name: 'Temp Entrada', data: serieEntrada },
    { name: 'Temp Salida',  data: serieSalida  },
    { name: 'Humedad',      data: serieHum     },
    { name: 'Amperios',     data: serieAmp     }
  ]

  promedioEntrada.value  = safeAvg(rows.map(r => r.temperatura_entrada))
  promedioSalida.value   = safeAvg(rows.map(r => r.temperatura_salida))
  promedioHumedad.value  = safeAvg(rows.map(r => r.humedad))
  promedioAmperios.value = safeAvg(rows.map(r => r.amperios))
  promedioJampa.value    = safeAvg(rows.map(r => r.jampa))
  promedioViruta.value   = safeAvg(rows.map(r => r.viruta))
  promedioPellet.value   = safeAvg(rows.map(r => r.pellet))
}

function limpiar() {
  fechaInicio.value = ''
  fechaFin.value = ''
  cargarDatos()
}

onMounted(cargarDatos)
</script>
