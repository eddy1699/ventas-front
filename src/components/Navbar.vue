<template>
  <header class="h-14 border-b border-border flex items-center justify-between px-4 bg-background/60 backdrop-blur">
    <div class="flex items-center gap-3">
      <div class="text-sm text-foreground/60">
        Hola, <span class="font-semibold">{{ user?.name || 'Usuario' }}</span>
      </div>
      <span
        v-if="isOffline"
        class="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300 font-medium"
        title="Sin conexión al servidor. Los datos se guardan en memoria."
      >
        Sin conexión
      </span>
    </div>
    <div class="flex items-center gap-3">
      <ThemeToggle />
      <button @click="logout" class="text-xs px-3 py-1 rounded-md border border-border hover:bg-card transition">
        Cerrar sesión
      </button>
    </div>
  </header>
</template>
<script setup>
import { ref, onMounted } from "vue";
import ThemeToggle from "@/components/ThemeToggle.vue";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const user = userStore.user;
const isOffline = ref(false);

onMounted(() => {
  // Check offline mode from the API module (set after a network error)
  import("@/api/axios").then(mod => {
    isOffline.value = mod.offlineMode;
    // Poll every 3s to update the badge if mode changes
    setInterval(() => { isOffline.value = mod.offlineMode; }, 3000);
  });
});

const logout = () => {
  userStore.logout();
  window.location.href = "/login";
};
</script>

