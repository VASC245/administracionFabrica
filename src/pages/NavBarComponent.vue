<template>
  <div class="min-h-full">
    <nav class="bg-gray-800">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <div class="flex items-center">
            <div class="shrink-0">
              <img class="size-8" src="https://www.fuegoverde.com.ec/wp-content/uploads/2024/07/cropped-cropped-FUEGO-VERDE-LOGO-300x277.png" alt="Logo" />
            </div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <router-link
                  v-for="item in navigation"
                  :key="item.name"
                  :to="item.href"
                  class="rounded-md px-3 py-2 text-sm font-medium"
                  :class="$route.path === item.href ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
                >
                  {{ item.name }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <main>
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <router-view />
      </div>
    </main>
  </div>
</template>


<script setup>

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Aserrín', href: '/aserrin' },
  { name: 'Leña', href: '/leña' },
  { name: 'Horno', href: '/horno'},
  { name: 'Producción', href: '/fundas' },
  { name: 'Empleados', href: '/empleados' },
  { name: 'Despacho' , href: '/despacho'},
  { name: 'Reporte', href: '/reporte' },
]
</script>
