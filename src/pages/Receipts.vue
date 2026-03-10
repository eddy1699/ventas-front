<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Boletas</h1>
      <button @click="openModal" class="bg-primary text-white text-sm px-4 py-2 rounded-md">
        + Generar
      </button>
    </div>

    <!-- Mobile: cards -->
    <div class="md:hidden space-y-2">
      <div
        v-for="r in receipts"
        :key="r.id"
        class="bg-card border border-border rounded-xl p-3 space-y-1"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium text-sm">{{ r.client_name }}</span>
          <span class="text-sm font-semibold text-primary">S/ {{ r.total }}</span>
        </div>
        <div class="flex items-center justify-between text-xs text-foreground/50">
          <span>{{ r.number || '—' }}</span>
          <span>{{ formatDate(r.issue_date) }}</span>
        </div>
        <div v-if="r.pdf_url" class="flex gap-2 pt-1">
          <a :href="r.pdf_url" target="_blank" class="text-xs text-primary underline">Ver PDF</a>
          <button @click="copyLink(r.pdf_url)" class="text-xs text-foreground/50">Copiar link</button>
        </div>
      </div>
      <div v-if="!receipts.length" class="text-center text-sm text-foreground/40 py-8">
        No hay boletas aún
      </div>
    </div>

    <!-- Desktop: table -->
    <div class="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-background/40 border-b border-border">
          <tr>
            <th class="p-3 text-left">Número</th>
            <th class="p-3 text-left">Cliente</th>
            <th class="p-3 text-left">Total</th>
            <th class="p-3 text-left">Fecha</th>
            <th class="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in receipts" :key="r.id" class="border-b border-border/40">
            <td class="p-3">{{ r.number || '—' }}</td>
            <td class="p-3">{{ r.client_name }}</td>
            <td class="p-3">S/ {{ r.total }}</td>
            <td class="p-3">{{ formatDate(r.issue_date) }}</td>
            <td class="p-3 text-right space-x-2">
              <a v-if="r.pdf_url" :href="r.pdf_url" target="_blank" class="text-xs text-primary">Ver PDF</a>
              <button @click="copyLink(r.pdf_url)" v-if="r.pdf_url" class="text-xs">Copiar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4">
      <div class="w-full max-w-md bg-background rounded-xl border border-border p-6">
        <h2 class="text-lg font-semibold mb-4">Generar boleta</h2>
        <form @submit.prevent="generateReceipt" class="space-y-3">
          <div>
            <label class="text-xs block mb-1">ID de venta</label>
            <input v-model="form.sale_id" type="number" class="w-full px-3 py-2 rounded-md border border-border bg-background" required />
          </div>
          <div>
            <label class="text-xs block mb-1">Cliente</label>
            <input v-model="form.client_name" class="w-full px-3 py-2 rounded-md border border-border bg-background" />
          </div>
          <div>
            <label class="text-xs block mb-1">Documento</label>
            <input v-model="form.client_doc" class="w-full px-3 py-2 rounded-md border border-border bg-background" />
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="closeModal" class="px-4 py-2 rounded-md border border-border text-sm">Cancelar</button>
            <button class="px-4 py-2 rounded-md bg-primary text-white text-sm">Generar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api/axios";
import dayjs from "dayjs";
import Swal from "sweetalert2";

const receipts = ref([]);
const showModal = ref(false);
const form = ref({ sale_id: "", client_name: "", client_doc: "" });

const fetchReceipts = async () => {
  const { data } = await api.get("/receipts");
  receipts.value = data;
};

const openModal = () => (showModal.value = true);
const closeModal = () => (showModal.value = false);

const generateReceipt = async () => {
  try {
    const { data } = await api.post("/receipts", {
      sale_id: form.value.sale_id,
      client_name: form.value.client_name,
      client_doc: form.value.client_doc || "-",
    });
    showModal.value = false;
    fetchReceipts();
    if (data.pdf_url) {
      window.open(data.pdf_url, "_blank");
    }
    Swal.fire("Boleta generada", "PDF disponible en boletas", "success");
  } catch (e) {
    Swal.fire("Error", e.response?.data?.error || "No se pudo generar la boleta", "error");
  }
};

const formatDate = (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "—");
const copyLink = async (url) => {
  if (!url) return;
  await navigator.clipboard.writeText(url);
  Swal.fire("Link copiado", "", "success");
};

onMounted(fetchReceipts);
</script>
