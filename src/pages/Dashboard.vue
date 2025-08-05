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
      <h2 class="text-xl font-semibold mb-4">Ingreso de Aserrín (Palas por Proveedor)</h2>
      <apexchart
        width="100%"
        height="350"
        type="line"
        :options="chartAserrinOptions"
        :series="aserrinSeries"
      />
    </div>

    <!-- GRÁFICO DEL HORNO -->
    <div class="bg-white rounded-lg shadow p-6 mt-8">
      <h2 class="text-xl font-semibold mb-4">Gráfico Operación del Horno</h2>
      <apexchart
        width="100%"
        height="450"
        type="line"
        :options="chartHornoOptions"
        :series="hornoSeries"
      />

      <!-- Tabla Promedios debajo del gráfico -->
      <div class="mt-6">
        <h2 class="text-lg font-semibold mb-4 text-center">Promedio del Horno</h2>
        <table class="w-full border text-sm">
          <thead class="bg-gray-100 text-center">
            <tr>
              <th class="border px-4 py-2">Métrica</th>
              <th class="border px-4 py-2">Promedio</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border px-4 py-2">Jampa</td>
              <td class="border px-4 py-2 text-center font-semibold">{{ promedioJampa }}</td>
            </tr>
            <tr>
              <td class="border px-4 py-2">Viruta</td>
              <td class="border px-4 py-2 text-center font-semibold">{{ promedioViruta }}</td>
            </tr>
            <tr>
              <td class="border px-4 py-2">Pellet</td>
              <td class="border px-4 py-2 text-center font-semibold">{{ promedioPellet }}</td>
            </tr>
            <tr>
              <td class="border px-4 py-2">T. Entrada (°C)</td>
              <td class="border px-4 py-2 text-center font-semibold">{{ promedioEntrada }}°C</td>
            </tr>
            <tr>
              <td class="border px-4 py-2">T. Salida (°C)</td>
              <td class="border px-4 py-2 text-center font-semibold">{{ promedioSalida }}°C</td>
            </tr>
            <tr>
              <td class="border px-4 py-2">Humedad (%)</td>
              <td class="border px-4 py-2 text-center font-semibold">{{ promedioHumedad }}%</td>
            </tr>
            <tr>
              <td class="border px-4 py-2">Amperios</td>
              <td class="border px-4 py-2 text-center font-semibold">{{ promedioAmperios }} A</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "@/lib/supabase";

const fechaInicio = ref("");
const fechaFin = ref("");
const totalProduccion = ref(0);
const totalDespachos = ref(0);
const totalAserrin = ref(0);
const stockActual = ref(0);

const comparativoSeries = ref([]);
const chartComparativoOptions = {
  chart: { toolbar: { show: true }, zoom: { enabled: true } },
  xaxis: { categories: [], title: { text: "Fechas" }, labels: { rotate: -45 } },
  stroke: { curve: "smooth" },
  colors: ["#2563eb", "#10b981", "#f59e0b"],
  dataLabels: { enabled: false },
  tooltip: { shared: true, intersect: false },
  legend: { position: "top" },
};

const aserrinSeries = ref([]);
const chartAserrinOptions = {
  chart: {
    toolbar: {
      show: true,
      tools: { download: true, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true },
    },
    zoom: { enabled: true, type: "x", autoScaleYaxis: true },
  },
  xaxis: { categories: [], title: { text: "Fecha" } },
  stroke: { curve: "smooth" },
  colors: ["#6366f1"],
  tooltip: {
    custom: function({ series, seriesIndex, dataPointIndex, w }) {
      const proveedor = w.config.series[seriesIndex].meta[dataPointIndex];
      const palas = series[seriesIndex][dataPointIndex];
      return `<div class="p-2"><b>${palas} palas</b><br>Proveedor: ${proveedor}</div>`;
    },
  },
};

const hornoSeries = ref([]);
const chartHornoOptions = {
  chart: { toolbar: { show: true }, zoom: { enabled: true } },
  stroke: { curve: "smooth" },
  colors: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"],
  xaxis: { categories: [], title: { text: "Hora" } },
};

// Promedios del horno (solo hoy)
const promedioEntrada = ref(0);
const promedioSalida = ref(0);
const promedioHumedad = ref(0);
const promedioAmperios = ref(0);
const promedioJampa = ref(0);
const promedioViruta = ref(0);
const promedioPellet = ref(0);

