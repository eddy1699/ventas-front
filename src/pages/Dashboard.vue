<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Dashboard</h1>
      <input
        v-model="selectedDate"
        type="date"
        @change="fetchData"
        class="px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div v-for="i in 6" :key="i" class="bg-card border border-border rounded-xl p-4 animate-pulse space-y-2">
        <div class="h-3 bg-border rounded w-1/2"></div>
        <div class="h-8 bg-border rounded w-2/3"></div>
      </div>
    </div>

    <!-- Stats -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <div class="bg-card border border-border rounded-xl p-4">
        <p class="text-xs text-foreground/60 mb-1">Total ventas</p>
        <p class="text-2xl font-bold">S/ {{ dashboard.totalHoy }}</p>
      </div>
      <div class="bg-card border border-border rounded-xl p-4">
        <p class="text-xs text-foreground/60 mb-1">N° pedidos</p>
        <p class="text-2xl font-bold">{{ dashboard.pedidos }}</p>
      </div>
      <div class="bg-card border border-border rounded-xl p-4">
        <p class="text-xs text-foreground/60 mb-1">Ticket promedio</p>
        <p class="text-2xl font-bold">S/ {{ dashboard.ticketPromedio }}</p>
      </div>
      <div class="bg-card border border-border rounded-xl p-4">
        <p class="text-xs text-foreground/60 mb-1">Hora pico</p>
        <p class="text-2xl font-bold">{{ dashboard.horaPico !== null ? `${dashboard.horaPico}:00` : '---' }}</p>
      </div>
      <div class="bg-card border border-border rounded-xl p-4">
        <p class="text-xs text-foreground/60 mb-1">Producto estrella</p>
        <p class="text-sm font-semibold mt-1 leading-tight">{{ dashboard.topProductos?.[0]?.name || '---' }}</p>
        <p v-if="dashboard.topProductos?.[0]" class="text-xs text-foreground/50 mt-0.5">
          {{ dashboard.topProductos[0].qty }} uds
        </p>
      </div>
      <div class="bg-card border border-border rounded-xl p-4">
        <p class="text-xs text-foreground/60 mb-1">Boletas emitidas</p>
        <p class="text-2xl font-bold">{{ receiptsCount }}</p>
      </div>
    </div>

    <!-- Ventas por hora -->
    <div v-if="!loading && dashboard.ventasPorHora?.length" class="bg-card border border-border rounded-xl p-5">
      <h2 class="text-sm font-semibold mb-4">Ventas por hora</h2>
      <div class="flex items-end gap-1 h-24">
        <div
          v-for="h in horasConDatos"
          :key="h.hour"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <span class="text-xs text-foreground/50">{{ h.total > 0 ? h.total : '' }}</span>
          <div
            class="w-full rounded-t-md bg-primary transition-all"
            :style="{ height: `${h.pct}%`, minHeight: h.total > 0 ? '4px' : '0' }"
          ></div>
          <span class="text-xs text-foreground/40">{{ h.label }}</span>
        </div>
      </div>
    </div>

    <!-- Top productos -->
    <div v-if="!loading && dashboard.topProductos?.length" class="bg-card border border-border rounded-xl p-5">
      <h2 class="text-sm font-semibold mb-3">Top productos</h2>
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
                :style="{ width: `${(p.qty / dashboard.topProductos[0].qty) * 100}%` }"
              ></div>
            </div>
          </div>
          <span class="text-xs font-semibold text-foreground/60">{{ p.qty }} uds</span>
        </div>
      </div>
    </div>

    <!-- Sin datos -->
    <div v-if="!loading && !dashboard.pedidos" class="text-center text-sm text-foreground/40 py-10">
      <div class="text-4xl mb-2">📊</div>
      <p>No hay ventas para este día</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/api/axios";

const today = new Date().toISOString().slice(0, 10);
const selectedDate = ref(today);
const dashboard = ref({ totalHoy: 0, topProductos: [], pedidos: 0, ticketPromedio: 0, horaPico: null, ventasPorHora: [] });
const receiptsCount = ref(0);
const loading = ref(true);

const horasConDatos = computed(() => {
  const horas = dashboard.value.ventasPorHora ?? [];
  if (!horas.length) return [];
  const maxTotal = Math.max(...horas.map(h => Number(h.total)));
  return horas.map(h => ({
    hour: h.hour,
    total: Number(h.total).toFixed(0),
    label: `${h.hour}h`,
    pct: maxTotal > 0 ? Math.round((Number(h.total) / maxTotal) * 100) : 0,
  }));
});

const fetchData = async () => {
  loading.value = true;
  try {
    const date = selectedDate.value;
    const [dashRes, receiptsRes] = await Promise.all([
      api.get("/dashboard", { params: { startDate: date, endDate: date } }),
      api.get("/receipts"),
    ]);
    dashboard.value = dashRes.data;
    receiptsCount.value = receiptsRes.data.length;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>
