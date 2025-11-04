<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-6rem)]">
    <!-- Lista de productos -->
    <div class="lg:col-span-2 flex flex-col bg-card rounded-xl border border-border overflow-hidden">
      <div class="p-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold">Seleccionar productos</h2>
        <input
          v-model="search"
          placeholder="Buscar..."
          class="px-3 py-1 rounded-md border border-border bg-background text-xs"
        />
      </div>

      <!-- Productos -->
      <div class="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          v-for="p in filteredProducts"
          :key="p.id"
          @click="addToCart(p)"
          class="bg-background rounded-lg border border-border p-3 text-left hover:border-primary transition flex flex-col items-center"
        >
          <img
            v-if="p.image"
            :src="p.image"
            alt="Producto"
            class="w-20 h-20 object-cover rounded-md border border-border mb-2"
          />
          <div
            v-else
            class="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-400 border border-border mb-2"
          >
            Sin imagen
          </div>
          <p class="font-medium text-sm text-center truncate">{{ p.name }}</p>
          <p class="text-xs text-foreground/50 text-center">{{ p.category || '---' }}</p>
          <p class="text-sm font-semibold mt-2 text-center">S/ {{ p.price }}</p>
        </button>
      </div>
    </div>

    <!-- Carrito -->
    <div class="bg-card rounded-xl border border-border flex flex-col">
      <div class="p-4 border-b border-border flex items-center justify-between">
        <h2 class="text-lg font-semibold">Carrito</h2>
        <span class="text-xs text-foreground/60">{{ cart.length }} items</span>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-for="item in cart" :key="item.id" class="flex items-center justify-between gap-2">
          <div>
            <p class="text-sm font-medium">{{ item.name }}</p>
            <p class="text-xs text-foreground/50">
              S/ {{ item.price }} x {{ item.quantity }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="number"
              min="1"
              v-model.number="item.quantity"
              @change="updateTotals"
              class="w-14 px-2 py-1 rounded-md border border-border bg-background text-xs"
            />
            <p class="w-16 text-right text-sm font-semibold">
              S/ {{ (item.price * item.quantity).toFixed(2) }}
            </p>
            <button @click="removeFromCart(item)" class="text-red-500 text-sm">✕</button>
          </div>
        </div>
      </div>

      <!-- Total -->
      <div class="p-4 border-t border-border space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span>Total:</span>
          <span class="text-lg font-bold">S/ {{ total.toFixed(2) }}</span>
        </div>
        <button
          @click="confirmSale"
          :disabled="loading || !cart.length"
          class="w-full py-2 rounded-md bg-primary text-white hover:opacity-90 disabled:opacity-50"
        >
          {{ loading ? "Guardando..." : "Confirmar venta" }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de datos del cliente -->
  <div
    v-if="showReceiptModal"
    class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
  >
    <div class="w-full max-w-md bg-background rounded-xl border border-border p-6">
      <h2 class="text-lg font-semibold mb-4">Generar boleta</h2>
      <form @submit.prevent="generateReceipt" class="space-y-3">
        <input type="hidden" v-model="receiptForm.saleId" />

        <div>
          <label class="text-xs block mb-1">Cliente</label>
          <input
            v-model="receiptForm.client_name"
            placeholder="Nombre del cliente"
            class="w-full px-3 py-2 rounded-md border border-border bg-background"
            required
          />
        </div>

        <div>
          <label class="text-xs block mb-1">Documento</label>
          <input
            v-model="receiptForm.client_doc"
            placeholder="DNI / RUC (opcional)"
            class="w-full px-3 py-2 rounded-md border border-border bg-background"
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="showReceiptModal = false"
            class="px-4 py-2 rounded-md border border-border text-sm"
          >
            Cancelar
          </button>
          <button class="px-4 py-2 rounded-md bg-primary text-white text-sm">
            Generar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/api/axios";
import Swal from "sweetalert2";

const products = ref([]);
const cart = ref([]);
const search = ref("");
const loading = ref(false);
const total = ref(0);
const saleId = ref(null);

const showReceiptModal = ref(false);
const receiptForm = ref({
  client_name: "",
  client_doc: "",
});

const fetchProducts = async () => {
  const { data } = await api.get("/products");
  products.value = data;
};

const filteredProducts = computed(() => {
  if (!search.value) return products.value;
  return products.value.filter((p) =>
    p.name.toLowerCase().includes(search.value.toLowerCase())
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

    // 🔹 Mostrar opciones
    Swal.fire({
      title: "✅ Venta registrada",
      text: `Total S/ ${data.total}`,
      icon: "success",
      showDenyButton: true,
      // showCancelButton: true,
      confirmButtonText: "Generar boleta manual",
      denyButtonText: "Boleta automática y guardar",
      // cancelButtonText: "Solo guardar",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        showReceiptModal.value = true;
      } else if (result.isDenied) {
        // Boleta automática
        await api.post("/receipts", {
          sale_id: data.saleId,
          client_name: "Cliente General",
          client_doc: "-",
        });
        // Swal.fire("📄 Boleta automática", "Boleta generada correctamente", "success");
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
    const payload = {
      sale_id: receiptForm.value.saleId,
      client_name: receiptForm.value.client_name,
      client_doc: receiptForm.value.client_doc || "-",
    };

    await api.post("/receipts", payload);
    Swal.fire("✅ Boleta generada", "Boleta creada correctamente", "success");
    showReceiptModal.value = false;
    cart.value = [];
    updateTotals();
  } catch (error) {
    console.error("❌ Error generando boleta:", error);
    Swal.fire("Error", "No se pudo generar la boleta correctamente", "error");
  }
};

onMounted(fetchProducts);
</script>
