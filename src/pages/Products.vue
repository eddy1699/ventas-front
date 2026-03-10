<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold">Productos</h1>
      <button
        @click="openModal()"
        class="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
      >
        + Nuevo
      </button>
    </div>

    <!-- Search -->
    <input
      v-model="search"
      type="text"
      placeholder="Buscar producto..."
      class="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
    />

    <!-- Loading -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 6" :key="i" class="bg-card border border-border rounded-xl p-4 flex items-center gap-3 animate-pulse">
        <div class="w-14 h-14 rounded-xl bg-border shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="h-3 bg-border rounded w-3/4"></div>
          <div class="h-3 bg-border rounded w-1/3"></div>
        </div>
      </div>
    </div>

    <!-- Cards -->
    <div v-if="!loading" class="space-y-2">
      <div
        v-for="p in filtered"
        :key="p.id"
        class="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
      >
        <div class="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
          <img v-if="p.image" :src="p.image" class="w-full h-full object-cover" alt="" />
          <span v-else class="text-3xl">{{ categoryEmoji(p.category) }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm truncate">{{ p.name }}</div>
          <div class="text-xs text-foreground/50 capitalize mt-0.5">{{ p.category }}</div>
          <div class="text-base font-bold text-primary mt-1">S/ {{ p.price }}</div>
        </div>
        <div class="flex flex-col items-end gap-2 shrink-0">
          <span
            class="px-2.5 py-1 text-xs font-semibold rounded-full"
            :class="p.status
              ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300'"
          >
            {{ p.status ? "Activo" : "Inactivo" }}
          </span>
          <div class="flex gap-1.5">
            <button
              @click="openModal(p)"
              class="text-xs px-3 py-2 border border-border rounded-lg hover:bg-background/70 transition font-medium"
            >Editar</button>
            <button
              @click="toggleStatus(p)"
              class="text-xs px-3 py-2 border border-border rounded-lg hover:bg-background/70 transition font-medium"
            >Estado</button>
          </div>
        </div>
      </div>

      <div v-if="filtered.length === 0" class="text-center py-12 text-foreground/40">
        <div class="text-4xl mb-2">📦</div>
        <p class="text-sm">No hay productos.</p>
      </div>
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
import { ref, computed, onMounted } from "vue";
import api from "@/api/axios";
import ProductModal from "@/components/ProductModal.vue";
import { categoryEmoji } from "@/utils/categoryEmoji.js";

const products = ref([]);
const showModal = ref(false);
const editingProduct = ref(null);
const loading = ref(false);
const search = ref("");

const filtered = computed(() => {
  const q = search.value.toLowerCase();
  return products.value.filter((p) => !q || p.name.toLowerCase().includes(q));
});

const fetchProducts = async () => {
  loading.value = true;
  try {
    const { data } = await api.get("/products");
    products.value = data;
  } finally {
    loading.value = false;
  }
};

const openModal = (p = null) => { editingProduct.value = p; showModal.value = true; };
const closeModal = () => { showModal.value = false; editingProduct.value = null; };
const toggleStatus = async (p) => {
  await api.patch(`/products/${p.id}/status`, { status: p.status ? 0 : 1 });
  fetchProducts();
};

onMounted(fetchProducts);
</script>
