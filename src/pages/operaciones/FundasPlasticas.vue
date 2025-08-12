<template>
  <div class="bg-white rounded-xl shadow p-6 space-y-10">
    <h2 class="text-2xl font-bold">Fundas Plásticas</h2>

    <!-- ======= RESUMEN RÁPIDO ======= -->
    <div class="grid sm:grid-cols-3 gap-4">
      <div class="p-4 rounded-xl border">
        <div class="text-sm text-gray-500">Total referencias</div>
        <div class="text-2xl font-semibold">{{ items.length }}</div>
      </div>
      <div class="p-4 rounded-xl border">
        <div class="text-sm text-gray-500">Stock total (sumatoria)</div>
        <div class="text-2xl font-semibold">{{ totalStock }}</div>
      </div>
      <div class="p-4 rounded-xl border">
        <div class="text-sm text-gray-500">Por reponer</div>
        <div class="text-2xl font-semibold text-red-600">{{ lowCount }}</div>
      </div>
    </div>

    <!-- ======= ALTA / ENTRADA DE FUNDAS ======= -->
    <section class="space-y-4">
      <h3 class="text-lg font-semibold">Registrar ingreso (compra)</h3>
      <form @submit.prevent="saveEntrada" class="grid md:grid-cols-6 gap-4 bg-gray-50 p-4 rounded-xl border">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">Funda</label>
          <div class="flex gap-2">
            <select v-model="entrada.funda_id" class="flex-1 border border-gray-300 rounded-lg px-3 py-2" required>
              <option value="">— Seleccionar —</option>
              <option v-for="f in items" :key="f.id" :value="f.id">
                {{ f.descripcion }} {{ f.medida ? `(${f.medida})` : '' }}
              </option>
            </select>
            <button type="button" class="px-3 py-2 rounded-lg border" @click="toggleCrear = !toggleCrear">Nueva</button>
          </div>
        </div>

        <div v-if="toggleCrear" class="md:col-span-2 grid grid-cols-2 gap-2">
          <input v-model="nueva.descripcion" placeholder="Descripción" class="border rounded-lg px-3 py-2" />
          <input v-model="nueva.medida" placeholder="Medida (opcional)" class="border rounded-lg px-3 py-2" />
          <input type="number" v-model.number="nueva.minimo" placeholder="Mínimo" class="border rounded-lg px-3 py-2" />
          <button type="button" class="px-3 py-2 rounded-lg border" @click="crearFunda">Crear</button>
        </div>

        <div>
          <label class="block text-sm font-medium">Cantidad</label>
          <input type="number" min="1" v-model.number="entrada.cantidad" class="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium">Precio unitario</label>
          <input type="number" step="0.01" v-model.number="entrada.precio_unitario" class="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm font-medium">N° Factura</label>
          <input v-model="entrada.factura" class="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div class="md:col-span-6">
          <label class="block text-sm font-medium">Proveedor (opcional)</label>
          <input v-model="entrada.proveedor" class="w-full border rounded-lg px-3 py-2" />
        </div>

        <div class="md:col-span-6">
          <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" :disabled="savingEntrada">
            {{ savingEntrada ? 'Guardando…' : 'Registrar ingreso' }}
          </button>
        </div>
      </form>
    </section>

    <!-- ======= ROTURAS ======= -->
    <section class="space-y-4">
      <h3 class="text-lg font-semibold">Registrar roturas</h3>
      <form @submit.prevent="saveRotura" class="grid md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-xl border">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">Funda</label>
          <select v-model="rotura.funda_id" class="w-full border rounded-lg px-3 py-2" required>
            <option value="">— Seleccionar —</option>
            <option v-for="f in items" :key="f.id" :value="f.id">
              {{ f.descripcion }} {{ f.medida ? `(${f.medida})` : '' }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium">Cantidad rota</label>
          <input type="number" min="1" v-model.number="rotura.cantidad" class="w-full border rounded-lg px-3 py-2" required />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium">Observación</label>
          <input v-model="rotura.observacion" class="w-full border rounded-lg px-3 py-2" />
        </div>
        <div class="md:col-span-5">
          <button class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Registrar rotura</button>
        </div>
      </form>
    </section>

    <!-- ======= TABLA INVENTARIO ======= -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-3 py-2">Descripción</th>
            <th class="text-left px-3 py-2">Medida</th>
            <th class="text-left px-3 py-2">Stock</th>
            <th class="text-left px-3 py-2">Mínimo</th>
            <th class="text-left px-3 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in items" :key="f.id" class="border-b">
            <td class="px-3 py-2">{{ f.descripcion }}</td>
            <td class="px-3 py-2">{{ f.medida ?? '—' }}</td>
            <td class="px-3 py-2">{{ f.stock }}</td>
            <td class="px-3 py-2">{{ f.minimo }}</td>
            <td class="px-3 py-2">
              <span :class="f.stock <= f.minimo ? 'px-2 py-1 text-xs rounded bg-red-100 text-red-700' : 'px-2 py-1 text-xs rounded bg-green-100 text-green-700'">
                {{ f.stock <= f.minimo ? 'Reponer' : 'OK' }}
              </span>
            </td>
          </tr>
          <tr v-if="!items.length">
            <td class="px-3 py-2 text-center" colspan="5">Sin registros</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { searchFundas, adjustFundasAndLog } from '@/services/fundasService'

const items = ref([])
const totalStock = computed(() => items.value.reduce((a,b)=>a+Number(b.stock||0), 0))
const lowCount = computed(() => items.value.filter(x => x.stock <= x.minimo).length)

async function load() { items.value = await searchFundas('') }
onMounted(load)

/* ====== ENTRADA (COMPRA) ====== */
const savingEntrada = ref(false)
const entrada = reactive({
  funda_id: '', cantidad: null, precio_unitario: null,
  factura: '', proveedor: ''
})
const toggleCrear = ref(false)
const nueva = reactive({ descripcion:'', medida:'', minimo:0 })

async function crearFunda() {
  if (!nueva.descripcion) return
  const { data, error } = await supabase
    .from('fundas_plasticas')
    .insert([{ descripcion: nueva.descripcion, medida: nueva.medida || null, minimo: Number(nueva.minimo||0) }])
    .select()
    .single()
  if (error) { console.error(error); return alert('No se pudo crear la funda') }
  entrada.funda_id = data.id
  toggleCrear.value = false
  nueva.descripcion=''; nueva.medida=''; nueva.minimo=0
  await load()
}

async function saveEntrada() {
  if (!entrada.funda_id || !entrada.cantidad || !entrada.precio_unitario || !entrada.factura) return
  savingEntrada.value = true
  try {
    await adjustFundasAndLog({
      funda_id: entrada.funda_id,
      delta: Number(entrada.cantidad),
      tipo: 'entrada',
      precio_unitario: Number(entrada.precio_unitario),
      factura: entrada.factura,
      proveedor: entrada.proveedor || null
    })
    entrada.cantidad=null; entrada.precio_unitario=null; entrada.factura=''; entrada.proveedor=''
    await load()
  } catch (e) {
    console.error(e); alert('No se pudo registrar el ingreso')
  } finally {
    savingEntrada.value = false
  }
}

/* ====== ROTURAS ====== */
const rotura = reactive({ funda_id:'', cantidad:null, observacion:'' })
async function saveRotura() {
  if (!rotura.funda_id || !rotura.cantidad) return
  try {
    await adjustFundasAndLog({
      funda_id: rotura.funda_id,
      delta: -Math.abs(Number(rotura.cantidad)),
      tipo: 'rotura',
      observacion: rotura.observacion || null
    })
    rotura.funda_id=''; rotura.cantidad=null; rotura.observacion=''
    await load()
  } catch (e) {
    console.error(e); alert('No se pudo registrar la rotura')
  }
}
</script>
