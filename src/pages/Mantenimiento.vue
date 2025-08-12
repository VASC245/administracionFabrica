<template>
  <div class="bg-white rounded-xl shadow p-6 space-y-8">
    <!-- Header + selector de vista -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold">Mantenimiento</h2>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-500">Vista:</label>
        <select v-model="modo" class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring">
          <option value="registro">Registrar mantenimiento</option>
          <option value="programacion">Programación por horas</option>
        </select>
      </div>
    </div>

    <!-- ===================== REGISTRO DE MANTENIMIENTO ===================== -->
    <div v-if="modo === 'registro'" class="space-y-8">
      <form @submit.prevent="save" class="grid md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium">Fecha</label>
          <input type="date" v-model="form.fecha" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required />
        </div>

        <div>
          <label class="block text-sm font-medium">Máquina</label>
          <select v-model="form.maquina_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required>
            <option v-for="m in maq.items" :key="m.id" :value="m.id">{{ m.nombre }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium">Tipo</label>
          <select v-model="form.tipo" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring">
            <option>Preventivo</option>
            <option>Correctivo</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium">Horas máquina (acum.)</label>
          <input type="number" step="0.1" v-model.number="form.horas_acumuladas" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" />
        </div>

        <div class="md:col-span-4">
          <label class="block text-sm font-medium">Descripción</label>
          <textarea v-model="form.descripcion" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required></textarea>
        </div>

        <!-- Repuestos usados + botón de modal -->
        <div class="md:col-span-3">
          <label class="block text-sm font-medium">Repuestos usados</label>
          <div class="flex gap-2">
            <input v-model="form.repuestos" placeholder="Puedes escribir o usar el buscador"
                  class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" />
            <button type="button" class="px-3 py-2 rounded-lg border hover:bg-gray-50" @click="openPicker">Buscar…</button>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            Si escribes, formatos válidos: <code>SKU x2</code>, <code>SKU*2</code>, <code>SKU:2</code>, o solo nombre (asume 1).
          </p>

          <!-- chips de seleccionados -->
          <div v-if="picked.length" class="flex flex-wrap gap-2 mt-2">
            <span v-for="p in picked" :key="p.id" class="inline-flex items-center gap-2 px-2 py-1 rounded border text-xs">
              {{ p.sku ? `${p.sku} — ` : '' }}{{ p.descripcion }} × {{ p.qty }}
              <button type="button" class="text-red-600 underline hover:no-underline" @click="removePicked(p.id)">x</button>
            </span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium">Costo</label>
          <input type="number" step="0.01" v-model.number="form.costo" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" />
        </div>

        <div class="md:col-span-4">
          <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" :disabled="saving">
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </form>

      <!-- Historial -->
      <div>
        <h3 class="text-lg font-semibold mb-3">Histórico</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-3 py-2 font-medium text-gray-600">Fecha</th>
                <th class="text-left px-3 py-2 font-medium text-gray-600">Máquina</th>
                <th class="text-left px-3 py-2 font-medium text-gray-600">Tipo</th>
                <th class="text-left px-3 py-2 font-medium text-gray-600">Desc</th>
                <th class="text-left px-3 py-2 font-medium text-gray-600">Costo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="mto in mantenimientos" :key="mto.id" class="border-b">
                <td class="px-3 py-2">{{ mto.fecha }}</td>
                <td class="px-3 py-2">{{ nombreMaquina(mto.maquina_id) }}</td>
                <td class="px-3 py-2">{{ mto.tipo }}</td>
                <td class="px-3 py-2 truncate max-w-[280px]">{{ mto.descripcion }}</td>
                <td class="px-3 py-2">{{ mto.costo?.toFixed?.(2) ?? '—' }}</td>
              </tr>
              <tr v-if="!mantenimientos.length">
                <td class="px-3 py-2 text-center" colspan="5">Sin registros</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ===================== PROGRAMACIÓN POR HORAS ===================== -->
    <section v-if="modo === 'programacion'" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-semibold">Programación por horas</h3>
      </div>

      <form @submit.prevent="addProgram" class="grid md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border">
        <div>
          <label class="block text-sm font-medium">Máquina</label>
          <select v-model="progForm.maquina_id" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required>
            <option v-for="m in maq.items" :key="m.id" :value="m.id">{{ m.nombre }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium">Cada (horas)</label>
          <input type="number" min="1" v-model.number="progForm.cada_horas" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required />
        </div>
        <div>
          <label class="block text-sm font-medium">Tipo</label>
          <select v-model="progForm.tipo" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring">
            <option>Preventivo</option>
            <option>Correctivo</option>
          </select>
        </div>
        <div class="md:col-span-4">
          <label class="block text-sm font-medium">Descripción</label>
          <input v-model="progForm.descripcion" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required />
        </div>
        <div class="md:col-span-4">
          <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Crear programación</button>
        </div>
      </form>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-3 py-2">Máquina</th>
              <th class="text-left px-3 py-2">Descripción</th>
              <th class="text-left px-3 py-2">Cada (h)</th>
              <th class="text-left px-3 py-2">Acum. (h)</th>
              <th class="text-left px-3 py-2">Desde última (h)</th>
              <th class="text-left px-3 py-2">Estado</th>
              <th class="text-left px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in programacionesView" :key="p.id" class="border-b">
              <td class="px-3 py-2">{{ nombreMaquina(p.maquina_id) }}</td>
              <td class="px-3 py-2">{{ p.descripcion }}</td>
              <td class="px-3 py-2">{{ p.cada_horas }}</td>
              <td class="px-3 py-2">{{ fmtH(p.total_horas) }}</td>
              <td class="px-3 py-2">{{ fmtH(p.desde_ultima) }}</td>
              <td class="px-3 py-2">
                <span :class="p.desde_ultima >= p.cada_horas
                    ? 'px-2 py-1 text-xs rounded bg-red-100 text-red-700'
                    : 'px-2 py-1 text-xs rounded bg-green-100 text-green-700'">
                  {{ p.desde_ultima >= p.cada_horas ? 'Vencido' : 'En curso' }}
                </span>
              </td>
              <td class="px-3 py-2">
                <button class="text-blue-700 underline hover:no-underline mr-3" @click="marcarRealizado(p)">Marcar realizado</button>
                <button class="text-red-600 underline hover:no-underline" @click="eliminarProgram(p.id)">Eliminar</button>
              </td>
            </tr>
            <tr v-if="!programacionesView.length">
              <td class="px-3 py-2 text-center" colspan="7">Sin programaciones</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ===================== MODAL REPUESTOS (BUSCADOR) ===================== -->
    <div v-if="showPicker" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-3xl rounded-xl shadow-lg p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Buscar repuestos</h3>
          <button class="text-gray-600 hover:text-black" @click="closePicker">✕</button>
        </div>

        <div class="flex gap-2">
          <input v-model="search" @input="doSearch" placeholder="SKU o descripción"
                class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" />
          <button class="px-3 py-2 rounded-lg border hover:bg-gray-50" @click="doSearch">Buscar</button>
        </div>

        <div class="overflow-x-auto border rounded-lg">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left px-3 py-2 font-medium text-gray-600">Descripción</th>
                <th class="text-left px-3 py-2 font-medium text-gray-600">SKU</th>
                <th class="text-left px-3 py-2 font-medium text-gray-600">Stock</th>
                <th class="text-left px-3 py-2 font-medium text-gray-600">Cantidad</th>
                <th class="text-left px-3 py-2 font-medium text-gray-600">Agregar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in results" :key="r.id" class="border-t">
                <td class="px-3 py-2">{{ r.descripcion }}</td>
                <td class="px-3 py-2">{{ r.sku ?? '—' }}</td>
                <td class="px-3 py-2">{{ r.stock }}</td>
                <td class="px-3 py-2">
                  <input type="number" min="1" v-model.number="qty[r.id]" class="w-24 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring" />
                </td>
                <td class="px-3 py-2">
                  <button class="text-blue-700 underline hover:no-underline" @click="addPicked(r)">Añadir</button>
                </td>
              </tr>
              <tr v-if="!results.length">
                <td class="px-3 py-2 text-center" colspan="5">Sin resultados</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button class="px-4 py-2 rounded-lg border hover:bg-gray-50" @click="closePicker">Cerrar</button>
          <button class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700" @click="commitPicked">
            Usar seleccionados
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useMaquinasActive } from '@/stores/maquinasStore'
import { parseRepuestos } from '@/utils/parseRepuestos'
import { searchRepuestos, findRepuestoBySkuOrName, adjustStockAndLog } from '@/services/repuestosService'

const route = useRoute()
const router = useRouter()
const maq = useMaquinasActive()

// ---------------- Selector de vista ----------------
const modo = ref(route.query.mode === 'programacion' ? 'programacion' : 'registro')
watch(modo, (m) => router.replace({ query: { ...route.query, mode: m } }))

// ---------------- Registro de mantenimiento ----------------
const mantenimientos = ref([])
const saving = ref(false)

const form = reactive({
  fecha: '', maquina_id: null, tipo: 'Preventivo',
  descripcion: '', horas_acumuladas: null, repuestos: '', costo: null
})

function nombreMaquina(id){ return maq.items.find(x=>x.id===id)?.nombre ?? '—' }

async function loadMantenimientos() {
  const { data } = await supabase
    .from('mantenimientos')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(50)
  mantenimientos.value = data || []
}

async function save() {
  saving.value = true
  try {
    // 1) Determinar lista de usados
    let used = []
    if (picked.value.length) {
      used = picked.value.map(p => ({ key: p.sku || p.descripcion, qty: p.qty }))
    } else {
      used = parseRepuestos(form.repuestos)
    }

    // 2) Guardar mantenimiento con texto + json (auditoría)
    const payload = { ...form, repuestos: form.repuestos || null, repuestos_json: used }
    const { data: mant, error } = await supabase
      .from('mantenimientos')
      .insert([payload])
      .select()
      .single()
    if (error) { console.error('Error insert mantenimiento:', error); throw error }

    // 3) Descontar stock + movimiento por cada repuesto usado
    for (const u of used) {
      const item = await findRepuestoBySkuOrName(u.key)
      if (!item) { console.warn('Repuesto no encontrado:', u.key); continue }
      const motivo = `Mantenimiento ${mant.id} (${form.tipo})`
      const referencia = `mant-${mant.id}`
      await adjustStockAndLog(item.id, -Number(u.qty || 0), motivo, referencia)
    }

    // 4) Refresh y limpiar
    await loadMantenimientos()
    form.descripcion = ''; form.repuestos = ''; form.costo = null
    picked.value = []
  } catch (e) {
    console.error(e)
    alert('Error al guardar mantenimiento / movimientos')
  } finally {
    saving.value = false
  }
}

// ---------------- Modal repuestos (buscador) ----------------
const showPicker = ref(false)
const search = ref('')
const results = ref([])
const qty = reactive({})        // { repuesto_id: cantidad }
const picked = ref([])          // [{ id, sku, descripcion, qty }]

function openPicker() {
  showPicker.value = true
  search.value = ''
  qtyReset()
  loadDefaultResults()
}
function closePicker() { showPicker.value = false }
function qtyReset() { Object.keys(qty).forEach(k => delete qty[k]) }
async function loadDefaultResults() { results.value = await searchRepuestos('') }
async function doSearch() { results.value = await searchRepuestos(search.value) }

function addPicked(row) {
  const q = Math.max(1, Number(qty[row.id] || 1))
  const existing = picked.value.find(p => p.id === row.id)
  if (existing) existing.qty += q
  else picked.value.push({ id: row.id, sku: row.sku, descripcion: row.descripcion, qty: q })
  qty[row.id] = 1
}
function removePicked(id) { picked.value = picked.value.filter(p => p.id !== id) }
function pickedToText() { return picked.value.map(p => (p.sku ? p.sku : p.descripcion) + ' x' + p.qty).join(', ') }
function commitPicked() { form.repuestos = pickedToText(); closePicker() }

// ---------------- Programación por horas ----------------
const programaciones = ref([])   // filas de mantenimiento_programado
const horasAcum = ref([])        // [{ maquina_id, total_horas }]

function fmtH(n){ return Number(n || 0).toFixed(2) }

async function loadHorasAcum() {
  // suma (fin - inicio) de horas_maquina por máquina
  const { data, error } = await supabase
    .from('horas_maquina')
    .select('maquina_id, inicio, fin')
  if (error) { console.error(error); return }
  const byMachine = new Map()
  for (const r of (data || [])) {
    if (!r.inicio || !r.fin) continue
    const diff = (new Date(r.fin) - new Date(r.inicio)) / 36e5
    if (diff <= 0) continue
    byMachine.set(r.maquina_id, (byMachine.get(r.maquina_id) || 0) + diff)
  }
  horasAcum.value = Array.from(byMachine, ([maquina_id, total_horas]) => ({ maquina_id, total_horas }))
}

async function loadProgramaciones() {
  const { data, error } = await supabase
    .from('mantenimiento_programado')
    .select('*')
    .eq('activo', true)
    .order('created_at', { ascending: true })
  if (!error) programaciones.value = data || []
}

const programacionesView = computed(() => {
  return (programaciones.value || []).map(p => {
    const h = horasAcum.value.find(x => x.maquina_id === p.maquina_id)?.total_horas || 0
    const desdeUlt = Math.max(0, h - Number(p.ultima_ejecucion_horas || 0))
    return { ...p, total_horas: h, desde_ultima: desdeUlt }
  })
})

const progForm = reactive({
  maquina_id: null, cada_horas: null, tipo: 'Preventivo', descripcion: ''
})

async function addProgram() {
  if (!progForm.maquina_id || !progForm.cada_horas) return
  const currentH = programacionesView.value.find(x => x.maquina_id === progForm.maquina_id)?.total_horas || 0
  const payload = {
    maquina_id: progForm.maquina_id,
    cada_horas: Number(progForm.cada_horas),
    tipo: progForm.tipo,
    descripcion: progForm.descripcion,
    ultima_ejecucion_horas: currentH
  }
  const { error } = await supabase.from('mantenimiento_programado').insert([payload])
  if (error) { console.error(error); return alert('No se pudo crear la programación') }
  await Promise.all([loadProgramaciones(), loadHorasAcum()])
  progForm.maquina_id = null; progForm.cada_horas = null; progForm.descripcion = ''
}

async function eliminarProgram(id) {
  if (!confirm('¿Eliminar programación?')) return
  const { error } = await supabase.from('mantenimiento_programado').delete().eq('id', id)
  if (!error) await loadProgramaciones()
}

async function marcarRealizado(p) {
  const nowH = programacionesView.value.find(x => x.id === p.id)?.total_horas || 0
  const { error } = await supabase
    .from('mantenimiento_programado')
    .update({
      ultima_ejecucion_at: new Date().toISOString(),
      ultima_ejecucion_horas: nowH
    })
    .eq('id', p.id)
  if (error) { console.error(error); return alert('No se pudo marcar como realizado') }
  await loadProgramaciones()
}

// ---------------- Lifecycle ----------------
onMounted(async () => {
  await maq.listActive(); maq.subscribe()
  await Promise.all([loadMantenimientos(), loadProgramaciones(), loadHorasAcum()])
})
onUnmounted(() => maq.unsubscribe())
</script>
