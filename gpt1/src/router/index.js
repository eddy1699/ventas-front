import { createRouter, createWebHistory } from 'vue-router'

// Importa las vistas
import DashboardView from '../views/DashboardView.vue'
import ProductsView from '../views/ProductsView.vue'
import VentasView from '../views/VentasView.vue'
import LoginView from "../views/full-page/LoginView.vue"
import RegisterView from '../views/full-page/RegisterView.vue'
const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView
  },
  { path: "/register", name: "register", component: RegisterView },
  { path: '/ventas', name: 'ventas', component: VentasView, meta: { requiresAuth: true }  },
  { path: '/productos', name: 'productos', component: ProductsView , meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'dashboard', component: DashboardView , meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token")

  if (to.meta.requiresAuth && !token) {
    // si intenta entrar a una ruta protegida sin token → redirige al login
    next({ path: "/", replace: true })
  } 
  else if ((to.path === "/" || to.path === "/register") && token) {
    // si ya está logueado → evita que vuelva al login
    next("/dashboard")
  } 
  else {
    next()
  }
})


export default router
