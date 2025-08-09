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
      <h2 class="text-xl font-semibold mb-4">Gráfico Operación del Horno (hoy)</h2>
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
import { ref, onMounted, shallowRef } from "vue";
import { supabase } from "@/lib/supabase";

/* ===== Helpers de fecha/hora local (evitan UTC) ===== */
function getLocalDate() {
  const now = new Date();
  const tzoffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzoffset).toISOString().slice(0, 10); // yyyy-mm-dd local
}
function getLocalTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

const fechaInicio = ref("");
const fechaFin = ref("");
const totalProduccion = ref(0);
const totalDespachos = ref(0);
const totalAserrin = ref(0);
const stockActual = ref(0);

/* Usamos shallowRef para evitar problemas de reactive deep en Apex */
const comparativoSeries = shallowRef([]);
const chartComparativoOptions = shallowRef({
  chart: { toolbar: { show: true }, zoom: { enabled: true } },
  xaxis: { categories: [], title: { text: "Fechas" }, labels: { rotate: -45 } },
  stroke: { curve: "smooth" },
  colors: ["#2563eb", "#10b981", "#f59e0b"],
  dataLabels: { enabled: false },
  tooltip: { shared: true, intersect: false },
  legend: { position: "top" },
});

const aserrinSeries = shallowRef([]);
const chartAserrinOptions = shallowRef({
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
    custom: function ({ series, seriesIndex, dataPointIndex, w }) {
      const proveedor = (w?.config?.series?.[seriesIndex]?.meta?.[dataPointIndex]) || "—";
      const palas = series?.[seriesIndex]?.[dataPointIndex] ?? 0;
      return `<div class="p-2"><b>${palas} palas</b><br>Proveedor: ${proveedor}</div>`;
    },
  },
});

const hornoSeries = shallowRef([]);
const chartHornoOptions = shallowRef({
  chart: { toolbar: { show: true }, zoom: { enabled: true } },
  stroke: { curve: "smooth" },
  colors: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b"],
  xaxis: { categories: [], title: { text: "Hora" } },
});

// Promedios del horno (solo hoy)
const promedioEntrada = ref(0);
const promedioSalida = ref(0);
const promedioHumedad = ref(0);
const promedioAmperios = ref(0);
const promedioJampa = ref(0);
const promedioViruta = ref(0);
const promedioPellet = ref(0);

function safeAvg(arr) {
  if (!arr || arr.length === 0) return 0;
  const num = arr.reduce((a, n) => a + (Number(n) || 0), 0);
  return +(num / arr.length).toFixed(1);
}

const cargarDatos = async () => {
  // Queries base
  let qProd = supabase.from("produccion_fundas").select("*");
  let qDesp = supabase.from("despachos").select("*");
  let qAser = supabase.from("aserrin").select("*");

  // Filtro por fechas (local YYYY-MM-DD)
  if (fechaInicio.value && fechaFin.value) {
    qProd = qProd.gte("fecha", fechaInicio.value).lte("fecha", fechaFin.value);
    qDesp = qDesp.gte("fecha", fechaInicio.value).lte("fecha", fechaFin.value);
    qAser = qAser.gte("fecha", fechaInicio.value).lte("fecha", fechaFin.value);
  }

  const [{ data: produccion = [] }, { data: despachos = [] }, { data: aserrin = [] }] = await Promise.all([
    qProd,
    qDesp,
    qAser,
  ]);

  // Resúmenes
  totalProduccion.value = produccion.reduce((a, p) => a + (p.fundas || 0), 0);
  totalDespachos.value = despachos.reduce((a, d) => a + (d.fundas_actual || 0), 0);
  stockActual.value = totalProduccion.value - totalDespachos.value;
  totalAserrin.value = aserrin.reduce((a, r) => a + (r.palas || 0), 0);

  // ---------- Gráfico comparativo (Producción vs Despachos vs Stock) ----------
  const fechas = [...new Set([...produccion.map(p => p.fecha), ...despachos.map(d => d.fecha)])].sort();
  const prodPorFecha = fechas.map(f => produccion.filter(p => p.fecha === f).reduce((a, p) => a + (p.fundas || 0), 0));
  const despPorFecha = fechas.map(f => despachos.filter(d => d.fecha === f).reduce((a, d) => a + (d.fundas_actual || 0), 0));

  let stockAcumulado = 0;
  const stockPorFecha = fechas.map((_, i) => {
    stockAcumulado += (prodPorFecha[i] || 0) - (despPorFecha[i] || 0);
    return stockAcumulado;
  });

  chartComparativoOptions.value = {
    ...chartComparativoOptions.value,
    xaxis: { ...chartComparativoOptions.value.xaxis, categories: fechas },
  };
  comparativoSeries.value = [
    { name: "Producción", data: prodPorFecha },
    { name: "Entregadas", data: despPorFecha },
    { name: "Stock Acumulado", data: stockPorFecha },
  ];

  // ---------- Gráfico Aserrín (palas por fecha + proveedores en tooltip) ----------
  const fechasAserrin = [...new Set(aserrin.map(a => a.fecha))].sort();
  const palasPorFecha = fechasAserrin.map(f => aserrin.filter(a => a.fecha === f).reduce((a, r) => a + (r.palas || 0), 0));
  const proveedores = fechasAserrin.map(f => aserrin.filter(a => a.fecha === f).map(r => r.proveedor).join(", ") || "—");

  chartAserrinOptions.value = {
    ...chartAserrinOptions.value,
    xaxis: { ...chartAserrinOptions.value.xaxis, categories: fechasAserrin },
  };
  aserrinSeries.value = [{ name: "Palas", data: palasPorFecha, meta: proveedores }];

  // ---------- Gráfico del horno (solo HOY local) ----------
  const hoyLocal = getLocalDate();
  const { data: hornoHoy = [] } = await supabase.from("horno").select("*").eq("fecha", hoyLocal).order("hora", { ascending: true });

  const horas = hornoHoy.map(h => h.hora || "—");
  const serieEntrada = hornoHoy.map(h => h.temperatura_entrada ?? null);
  const serieSalida  = hornoHoy.map(h => h.temperatura_salida ?? null);
  const serieHum     = hornoHoy.map(h => h.humedad ?? null);
  const serieAmp     = hornoHoy.map(h => h.amperios ?? null);

  // Asegura longitudes alineadas
  chartHornoOptions.value = {
    ...chartHornoOptions.value,
    xaxis: { ...chartHornoOptions.value.xaxis, categories: horas },
  };
  hornoSeries.value = [
    { name: "Temp Entrada", data: serieEntrada },
    { name: "Temp Salida",  data: serieSalida  },
    { name: "Humedad",      data: serieHum     },
    { name: "Amperios",     data: serieAmp     },
  ];

  // Promedios (solo hoy)
  promedioJampa.value    = safeAvg(hornoHoy.map(h => h.jampa));
  promedioViruta.value   = safeAvg(hornoHoy.map(h => h.viruta));
  promedioPellet.value   = safeAvg(hornoHoy.map(h => h.pellet));
  promedioEntrada.value  = safeAvg(hornoHoy.map(h => h.temperatura_entrada));
  promedioSalida.value   = safeAvg(hornoHoy.map(h => h.temperatura_salida));
  promedioHumedad.value  = safeAvg(hornoHoy.map(h => h.humedad));
  promedioAmperios.value = safeAvg(hornoHoy.map(h => h.amperios));
};

onMounted(cargarDatos);
</script>
