<template>
  <!-- Mobile: tab switcher -->
  <div class="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
    <!-- Tab bar (mobile only) -->
    <div class="flex md:hidden border-b border-border mb-0">
      <button
        @click="activeTab = 'products'"
        class="flex-1 py-2 text-sm font-medium transition"
        :class="activeTab === 'products' ? 'border-b-2 border-primary text-primary' : 'text-foreground/50'"
      >Productos</button>
      <button
        @click="activeTab = 'cart'"
        class="flex-1 py-2 text-sm font-medium transition relative"
        :class="activeTab === 'cart' ? 'border-b-2 border-primary text-primary' : 'text-foreground/50'"
      >
        Carrito
        <span v-if="cart.length" class="ml-1 bg-primary text-white text-[10px] rounded-full px-1.5 py-0.5">{{ cart.length }}</span>
      </button>
    </div>

    <!-- Desktop: side by side | Mobile: tabs -->
    <div class="flex-1 flex gap-4 overflow-hidden">
      <!-- Productos panel -->
      <div
        class="flex flex-col bg-card rounded-xl border border-border overflow-hidden"
        :class="activeTab === 'products' ? 'flex' : 'hidden md:flex'"
        style="flex: 2"
      >
        <div class="p-4 flex items-center justify-between border-b border-border shrink-0">
          <h2 class="text-base font-semibold">Productos</h2>
          <input
            v-model="search"
            placeholder="Buscar..."
            class="px-3 py-1 rounded-md border border-border bg-background text-xs w-32"
          />
        </div>
        <div class="flex-1 overflow-y-auto p-3 grid grid-cols-2 md:grid-cols-3 gap-2">
          <button
            v-for="p in filteredProducts"
            :key="p.id"
            @click="addToCart(p)"
            class="bg-background rounded-xl border border-border p-3 text-left hover:border-primary transition flex flex-col items-center gap-1"
          >
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
      <div
        class="flex flex-col bg-card rounded-xl border border-border overflow-hidden"
        :class="activeTab === 'cart' ? 'flex' : 'hidden md:flex'"
        style="flex: 1; min-width: 0"
      >
        <div class="p-4 border-b border-border flex items-center justify-between shrink-0">
          <h2 class="text-base font-semibold">Carrito</h2>
          <span class="text-xs text-foreground/60">{{ cart.length }} items</span>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-3">
          <div v-if="!cart.length" class="flex items-center justify-center h-full text-sm text-foreground/40">
            Agrega productos
          </div>
          <div v-for="item in cart" :key="item.id" class="flex items-center justify-between gap-2">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ item.name }}</p>
              <p class="text-xs text-foreground/50">S/ {{ item.price }}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button @click="item.quantity > 1 ? (item.quantity--, updateTotals()) : removeFromCart(item)" class="w-6 h-6 rounded border border-border text-sm flex items-center justify-center hover:bg-background/70">−</button>
              <span class="w-6 text-center text-sm font-medium">{{ item.quantity }}</span>
              <button @click="item.quantity++; updateTotals()" class="w-6 h-6 rounded border border-border text-sm flex items-center justify-center hover:bg-background/70">+</button>
              <span class="w-14 text-right text-sm font-semibold">S/ {{ (item.price * item.quantity).toFixed(2) }}</span>
              <button @click="removeFromCart(item)" class="text-red-400 text-sm ml-1">✕</button>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-border space-y-2 shrink-0">
          <div class="flex items-center justify-between text-sm">
            <span>Total:</span>
            <span class="text-lg font-bold">S/ {{ total.toFixed(2) }}</span>
          </div>
          <button
            @click="confirmSale"
            :disabled="loading || !cart.length"
            class="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 text-sm transition"
          >
            {{ loading ? "Guardando..." : "Confirmar venta" }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal boleta -->
  <div v-if="showReceiptModal" class="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-4">
    <div class="w-full max-w-md bg-background rounded-xl border border-border p-6">
      <h2 class="text-lg font-semibold mb-4">Generar boleta</h2>
      <form @submit.prevent="generateReceipt" class="space-y-3">
        <input type="hidden" v-model="receiptForm.saleId" />
        <div>
          <label class="text-xs block mb-1">Cliente</label>
          <input v-model="receiptForm.client_name" placeholder="Nombre del cliente" class="w-full px-3 py-2 rounded-md border border-border bg-background" required />
        </div>
        <div>
          <label class="text-xs block mb-1">Documento</label>
          <input v-model="receiptForm.client_doc" placeholder="DNI / RUC (opcional)" class="w-full px-3 py-2 rounded-md border border-border bg-background" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" @click="showReceiptModal = false" class="px-4 py-2 rounded-md border border-border text-sm">Cancelar</button>
          <button class="px-4 py-2 rounded-md bg-primary text-white text-sm">Generar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { categoryEmoji } from "@/utils/categoryEmoji.js";

const activeTab = ref("products");
const products = ref([]);
const cart = ref([]);
const search = ref("");
const loading = ref(false);
const total = ref(0);
const saleId = ref(null);
const showReceiptModal = ref(false);
const receiptForm = ref({ client_name: "", client_doc: "" });

const fetchProducts = async () => {
  const { data } = await api.get("/products");
  products.value = data;
};

const filteredProducts = computed(() => {
  const q = search.value.toLowerCase();
  return products.value.filter(
    (p) => p.status === 1 && (!q || p.name.toLowerCase().includes(q))
  );
});

const addToCart = (product) => {
  const found = cart.value.find((c) => c.id === product.id);
  if (found) found.quantity += 1;
  else
    cart.value.push({
      id: product.id,
      product_id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
    });
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
    const items = cart.value.map((it) => ({
      product_id: it.product_id,
      quantity: it.quantity,
      price: it.price,
    }));
    const { data } = await api.post("/sales", { items });
    saleId.value = data.saleId;
    receiptForm.value.saleId = data.saleId;
    loading.value = false;

    Swal.fire({
      title: "Venta registrada",
      text: `Total S/ ${data.total}`,
      icon: "success",
      showDenyButton: true,
      confirmButtonText: "Generar boleta manual",
      denyButtonText: "Boleta automática",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        showReceiptModal.value = true;
      } else if (result.isDenied) {
        await api.post("/receipts", {
          sale_id: data.saleId,
          client_name: "Cliente General",
          client_doc: "-",
        });
        cart.value = [];
        updateTotals();
      } else {
        cart.value = [];
        updateTotals();
      }
    });
  } catch (e) {
    loading.value = false;
    Swal.fire("Error", e.response?.data?.error || "No se pudo registrar la venta", "error");
  }
};

const generateReceipt = async () => {
  try {
    const { data } = await api.post("/receipts", {
      sale_id: receiptForm.value.saleId,
      client_name: receiptForm.value.client_name,
      client_doc: receiptForm.value.client_doc || "-",
    });
    showReceiptModal.value = false;
    cart.value = [];
    updateTotals();
    if (data.pdf_url) window.open(data.pdf_url, "_blank");
    Swal.fire("Boleta generada", "PDF disponible en boletas", "success");
  } catch (error) {
    Swal.fire("Error", "No se pudo generar la boleta", "error");
  }
};

onMounted(fetchProducts);
</script>
