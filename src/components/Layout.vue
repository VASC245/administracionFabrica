<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-72 bg-white border-r hidden md:flex flex-col">
      <div class="px-5 py-4 border-b">
        <h1 class="text-xl font-bold">Fuego Verde</h1>
        <p class="text-xs text-gray-500">Panel Administrativo</p>
        <!-- Nombre y Rol -->
        <p v-if="isLoaded" class="mt-2 text-sm text-gray-700 font-medium">
          👤 {{ username }} - {{ roleLabel }}
        </p>
      </div>

      <nav class="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <!-- Dashboard solo Super Admin -->
        <RouterLink
          v-if="isLoaded && role === 'superadmin'"
          to="/"
          class="block px-3 py-2 rounded-lg hover:bg-gray-50"
          :class="{'bg-gray-100 font-medium': $route.name === 'dashboard'}">
          Dashboard
        </RouterLink>

        <nav-dropdown
          v-if="visibleItems(menu.operaciones).length"
          label="Operaciones" icon="🏭"
          :items="visibleItems(menu.operaciones)"
        />
        <nav-dropdown
          v-if="visibleItems(menu.talento).length"
          label="Talento Humano" icon="👥"
          :items="visibleItems(menu.talento)"
        />
        <nav-dropdown
          v-if="visibleItems(menu.comercial).length"
          label="Comercial" icon="🛒"
          :items="visibleItems(menu.comercial)"
        />
        <nav-dropdown
          v-if="visibleItems(menu.admin).length"
          label="Administración" icon="🛠️"
          :items="visibleItems(menu.admin)"
        />
      </nav>

      <div class="px-4 py-3 border-t flex items-center justify-between">
        <div class="text-xs text-gray-500">© {{ year }} Fuego Verde</div>
        <button
          @click="logout"
          class="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
          Cerrar sesión
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col">
      <header class="md:hidden sticky top-0 bg-white border-b p-3">
        <div class="flex items-center justify-between w-full">
          <div class="flex flex-col">
            <div class="font-semibold">Fuego Verde</div>
            <div class="text-xs text-gray-500">
              👤 {{ username }} - {{ roleLabel }}
            </div>
          </div>
          <div class="text-sm">{{ currentTitle }}</div>
          <button
            @click="logout"
            class="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
            Salir
          </button>
        </div>
      </header>

      <main class="p-4 md:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import NavDropdown from '@/components/navDropdown.vue'
import { useUserStore } from '@/stores/userStore'
import { normalizeRole } from '@/services/authService'

const route = useRoute()
const year = new Date().getFullYear()
const currentTitle = computed(() => route.meta?.title ?? 'Dashboard')

const auth = useUserStore()
const isLoaded = computed(() => auth.isLoaded)
const role = computed(() =>
  normalizeRole(auth?.rol || (typeof localStorage !== 'undefined' ? localStorage.getItem('role') : null))
)

// Nombre del usuario
const username = computed(() =>
  auth?.nombre || (typeof localStorage !== 'undefined' ? localStorage.getItem('nombre') : 'Usuario')
)

// Etiqueta del rol (con mayúsculas)
const roleLabel = computed(() => {
  const r = role.value
  if (!r) return ''
  return r.charAt(0).toUpperCase() + r.slice(1)
})

function visibleItems(items) {
  const r = role.value
  if (!isLoaded.value || !r) return []
  return items.filter(i => !i.roles?.length || i.roles.includes(r))
}

async function logout() {
  try { await auth.logout() } catch (e) { console.error(e) }
}

const menu = {
  operaciones: [
    { label: 'Plan de Producción', to: '/operaciones/plan', roles: ['superadmin','supervisor'] },
    { label: 'Producción', to: '/operaciones/produccion', roles: ['superadmin','supervisor','operador'] },
    { label: 'Paradas Técnicas', to: '/operaciones/paradas', roles: ['superadmin','supervisor',] },
    { label: 'Horas por Máquina', to: '/operaciones/horas-maquina', roles: ['superadmin','supervisor'] },
    { label: 'Mantenimiento', to: '/operaciones/mantenimiento', roles: ['superadmin','supervisor'] },
    { label: 'Repuestos', to: '/operaciones/repuestos', roles: ['superadmin','supervisor'] },
    { label: 'Máquinas', to: '/operaciones/maquinas', roles: ['superadmin','supervisor'] },
    { label: 'Aserrín (recepción)', to: '/operaciones/aserrin', roles: ['superadmin','supervisor',] },
    { label: 'Horno (secado)', to: '/operaciones/horno', roles: ['superadmin','supervisor','operador'] },
    { label: 'Leña', to: '/operaciones/lena', roles: ['superadmin','supervisor',] },
    { label: 'Entrega de Producto', to: '/operaciones/despacho', roles: ['superadmin','supervisor'] },
    { label: 'Fundas Plásticas', to: '/operaciones/fundas/registro', roles: ['superadmin','supervisor',] }
  ],
  talento: [
    { label: 'Asistencia', to: '/talento/asistencia', roles: ['superadmin','supervisor'] }
  ],
  comercial: [
    { label: 'Reportes Comerciales', to: '/comercial/reportes', roles: ['superadmin','supervisor'] }
  ],
  admin: [
    { label: 'Usuarios & Roles', to: '/admin/usuarios', roles: ['superadmin','supervisor'] }
  ]
}
</script>
