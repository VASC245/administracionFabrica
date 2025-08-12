<template>
  <div class="bg-white rounded-xl shadow p-6 space-y-6">
    <h2 class="text-2xl font-bold">Máquinas</h2>

    <form @submit.prevent="save" class="grid md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium">Código</label>
        <input v-model="form.codigo" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" placeholder="PEL-01" />
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium">Nombre</label>
        <input v-model="form.nombre" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring" placeholder="Peletizadora 1" required />
      </div>
      <div class="md:col-span-3">
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Agregar</button>
      </div>
    </form>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-3 py-2 font-medium text-gray-600">Código</th>
            <th class="text-left px-3 py-2 font-medium text-gray-600">Nombre</th>
            <th class="text-left px-3 py-2 font-medium text-gray-600">Activo</th>
            <th class="text-left px-3 py-2 font-medium text-gray-600">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in maquinas.items" :key="m.id" class="border-b">
            <td class="px-3 py-2">{{ m.codigo ?? '—' }}</td>
            <td class="px-3 py-2">{{ m.nombre }}</td>
            <td class="px-3 py-2">
              <span :class="m.activo ? 'px-2 py-1 text-xs rounded bg-green-100 text-green-700' : 'px-2 py-1 text-xs rounded bg-gray-200 text-gray-700'">
                {{ m.activo ? 'Sí' : 'No' }}
              </span>
            </td>
            <td class="px-3 py-2">
              <button class="underline hover:no-underline mr-2" @click="toggleActivo(m)">Activar/Desactivar</button>
              <button class="underline hover:no-underline text-red-600" @click="remove(m.id)">Eliminar</button>
            </td>
          </tr>
          <tr v-if="!maquinas.items.length">
            <td class="px-3 py-2 text-center" colspan="4">Sin registros</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import { useMaquinas } from '@/stores/appStore'

const maquinas = useMaquinas()
const form = reactive({ codigo: '', nombre: '' })

onMounted(async () => { await maquinas.list(); maquinas.subscribe() })
onUnmounted(() => maquinas.unsubscribe())

async function save(){
  if(!form.nombre) return
  await maquinas.insert({ codigo: form.codigo || null, nombre: form.nombre, activo: true })
  form.codigo = ''; form.nombre = ''
}
async function toggleActivo(m){
  await maquinas.update(m.id, { activo: !m.activo })
}
async function remove(id){
  await maquinas.remove(id)
}
</script>
