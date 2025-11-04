<template>
  <div class="flex w-full min-h-screen bg-background text-foreground">
    <Sidebar />
    <div class="flex-1 flex flex-col">
      <Navbar />
      <main class="flex-1 p-6 bg-background overflow-y-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
<script setup>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
</script>

