<template>
    <div class="app">
      <!-- Barra superior (solo visible en móvil) -->
      <header class="mobile-header">
        <button class="menu-btn" :class="{ open: sidebarOpen }" @click="toggleSidebar">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 class="brand">PEPES ROLLS & WINGS</h1>
      </header>
  
      <!-- Sidebar -->
      <aside :class="['sidebar', { open: sidebarOpen }]">
        <h2 class="logo">PEPES ROLLS & WINGS</h2>
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
    background: #0f1724;
    color: #fff;
  }
  
  /* === Header móvil === */
  .mobile-header {
    display: none;
    align-items: center;
    gap: 0.75rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: #111a2b;
    padding: 0 1rem;
    z-index: 15;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  
  .brand {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.5px;
  }
  
  /* Mostrar header solo en móvil */
  @media (max-width: 768px) {
    .mobile-header {
      display: flex;
    }
  }
  
  /* === Sidebar === */
  .sidebar {
    width: 240px;
    background: #111a2b;
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
  
  /* Desktop: visible siempre */
  @media (min-width: 769px) {
    .sidebar {
      transform: translateX(0);
    }
  }
  
  /* Móvil: oculto por defecto */
  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
      padding-top: 4rem; /* espacio debajo del header */
    }
    .sidebar.open {
      transform: translateX(0);
    }
  }
  
  /* === Botón hamburguesa === */
  .menu-btn {
    width: 30px;
    height: 22px;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    z-index: 20;
  }
  
  .menu-btn span {
    height: 3px;
    width: 100%;
    background: #ff6b6b;
    border-radius: 4px;
    transition: all 0.3s ease;
  }
  
  /* Animación al abrir */
  .menu-btn.open span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }
  .menu-btn.open span:nth-child(2) {
    opacity: 0;
  }
  .menu-btn.open span:nth-child(3) {
    transform: rotate(-45deg) translate(5px, -5px);
  }
  
  /* === Contenido === */
  .content {
    flex: 1;
    margin-left: 240px;
    padding: 2rem;
    transition: margin-left 0.3s ease;
    width: 100%;
  }
  
  @media (max-width: 768px) {
    .content {
      margin-left: 0;
      padding-top: 70px; /* espacio para el header móvil */
    }
  }
  
  /* === Sidebar links === */
  .logo {
    font-size: 1.3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-align: center;
    color: #ff6b6b;
  }
  
  .sidebar nav {
    display: flex;
    flex-direction: column;
  }
  
  .sidebar nav a {
    color: #94a3b8;
    text-decoration: none;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    transition: background 0.2s, color 0.2s;
  }
  
  .sidebar nav a:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #ff6b6b;
  }
  
  .sidebar nav a.router-link-active {
    background: rgba(255, 255, 255, 0.08);
    color: #ff6b6b;
  }
  </style>
  