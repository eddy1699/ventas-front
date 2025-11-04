import { defineStore } from "pinia";
import api from "../api/axios"; // tu axios preconfigurado

export const useUserStore = defineStore("userStore", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
  }),

  actions: {
    async login(email, password) {
      const res = await api.post("/auth/login", { email, password });
      this.user = res.data.user;
      this.token = res.data.token;

      // Guarda token localmente
      localStorage.setItem("token", this.token);
      localStorage.setItem("user", JSON.stringify(this.user));

      // Configura el header Authorization
      api.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;

      return res.data;
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
    },
  },
});
