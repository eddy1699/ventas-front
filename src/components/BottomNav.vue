<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border flex md:hidden safe-bottom">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-foreground/50 transition"
      :class="[$route.name === item.name ? 'text-primary' : '']"
    >
      <span class="text-xl leading-none">{{ item.icon }}</span>
      <span class="text-[10px] font-medium">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router";
const $route = useRoute();
const items = [
  { name: "dashboard", label: "Inicio", to: "/", icon: "📊" },
  { name: "products", label: "Productos", to: "/products", icon: "📦" },
  { name: "tables", label: "Mesas", to: "/tables", icon: "🪑" },
  { name: "sales", label: "Ventas", to: "/sales", icon: "🛒" },
  { name: "receipts", label: "Boletas", to: "/receipts", icon: "🧾" },
  { name: "settings", label: "Config", to: "/settings", icon: "⚙️" },
];
</script>
