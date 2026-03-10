<template>
  <div class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
    <div class="w-full sm:max-w-sm bg-card sm:rounded-2xl rounded-t-2xl border border-border shadow-xl p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold">{{ table ? "Editar Mesa" : "Nueva Mesa" }}</h2>
        <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-background/60 text-foreground/50 transition">✕</button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="text-xs font-medium text-foreground/60 mb-1.5 block">Nombre (opcional)</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Ej: Terraza, VIP, Interior..."
            class="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label class="text-xs font-medium text-foreground/60 mb-1.5 block">Capacidad (personas)</label>
          <input
            v-model.number="form.capacity"
            type="number"
            min="1"
            placeholder="4"
            class="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div v-if="table">
          <label class="text-xs font-medium text-foreground/60 mb-1.5 block">Estado</label>
          <select
            v-model="form.status"
            class="w-full border border-border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
            <option value="reservada">Reservada</option>
          </select>
        </div>
      </div>

      <div class="flex gap-3 pt-1">
        <button
          @click="$emit('close')"
          class="flex-1 border border-border rounded-xl py-3 text-sm font-medium hover:bg-background/70 transition"
        >
          Cancelar
        </button>
        <button
          @click="save"
          :disabled="loading"
          class="flex-1 bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
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
import { useToast } from "@/composables/useToast";

const { error: toastError } = useToast();

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
    toastError(e.response?.data?.error || "Error guardando mesa");
  } finally {
    loading.value = false;
  }
}
</script>
