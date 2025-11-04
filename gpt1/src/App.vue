<template>
  <div class="app-layout">
    <!-- NAVBAR -->
    <NavBar  v-if="authenticated"
      class="navbar"
      :toggleSidebar="toggleSidebar"
      :isOpen="sidebarOpen" />

    <div v-if="authenticated" class="main-layout">
      <!-- SIDEBAR -->
      <AsideMenu class="aside"
        :open="sidebarOpen"
        @close="closeSidebar" />

      <!-- CONTENIDO PRINCIPAL -->
      <main class="content">
        <RouterView />
      </main>
    </div>

    <!-- LOGIN -->
    <div v-else class="login-layout">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import NavBar from "@/components/NavBar.vue"
import AsideMenu from "@/components/AsideMenu.vue"

const authenticated = ref(false)

onMounted(() => {
  const token = localStorage.getItem("token")
  if (token) authenticated.value = true
})

const sidebarOpen = ref(false);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  console.log("👉 toggleSidebar()", "sidebarOpen:", sidebarOpen.value)
}

/* cerrar forzado (ej: al hacer click en un link del menú) */
const closeSidebar = () => {
  sidebarOpen.value = false
  console.log("❌ closeSidebar()", "sidebarOpen:", sidebarOpen.value)
}
</script>

<style scoped>

/* === ESTRUCTURA GENERAL === */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #0f1724;
  color: #fff;
}

/* === NAVBAR === */
.navbar {
  height: 60px;
  background: #111a2b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
  z-index: 2;
}

/* === LAYOUT PRINCIPAL (sidebar + contenido) === */
.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: calc(100vh - 60px); /* resto del espacio después del navbar */
}

/* === SIDEBAR === */
.aside {
  width: 240px;
  background: #111a2b;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1rem;
  overflow-y: auto;
  flex-shrink: 0;
}

/* === CONTENIDO === */
.content {
  flex: 1;  margin-left: 240px;
    
  padding: 1.5rem;
  overflow-y: auto;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .aside {
    position: fixed;
    left: 0;
    top: 60px; /* debajo del navbar */
    width: 220px;
    height: calc(100vh - 60px);
    background: #111a2b;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 5;
  }

  .aside.open {
    transform: translateX(0);
  }

  .content {
    margin-left: 0;
    padding: 1rem;
  }
}
input{
  color: black ; 
}
select{
  color: black ; 
}
</style>