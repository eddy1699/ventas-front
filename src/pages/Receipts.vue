<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Boletas</h1>
      <button @click="openModal" class="bg-primary text-white text-sm px-4 py-2.5 rounded-xl font-semibold">
        + Generar
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="bg-card border border-border rounded-xl p-4 animate-pulse space-y-2">
        <div class="flex justify-between">
          <div class="h-3 bg-border rounded w-1/3"></div>
          <div class="h-3 bg-border rounded w-1/5"></div>
        </div>
        <div class="h-3 bg-border rounded w-1/4"></div>
      </div>
    </div>

    <!-- Cards -->
    <div v-if="!loading" class="space-y-2">
      <div v-for="r in receipts" :key="r.id" class="bg-card border border-border rounded-xl p-4 space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-sm">{{ r.client_name }}</span>
          <span class="text-base font-bold text-primary">S/ {{ r.total }}</span>
        </div>
        <div class="flex items-center justify-between text-xs text-foreground/50">
          <span>{{ r.number || '—' }}</span>
          <span>{{ formatDate(r.issue_date) }}</span>
        </div>
        <div v-if="r.pdf_url" class="flex gap-3 pt-1">
          <button @click="shareReceipt(r)" class="text-sm text-primary font-semibold py-1">Enviar al cliente</button>
          <button @click="copyLink(r.pdf_url)" class="text-sm text-foreground/50 py-1">Copiar link</button>
        </div>
      </div>
      <div v-if="!receipts.length" class="text-center text-sm text-foreground/40 py-12">
        <div class="text-4xl mb-2">🧾</div>
        <p>No hay boletas aún</p>
      </div>
    </div>

    <!-- Modal generar boleta -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div class="w-full sm:max-w-md bg-card sm:rounded-2xl rounded-t-2xl border border-border shadow-xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Generar boleta</h2>
          <button @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background/60 text-foreground/50">✕</button>
        </div>
        <form @submit.prevent="generateReceipt" class="space-y-3">
          <div>
            <label class="text-xs font-medium text-foreground/60 block mb-1.5">ID de venta</label>
            <input v-model="form.sale_id" type="number" required :disabled="saving"
              class="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50" />
          </div>
          <div>
            <label class="text-xs font-medium text-foreground/60 block mb-1.5">Cliente (opcional)</label>
            <input v-model="form.client_name" :disabled="saving" placeholder="Cliente General"
              class="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50" />
          </div>
          <div>
            <label class="text-xs font-medium text-foreground/60 block mb-1.5">Documento (opcional)</label>
            <input v-model="form.client_doc" :disabled="saving" placeholder="DNI / RUC"
              class="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50" />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeModal" :disabled="saving"
              class="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-background/60 transition disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" :disabled="saving"
              class="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-70 flex items-center justify-center gap-2">
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

    <!-- Modal resultado -->
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

const formatDate = (d) => (d ? dayjs(d).format("DD/MM/YY HH:mm") : "—");

const copyLink = async (url) => {
  if (!url) return;
  await navigator.clipboard.writeText(url);
  info("Link copiado al portapapeles");
};

onMounted(fetchReceipts);
</script>
