<template>
  <button
    @click="toggle"
    class="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-card transition"
  >
    <span v-if="theme.darkMode">🌙</span>
    <span v-else>☀️</span>
  </button>
</template>
<script setup>
import { useThemeStore } from "@/store/themeStore";
const theme = useThemeStore();
theme.init();
const toggle = () => theme.toggle();
</script>

