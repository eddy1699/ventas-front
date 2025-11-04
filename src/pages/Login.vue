<template>
  <div class="flex items-center justify-center w-screen h-screen bg-background">
    <div
      class="w-full max-w-md bg-card rounded-2xl shadow-soft p-8 border border-border"
    >
      <h1 class="text-xl font-semibold mb-1 text-center">Ingresar a Ventas</h1>
      <p class="text-xs text-center text-foreground/60 mb-6">
        Usa tu correo y contraseña para acceder.
      </p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="text-xs mb-1 block">Correo</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 rounded-md border border-border bg-background"
          />
        </div>

        <div>
          <label class="text-xs mb-1 block">Contraseña</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 rounded-md border border-border bg-background"
          />
        </div>

        <button
          type="submit"
          class="w-full py-2 bg-primary text-white rounded-md hover:opacity-90 transition flex items-center justify-center"
          :disabled="loading"
        >
          <span v-if="!loading">Ingresar</span>
          <span v-else class="flex items-center gap-2">
            <svg
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            Cargando...
          </span>
        </button>
      </form>

      <p v-if="error" class="text-xs text-red-500 mt-3 text-center">
        {{ error }}
      </p>
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

<style scoped>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
