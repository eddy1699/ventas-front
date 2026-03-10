<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold">Mesas</h1>
        <p class="text-xs text-foreground/50 mt-0.5">Gestión de mesas del local</p>
      </div>
      <button
        @click="openModal(null)"
        class="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
      >
        + Nueva Mesa
      </button>
    </div>

    <!-- Leyenda -->
    <div class="flex gap-4 text-xs text-foreground/60">
      <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-green-500"></span> Disponible</span>
      <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> Ocupada</span>
      <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Reservada</span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <div v-for="i in 6" :key="i" class="rounded-xl border-2 border-border p-4 animate-pulse space-y-2">
        <div class="h-10 bg-border rounded w-1/2"></div>
        <div class="h-3 bg-border rounded w-2/3"></div>
        <div class="h-5 bg-border rounded-full w-1/2 mt-2"></div>
      </div>
    </div>

    <!-- Grid de mesas -->
    <div v-if="!loading && tables.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <div
        v-for="table in tables"
        :key="table.id"
        @click="goToTable(table)"
        class="relative rounded-xl border-2 p-4 cursor-pointer transition active:scale-95 select-none"
        :class="tableCardClass(table.status)"
      >
        <button
          @click.stop="openModal(table)"
          class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-foreground/30 hover:text-foreground/70 transition rounded-lg hover:bg-black/5"
        >✏️</button>

        <div class="text-4xl font-bold mb-1">{{ table.number }}</div>
        <div v-if="table.name" class="text-xs font-medium truncate mb-1">{{ table.name }}</div>
        <div class="text-xs text-foreground/60 mb-2">{{ table.capacity }} personas</div>

        <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="tableBadgeClass(table.status)">
          {{ table.status }}
        </span>

        <div v-if="table.status === 'ocupada' && comandaTotals[table.id]" class="mt-2 text-sm font-bold">
          S/ {{ comandaTotals[table.id].toFixed(2) }}
        </div>
      </div>
    </div>

    <div v-if="!loading && !tables.length" class="text-center py-16 text-foreground/40">
      <div class="text-5xl mb-3">🪑</div>
      <p class="text-sm">No hay mesas registradas. Crea la primera.</p>
    </div>

    <TableModal
      v-if="showModal"
      :table="editingTable"
      @close="showModal = false"
      @saved="onTableSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/api/axios";
import TableModal from "@/components/TableModal.vue";

const router = useRouter();
const tables = ref([]);
const comandaTotals = ref({});
const showModal = ref(false);
const editingTable = ref(null);
const loading = ref(false);

onMounted(fetchTables);

async function fetchTables() {
  loading.value = true;
  try {
    const { data } = await api.get("/tables");
    tables.value = data;
    const ocupadas = data.filter((t) => t.status === "ocupada");
    for (const t of ocupadas) {
      try {
        const { data: comanda } = await api.get(`/comandas/table/${t.id}`);
        if (comanda?.comanda_items) {
          const total = comanda.comanda_items.reduce((acc, i) => acc + Number(i.subtotal), 0);
          comandaTotals.value[t.id] = total;
        }
      } catch { /* ignorar */ }
    }
  } finally {
    loading.value = false;
  }
}

function tableCardClass(status) {
  if (status === "disponible") return "border-green-400 bg-green-50 dark:bg-green-500/10 dark:border-green-500/50";
  if (status === "ocupada") return "border-red-400 bg-red-50 dark:bg-red-500/10 dark:border-red-500/50";
  return "border-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 dark:border-yellow-500/50";
}

function tableBadgeClass(status) {
  if (status === "disponible") return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300";
  if (status === "ocupada") return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";
  return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300";
}

function goToTable(table) { router.push(`/tables/${table.id}`); }
function openModal(table) { editingTable.value = table; showModal.value = true; }
function onTableSaved() { showModal.value = false; fetchTables(); }
</script>
