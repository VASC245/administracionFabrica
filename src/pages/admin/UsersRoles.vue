<template>
  <div class="bg-white rounded-xl shadow p-6 space-y-6">
    <h2 class="text-2xl font-bold">Administrar Usuarios</h2>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-left px-3 py-2">Nombre</th>
            <th class="text-left px-3 py-2">Rol</th>
            <th class="text-left px-3 py-2">Estado</th>
            <th class="text-left px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" class="border-b">
            <td class="px-3 py-2">{{ u.nombre }}</td>
            <td class="px-3 py-2">
              <select v-model="u._edit.rol" class="border rounded px-2 py-1">
                <option v-for="r in ROLES" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </td>
            <td class="px-3 py-2">
              <input type="checkbox" v-model="u._edit.estado" />
            </td>
            <td class="px-3 py-2">
              <button @click="save(u)" :disabled="u._saving"
                      class="bg-blue-600 text-white px-3 py-1 rounded">
                {{ u._saving ? 'Guardando...' : 'Guardar' }}
              </button>
            </td>
          </tr>
          <tr v-if="!users.length">
            <td colspan="4" class="px-3 py-4 text-center text-gray-500">No hay usuarios</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listUsers, updateUser, ROLES } from '@/services/usersService'

const users = ref([])

async function load() {
  const data = await listUsers()
  users.value = data.map(u => ({
    ...u,
    _edit: { rol: u.rol, estado: u.estado },
    _saving: false
  }))
}

async function save(u) {
  u._saving = true
  try {
    await updateUser({ id: u.id, rol: u._edit.rol, estado: u._edit.estado })
    u.rol = u._edit.rol
    u.estado = u._edit.estado
  } catch (err) {
    console.error(err)
    alert('Error al guardar')
  } finally {
    u._saving = false
  }
}

onMounted(load)
</script>
