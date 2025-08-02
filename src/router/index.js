import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

import Dashboard from '@/pages/Dashboard.vue'
import Aserrin from '@/pages/Aserrin.vue'
import Produccion from '@/pages/Produccion.vue'
import Horno from '@/pages/Horno.vue'
import Asistencia from '@/pages/Asistencia.vue'
import Despacho from '@/pages/Despacho.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },

  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/aserrin', name: 'Aserrin', component: Aserrin },
  { path: '/produccion', name: 'Produccion', component: Produccion },
  { path: '/horno', name: 'Horno', component: Horno },
  { path: '/asistencia', name: 'Asistencia', component: Asistencia },
  { path: '/despacho', name: 'Despacho', component: Despacho },

  { path: '/', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

//  Protección de rutas
router.beforeEach(async (to, from, next) => {
  const publicPages = ['/login', '/register']
  const authRequired = !publicPages.includes(to.path)

  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData?.session

  if (authRequired && !session) {
    return next('/login')
  }

  if (session) {
    const { data: user } = await supabase.from('users').select('rol').eq('id', session.user.id).single()
    const rol = user?.rol

    if (rol === 'Operador' && !['/horno', '/aserrin'].includes(to.path)) {
      return next('/horno')
    }

    if (rol === 'Supervisor' && !['/horno', '/aserrin', '/produccion', '/asistencia', '/despacho'].includes(to.path)) {
      return next('/aserrin')
    }

    // Super Admin accede a todo
  }

  next()
})

export default router
