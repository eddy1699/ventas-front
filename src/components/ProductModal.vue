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
            <option value="plato">Plato</option>
            <option value="bebida">Bebida</option>
            <option value="combo">Combo</option>
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

        <!-- 🖼️ Imagen -->
        <div>
          <label class="text-xs mb-1 block">Imagen</label>
          <input type="file" @change="handleFileUpload" accept="image/*" class="text-xs" />
          <div v-if="preview" class="mt-2">
            <img
              :src="preview"
              alt="Vista previa"
              class="w-32 h-32 object-cover rounded-md border border-border"
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
    alert("No se pudo guardar el producto");
  }
};
</script>
