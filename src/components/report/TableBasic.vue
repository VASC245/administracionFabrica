<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th v-for="(h, i) in headers" :key="i" class="text-left px-3 py-2">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows || !rows.length">
          <td :colspan="headers.length" class="px-3 py-2 text-center text-gray-500">{{ empty }}</td>
        </tr>
        <tr v-for="(r, ri) in rows" :key="ri" class="border-b">
          <td v-for="(c, ci) in r" :key="ci" class="px-3 py-2">{{ c }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  headers: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
  empty: { type: String, default: 'Sin datos' }
})
</script>
