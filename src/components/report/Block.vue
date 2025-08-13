<template>
  <section class="p-4 border rounded-xl">
    <header class="flex items-center justify-between mb-3">
      <h3 class="text-lg font-semibold">{{ title }}</h3>
      <slot name="right"></slot>
    </header>
    <div>
      <slot name="body"></slot>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true }
})
</script>
