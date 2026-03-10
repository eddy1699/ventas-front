<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Productos</h1>
      <button
        @click="openModal()"
        class="bg-primary text-white px-4 py-2 rounded-md text-sm"
      >
        + Nuevo
      </button>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div class="md:hidden space-y-2">
        <div v-for="i in 6" :key="i" class="bg-card border border-border rounded-xl p-3 flex items-center gap-3 animate-pulse">
          <div class="w-12 h-12 rounded-lg bg-border shrink-0"></div>
          <div class="flex-1 space-y-2"><div class="h-3 bg-border rounded w-3/4"></div><div class="h-3 bg-border rounded w-1/3"></div></div>
        </div>
      </div>
      <div class="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
        <div v-for="i in 6" :key="i" class="p-3 border-b border-border/40 flex gap-3 items-center animate-pulse">
          <div class="w-12 h-12 rounded-md bg-border shrink-0"></div>
          <div class="flex-1 space-y-2"><div class="h-3 bg-border rounded w-1/3"></div><div class="h-3 bg-border rounded w-1/4"></div></div>
        </div>
      </div>
    </template>

    <!-- Mobile: cards -->
    <div v-if="!loading" class="md:hidden space-y-2">
      <div
        v-for="p in products"
        :key="p.id"
        class="bg-card border border-border rounded-xl p-3 flex items-center gap-3"
      >
        <div class="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
          <img v-if="p.image" :src="p.image" class="w-full h-full object-cover" alt="" />
          <span v-else class="text-2xl">{{ categoryEmoji(p.category) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm truncate">{{ p.name }}</div>
          <div class="text-xs text-foreground/50 capitalize">{{ p.category }}</div>
          <div class="text-sm font-semibold text-primary">S/ {{ p.price }}</div>
        </div>
        <div class="flex flex-col items-end gap-2 shrink-0">
          <span
            class="px-2 py-0.5 text-xs rounded-full"
            :class="p.status
              ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-200'
              : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200'"
          >
            {{ p.status ? "Activo" : "Inactivo" }}
          </span>
          <div class="flex gap-1">
            <button
              @click="openModal(p)"
              class="text-xs px-2 py-1 border rounded-md hover:bg-background/70 transition"
            >Editar</button>
            <button
              @click="toggleStatus(p)"
              class="text-xs px-2 py-1 border rounded-md hover:bg-background/70 transition"
            >Estado</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop: table -->
    <div v-if="!loading" class="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
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
            <td class="p-3">
              <div class="w-12 h-12 rounded-md bg-background border border-border flex items-center justify-center overflow-hidden">
                <img v-if="p.image" :src="p.image" class="w-full h-full object-cover" alt="" />
                <span v-else class="text-2xl">{{ categoryEmoji(p.category) }}</span>
              </div>
            </td>
            <td class="p-3 font-medium">{{ p.name }}</td>
            <td class="p-3 capitalize">{{ p.category }}</td>
            <td class="p-3">S/ {{ p.price }}</td>
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
            <td class="p-3 text-right space-x-2">
              <button
                @click="openModal(p)"
                class="text-xs px-2 py-1 border rounded-md hover:bg-background/70 transition"
              >Editar</button>
              <button
                @click="toggleStatus(p)"
                class="text-xs px-2 py-1 border rounded-md hover:bg-background/70 transition"
              >Estado</button>
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
import { categoryEmoji } from "@/utils/categoryEmoji.js";

const products = ref([]);
const showModal = ref(false);
const editingProduct = ref(null);
const loading = ref(false);

const fetchProducts = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("/products");
    products.value = data;
  } finally {
    loading.value = false;
  }
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
