<template>
  <div class="rounded-lg">
    <button
      @click="open = !open"
      class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50"
      :class="{ 'bg-gray-100 font-medium': anyActive }"
    >
      <span class="flex items-center gap-2">
        <span v-if="icon" class="text-lg">{{ icon }}</span>
        <span>{{ label }}</span>
      </span>
      <svg :class="['h-4 w-4 transition-transform', open ? 'rotate-180' : '']" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"/>
      </svg>
    </button>

    <div v-show="open" class="mt-1 space-y-1">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="block pl-8 pr-3 py-2 text-sm rounded-lg hover:bg-gray-50"
        :class="{ 'bg-gray-100 font-medium': $route.path === item.to }"
      >
        {{ item.label }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const props = defineProps({
  label: { type: String, required: true },
  icon: { type: String, default: '' },
  items: { type: Array, default: () => [] }
})

const route = useRoute()
const open = ref(true) // abierto por defecto
const anyActive = computed(() => props.items?.some(i => route.path.startsWith(i.to)))
</script>
