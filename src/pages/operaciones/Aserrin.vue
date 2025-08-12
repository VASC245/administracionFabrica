<template>
  <div class="max-w-5xl mx-auto bg-white shadow-xl rounded-xl p-8 mt-10">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Ingreso de Aserrín</h2>

    <!-- Mensajes -->
    <div v-if="mensaje" class="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 text-center font-semibold">
      {{ mensaje }}
    </div>
    <div v-if="errorMsg" class="bg-red-100 text-red-800 px-4 py-2 rounded mb-4 text-center font-semibold">
      {{ errorMsg }}
    </div>

    <!-- FILTRO DE FECHAS -->
    <div class="flex flex-wrap items-end gap-4 mb-6">
      <div>
        <label class="block text-gray-700 text-sm font-medium mb-1">Desde:</label>
        <input type="date" v-model="fechaInicio" class="border border-gray-300 rounded-lg px-3 py-2" />
      </div>
      <div>
        <label class="block text-gray-700 text-sm font-medium mb-1">Hasta:</label>
        <input type="date" v-model="fechaFin" class="border border-gray-300 rounded-lg px-3 py-2" />
      </div>

      <button @click="filtrarPorFechas" :disabled="loading"
              class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60">
        {{ loading ? 'Cargando...' : 'Filtrar' }}
      </button>
      <button @click="setRangoHoy" class="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700">Hoy</button>
      <button @click="resetFiltro" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Limpiar</button>
    </div>

    <!-- PASO 1: Seleccionar o crear proveedor -->
    <div v-if="!proveedorSeleccionadoNombre" class="mb-8">
      <div class="border-2 border-dashed rounded-xl p-6 bg-gray-50">
        <p class="text-lg font-semibold text-gray-700 mb-3 text-center">Selecciona un proveedor o crea uno nuevo</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <select
            v-model="proveedorSeleccionTemporal"
            class="w-full sm:w-2/3 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option disabled value="">— Seleccionar proveedor —</option>
            <option v-for="p in proveedores" :key="p.id" :value="p.nombre">{{ p.nombre }}</option>
          </select>
          <button
            @click="confirmarSeleccion"
            :disabled="!proveedorSeleccionTemporal"
            class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            Seleccionar
          </button>
          <button
            @click="abrirModalProveedor = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Crear proveedor
          </button>
        </div>
      </div>
    </div>

    <!-- Tarjeta proveedor seleccionado + botón cambiar -->
    <div v-else class="mb-6">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 border rounded-lg p-4 bg-gray-50">
          <div class="text-gray-700"><span class="font-semibold">Proveedor:</span> {{ proveedorSeleccionado?.nombre }}</div>
          <div class="text-gray-700"><span class="font-semibold">Placa:</span> {{ proveedorSeleccionado?.placa || '—' }}</div>
          <div class="text-gray-700"><span class="font-semibold">Contacto:</span> {{ proveedorSeleccionado?.contacto || '—' }}</div>
        </div>
        <button @click="cambiarProveedor" class="shrink-0 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
          Cambiar
        </button>
      </div>
    </div>

    <!-- PASO 2: Formulario de Aserrín (solo cuando hay proveedor elegido/creado) -->
    <div v-if="proveedorSeleccionadoNombre" class="space-y-6 mb-10">
      <!-- Palas -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Número de Palas</label>
        <div class="flex items-center gap-4">
          <div class="flex items-center border rounded-lg">
            <button @click="decrementarPala" class="px-3 py-2">−</button>
            <input
              v-model.number="totalPalas"
              type="number"
              class="w-24 text-center outline-none"
              min="1"
              @input="sanearPalas"
            />
            <button @click="agregarPala" class="px-3 py-2">+</button>
          </div>
          <span class="text-gray-600">x {{ PESO_PALA }} kg/pala</span>

          <!-- Botón "ir agregando" -->
          <button
            @click="agregarPala"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Agregar
          </button>
        </div>
      </div>

      <!-- Peso calculado -->
      <p class="text-gray-700 font-semibold">Peso Total: {{ totalPeso }} kg</p>

      <!-- Botones -->
      <div class="flex gap-4">
        <button
          @click="mostrarModalHumedad = true"
          class="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition w-full"
        >
          {{ editMode ? 'Actualizar Registro' : 'Finalizar Descarga' }}
        </button>
        <button
          @click="resetFormulario"
          class="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition w-full"
        >
          Cancelar
        </button>
      </div>
    </div>

    <!-- MODAL HUMEDAD -->
    <div v-if="mostrarModalHumedad" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
        <h3 class="text-xl font-bold text-gray-700 mb-4">Registrar Humedad (%)</h3>
        <input
          v-model="humedadInput"
          type="text"
          inputmode="decimal"
          placeholder="Ej: 15 o 15%"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4"
        />
        <div class="text-sm text-gray-500 mb-2">Se guarda como número 0–100.</div>
        <div class="flex gap-4">
          <button @click="finalizarDescarga" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full">
            Guardar
          </button>
          <button @click="mostrarModalHumedad = false" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL NUEVO PROVEEDOR -->
    <div v-if="abrirModalProveedor" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h3 class="text-xl font-bold text-gray-700 mb-4">Nuevo Proveedor</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="sm:col-span-3">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre *</label>
            <input v-model.trim="formProv.nombre" type="text" class="w-full border rounded-lg px-3 py-2" placeholder="Ej: Juan Pérez" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Placa</label>
            <input v-model.trim="formProv.placa" type="text" class="w-full border rounded-lg px-3 py-2" placeholder="Ej: ABC-1234" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Contacto</label>
            <input v-model.trim="formProv.contacto" type="text" class="w-full border rounded-lg px-3 py-2" placeholder="Teléfono o nombre" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button @click="guardarProveedor" :disabled="loadingProv"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {{ loadingProv ? 'Guardando...' : 'Guardar' }}
          </button>
          <button @click="cerrarModalProveedor" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
            Cancelar
          </button>
        </div>
        <p v-if="errorProv" class="text-red-600 mt-3">{{ errorProv }}</p>
      </div>
    </div>

    <!-- TABLA -->
    <div class="text-center my-6">
      <button
        @click="mostrarTabla = !mostrarTabla"
        class="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
      >
        {{ mostrarTabla ? 'Ocultar Registros' : 'Mostrar Registros' }}
      </button>
    </div>

    <div v-if="mostrarTabla">
      <div v-if="registros.length > 0" class="mt-10">
        <h3 class="text-xl font-bold text-gray-700 mb-4">Registros Guardados</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-300 rounded-lg text-sm">
            <thead class="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th class="px-4 py-3 border">Fecha</th>
                <th class="px-4 py-3 border">Proveedor</th>
                <th class="px-4 py-3 border">Humedad (%)</th>
                <th class="px-4 py-3 border">Palas</th>
                <th class="px-4 py-3 border">Peso (kg)</th>
                <th class="px-4 py-3 border text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="registro in registros" :key="registro.id" class="odd:bg-white even:bg-gray-50">
                <td class="px-4 py-2 border">{{ registro.fecha }}</td>
                <td class="px-4 py-2 border">{{ registro.proveedor }}</td>
                <td class="px-4 py-2 border">{{ registro.humedad ?? '-' }}</td>
                <td class="px-4 py-2 border">{{ registro.palas }}</td>
                <td class="px-4 py-2 border">{{ registro.peso_kg }}</td>
                <td class="px-4 py-2 border text-center space-x-2">
                  <button @click="editarRegistro(registro)" class="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition">
                    Editar
                  </button>
                  <button @click="confirmarEliminar(registro.id)" class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="text-gray-500 text-center mt-6">
        No hay registros en este rango de fechas.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

