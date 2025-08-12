import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import { useUserStore } from '@/stores/userStore'
import { normalizeRole } from '@/services/authService'

const routes = [
  // Shell principal + Dashboard (solo Super Admin)
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/Dashboard.vue'),
        meta: { title: 'Dashboard', roles: ['superadmin'] } // ← sólo superadmin
      }
    ]
  },

  // OPERACIONES
  {
    path: '/operaciones',
    component: Layout,
    meta: { section: 'Operaciones' },
    children: [
      { path: '', redirect: { name: 'operaciones-plan' } },

      { path: 'plan', name: 'operaciones-plan',
        component: () => import('@/pages/planProduccion.vue'),
        meta: { title: 'Plan de Producción', roles: ['superadmin','supervisor'] } },

      { path: 'produccion', name: 'operaciones-produccion',
        component: () => import('@/pages/operaciones/Produccion.vue'),
        meta: { title: 'Producción', roles: ['superadmin','supervisor','operador'] } },

      { path: 'paradas', name: 'operaciones-paradas',
        component: () => import('@/pages/controlParadas.vue'),
        meta: { title: 'Paradas Técnicas', roles: ['superadmin','supervisor','operador'] } },

      { path: 'horas-maquina', name: 'operaciones-horas',
        component: () => import('@/pages/horasMaquina.vue'),
        meta: { title: 'Horas por Máquina', roles: ['superadmin','supervisor','operador'] } },

      { path: 'mantenimiento', name: 'operaciones-mantenimiento',
        component: () => import('@/pages/Mantenimiento.vue'),
        meta: { title: 'Mantenimiento', roles: ['superadmin','supervisor'] } },

      { path: 'repuestos', name: 'operaciones-repuestos',
        component: () => import('@/pages/inventarioRepuestos.vue'),
        meta: { title: 'Repuestos', roles: ['superadmin','supervisor'] } },

      { path: 'maquinas', name: 'operaciones-maquinas',
        component: () => import('@/pages/Maquinas.vue'),
        meta: { title: 'Máquinas', roles: ['superadmin','supervisor'] } },

      { path: 'aserrin', name: 'operaciones-aserrin',
        component: () => import('@/pages/operaciones/Aserrin.vue'),
        meta: { title: 'Aserrín (recepción)', roles: ['superadmin','supervisor','operador'] } },

      { path: 'horno', name: 'operaciones-horno',
        component: () => import('@/pages/operaciones/Horno.vue'),
        meta: { title: 'Horno (secado)', roles: ['superadmin','supervisor','operador'] } },

      { path: 'lena', name: 'operaciones-lena',
        component: () => import('@/pages/operaciones/Lena.vue'),
        meta: { title: 'Leña / Combustible', roles: ['superadmin','supervisor','operador'] } },

      { path: 'despacho', name: 'operaciones-despacho',
        component: () => import('@/pages/operaciones/Despacho.vue'),
        meta: { title: 'Despacho PT', roles: ['superadmin','supervisor'] } },

      { path: 'fundas/registro', name: 'operaciones-fundas-registro',
        component: () => import('@/pages/operaciones/FundasPlasticas.vue'),
        meta: { title: 'Fundas Plásticas', roles: ['superadmin','supervisor','operador'] } }
    ]
  },

  // TALENTO
  {
    path: '/talento',
    component: Layout,
    meta: { section: 'Talento Humano' },
    children: [
      { path: 'asistencia', name: 'talento-asistencia',
        component: () => import('@/pages/th/Asistencia.vue'),
        meta: { title: 'Asistencia', roles: ['superadmin','supervisor'] } }
    ]
  },

  // COMERCIAL
  {
    path: '/comercial',
    component: Layout,
    meta: { section: 'Comercial' },
    children: [
      { path: 'reportes', name: 'comercial-reportes',
        component: () => import('@/pages/ReporteComponent.vue'),
        meta: { title: 'Reportes Comerciales', roles: ['superadmin','supervisor'] } }
    ]
  },

  // ADMIN (usuarios/roles)
  {
    path: '/admin/usuarios',
    component: Layout,
    children: [
      {
        path: '',
        name: 'admin-usuarios',
        component: () => import('@/pages/admin/UsersRoles.vue'),
        meta: { title: 'Usuarios & Roles', roles: ['superadmin','supervisor'] }
      }
    ]
  },

  // AUTH públicas
  { path: '/login', name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { title: 'Ingresar', public: true } },
  { path: '/register', name: 'register',
    component: () => import('@/views/Register.vue'),
    meta: { title: 'Registrarse', public: true } },

  // 404
  { path: '/:pathMatch(.*)*', redirect: { name: 'dashboard' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to, from, next) => {
  const auth = useUserStore()
  await auth.ensureLoaded().catch(() => null)

  const isPublic   = !!to.meta?.public
  const isAuthPage = to.name === 'login' || to.name === 'register'
  const isLogged   = !!auth.user

  // rol normalizado (Super Admin / Supervisor / Operador)
  const rawRol  = auth?.rol || (typeof localStorage !== 'undefined' ? localStorage.getItem('role') : null)
  const userRol = normalizeRole(rawRol)

  const required = Array.isArray(to.meta?.roles) ? to.meta.roles : []

  if (isAuthPage && isLogged) {
    const target = to.query?.redirect ? decodeURIComponent(String(to.query.redirect)) : '/'
    return next(target)
  }
  if (isPublic) return next()
  if (!isLogged) return next({ name: 'login', query: { redirect: to.fullPath } })

  if (required.length) {
    const requiredNorm = required.map(r => normalizeRole(r))
    if (!userRol || !requiredNorm.includes(userRol)) {
      // sin acceso → manda a la primera ruta que sí pueda ver o al login
      if (userRol === 'supervisor') return next({ name: 'operaciones-produccion' })
      if (userRol === 'operador')   return next({ name: 'operaciones-produccion' })
      return next({ name: 'login' })
    }
  }

  next()
})

export default router
