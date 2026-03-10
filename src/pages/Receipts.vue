<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Boletas</h1>
      <button @click="openModal" class="bg-primary text-white text-sm px-4 py-2 rounded-md">
        + Generar
      </button>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div class="md:hidden space-y-2">
        <div v-for="i in 5" :key="i" class="bg-card border border-border rounded-xl p-3 animate-pulse space-y-2">
          <div class="flex justify-between"><div class="h-3 bg-border rounded w-1/3"></div><div class="h-3 bg-border rounded w-1/5"></div></div>
          <div class="h-3 bg-border rounded w-1/4"></div>
        </div>
      </div>
      <div class="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
        <div v-for="i in 5" :key="i" class="p-3 border-b border-border/40 flex gap-4 animate-pulse">
          <div class="h-3 bg-border rounded w-1/6"></div>
          <div class="h-3 bg-border rounded w-1/4"></div>
          <div class="h-3 bg-border rounded w-1/8"></div>
        </div>
      </div>
    </template>

    <!-- Mobile: cards -->
    <div v-if="!loading" class="md:hidden space-y-2">
      <div v-for="r in receipts" :key="r.id" class="bg-card border border-border rounded-xl p-3 space-y-1">
        <div class="flex items-center justify-between">
          <span class="font-medium text-sm">{{ r.client_name }}</span>
          <span class="text-sm font-semibold text-primary">S/ {{ r.total }}</span>
        </div>
        <div class="flex items-center justify-between text-xs text-foreground/50">
          <span>{{ r.number || '—' }}</span>
          <span>{{ formatDate(r.issue_date) }}</span>
        </div>
        <div v-if="r.pdf_url" class="flex gap-3 pt-1">
          <button @click="shareReceipt(r)" class="text-xs text-primary font-medium">Enviar al cliente</button>
          <button @click="copyLink(r.pdf_url)" class="text-xs text-foreground/50">Copiar link</button>
        </div>
      </div>
      <div v-if="!receipts.length" class="text-center text-sm text-foreground/40 py-8">No hay boletas aún</div>
    </div>

    <!-- Desktop: table -->
    <div v-if="!loading" class="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
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
            <td class="p-3 text-right space-x-3">
              <button v-if="r.pdf_url" @click="shareReceipt(r)" class="text-xs text-primary font-medium">Enviar</button>
              <button v-if="r.pdf_url" @click="copyLink(r.pdf_url)" class="text-xs text-foreground/50">Copiar</button>
            </td>
          </tr>
          <tr v-if="!receipts.length">
            <td colspan="5" class="p-6 text-center text-foreground/40 text-sm">No hay boletas aún</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal generar boleta -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div class="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl p-6 space-y-4">
        <h2 class="text-lg font-semibold">Generar boleta</h2>
        <form @submit.prevent="generateReceipt" class="space-y-3">
          <div>
            <label class="text-xs text-foreground/60 block mb-1">ID de venta</label>
            <input v-model="form.sale_id" type="number" required :disabled="saving"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
          </div>
          <div>
            <label class="text-xs text-foreground/60 block mb-1">Cliente (opcional)</label>
            <input v-model="form.client_name" :disabled="saving" placeholder="Cliente General"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
          </div>
          <div>
            <label class="text-xs text-foreground/60 block mb-1">Documento (opcional)</label>
            <input v-model="form.client_doc" :disabled="saving" placeholder="DNI / RUC"
              class="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
          </div>
          <div class="flex gap-2 pt-2">
            <button type="button" @click="closeModal" :disabled="saving"
              class="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-background/60 transition disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" :disabled="saving"
              class="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-70 flex items-center justify-center gap-2">
              <svg v-if="saving" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              {{ saving ? "Generando..." : "Generar" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal resultado / envío -->
    <ReceiptResultModal
      v-if="receiptResult"
      :pdf-url="receiptResult.pdf_url"
      :total="receiptResult.total"
      :receipt-id="receiptResult.id"
      @close="receiptResult = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api/axios";
import dayjs from "dayjs";
import { useToast } from "@/composables/useToast";
import ReceiptResultModal from "@/components/ReceiptResultModal.vue";

const { error, info } = useToast();

const receipts = ref([]);
const loading = ref(false);
const saving = ref(false);
const showModal = ref(false);
const form = ref({ sale_id: "", client_name: "", client_doc: "" });
const receiptResult = ref(null);

const fetchReceipts = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("/receipts");
    receipts.value = data;
  } finally {
    loading.value = false;
  }
};

const openModal = () => (showModal.value = true);
const closeModal = () => (showModal.value = false);

const generateReceipt = async () => {
  saving.value = true;
  try {
    const { data } = await api.post("/receipts", {
      sale_id: form.value.sale_id,
      client_name: form.value.client_name || "Cliente General",
      client_doc: form.value.client_doc || "-",
    });
    showModal.value = false;
    form.value = { sale_id: "", client_name: "", client_doc: "" };
    fetchReceipts();
    receiptResult.value = data;
  } catch (e) {
    error(e.response?.data?.error || "No se pudo generar la boleta");
  } finally {
    saving.value = false;
  }
};

const shareReceipt = (r) => {
  receiptResult.value = { id: r.id, pdf_url: r.pdf_url, total: r.total };
};

const formatDate = (d) => (d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "—");

const copyLink = async (url) => {
  if (!url) return;
  await navigator.clipboard.writeText(url);
  info("Link copiado al portapapeles");
};

onMounted(fetchReceipts);
</script>
