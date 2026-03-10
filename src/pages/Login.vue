<template>
  <div class="flex items-center justify-center w-screen min-h-screen bg-background px-4 py-8">
    <div class="w-full max-w-sm bg-card rounded-2xl shadow-soft p-8 border border-border">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold">Bienvenido</h1>
        <p class="text-sm text-foreground/60 mt-1">Ingresa con tu correo y contraseña</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="text-xs font-medium mb-1.5 block">Correo</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="tu@correo.com"
            class="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label class="text-xs font-medium mb-1.5 block">Contraseña</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <p v-if="error" class="text-sm text-red-500 text-center">{{ error }}</p>

        <button
          type="submit"
          class="w-full py-3.5 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 mt-2"
          :disabled="loading"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          {{ loading ? "Ingresando..." : "Ingresar" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/store/userStore";

const userStore = useUserStore();
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const handleLogin = async () => {
  error.value = "";
  loading.value = true;
  try {
    await userStore.login(email.value, password.value);
    window.location.href = "/";
  } catch (e) {
    error.value = e.response?.data?.error || "Error al iniciar sesión";
  } finally {
    loading.value = false;
  }
};
</script>
