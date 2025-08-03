<template>
  <nav class="bg-gray-800 text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- Logo / Título -->
        <h1 class="text-xl font-bold">Administración Fábrica</h1>

        <!-- Botón menú (mobile) -->
        <button @click="menuAbierto = !menuAbierto" class="md:hidden focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Menú Desktop -->
        <div class="hidden md:flex items-center space-x-6" v-if="user">
          <router-link to="/dashboard" v-if="puedeAcceder('dashboard')" class="hover:text-gray-300">Dashboard</router-link>
          <router-link to="/aserrin" v-if="puedeAcceder('aserrin')" class="hover:text-gray-300">Aserrín</router-link>
          <router-link to="/produccion" v-if="puedeAcceder('produccion')" class="hover:text-gray-300">Producción</router-link>
          <router-link to="/horno" v-if="puedeAcceder('horno')" class="hover:text-gray-300">Horno</router-link>
          <router-link to="/asistencia" v-if="puedeAcceder('asistencia')" class="hover:text-gray-300">Asistencia</router-link>
          <router-link to="/despacho" v-if="puedeAcceder('despacho')" class="hover:text-gray-300">Entrega</router-link>
          <router-link to="/lena" v-if="puedeAcceder('lena')" class="hover:text-gray-300">Leña</router-link>
        </div>

        <!-- Usuario y Logout (Desktop) -->
        <div class="hidden md:flex items-center gap-4">
          <div v-if="user" class="text-right">
            <p class="text-sm font-semibold">{{ user.nombre }}</p>
            <p class="text-xs text-gray-300">{{ user.rol }}</p>
          </div>
          <button @click="logout"
            class="bg-red-500 px-4 py-2 rounded hover:bg-red-600 text-sm font-semibold">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>

    <!-- Menú Mobile -->
    <div v-show="menuAbierto" class="md:hidden bg-gray-700 px-4 pt-4 pb-6 space-y-2">
      <div v-if="user" class="mb-4">
        <p class="text-sm font-semibold">{{ user.nombre }}</p>
        <p class="text-xs text-gray-300">{{ user.rol }}</p>
      </div>

      <!-- Links -->
      <router-link @click="cerrarMenu" to="/dashboard" v-if="puedeAcceder('dashboard')" class="block py-2 hover:bg-gray-600 rounded">Dashboard</router-link>
      <router-link @click="cerrarMenu" to="/aserrin" v-if="puedeAcceder('aserrin')" class="block py-2 hover:bg-gray-600 rounded">Aserrín</router-link>
      <router-link @click="cerrarMenu" to="/produccion" v-if="puedeAcceder('produccion')" class="block py-2 hover:bg-gray-600 rounded">Producción</router-link>
      <router-link @click="cerrarMenu" to="/horno" v-if="puedeAcceder('horno')" class="block py-2 hover:bg-gray-600 rounded">Horno</router-link>
      <router-link @click="cerrarMenu" to="/asistencia" v-if="puedeAcceder('asistencia')" class="block py-2 hover:bg-gray-600 rounded">Asistencia</router-link>
      <router-link @click="cerrarMenu" to="/despacho" v-if="puedeAcceder('despacho')" class="block py-2 hover:bg-gray-600 rounded">Entrega</router-link>
      <router-link @click="cerrarMenu" to="/lena" v-if="puedeAcceder('lena')" class="block py-2 hover:bg-gray-600 rounded">Leña</router-link>

      <!-- Botón Logout -->
      <button @click="logout" class="w-full mt-4 bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white">
        Cerrar sesión
      </button>
    </div>
  </nav>
</template>

<script setup>
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const props = defineProps({ user: Object })
const router = useRouter()
const menuAbierto = ref(false)

const logout = async () => {
  await supabase.auth.signOut()
  localStorage.clear()
  router.push('/login')
}

const cerrarMenu = () => {
  menuAbierto.value = false
}

// Control de acceso basado en rol
const puedeAcceder = (pagina) => {
  const rol = props.user?.rol
  if (rol === 'admin' || rol === 'Super Admin') return true
  if (rol === 'supervisor' || rol === 'Supervisor') return ['aserrin', 'produccion', 'horno', 'asistencia', 'despacho', 'lena'].includes(pagina)
  if (rol === 'opera' || rol === 'Operador') return ['horno', 'aserrin'].includes(pagina)
  return false
}
</script>
