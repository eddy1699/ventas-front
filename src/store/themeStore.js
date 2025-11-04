import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    darkMode: localStorage.getItem("darkMode") === "true" || false,
  }),
  actions: {
    toggle() {
      this.darkMode = !this.darkMode;
      document.documentElement.classList.toggle("dark", this.darkMode);
      localStorage.setItem("darkMode", this.darkMode);
    },
    init() {
      if (this.darkMode) {
        document.documentElement.classList.add("dark");
      }
    },
  },
});

