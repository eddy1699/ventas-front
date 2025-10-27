import { createRouter, createWebHistory } from 'vue-router'

// Importa las vistas
import DashboardView from '../views/DashboardView.vue'
import ProductsView from '../views/ProductsView.vue'
import VentasView from '../views/VentasView.vue'

const routes = [
  { path: '/', name: 'ventas', component: VentasView },
  { path: '/productos', name: 'productos', component: ProductsView },
  { path: '/dashboard', name: 'dashboard', component: DashboardView },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
