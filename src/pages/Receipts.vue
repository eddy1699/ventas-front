<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Boletas</h1>
      <button @click="openModal" class="bg-primary text-white text-sm px-4 py-2 rounded-md">
        + Generar boleta
      </button>
    </div>
    <div class="bg-card border border-border rounded-xl overflow-hidden">
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
    <div v-if="showModal" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
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
          <div>
            <label class="text-xs block mb-1">Número (opcional)</label>
            <input v-model="form.number" class="w-full px-3 py-2 rounded-md border border-border bg-background" />
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
const form = ref({ sale_id: "", client_name: "", client_doc: "", number: "" });
const fetchReceipts = async () => {
  const { data } = await api.get("/receipts");
  receipts.value = data;
};
const openModal = () => (showModal.value = true);
const closeModal = () => (showModal.value = false);
const generateReceipt = async () => {
  try {
    const payload = {
      sale_id: form.value.sale_id,
      client_name: form.value.client_name,
      client_doc: form.value.client_doc || "-",
    };

    // 🧾 Llamada al backend pidiendo blob
    const response = await api.post("/receipts", payload, {
      responseType: "blob", // 👈 necesario para archivos binarios
      headers: { "Accept": "application/pdf" },
    });

    // 🧱 Crear un Blob a partir de la respuesta
    const blob = new Blob([response.data], { type: "application/pdf" });
    const pdfUrl = window.URL.createObjectURL(blob);

    // 📥 Crear link temporal para descarga
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `boleta_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();

    // 🧹 Limpieza
    document.body.removeChild(link);
    window.URL.revokeObjectURL(pdfUrl);

    Swal.fire("✅ Boleta generada", "El PDF se descargó correctamente", "success");

    showModal.value = false;
    fetchReceipts();
  } catch (e) {
    console.error("❌ Error generando boleta:", e);

    // Si el backend devuelve JSON de error, lo convertimos a texto
    if (e.response?.data instanceof Blob) {
      const text = await e.response.data.text();
      console.error("Respuesta del servidor:", text);
    }

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

