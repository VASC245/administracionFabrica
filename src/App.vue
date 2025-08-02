<template>
  <div>
    <Layout v-if="mostrarNavbar" />
  </div>
</template>

<script setup>
import Layout from '@/components/Layout.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const mostrarNavbar = computed(() => !['/login', '/register'].includes(route.path))
</script>
