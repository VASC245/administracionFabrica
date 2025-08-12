<template>
  <div class="bg-white rounded-xl shadow p-6 space-y-6">
    <h2 class="text-2xl font-bold">Repuestos</h2>

    <form @submit.prevent="add" class="grid md:grid-cols-5 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium">Descripción</label>
        <input v-model="form.descripcion" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required />
      </div>
      <div>
        <label class="block text-sm font-medium">SKU/Código</label>
        <input v-model="form.sku" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" />
      </div>
      <div>
        <label class="block text-sm font-medium">Stock</label>
        <input type="number" v-model.number="form.stock" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required />
      </div>
      <div>
        <label class="block text-sm font-medium">Mínimo</label>
        <input type="number" v-model.number="form.minimo" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" required />
      </div>
      <div class="md:col-span-5 flex items-center gap-2">
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" :disabled="saving">Agregar</button>
        <span v-if="saving" class="text-sm text-gray-500">Guardando…</span>
      </div>
    </form>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-3 py-2 font-medium text-gray-600">Descripción</th>
            <th class="text-left px-3 py-2 font-medium text-gray-600">SKU</th>
            <th class="text-left px-3 py-2 font-medium text-gray-600">Stock</th>
            <th class="text-left px-3 py-2 font-medium text-gray-600">Mínimo</th>
            <th class="text-left px-3 py-2 font-medium text-gray-600">Estado</th>
            <th class="text-left px-3 py-2 font-medium text-gray-600">Movimiento</th>
            <th class="text-left px-3 py-2 font-medium text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in items" :key="i.id" class="border-b">
            <td class="px-3 py-2">{{ i.descripcion }}</td>
            <td class="px-3 py-2">{{ i.sku ?? '—' }}</td>
            <td class="px-3 py-2">{{ i.stock }}</td>
            <td class="px-3 py-2">{{ i.minimo }}</td>
            <td class="px-3 py-2">
              <span :class="i.stock <= i.minimo
                  ? 'px-2 py-1 text-xs rounded bg-red-100 text-red-700'
                  : 'px-2 py-1 text-xs rounded bg-green-100 text-green-700'">
                {{ i.stock <= i.minimo ? 'Reponer' : 'OK' }}
              </span>
            </td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <input v-model.number="i.delta" type="number" class="w-24 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring" placeholder="+/-" />
                <button class="text-blue-700 underline hover:no-underline" @click="aplicarMovimiento(i)">Aplicar</button>
              </div>
            </td>
            <td class="px-3 py-2">
              <button class="underline hover:no-underline text-red-600" @click="remove(i.id)">Eliminar</button>
            </td>
          </tr>
          <tr v-if="!items.length">
            <td class="px-3 py-2 text-center" colspan="7">Sin registros</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { adjustStockAndLog } from '@/services/repuestosService'

const items = ref([])
const saving = ref(false)

const form = reactive({ descripcion:'', sku:'', stock:0, minimo:1 })

async function load() {
  const { data } = await supabase
    .from('repuestos')
    .select('*')
  items.value = (data || []).map(x => ({ ...x, delta: 0 }))
}

onMounted(load)

async function add() {
  saving.value = true
  try {
    // 1) crear repuesto
    const { data, error } = await supabase
      .from('repuestos')
      .insert([{ descripcion: form.descripcion, sku: form.sku || null, stock: Number(form.stock || 0), minimo: Number(form.minimo || 0) }])
      .select()
      .single()
    if (error) throw error

    // 2) registrar movimiento inicial si stock > 0
    if (Number(form.stock) > 0) {
      await adjustStockAndLog(data.id, 0, 'Alta inicial', `rep-${data.id}`) // ya guardamos el stock inicial en el insert
      // *si prefieres registrar entrada explícita:
      // await adjustStockAndLog(data.id, Number(form.stock), 'Alta inicial', `rep-${data.id}`)
      // y crear con stock 0
    }

    await load()
    form.descripcion = ''; form.sku = ''; form.stock = 0; form.minimo = 1
  } catch (e) {
    console.error(e)
    alert('Error al agregar repuesto')
  } finally {
    saving.value = false
  }
}

async function aplicarMovimiento(row) {
  const delta = Number(row.delta || 0)
  if (!delta) return
  try {
    await adjustStockAndLog(row.id, delta, delta > 0 ? 'Entrada manual' : 'Salida manual', `ui-repuestos`)
    row.delta = 0
    await load()
  } catch (e) {
    console.error(e)
    alert('No se pudo aplicar el movimiento')
  }
}

async function remove(id) {
  if (!confirm('¿Eliminar repuesto?')) return
  const { error } = await supabase.from('repuestos').delete().eq('id', id)
  if (!error) await load()
}
</script>
