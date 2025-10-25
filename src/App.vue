<template>
  <div class="max-w-6xl mx-auto p-4 space-y-8">
    <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Panel de Ventas</h1>
        <p class="text-slate-500 text-sm">Registra productos y mira las ventas del día.</p>
      </div>

      <div class="bg-white rounded-xl shadow p-4 w-full md:w-auto">
        <h2 class="text-sm text-slate-500">Total de hoy</h2>
        <p class="text-2xl font-semibold text-slate-800">S/ {{ Number(dashboard.totalHoy || 0).toFixed(2) }}</p>
        <div class="text-xs text-slate-400 mt-2">
          Top:</div>
        <ul class="text-xs text-slate-600">
          <li v-for="t in dashboard.topProductos" :key="t.name">
            {{ t.qty }}x {{ t.name }}
          </li>
        </ul>
      </div>
    </header>

    <!-- Formulario nuevo producto -->
    <section class="bg-white rounded-xl shadow p-4">
      <h2 class="text-lg font-semibold text-slate-800 mb-4">Agregar Producto</h2>
      <form @submit.prevent="addProduct" class="grid gap-4 md:grid-cols-4">
        <input v-model="form.name" placeholder="Nombre" class="border p-2 rounded-md w-full border-slate-300" />

        <select v-model="form.category" class="border p-2 rounded-md w-full border-slate-300">
          <option value="plato">Plato</option>
          <option value="bebida">Bebida</option>
          <option value="combo">Combo</option>
        </select>

        <input v-model.number="form.price" type="number" min="0" step="0.1" placeholder="Precio"
          class="border p-2 rounded-md w-full border-slate-300" />

        <input type="file" @change="onFileChange"
          class="border p-2 rounded-md w-full border-slate-300 md:col-span-2" />

        <button
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md px-4 py-2 md:col-span-2">
          Guardar producto
        </button>
      </form>
    </section>

    <!-- Lista de productos -->
    <section>
      <h2 class="text-lg font-semibold text-slate-800 mb-4">Productos</h2>

      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div
          v-for="p in products"
          :key="p.id"
          class="bg-white rounded-xl shadow p-3 flex flex-col"
        >
          <div class="aspect-video bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center mb-3">
            <img
              v-if="p.image"
              class="w-full h-full object-cover"
              :src="backendURL + '/uploads/' + p.image"
              :alt="p.name"
            />
            <span v-else class="text-slate-400 text-xs">Sin imagen</span>
          </div>

          <div class="flex-1">
            <p class="text-slate-800 font-semibold leading-tight">{{ p.name }}</p>
            <p class="text-slate-500 text-xs capitalize">{{ p.category }}</p>
          </div>

          <div class="mt-2 flex items-center justify-between">
            <span class="text-slate-900 font-bold text-lg">S/ {{ p.price }}</span>
            <button
              @click="addQuickSale(p)"
              class="text-xs bg-green-600 hover:bg-green-700 text-white font-medium rounded-md px-3 py-1">
              Vender +
            </button>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const backendURL = 'https://ventas-back-bul4.onrender.com'
const totalHoy = ref(0);
onMounted(async () => {
  const res = await axios.get('/api/sales/today');
  totalHoy.value = Number(res.data.total || 0);
});
const form = ref({
  name: '',
  category: 'plato',
  price: 0,
  image: null
})

const products = ref([])
const dashboard = ref({
  totalHoy: 0,
  topProductos: []
})

function onFileChange(e) {
  form.value.image = e.target.files[0]
}

async function addProduct() {
  const data = new FormData()
  data.append('name', form.value.name)
  data.append('category', form.value.category)
  data.append('price', form.value.price)
  if (form.value.image) data.append('image', form.value.image)

  await axios.post(backendURL + '/api/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

  await fetchProducts()
  await fetchDashboard()

  form.value = { name: '', category: 'plato', price: 0, image: null }
}

async function addQuickSale(p) {
  const body = {
    items: [
      {
        product_id: p.id,
        quantity: 1,
        price: p.price
      }
    ]
  }
  await axios.post(backendURL + '/api/sales', body)
  await fetchDashboard()
}

async function fetchProducts() {
  const { data } = await axios.get(backendURL + '/api/products')
  products.value = data
}

async function fetchDashboard() {
  const { data } = await axios.get(backendURL + '/api/dashboard/today')
  dashboard.value = data
}

onMounted(() => {
  fetchProducts()
  fetchDashboard()
})
</script>
