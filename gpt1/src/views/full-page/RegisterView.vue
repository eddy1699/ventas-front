<template>
    <div class="register-page">
      <h2>Registrar nuevo usuario</h2>
  
      <form @submit.prevent="register">
        <input v-model="name" type="text" placeholder="Nombre completo" required />
        <input v-model="email" type="email" placeholder="Correo" required />
        <input v-model="password" type="password" placeholder="Contraseña" required />
        <input v-model.number="cliente_id" type="number" placeholder="ID del cliente" required />
  
        <button>Registrar</button>
      </form>
  
      <p class="link">
        ¿Ya tienes cuenta?
        <RouterLink to="/">Iniciar sesión</RouterLink>
      </p>
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue"
  import { useRouter } from "vue-router"
  import apiURL from '../../url.js'
const backendURL = apiURL;
  const router = useRouter()
  
  const name = ref("")
  const email = ref("")
  const password = ref("")
  const cliente_id = ref("")
  
  async function register() {
    const res = await fetch(`${backendURL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
        cliente_id: cliente_id.value
      })
    })
  
    const data = await res.json()
    if (data.message) {
      alert("✅ " + data.message)
      router.push("/")
    } else {
      alert("⚠️ " + data.error)
    }
  }
  </script>
  
  <style scoped>
  .register-page {
    max-width: 340px;
    margin: 60px auto;
    padding: 1.5rem;
    background: #111a2b;
    border-radius: 12px;
    color: #fff;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    text-align: center;
  }
  
  h2 {
    margin-bottom: 1rem;
    color: #ff6b6b;
    font-weight: 600;
  }
  
  input {
    display: block;
    width: 100%;
    padding: 10px;
    margin-bottom: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
  
  button {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 8px;
    background: linear-gradient(90deg, #ff6b6b, #ff8a8a);
    color: #0f1724;
    font-weight: bold;
    cursor: pointer;
  }
  
  .link {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: #aaa;
  }
  
  a {
    color: #ff6b6b;
    text-decoration: none;
  }
  </style>
  