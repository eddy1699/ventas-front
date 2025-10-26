<template>
  <div class="max-w-6xl mx-auto p-4 space-y-8">
    <header
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Panel de Ventas</h1>
        <p class="text-slate-500 text-sm">
          Registra productos y mira las ventas del día.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow p-4 w-full md:w-auto">
        <h2 class="text-sm text-slate-500">Total de hoy</h2>
        <p class="text-2xl font-semibold text-slate-800">
          S/ {{ Number(dashboard.totalHoy || 0).toFixed(2) }}
        </p>
        <!-- <div class="text-xs text-slate-400 mt-2">
          Top:</div>
        <ul class="text-xs text-slate-600">
          <li v-for="t in dashboard.topProductos" :key="t.name">
            {{ t.qty }}x {{ t.name }}
          </li>
        </ul> -->
      </div>
    </header>

    <!-- Formulario nuevo producto -->
  

    <!-- Lista de productos -->
    <section>
      <h2 class="text-lg font-semibold text-slate-800 mb-4">Productos</h2>

      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div
          v-for="p in products"
          :key="p.id"
          class="bg-white rounded-xl shadow p-3 flex flex-col"
        >
          <div
            class="aspect-video bg-slate-200 rounded-lg overflow-hidden flex items-center justify-center mb-3"
          >
            <img
              v-if="p.image"
              class="w-full h-full object-cover"
              :src="backendURL + '/uploads/' + p.image"
              :alt="p.name"
            />
            <span v-else class="text-slate-400 text-xs">Sin imagen</span>
          </div>

          <div class="flex-1">
            <p class="text-slate-800 font-semibold leading-tight">
              {{ p.name }}
            </p>
            <p class="text-slate-500 text-xs capitalize">{{ p.category }}</p>
          </div>

          <div class="mt-2 flex items-center justify-between">
            <span class="text-slate-900 font-bold text-lg"
              >S/ {{ p.price }}</span
            >
            <button
              @click="addQuickSale(p)"
              class="text-xs bg-green-600 hover:bg-green-700 text-white font-medium rounded-md px-3 py-1"
            >
              Vender +
            </button>
            <button
                        @click="removeOneProduct(p.id)"
                        class="text-xs bg-red-600 hover:bg-red-700 centered text-white font-medium rounded-md px-3 py-1"
                      >
                        Remover 1
                      </button>
          </div>
        </div>
      </div>
    </section>
    <section class="bg-white rounded-xl shadow p-4">
      <h2 class="text-lg font-semibold text-slate-800 mb-4">
        Agregar Producto
      </h2>
      <form @submit.prevent="addProduct" class="grid gap-4 md:grid-cols-4">
        <input
          v-model="form.name"
          placeholder="Nombre"
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
          class="border p-2 rounded-md w-full border-slate-300"
        />

        <input
          type="file"
          @change="onFileChange"
          class="border p-2 rounded-md w-full border-slate-300 md:col-span-2"
        />

        <button
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md px-4 py-2 md:col-span-2"
        >
          Guardar producto
        </button>
      </form>
    </section>
    <div class="bg-white rounded-xl shadow p-4 w-full md:w-auto">
      <h2 class="text-lg font-semibold text-slate-800 mb-3">Resumen del Día</h2>

      <table class="w-full border-collapse text-sm">
        <tbody>
          <!-- <tr class="border-b border-slate-200">
        <td class="py-2 text-slate-600 font-medium">Total de hoy</td>
        <td class="py-2 text-right text-slate-800 font-semibold text-lg">
          S/ {{ Number(dashboard.totalHoy || 0).toFixed(2) }}
        </td>
      </tr> -->
          <tr>
            <!-- <td class="py-2 text-slate-600 font-medium align-top">Top productos</td> -->
            <td class="py-2">
              <table class="w-full text-xs text-slate-700">
                <thead>
                  <tr
                    class="text-slate-500 uppercase text-[10px] border-b border-slate-200"
                  >
                    <th class="text-left py-1">Producto</th>
                    <th class="text-right py-1">Cantidad</th>
                    <th class="text-right py-1">Monto</th>

                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="t in dashboard.topProductos"
                    :key="t.name"
                    class="hover:bg-slate-50"
                  >
                    <td class="py-1">{{ t.name }}</td>
                    <td class="py-1 text-right font-medium">{{ t.qty }}</td>
                    <td class="py-1 text-right font-medium">{{ t.monto }}</td>
                    
                  </tr>
                  <tr v-if="!dashboard.topProductos.length">
                    <td colspan="2" class="text-center text-slate-400 py-2">
                      No hay productos vendidos aún
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useToast } from "vue-toast-notification";
import Swal from 'sweetalert2'
const toast = useToast();
const backendURL = "https://ventas-back-bul4.onrender.com";
const totalHoy = ref(0);

