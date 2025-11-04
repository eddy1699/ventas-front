<template>
  <div class="space-y-4 max-w-xl">
    <h1 class="text-xl font-semibold">Configuración</h1>
    <div class="bg-card rounded-xl border border-border p-4 space-y-3">
      <h2 class="text-sm font-semibold">Tema</h2>
      <p class="text-xs text-foreground/60">Cambia entre modo claro y oscuro.</p>
      <ThemeToggle />
    </div>
  </div>
</template>
<script setup>
import ThemeToggle from "@/components/ThemeToggle.vue";
</script>

