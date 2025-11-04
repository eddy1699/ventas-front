<template>
  <section class="bg-white rounded-xl shadow p-4">
    <h2 class="text-lg font-semibold text-slate-800 mb-4">
      Agregar Producto
    </h2>

    <form @submit.prevent="addProduct" class="grid gap-4 md:grid-cols-4">
      <input
        v-model="form.name"
        placeholder="Nombre"
        required
        class="border p-2 rounded-md w-full border-slate-300"
      />

      <select
        v-model="form.category"
        class="border p-2 rounded-md w-full border-slate-300"
      >
        <option value="plato">Plato</option>
        <option value="bebida">Bebida</option>
        <option value="combo">Combo</option>
      </select>

      <input
        v-model.number="form.price"
        type="number"
        min="0"
        step="0.1"
        placeholder="Precio"
        required
        class="border p-2 rounded-md w-full border-slate-300"
      />

      <!-- Campo opcional JSON -->
      <input
        v-model="form.data"
        placeholder='Extra (JSON opcional, ej: {"peso": "500g"})'
        class="border p-2 rounded-md w-full border-slate-300 md:col-span-2"
      />

      <input
        type="file"
        accept="image/*"
        @change="onFileChange"
        class="border p-2 rounded-md w-full border-slate-300 md:col-span-2"
      />

      <button
        type="submit"
        :disabled="loading"
        class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md px-4 py-2 md:col-span-2 flex justify-center items-center"
      >
        <span v-if="!loading">💾 Guardar producto</span>
        <span v-else>⏳ Subiendo...</span>
      </button>
    </form>
  </section>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import backendURL from "../url.js"; // tu archivo con la URL base del backend

const loading = ref(false);

const form = ref({
  name: "",
  category: "plato",
  price: 0,
  image: null,
  data: "", // JSON opcional
});

function onFileChange(e) {
  form.value.image = e.target.files[0];
}

async function addProduct() {
  try {
    loading.value = true;
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire("Error", "No tienes sesión activa", "error");
      return;
    }

    const data = new FormData();
    data.append("name", form.value.name);
    data.append("category", form.value.category);
    data.append("price", form.value.price);
    if (form.value.image) data.append("image", form.value.image);

    // ✅ Convierte el campo data a string JSON (si el usuario lo llenó)
    const extra = form.value.data ? JSON.stringify(JSON.parse(form.value.data)) : "{}";
    data.append("data", extra);

    const res = await axios.post(`${backendURL}/api/products`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    Swal.fire("✅ Éxito", res.data.message || "Producto guardado correctamente", "success");
    form.value = { name: "", category: "plato", price: 0, image: null, data: "" };
  } catch (err) {
    console.error("❌ Error:", err);
    Swal.fire("Error", err.response?.data?.details || "No se pudo guardar el producto", "error");
  } finally {
    loading.value = false;
  }
}
</script>
<style>
input{
  color: black ; 
}
select{
  color: black ; 
}</style>