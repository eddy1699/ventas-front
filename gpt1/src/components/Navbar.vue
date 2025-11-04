  <template>
    <header class="mobile-header">
      <!-- Botón hamburguesa -->
      <button
        class="menu-btn"
        :class="{ open: isOpen }"
        @click="onToggleClick"
        aria-label="Toggle menu"
      >
        <svg
          class="icon-layer burger"
          viewBox="0 0 24 24"
          width="28"
          height="28"
          stroke="#ff6b6b"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>

        <svg
          class="icon-layer close"
          viewBox="0 0 24 24"
          width="28"
          height="28"
          stroke="#ff6b6b"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      </button>

      <!-- Marca -->
      <h1 class="brand">{{companyName}}</h1>

      <!-- Sección derecha -->
      <div class="user-section">
        <span class="user-name">{{ userName }}</span>

        <!-- <button class="icon-btn" @click="openSettings" title="Ajustes">
          ⚙️
        </button> -->

        <button class=" logout" @click="logout" title="Cerrar sesión">
          Cerrar Sesión
        </button>
      </div>
    </header>
  </template>

  <script setup>
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";

  const companyName = ref(null);
  const userName = ref(localStorage.getItem("username") || "Usuario");
  onMounted(() => {
    companyName.value = localStorage.getItem("company_name");
  });
  const props = defineProps({
    toggleSidebar: {
      type: Function,
      required: true
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  });

  const router = useRouter();


  const onToggleClick = () => {
    console.log("🔁 Click hamburguesa");
    props.toggleSidebar();
  };

  const openSettings = () => {
    router.push("/ajustes");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cliente_id");
    localStorage.removeItem("user_name");
    window.location.href = "/";
  };
  </script>

  <style scoped>
  .mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    background: #111a2b;
    padding: 0 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
    z-index: 15;
    position: relative;
  }

  .brand {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.5px;
  }

  /* Usuario */
  .user-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .user-name {
    font-size: 0.95rem;
    color: #fff;
    font-weight: 500;
    white-space: nowrap;
  }
  .icon-btn {
    background: transparent;
    border: none;
    color: #ff6b6b;
    cursor: pointer;
    font-size: 1.2rem;
    transition: transform 0.2s ease;
  }
  .icon-btn:hover {
    transform: scale(1.15);
  }
  .logout {
    color: #f87171;
  }

  /* Botón hamburguesa */
  .menu-btn {
    position: relative;
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    z-index: 20;
  }
  .icon-layer {
    position: absolute;
    top: 0;
    left: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  .icon-layer.burger {
    opacity: 1;
    transform: scale(1);
  }
  .icon-layer.close {
    opacity: 0;
    transform: scale(0.5) rotate(-15deg);
  }
  .menu-btn.open .icon-layer.burger {
    opacity: 0;
    transform: scale(0.5) rotate(15deg);
  }
  .menu-btn.open .icon-layer.close {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .user-section {
      display: none;
    }
    .brand {
      font-size: 0.9rem;
    }
  }

  @media (min-width: 769px) {
    .menu-btn {
      visibility: hidden;
      width: 0;
    }
  }
  </style>
