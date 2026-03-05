<template>
  <div class="flex h-[calc(100vh-64px)]">

    <!-- Panel izquierdo: productos -->
    <div class="flex-1 flex flex-col border-r border-border overflow-hidden">
      <!-- Header mesa -->
      <div class="px-4 py-3 border-b border-border flex items-center gap-3">
        <button @click="$router.push('/tables')" class="text-foreground/50 hover:text-foreground transition">
          ← Mesas
        </button>
        <div class="font-semibold">
          Mesa {{ table?.number }}
          <span v-if="table?.name" class="text-foreground/50 font-normal text-sm"> · {{ table.name }}</span>
        </div>
        <span
          class="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
          :class="comanda ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'"
        >
          {{ comanda ? "Ocupada" : "Disponible" }}
        </span>
      </div>

      <!-- Buscador -->
      <div class="px-4 py-2 border-b border-border">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar producto..."
          class="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <!-- Grid de productos -->
      <div class="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 content-start">
        <button
          v-for="p in filteredProducts"
          :key="p.id"
          @click="addItem(p)"
          :disabled="addingId === p.id"
          class="flex flex-col items-start gap-1 p-3 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition text-left disabled:opacity-50"
        >
          <img v-if="p.image" :src="p.image" class="w-full h-20 object-cover rounded-lg mb-1" />
          <div v-else class="w-full h-20 bg-background rounded-lg flex items-center justify-center text-2xl mb-1">🍽️</div>
          <span class="text-xs font-medium leading-tight">{{ p.name }}</span>
          <span class="text-xs text-primary font-semibold">S/ {{ Number(p.price).toFixed(2) }}</span>
        </button>
      </div>
    </div>

    <!-- Panel derecho: comanda -->
    <div class="w-80 flex flex-col bg-card">
      <!-- Header comanda -->
      <div class="px-4 py-3 border-b border-border font-semibold text-sm">
        Comanda
      </div>

      <!-- Sin comanda abierta -->
      <div v-if="!comanda" class="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div class="text-4xl">🪑</div>
        <p class="text-sm text-foreground/50">Mesa disponible. Agrega un producto para abrir la comanda.</p>
      </div>

      <!-- Lista de ítems -->
      <div v-else class="flex-1 overflow-y-auto divide-y divide-border">
        <div
          v-for="item in activeItems"
          :key="item.id"
          class="px-3 py-3 space-y-1"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 text-sm font-medium leading-tight">{{ item.product.name }}</div>
            <button
              @click="removeItem(item)"
              class="text-red-400 hover:text-red-600 text-xs mt-0.5 transition"
            >✕</button>
          </div>

          <div class="flex items-center gap-2">
            <!-- Cantidad -->
            <div class="flex items-center gap-1 border border-border rounded-lg">
              <button @click="changeQty(item, -1)" class="px-2 py-0.5 text-sm hover:bg-background/70 rounded-l-lg transition">−</button>
              <span class="px-2 text-sm font-medium min-w-[24px] text-center">{{ item.quantity }}</span>
              <button @click="changeQty(item, 1)" class="px-2 py-0.5 text-sm hover:bg-background/70 rounded-r-lg transition">+</button>
            </div>
            <span class="text-xs text-foreground/60 ml-auto">S/ {{ Number(item.subtotal).toFixed(2) }}</span>
          </div>

          <!-- Nota -->
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

      <!-- Footer total + cerrar -->
      <div class="border-t border-border p-4 space-y-3">
        <div class="flex justify-between items-center font-semibold">
          <span class="text-sm">Total</span>
          <span class="text-lg">S/ {{ total.toFixed(2) }}</span>
        </div>
        <button
          v-if="comanda && activeItems.length"
          @click="closeMesa"
          :disabled="closing"
          class="w-full bg-primary text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          {{ closing ? "Cerrando..." : "Cerrar Mesa" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/api/axios";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();
const tableId = route.params.tableId;

const table = ref(null);
const comanda = ref(null);
const products = ref([]);
const search = ref("");
const addingId = ref(null);
const closing = ref(false);

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
  const [tablesRes, productsRes] = await Promise.all([
    api.get("/tables"),
    api.get("/products"),
  ]);
  table.value = tablesRes.data.find((t) => t.id == tableId);
  products.value = productsRes.data;
  await fetchComanda();
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
  } catch (e) {
    Swal.fire("Error", e.response?.data?.error || "Error agregando ítem", "error");
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
    Swal.fire("Error", e.response?.data?.error || "Error actualizando ítem", "error");
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
    Swal.fire("Error", e.response?.data?.error || "Error eliminando ítem", "error");
  }
}

async function closeMesa() {
  // Paso 1: método de pago
  const { value: payMethod, isDismissed: d1 } = await Swal.fire({
    title: "¿Cómo pagó el cliente?",
    icon: "question",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Efectivo",
    denyButtonText: "Tarjeta",
    cancelButtonText: "Otro",
    reverseButtons: false,
  });

  let payment_method;
  if (d1) return;
  if (payMethod === true) payment_method = "efectivo";
  else if (payMethod === false) payment_method = "tarjeta";
  else payment_method = "otro";

  // Paso 2: ¿generar boleta?
  const { isConfirmed: wantReceipt, isDismissed: d2 } = await Swal.fire({
    title: "¿Generar boleta?",
    icon: "question",
    showConfirmButton: true,
    showDenyButton: true,
    confirmButtonText: "Sí, generar",
    denyButtonText: "No, solo cerrar",
  });

  if (d2) return;

  let client_name = null;
  let client_doc = null;

  if (wantReceipt) {
    const { value: formValues, isDismissed: d3 } = await Swal.fire({
      title: "Datos del cliente",
      html: `
        <input id="swal-name" class="swal2-input" placeholder="Nombre (opcional)">
        <input id="swal-doc" class="swal2-input" placeholder="Documento (opcional)">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Generar",
      cancelButtonText: "Cancelar",
      preConfirm: () => ({
        name: document.getElementById("swal-name").value,
        doc: document.getElementById("swal-doc").value,
      }),
    });
    if (d3) return;
    client_name = formValues?.name || null;
    client_doc = formValues?.doc || null;
  }

  closing.value = true;
  try {
    const { data } = await api.post(`/comandas/${comanda.value.id}/close`, {
      payment_method,
      generate_receipt: wantReceipt,
      client_name,
      client_doc,
    });

    let html = `<p class="text-sm">Total: <strong>S/ ${Number(data.total).toFixed(2)}</strong> · ${payment_method}</p>`;
    if (data.pdf_url) {
      html += `<p class="mt-2 text-sm"><a href="${data.pdf_url}" target="_blank" class="text-blue-500 underline">Ver boleta PDF</a></p>`;
    }

    await Swal.fire({ title: "Mesa cerrada", html, icon: "success" });
    router.push("/tables");
  } catch (e) {
    Swal.fire("Error", e.response?.data?.error || "Error cerrando mesa", "error");
  } finally {
    closing.value = false;
  }
}
</script>