const cargarDatos = async () => {
  let qProd = supabase.from("produccion_fundas").select("*");
  let qDesp = supabase.from("despachos").select("*");
  let qAser = supabase.from("aserrin").select("*");

  if (fechaInicio.value && fechaFin.value) {
    qProd = qProd.gte("fecha", fechaInicio.value).lte("fecha", fechaFin.value);
    qDesp = qDesp.gte("fecha", fechaInicio.value).lte("fecha", fechaFin.value);
    qAser = qAser.gte("fecha", fechaInicio.value).lte("fecha", fechaFin.value);
  }

  const [{ data: produccion }, { data: despachos }, { data: aserrin }] = await Promise.all([
    qProd,
    qDesp,
    qAser,
  ]);

  totalProduccion.value = produccion.reduce((a, p) => a + p.fundas, 0);
  totalDespachos.value = despachos.reduce((a, d) => a + d.fundas_actual, 0);
  stockActual.value = totalProduccion.value - totalDespachos.value;
  totalAserrin.value = aserrin.reduce((a, r) => a + r.palas, 0);

  // Gráfico comparativo (Producción vs Despachos vs Stock)
  const fechas = [...new Set([...produccion.map(p => p.fecha), ...despachos.map(d => d.fecha)])].sort();
  const prodPorFecha = fechas.map(f => produccion.filter(p => p.fecha === f).reduce((a, p) => a + p.fundas, 0));
  const despPorFecha = fechas.map(f => despachos.filter(d => d.fecha === f).reduce((a, d) => a + d.fundas_actual, 0));
  let stockAcumulado = 0;
  const stockPorFecha = fechas.map((_, i) => {
    stockAcumulado += prodPorFecha[i] - despPorFecha[i];
    return stockAcumulado;
  });

  chartComparativoOptions.xaxis.categories = fechas;
  comparativoSeries.value = [
    { name: "Producción", data: prodPorFecha },
    { name: "Entregadas", data: despPorFecha },
    { name: "Stock Acumulado", data: stockPorFecha },
  ];

  // Gráfico Aserrín con proveedores
  const fechasAserrin = [...new Set(aserrin.map(a => a.fecha))].sort();
  const palasPorFecha = fechasAserrin.map(f => aserrin.filter(a => a.fecha === f).reduce((a, r) => a + r.palas, 0));
  const proveedores = fechasAserrin.map(f => aserrin.filter(a => a.fecha === f).map(r => r.proveedor).join(", "));
  chartAserrinOptions.xaxis.categories = fechasAserrin;
  aserrinSeries.value = [{ name: "Palas", data: palasPorFecha, meta: proveedores }];

  // ✅ Gráfico Horno (solo día actual)
  const hoy = new Date().toISOString().split("T")[0];
  const { data: hornoHoy } = await supabase.from("horno").select("*").eq("fecha", hoy);

  hornoSeries.value = [
    { name: "Temp Entrada", data: hornoHoy.map(h => h.temperatura_entrada) },
    { name: "Temp Salida", data: hornoHoy.map(h => h.temperatura_salida) },
    { name: "Humedad", data: hornoHoy.map(h => h.humedad) },
    { name: "Amperios", data: hornoHoy.map(h => h.amperios) },
  ];
  chartHornoOptions.xaxis.categories = hornoHoy.map(h => h.hora || "Sin hora");

  // ✅ Promedios solo de hoy
  promedioJampa.value = (hornoHoy.reduce((a, h) => a + (h.jampa || 0), 0) / (hornoHoy.length || 1)).toFixed(1);
  promedioViruta.value = (hornoHoy.reduce((a, h) => a + (h.viruta || 0), 0) / (hornoHoy.length || 1)).toFixed(1);
  promedioPellet.value = (hornoHoy.reduce((a, h) => a + (h.pellet || 0), 0) / (hornoHoy.length || 1)).toFixed(1);
  promedioEntrada.value = (hornoHoy.reduce((a, h) => a + (h.temperatura_entrada || 0), 0) / (hornoHoy.length || 1)).toFixed(1);
  promedioSalida.value = (hornoHoy.reduce((a, h) => a + (h.temperatura_salida || 0), 0) / (hornoHoy.length || 1)).toFixed(1);
  promedioHumedad.value = (hornoHoy.reduce((a, h) => a + (h.humedad || 0), 0) / (hornoHoy.length || 1)).toFixed(1);
  promedioAmperios.value = (hornoHoy.reduce((a, h) => a + (h.amperios || 0), 0) / (hornoHoy.length || 1)).toFixed(1);
};

onMounted(cargarDatos);
</script>
