<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar (desktop) -->
    <aside class="w-72 bg-white border-r hidden md:flex flex-col">
      <div class="px-5 py-4 border-b">
        <h1 class="text-xl font-bold">Fuego Verde</h1>
        <p class="text-xs text-gray-500">Panel Administrativo</p>
        <p v-if="isLoaded" class="mt-2 text-sm text-gray-700 font-medium">
          👤 {{ username }} - {{ roleLabel }}
        </p>
      </div>

      <nav class="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <RouterLink
          v-if="isLoaded && role === 'superadmin'"
          to="/"
          class="block px-3 py-2 rounded-lg hover:bg-gray-50"
          :class="{ 'bg-gray-100 font-medium': $route.name === 'dashboard' }"
        >
          Dashboard
        </RouterLink>

        <nav-dropdown
          v-if="menuFiltered.operaciones.length"
          label="Operaciones" icon="🏭"
          :items="menuFiltered.operaciones"
        />
        <nav-dropdown
          v-if="menuFiltered.talento.length"
          label="Talento Humano" icon="👥"
          :items="menuFiltered.talento"
        />
        <nav-dropdown
          v-if="menuFiltered.comercial.length"
          label="Comercial" icon="🛒"
          :items="menuFiltered.comercial"
        />
        <nav-dropdown
          v-if="menuFiltered.admin.length"
          label="Administración" icon="🛠️"
          :items="menuFiltered.admin"
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

    <!-- Off-canvas Sidebar (mobile) -->
    <transition name="fade">
      <!-- Regla ESLint: hijo directo de <transition> con v-if -->
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 z-40 bg-black/40 md:hidden"
        role="dialog"
        aria-modal="true"
        @click.self="closeSidebar"
        @keydown.esc="closeSidebar"
      >
        <transition name="slide">
          <!-- Regla ESLint en la transición interna: usar v-show/v-if en el hijo directo -->
          <aside
            v-show="isSidebarOpen"
            class="absolute left-0 top-0 h-full w-72 bg-white border-r shadow-xl flex flex-col"
          >
            <div class="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <h1 class="text-lg font-bold">Fuego Verde</h1>
                <p class="text-xs text-gray-500">Panel Administrativo</p>
                <p v-if="isLoaded" class="mt-1 text-xs text-gray-700">
                  👤 {{ username }} - {{ roleLabel }}
                </p>
              </div>
              <button
                class="p-2 rounded hover:bg-gray-100"
                @click="closeSidebar"
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>

            <nav class="flex-1 overflow-y-auto px-2 py-3 space-y-1">
              <RouterLink
                v-if="isLoaded && role === 'superadmin'"
                to="/"
                class="block px-3 py-2 rounded-lg hover:bg-gray-50"
                :class="{ 'bg-gray-100 font-medium': $route.name === 'dashboard' }"
                @click="closeSidebar"
              >
                Dashboard
              </RouterLink>

              <nav-dropdown
                v-if="menuFiltered.operaciones.length"
                label="Operaciones" icon="🏭"
                :items="menuFiltered.operaciones"
                @navigate="closeSidebar"
              />
              <nav-dropdown
                v-if="menuFiltered.talento.length"
                label="Talento Humano" icon="👥"
                :items="menuFiltered.talento"
                @navigate="closeSidebar"
              />
              <nav-dropdown
                v-if="menuFiltered.comercial.length"
                label="Comercial" icon="🛒"
                :items="menuFiltered.comercial"
                @navigate="closeSidebar"
              />
              <nav-dropdown
                v-if="menuFiltered.admin.length"
                label="Administración" icon="🛠️"
                :items="menuFiltered.admin"
                @navigate="closeSidebar"
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
        </transition>
      </div>
    </transition>

    <!-- Main -->
    <div class="flex-1 flex flex-col">
      <header class="md:hidden sticky top-0 bg-white border-b p-3">
        <div class="flex items-center justify-between w-full">
          <button
            class="p-2 rounded hover:bg-gray-100"
            @click="openSidebar"
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <div class="flex flex-col items-center">
            <div class="font-semibold">Fuego Verde</div>
            <div class="text-xs text-gray-500">
              👤 {{ username }} - {{ roleLabel }}
            </div>
          </div>
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
import { computed, watchEffect, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import { storeToRefs } from 'pinia'
import NavDropdown from '@/components/navDropdown.vue'
import { useUserStore } from '@/stores/userStore'
import { normalizeRole } from '@/services/authService'

/* Registrar el componente si usas kebab-case en el template */
const navDropdown = NavDropdown

const route = useRoute()
const year = new Date().getFullYear()

/* ========= Store de usuario (reactivo real) ========= */
const auth = useUserStore()
const { isLoaded, rol, nombre } = storeToRefs(auth)

/* Rol derivado (con fallback a localStorage) */
const role = computed(() => normalizeRole(
  rol.value || (typeof localStorage !== 'undefined' ? localStorage.getItem('role') : null)
))

/* Nombre derivado (con fallback a localStorage) */
const username = computed(() =>
  nombre.value || (typeof localStorage !== 'undefined' ? localStorage.getItem('nombre') : 'Usuario')
)

/* Persistencia en localStorage */
watchEffect(() => {
  if (typeof localStorage === 'undefined') return
  if (role.value) localStorage.setItem('role', role.value)
  if (username.value) localStorage.setItem('nombre', username.value)
})

/* Etiqueta del rol (capitalizada) */
const roleLabel = computed(() => {
  const r = role.value
  return r ? r.charAt(0).toUpperCase() + r.slice(1) : ''
})

/* ========= Menú base ========= */
const menu = {
  operaciones: [
    { label: 'Plan de Producción', to: '/operaciones/plan', roles: ['superadmin','supervisor'] },
    { label: 'Producción', to: '/operaciones/produccion', roles: ['superadmin','supervisor','operador'] },
    { label: 'Paradas Técnicas', to: '/operaciones/paradas', roles: ['superadmin','supervisor'] },
    { label: 'Horas por Máquina', to: '/operaciones/horas-maquina', roles: ['superadmin','supervisor','operador'] },
    { label: 'Mantenimiento', to: '/operaciones/mantenimiento', roles: ['superadmin','supervisor'] },
    { label: 'Repuestos', to: '/operaciones/repuestos', roles: ['superadmin','supervisor'] },
    { label: 'Máquinas', to: '/operaciones/maquinas', roles: ['superadmin','supervisor'] },
    { label: 'Aserrín (recepción)', to: '/operaciones/aserrin', roles: ['superadmin','supervisor'] },
    { label: 'Horno (secado)', to: '/operaciones/horno', roles: ['superadmin','supervisor','operador'] },
    { label: 'Leña', to: '/operaciones/lena', roles: ['superadmin','supervisor'] },
    { label: 'Entrega de Producto', to: '/operaciones/despacho', roles: ['superadmin','supervisor'] },
    { label: 'Fundas Plásticas', to: '/operaciones/fundas/registro', roles: ['superadmin','supervisor','operador'] },
    { label: 'Fotogrametría', to: '/operaciones/fotogrametria', roles: ['superadmin'] },
  ],
  talento: [
    { label: 'Asistencia', to: '/talento/asistencia', roles: ['superadmin','supervisor','operador'] }
  ],
  comercial: [
    { label: 'Reportes Diario', to: '/comercial/reportes', roles: ['superadmin','supervisor'] }
  ],
  admin: [
    { label: 'Usuarios & Roles', to: '/admin/usuarios', roles: ['superadmin','supervisor'] }
  ]
}

/* Filtro reactivo de menú */
const menuFiltered = computed(() => {
  const r = role.value
  const filter = (items) => (!isLoaded.value || !r) ? [] : items.filter(i => !i.roles?.length || i.roles.includes(r))
  return {
    operaciones: filter(menu.operaciones),
    talento:     filter(menu.talento),
    comercial:   filter(menu.comercial),
    admin:       filter(menu.admin),
  }
})

/* ========= Sidebar móvil ========= */
const isSidebarOpen = ref(false)
function openSidebar()  { isSidebarOpen.value = true }
function closeSidebar() { isSidebarOpen.value = false }

/* Cerrar al cambiar de ruta (sin usar variables “_” no utilizadas) */
watch(() => route.fullPath, () => {
  isSidebarOpen.value = false
})

/* Cerrar con tecla Esc en todo el documento (redundante al @keydown del overlay) */
function onKey(e) { if (e.key === 'Escape') closeSidebar() }
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))

/* Logout */
async function logout() {
  try { await auth.logout() } catch (e) { console.error(e) }
}
</script>

<style scoped>
/* Transiciones del off-canvas */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform .2s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); }
</style>