/* ===== Constantes ===== */
const PESO_PALA = 170

/* ===== Proveedores ===== */
const proveedores = ref([])
const proveedorSeleccionTemporal = ref('')
const proveedorSeleccionadoNombre = ref('')
const abrirModalProveedor = ref(false)
const loadingProv = ref(false)
const errorProv = ref('')
const formProv = ref({ nombre: '', placa: '', contacto: '' })

/* ===== Aserrín ===== */
const totalPalas = ref(1)
const totalPeso = ref(PESO_PALA)
const humedadInput = ref('')
const mostrarModalHumedad = ref(false)
const mensaje = ref('')
const errorMsg = ref('')

/* ===== Tabla/edición ===== */
const registros = ref([])
const editMode = ref(false)
const idEditando = ref(null)

/* ===== Filtros ===== */
const fechaInicio = ref('')
const fechaFin = ref('')

/* ===== UI ===== */
const mostrarTabla = ref(true)
const loading = ref(false)

/* ===== Computados ===== */
const proveedorSeleccionado = computed(() =>
  proveedores.value.find(p => p.nombre === proveedorSeleccionadoNombre.value) || null
)

/* ===== Helpers ===== */
// Fecha EXACTA de hoy en la zona local (evita toISOString que puede adelantar un día)
const getTodayLocalISO = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const calcularPeso = () => { totalPeso.value = totalPalas.value * PESO_PALA }
const sanearPalas = () => {
  if (!Number.isFinite(totalPalas.value) || totalPalas.value < 1) totalPalas.value = 1
  calcularPeso()
}
const agregarPala = () => { totalPalas.value += 1; calcularPeso() }
const decrementarPala = () => { if (totalPalas.value > 1) { totalPalas.value -= 1; calcularPeso() } }

