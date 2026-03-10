<template>
  <div class="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-64px)]">

    <!-- Header mesa -->
    <div class="px-4 py-3 border-b border-border flex items-center gap-3 shrink-0">
      <button @click="$router.push('/tables')" class="text-foreground/50 hover:text-foreground transition text-sm">
        ← Mesas
      </button>
      <div class="font-semibold text-sm">
        Mesa {{ table?.number }}
        <span v-if="table?.name" class="text-foreground/50 font-normal"> · {{ table.name }}</span>
      </div>
      <span
        class="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
        :class="comanda ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'"
      >
        {{ comanda ? "Ocupada" : "Libre" }}
      </span>
    </div>

    <!-- Mobile: tab bar -->
    <div class="flex md:hidden border-b border-border shrink-0">
      <button
        @click="activeTab = 'products'"
        class="flex-1 py-2 text-sm font-medium transition"
        :class="activeTab === 'products' ? 'border-b-2 border-primary text-primary' : 'text-foreground/50'"
      >Productos</button>
      <button
        @click="activeTab = 'comanda'"
        class="flex-1 py-2 text-sm font-medium transition relative"
        :class="activeTab === 'comanda' ? 'border-b-2 border-primary text-primary' : 'text-foreground/50'"
      >
        Comanda
        <span v-if="activeItems.length" class="ml-1 bg-primary text-white text-[10px] rounded-full px-1.5 py-0.5">{{ activeItems.length }}</span>
      </button>
    </div>

    <!-- Content: desktop side-by-side, mobile tabs -->
    <div class="flex-1 flex overflow-hidden min-h-0">

      <!-- Panel izquierdo: productos -->
      <div
        class="flex flex-col border-r border-border overflow-hidden"
        :class="activeTab === 'products' ? 'flex' : 'hidden md:flex'"
        style="flex: 1"
      >
        <!-- Buscador -->
        <div class="px-3 py-2 border-b border-border shrink-0">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar producto..."
            class="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <!-- Grid de productos: skeleton -->
        <div v-if="loadingPage" class="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 content-start">
          <div v-for="i in 12" :key="i" class="rounded-xl border border-border bg-card p-3 animate-pulse space-y-2">
            <div class="w-full h-16 bg-border rounded-lg"></div>
            <div class="h-3 bg-border rounded w-3/4"></div>
            <div class="h-3 bg-border rounded w-1/3"></div>
          </div>
        </div>

        <!-- Grid de productos -->
        <div v-else class="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 content-start">
          <button
            v-for="p in filteredProducts"
            :key="p.id"
            @click="addItem(p)"
            :disabled="addingId === p.id"
            class="flex flex-col items-start gap-1 p-3 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition text-left disabled:opacity-50"
          >
            <div class="w-full h-16 bg-background rounded-lg flex items-center justify-center overflow-hidden mb-1">
              <img v-if="p.image" :src="p.image" class="w-full h-full object-cover" alt="" />
              <span v-else class="text-3xl">{{ categoryEmoji(p.category) }}</span>
            </div>
            <span class="text-xs font-medium leading-tight">{{ p.name }}</span>
            <span class="text-xs text-primary font-semibold">S/ {{ Number(p.price).toFixed(2) }}</span>
          </button>
        </div>
      </div>

      <!-- Panel derecho: comanda -->
      <div
        class="flex flex-col bg-card overflow-hidden"
        :class="activeTab === 'comanda' ? 'flex' : 'hidden md:flex'"
        style="width: 100%; max-width: 320px; flex-shrink: 0"
      >
        <!-- Sin comanda -->
        <div v-if="!comanda" class="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div class="text-4xl">🪑</div>
          <p class="text-sm text-foreground/50">Mesa libre. Agrega un producto para abrir la comanda.</p>
        </div>

        <!-- Ítems -->
        <div v-else class="flex-1 overflow-y-auto divide-y divide-border">
          <div v-for="item in activeItems" :key="item.id" class="px-3 py-3 space-y-1">
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 text-sm font-medium leading-tight">{{ item.product.name }}</div>
              <button type="button" @click="removeItem(item)" class="w-7 h-7 flex items-center justify-center rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition text-sm">✕</button>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1 border border-border rounded-lg">
                <button @click="changeQty(item, -1)" class="px-2 py-0.5 text-sm hover:bg-background/70 rounded-l-lg transition">−</button>
                <span class="px-2 text-sm font-medium min-w-[24px] text-center">{{ item.quantity }}</span>
                <button @click="changeQty(item, 1)" class="px-2 py-0.5 text-sm hover:bg-background/70 rounded-r-lg transition">+</button>
              </div>
              <span class="text-xs text-foreground/60 ml-auto">S/ {{ Number(item.subtotal).toFixed(2) }}</span>
            </div>
            <input
              v-model="item._note"
              @blur="updateNote(item)"
              type="text"
              placeholder="Nota (sin cebolla...)"
              class="w-full text-xs border border-border/50 rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div v-if="!activeItems.length" class="p-4 text-center text-sm text-foreground/40">
            La comanda está vacía
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-border p-4 space-y-3 shrink-0">
          <div class="flex justify-between items-center font-semibold">
            <span class="text-sm">Total</span>
            <span class="text-lg">S/ {{ total.toFixed(2) }}</span>
          </div>
          <button
            v-if="comanda && activeItems.length"
            @click="closeModal.show = true"
            :disabled="closing"
            class="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {{ closing ? "Cerrando..." : "Cerrar Mesa" }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal cerrar mesa -->
  <div v-if="closeModal.show" class="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
    <div class="w-full max-w-sm bg-card rounded-2xl border border-border shadow-xl p-6 space-y-4">
      <h2 class="font-semibold text-base">Cerrar Mesa {{ table?.number }}</h2>

      <!-- Método de pago -->
      <div class="space-y-1.5">
        <p class="text-xs font-medium text-foreground/60">Método de pago</p>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="m in ['efectivo', 'tarjeta', 'otro']"
            :key="m"
            @click="closeModal.payment = m"
            class="py-2 rounded-lg border text-sm font-medium capitalize transition"
            :class="closeModal.payment === m
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border hover:bg-background/60'"
          >{{ m }}</button>
        </div>
      </div>

      <!-- Datos cliente -->
      <div class="space-y-2">
        <p class="text-xs font-medium text-foreground/60">Datos para la boleta <span class="font-normal">(opcional)</span></p>
        <input
          v-model="closeModal.client_name"
          placeholder="Nombre del cliente"
          class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          v-model="closeModal.client_doc"
          placeholder="DNI / RUC"
          class="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <!-- Total -->
      <div class="flex justify-between items-center py-2 border-t border-border">
        <span class="text-sm text-foreground/60">Total a cobrar</span>
        <span class="font-bold text-lg">S/ {{ total.toFixed(2) }}</span>
      </div>

      <!-- Acciones -->
      <div class="flex gap-2">
        <button
          @click="closeModal.show = false"
          :disabled="closing"
          class="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-background/60 transition disabled:opacity-50"
        >Cancelar</button>
        <button
          @click="confirmClose"
          :disabled="closing || !closeModal.payment"
          class="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg v-if="closing" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          {{ closing ? "Cerrando..." : "Cerrar mesa" }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal resultado boleta -->
  <ReceiptResultModal
    v-if="receiptResult"
    :pdf-url="receiptResult.pdf_url"
    :total="receiptResult.total"
    :receipt-id="receiptResult.id"
    @close="onReceiptClose"
  />
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/api/axios";
import { categoryEmoji } from "@/utils/categoryEmoji.js";
import { useToast } from "@/composables/useToast";
import ReceiptResultModal from "@/components/ReceiptResultModal.vue";

