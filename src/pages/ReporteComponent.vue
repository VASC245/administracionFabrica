<template>
  <div class="bg-white rounded-xl shadow p-6 space-y-6">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold">Reporte Diario</h2>
        <p class="text-gray-500 text-sm">Consolidado por día (datos directo de BD)</p>
      </div>

      <div class="flex gap-2 items-end">
        <div>
          <label class="block text-sm font-medium">Fecha</label>
          <input type="date" v-model="fechaStr" class="border rounded-lg px-3 py-2" />
        </div>
        <button
          class="bg-gray-100 border px-4 py-2 rounded-lg hover:bg-gray-200"
          @click="aplicarFiltro"
          :disabled="loading"
        >
          {{ loading ? 'Cargando…' : 'Filtrar' }}
        </button>
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          @click="downloadPdf"
        >
          Descargar PDF
        </button>
      </div>
    </header>

    <!-- KPIs -->
    <section class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard title="Fundas producidas" :value="fundasProduccionTotal" />
      <KpiCard title="Despachos (ton)" :value="despachosTonTotal" />
      <KpiCard title="Asistencia (presentes)" :value="asistenciaPresentes" />
      <KpiCard title="Aserrín (palas)" :value="aserrinPalasTotal" />
      <KpiCard title="Horno (T° in / out)" :value="hornoPromedioTempTxt" />
      <KpiCard title="Horno (Humedad %)" :value="hornoPromedioHumTxt" />
      <KpiCard title="Mant. realizados" :value="mantHechos" />
      <KpiCard title="Mant. vencidos (prog.)" :value="mantProgramadosVencidos" />
      <KpiCard title="Repuestos usados" :value="repuestosUsadosTotal" />
      <KpiCard title="Paradas técnicas (h)" :value="paradasHorasTotal" />
    </section>

    <!-- CONTENIDO (solo para la vista; el PDF se construye aparte) -->
    <section class="space-y-8">
      <Block title="Producción de fundas">
        <template #body>
          <TableBasic :headers="['Fecha','Fundas']" :rows="produccionFundasRows" empty="Sin registros" />
        </template>
      </Block>

      <Block title="Despachos">
        <template #body>
          <TableBasic
            :headers="['Fecha','Toneladas','Fundas meta','Fundas actual']"
            :rows="despachosRows"
            empty="Sin registros"
          />
        </template>
      </Block>

      <Block title="Asistencia">
        <template #body>
          <div class="text-sm text-gray-700 mb-2">Presentes: <b>{{ asistenciaPresentes }}</b></div>
          <TableBasic
            :headers="['Fecha','Hora','Día','Presentes (lista)']"
            :rows="asistenciaRows"
            empty="Sin registros"
          />
        </template>
      </Block>

      <Block title="Ingreso de aserrín">
        <template #body>
          <div class="text-sm text-gray-700 mb-2">Palas totales: <b>{{ aserrinPalasTotal }}</b></div>
          <TableBasic
            :headers="['Fecha','Proveedor','Humedad','Palas']"
            :rows="aserrinRows"
            empty="Sin registros"
          />
        </template>
      </Block>

      <Block title="Horno (promedios del día)">
        <template #body>
          <div class="text-sm text-gray-700">
            {{ hornoPromedioTexto || 'Sin registros de horno para la fecha' }}
          </div>
          <TableBasic
            class="mt-3"
            :headers="['Hora','Jampa','Viruta','Pellet','T° entrada','T° salida','Humedad','Amperios']"
            :rows="hornoRows"
            empty="Sin registros"
          />
        </template>
      </Block>

      <Block title="Mantenimiento">
        <template #body>
          <div class="grid lg:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium mb-2">Realizados (mantenimiento)</h4>
              <TableBasic
                :headers="['Fecha','Máquina','Tipo','Descripción','Horas acum.','Repuestos','Costo']"
                :rows="mantHechosRows"
                empty="Sin registros"
              />
            </div>
            <div>
              <h4 class="font-medium mb-2">Programados VENCIDOS (calculado)</h4>
              <TableBasic
                :headers="['Máquina','Tipo','Descripción','Cada (h)','Últ. eje. h','Acum. h (día)','Vencido']"
                :rows="mantVencidosRows"
                empty="Sin programados vencidos"
              />
            </div>
          </div>
        </template>
      </Block>

      <Block title="Repuestos usados (movimientos)">
        <template #body>
          <TableBasic
            :headers="['Fecha/hora','Repuesto ID','Cantidad','Motivo','Referencia']"
            :rows="repuestosRows"
            empty="Sin movimientos de salida"
          />
        </template>
      </Block>

      <Block title="Paradas técnicas">
        <template #body>
          <div class="text-sm text-gray-700">Total horas (día): <b>{{ paradasHorasTotal }}</b></div>
          <TableBasic
            class="mt-3"
            :headers="['Inicio','Fin','Motivo','Categoría','Horas (día)']"
            :rows="paradasRows"
            empty="Sin registros"
          />
        </template>
      </Block>
    </section>
  </div>
