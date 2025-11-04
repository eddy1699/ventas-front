<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold">Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-card border border-border rounded-xl p-4 shadow-soft">
        <p class="text-xs text-foreground/60 mb-1">Ventas de hoy</p>
        <p class="text-2xl font-bold">S/ {{ dashboard.totalHoy }}</p>
      </div>
      <div class="bg-card border border-border rounded-xl p-4 shadow-soft">
        <p class="text-xs text-foreground/60 mb-1">Producto más vendido</p>
        <p class="text-sm">{{ dashboard.topProductos?.[0]?.name || '---' }}</p>
      </div>
      <div class="bg-card border border-border rounded-xl p-4 shadow-soft">
        <p class="text-xs text-foreground/60 mb-1">Boletas emitidas</p>
        <p class="text-2xl font-bold">{{ receiptsCount }}</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import api from "@/api/axios";
const dashboard = ref({ totalHoy: 0, topProductos: [] });
const receiptsCount = ref(0);
onMounted(async () => {
  const { data } = await api.get("/dashboard");
  dashboard.value = data;
  const { data: receipts } = await api.get("/receipts");
  receiptsCount.value = receipts.length;
});
</script>

