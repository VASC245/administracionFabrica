<template>
  <div v-if="loading" class="flex justify-center items-center h-screen">
    <p class="text-xl font-bold">Cargando...</p>
  </div>
  <div v-else>
    <Layout v-if="mostrarNavbar && user" :user="user" />
    <router-view />
  </div>
</template>

<script setup>
import Layout from '@/components/Layout.vue'
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const router = useRouter()

const mostrarNavbar = computed(() => !['/login', '/register'].includes(route.path))
const user = ref(null)
const loading = ref(true)

onMounted(async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData.session) {
    loading.value = false
    return
  }

  const userId = sessionData.session.user.id
  const { data } = await supabase.from('users').select('*').eq('id', userId).single()

  if (data) {
    user.value = data
    if (route.path === '/login') {
      if (data.rol === 'Super Admin') router.push('/dashboard')
      else if (data.rol === 'Supervisor') router.push('/aserrin')
      else if (data.rol === 'Operador') router.push('/horno')
    }
  } else {
    await supabase.auth.signOut()
    router.push('/login')
  }

  loading.value = false
})
</script>
