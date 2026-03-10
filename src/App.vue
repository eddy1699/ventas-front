<template>
  <div class="min-h-screen flex bg-background text-foreground">
    <RouterView />
    <AppToast />
  </div>
</template>
<script setup>
import AppToast from "@/components/AppToast.vue";
</script>

