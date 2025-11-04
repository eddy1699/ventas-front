<template>
  <header class="h-14 border-b border-border flex items-center justify-between px-4 bg-background/60 backdrop-blur">
    <div class="text-sm text-foreground/60">
      Hola, <span class="font-semibold">{{ user?.name || 'Usuario' }}</span>
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
import ThemeToggle from "@/components/ThemeToggle.vue";
import { useUserStore } from "@/store/userStore";
const userStore = useUserStore();
const user = userStore.user;
const logout = () => {
  userStore.logout();
  window.location.href = "/login";
};
</script>

