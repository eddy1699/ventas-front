<template>
  <div class="flex w-full min-h-screen bg-background text-foreground">
    <Sidebar />
    <div class="flex-1 flex flex-col min-w-0">
      <Navbar />
      <main class="flex-1 p-4 md:p-6 bg-background overflow-y-auto pb-20 md:pb-6">
        <RouterView />
      </main>
    </div>
    <BottomNav />
  </div>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
import Navbar from "@/components/Navbar.vue";
import BottomNav from "@/components/BottomNav.vue";
</script>
