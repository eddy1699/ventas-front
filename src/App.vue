<template>
    <div class="app">
      <!-- Botón para abrir/cerrar menú en móvil -->
      <button class="menu-btn" @click="toggleSidebar">
        ☰
      </button>
  
      <!-- Sidebar -->
      <aside :class="['sidebar', { open: sidebarOpen }]">
        <h2 class="logo">Ventas Diarias</h2>
        <nav>
          <RouterLink to="/" @click="closeSidebar">Ventas</RouterLink>
          <RouterLink to="/productos" @click="closeSidebar">Productos</RouterLink>
          <RouterLink to="/dashboard" @click="closeSidebar">Dashboard</RouterLink>
        </nav>
      </aside>
  
      <!-- Contenido principal -->
      <main class="content" @click="closeSidebarOnOutsideClick">
        <RouterView />
      </main>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const sidebarOpen = ref(false)
  
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }
  
  const closeSidebar = () => {
    sidebarOpen.value = false
  }
  
  const closeSidebarOnOutsideClick = () => {
    if (window.innerWidth <= 768 && sidebarOpen.value) {
      sidebarOpen.value = false
    }
  }
  </script>
<style scoped>
.app {
  display: flex;
  min-height: 100vh;
  /* background: #0f1724;
  color: #fff; */
}

/* === Sidebar === */
.sidebar {
  width: 240px;
  background: #f8f8ff;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 10;
  transition: transform 0.3s ease;
}

/* Desktop: visible por defecto */
@media (min-width: 769px) {
  .sidebar {
    transform: translateX(0);
  }
}

/* Móvil: oculta hasta que tenga .open */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.open {
    transform: translateX(0);
  }
}

/* === Botón del menú === */
.menu-btn {
  position: fixed;
  top: 1rem;
  left: 1rem;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  z-index: 20;
  font-size: 1.2rem;
  display: none;
}

/* Solo visible en pantallas pequeñas */
@media (max-width: 768px) {
  .menu-btn {
    display: block;
  }
}

/* === Contenido principal === */
.content {
  flex: 1;
  margin-left: 240px;
  padding: 2rem;
  transition: margin-left 0.3s ease;
  width: 100%;
}

/* En móviles ocupa toda la pantalla */
@media (max-width: 768px) {
  .content {
    margin-left: 0;
    padding: 1rem;
  }
}

/* === Links del sidebar === */
.logo {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
}

.sidebar nav a {
  /* color: #94a3b8; */
  text-decoration: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}

.sidebar nav a:hover {
  background: rgba(223, 33, 33, 0.05);
  color: #ff6b6b;
}

.sidebar nav a.router-link-active {
  background: rgba(255, 255, 255, 0.08);
  color: #ff0000;
}
</style>