</template>

<script setup>
/**
 * PDF con diseño de marca: jsPDF + jspdf-autotable.
 * Solo BD: lee directamente Supabase (sin stores/services).
 */
import { ref, computed, onMounted } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import Block from '@/components/report/Block.vue'
import KpiCard from '@/components/report/KpiCard.vue'
import TableBasic from '@/components/report/TableBasic.vue'
import { supabase } from '@/lib/supabase'
import logoUrl from '@/assets/logo-fuegoverde.png' // <-- ajusta la ruta si usas otro nombre

/* ======== Fecha & estado ======== */
const hoyISO = new Date().toISOString().slice(0,10)
const fechaStr = ref(hoyISO)
const loading = ref(false)

/* ======== Estado local (tablas) ======== */
const aserrin = ref([])
const horno = ref([])
const asistencia = ref([])
const produccionFundas = ref([])
const despachos = ref([])
const maquinas = ref([])
const horasMaquina = ref([])
const mantenimiento = ref([])
const mantProgramado = ref([])
const paradas = ref([])
const repMov = ref([])

/* ======== Helpers ======== */
const n = (x) => Number(x || 0)
const sameDay = (dISO, dayISO) => (dISO || '').slice(0,10) === dayISO
const fmtDate = (d) => (d || '').slice(0,10)
const fmtTime = (t) => (t || '').slice(0,5)
const toISODate = (d) => new Date(d).toISOString().slice(0,10)
function hoursOverlapWithDay(startISO, endISO, dayISO) {
  if (!startISO || !endISO) return 0
  const dayStart = new Date(`${dayISO}T00:00:00Z`)
  const dayEnd   = new Date(`${dayISO}T23:59:59Z`)
  const s = new Date(startISO)
  const e = new Date(endISO)
  const start = s > dayStart ? s : dayStart
  const end = e < dayEnd ? e : dayEnd
  const ms = Math.max(0, end - start)
  return Math.round((ms / 36e5) * 100) / 100
}

/* ======== Carga directa BD ======== */
async function safeLoad(table, columns='*', orderBy, asc=true) {
  try {
    let q = supabase.from(table).select(columns)
    if (orderBy) q = q.order(orderBy, { ascending: asc })
    const { data, error } = await q
    if (error) throw error
    return data || []
  } catch (e) {
    console.warn(`[ReporteDiario] No se pudo leer '${table}':`, e)
    return []
  }
}

async function aplicarFiltro() {
  loading.value = true
  try {
    aserrin.value          = await safeLoad('aserrin', '*', 'fecha', true)
    horno.value            = await safeLoad('horno', '*', 'fecha', true)
    asistencia.value       = await safeLoad('asistencia', '*', 'fecha', true)
    produccionFundas.value = await safeLoad('produccion_fundas', '*', 'fecha', true)
    despachos.value        = await safeLoad('despachos', '*', 'fecha', true)

    mantenimiento.value    = await safeLoad('mantenimientos', '*', 'fecha', true)
    mantProgramado.value   = await safeLoad('mantenimiento_programado', '*', 'created_at', true)

    maquinas.value         = await safeLoad('maquinas', '*', 'created_at', true)
    horasMaquina.value     = await safeLoad('horas_maquina', '*', 'fecha', true)

    paradas.value          = await safeLoad('paradas_tecnicas', '*', 'inicio', true)
    repMov.value           = await safeLoad('repuesto_movimientos', 'fecha,repuesto_id,cantidad,motivo,referencia', 'fecha', true)
  } finally {
    loading.value = false
  }
}
onMounted(aplicarFiltro)

/* ======== PRODUCCIÓN FUNDAS ======== */
const prodDia = computed(() => (produccionFundas.value || []).filter(r => sameDay(r.fecha, fechaStr.value)))
const fundasProduccionTotal = computed(() => prodDia.value.reduce((a,b) => a + n(b.fundas), 0))
const produccionFundasRows = computed(() => prodDia.value.map(r => [ fmtDate(r.fecha), n(r.fundas) ]))

