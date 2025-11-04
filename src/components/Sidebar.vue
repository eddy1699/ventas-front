<template>
  <aside class="w-60 bg-card border-r border-border min-h-screen hidden md:flex flex-col">
    <div class="px-6 py-5 font-semibold text-lg tracking-tight">
      Ventas<span class="text-primary">Diarias</span>
    </div>
    <nav class="flex-1 px-3 space-y-1">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition"
        :class="[$route.name === item.name ? 'bg-primary/10 text-primary' : 'text-foreground/80']"
      >
        <span class="text-xl">{{ item.icon }}</span>
        <span class="text-sm font-medium">{{ item.label }}</span>
      </RouterLink>
    </nav>
    <div class="p-4 text-xs text-foreground/40">
      © {{ new Date().getFullYear() }} Ventas Diarias
    </div>
  </aside>
</template>
<script setup>
const items = [
  { name: "dashboard", label: "Dashboard", to: "/", icon: "📊" },
  { name: "products", label: "Productos", to: "/products", icon: "📦" },
  { name: "sales", label: "Ventas", to: "/sales", icon: "🛒" },
  { name: "receipts", label: "Boletas", to: "/receipts", icon: "🧾" },
  { name: "settings", label: "Configuración", to: "/settings", icon: "⚙️" },
];
</script>

