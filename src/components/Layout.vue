<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navbar fijo -->
    <nav class="bg-gray-800 text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <span class="text-xl font-bold text-blue-400">Administracion Fabrica Fuego Verde</span>
          </div>

          <!-- Menu Desktop -->
          <div class="hidden md:flex space-x-6 items-center">
            <router-link
              v-for="link in navLinks"
              :key="link.path"
              :to="link.path"
              class="hover:text-blue-400 transition"
              active-class="text-blue-400 font-semibold"
              exact-active-class="border-b-2 border-blue-400"
            >
              {{ link.name }}
            </router-link>
          </div>

          <!-- Botón Mobile -->
          <div class="flex items-center md:hidden">
            <button @click="menuOpen = !menuOpen" class="focus:outline-none">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Menu Mobile -->
      <div v-if="menuOpen" class="md:hidden bg-gray-700 px-4 py-3 space-y-2">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="block text-white hover:text-blue-400 transition"
          active-class="text-blue-400 font-semibold"
          @click="menuOpen = false"
        >
          {{ link.name }}
        </router-link>
      </div>
    </nav>

    <!-- Contenido -->
    <main class="pt-20 px-4 sm:px-6 lg:px-8">
      <!-- Router View con key para refrescar -->
      <router-view :key="$route.fullPath" class="p-6 bg-white shadow rounded-lg min-h-[80vh] overflow-auto" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const menuOpen = ref(false)

const navLinks = [
  { name: 'Dashboard', path: '/' },
  { name: 'Aserrín', path: '/aserrin' },
  { name: 'Horno', path: '/horno' },
  { name: 'Producción', path: '/produccion' },
  { name: 'Despacho', path: '/despacho' },
  { name: 'Asistencia', path: '/asistencia' }
]
</script>

<style>
.router-link-active {
  color: #60a5fa;
}
</style>
