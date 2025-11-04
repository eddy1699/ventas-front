<template>
  <section class="space-y-6">
    <!-- Filtros -->
    <div class="flex flex-col md:flex-row gap-4 items-center">
      <input
        type="date"
        v-model="startDate"
        class="border border-slate-300 p-2 rounded-md bg-slate-50 text-slate-700"
      />
      <input
        type="date"
        v-model="endDate"
        class="border border-slate-300 p-2 rounded-md bg-slate-50 text-slate-700"
      />
      <button
        @click="fetchDashboard"
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md px-4 py-2"
      >
        Filtrar
      </button>
    </div>

    <!-- Resumen -->
    <div class="bg-white rounded-xl shadow p-4 w-full md:w-1/2">
      <h2 class="text-lg font-semibold text-slate-800 mb-3">Resumen del Día</h2>

      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500 text-xs uppercase">
            <th class="text-left py-2">Producto</th>
            <th class="text-right py-2">Cantidad</th>
            <th class="text-right py-2">Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="t in dashboard.topProductos"
            :key="t.name"
            class="hover:bg-slate-50"
          >
            <td class="py-2">{{ t.name }}</td>
            <td class="py-2 text-right font-medium">{{ t.qty }}</td>
            <td class="py-2 text-right font-medium">S/ {{ t.monto }}</td>
          </tr>
          <tr v-if="!dashboard.topProductos.length">
            <td colspan="3" class="text-center text-slate-400 py-3">
              No hay productos vendidos
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Total -->
    <div class="bg-white rounded-xl shadow p-4 w-full md:w-1/3">
      <h2 class="text-sm text-slate-500">Total de ventas</h2>
      <p class="text-2xl font-semibold text-slate-800">
        S/ {{ Number(dashboard.totalHoy || 0).toFixed(2) }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import apiURL from "../url.js";

const backendURL = apiURL;
const dashboard = ref({ totalHoy: 0, topProductos: [] });
const startDate = ref("");
const endDate = ref("");

// === Cargar dashboard ===
async function fetchDashboard() {
  try {
    const token = localStorage.getItem("token");
    const params = {};

    if (startDate.value && endDate.value) {
      params.startDate = startDate.value;
      params.endDate = endDate.value;
    }

    const { data } = await axios.get(`${backendURL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    dashboard.value = data;
  } catch (err) {
    console.error("❌ Error al obtener dashboard:", err);
  }
}

onMounted(fetchDashboard);
</script>

<style scoped>
input[type="date"] {
  cursor: pointer;
}
</style>