async function addQuickSale(p) {
  try {
    const body = {
      items: [
        {
          product_id: p.id,
          quantity: 1,
          price: Number(p.price),
        },
      ],
    };

    await axios.post(backendURL + "/api/sales", body);
    toast.success(`${p.name} vendido correctamente ✅`, {
      position: "bottom-right",
      duration: 2500,
    });

    await fetchDashboard();
  } catch (err) {
    console.error(err);
    toast.error("❌ Error al registrar la venta", {
      position: "bottom-right",
      duration: 3000,
    });
  }
}
onMounted(async () => {
  const res = await axios.get("/api/sales/today");
  totalHoy.value = Number(res.data.total || 0);

});
const form = ref({
  name: "",
  category: "plato",
  price: 0,
  image: null,
});

const products = ref([]);
const dashboard = ref({
  totalHoy: 0,
  topProductos: [],
});

function onFileChange(e) {
  form.value.image = e.target.files[0];
}

async function addProduct() {
  const data = new FormData();
  data.append("name", form.value.name);
  data.append("category", form.value.category);
  data.append("price", form.value.price);
  if (form.value.image) data.append("image", form.value.image);

  await axios.post(backendURL + "/api/products", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  await fetchProducts();
  await fetchDashboard();

  form.value = { name: "", category: "plato", price: 0, image: null };
}

// async function addQuickSale(p) {
//   try {
//     const body = {
//       items: [
//         {
//           product_id: p.id,
//           quantity: 1,
//           price: Number(p.price)
//         }
//       ]
//     }

//     await axios.post(backendURL + '/api/sales', body)
//     await fetchDashboard()

//     // ✅ Toast de éxito
//     showToast(`✅ ${p.name} vendido correctamente`, 'success')
//   } catch (err) {
//     console.error(err)
//     // ❌ Toast de error
//     showToast('❌ Error al registrar la venta', 'error')
//   }
// }

async function fetchProducts() {
  const { data } = await axios.get(backendURL + "/api/products");
  products.value = data;
}

async function fetchDashboard() {
  const { data } = await axios.get(backendURL + "/api/dashboard/today");
  dashboard.value = data;
  
}
async function removeOneProduct(id) 
// {
//   if (!confirm('¿Seguro que deseas anular esta venta?')) return
// console.log(id)
//   try {
//     const res = await axios.delete(`${backendURL}/api/sales/${id}`)
//     alert(res.data.message || 'Venta anulada correctamente ✅')

//     // Si tienes una lista de ventas, actualízala
//     await fetchDashboard()
//   } catch (err) {
//     console.error(err)
//     alert('❌ Error al anular la venta')
//   }
// }

{
  const confirmacion = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción anulará la venta y no se podrá revertir.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, anular venta',
    cancelButtonText: 'Cancelar'
  })

  if (confirmacion.isConfirmed) {
    try {
      const res = await axios.delete(`${backendURL}/api/sales/${id}`)

      // ✅ Alerta de éxito
      await Swal.fire({
        icon: 'success',
        title: 'Venta anulada',
        text: res.data.message || 'La venta se ha marcado como anulada correctamente.',
        timer: 2000,
        showConfirmButton: false
      })

      // Actualizar lista local
      await fetchDashboard()
    } catch (err) {
      console.error(err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo anular la venta.',
      })
    }
  }
}
onMounted(() => {
  fetchProducts();
  fetchDashboard();
});
</script>
