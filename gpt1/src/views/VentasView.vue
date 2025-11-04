<template>
  <section>
    <h2 class="text-lg font-semibold text-slate-800 mb-4">Productos</h2>

    <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="p in products"
        :key="p.id"
        class="bg-white rounded-xl shadow p-3 flex flex-col"
      >
        <!-- Imagen -->
        <div
          class="aspect-video bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center mb-3"
        >
          <img
            v-if="p.image"
            :src="p.image"
            alt="Producto"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-slate-400 text-xs">Sin imagen</span>
        </div>

        <!-- Info -->
        <div class="flex-1">
          <p class="text-slate-800 font-semibold leading-tight">{{ p.name }}</p>
          <p class="text-slate-500 text-xs capitalize">{{ p.category }}</p>
        </div>

        <!-- Acciones -->
        <div class="mt-2 flex items-center justify-between">
          <span class="text-slate-900 font-bold text-lg">S/ {{ p.price }}</span>

          <div class="flex gap-2">
            <button
              @click="addQuickSale(p)"
              class="text-xs bg-green-600 hover:bg-green-700 text-white font-medium rounded-md px-3 py-1"
            >
              Vender +
            </button>
            <button
              @click="removeSale(p.id)"
              class="text-xs bg-red-600 hover:bg-red-700 text-white font-medium rounded-md px-3 py-1"
            >
              Anular
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import { useToast } from "vue-toast-notification";
import apiURL from "../url.js";

const backendURL = apiURL;
const toast = useToast();
const products = ref([]);

// === Obtener productos ===
async function fetchProducts() {
  try {
    const token = localStorage.getItem("token");
    const { data } = await axios.get(`${backendURL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    products.value = data;
  } catch (err) {
    console.error("❌ Error al obtener productos:", err);
  }
}

// === Registrar venta rápida ===
async function addQuickSale(p) {
  try {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Sesión expirada. Inicia sesión nuevamente.");

    const body = {
      items: [
        {
          product_id: p.id,
          quantity: 1,
          price: Number(p.price),
        },
      ],
    };

    await axios.post(`${backendURL}/api/sales`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success(`${p.name} vendido correctamente ✅`, {
      position: "bottom-right",
      duration: 2500,
    });
  } catch (err) {
    console.error("❌ Error al registrar venta:", err);
    toast.error("Error al registrar la venta ❌", {
      position: "bottom-right",
      duration: 3000,
    });
  }
}

// === Anular venta ===
async function removeSale(id) {
  const confirmacion = await Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción anulará la venta y no se podrá revertir.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, anular venta",
    cancelButtonText: "Cancelar",
  });

  if (!confirmacion.isConfirmed) return;

  try {
    const token = localStorage.getItem("token");
    if (!token)
      return Swal.fire("Error", "Sesión expirada. Inicia sesión nuevamente.", "error");

    const res = await axios.delete(`${backendURL}/api/sales/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await Swal.fire({
      icon: "success",
      title: "Venta anulada",
      text: res.data.message || "Venta anulada correctamente.",
      timer: 2000,
      showConfirmButton: false,
    });

    // Refrescar la vista
    await fetchProducts();
  } catch (err) {
    console.error("❌ Error anulando venta:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text:
        err.response?.data?.error ||
        err.message ||
        "No se pudo anular la venta. Intenta nuevamente.",
    });
  }
}

// === Inicialización ===
onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
button {
  transition: 0.2s ease;
}
</style>
