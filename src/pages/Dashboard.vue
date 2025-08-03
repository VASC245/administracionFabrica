<template>
  <div class="space-y-8">
    <!-- BOTONES GLOBALES -->
    <div class="flex gap-4 mb-6">
      <button @click="exportarExcelGeneral" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Exportar Todo Excel
      </button>
      <button @click="exportarPDFGeneral" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
        Exportar Todo PDF
      </button>
    </div>

    <!-- FILTROS -->
    <div class="bg-white shadow rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div class="flex items-center gap-4">
        <label class="font-semibold">Desde:</label>
        <input type="date" v-model="fechaInicio" class="border rounded px-2 py-1" />
        <label class="font-semibold">Hasta:</label>
        <input type="date" v-model="fechaFin" class="border rounded px-2 py-1" />
        <button @click="aplicarFiltros" class="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
          Aplicar Filtros
        </button>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-center py-6 text-gray-600">
      Cargando datos...
    </div>

    <div v-else>
      <!-- TARJETAS TOTALES -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-amber-500 text-white p-6 rounded-xl shadow-lg text-center">
          <h3 class="text-lg font-semibold">Palas Aserrín</h3>
          <p class="text-3xl font-bold">{{ totales.palas_aserrin }}</p>
        </div>
        <div class="bg-green-500 text-white p-6 rounded-xl shadow-lg text-center">
          <h3 class="text-lg font-semibold">Fundas Producidas</h3>
          <p class="text-3xl font-bold">{{ totales.fundas_producidas }}</p>
        </div>
        <div class="bg-blue-500 text-white p-6 rounded-xl shadow-lg text-center">
          <h3 class="text-lg font-semibold">Fundas Entregadas</h3>
          <p class="text-3xl font-bold">{{ totales.fundas_entregadas }}</p>
        </div>
        <div class="bg-indigo-500 text-white p-6 rounded-xl shadow-lg text-center">
          <h3 class="text-lg font-semibold">Stock</h3>
          <p class="text-3xl font-bold">{{ totales.stock }}</p>
        </div>
      </div>

      <!-- GRÁFICO COMPARATIVO -->
      <div class="bg-white rounded-lg shadow p-6 mt-8">
        <h2 class="text-xl font-semibold mb-4">Grafico Operación Fabrica</h2>
        <apexchart
          width="100%"
          height="400"
          type="line"
          :options="chartComparativoOptions"
          :series="comparativoSeries"
        />
      </div>

      <!-- GRÁFICO HORNO -->
      <div class="bg-white rounded-lg shadow p-6 mt-8">
        <h2 class="text-xl font-semibold mb-4">Grafico Operación del Horno</h2>
        <apexchart
          width="100%"
          height="450"
          type="line"
          :options="chartHornoOptions"
          :series="hornoSeries"
        />
        <!-- Tabla -->
        <table class="w-full mt-4 text-sm border border-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2 border">Fecha</th>
              <th class="p-2 border">Hora</th>
              <th class="p-2 border">Jampa</th>
              <th class="p-2 border">Viruta</th>
              <th class="p-2 border">Pellet</th>
              <th class="p-2 border">Temp. Entrada (°C)</th>
              <th class="p-2 border">Temp. Salida (°C)</th>
              <th class="p-2 border">Humedad (%)</th>
              <th class="p-2 border">Amperios</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in hornoDataFiltrada" :key="h.id">
              <td class="p-2 border">{{ h.fecha }}</td>
              <td class="p-2 border">{{ h.hora }}</td>
              <td class="p-2 border">{{ h.jampa }}</td>
              <td class="p-2 border">{{ h.viruta }}</td>
              <td class="p-2 border">{{ h.pellet }}</td>
              <td class="p-2 border">{{ h.temperatura_entrada }}</td>
              <td class="p-2 border">{{ h.temperatura_salida }}</td>
              <td class="p-2 border">{{ h.humedad }}</td>
              <td class="p-2 border">{{ h.amperios }}</td>
            </tr>
          </tbody>
        </table>
        <!-- Botones -->
        <div class="flex gap-2 mt-4">
          <button @click="exportarSeccionExcel('horno')" class="bg-green-500 text-white px-2 rounded">Excel</button>
          <button @click="exportarSeccionPDF('horno')" class="bg-red-500 text-white px-2 rounded">PDF</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { exportToExcel, exportToPDF } from '@/utils/export.js'

const loading = ref(true)
const fechaInicio = ref('')
const fechaFin = ref('')
const totales = ref({ palas_aserrin: 0, fundas_producidas: 0, fundas_entregadas: 0, stock: 0 })

// Datos
const produccionData = ref([])
const despachoData = ref([])
const aserrinData = ref([])
const asistenciaData = ref([])
const hornoData = ref([])

// Filtrados
const produccionDataFiltrada = computed(() => aplicarFiltro(produccionData.value))
const despachoDataFiltrada = computed(() => aplicarFiltro(despachoData.value))
const aserrinDataFiltrada = computed(() => aplicarFiltro(aserrinData.value))
const asistenciaDataFiltrada = computed(() => aplicarFiltro(asistenciaData.value))
const hornoDataFiltrada = computed(() => aplicarFiltro(hornoData.value))

// Series
const comparativoSeries = ref([])
const hornoSeries = ref([])

// Configuración de gráficos
const chartComparativoOptions = {
  chart: { toolbar: { show: true }, zoom: { enabled: true } },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: { categories: [], title: { text: 'Fechas' } },
  yaxis: { title: { text: 'Valores' } },
  legend: { position: 'top' },
  colors: ['#10B981', '#3B82F6', '#F59E0B', '#6366F1', '#7C3AED']
}