/* ======== DESPACHOS ======== */
const despDia = computed(() => (despachos.value || []).filter(r => sameDay(r.fecha, fechaStr.value)))
const despachosTonTotal = computed(() => despDia.value.reduce((a,b) => a + n(b.toneladas), 0))
const despachosRows = computed(() =>
  despDia.value.map(r => [ fmtDate(r.fecha), n(r.toneladas), n(r.fundas_meta), n(r.fundas_actual) ])
)

/* ======== ASISTENCIA ======== */
const asisDia = computed(() => (asistencia.value || []).filter(r => sameDay(r.fecha, fechaStr.value)))
const asistenciaPresentes = computed(() =>
  asisDia.value.reduce((acc, r) => acc + (Array.isArray(r.empleados_presentes) ? r.empleados_presentes.length : 0), 0)
)
const asistenciaRows = computed(() =>
  asisDia.value.map(r => [
    fmtDate(r.fecha),
    r.hora || '—',
    r.dia || '—',
    (Array.isArray(r.empleados_presentes) ? r.empleados_presentes.join(', ') : '—')
  ])
)

/* ======== ASERRÍN ======== */
const aserrinDia = computed(() => (aserrin.value || []).filter(r => sameDay(r.fecha, fechaStr.value)))
const aserrinPalasTotal = computed(() => aserrinDia.value.reduce((a,b) => a + n(b.palas), 0))
const aserrinRows = computed(() =>
  aserrinDia.value.map(r => [ fmtDate(r.fecha), r.proveedor, r.humedad ?? '—', n(r.palas) ])
)

/* ======== HORNO ======== */
const hornoDia = computed(() => (horno.value || []).filter(r => sameDay(r.fecha, fechaStr.value)))
const avg = (arr, key) => {
  const nums = arr.map(x => n(x[key])).filter(Number.isFinite)
  if (!nums.length) return null
  return Math.round((nums.reduce((a,b)=>a+b,0)/nums.length)*10)/10
}
const promTIn  = computed(() => avg(hornoDia.value, 'temperatura_entrada'))
const promTOut = computed(() => avg(hornoDia.value, 'temperatura_salida'))
const promHum  = computed(() => avg(hornoDia.value, 'humedad'))
const hornoPromedioTexto = computed(() => {
  if (!hornoDia.value.length) return ''
  return `T° in: ${promTIn.value ?? '—'}°C | T° out: ${promTOut.value ?? '—'}°C | Humedad: ${promHum.value ?? '—'}%`
})
const hornoPromedioTempTxt = computed(() => {
  if (promTIn.value == null || promTOut.value == null) return '—'
  return `${promTIn.value} / ${promTOut.value}`
})
const hornoPromedioHumTxt = computed(() => promHum.value == null ? '—' : `${promHum.value}`)
const hornoRows = computed(() =>
  hornoDia.value.map(h => [
    h.hora ? fmtTime(h.hora) : '—',
    n(h.jampa), n(h.viruta), n(h.pellet),
    n(h.temperatura_entrada), n(h.temperatura_salida),
    n(h.humedad), n(h.amperios)
  ])
)

/* ======== MANTENIMIENTO (realizados) ======== */
const mantDia = computed(() => (mantenimiento.value || []).filter(r => sameDay(r.fecha, fechaStr.value)))
const mantHechos = computed(() => mantDia.value.length)
const mantHechosRows = computed(() =>
  mantDia.value.map(m => [
    fmtDate(m.fecha), m.maquina_id, m.tipo, m.descripcion,
    m.horas_acumuladas ?? '—', m.repuestos ?? '—', m.costo ?? '—'
  ])
)

/* ======== MANTENIMIENTO PROGRAMADO (vencidos por horas) ======== */
const horasAcumPorMaquinaHastaDia = computed(() => {
  const target = fechaStr.value
  const acc = new Map()
  for (const h of (horasMaquina.value || [])) {
    if (!h.maquina_id || !h.fecha) continue
    if (toISODate(h.fecha) > target) continue
    const prev = acc.get(h.maquina_id) || 0
    acc.set(h.maquina_id, prev + Number(h.horas || 0))
  }
  return acc
})
const mantProgVencidosLista = computed(() => {
  const out = []
  for (const mp of (mantProgramado.value || [])) {
    if (mp.activo !== true) continue
    const acumHoy = horasAcumPorMaquinaHastaDia.value.get(mp.maquina_id) || 0
    const ultimaH = Number(mp.ultima_ejecucion_horas || 0)
    const cadaH   = Number(mp.cada_horas || 0)
    const vencido = (acumHoy - ultimaH) >= cadaH && cadaH > 0
    if (vencido) {
      out.push({
        maquina_id: mp.maquina_id,
        tipo: mp.tipo,
        descripcion: mp.descripcion,
        cada_horas: cadaH,
        ultima_ejecucion_horas: ultimaH,
        acum_hoy: Math.round(acumHoy*100)/100
      })
    }
  }
  return out
})
const mantProgramadosVencidos = computed(() => mantProgVencidosLista.value.length)
const mantVencidosRows = computed(() =>
  mantProgVencidosLista.value.map(x => [
    x.maquina_id, x.tipo, x.descripcion, x.cada_horas, x.ultima_ejecucion_horas, x.acum_hoy, 'Sí'
  ])
)

