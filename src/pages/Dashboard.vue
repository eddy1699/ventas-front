<template>
  <div class="space-y-5">
    <h1 class="text-xl font-semibold">Dashboard</h1>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div v-for="i in 3" :key="i" class="bg-card border border-border rounded-xl p-4 animate-pulse space-y-2">
        <div class="h-3 bg-border rounded w-1/2"></div>
        <div class="h-8 bg-border rounded w-2/3"></div>
      </div>
    </div>

    <!-- Stats -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="bg-card border border-border rounded-xl p-5">
        <p class="text-xs text-foreground/60 mb-1">Ventas de hoy</p>
        <p class="text-3xl font-bold">S/ {{ dashboard.totalHoy }}</p>
      </div>
      <div class="bg-card border border-border rounded-xl p-5">
        <p class="text-xs text-foreground/60 mb-1">Producto más vendido</p>
        <p class="text-base font-semibold mt-1">{{ dashboard.topProductos?.[0]?.name || '---' }}</p>
        <p v-if="dashboard.topProductos?.[0]" class="text-xs text-foreground/50 mt-0.5">
          {{ dashboard.topProductos[0].total_qty }} unidades
        </p>
      </div>
      <div class="bg-card border border-border rounded-xl p-5">
        <p class="text-xs text-foreground/60 mb-1">Boletas emitidas</p>
        <p class="text-3xl font-bold">{{ receiptsCount }}</p>
      </div>
    </div>

    <!-- Top productos -->
    <div v-if="!loading && dashboard.topProductos?.length" class="bg-card border border-border rounded-xl p-5">
      <h2 class="text-sm font-semibold mb-3">Top productos del día</h2>
      <div class="space-y-2">
        <div
          v-for="(p, i) in dashboard.topProductos.slice(0, 5)"
          :key="p.name"
          class="flex items-center gap-3"
        >
          <span class="text-xs font-bold text-foreground/30 w-4">{{ i + 1 }}</span>
          <div class="flex-1">
            <div class="text-sm font-medium">{{ p.name }}</div>
            <div class="h-1.5 bg-border rounded-full mt-1 overflow-hidden">
              <div
                class="h-full bg-primary rounded-full transition-all"
                :style="{ width: `${(p.total_qty / dashboard.topProductos[0].total_qty) * 100}%` }"
              ></div>
            </div>
          </div>
          <span class="text-xs font-semibold text-foreground/60">{{ p.total_qty }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api/axios";

const dashboard = ref({ totalHoy: 0, topProductos: [] });
const receiptsCount = ref(0);
const loading = ref(true);

onMounted(async () => {
  try {
    const [dashRes, receiptsRes] = await Promise.all([
      api.get("/dashboard"),
      api.get("/receipts"),
    ]);
    dashboard.value = dashRes.data;
    receiptsCount.value = receiptsRes.data.length;
  } finally {
    loading.value = false;
  }
});
</script>