const { error: toastError } = useToast();
const route = useRoute();
const router = useRouter();
const tableId = route.params.tableId;
const activeTab = ref("products");

const table = ref(null);
const comanda = ref(null);
const products = ref([]);
const search = ref("");
const addingId = ref(null);
const closing = ref(false);
const loadingPage = ref(false);
const receiptResult = ref(null);

const closeModal = reactive({
  show: false,
  payment: "",
  client_name: "",
  client_doc: "",
});

const activeItems = computed(() =>
  (comanda.value?.comanda_items || [])
    .filter((i) => i.status !== "cancelado")
    .map((i) => ({ ...i, _note: i.notes || "" }))
);

const filteredProducts = computed(() => {
  const q = search.value.toLowerCase();
  return products.value.filter(
    (p) => p.status === 1 && (!q || p.name.toLowerCase().includes(q))
  );
});

const total = computed(() =>
  activeItems.value.reduce((acc, i) => acc + Number(i.subtotal), 0)
);

onMounted(async () => {
  loadingPage.value = true;
  try {
    const [tablesRes, productsRes] = await Promise.all([
      api.get("/tables"),
      api.get("/products"),
    ]);
    table.value = tablesRes.data.find((t) => t.id == tableId);
    products.value = productsRes.data;
    await fetchComanda();
  } finally {
    loadingPage.value = false;
  }
});

async function fetchComanda() {
  const { data } = await api.get(`/comandas/table/${tableId}`);
  comanda.value = data;
}

async function addItem(product) {
  addingId.value = product.id;
  try {
    if (!comanda.value) {
      const { data } = await api.post("/comandas", { table_id: tableId });
      comanda.value = { ...data, comanda_items: [] };
    }
    const { data: item } = await api.post(`/comandas/${comanda.value.id}/items`, {
      product_id: product.id,
      quantity: 1,
      notes: null,
    });
    comanda.value.comanda_items.push(item);
    activeTab.value = "comanda";
  } catch (e) {
    toastError(e.response?.data?.error || "Error agregando ítem");
  } finally {
    addingId.value = null;
  }
}

async function changeQty(item, delta) {
  const newQty = item.quantity + delta;
  if (newQty < 1) return removeItem(item);
  try {
    await api.put(`/comandas/${comanda.value.id}/items/${item.id}`, {
      quantity: newQty,
      notes: item.notes,
    });
    await fetchComanda();
  } catch (e) {
    toastError(e.response?.data?.error || "Error actualizando ítem");
  }
}

async function updateNote(item) {
  if (item._note === (item.notes || "")) return;
  try {
    await api.put(`/comandas/${comanda.value.id}/items/${item.id}`, {
      quantity: item.quantity,
      notes: item._note || null,
    });
    await fetchComanda();
  } catch {
    // silencioso
  }
}

async function removeItem(item) {
  try {
    await api.delete(`/comandas/${comanda.value.id}/items/${item.id}`);
    await fetchComanda();
  } catch (e) {
    toastError(e.response?.data?.error || "Error eliminando ítem");
  }
}

async function confirmClose() {
  closing.value = true;
  try {
    const { data } = await api.post(`/comandas/${comanda.value.id}/close`, {
      payment_method: closeModal.payment,
      generate_receipt: true,
      client_name: closeModal.client_name || null,
      client_doc: closeModal.client_doc || null,
    });
    closeModal.show = false;
    receiptResult.value = data;
  } catch (e) {
    toastError(e.response?.data?.error || "Error cerrando mesa");
  } finally {
    closing.value = false;
  }
}

function onReceiptClose() {
  receiptResult.value = null;
  router.push("/tables");
}
</script>