/* ===== Proveedores CRUD ===== */
const cargarProveedores = async () => {
  const { data, error } = await supabase
    .from('proveedores')
    .select('id, nombre, placa, contacto')
    .order('nombre', { ascending: true })
  if (!error) proveedores.value = data || []
}

const confirmarSeleccion = () => {
  if (!proveedorSeleccionTemporal.value) return
  proveedorSeleccionadoNombre.value = proveedorSeleccionTemporal.value
  proveedorSeleccionTemporal.value = ''
}

const cambiarProveedor = () => {
  proveedorSeleccionadoNombre.value = ''
  humedadInput.value = ''
  totalPalas.value = 1
  calcularPeso()
  editMode.value = false
  idEditando.value = null
}

const guardarProveedor = async () => {
  errorProv.value = ''
  if (!formProv.value.nombre) {
    errorProv.value = 'El nombre es obligatorio'
    return
  }
  loadingProv.value = true
  try {
    const payload = {
      nombre: formProv.value.nombre.trim(),
      placa: formProv.value.placa?.trim() || null,
      contacto: formProv.value.contacto?.trim() || null
    }
    const { data, error } = await supabase.from('proveedores').insert([payload]).select().single()
    if (error) throw error
    proveedores.value.push(data)
    proveedores.value.sort((a,b)=>a.nombre.localeCompare(b.nombre))
    proveedorSeleccionadoNombre.value = data.nombre
    cerrarModalProveedor()
    mensaje.value = 'Proveedor creado ✅'
    setTimeout(() => (mensaje.value = ''), 3000)
  } catch (e) {
    console.error(e)
    if (String(e.message || '').includes('duplicate key') || String(e.details || '').includes('already exists')) {
      errorProv.value = 'Ese nombre de proveedor ya existe'
    } else {
      errorProv.value = 'No se pudo guardar el proveedor'
    }
  } finally {
    loadingProv.value = false
  }
}

const cerrarModalProveedor = () => {
  abrirModalProveedor.value = false
  errorProv.value = ''
  formProv.value = { nombre: '', placa: '', contacto: '' }
}

/* ===== Humedad ===== */
const parseHumedad = (val) => {
  if (val == null || val === '') return null
  const limpio = String(val).replace('%', '').trim().replace(',', '.')
  const num = Number(limpio)
  if (!Number.isFinite(num)) return null
  if (num < 0) return 0
  if (num > 100) return 100
  return Math.round(num * 100) / 100
}

