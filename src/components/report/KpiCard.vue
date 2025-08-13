<template>
  <div class="p-4 rounded-xl border bg-white">
    <div class="text-xs text-gray-500">{{ title }}</div>
    <div class="text-2xl font-semibold mt-1">{{ value }}</div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], default: '' }
})
</script>