/* ======== REPUESTOS USADOS ======== */
const repMovDia = computed(() => (repMov.value || []).filter(r => sameDay(r.fecha, fechaStr.value)))
const repUsos = computed(() => repMovDia.value.filter(r => n(r.cantidad) < 0))
const repuestosUsadosTotal = computed(() =>
  repUsos.value.reduce((a,b) => a + Math.abs(n(b.cantidad)), 0)
)
const repuestosRows = computed(() =>
  repUsos.value.map(m => [
    (m.fecha || '').replace('T',' ').slice(0,16),
    m.repuesto_id, Math.abs(n(m.cantidad)),
    m.motivo || '—', m.referencia || '—'
  ])
)

/* ======== PARADAS TÉCNICAS ======== */
const paradasDia = computed(() => {
  const d = fechaStr.value
  return (paradas.value || []).filter(p => {
    const ini = p.inicio ? p.inicio.slice(0,10) : null
    const fin = p.fin ? p.fin.slice(0,10) : null
    return (ini === d || fin === d || (ini && fin && ini < d && fin > d))
  })
})
const paradasHorasTotal = computed(() =>
  paradasDia.value.reduce((a,p) => a + hoursOverlapWithDay(p.inicio, p.fin, fechaStr.value), 0).toFixed(2)
)
const paradasRows = computed(() =>
  paradasDia.value.map(p => [
    (p.inicio || '').replace('T',' ').slice(0,16),
    (p.fin || '').replace('T',' ').slice(0,16),
    p.motivo, p.categoria,
    hoursOverlapWithDay(p.inicio, p.fin, fechaStr.value).toFixed(2)
  ])
)

/* ======================= PDF con logo & paleta ======================= */
const PALETTE = {
  green:  [34, 197, 94],   // #22C55E
  amber:  [245, 158, 11],  // #F59E0B
  red:    [239, 68, 68],   // #EF4444 (libre por si quieres resaltar alertas)
  slate:  [15, 23, 42],    // #0F172A
  gray50:  [248, 250, 252],
  gray800: [31, 41, 55]
}

function addHeader(doc, fecha, imgEl) {
  const pageW = doc.internal.pageSize.getWidth()
  // fondo blanco
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, pageW, 24, 'F')

  // barra bi-color inferior del header
  doc.setFillColor(...PALETTE.green); doc.rect(0, 23, pageW/2, 2.2, 'F')
  doc.setFillColor(...PALETTE.amber); doc.rect(pageW/2, 23, pageW/2, 2.2, 'F')

  // logo
  if (imgEl) doc.addImage(imgEl, 'PNG', 10, 5, 16, 16)

  // textos
  doc.setTextColor(...PALETTE.slate)
  doc.setFontSize(14)
  doc.text('FuegoVerde woodpellets', 30, 12)
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text('Bioenergía Ecuatoriana', 30, 18)

  // fecha derecha
  doc.setTextColor(...PALETTE.slate)
  doc.setFontSize(11)
  doc.text(`Reporte Diario — ${fecha}`, pageW - 10, 12, { align: 'right' })
}

function sectionTitle(doc, text, startY) {
  const w = doc.internal.pageSize.getWidth() - 20
  doc.setFillColor(250, 250, 249)
  doc.roundedRect(10, startY, w, 11, 2, 2, 'F')
  doc.setFillColor(...PALETTE.green); doc.rect(10, startY, 3, 11, 'F')
  doc.setFillColor(...PALETTE.amber); doc.rect(13, startY, 2, 11, 'F')
  doc.setFontSize(12)
  doc.setTextColor(...PALETTE.gray800)
  doc.text(text, 18, startY + 7)
  doc.setTextColor(0, 0, 0)
  return startY + 16
}

