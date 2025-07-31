<template>
  <div class="space-y-8">
    <!-- Botones generales -->
    <div class="flex gap-4 mb-6">
      <button @click="exportarExcelGeneral" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Exportar Todo Excel
      </button>
      <button @click="exportarPDFGeneral" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
        Exportar Todo PDF
      </button>
    </div>

    <!-- Filtros Globales -->
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

    <!-- Loading -->
    <div v-if="loading" class="text-center py-6 text-gray-600">
      Cargando datos...
    </div>

    <div v-else>
      <!-- Tarjetas -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div class="bg-white shadow rounded-lg p-6 text-center">
          <h3 class="text-gray-700 font-semibold">Producción Hoy</h3>
          <p class="text-3xl font-bold text-purple-600">{{ produccionHoy }} fundas</p>
        </div>
        <div class="bg-white shadow rounded-lg p-6 text-center">
          <h3 class="text-gray-700 font-semibold">Producción Total</h3>
          <p class="text-3xl font-bold text-blue-600">{{ produccionTotal }} fundas</p>
        </div>
        <div class="bg-white shadow rounded-lg p-6 text-center">
          <h3 class="text-gray-700 font-semibold">Fundas Entregadas Total</h3>
          <p class="text-3xl font-bold text-green-600">{{ totalFundasDespachadas }} Fundas</p>
        </div>
        <div class="bg-white shadow rounded-lg p-6 text-center">
          <h3 class="text-gray-700 font-semibold">Asistencia Hoy</h3>
          <p class="text-3xl font-bold text-yellow-600">{{ asistenciaHoy }}</p>
        </div>
        <div class="bg-white shadow rounded-lg p-6 text-center">
          <h3 class="text-gray-700 font-semibold">Aserrín Total</h3>
          <p class="text-3xl font-bold text-indigo-600">{{ aserrinTotal }} palas</p>
        </div>
      </div>

      <!-- SECCIONES -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <!-- PRODUCCIÓN -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-gray-700 font-semibold">Producción por Día</h3>
            <div class="flex gap-2">
              <button @click="toggleSeccion('produccion')" class="bg-gray-300 px-2 rounded">
                {{ secciones.produccion ? '-' : '+' }}
              </button>
              <button @click="exportarSeccionExcel('produccion')" class="bg-green-500 text-white px-2 rounded">Excel</button>
              <button @click="exportarSeccionPDF('produccion')" class="bg-red-500 text-white px-2 rounded">PDF</button>
            </div>
          </div>
          <div v-show="secciones.produccion">
            <apexchart width="100%" height="300" type="bar" :options="chartOptions" :series="produccionSeries" />
            <table class="w-full mt-4 text-sm border border-gray-200">
              <thead class="bg-gray-100">
                <tr><th class="p-2 border">Fecha</th><th class="p-2 border">Fundas</th></tr>
              </thead>
              <tbody>
                <tr v-for="p in produccionDataFiltrada" :key="p.fecha">
                  <td class="p-2 border">{{ p.fecha }}</td>
                  <td class="p-2 border">{{ p.fundas }} (15kg)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- DESPACHOS -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-gray-700 font-semibold">Fundas Despachadas</h3>
            <div class="flex gap-2">
              <button @click="toggleSeccion('despacho')" class="bg-gray-300 px-2 rounded">
                {{ secciones.despacho ? '-' : '+' }}
              </button>
              <button @click="exportarSeccionExcel('despacho')" class="bg-green-500 text-white px-2 rounded">Excel</button>
              <button @click="exportarSeccionPDF('despacho')" class="bg-red-500 text-white px-2 rounded">PDF</button>
            </div>
          </div>
          <div v-show="secciones.despacho">
            <apexchart width="100%" height="300" type="bar" :options="chartOptions" :series="despachoSeries" />
            <table class="w-full mt-4 text-sm border border-gray-200">
              <thead class="bg-gray-100">
                <tr><th class="p-2 border">Tipo</th><th class="p-2 border">Viajes</th><th class="p-2 border">Fundas</th></tr>
              </thead>
              <tbody>
                <tr v-for="d in despachoDataFiltrada" :key="d.id">
                  <td class="p-2 border">{{ d.tipo }}</td>
                  <td class="p-2 border">{{ d.cantidad_viajes }}</td>
                  <td class="p-2 border">{{ d.fundas_calculadas }} (15kg)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ASERRÍN -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-gray-700 font-semibold">Aserrín (Palas)</h3>
            <div class="flex gap-2">
              <button @click="toggleSeccion('aserrin')" class="bg-gray-300 px-2 rounded">
                {{ secciones.aserrin ? '-' : '+' }}
              </button>
              <button @click="exportarSeccionExcel('aserrin')" class="bg-green-500 text-white px-2 rounded">Excel</button>
              <button @click="exportarSeccionPDF('aserrin')" class="bg-red-500 text-white px-2 rounded">PDF</button>
            </div>
          </div>
          <div v-show="secciones.aserrin">
            <apexchart width="100%" height="300" type="line" :options="chartOptions" :series="aserrinSeries" />
            <table class="w-full mt-4 text-sm border border-gray-200">
              <thead class="bg-gray-100">
                <tr><th class="p-2 border">Fecha</th><th class="p-2 border">Proveedor</th><th class="p-2 border">Palas</th><th class="p-2 border">Humedad</th></tr>
              </thead>
              <tbody>
                <tr v-for="a in aserrinDataFiltrada" :key="a.id">
                  <td class="p-2 border">{{ a.fecha }}</td>
                  <td class="p-2 border">{{ a.proveedor }}</td>
                  <td class="p-2 border">{{ a.palas }}</td>
                  <td class="p-2 border">{{ a.humedad }} %</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ASISTENCIA -->
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-gray-700 font-semibold">Asistencia</h3>
            <div class="flex gap-2">
              <button @click="toggleSeccion('asistencia')" class="bg-gray-300 px-2 rounded">
                {{ secciones.asistencia ? '-' : '+' }}
              </button>
              <button @click="exportarSeccionExcel('asistencia')" class="bg-green-500 text-white px-2 rounded">Excel</button>
              <button @click="exportarSeccionPDF('asistencia')" class="bg-red-500 text-white px-2 rounded">PDF</button>
            </div>
          </div>
          <div v-show="secciones.asistencia">
            <apexchart width="100%" height="300" type="bar" :options="chartOptions" :series="asistenciaSeries" />
            <table class="w-full mt-4 text-sm border border-gray-200">
              <thead class="bg-gray-100">
                <tr><th class="p-2 border">Fecha</th><th class="p-2 border">Empleados</th></tr>
              </thead>
              <tbody>
                <tr v-for="as in asistenciaDataFiltrada" :key="as.fecha">
                  <td class="p-2 border">{{ as.fecha }}</td>
                  <td class="p-2 border">{{ as.empleados_presentes.join(', ') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import ApexCharts from 'vue3-apexcharts'
import { exportToExcel, exportToPDF } from '@/utils/export.js'

// Estado global
const loading = ref(true)
const fechaInicio = ref('')
const fechaFin = ref('')
const secciones = ref({
  produccion: true,
  despacho: true,
  aserrin: true,
  asistencia: true
})

// Totales
const produccionHoy = ref(0)
const produccionTotal = ref(0)
const totalFundasDespachadas = ref(0)
const asistenciaHoy = ref(0)
const aserrinTotal = ref(0)

// Datos originales
const produccionData = ref([])
const despachoData = ref([])
const aserrinData = ref([])
const asistenciaData = ref([])

// Datos filtrados (computados)
const produccionDataFiltrada = computed(() => aplicarFiltro(produccionData.value))
const despachoDataFiltrada = computed(() => aplicarFiltro(despachoData.value))
const aserrinDataFiltrada = computed(() => aplicarFiltro(aserrinData.value))
const asistenciaDataFiltrada = computed(() => aplicarFiltro(asistenciaData.value))

// Series para gráficos
const produccionSeries = ref([])
const despachoSeries = ref([])
const aserrinSeries = ref([])
const asistenciaSeries = ref([])

const chartOptions = {
  chart: { toolbar: { show: false } },
  xaxis: { categories: [] },
  dataLabels: { enabled: true },
  colors: ['#2563eb', '#16a34a', '#f59e0b', '#7c3aed']
}

// ✅ Cargar datos desde Supabase
const cargarDatos = async () => {
  loading.value = true
  try {
    // PRODUCCIÓN
    const { data: produccion } = await supabase.from('produccion_fundas').select('*').order('fecha')
    produccionData.value = produccion || []

    // DESPACHOS
    const { data: despacho } = await supabase.from('viajes_despacho').select('*')
    despachoData.value = despacho || []

    // ASERRÍN
    const { data: aserrin } = await supabase.from('aserrin').select('*')
    aserrinData.value = aserrin || []

    // ASISTENCIA
    const { data: asistencia } = await supabase.from('asistencia').select('*')
    asistenciaData.value = asistencia || []

    calcularTotales()
    generarSeries()
  } catch (error) {
    console.error('Error al cargar datos:', error)
  } finally {
    loading.value = false
  }
}

// ✅ Calcular totales
const calcularTotales = () => {
  const hoy = new Date().toISOString().split('T')[0]

  produccionTotal.value = produccionData.value.reduce((sum, r) => sum + (r.fundas || 0), 0)
  produccionHoy.value = produccionData.value.find(r => r.fecha === hoy)?.fundas || 0

  totalFundasDespachadas.value = despachoData.value.reduce((sum, r) => sum + (r.fundas_calculadas || 0), 0)
  asistenciaHoy.value = asistenciaData.value.find(r => r.fecha === hoy)?.empleados_presentes?.length || 0
  aserrinTotal.value = aserrinData.value.reduce((sum, r) => sum + (r.palas || 0), 0)
}

// ✅ Generar series para gráficos
const generarSeries = () => {
  // Producción
  produccionSeries.value = [
    { name: 'Fundas', data: produccionDataFiltrada.value.map(r => r.fundas) }
  ]
  chartOptions.xaxis.categories = produccionDataFiltrada.value.map(r => r.fecha)

  // Despachos
  despachoSeries.value = [
    { name: 'Fundas Despachadas', data: despachoDataFiltrada.value.map(r => r.fundas_calculadas) }
  ]

  // Aserrín
  aserrinSeries.value = [
    { name: 'Palas', data: aserrinDataFiltrada.value.map(r => r.palas) }
  ]

  // Asistencia
  asistenciaSeries.value = [
    { name: 'Asistencias', data: asistenciaDataFiltrada.value.map(r => r.empleados_presentes?.length || 0) }
  ]
}

// ✅ Filtro por fecha
const aplicarFiltro = (datos) => {
  if (!fechaInicio.value || !fechaFin.value) return datos
  return datos.filter(r => r.fecha >= fechaInicio.value && r.fecha <= fechaFin.value)
}

const aplicarFiltros = () => {
  generarSeries()
}

// ✅ Toggle secciones
const toggleSeccion = (seccion) => {
  secciones.value[seccion] = !secciones.value[seccion]
}

// ✅ Exportar secciones
const exportarSeccionExcel = (tipo) => {
  let data = []
  let nombre = ''
  if (tipo === 'produccion') { data = produccionDataFiltrada.value; nombre = 'Produccion.xlsx' }
  if (tipo === 'despacho') { data = despachoDataFiltrada.value; nombre = 'Despachos.xlsx' }
  if (tipo === 'aserrin') { data = aserrinDataFiltrada.value; nombre = 'Aserrin.xlsx' }
  if (tipo === 'asistencia') { data = asistenciaDataFiltrada.value; nombre = 'Asistencia.xlsx' }
  exportToExcel(data, nombre)
}

const exportarSeccionPDF = (tipo) => {
  let data = []
  let headers = []
  let nombre = ''
  if (tipo === 'produccion') {
    data = produccionDataFiltrada.value
    headers = [{ header: 'Fecha', dataKey: 'fecha' }, { header: 'Fundas', dataKey: 'fundas' }]
    nombre = 'Produccion.pdf'
  }
  if (tipo === 'despacho') {
    data = despachoDataFiltrada.value
    headers = [{ header: 'Tipo', dataKey: 'tipo' }, { header: 'Viajes', dataKey: 'cantidad_viajes' }, { header: 'Fundas', dataKey: 'fundas_calculadas' }]
    nombre = 'Despachos.pdf'
  }
  if (tipo === 'aserrin') {
    data = aserrinDataFiltrada.value
    headers = [{ header: 'Fecha', dataKey: 'fecha' }, { header: 'Proveedor', dataKey: 'proveedor' }, { header: 'Palas', dataKey: 'palas' }]
    nombre = 'Aserrin.pdf'
  }
  if (tipo === 'asistencia') {
    data = asistenciaDataFiltrada.value.map(r => ({ fecha: r.fecha, empleados: r.empleados_presentes.join(', ') }))
    headers = [{ header: 'Fecha', dataKey: 'fecha' }, { header: 'Empleados', dataKey: 'empleados' }]
    nombre = 'Asistencia.pdf'
  }
  exportToPDF(data, headers, nombre)
}

// ✅ Exportar todo
const exportarExcelGeneral = () => {
  const combined = [
    ...produccionDataFiltrada.value,
    ...despachoDataFiltrada.value,
    ...aserrinDataFiltrada.value,
    ...asistenciaDataFiltrada.value
  ]
  exportToExcel(combined, 'Dashboard-General.xlsx')
}

const exportarPDFGeneral = () => {
  exportToPDF(produccionDataFiltrada.value, [{ header: 'Fecha', dataKey: 'fecha' }, { header: 'Fundas', dataKey: 'fundas' }], 'Dashboard-General.pdf')
}

// Montaje
onMounted(() => {
  cargarDatos()
})
</script>