/* ===== Aserrín CRUD ===== */
const finalizarDescarga = async () => {
  if (!proveedorSeleccionadoNombre.value) {
    errorMsg.value = 'Selecciona o crea un proveedor'
    setTimeout(() => (errorMsg.value = ''), 3000)
    return
  }

  const humedad = parseHumedad(humedadInput.value)
  const registro = {
    fecha: getTodayLocalISO(),           // <-- fecha exacta local
    proveedor: proveedorSeleccionadoNombre.value,  // solo nombre
    humedad,
    palas: totalPalas.value,
    peso_kg: totalPeso.value
  }

  loading.value = true
  errorMsg.value = ''
  try {
    if (editMode.value && idEditando.value != null) {
      const { error } = await supabase
        .from('aserrin')
        .update(registro)
        .eq('id', idEditando.value)
        .select()
        .single()
      if (error) throw error
      mensaje.value = 'Registro actualizado ✅'
    } else {
      const { error } = await supabase
        .from('aserrin')
        .insert([registro])
        .select()
        .single()
      if (error) throw error
      mensaje.value = 'Registro guardado ✅'
    }
    setTimeout(() => (mensaje.value = ''), 3000)
    resetFormulario()
    mostrarModalHumedad.value = false
    await filtrarPorFechas() // respeta el rango activo si está seteado
  } catch (e) {
    console.error('Error al guardar:', e)
    errorMsg.value = 'No se pudo guardar en la base de datos'
    setTimeout(() => (errorMsg.value = ''), 4000)
  } finally {
    loading.value = false
  }
}

const cargar = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const { data, error } = await supabase
      .from('aserrin')
      .select('id, fecha, proveedor, humedad, palas, peso_kg')
      .order('fecha', { ascending: false })
      .order('id', { ascending: false })
    if (error) throw error
    registros.value = data ?? []
  } catch (e) {
    console.error(e)
    errorMsg.value = 'Error al cargar datos'
  } finally {
    loading.value = false
  }
}

/* ===== Filtro por fechas ===== */
const filtrarPorFechas = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    let query = supabase
      .from('aserrin')
      .select('id, fecha, proveedor, humedad, palas, peso_kg')
      .order('fecha', { ascending: false })
      .order('id', { ascending: false })

    if (fechaInicio.value) query = query.gte('fecha', fechaInicio.value)
    if (fechaFin.value)     query = query.lte('fecha', fechaFin.value)

    const { data, error } = await query
    if (error) throw error
    registros.value = data ?? []
  } catch (e) {
    console.error(e)
    errorMsg.value = 'Error al filtrar'
  } finally {
    loading.value = false
  }
}

const resetFiltro = () => {
  fechaInicio.value = ''
  fechaFin.value = ''
  cargar()
}

const setRangoHoy = () => {
  const hoy = getTodayLocalISO()
  fechaInicio.value = hoy
  fechaFin.value = hoy
  filtrarPorFechas()
}

/* ===== Tabla: acciones ===== */
const editarRegistro = (registro) => {
  proveedorSeleccionadoNombre.value = proveedores.value.some(p => p.nombre === registro.proveedor)
    ? registro.proveedor
    : ''
  totalPalas.value = registro.palas
  calcularPeso()
  humedadInput.value = registro.humedad ?? ''
  editMode.value = true
  idEditando.value = registro.id
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const confirmarEliminar = async (id) => {
  const ok = window.confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')
  if (!ok) return
  const { error } = await supabase.from('aserrin').delete().eq('id', id)
  if (!error) {
    // si hay rango activo, mantenlo; si no, recarga todo
    if (fechaInicio.value || fechaFin.value) await filtrarPorFechas()
    else await cargar()
  }
}

/* ===== Reset ===== */
const resetFormulario = () => {
  // Mantiene el proveedor elegido; si quieres limpiar también el proveedor, usa cambiarProveedor()
  totalPalas.value = 1
  calcularPeso()
  humedadInput.value = ''
  editMode.value = false
  idEditando.value = null
}

/* ===== Init ===== */
onMounted(async () => {
  calcularPeso()
  await Promise.all([cargarProveedores(), cargar()])
})
</script>
