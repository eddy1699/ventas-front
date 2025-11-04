<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import apiURL from '../../url.js'
const backendURL = apiURL;
const router = useRouter()
const email = ref("")
const password = ref("")
const step = ref("login") // "login" | "code"
const code = ref("")
const isLoading = ref(false)
async function doLogin() {
  isLoading.value = true
  const res = await fetch(`${backendURL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });
  isLoading.value = false
  const data = await res.json();
  if (data.step === "verify_code") {
    step.value = "code";
    // aseguramos que el email se mantenga para el segundo paso
    email.value = data.email;
  } else {
    alert(data.error || "Error en login");
  }
}

async function verifyCode() {
  isLoading.value = true
  const res = await fetch(`${backendURL}/api/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      code: code.value
    })
  });
  isLoading.value = false
  const data = await res.json();
  console.log("DESPUES DE LA VALIDACION",data)
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("cliente_id", data.user.cliente_id);
    localStorage.setItem("company_name", data.user.company_name);
    localStorage.setItem("company_id", data.user.company_id);
    localStorage.setItem("username", data.user.name);
    // alert("✅ Login correcto");
    window.location.href = "/dashboard";
    // router.push("/dashboard");
  } else {
    alert(data.error || "Código inválido");
  }
}
</script>

<template>
  <Loader :visible="loading" />
  <div class="login-card">
    
    <h2>Sistema de Ventas</h2>

    <form v-if="step === 'login'" @submit.prevent="doLogin">
      <input v-model="email" type="email" placeholder="Correo" required />
      <input v-model="password" type="password" placeholder="Contraseña" required />
      <button :disabled="isLoading" type="submit"> {{ isLoading ? "Cargando..." : "Ingresar" }}</button>
    </form>

    <form v-else @submit.prevent="verifyCode">
      <p>Hemos enviado un código a tu correo.</p>
      <input v-model="code" type="text" placeholder="Código de 4 dígitos" maxlength="4" required />
      <button :disabled="isLoading" type="submit">{{ isLoading ? "Cargando..." : "Verificar Código" }}</button>
    </form>
  </div>
</template>

<style scoped>
.login-card {
  max-width: 320px;
  margin: 80px auto;
  background: #111a2b;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 1.5rem;
  color: #fff;
  font-family: system-ui, sans-serif;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
}
h2 {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #ff6b6b;
  font-weight: 600;
}
input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  color: #fff;
  font-size: 14px;
}
button {
  width: 100%;
  background: linear-gradient(90deg,#ff6b6b,#ff8a8a);
  color: #0f1724;
  border: 0;
  border-radius: 8px;
  font-weight: 600;
  padding: 10px 12px;
  cursor: pointer;
}
p {
  color: #94a3b8;
  font-size: 14px;
  margin-bottom: 8px;
}
</style>