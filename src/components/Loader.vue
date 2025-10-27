<template>
    <div v-if="visible" class="loader-overlay">
      <div class="spinner"></div>
      <p class="loader-text">Cargando...</p>
    </div>
  </template>
  
  <script setup>
  defineProps({
    visible: {
      type: Boolean,
      default: false
    }
  })
  </script>
  
  <style scoped>
  .loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 36, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    color: #fff;
  }
  
  /* Spinner */
  .spinner {
    width: 60px;
    height: 60px;
    border: 6px solid rgba(255, 255, 255, 0.2);
    border-top-color: #ff6b6b;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .loader-text {
    margin-top: 1rem;
    font-size: 1.1rem;
    color: #ff6b6b;
    letter-spacing: 0.5px;
  }
  </style>
    