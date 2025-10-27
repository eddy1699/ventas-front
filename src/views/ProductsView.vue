<template>
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
    
  
