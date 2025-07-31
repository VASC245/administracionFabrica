import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Produccion from '@/pages/Produccion.vue'
import Despacho from '@/pages/Despacho.vue'
import Aserrin from '@/pages/Aserrin.vue'
import Horno from '@/pages/Horno.vue'
import Asistencia from '@/pages/Asistencia.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'produccion', component: Produccion },
      { path: 'despacho', component: Despacho },
      { path: 'aserrin', component: Aserrin },
      { path: 'horno', component: Horno },
      { path: 'asistencia', component: Asistencia }
    ]
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