function table(doc, head, body, startY) {
  autoTable(doc, {
    startY,
    head: [head],
    body: body.length ? body : [
      Array.from({ length: head.length }, () => '—')
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: PALETTE.green, textColor: 255, halign: 'center' },
    alternateRowStyles: { fillColor: PALETTE.gray50 },
    margin: { left: 10, right: 10 }
  })
  return doc.lastAutoTable.finalY + 6
}

function kpiTable(doc, pairs, startY) {
  const head = ['Indicador', 'Valor']
  const body = pairs.map(p => [p.k, String(p.v ?? '—')])
  autoTable(doc, {
    startY,
    head: [head],
    body,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: PALETTE.amber, textColor: 255, halign: 'center' },
    alternateRowStyles: { fillColor: PALETTE.gray50 },
    margin: { left: 10, right: 10 }
  })
  return doc.lastAutoTable.finalY + 6
}

async function downloadPdf() {
  // Pre-carga del logo
  const img = new Image()
  img.src = logoUrl
  try { await img.decode() } catch {}

  const doc = new jsPDF('p', 'mm', 'a4')
  addHeader(doc, fechaStr.value, img)
  let y = 30

  // KPIs
  y = sectionTitle(doc, 'Resumen de indicadores', y)
  y = kpiTable(doc, [
    { k: 'Fundas producidas', v: fundasProduccionTotal.value },
    { k: 'Despachos (ton)', v: despachosTonTotal.value },
    { k: 'Asistencia (presentes)', v: asistenciaPresentes.value },
    { k: 'Aserrín (palas)', v: aserrinPalasTotal.value },
    { k: 'Horno T° Entrada/Salida', v: hornoPromedioTempTxt.value },
    { k: 'Horno Humedad (%)', v: hornoPromedioHumTxt.value },
    { k: 'Mant. realizados', v: mantHechos.value },
    { k: 'Mant. vencidos (prog.)', v: mantProgramadosVencidos.value },
    { k: 'Repuestos usados', v: repuestosUsadosTotal.value },
    { k: 'Paradas técnicas (h)', v: paradasHorasTotal.value }
  ], y)

  // Secciones
  y = sectionTitle(doc, 'Producción de fundas', y)
  y = table(doc, ['Fecha','Fundas'], produccionFundasRows.value, y)

  y = sectionTitle(doc, 'Despachos', y)
  y = table(doc, ['Fecha','Toneladas','Fundas meta','Fundas actual'], despachosRows.value, y)

  y = sectionTitle(doc, 'Asistencia', y)
  y = table(doc, ['Fecha','Hora','Día','Presentes (lista)'], asistenciaRows.value, y)

  y = sectionTitle(doc, 'Ingreso de aserrín', y)
  y = table(doc, ['Fecha','Proveedor','Humedad','Palas'], aserrinRows.value, y)

  y = sectionTitle(doc, 'Horno (promedios del día)', y)
  autoTable(doc, {
    startY: y,
    body: [[
      `T° Entrada: ${promTIn.value ?? '—'}°C`,
      `T° Salida: ${promTOut.value ?? '—'}°C`,
      `Humedad: ${promHum.value ?? '—'}%`
    ]],
    theme: 'plain',
    styles: { fontStyle: 'bold' },
    margin: { left: 10, right: 10 }
  })
  y = doc.lastAutoTable.finalY + 4
  y = table(doc, ['Hora','Jampa','Viruta','Pellet','T° Entrada','T° Salida','Humedad','Amperios'], hornoRows.value, y)

  y = sectionTitle(doc, 'Mantenimiento — Realizados', y)
  y = table(doc, ['Fecha','Máquina','Tipo','Descripción','Horas acum.','Repuestos','Costo'], mantHechosRows.value, y)

  y = sectionTitle(doc, 'Mantenimiento — Programados VENCIDOS', y)
  // Esta tabla podría ir con cabecera roja si prefieres resaltar:
  // cambia headStyles.fillColor a PALETTE.red en la función table para este bloque.
  y = table(doc, ['Máquina','Tipo','Descripción','Cada (h)','Últ. eje. h','Acum. h (día)','Vencido'], mantVencidosRows.value, y)

  y = sectionTitle(doc, 'Repuestos usados (movimientos)', y)
  y = table(doc, ['Fecha/hora','Repuesto ID','Cantidad','Motivo','Referencia'], repuestosRows.value, y)

  y = sectionTitle(doc, 'Paradas técnicas', y)
  y = table(doc, ['Inicio','Fin','Motivo','Categoría','Horas (día)'], paradasRows.value, y)

  doc.save(`reporte_diario_${fechaStr.value}.pdf`)
}
</script>
