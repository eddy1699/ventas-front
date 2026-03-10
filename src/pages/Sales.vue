<template>
  <div class="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
    <!-- Tab bar (mobile only) -->
    <div class="flex md:hidden border-b border-border mb-0">
      <button @click="activeTab = 'products'" class="flex-1 py-2 text-sm font-medium transition"
        :class="activeTab === 'products' ? 'border-b-2 border-primary text-primary' : 'text-foreground/50'">Productos</button>
      <button @click="activeTab = 'cart'" class="flex-1 py-2 text-sm font-medium transition relative"
        :class="activeTab === 'cart' ? 'border-b-2 border-primary text-primary' : 'text-foreground/50'">
        Carrito
        <span v-if="cart.length" class="ml-1 bg-primary text-white text-[10px] rounded-full px-1.5 py-0.5">{{ cart.length }}</span>
      </button>
    </div>

    <div class="flex-1 flex gap-4 overflow-hidden">
      <!-- Productos panel -->
      <div class="flex flex-col bg-card rounded-xl border border-border overflow-hidden"
        :class="activeTab === 'products' ? 'flex' : 'hidden md:flex'" style="flex: 2">
        <div class="p-4 flex items-center justify-between border-b border-border shrink-0">
          <h2 class="text-base font-semibold">Productos</h2>
          <input v-model="search" placeholder="Buscar..."
            class="px-3 py-1 rounded-md border border-border bg-background text-xs w-32" />
        </div>

        <!-- Loading skeleton -->
        <div v-if="loadingProducts" class="flex-1 p-3 grid grid-cols-2 md:grid-cols-3 gap-2 content-start">
          <div v-for="i in 9" :key="i" class="bg-background rounded-xl border border-border p-3 animate-pulse space-y-2">
            <div class="w-full h-16 bg-border rounded-lg"></div>
            <div class="h-3 bg-border rounded w-3/4"></div>
            <div class="h-3 bg-border rounded w-1/3"></div>
          </div>
        </div>

        <div v-else class="flex-1 overflow-y-auto p-3 grid grid-cols-2 md:grid-cols-3 gap-2">
          <button v-for="p in filteredProducts" :key="p.id" @click="addToCart(p)"
            class="bg-background rounded-xl border border-border p-3 text-left hover:border-primary transition flex flex-col items-center gap-1">
            <div class="w-16 h-16 rounded-lg bg-card flex items-center justify-center overflow-hidden">
              <img v-if="p.image" :src="p.image" class="w-full h-full object-cover" alt="" />
              <span v-else class="text-4xl">{{ categoryEmoji(p.category) }}</span>
            </div>
            <p class="font-medium text-xs text-center leading-tight truncate w-full">{{ p.name }}</p>
            <p class="text-xs font-semibold text-primary">S/ {{ p.price }}</p>
          </button>
        </div>
      </div>

      <!-- Carrito panel -->
      <div class="flex flex-col bg-card rounded-xl border border-border overflow-hidden"
        :class="activeTab === 'cart' ? 'flex' : 'hidden md:flex'" style="flex: 1; min-width: 0">
        <div class="p-4 border-b border-border flex items-center justify-between shrink-0">
          <h2 class="text-base font-semibold">Carrito</h2>
          <span class="text-xs text-foreground/60">{{ cart.length }} items</span>
        </div>
        <div class="flex-1 overflow-y-auto p-3 space-y-3">
          <div v-if="!cart.length" class="flex items-center justify-center h-full text-sm text-foreground/40">Agrega productos</div>
          <div v-for="item in cart" :key="item.id" class="flex items-center justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ item.name }}</p>
              <p class="text-xs text-foreground/50">S/ {{ item.price }}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button @click="item.quantity > 1 ? (item.quantity--, updateTotals()) : removeFromCart(item)"
                class="w-6 h-6 rounded border border-border text-sm flex items-center justify-center hover:bg-background/70">−</button>
              <span class="w-6 text-center text-sm font-medium">{{ item.quantity }}</span>
              <button @click="item.quantity++; updateTotals()"
                class="w-6 h-6 rounded border border-border text-sm flex items-center justify-center hover:bg-background/70">+</button>
              <span class="w-14 text-right text-sm font-semibold">S/ {{ (item.price * item.quantity).toFixed(2) }}</span>
              <button @click="removeFromCart(item)" class="w-6 h-6 flex items-center justify-center text-red-400 text-sm ml-1">✕</button>
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-border space-y-2 shrink-0">
          <div class="flex items-center justify-between text-sm">
            <span>Total:</span>
            <span class="text-lg font-bold">S/ {{ total.toFixed(2) }}</span>
          </div>
          <button @click="confirmSale" :disabled="loading || !cart.length"
            class="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 text-sm transition flex items-center justify-center gap-2">
            <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ loading ? "Registrando..." : "Confirmar venta" }}
          </button>
        </div>
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
import { ref, computed, onMounted } from "vue";
import api from "@/api/axios";
import { useToast } from "@/composables/useToast";
import { categoryEmoji } from "@/utils/categoryEmoji.js";
import ReceiptResultModal from "@/components/ReceiptResultModal.vue";

const { error } = useToast();

const activeTab = ref("products");
const products = ref([]);
const cart = ref([]);
const search = ref("");
const loading = ref(false);
const loadingProducts = ref(false);
const total = ref(0);
const receiptResult = ref(null);

const fetchProducts = async () => {
  loadingProducts.value = true;
  try {
    const { data } = await api.get("/products");
    products.value = data;
  } finally {
    loadingProducts.value = false;
  }
};

const filteredProducts = computed(() => {
  const q = search.value.toLowerCase();
  return products.value.filter((p) => p.status === 1 && (!q || p.name.toLowerCase().includes(q)));
});

const addToCart = (product) => {
  const found = cart.value.find((c) => c.id === product.id);
  if (found) found.quantity += 1;
  else cart.value.push({ id: product.id, product_id: product.id, name: product.name, price: Number(product.price), quantity: 1 });
  updateTotals();
  activeTab.value = "cart";
};

const removeFromCart = (item) => {
  cart.value = cart.value.filter((c) => c.id !== item.id);
  updateTotals();
};

const updateTotals = () => {
  total.value = cart.value.reduce((acc, it) => acc + it.price * it.quantity, 0);
};

const confirmSale = async () => {
  loading.value = true;
  try {
    const items = cart.value.map((it) => ({ product_id: it.product_id, quantity: it.quantity, price: it.price }));
    const { data: sale } = await api.post("/sales", { items });
    cart.value = [];
    updateTotals();
    const { data: receipt } = await api.post("/receipts", {
      sale_id: sale.saleId,
      client_name: "Cliente General",
      client_doc: "-",
    });
    receiptResult.value = receipt;
  } catch (e) {
    error(e.response?.data?.error || "No se pudo registrar la venta");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProducts);
</script>
