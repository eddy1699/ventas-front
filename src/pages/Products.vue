<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Productos</h1>
      <button
        @click="openModal()"
        class="bg-primary text-white px-4 py-2 rounded-md text-sm"
      >
        + Nuevo producto
      </button>
    </div>

    <div class="bg-card border border-border rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-background/40 border-b border-border">
          <tr>
            <th class="p-3 text-left">Imagen</th>
            <th class="p-3 text-left">Nombre</th>
            <th class="p-3 text-left">Categoría</th>
            <th class="p-3 text-left">Precio</th>
            <th class="p-3 text-left">Estado</th>
            <th class="p-3 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="p in products"
            :key="p.id"
            class="border-b border-border/40 hover:bg-background/40 transition"
          >
            <!-- 🖼️ Imagen -->
            <td class="p-3">
              <img
                v-if="p.image"
                :src="p.image.startsWith('http') ? p.image : `/uploads/${p.image}`"
                alt="Producto"
                class="w-12 h-12 object-cover rounded-md border border-border"
              />
              <div v-else class="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                N/A
              </div>
            </td>

            <!-- 📄 Datos -->
            <td class="p-3 font-medium">{{ p.name }}</td>
            <td class="p-3 capitalize">{{ p.category }}</td>
            <td class="p-3">S/ {{ p.price }}</td>

            <!-- 🟢 Estado -->
            <td class="p-3">
              <span
                class="px-2 py-1 text-xs rounded-full"
                :class="p.status
                  ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-200'
                  : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200'"
              >
                {{ p.status ? "Activo" : "Inactivo" }}
              </span>
            </td>

            <!-- ⚙️ Acciones -->
            <td class="p-3 text-right space-x-2">
              <button
                @click="openModal(p)"
                class="text-xs px-2 py-1 border rounded-md hover:bg-background/70 transition"
              >
                Editar
              </button>
              <button
                @click="toggleStatus(p)"
                class="text-xs px-2 py-1 border rounded-md hover:bg-background/70 transition"
              >
                Estado
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ProductModal
      v-if="showModal"
      :product="editingProduct"
      @close="closeModal"
      @saved="fetchProducts"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api/axios";
import ProductModal from "@/components/ProductModal.vue";

const products = ref([]);
const showModal = ref(false);
const editingProduct = ref(null);

const fetchProducts = async () => {
  const { data } = await api.get("/products");
  products.value = data;
};

const openModal = (p = null) => {
  editingProduct.value = p;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingProduct.value = null;
};

const toggleStatus = async (p) => {
  await api.patch(`/products/${p.id}/status`, { status: p.status ? 0 : 1 });
  fetchProducts();
};

onMounted(fetchProducts);
</script>
