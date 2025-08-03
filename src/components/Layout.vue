<template>
  <nav class="bg-gray-800 text-white shadow-md">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <h1 class="text-xl font-bold">Administración Fábrica</h1>

        <div class="hidden md:flex items-center space-x-6" v-if="user">
          <router-link to="/dashboard" v-if="puedeAcceder('dashboard')" class="hover:text-gray-300">Dashboard</router-link>
          <router-link to="/aserrin" v-if="puedeAcceder('aserrin')" class="hover:text-gray-300">Aserrín</router-link>
          <router-link to="/produccion" v-if="puedeAcceder('produccion')" class="hover:text-gray-300">Producción</router-link>
          <router-link to="/horno" v-if="puedeAcceder('horno')" class="hover:text-gray-300">Horno</router-link>
          <router-link to="/asistencia" v-if="puedeAcceder('asistencia')" class="hover:text-gray-300">Asistencia</router-link>
          <router-link to="/despacho" v-if="puedeAcceder('despacho')" class="hover:text-gray-300">Entrega</router-link>
        </div>

        <div class="flex items-center gap-4">
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
  </nav>
</template>

<script setup>
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({ user: Object })
const router = useRouter()

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

const puedeAcceder = (pagina) => {
  const rol = props.user?.rol
  if (rol === 'Super Admin') return true
  if (rol === 'Supervisor') return ['aserrin', 'produccion', 'horno', 'asistencia', 'despacho'].includes(pagina)
  if (rol === 'Operador') return ['horno', 'aserrin'].includes(pagina)
  return false
}
</script>
