import { createRouter, createWebHistory } from "vue-router";
import Login from "@/pages/Login.vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import Dashboard from "@/pages/Dashboard.vue";
import Products from "@/pages/Products.vue";
import Sales from "@/pages/Sales.vue";
import Receipts from "@/pages/Receipts.vue";
import Settings from "@/pages/Settings.vue";

const routes = [
  { path: "/login", name: "login", component: Login },
  {
    path: "/",
    component: DashboardLayout,
    children: [
      { path: "", name: "dashboard", component: Dashboard },
      { path: "products", name: "products", component: Products },
      { path: "sales", name: "sales", component: Sales },
      { path: "receipts", name: "receipts", component: Receipts },
      { path: "settings", name: "settings", component: Settings },
    ],
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) next("/login");
  else next();
});

export default router;

