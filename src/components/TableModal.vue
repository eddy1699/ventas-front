<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="w-full max-w-sm bg-card border border-border rounded-xl p-6 shadow-xl">
      <h2 class="text-lg font-bold mb-4">{{ table ? "Editar Mesa" : "Nueva Mesa" }}</h2>

      <div class="space-y-3">
        <div>
          <label class="text-xs text-foreground/60 mb-1 block">Nombre (opcional)</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Ej: Terraza, VIP, Interior..."
            class="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label class="text-xs text-foreground/60 mb-1 block">Capacidad (personas)</label>
          <input
            v-model.number="form.capacity"
            type="number"
            min="1"
            placeholder="4"
            class="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div v-if="table">
          <label class="text-xs text-foreground/60 mb-1 block">Estado</label>
          <select
            v-model="form.status"
            class="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
            <option value="reservada">Reservada</option>
          </select>
        </div>
      </div>

      <div class="flex gap-3 mt-5">
        <button
          @click="$emit('close')"
          class="flex-1 border border-border rounded-lg py-2 text-sm hover:bg-background/70 transition"
        >
          Cancelar
        </button>
        <button
          @click="save"
          :disabled="loading"
          class="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition"
        >
          {{ loading ? "Guardando..." : (table ? "Guardar" : "Crear") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import api from "@/api/axios";
import Swal from "sweetalert2";

const props = defineProps({ table: Object });
const emit = defineEmits(["close", "saved"]);

const loading = ref(false);
const form = ref({ name: "", capacity: 4, status: "disponible" });

watch(
  () => props.table,
  (t) => {
    if (t) form.value = { name: t.name || "", capacity: t.capacity || 4, status: t.status };
    else form.value = { name: "", capacity: 4, status: "disponible" };
  },
  { immediate: true }
);

async function save() {
  loading.value = true;
  try {
    if (props.table) {
      await api.put(`/tables/${props.table.id}`, form.value);
      if (form.value.status !== props.table.status) {
        await api.patch(`/tables/${props.table.id}/status`, { status: form.value.status });
      }
    } else {
      await api.post("/tables", form.value);
    }
    emit("saved");
  } catch (e) {
    Swal.fire("Error", e.response?.data?.error || "Error guardando mesa", "error");
  } finally {
    loading.value = false;
  }
}
</script>
