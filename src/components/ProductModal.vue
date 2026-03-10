<template>
  <div class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
    <div class="bg-card w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl border border-border shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          {{ product ? "Editar producto" : "Nuevo producto" }}
        </h2>
        <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background/60 text-foreground/50 transition">✕</button>
      </div>

      <form @submit.prevent="saveProduct" class="space-y-4">
        <div>
          <label class="text-xs font-medium mb-1.5 block">Nombre</label>
          <input
            v-model="form.name"
            required
            :disabled="loading"
            class="w-full px-4 py-3 border border-border rounded-xl bg-background disabled:opacity-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Ej. Pollo a la brasa"
          />
        </div>

        <div>
          <label class="text-xs font-medium mb-1.5 block">Categoría</label>
          <select
            v-model="form.category"
            required
            :disabled="loading"
            class="w-full px-4 py-3 border border-border rounded-xl bg-background disabled:opacity-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Seleccionar...</option>
            <option value="coctel">🍹 Cóctel</option>
            <option value="limonada">🍋 Limonada</option>
            <option value="frappe">🧋 Frappe</option>
            <option value="jugo">🥤 Jugo</option>
            <option value="gaseosa">🥤 Gaseosa</option>
            <option value="cerveza">🍺 Cerveza</option>
            <option value="caliente">☕ Caliente</option>
            <option value="hamburguesa">🍔 Hamburguesa</option>
            <option value="plato">🍱 Plato</option>
            <option value="postre">🍰 Postre</option>
          </select>
        </div>

        <div>
          <label class="text-xs font-medium mb-1.5 block">Precio (S/)</label>
          <input
            v-model="form.price"
            type="number"
            min="0"
            step="0.01"
            required
            :disabled="loading"
            class="w-full px-4 py-3 border border-border rounded-xl bg-background disabled:opacity-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="text-xs font-medium mb-1.5 block">Imagen (opcional)</label>
          <div class="flex items-center gap-3">
            <div class="w-16 h-16 rounded-xl border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
              <img v-if="preview" :src="preview" class="w-full h-full object-cover" alt="preview" />
              <span v-else class="text-2xl">📷</span>
            </div>
            <input
              type="file"
              accept="image/*"
              :disabled="loading"
              @change="handleFileUpload"
              class="text-xs text-foreground/70 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer disabled:opacity-50"
            />
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button
            type="button"
            :disabled="loading"
            @click="$emit('close')"
            class="flex-1 py-3 text-sm border border-border rounded-xl hover:bg-background/60 transition disabled:opacity-50 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-70 flex items-center justify-center gap-2"
          >
            <svg v-if="loading" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            {{ loading ? "Guardando..." : (product ? "Guardar" : "Agregar") }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive } from "vue";
import api from "@/api/axios";
import { useToast } from "@/composables/useToast";

const { success: toastSuccess, error: toastError } = useToast();

const props = defineProps({ product: Object });
const emit = defineEmits(["close", "saved"]);

const loading = ref(false);
const form = reactive({ name: "", category: "", price: "", image: null });
const preview = ref(null);

watch(
  () => props.product,
  (val) => {
    if (val) {
      form.name = val.name;
      form.category = val.category;
      form.price = val.price;
      preview.value = val.image
        ? val.image.startsWith("http") ? val.image : `/uploads/${val.image}`
        : null;
    } else {
      form.name = ""; form.category = ""; form.price = ""; form.image = null; preview.value = null;
    }
  },
  { immediate: true }
);

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) { form.image = file; preview.value = URL.createObjectURL(file); }
};

const saveProduct = async () => {
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("price", form.price);
    if (form.image) formData.append("image", form.image);
    if (props.product) {
      await api.put(`/products/${props.product.id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    } else {
      await api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } });
    }
    emit("saved");
    emit("close");
    toastSuccess("Producto guardado correctamente");
  } catch (err) {
    toastError(err.response?.data?.error || "No se pudo guardar el producto");
  } finally {
    loading.value = false;
  }
};
</script>
