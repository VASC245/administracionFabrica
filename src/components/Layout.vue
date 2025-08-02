<template>
  <nav class="bg-gray-800 text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- Logo -->
        <div class="flex items-center">
          <h1 class="text-lg md:text-xl font-bold">Fabrica Fuego Verde</h1>
        </div>

        <!-- Menú Desktop -->
        <div class="hidden md:flex items-center space-x-6" v-if="user">
          <router-link to="/dashboard" class="hover:text-gray-300">Dashboard</router-link>
          <router-link v-if="puedeAcceder('aserrin')" to="/aserrin" class="hover:text-gray-300">Aserrín</router-link>
          <router-link v-if="puedeAcceder('produccion')" to="/produccion" class="hover:text-gray-300">Producción</router-link>
          <router-link v-if="puedeAcceder('horno')" to="/horno" class="hover:text-gray-300">Horno</router-link>
          <router-link v-if="puedeAcceder('asistencia')" to="/asistencia" class="hover:text-gray-300">Asistencia</router-link>
          <router-link v-if="puedeAcceder('despacho')" to="/despacho" class="hover:text-gray-300">Entrega de Producto</router-link>
        </div>

        <!-- Usuario y Logout (Desktop) -->
        <div class="hidden md:flex items-center gap-4" v-if="user">
          <div class="text-right">
            <p class="text-sm font-semibold">{{ user.nombre }}</p>
            <p class="text-xs text-gray-300">{{ user.rol }}</p>
          </div>
          <button @click="logout"
            class="bg-red-500 px-4 py-2 rounded hover:bg-red-600 text-sm font-semibold">
            Cerrar sesión
          </button>
        </div>

        <!-- Menú Mobile Toggle -->
        <div class="md:hidden">
          <button @click="toggleMenu" class="focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Menú Mobile -->
    <div v-if="menuAbierto" class="md:hidden bg-gray-700 px-4 py-3 space-y-3">
      <router-link to="/dashboard" class="block hover:text-gray-300">Dashboard</router-link>
      <router-link v-if="puedeAcceder('aserrin')" to="/aserrin" class="block hover:text-gray-300">Aserrín</router-link>
      <router-link v-if="puedeAcceder('produccion')" to="/produccion" class="block hover:text-gray-300">Producción</router-link>
      <router-link v-if="puedeAcceder('horno')" to="/horno" class="block hover:text-gray-300">Horno</router-link>
      <router-link v-if="puedeAcceder('asistencia')" to="/asistencia" class="block hover:text-gray-300">Asistencia</router-link>
      <router-link v-if="puedeAcceder('despacho')" to="/despacho" class="block hover:text-gray-300">Entrega de Producto</router-link>

      <!-- Usuario + Botón Logout (Mobile) -->
      <div class="border-t border-gray-600 pt-3">
        <p class="text-sm font-semibold">{{ user?.nombre }}</p>
        <p class="text-xs text-gray-300">{{ user?.rol }}</p>
        <button @click="logout"
          class="mt-3 w-full bg-red-500 px-4 py-2 rounded hover:bg-red-600 text-sm font-semibold">
          Cerrar sesión
        </button>
      </div>
    </div>
  </nav>

  <!-- Contenido -->
  <div class="p-4 md:p-6" v-if="user">
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const menuAbierto = ref(false)

const toggleMenu = () => menuAbierto.value = !menuAbierto.value

const cargarUsuario = async () => {
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session) {
    router.push('/login')
    return
  }
  const userId = session.session.user.id
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()
  if (!error && data) {
    user.value = data
  } else {
    router.push('/login')
  }
}

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

const puedeAcceder = (pagina) => {
  if (!user.value) return false
  const rol = user.value.rol?.trim()

  if (rol === 'Super Admin') {
    return true
  }
  if (rol === 'Supervisor') {
    return ['aserrin', 'produccion', 'horno', 'asistencia', 'despacho'].includes(pagina)
  }
  if (rol === 'Operador') {
    return ['horno', 'aserrin'].includes(pagina)
  }
  return false
}

onMounted(cargarUsuario)
</script>
