<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Mesas</h1>
        <p class="text-sm text-foreground/50">Gestión de mesas del local</p>
      </div>
      <button
        @click="openModal(null)"
        class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
      >
        + Nueva Mesa
      </button>
    </div>

    <!-- Leyenda de estados -->
    <div class="flex gap-4 text-xs text-foreground/60">
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-green-500"></span> Disponible</span>
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500"></span> Ocupada</span>
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-yellow-500"></span> Reservada</span>
    </div>

    <!-- Grid de mesas -->
    <div v-if="tables.length" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div
        v-for="table in tables"
        :key="table.id"
        @click="goToTable(table)"
        class="relative rounded-xl border-2 p-4 cursor-pointer transition hover:scale-105 select-none"
        :class="tableCardClass(table.status)"
      >
        <!-- Botón editar -->
        <button
          @click.stop="openModal(table)"
          class="absolute top-2 right-2 text-foreground/30 hover:text-foreground/70 transition text-base"
          title="Editar mesa"
        >✏️</button>

        <div class="text-3xl font-bold mb-1">{{ table.number }}</div>
        <div v-if="table.name" class="text-xs font-medium truncate mb-2">{{ table.name }}</div>
        <div class="text-xs text-foreground/60 mb-2">{{ table.capacity }} personas</div>

        <span
          class="text-xs font-semibold px-2 py-0.5 rounded-full"
          :class="tableBadgeClass(table.status)"
        >
          {{ table.status }}
        </span>

        <!-- Total comanda si está ocupada -->
        <div v-if="table.status === 'ocupada' && comandaTotals[table.id]" class="mt-2 text-sm font-bold">
          S/ {{ comandaTotals[table.id].toFixed(2) }}
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 text-foreground/40">
      <div class="text-5xl mb-3">🪑</div>
      <p class="text-sm">No hay mesas registradas. Crea la primera.</p>
    </div>

    <!-- Modal crear/editar -->
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

onMounted(fetchTables);

async function fetchTables() {
  const { data } = await api.get("/tables");
  tables.value = data;

  // Cargar totales de mesas ocupadas
  const ocupadas = data.filter((t) => t.status === "ocupada");
  for (const t of ocupadas) {
    try {
      const { data: comanda } = await api.get(`/comandas/table/${t.id}`);
      if (comanda?.comanda_items) {
        const total = comanda.comanda_items.reduce((acc, i) => acc + Number(i.subtotal), 0);
        comandaTotals.value[t.id] = total;
      }
    } catch {
      // si falla, ignorar
    }
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

function goToTable(table) {
  router.push(`/tables/${table.id}`);
}

function openModal(table) {
  editingTable.value = table;
  showModal.value = true;
}

function onTableSaved() {
  showModal.value = false;
  fetchTables();
}
</script>
