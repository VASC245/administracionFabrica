import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/pages/Dashboard.vue'
import Aserrin from '@/pages/Aserrin.vue'
import Produccion from '@/pages/Produccion.vue'
import Horno from '@/pages/Horno.vue'
import Asistencia from '@/pages/Asistencia.vue'
import Despacho from '@/pages/Despacho.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import { supabase } from '@/lib/supabase'

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, roles: ['Super Admin', 'Supervisor'] }
  },
  {
    path: '/aserrin',
    name: 'Aserrín',
    component: Aserrin,
    meta: { requiresAuth: true, roles: ['Super Admin', 'Supervisor', 'Operador'] }
  },
  {
    path: '/produccion',
    name: 'Producción',
    component: Produccion,
    meta: { requiresAuth: true, roles: ['Super Admin', 'Supervisor'] }
  },
  {
    path: '/horno',
    name: 'Horno',
    component: Horno,
    meta: { requiresAuth: true, roles: ['Super Admin', 'Operador'] }
  },
  {
    path: '/asistencia',
    name: 'Asistencia',
    component: Asistencia,
    meta: { requiresAuth: true, roles: ['Super Admin', 'Supervisor'] }
  },
  {
    path: '/despacho',
    name: 'Despacho',
    component: Despacho,
    meta: { requiresAuth: true, roles: ['Super Admin', 'Supervisor'] }
  },
  { path: '/', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (to.meta.requiresAuth && !session) {
    return next('/login')
  }

  if (session) {
    const { data: userData } = await supabase
      .from('users')
      .select('rol')
      .eq('id', session.user.id)
      .single()

    const userRole = userData?.rol

    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      return next('/dashboard')
    }
  }

  next()
})

export default router
