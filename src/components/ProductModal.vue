<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-card rounded-xl w-full max-w-md p-6 border border-border shadow-lg relative">
      <h2 class="text-lg font-semibold mb-4">
        {{ product ? "Editar producto" : "Nuevo producto" }}
      </h2>

      <form @submit.prevent="saveProduct" class="space-y-4">
        <div>
          <label class="text-xs mb-1 block">Nombre</label>
          <input
            v-model="form.name"
            required
            class="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="Ej. Pollo a la brasa"
          />
        </div>

        <div>
          <label class="text-xs mb-1 block">Categoría</label>
          <select
            v-model="form.category"
            required
            class="w-full px-3 py-2 border rounded-md bg-background"
          >
            <option value="cóctel">Cóctel</option>
            <option value="limonada">Limonada</option>
            <option value="frappe">Frappe</option>
            <option value="jugo">Jugo</option>
            <option value="gaseosa">Gaseosa</option>
            <option value="cerveza">Cerveza</option>
            <option value="caliente">Caliente</option>
            <option value="hamburguesa">Hamburguesa</option>
            <option value="plato">Plato</option>
            <option value="postre">Postre</option>
          </select>
        </div>

        <div>
          <label class="text-xs mb-1 block">Precio (S/)</label>
          <input
            v-model="form.price"
            type="number"
            min="0"
            step="0.01"
            required
            class="w-full px-3 py-2 border rounded-md bg-background"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="text-xs mb-1 block">Imagen (opcional)</label>
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-lg border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
              <img v-if="preview" :src="preview" class="w-full h-full object-cover" alt="preview" />
              <span v-else class="text-2xl">📷</span>
            </div>
            <input
              type="file"
              accept="image/*"
              @change="handleFileUpload"
              class="text-xs text-foreground/70 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-2 pt-4 border-t border-border/50">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm border rounded-md hover:bg-background/60 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-primary text-white rounded-md text-sm hover:opacity-90 transition"
          >
            {{ product ? "Guardar cambios" : "Agregar producto" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive } from "vue";
import api from "@/api/axios";

const props = defineProps({
  product: Object,
});
const emit = defineEmits(["close", "saved"]);

const form = reactive({
  name: "",
  category: "",
  price: "",
  image: null,
});

const preview = ref(null);

watch(
  () => props.product,
  (val) => {
    if (val) {
      form.name = val.name;
      form.category = val.category;
      form.price = val.price;
      preview.value = val.image
        ? val.image.startsWith("http")
          ? val.image
          : `/uploads/${val.image}`
        : null;
    } else {
      form.name = "";
      form.category = "";
      form.price = "";
      form.image = null;
      preview.value = null;
    }
  },
  { immediate: true }
);

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.image = file;
    preview.value = URL.createObjectURL(file);
  }
};

const saveProduct = async () => {
  try {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("price", form.price);
    if (form.image) formData.append("image", form.image);

    if (props.product) {
      await api.put(`/products/${props.product.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    emit("saved");
    emit("close");
  } catch (err) {
    console.error("❌ Error guardando producto:", err);
    alert(err.response?.data?.error || "No se pudo guardar el producto");
  }
};
</script>