const chartHornoOptions = {
  chart: { toolbar: { show: true }, zoom: { enabled: true } },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: { categories: [], title: { text: 'Fechas' } },
  yaxis: { title: { text: 'Valores' } },
  legend: { position: 'top' },
  colors: ['#F97316', '#3B82F6', '#22C55E', '#EF4444', '#8B5CF6', '#0EA5E9', '#DC2626']
}

// Cargar datos
const cargarDatos = async () => {
  loading.value = true
  try {
    const { data: produccion } = await supabase.from('produccion_fundas').select('*').order('fecha')
    produccionData.value = produccion || []

    const { data: despacho } = await supabase.from('viajes_despacho').select('*')
    despachoData.value = despacho || []

    const { data: aserrin } = await supabase.from('aserrin').select('*')
    aserrinData.value = aserrin || []

    const { data: asistencia } = await supabase.from('asistencia').select('*')
    asistenciaData.value = asistencia || []

    const { data: horno } = await supabase.from('horno').select('*').order('fecha')
    hornoData.value = horno || []

    calcularTotales()
    generarSeries()
    generarSeriesHorno()
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    loading.value = false
  }
}

// Totales
const calcularTotales = () => {
  const totalProduccion = produccionData.value.reduce((sum, r) => sum + (r.fundas || 0), 0)
  const totalDespacho = despachoData.value.reduce((sum, r) => sum + (r.fundas_calculadas || 0), 0)
  const totalAserrin = aserrinData.value.reduce((sum, r) => sum + (r.palas || 0), 0)
  const stockCalculado = totalProduccion - totalDespacho

  totales.value = {
    palas_aserrin: totalAserrin,
    fundas_producidas: totalProduccion,
    fundas_entregadas: totalDespacho,
    stock: stockCalculado
  }
}

// Series comparativo
const generarSeries = () => {
  const fechas = produccionDataFiltrada.value.map(r => r.fecha)
  chartComparativoOptions.xaxis.categories = fechas

  let acumulado = 0
  const stockAcumulativo = produccionDataFiltrada.value.map((r, i) => {
    const entregadas = despachoDataFiltrada.value[i]?.fundas_calculadas || 0
    acumulado += (r.fundas || 0) - entregadas
    return acumulado
  })

  comparativoSeries.value = [
    { name: 'Producción', data: produccionDataFiltrada.value.map(r => r.fundas) },
    { name: 'Entregadas', data: despachoDataFiltrada.value.map(r => r.fundas_calculadas) },
    { name: 'Palas Aserrín', data: aserrinDataFiltrada.value.map(r => r.palas) },
    { name: 'Stock (Acumulado)', data: stockAcumulativo },
    { name: 'Asistencia', data: asistenciaDataFiltrada.value.map(r => r.empleados_presentes?.length || 0) }
  ]
}

// Series horno
const generarSeriesHorno = () => {
  const fechas = hornoDataFiltrada.value.map(r => r.fecha)
  chartHornoOptions.xaxis.categories = fechas

  hornoSeries.value = [
    { name: 'Jampa', data: hornoDataFiltrada.value.map(r => r.jampa) },
    { name: 'Viruta', data: hornoDataFiltrada.value.map(r => r.viruta) },
    { name: 'Pellet', data: hornoDataFiltrada.value.map(r => r.pellet) },
    { name: 'Temp. Entrada', data: hornoDataFiltrada.value.map(r => r.temperatura_entrada) },
    { name: 'Temp. Salida', data: hornoDataFiltrada.value.map(r => r.temperatura_salida) },
    { name: 'Humedad', data: hornoDataFiltrada.value.map(r => r.humedad) },
    { name: 'Amperios', data: hornoDataFiltrada.value.map(r => r.amperios) }
  ]
}

// Filtro
const aplicarFiltro = (datos) => {
  if (!fechaInicio.value || !fechaFin.value) return datos
  return datos.filter(r => r.fecha >= fechaInicio.value && r.fecha <= fechaFin.value)
}
const aplicarFiltros = () => { generarSeries(); generarSeriesHorno() }

// Exportaciones
const exportarSeccionExcel = (tipo) => {
  if (tipo === 'horno') exportToExcel(hornoDataFiltrada.value, 'Horno.xlsx')
}
const exportarSeccionPDF = (tipo) => {
  if (tipo === 'horno') {
    exportToPDF(
      hornoDataFiltrada.value,
      [
        { header: 'Fecha', dataKey: 'fecha' },
        { header: 'Hora', dataKey: 'hora' },
        { header: 'Jampa', dataKey: 'jampa' },
        { header: 'Viruta', dataKey: 'viruta' },
        { header: 'Pellet', dataKey: 'pellet' },
        { header: 'Temp Entrada', dataKey: 'temperatura_entrada' },
        { header: 'Temp Salida', dataKey: 'temperatura_salida' },
        { header: 'Humedad', dataKey: 'humedad' },
        { header: 'Amperios', dataKey: 'amperios' }
      ],
      'Horno.pdf'
    )
  }
}
const exportarExcelGeneral = () => {
  const combined = [
    ...produccionDataFiltrada.value,
    ...despachoDataFiltrada.value,
    ...aserrinDataFiltrada.value,
    ...asistenciaDataFiltrada.value,
    ...hornoDataFiltrada.value
  ]
  exportToExcel(combined, 'Dashboard-General.xlsx')
}
const exportarPDFGeneral = () => {
  exportToPDF(produccionDataFiltrada.value, [{ header: 'Fecha', dataKey: 'fecha' }, { header: 'Fundas', dataKey: 'fundas' }], 'Dashboard-General.pdf')
}

onMounted(cargarDatos)
</script>
